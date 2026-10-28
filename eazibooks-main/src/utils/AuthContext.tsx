import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from './supabase/client';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          // Quick timeout for profile fetch during auth state changes
          const profileTimeout = new Promise<any>((_, reject) => 
            setTimeout(() => reject(new Error('profile-timeout')), 3000)
          );
          
          const profilePromise = supabase
            .from('profiles')
            .select('full_name')
            .eq('id', session.user.id)
            .single();

          const result = await Promise.race([profilePromise, profileTimeout]);
          const profile = result?.data;

          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: profile?.full_name || session.user.email?.split('@')[0] || 'User'
          });
        } catch (error: any) {
          // Profile not found or timeout - use basic info (silently)
          // This is expected when database isn't set up
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.email?.split('@')[0] || 'User'
          });
        }
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      // Set timeout to prevent infinite loading (8 seconds for quick response)
      const timeoutPromise = new Promise<any>((_, reject) => 
        setTimeout(() => reject(new Error('timeout')), 8000)
      );

      const sessionPromise = supabase.auth.getSession();
      
      let session;
      try {
        const result = await Promise.race([sessionPromise, timeoutPromise]);
        session = result?.data?.session;
      } catch (timeoutError: any) {
        if (timeoutError.message === 'timeout') {
          // Timeout is expected if database isn't set up or connection is slow
          // Just continue without a session - no need to warn user
          setUser(null);
          setIsLoading(false);
          return;
        }
        throw timeoutError;
      }
      
      if (session?.user) {
        try {
          // Try to fetch profile with shorter timeout
          const profileTimeout = new Promise<any>((_, reject) => 
            setTimeout(() => reject(new Error('profile-timeout')), 3000)
          );
          
          const profilePromise = supabase
            .from('profiles')
            .select('full_name')
            .eq('id', session.user.id)
            .single();

          const result = await Promise.race([profilePromise, profileTimeout]);
          const profile = result?.data;

          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: profile?.full_name || session.user.email?.split('@')[0] || 'User'
          });
        } catch (profileError: any) {
          // If profile fetch fails or times out, still set user with basic info
          // This is expected when database tables don't exist yet - silently handle
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.email?.split('@')[0] || 'User'
          });
        }
      } else {
        setUser(null);
      }
    } catch (error: any) {
      // Silently handle expected errors, only log truly unexpected ones
      if (error.message !== 'timeout' && process.env.NODE_ENV === 'development') {
        console.error('Unexpected error checking session:', error);
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name
        }
      }
    });

    if (error) {
      throw new Error(error.message || 'Signup failed');
    }

    if (data.user) {
      // The database trigger will automatically create company and profile
      // But we'll also try to create it here as a fallback
      try {
        // Check if profile already exists (from trigger)
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id, company_id')
          .eq('id', data.user.id)
          .single();

        if (!existingProfile) {
          // Profile doesn't exist, create it with a new company
          // First create company
          const { data: company, error: companyError } = await supabase
            .from('companies')
            .insert({
              name: `${name}'s Company`,
              email: email,
              currency: 'NGN'
            })
            .select()
            .single();

          if (!companyError && company) {
            // Then create profile with company_id
            await supabase.from('profiles').insert({
              id: data.user.id,
              email: data.user.email,
              full_name: name,
              company_id: company.id,
              role: 'admin'
            });
          }
        } else if (!existingProfile.company_id) {
          // Profile exists but no company_id, create company and link it
          const { data: company, error: companyError } = await supabase
            .from('companies')
            .insert({
              name: `${name}'s Company`,
              email: email,
              currency: 'NGN'
            })
            .select()
            .single();

          if (!companyError && company) {
            await supabase.from('profiles').update({
              company_id: company.id
            }).eq('id', data.user.id);
          }
        }
      } catch (profileError) {
        // Silently handle - the trigger should have created it
        console.log('Profile setup handled by database trigger or already exists');
      }

      setUser({
        id: data.user.id,
        email: data.user.email || '',
        name: name
      });
    }
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw new Error(error.message || 'Login failed');
    }

    if (data.user) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', data.user.id)
          .single();

        setUser({
          id: data.user.id,
          email: data.user.email || '',
          name: profile?.full_name || data.user.email?.split('@')[0] || 'User'
        });
      } catch (profileError) {
        // Silently handle - use basic user info
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.email?.split('@')[0] || 'User'
        });
      }
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
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