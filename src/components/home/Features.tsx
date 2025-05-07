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
  return;
};
export default Features;