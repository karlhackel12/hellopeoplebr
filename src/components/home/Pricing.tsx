
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Check, Gift } from 'lucide-react';
import PricingPlans from './PricingPlans';
import { FormProvider, useForm } from 'react-hook-form';

const Pricing: React.FC = () => {
  // Create a form context for any form elements in the pricing section
  const methods = useForm();

  return (
    <FormProvider {...methods}>
      <section id="precos" className="py-12 sm:py-16 md:py-20 lg:py-28 bg-[#F5F7FA]">
        <div className="container px-4 sm:px-6 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 font-display">
              Planos Simples para Professores
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
              Escolha o plano ideal para o tamanho da sua turma
            </p>
          </div>
          
          <PricingPlans />
        </div>
      </section>
    </FormProvider>
  );
};

export default Pricing;
