
import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export enum UserType {
  TEACHER = 'teacher',
  STUDENT = 'student',
}

interface RouterOptions {
  defaultUserType?: UserType;
  saveToLocalStorage?: boolean;
}

/**
 * Hook for handling user type routing logic with improved mobile support
 */
export function useUserTypeRouter(options: RouterOptions = {}) {
  const {
    defaultUserType = UserType.TEACHER,
    saveToLocalStorage = true,
  } = options;
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine the user type from various sources
  const determineUserType = useCallback((): UserType => {
    const searchParams = new URLSearchParams(location.search);
    
    // 1. Check UTM parameters
    const utmUserType = searchParams.get('utm_user_type');
    if (utmUserType === 'teacher') return UserType.TEACHER;
    if (utmUserType === 'student') return UserType.STUDENT;
    
    // 2. Check referral code - if there's a referral code, assume it's for a student
    const referralCode = searchParams.get('ref');
    if (referralCode) return UserType.STUDENT;
    
    // 3. Check local storage for returning visitors
    if (typeof window !== 'undefined') {
      const savedUserType = localStorage.getItem('user_type');
      if (savedUserType === 'teacher') return UserType.TEACHER;
      if (savedUserType === 'student') return UserType.STUDENT;
    }
    
    // 4. Default
    return defaultUserType;
  }, [location.search, defaultUserType]);
  
  // Set user type in local storage
  const setUserType = useCallback((type: UserType) => {
    if (saveToLocalStorage && typeof window !== 'undefined') {
      localStorage.setItem('user_type', type);
    }
  }, [saveToLocalStorage]);
  
  // Get the current user type
  const getUserType = useCallback((): UserType => {
    return determineUserType();
  }, [determineUserType]);
  
  // Navigate to the appropriate landing page
  const navigateToUserLanding = useCallback((type: UserType = determineUserType()) => {
    setUserType(type);
    
    // Check if there's a referral code to preserve
    const searchParams = new URLSearchParams(location.search);
    const referralCode = searchParams.get('ref');
    
    if (type === UserType.STUDENT && referralCode) {
      navigate(`/${type}s?ref=${referralCode}`);
    } else {
      navigate(`/${type}s`);
    }
  }, [determineUserType, location.search, navigate, setUserType]);
  
  return {
    getUserType,
    setUserType,
    navigateToUserLanding,
  };
}
