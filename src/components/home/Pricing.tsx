
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
          
          {/* Referral Program */}
          <div className="mt-10 sm:mt-12 md:mt-16 max-w-4xl mx-auto bg-white rounded-xl shadow-md border border-border overflow-hidden">
            <div className="p-4 sm:p-6 md:p-8">
              <h3 className="text-lg sm:text-xl font-bold font-display mb-3 sm:mb-4 text-center">
                Programa de Indicação
              </h3>
              <p className="text-center text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                Indique outros professores e ganhe 15% de comissão sobre o valor da assinatura deles
              </p>
              <div className="bg-[#F5F7FA] p-4 sm:p-6 rounded-lg">
                <h4 className="text-base sm:text-lg font-medium mb-2 text-center">Como funciona:</h4>
                <ol className="space-y-1 sm:space-y-2 list-decimal pl-5 sm:pl-6 text-sm sm:text-base">
                  <li>Compartilhe seu código de indicação com outros professores</li>
                  <li>Quando eles assinarem usando seu código, você recebe 15% do valor mensalmente</li>
                  <li>Não há limite para o número de indicações</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>
    </FormProvider>
  );
};

export default Pricing;
