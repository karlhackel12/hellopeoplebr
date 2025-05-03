import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Check, Gift } from 'lucide-react';
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
              Plataforma Gratuita
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6">
              O HelloPeople está disponível gratuitamente para todos os professores e alunos
            </p>
            <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden p-6 max-w-2xl mx-auto">
              <h3 className="text-xl font-bold mb-4">Acesso Completo e Gratuito</h3>
              <ul className="space-y-3 text-left mb-6">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5 mr-3" />
                  <span>Todos os recursos disponíveis para professores</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5 mr-3" />
                  <span>Sem limites de alunos por professor</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5 mr-3" />
                  <span>Geração de conteúdo com IA</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5 mr-3" />
                  <span>Ferramentas de acompanhamento de progresso</span>
                </li>
              </ul>
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Comece Agora Gratuitamente
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </FormProvider>
  );
};

export default Pricing;
