
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Brain, FileText, Repeat, Mic } from 'lucide-react';

const Features: React.FC = () => {
  const [activeTab, setActiveTab] = useState("gerador-licoes");
  
  const features = [
    {
      id: "gerador-licoes",
      icon: <Brain className="h-6 w-6" />,
      title: "Gerador de Lições",
      heading: "Crie Lições Personalizadas em Minutos",
      description: "Especifique tópico, nível e objetivos. Nossa IA faz o resto.",
      image: "/placeholder.svg",
    },
    {
      id: "questionarios",
      icon: <FileText className="h-6 w-6" />,
      title: "Criador de Questionários",
      heading: "Avaliações com Correção Automática",
      description: "Economize tempo de correção com feedback imediato para os alunos.",
      image: "/placeholder.svg",
    },
    {
      id: "repeticao",
      icon: <Repeat className="h-6 w-6" />,
      title: "Repetição Espaçada",
      heading: "Retenção Otimizada",
      description: "Sistema baseado em ciência cognitiva para melhorar a memorização.",
      image: "/placeholder.svg",
    },
    {
      id: "pronuncia",
      icon: <Mic className="h-6 w-6" />,
      title: "Módulo de Pronúncia",
      heading: "Prática de Fala com IA",
      description: "Feedback de pronúncia com tecnologia OpenAI.",
      image: "/placeholder.svg",
    },
  ];

  return (
    <section id="recursos" className="py-20 md:py-28 bg-[#F5F7FA]">
      <div className="container px-6 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-display">
            Recursos da Plataforma
          </h2>
          <p className="text-xl text-muted-foreground">
            Ferramentas poderosas para transformar sua experiência de ensino
          </p>
        </div>
        
        <div className="max-w-5xl mx-auto">
          <Tabs defaultValue="gerador-licoes" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-8 h-auto bg-transparent">
              {features.map((feature) => (
                <TabsTrigger
                  key={feature.id}
                  value={feature.id}
                  className={`flex flex-col items-center gap-2 h-auto py-4 px-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all rounded-lg ${activeTab === feature.id ? 'bg-white shadow-md' : 'bg-transparent'}`}
                >
                  <div className={`p-2 rounded-full ${activeTab === feature.id ? 'bg-[#1E88E5]/10 text-[#1E88E5]' : 'bg-muted text-muted-foreground'}`}>
                    {feature.icon}
                  </div>
                  <span className="text-sm font-medium text-center">{feature.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {features.map((feature) => (
              <TabsContent key={feature.id} value={feature.id} className="mt-6">
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-8 flex flex-col justify-center">
                      <h3 className="text-2xl font-semibold mb-4 font-display">{feature.heading}</h3>
                      <p className="text-muted-foreground mb-6">{feature.description}</p>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#26A69A] mt-1"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          <span>Criar conteúdo personalizado em minutos</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#26A69A] mt-1"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          <span>Atualização automática com base no progresso</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#26A69A] mt-1"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          <span>Acompanhe o desenvolvimento dos alunos</span>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-[#1E88E5]/5 p-6 flex items-center justify-center">
                      <img 
                        src={feature.image} 
                        alt={feature.title} 
                        className="rounded-lg max-h-80 object-cover"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default Features;
