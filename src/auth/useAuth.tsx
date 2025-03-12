
import { useUser, useAuth as useClerkAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAuth = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useClerkAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    if (!isLoaded) return;
    
    const syncUserWithSupabase = async () => {
      try {
        if (isSignedIn && user) {
          // Get JWT token from Clerk
          const token = await getToken({ template: "supabase" });
          
          // Set the Supabase JWT
          if (token) {
            const { error: signInError } = await supabase.auth.signInWithPassword({
              email: user.primaryEmailAddress?.emailAddress || '',
              password: token.substring(0, 20), // Using a portion of the token as a password
            });
            
            if (signInError) {
              console.error("Error syncing with Supabase:", signInError);
            }
          }
          
          // Update or create profile in Supabase
          const { error: upsertError } = await supabase
            .from("profiles")
            .upsert({
              id: user.id,
              first_name: user.firstName || '',
              last_name: user.lastName || '',
              // We'll handle role assignment separately
            });
            
          if (upsertError) {
            console.error("Error updating profile:", upsertError);
          }
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error("Auth sync error:", error);
        setIsInitialized(true);
      }
    };
    
    syncUserWithSupabase();
  }, [isLoaded, isSignedIn, user, getToken]);
  
  return {
    isLoaded: isLoaded && isInitialized,
    isSignedIn,
    userId: user?.id,
    user,
  };
};
