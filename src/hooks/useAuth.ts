import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Set timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.log('Auth initialization timeout - setting loading to false');
            setLoading(false);
          }
        }, 10000); // Increased to 10 seconds

        // Check if Supabase is configured
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
          console.log('Supabase not configured - showing login');
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        // Get initial session with timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 10000)
        );

        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise.catch(() => ({ data: { session: null }, error: new Error('Session timeout') }))
        ]) as any;

        if (!mounted) return;

        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        console.log('Got session:', session?.user?.id || 'no session');

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await handleUserProfile(session.user);
        } else {
          setProfile(null);
        }

        setLoading(false);
        clearTimeout(timeoutId);

      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const handleUserProfile = async (user: User) => {
      try {
        console.log('Handling profile for user:', user.id);
        
        // Try to get existing profile with timeout
        const profilePromise = supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
        );

        const { data: existingProfile, error: fetchError } = await Promise.race([
          profilePromise,
          timeoutPromise
        ]) as any;

        if (fetchError && !fetchError.message?.includes('timeout')) {
          console.error('Error fetching profile:', fetchError);
        }

        if (existingProfile) {
          console.log('Profile found:', existingProfile.full_name);
          setProfile(existingProfile);
          return;
        }

        // Create profile if it doesn't exist
        console.log('Creating new profile...');
        const newProfile = {
          user_id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          role: 'student' as const,
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          // Set a default profile to allow app to continue
          setProfile({
            id: user.id,
            user_id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            role: 'student',
            avatar_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        } else {
          console.log('Profile created:', createdProfile.full_name);
          setProfile(createdProfile);
        }
      } catch (error) {
        console.error('Error handling profile:', error);
        // Set a fallback profile to allow app to continue
        setProfile({
          id: user.id,
          user_id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          role: 'student',
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('Auth state changed:', event, session?.user?.id || 'no session');
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await handleUserProfile(session.user);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: 'student' | 'teacher' = 'student') => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          }
        }
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (!error) {
        setUser(null);
        setProfile(null);
        setSession(null);
      }
      return { error };
    } catch (error) {
      return { error };
    }
  };

  return {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };
};