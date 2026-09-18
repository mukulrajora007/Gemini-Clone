import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSupabase, getSupabaseCredentials } from '../supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);
  const [guestMode, setGuestMode] = useState(true);

  // Initialize and check current auth state
  const initAuth = useCallback(async () => {
    setLoading(true);
    const { isConfigured: configured } = getSupabaseCredentials();
    setIsConfigured(configured);

    if (!configured) {
      setUser(null);
      setSession(null);
      setGuestMode(true);
      setLoading(false);
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      setIsConfigured(false);
      setLoading(false);
      return;
    }

    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user || null);
      setGuestMode(!currentSession?.user);
    } catch (err) {
      console.warn('Error fetching Supabase session:', err);
      setUser(null);
      setSession(null);
      setGuestMode(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();

    const supabase = getSupabase();
    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user || null);
      setGuestMode(!currentSession?.user);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [initAuth]);

  // Sign Up with Email and Password
  const signUp = async (email, password) => {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please add your Supabase URL & Anon Key in Settings.');
    }
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  };

  // Sign In with Email and Password
  const signIn = async (email, password) => {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please add your Supabase URL & Anon Key in Settings.');
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  // Sign Out
  const signOut = async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setGuestMode(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isConfigured,
        guestMode,
        signUp,
        signIn,
        signOut,
        recheckAuth: initAuth,
      }}
    >
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
