'use client';
import { useState, useEffect } from 'react';
import { User } from '@/lib/types';
import { auth } from '@/lib/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = auth.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const result = await auth.login(username, password);
    if (result.user) {
      setUser(result.user);
    }
    return result;
  };

  const logout = () => {
    auth.logout();
    setUser(null);
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };
};
