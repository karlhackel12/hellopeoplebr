
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Check, Users } from 'lucide-react';

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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Basic Plan */}
          <div className="bg-white rounded-xl shadow-md border border-border overflow-hidden transform transition-transform hover:scale-105">
            <div className="p-8">
              <h3 className="text-2xl font-bold font-display mb-4">Iniciante</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-[#1E88E5]">R$29,90</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#26A69A] shrink-0 mt-0.5" />
                  <span>Acesso a todas as ferramentas</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#26A69A] shrink-0 mt-0.5" />
                  <span>Geração ilimitada de lições</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#26A69A] shrink-0 mt-0.5" />
                  <span>Dashboard de alunos</span>
                </li>
                <li className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-[#26A69A] shrink-0 mt-0.5" />
                  <span className="font-bold">Até 10 alunos</span>
                </li>
              </ul>
              <Link to="/register">
                <Button className="w-full bg-[#1E88E5] hover:bg-[#1E88E5]/90 text-lg py-6">
                  Comece Agora
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Standard Plan */}
          <div className="relative bg-white rounded-xl shadow-lg border-2 border-[#1E88E5] overflow-hidden transform transition-transform hover:scale-105">
            <div className="absolute top-0 right-0">
              <div className="bg-[#1E88E5] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                POPULAR
              </div>
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-bold font-display mb-4">Profissional</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-[#1E88E5]">R$49,90</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#26A69A] shrink-0 mt-0.5" />
                  <span>Acesso a todas as ferramentas</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#26A69A] shrink-0 mt-0.5" />
                  <span>Geração ilimitada de lições</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#26A69A] shrink-0 mt-0.5" />
                  <span>Dashboard avançado</span>
                </li>
                <li className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-[#26A69A] shrink-0 mt-0.5" />
                  <span className="font-bold">Até 20 alunos</span>
                </li>
              </ul>
              <Link to="/register">
                <Button className="w-full bg-[#36B37E] hover:bg-[#36B37E]/90 text-lg py-6">
                  Escolher Plano
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Premium Plan */}
          <div className="bg-white rounded-xl shadow-md border border-border overflow-hidden transform transition-transform hover:scale-105">
            <div className="p-8">
              <h3 className="text-2xl font-bold font-display mb-4">Avançado</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-[#1E88E5]">R$69,90</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#26A69A] shrink-0 mt-0.5" />
                  <span>Acesso a todas as ferramentas</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#26A69A] shrink-0 mt-0.5" />
                  <span>Geração ilimitada de lições</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#26A69A] shrink-0 mt-0.5" />
                  <span>Suporte premium</span>
                </li>
                <li className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-[#26A69A] shrink-0 mt-0.5" />
                  <span className="font-bold">Alunos ilimitados</span>
                </li>
              </ul>
              <Link to="/register">
                <Button className="w-full bg-[#1E88E5] hover:bg-[#1E88E5]/90 text-lg py-6">
                  Escolher Plano
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
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
