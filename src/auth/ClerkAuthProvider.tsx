
import { ClerkProvider } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

interface ClerkAuthProviderProps {
  children: React.ReactNode;
}

export const ClerkAuthProvider = ({ children }: ClerkAuthProviderProps) => {
  const navigate = useNavigate();
  
  const publishableKey = "pk_test_c3Ryb25nLXByaW1hdGUtMTUuY2xlcmsuYWNjb3VudHMuZGV2JA";
  
  if (!publishableKey) {
    throw new Error("Missing Clerk Publishable Key");
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
      appearance={{
        layout: {
          socialButtonsPlacement: "bottom",
          socialButtonsVariant: "blockButton",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
};
