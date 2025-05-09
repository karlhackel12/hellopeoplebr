import React from 'react';
import { Clock, DollarSign, TrendingUp, Users } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
const forgettingCurveData = [{
  semana: 0,
  retencao: 100
}, {
  semana: 1,
  retencao: 60
}, {
  semana: 2,
  retencao: 37
}, {
  semana: 3,
  retencao: 22
}, {
  semana: 4,
  retencao: 13
}, {
  semana: 5,
  retencao: 8
}, {
  semana: 6,
  retencao: 5
}, {
  semana: 7,
  retencao: 3
}];
const Benefits: React.FC = () => {
  const benefits = [{
    icon: <Clock className="h-12 w-12 text-[#1E88E5]" />,
    title: "Economize Tempo",
    description: "Reduza 3-5 horas de preparação por semana com nosso gerador de lições e atividades com IA"
  }, {
    icon: <TrendingUp className="h-12 w-12 text-[#26A69A]" />,
    title: "Melhore Resultados",
    description: "Ajude seus alunos a progredirem 3x mais rápido entre as aulas com prática consistente e personalizada"
  }, {
    icon: <DollarSign className="h-12 w-12 text-[#FF8F00]" />,
    title: "Diversifique o Ensino",
    description: "Ofereça experiências de aprendizado variadas e personalizadas para diferentes estilos de aprendizagem"
  }, {
    icon: <Users className="h-12 w-12 text-[#9c27b0]" />,
    title: "Retenha mais Alunos",
    description: "Aumente o engajamento e retenção dos alunos através de atividades gamificadas e feedback constante"
  }];
  const chartConfig = {
    retencao: {
      label: "Retenção de Memória",
      color: "#FF5630"
    }
  };
  return <section id="beneficios" className="py-20 bg-[#F5F7FA] md:py-[50px]">
      <div className="container px-6 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-display">
            Benefícios para Professores
          </h2>
          <p className="text-xl text-muted-foreground">
            Nossa plataforma foi projetada para economizar seu tempo e melhorar os resultados dos seus alunos.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => <div key={index} className="relative bg-white border border-border/60 rounded-xl p-8 transition-all duration-300 hover:shadow-md group">
              <div className="relative">
                <div className="mb-5 flex justify-center">{benefit.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-center font-display">{benefit.title}</h3>
                <p className="text-muted-foreground text-center">{benefit.description}</p>
              </div>
            </div>)}
        </div>
        
        <div className="mt-16 max-w-4xl mx-auto bg-white border border-border/60 rounded-xl p-8 shadow-sm">
          <h3 className="text-2xl font-bold mb-4 text-center font-display">
            A Curva do Esquecimento
          </h3>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 px-[26px]">
            <div className="md:w-1/2">
              <p className="text-muted-foreground mb-6">
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
            <div className="md:w-1/2">
              
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default Benefits;