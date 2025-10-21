import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import Navbar from './Navbar';
import { DashboardLayout } from './DashboardLayout';

interface UserProfile {
  username: string;
  role: string;
  region: string;
}

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile with error handling
          setTimeout(async () => {
            try {
              const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('username, role, region')
                .eq('id', session.user.id)
                .maybeSingle();
              
              if (profileError) {
                console.error('Error fetching user profile in Layout:', profileError);
                // Continue without profile data - don't block the app
                setUserProfile(null);
              } else {
                setUserProfile(profile);
              }
            } catch (error) {
              console.error('Unexpected error fetching profile in Layout:', error);
              setUserProfile(null);
            }
          }, 0);
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session in Layout:', error);
        setLoading(false);
        return;
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        supabase
          .from('profiles')
          .select('username, role, region')
          .eq('id', session.user.id)
          .maybeSingle()
          .then(({ data: profile, error: profileError }) => {
            if (profileError) {
              console.error('Error fetching user profile in Layout initial load:', profileError);
              // Continue without profile data
            }
            setUserProfile(profile);
            setLoading(false);
          })
          .catch((error) => {
            console.error('Unexpected error fetching profile in Layout initial load:', error);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    }).catch((error) => {
      console.error('Unexpected error getting session in Layout:', error);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = () => {
    // Redirect to auth page for login
    window.location.href = '/auth';
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-civic-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show dashboard layout for logged-in users
  if (userProfile) {
    return (
      <DashboardLayout user={userProfile} onLogout={handleLogout}>
        {children}
      </DashboardLayout>
    );
  }

  // Show landing page layout for non-logged-in users
  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        user={userProfile} 
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default Layout;