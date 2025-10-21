import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import Footer from '@/components/Footer';
import Discussions from './Discussions';

export default function Index() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        setLoading(false);
        return;
      }
      
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Fetch user profile with error handling
        supabase
          .from('profiles')
          .select('username, role, region')
          .eq('id', session.user.id)
          .maybeSingle()
          .then(({ data: profile, error: profileError }) => {
            if (profileError) {
              console.error('Error fetching user profile:', profileError);
              // Continue without profile data
            }
            setUserProfile(profile);
            setLoading(false);
          })
          .catch((error) => {
            console.error('Unexpected error fetching profile:', error);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    }).catch((error) => {
      console.error('Unexpected error getting session:', error);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('username, role, region')
              .eq('id', session.user.id)
              .maybeSingle();
            
            if (profileError) {
              console.error('Error fetching user profile in auth change:', profileError);
              // Continue without profile data
            }
            
            setUserProfile(profile);
          } catch (error) {
            console.error('Unexpected error fetching profile in auth change:', error);
            setUserProfile(null);
          }
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

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

  // Show discussions feed for logged-in users
  if (user && userProfile) {
    return <Discussions userRole={userProfile.role} />;
  }

  // Show landing page for non-logged-in users
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <Footer />
    </div>
  );
}
