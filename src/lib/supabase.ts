
// This file re-exports the Supabase client from the integrations folder
import { supabase } from '@/integrations/supabase/client';

export { supabase };

// Helper function to check if the current user is a teacher
export const isTeacher = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('No authenticated user found');
      return false;
    }
    
    // Get the user's profile to check their role
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return false;
    }
    
    if (!profile) {
      console.log('No profile found for user');
      return false;
    }
    
    return profile.role === 'teacher';
  } catch (error) {
    console.error('Error checking teacher role:', error);
    return false;
  }
};

// Helper function to check if a profile needs update
export const checkProfileStatus = async (userId: string): Promise<{
  exists: boolean;
  needsUpdate: boolean;
}> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (error) {
      console.error('Error checking profile status:', error);
      return { exists: false, needsUpdate: true };
    }
    
    if (!data) {
      return { exists: false, needsUpdate: true };
    }
    
    // Check if profile needs update (missing essential info)
    const needsUpdate = !data.first_name || !data.last_name;
    
    return { exists: true, needsUpdate };
  } catch (error) {
    console.error('Error checking profile status:', error);
    return { exists: false, needsUpdate: true };
  }
};
