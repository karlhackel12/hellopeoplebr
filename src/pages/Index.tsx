
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Our routing logic to determine where to send the user
    const routeUser = () => {
      // Parse URL parameters
      const searchParams = new URLSearchParams(location.search);
      
      // 1. Check UTM parameters
      const userType = searchParams.get('utm_user_type');
      if (userType === 'teacher') {
        localStorage.setItem('user_type', 'teacher');
        navigate('/teachers');
        return;
      }
      if (userType === 'student') {
        localStorage.setItem('user_type', 'student');
        navigate('/students');
        return;
      }
      
      // 2. Check referral code type
      const referralCode = searchParams.get('ref');
      if (referralCode) {
        // If there's a referral code, we assume it's for a student
        // In a real implementation, you might want to verify the code type
        navigate(`/students?ref=${referralCode}`);
        return;
      }
      
      // 3. Check local storage for returning visitors
      const savedUserType = localStorage.getItem('user_type');
      if (savedUserType === 'teacher') {
        navigate('/teachers');
        return;
      }
      if (savedUserType === 'student') {
        navigate('/students');
        return;
      }
      
      // 4. Default to teacher landing page
      navigate('/teachers');
    };
    
    routeUser();
  }, [navigate, location]);
  
  // This is just a loading state while the routing happens
  return (
    <>
      <Helmet>
        <title>HelloPeople - Redirecting...</title>
      </Helmet>
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <h1 className="text-2xl font-semibold mb-4">Redirecting you to the right place...</h1>
          <div className="w-16 h-16 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    </>
  );
};

export default Index;
