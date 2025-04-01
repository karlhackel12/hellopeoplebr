
import React from 'react';
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

const Index: React.FC = () => {
  // Create a default form context that can be used for any form components
  // that might be rendered without their own form context
  const methods = useForm();
  
  return (
    <FormProvider {...methods}>
      <MainLayout>
        <Hero />
        <Benefits />
        <Features />
        <HowItWorks />
        <Pricing />
        <Testimonials />
        <Faq />
        <CtaSection />
      </MainLayout>
    </FormProvider>
  );
};

export default Index;
