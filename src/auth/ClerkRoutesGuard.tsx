
import { useAuth } from "@clerk/clerk-react";
import { Navigate, useLocation, Outlet } from "react-router-dom";

export const ClerkRoutesGuard = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const location = useLocation();
  
  if (!isLoaded) {
    return <div>Loading...</div>;
  }
  
  if (!isSignedIn) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }
  
  return <Outlet />;
};
