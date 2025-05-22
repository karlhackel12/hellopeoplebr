import React, { useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Hero from '@/components/home/Hero';
import Benefits from '@/components/home/Benefits';
import Features from '@/components/home/Features';
import HowItWorks from '@/components/home/HowItWorks';
import Pricing from '@/components/home/Pricing';
import Testimonials from '@/components/home/Testimonials';
import Faq from '@/components/home/Faq';
import CtaSection from '@/components/home/CtaSection';
import { FormProvider, useForm } from 'react-hook-form';
import { BugsterTest } from '@/components/ui/BugsterTest';

const Index: React.FC = () => {
  const methods = useForm();
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Add smooth scrolling for anchor links
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (anchor && anchor.hash && anchor.hash.startsWith('#')) {
        e.preventDefault();
        const targetElement = document.querySelector(anchor.hash);
        
        if (targetElement) {
          // Add offset for fixed header
          const headerOffset = 80;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          
          // Update URL without causing page reload
          history.pushState(null, '', anchor.hash);
        }
      }
    };
    
    document.addEventListener('click', handleAnchorClick);
    
    return () => {
      document.removeEventListener('click', handleAnchorClick);
    };
  }, []);
  
  return (
    <FormProvider {...methods}>
      <MainLayout>
        <div className="w-full overflow-hidden">
          {isDevelopment && (
            <div className="container mx-auto py-4 mt-4">
              <BugsterTest />
            </div>
          )}
          <Hero />
          <Benefits />
          <Features />
          <HowItWorks />
          <Pricing />
          <Testimonials />
          <Faq />
          <CtaSection />
        </div>
      </MainLayout>
    </FormProvider>
  );
};

export default Index;
