
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Brain, FileText, Repeat, Mic, Calendar, Trophy } from 'lucide-react';

const Features: React.FC = () => {
  const [activeTab, setActiveTab] = useState("pratica-diaria");
  
  const features = [{
    id: "pratica-diaria",
    icon: <Calendar className="h-6 w-6" />,
    title: "Prática Diária",
    heading: "Atividades Diárias de 5-15 Minutos",
    description: "Microaprendizado consistente que se encaixa perfeitamente na rotina dos alunos.",
    image: "/lovable-uploads/bb809ce4-1119-471d-8d3b-f1b0a8391ef8.png",
    points: ["Atividades curtas e focadas de 5-15 minutos por dia", "Lembretes automáticos via WhatsApp para manter o engajamento", "Sequências de prática e acompanhamento de progresso"]
  }, {
    id: "ia-personalizada",
    icon: <Brain className="h-6 w-6" />,
    title: "IA Personalizada",
    heading: "Conteúdo Adaptado com Inteligência Artificial",
    description: "Atividades geradas por IA com base no que foi ensinado em sala de aula.",
    image: "/lovable-uploads/bb809ce4-1119-471d-8d3b-f1b0a8391ef8.png",
    points: ["Material personalizado baseado no conteúdo das suas aulas", "Adaptação automática ao nível e progresso de cada aluno", "Sugestões de conteúdo para reforçar pontos fracos"]
  }, {
    id: "repeticao-espacada",
    icon: <Repeat className="h-6 w-6" />,
    title: "Repetição Espaçada",
    heading: "Sistema Científico de Memorização",
    description: "Algoritmo baseado em neurociência que otimiza a retenção de vocabulário e gramática.",
    image: "/lovable-uploads/bb809ce4-1119-471d-8d3b-f1b0a8391ef8.png",
    points: ["Revisão otimizada de vocabulário no momento ideal para memorização", "Aumenta a retenção de longo prazo em até 50%", "Adaptação automática baseada no desempenho individual"]
  }, {
    id: "pratica-pronuncia",
    icon: <Mic className="h-6 w-6" />,
    title: "Prática de Pronúncia",
    heading: "Feedback de Pronúncia com IA",
    description: "Tecnologia de reconhecimento de voz que ajuda a aperfeiçoar a pronúncia.",
    image: "/lovable-uploads/bb809ce4-1119-471d-8d3b-f1b0a8391ef8.png",
    points: ["Feedback detalhado sobre pronúncia com tecnologia OpenAI", "Identificação de padrões de erro específicos para cada aluno", "Exercícios personalizados para melhorar pontos fracos"]
  }, {
    id: "gamificacao",
    icon: <Trophy className="h-6 w-6" />,
    title: "Gamificação",
    heading: "Elementos de Jogo para Motivação",
    description: "Sistema de conquistas, sequências e competições amigáveis que mantêm o engajamento.",
    image: "/lovable-uploads/bb809ce4-1119-471d-8d3b-f1b0a8391ef8.png",
    points: ["Conquistas e badges para celebrar o progresso", "Competições amigáveis entre colegas de classe", "Sistema de pontos e níveis para manter a motivação"]
  }];

  return (
    <section id="recursos" className="py-20 md:py-24 bg-[#F9FAFC]">
      <div className="container px-4 sm:px-6 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 font-display">
            Recursos para Aprendizado Eficaz
          </h2>
          <p className="text-lg text-muted-foreground">
            Tecnologias exclusivas que transformam a forma como seus alunos aprendem
          </p>
        </div>
        
        <Tabs 
          value={activeTab}
          onValueChange={setActiveTab}
          className="max-w-5xl mx-auto"
        >
          <TabsList className="grid grid-cols-3 sm:grid-cols-5 mb-10">
            {features.map((feature) => (
              <TabsTrigger 
                key={feature.id}
                value={feature.id}
                className="flex flex-col items-center space-y-2 py-4"
              >
                <div className={`p-2 rounded-full ${activeTab === feature.id ? 'bg-primary/10' : 'bg-transparent'}`}>
                  {feature.icon}
                </div>
                <span className="text-xs sm:text-sm text-center font-medium">{feature.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {features.map((feature) => (
            <TabsContent 
              key={feature.id}
              value={feature.id}
              className="space-y-8"
            >
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="order-2 md:order-1">
                  <h3 className="text-2xl sm:text-3xl font-bold mb-4 font-display">
                    {feature.heading}
                  </h3>
                  <p className="text-lg text-muted-foreground mb-6">
                    {feature.description}
                  </p>
                  <ul className="space-y-3">
                    {feature.points.map((point, index) => (
                      <li key={index} className="flex items-start">
                        <div className="rounded-full p-1 bg-green-100 text-green-800 mr-3 mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="order-1 md:order-2 flex justify-center">
                  <img 
                    src={feature.image} 
                    alt={feature.title} 
                    className="rounded-lg shadow-lg max-w-full h-auto"
                    width={500}
                    height={300}
                  />
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export default Features;
