
import { useUser, useAuth as useClerkAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAuth = () => {
  const { isLoaded, userId, user } = useUser();
  const { getToken } = useClerkAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    if (!isLoaded) return;
    
    const syncUserWithSupabase = async () => {
      try {
        if (userId && user) {
          // Get JWT token from Clerk
          const token = await getToken({ template: "supabase" });
          
          // Set the Supabase JWT
          if (token) {
            const { error: signInError } = await supabase.auth.signInWithJwt({
              token,
            });
            
            if (signInError) {
              console.error("Error syncing with Supabase:", signInError);
            }
          }
          
          // Update or create profile in Supabase
          const { error: upsertError } = await supabase
            .from("profiles")
            .upsert({
              id: userId,
              first_name: user.firstName,
              last_name: user.lastName,
              // We'll need to handle role assignment separately
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
  }, [isLoaded, userId, user, getToken]);
  
  return {
    isLoaded: isLoaded && isInitialized,
    isSignedIn: !!userId,
    userId,
    user,
  };
};
