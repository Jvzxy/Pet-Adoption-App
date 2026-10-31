import React, { createContext, useContext, useState } from 'react';

export interface User {
  username: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  signup: (username: string, password: string, name?: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<
    Array<{ username: string; password: string; name: string }>
  >([]);

  // Validates credentials against stored accounts
  const login = (username: string, password: string): boolean => {
    const matchedAccount = accounts.find(
      (acc) =>
        acc.username.toLowerCase() === username.trim().toLowerCase() &&
        acc.password === password
    );

    if (matchedAccount) {
      setUser({ username: matchedAccount.username, name: matchedAccount.name });
      return true;
    }
    return false;
  };

  // Saves a new user account dynamically in state without automatically logging them in
  const signup = (username: string, password: string, name?: string): boolean => {
    const exists = accounts.some(
      (acc) => acc.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (exists) {
      return false; // Account with this email/username already exists
    }

    const newAccount = {
      username: username.trim(),
      password,
      name: name || username.trim(),
    };

    setAccounts((prev) => [...prev, newAccount]);
    // Removed setUser(...) here so the user remains logged out until they use the login screen
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}