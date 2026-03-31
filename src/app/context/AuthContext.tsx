import React, { createContext, useContext, useState, ReactNode } from 'react';

type Role = 'Admin' | 'User';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  avatar_url?: string;
}

interface AuthContextType {
  user: User;
  toggleRole: () => void;
}

const defaultUser: User = {
  id: 'u-1',
  email: 'alex@example.com',
  full_name: 'Alex Designer',
  role: 'Admin',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(defaultUser);

  const toggleRole = () => {
    setUser((prev) => ({
      ...prev,
      role: prev.role === 'Admin' ? 'User' : 'Admin',
    }));
  };

  return (
    <AuthContext.Provider value={{ user, toggleRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
