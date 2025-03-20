
import React from 'react';
import landscapeImg from './landscape-footer.jpg';
import { useIsMobile } from '@/hooks/use-mobile';

interface LandscapeFooterProps {
  className?: string;
}

const LandscapeFooter: React.FC<LandscapeFooterProps> = ({ className }) => {
  const isMobile = useIsMobile();
  
  return (
    <footer className={`w-full relative overflow-hidden ${className}`}>
      <div className="aspect-[3/1] md:aspect-[5/1] w-full relative">
        <img 
          src={landscapeImg} 
          alt="Landscape footer"
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 lg:p-8 text-white">
          <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
            <div>
              <p className="text-sm md:text-base opacity-90">
                &copy; {new Date().getFullYear()} HelloPeople Brazil. All rights reserved.
              </p>
            </div>
            <div className="mt-2 md:mt-0">
              <div className="flex space-x-4 md:space-x-6">
                <a href="/termos" className="text-xs md:text-sm hover:text-primary transition-colors">
                  Terms of Use
                </a>
                <a href="/privacidade" className="text-xs md:text-sm hover:text-primary transition-colors">
                  Privacy Policy
                </a>
                <a href="/contato" className="text-xs md:text-sm hover:text-primary transition-colors">
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
