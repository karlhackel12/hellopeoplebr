
import { useEffect } from 'react';
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
 * Hook for handling user type routing logic
 */
export function useUserTypeRouter(options: RouterOptions = {}) {
  const {
    defaultUserType = UserType.TEACHER,
    saveToLocalStorage = true,
  } = options;
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine the user type from various sources
  const determineUserType = (): UserType => {
    const searchParams = new URLSearchParams(location.search);
    
    // 1. Check UTM parameters
    const utmUserType = searchParams.get('utm_user_type');
    if (utmUserType === 'teacher') return UserType.TEACHER;
    if (utmUserType === 'student') return UserType.STUDENT;
    
    // 2. Check local storage for returning visitors
    const savedUserType = localStorage.getItem('user_type');
    if (savedUserType === 'teacher') return UserType.TEACHER;
    if (savedUserType === 'student') return UserType.STUDENT;
    
    // 3. Default
    return defaultUserType;
  };
  
  // Set user type in local storage
  const setUserType = (type: UserType) => {
    if (saveToLocalStorage) {
      localStorage.setItem('user_type', type);
    }
  };
  
  // Get the current user type
  const getUserType = (): UserType => {
    return determineUserType();
  };
  
  // Navigate to the appropriate landing page
  const navigateToUserLanding = (type: UserType = determineUserType()) => {
    setUserType(type);
    navigate(`/${type}s`);
  };
  
  return {
    getUserType,
    setUserType,
    navigateToUserLanding,
  };
}
