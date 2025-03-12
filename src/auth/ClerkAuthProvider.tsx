
import { ClerkProvider } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

interface ClerkAuthProviderProps {
  children: React.ReactNode;
}

export const ClerkAuthProvider = ({ children }: ClerkAuthProviderProps) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  const publishableKey = "YOUR_CLERK_PUBLISHABLE_KEY"; // This needs to be set by the user
  
  if (!publishableKey) {
    throw new Error("Missing Clerk Publishable Key");
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      navigate={(to) => navigate(to)}
      appearance={{
        baseTheme: theme === "dark" ? dark : undefined,
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
