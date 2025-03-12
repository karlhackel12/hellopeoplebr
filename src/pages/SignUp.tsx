import { SignUp as ClerkSignUp } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/ui/Logo";

const SignUp = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 md:px-12 lg:px-16 relative">
        <div className="absolute top-8 left-8">
          <Logo />
        </div>
        
        <div className="w-full max-w-md mx-auto mt-16 md:mt-0">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-3">Create your account</h1>
            <p className="text-muted-foreground">
              Join thousands of language learners achieving fluency faster
            </p>
          </div>
          
          <ClerkSignUp 
            routing="path" 
            path="/sign-up" 
            afterSignUpUrl="/dashboard"
            signInUrl="/sign-in"
          />
        </div>
      </div>
      
      {/* Right side - reuse existing design */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary/5 to-background relative">
        <div className="absolute inset-0 flex flex-col justify-center items-center p-12">
          <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-8 max-w-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-6">Start your fluency journey today</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">For Students</h3>
                <ul className="space-y-3">
                  <li>
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle-2 h-5 w-5 text-primary shrink-0 mt-0.5 mr-3"><path d="M2 12a10 10 0 1 1 20 0a10 10 0 0 1-20 0Z"/><path d="M22 12Zm-4.7 2.3-5.6-5.6 1.4-1.4 4.2 4.2 9.1-9.1 1.4 1.4Z"/></svg>
                      <span>Access to AI-powered conversation practice</span>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle-2 h-5 w-5 text-primary shrink-0 mt-0.5 mr-3"><path d="M2 12a10 10 0 1 1 20 0a10 10 0 0 1-20 0Z"/><path d="M22 12Zm-4.7 2.3-5.6-5.6 1.4-1.4 4.2 4.2 9.1-9.1 1.4 1.4Z"/></svg>
                    <span>Personalized learning path based on your goals</span>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle-2 h-5 w-5 text-primary shrink-0 mt-0.5 mr-3"><path d="M2 12a10 10 0 1 1 20 0a10 10 0 0 1-20 0Z"/><path d="M22 12Zm-4.7 2.3-5.6-5.6 1.4-1.4 4.2 4.2 9.1-9.1 1.4 1.4Z"/></svg>
                    <span>Progress tracking and performance insights</span>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle-2 h-5 w-5 text-primary shrink-0 mt-0.5 mr-3"><path d="M2 12a10 10 0 1 1 20 0a10 10 0 0 1-20 0Z"/><path d="M22 12Zm-4.7 2.3-5.6-5.6 1.4-1.4 4.2 4.2 9.1-9.1 1.4 1.4Z"/></svg>
                    <span>5 free lessons per week on the free plan</span>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">For Teachers</h3>
                <ul className="space-y-3">
                  <li>
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle-2 h-5 w-5 text-primary shrink-0 mt-0.5 mr-3"><path d="M2 12a10 10 0 1 1 20 0a10 10 0 0 1-20 0Z"/><path d="M22 12Zm-4.7 2.3-5.6-5.6 1.4-1.4 4.2 4.2 9.1-9.1 1.4 1.4Z"/></svg>
                    <span>Manage multiple student groups</span>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle-2 h-5 w-5 text-primary shrink-0 mt-0.5 mr-3"><path d="M2 12a10 10 0 1 1 20 0a10 10 0 0 1-20 0Z"/><path d="M22 12Zm-4.7 2.3-5.6-5.6 1.4-1.4 4.2 4.2 9.1-9.1 1.4 1.4Z"/></svg>
                    <span>Create custom learning materials</span>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle-2 h-5 w-5 text-primary shrink-0 mt-0.5 mr-3"><path d="M2 12a10 10 0 1 1 20 0a10 10 0 0 1-20 0Z"/><path d="M22 12Zm-4.7 2.3-5.6-5.6 1.4-1.4 4.2 4.2 9.1-9.1 1.4 1.4Z"/></svg>
                    <span>Track student progress and analytics</span>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle-2 h-5 w-5 text-primary shrink-0 mt-0.5 mr-3"><path d="M2 12a10 10 0 1 1 20 0a10 10 0 0 1-20 0Z"/><path d="M22 12Zm-4.7 2.3-5.6-5.6 1.4-1.4 4.2 4.2 9.1-9.1 1.4 1.4Z"/></svg>
                    <span>Schedule live conversation sessions</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="bg-primary/10 rounded-lg p-4 mt-6">
              <p className="text-sm">
                "Our AI technology adapts to your learning style and pace, providing a truly personalized experience that helps you learn up to 3x faster than traditional methods."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
