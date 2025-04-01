
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Check, Gift } from 'lucide-react';
import PricingPlans from './PricingPlans';

const Pricing: React.FC = () => {
  return (
    <section id="precos" className="py-20 md:py-28 bg-[#F5F7FA]">
      <div className="container px-6 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-display">
            Planos Simples para Professores
          </h2>
          <p className="text-xl text-muted-foreground">
            Escolha o plano ideal para o tamanho da sua turma
          </p>
        </div>
        
        <PricingPlans />
        
        {/* Referral Program */}
        <div className="mt-16 max-w-4xl mx-auto bg-white rounded-xl shadow-md border border-border overflow-hidden">
          <div className="p-8">
            <h3 className="text-xl font-bold font-display mb-4 text-center">
              Programa de Indicação
            </h3>
            <p className="text-center text-muted-foreground mb-6">
              Indique outros professores e ganhe 15% de comissão sobre o valor da assinatura deles
            </p>
            <div className="bg-[#F5F7FA] p-6 rounded-lg">
              <h4 className="text-lg font-medium mb-2 text-center">Como funciona:</h4>
              <ol className="space-y-2 list-decimal pl-6">
                <li>Compartilhe seu código de indicação com outros professores</li>
                <li>Quando eles assinarem usando seu código, você recebe 15% do valor mensalmente</li>
                <li>Não há limite para o número de indicações</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
