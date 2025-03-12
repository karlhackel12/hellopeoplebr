
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

const Pricing: React.FC = () => {
  return (
    <section id="precos" className="py-20 md:py-28 bg-[#F5F7FA]">
      <div className="container px-6 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-display">
            Preços Simples e Transparentes
          </h2>
          <p className="text-xl text-muted-foreground">
            Zero risco para professores, benefícios para todos
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Teacher Plan */}
          <div className="relative bg-white rounded-xl shadow-lg border-2 border-[#1E88E5] overflow-hidden transform transition-transform hover:scale-105">
            <div className="absolute top-0 right-0">
              <div className="bg-[#1E88E5] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                RECOMENDADO
              </div>
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-bold font-display mb-4">Para Professores</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-[#1E88E5]">R$0</span>
                <span className="text-muted-foreground">/para sempre</span>
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
                  <Check className="h-5 w-5 text-[#26A69A] shrink-0 mt-0.5" />
                  <span className="font-bold">40% de comissão por aluno</span>
                </li>
              </ul>
              <Link to="/register">
                <Button className="w-full bg-[#36B37E] hover:bg-[#36B37E]/90 text-lg py-6">
                  Comece Gratuitamente
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Student Plan */}
          <div className="bg-white rounded-xl shadow-md border border-border overflow-hidden">
            <div className="p-8">
              <h3 className="text-2xl font-bold font-display mb-4">Para Alunos</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">R$39,90</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#26A69A] shrink-0 mt-0.5" />
                  <span>Material personalizado</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#26A69A] shrink-0 mt-0.5" />
                  <span>Sistema de repetição espaçada</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#26A69A] shrink-0 mt-0.5" />
                  <span>Feedback imediato</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#26A69A] shrink-0 mt-0.5" />
                  <span>Prática de pronúncia com IA</span>
                </li>
              </ul>
              <p className="text-sm text-muted-foreground italic text-center">
                *Convidados pelo professor
              </p>
            </div>
          </div>
        </div>
        
        {/* Commission Calculation */}
        <div className="mt-16 max-w-4xl mx-auto bg-white rounded-xl shadow-md border border-border overflow-hidden">
          <div className="p-8">
            <h3 className="text-xl font-bold font-display mb-4 text-center">
              Quanto você pode ganhar com comissões?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="text-center p-4 rounded-lg bg-[#F5F7FA]">
                <h4 className="text-lg font-medium mb-2">5 alunos</h4>
                <p className="text-2xl font-bold text-[#26A69A]">R$79,80</p>
                <p className="text-sm text-muted-foreground">por mês</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-[#F5F7FA] border-2 border-[#26A69A]">
                <h4 className="text-lg font-medium mb-2">10 alunos</h4>
                <p className="text-2xl font-bold text-[#26A69A]">R$159,60</p>
                <p className="text-sm text-muted-foreground">por mês</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-[#F5F7FA]">
                <h4 className="text-lg font-medium mb-2">20 alunos</h4>
                <p className="text-2xl font-bold text-[#26A69A]">R$319,20</p>
                <p className="text-sm text-muted-foreground">por mês</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
