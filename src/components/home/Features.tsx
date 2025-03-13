
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Brain, FileText, Repeat, Mic, Calendar, Trophy } from 'lucide-react';

const Features: React.FC = () => {
  const [activeTab, setActiveTab] = useState("pratica-diaria");
  
  const features = [
    {
      id: "pratica-diaria",
      icon: <Calendar className="h-6 w-6" />,
      title: "Prática Diária",
      heading: "Atividades Diárias de 5-15 Minutos",
      description: "Microaprendizado consistente que se encaixa perfeitamente na rotina dos alunos.",
      image: "/placeholder.svg",
      points: [
        "Atividades curtas e focadas de 5-15 minutos por dia",
        "Lembretes automáticos via WhatsApp para manter o engajamento",
        "Sequências de prática e acompanhamento de progresso"
      ]
    },
    {
      id: "ia-personalizada",
      icon: <Brain className="h-6 w-6" />,
      title: "IA Personalizada",
      heading: "Conteúdo Adaptado com Inteligência Artificial",
      description: "Atividades geradas por IA com base no que foi ensinado em sala de aula.",
      image: "/placeholder.svg",
      points: [
        "Material personalizado baseado no conteúdo das suas aulas",
        "Adaptação automática ao nível e progresso de cada aluno",
        "Sugestões de conteúdo para reforçar pontos fracos"
      ]
    },
    {
      id: "repeticao-espacada",
      icon: <Repeat className="h-6 w-6" />,
      title: "Repetição Espaçada",
      heading: "Sistema Científico de Memorização",
      description: "Algoritmo baseado em neurociência que otimiza a retenção de vocabulário e gramática.",
      image: "/placeholder.svg",
      points: [
        "Revisão otimizada de vocabulário no momento ideal para memorização",
        "Aumenta a retenção de longo prazo em até 50%",
        "Adaptação automática baseada no desempenho individual"
      ]
    },
    {
      id: "pratica-pronuncia",
      icon: <Mic className="h-6 w-6" />,
      title: "Prática de Pronúncia",
      heading: "Feedback de Pronúncia com IA",
      description: "Tecnologia de reconhecimento de voz que ajuda a aperfeiçoar a pronúncia.",
      image: "/placeholder.svg",
      points: [
        "Feedback detalhado sobre pronúncia com tecnologia OpenAI",
        "Identificação de padrões de erro específicos para cada aluno",
        "Exercícios personalizados para melhorar pontos fracos"
      ]
    },
    {
      id: "gamificacao",
      icon: <Trophy className="h-6 w-6" />,
      title: "Gamificação",
      heading: "Elementos de Jogo para Motivação",
      description: "Sistema de conquistas, sequências e competições amigáveis que mantêm o engajamento.",
      image: "/placeholder.svg",
      points: [
        "Conquistas e badges para celebrar o progresso",
        "Competições amigáveis entre colegas de classe",
        "Sistema de pontos e níveis para manter a motivação"
      ]
    },
  ];

  return (
    <section id="recursos" className="py-20 md:py-28 bg-[#F5F7FA]">
      <div className="container px-6 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-display">
            Recursos Poderosos
          </h2>
          <p className="text-xl text-muted-foreground">
            Ferramentas inovadoras que transformam o aprendizado entre as aulas
          </p>
        </div>
        
        <div className="max-w-5xl mx-auto">
          <Tabs defaultValue="pratica-diaria" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-8 h-auto bg-transparent gap-2">
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
                        {feature.points.map((point, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#26A69A] mt-1"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            <span>{point}</span>
                          </li>
                        ))}
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
        
        {/* WhatsApp Integration */}
        <div className="mt-20 max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-8 flex flex-col justify-center">
              <h3 className="text-2xl font-semibold mb-4 font-display">Integração com WhatsApp</h3>
              <p className="text-muted-foreground mb-6">
                Lembretes diários e notificações enviadas diretamente para o WhatsApp dos alunos, garantindo engajamento contínuo.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#26A69A] mt-1"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Lembretes personalizados em horários otimizados</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#26A69A] mt-1"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Alertas de sequências de estudo prestes a serem quebradas</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#26A69A] mt-1"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Resumos semanais de progresso enviados automaticamente</span>
                </li>
              </ul>
            </div>
            <div className="bg-[#25D366]/5 p-6 flex items-center justify-center">
              <div className="max-w-[250px] border border-[#e0e0e0] rounded-xl overflow-hidden shadow-md">
                <div className="bg-[#25D366] text-white p-3 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-1">
                    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"></path>
                    <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z"></path>
                    <path d="M14 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z"></path>
                    <path d="M12 17a5 5 0 0 1-5-5h10a5 5 0 0 1-5 5Z"></path>
                  </svg>
                  <p className="text-sm font-medium">HelloPeople</p>
                </div>
                <div className="bg-white p-4">
                  <div className="bg-[#dcf8c6] p-3 rounded-lg mb-3 text-sm">
                    Olá Maria! Não esqueça de completar sua prática diária de inglês hoje. Mantenha sua sequência de 7 dias! 🔥
                  </div>
                  <div className="bg-[#dcf8c6] p-3 rounded-lg text-sm">
                    Parabéns! Você dominou 5 novas palavras esta semana. Continue praticando para destravar novos desafios! 🏆
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
