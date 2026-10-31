import React, { createContext, useContext, useState } from 'react';

export interface User {
  username: string;
  name: string;
  role: 'user' | 'admin';
  address?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  signup: (username: string, password: string, name?: string) => boolean;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  
  // Initialize with a default admin account and an empty accounts array
  const [accounts, setAccounts] = useState<
    Array<{ 
      username: string; 
      password: string; 
      name: string; 
      role: 'user' | 'admin';
      address?: string;
      phone?: string;
    }>
  >([
    { 
      username: 'admin@pets.com', 
      password: 'adminpassword', 
      name: 'Admin', 
      role: 'admin' 
    }
  ]);

  const login = (username: string, password: string): boolean => {
    const matchedAccount = accounts.find(
      (acc) =>
        acc.username.toLowerCase() === username.trim().toLowerCase() &&
        acc.password === password
    );

    if (matchedAccount) {
      setUser({ 
        username: matchedAccount.username, 
        name: matchedAccount.name, 
        role: matchedAccount.role,
        address: matchedAccount.address,
        phone: matchedAccount.phone
      });
      return true;
    }
    return false;
  };

  const signup = (username: string, password: string, name?: string): boolean => {
    const exists = accounts.some(
      (acc) => acc.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (exists) return false; 

    const newAccount = {
      username: username.trim(),
      password,
      name: name || username.trim(),
      role: 'user' as const, 
    };

    setAccounts((prev) => [...prev, newAccount]);
    return true;
  };

  const updateProfile = (data: Partial<User>) => {
    if (!user) return;
    
    // Update active user session
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);

    // Update user in the accounts "database"
    setAccounts((prev) => 
      prev.map((acc) => 
        acc.username === user.username 
          ? { ...acc, ...data } 
          : acc
      )
    );
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateProfile }}>
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