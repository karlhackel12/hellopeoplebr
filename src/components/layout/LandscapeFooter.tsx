
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface LandscapeFooterProps {
  className?: string;
}

const LandscapeFooter: React.FC<LandscapeFooterProps> = ({ className }) => {
  const isMobile = useIsMobile();
  
  return (
    <footer className={`w-full relative ${className}`}>
      <div className="w-full relative">
        <img 
          src="/lovable-uploads/a1e35609-ee80-4df4-812b-fa009b5fc788.png" 
          alt="Footer with green hills and orange flowers"
          className="w-full h-auto object-cover" 
        />
        <div className="absolute bottom-0 left-0 w-full p-3 md:p-4 text-foreground bg-background/90">
          <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
            <div>
              <p className="text-xs md:text-sm opacity-90">
                &copy; {new Date().getFullYear()} HelloPeople Brazil. All rights reserved.
              </p>
            </div>
            <div className="mt-2 md:mt-0">
              <div className="flex space-x-3 md:space-x-6">
                <a href="/termos" className="text-xs hover:text-primary transition-colors">
                  Terms of Use
                </a>
                <a href="/privacidade" className="text-xs hover:text-primary transition-colors">
                  Privacy Policy
                </a>
                <a href="/contato" className="text-xs hover:text-primary transition-colors">
                  Contact
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandscapeFooter;
