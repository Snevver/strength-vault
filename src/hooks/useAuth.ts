import { useState, useEffect } from 'react';

interface User {
  id: string;
  email?: string;
}

interface Session {
  access_token: string;
  refresh_token: string;
  user: User;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock auth system for now - will be replaced with real Supabase auth
  const signUp = async (email: string, password: string) => {
    const mockUser = { id: '1', email };
    setUser(mockUser);
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const mockUser = { id: '1', email };
    setUser(mockUser);
    return { error: null };
  };

  const signOut = async () => {
    setUser(null);
    setSession(null);
    return { error: null };
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };
};