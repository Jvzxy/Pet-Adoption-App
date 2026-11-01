import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';

export interface User {
  id: string;
  username: string;
  email: string;
  displayUsername?: string;
  name: string;
  role: 'user' | 'admin' | 'driver';
  address?: string;
  phone?: string;
  isAvailable?: boolean;
}

type SignupResult =
  | { status: 'signedIn' }
  | { status: 'confirmationRequired' }
  | { status: 'error'; reason: 'emailRateLimited' | 'alreadyExists' | 'other'; message: string };

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name?: string) => Promise<SignupResult>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  setDriverAvailability: (isAvailable: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function buildUser(authUser: SupabaseAuthUser, profile?: Record<string, unknown> | null): User {
  const email = authUser.email ?? '';
  const metadataName = authUser.user_metadata?.full_name;
  const name = typeof profile?.name === 'string' && profile.name.trim()
    ? profile.name.trim()
    : typeof metadataName === 'string' && metadataName.trim()
      ? metadataName.trim()
      : email.split('@')[0] || 'User';

  return {
    id: authUser.id,
    email,
    username: typeof profile?.username === 'string' && profile.username.trim()
      ? profile.username.trim()
      : email,
    ...(typeof profile?.display_username === 'string' && profile.display_username.trim()
      ? { displayUsername: profile.display_username.trim() }
      : {}),
    name,
    role: profile?.role === 'admin' || profile?.role === 'driver'
      ? profile.role
      : 'user',
    ...(typeof profile?.address === 'string' ? { address: profile.address } : {}),
    ...(typeof profile?.phone === 'string' ? { phone: profile.phone } : {}),
    ...(typeof profile?.is_available === 'boolean' ? { isAvailable: profile.is_available } : {}),
  };
}

async function loadUserProfile(authUser: SupabaseAuthUser): Promise<User> {
  const { data: idProfile, error: idError } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle();

  if (idError) {
    console.error('Could not load the Supabase user profile by Auth ID:', idError.message);
    throw idError;
  }

  if (idProfile) return buildUser(authUser, idProfile);

  if (authUser.email) {
    const { data: emailProfile, error: emailError } = await supabase
      .from('users')
      .select('*')
      .ilike('username', authUser.email.trim())
      .maybeSingle();

    if (emailError) {
      console.error('Could not load the Supabase profile by email:', emailError.message);
      throw emailError;
    }

    if (emailProfile) {
      console.warn('Loaded profile by email because its row ID does not match the Auth ID. Run supabase/schema.sql to repair the profile ID.');
      return buildUser(authUser, emailProfile);
    }
  }

  console.warn('No Supabase profile row matched this Auth ID or email. Run supabase/schema.sql to create or repair the profile.');
  return buildUser(authUser);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let sessionUpdateTimer: ReturnType<typeof setTimeout> | undefined;

    const applySession = async (sessionUser: SupabaseAuthUser | null) => {
      if (!sessionUser) {
        if (active) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      if (active) setLoading(true);
      try {
        const profile = await loadUserProfile(sessionUser);
        if (active) setUser(profile);
      } catch {
        if (active) setUser(buildUser(sessionUser));
      } finally {
        if (active) setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (sessionUpdateTimer) clearTimeout(sessionUpdateTimer);
      sessionUpdateTimer = setTimeout(() => {
        void applySession(session?.user ?? null);
      }, 0);
    });

    return () => {
      active = false;
      if (sessionUpdateTimer) clearTimeout(sessionUpdateTimer);
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error || !data.user) {
        console.error('Login Error:', error?.message ?? 'Supabase returned no authenticated user.');
        return false;
      }

      try {
        setUser(await loadUserProfile(data.user));
      } catch (profileError) {
        console.warn('Signed in, but the Supabase profile could not be loaded.', profileError);
        setUser(buildUser(data.user));
      }
      return true;
    } catch (error) {
      console.error('Login Error:', error);
      return false;
    }
  };

  const signup = async (
    email: string,
    password: string,
    name?: string
  ): Promise<SignupResult> => {
    try {
      const fullName = name?.trim() || email.trim();
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: fullName } },
      });

      if (error || !data.user) {
        const message = error?.message ?? 'Supabase did not return a user. Please try again.';
        console.warn('Supabase signup failed:', message);
        const normalizedMessage = message.toLowerCase();

        if (
          normalizedMessage.includes('security purposes') ||
          normalizedMessage.includes('email rate limit') ||
          normalizedMessage.includes('rate limit') ||
          normalizedMessage.includes('too many requests')
        ) {
          return {
            status: 'error',
            reason: 'emailRateLimited',
            message: 'Supabase has temporarily blocked sign-up emails for this project. Using a different email will not fix it. Configure custom SMTP in Supabase, or disable email confirmation in Authentication settings. Then restart Expo and try again.',
          };
        }

        if (
          normalizedMessage.includes('already registered') ||
          normalizedMessage.includes('already been registered') ||
          normalizedMessage.includes('user already exists')
        ) {
          return {
            status: 'error',
            reason: 'alreadyExists',
            message: 'This email may already have an account. Try logging in instead.',
          };
        }

        return { status: 'error', reason: 'other', message };
      }

      if (data.user.identities?.length === 0) {
        return {
          status: 'error',
          reason: 'alreadyExists',
          message: 'This email already has an account. Log in with it instead.',
        };
      }

      if (!data.session) return { status: 'confirmationRequired' };

      try {
        setUser(await loadUserProfile(data.user));
      } catch (error) {
        console.error('Could not load the new Supabase profile:', error);
        return {
          status: 'error',
          reason: 'other',
          message: 'The account was created, but its profile could not be loaded. Please try logging in.',
        };
      }
      return { status: 'signedIn' };
    } catch (error) {
      console.warn('Unexpected Supabase signup failure:', error);
      return {
        status: 'error',
        reason: 'other',
        message: error instanceof Error ? error.message : 'Sign-up failed. Please try again.',
      };
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<void> => {
    if (!user) throw new Error('You must be signed in to update your profile.');

    const changes: Record<string, string> = {};
    if (typeof data.displayUsername === 'string') changes.display_username = data.displayUsername.trim();
    if (typeof data.name === 'string') changes.name = data.name.trim();
    if (typeof data.address === 'string') changes.address = data.address.trim();
    if (typeof data.phone === 'string') changes.phone = data.phone.trim();

    const { data: updatedProfile, error } = await supabase
      .from('users')
      .update(changes)
      .eq('id', user.id)
      .select('id, username, display_username, name, role, address, phone, is_available')
      .single();

    if (error) {
      console.error('Profile Update Error:', error.message);
      throw error;
    }

    setUser({
      id: updatedProfile.id,
      email: user.email,
      username: updatedProfile.username || user.username,
      ...(updatedProfile.display_username
        ? { displayUsername: updatedProfile.display_username }
        : {}),
      name: updatedProfile.name || user.name,
      role: updatedProfile.role === 'admin' || updatedProfile.role === 'driver'
        ? updatedProfile.role
        : 'user',
      ...(updatedProfile.address ? { address: updatedProfile.address } : {}),
      ...(updatedProfile.phone ? { phone: updatedProfile.phone } : {}),
      ...(typeof updatedProfile.is_available === 'boolean'
        ? { isAvailable: updatedProfile.is_available }
        : {}),
    });
  };

  const setDriverAvailability = async (isAvailable: boolean): Promise<void> => {
    if (!user || user.role !== 'driver') {
      throw new Error('Only delivery drivers can update their availability.');
    }

    const { error } = await supabase.rpc('set_driver_availability', {
      p_is_available: isAvailable,
    });
    if (error) {
      console.error('Driver availability update failed:', error.message);
      throw error;
    }

    setUser({ ...user, isAvailable });
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateProfile, setDriverAvailability }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
