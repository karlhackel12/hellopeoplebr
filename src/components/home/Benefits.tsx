
import React from 'react';
import { Clock, DollarSign, TrendingUp } from 'lucide-react';

const Benefits: React.FC = () => {
  const benefits = [
    {
      icon: <Clock className="h-12 w-12 text-[#1E88E5]" />,
      title: "Economize Tempo",
      description: "Reduza 3-5 horas de preparação por semana com nosso gerador de lições com IA"
    },
    {
      icon: <DollarSign className="h-12 w-12 text-[#FF8F00]" />,
      title: "Aumente sua Renda",
      description: "Ganhe R$15,96 por aluno/mês com nosso modelo de comissão (40% do valor da assinatura)"
    },
    {
      icon: <TrendingUp className="h-12 w-12 text-[#26A69A]" />,
      title: "Melhore Resultados",
      description: "Sistema de repetição espaçada que aumenta a retenção dos alunos em até 50%"
    },
  ];

  return (
    <section id="beneficios" className="py-20 md:py-28 bg-[#F5F7FA]">
      <div className="container px-6 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-display">
            Benefícios para Professores
          </h2>
          <p className="text-xl text-muted-foreground">
            Nossa plataforma foi projetada para economizar seu tempo, aumentar sua renda e melhorar os resultados dos seus alunos.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 max-w-5xl mx-auto">
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className="relative bg-white border border-border/60 rounded-xl p-8 transition-all duration-300 hover:shadow-md group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="mb-5 flex justify-center">{benefit.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-center font-display">{benefit.title}</h3>
                <p className="text-muted-foreground text-center">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
