
import { useAuth } from "@clerk/clerk-react";
import { Navigate, useLocation } from "react-router-dom";

interface ClerkRoutesGuardProps {
  children: React.ReactNode;
}

export const ClerkRoutesGuard = ({ children }: ClerkRoutesGuardProps) => {
  const { userId, isLoaded } = useAuth();
  const location = useLocation();
  
  if (!isLoaded) {
    return <div>Loading...</div>;
  }
  
  if (!userId) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};
