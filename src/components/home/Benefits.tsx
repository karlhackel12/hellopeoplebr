
import React from 'react';
import { Clock, DollarSign, TrendingUp, Users } from 'lucide-react';

const Benefits: React.FC = () => {
  const benefits = [
    {
      icon: <Clock className="h-12 w-12 text-[#1E88E5]" />,
      title: "Economize Tempo",
      description: "Reduza 3-5 horas de preparação por semana com nosso gerador de lições e atividades com IA"
    },
    {
      icon: <TrendingUp className="h-12 w-12 text-[#26A69A]" />,
      title: "Melhore Resultados",
      description: "Ajude seus alunos a progredirem 3x mais rápido entre as aulas com prática consistente e personalizada"
    },
    {
      icon: <DollarSign className="h-12 w-12 text-[#FF8F00]" />,
      title: "Aumente sua Renda",
      description: "Ganhe R$15,96 por aluno/mês com nosso modelo de comissão (40% do valor da assinatura)"
    },
    {
      icon: <Users className="h-12 w-12 text-[#9c27b0]" />,
      title: "Retenha mais Alunos",
      description: "Aumente o engajamento e retenção dos alunos através de atividades gamificadas e feedback constante"
    }
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6 max-w-6xl mx-auto">
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
        
        <div className="mt-16 max-w-4xl mx-auto bg-white border border-border/60 rounded-xl p-8 shadow-sm">
          <h3 className="text-2xl font-bold mb-6 text-center font-display">
            A Curva do Esquecimento
          </h3>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:w-1/2">
              <p className="text-muted-foreground mb-4">
                Estudos mostram que 80% do que é aprendido é esquecido após uma semana sem prática consistente. Nossa plataforma combate isso com:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#26A69A] mt-1"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span><b>Repetição espaçada</b> cientificamente otimizada</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#26A69A] mt-1"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span><b>Microaprendizado diário</b> de 5-15 minutos</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#26A69A] mt-1"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span><b>Lembretes automatizados</b> via WhatsApp</span>
                </li>
              </ul>
            </div>
            <div className="md:w-1/2 bg-[#F5F7FA] p-4 rounded-lg">
              <div className="h-[200px] w-full relative">
                {/* Placeholder for forgetting curve graph - would be replaced with an actual chart in production */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#FF5630] via-[#FF8F00] to-[#36B37E]/70 rounded opacity-20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-center text-muted-foreground">Gráfico ilustrativo da curva do esquecimento vs. repetição espaçada</p>
                </div>
              </div>
              <div className="mt-4 flex justify-between text-sm text-muted-foreground">
                <div>Dia 1</div>
                <div>Dia 3</div>
                <div>Dia 7</div>
                <div>Dia 14</div>
                <div>Dia 30</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
