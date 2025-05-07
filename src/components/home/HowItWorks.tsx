import React from 'react';
import { UserPlus, PenLine, Users, CreditCard, CalendarCheck, Award, Mic, Repeat } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
const HowItWorks: React.FC = () => {
  const teacherSteps = [{
    number: 1,
    icon: <UserPlus className="h-8 w-8 text-[#1E88E5]" />,
    title: "Cadastre-se Gratuitamente",
    description: "Acesso completo a todas as ferramentas. Sem cartão de crédito necessário."
  }, {
    number: 2,
    icon: <PenLine className="h-8 w-8 text-[#1E88E5]" />,
    title: "Crie Lições com IA",
    description: "Gere material personalizado em minutos baseado em tópico, nível e objetivos."
  }, {
    number: 3,
    icon: <Users className="h-8 w-8 text-[#1E88E5]" />,
    title: "Convide seus Alunos",
    description: "Seus estudantes pagam R$39,90/mês pelo acesso ao conteúdo e ferramentas."
  }, {
    number: 4,
    icon: <CreditCard className="h-8 w-8 text-[#1E88E5]" />,
    title: "Receba Comissões",
    description: "Acompanhe o progresso dos seus alunos com análises personalizadas e detalhadas."
  }];
  const studentSteps = [{
    number: 1,
    icon: <CalendarCheck className="h-8 w-8 text-[#26A69A]" />,
    title: "Pratique Diariamente",
    description: "Atividades personalizadas de 5-15 minutos que se adaptam ao seu progresso."
  }, {
    number: 2,
    icon: <Repeat className="h-8 w-8 text-[#26A69A]" />,
    title: "Memorize com Repetição Espaçada",
    description: "Sistema científico que otimiza a retenção de vocabulário e estruturas."
  }, {
    number: 3,
    icon: <Mic className="h-8 w-8 text-[#26A69A]" />,
    title: "Pratique Pronúncia",
    description: "Receba feedback detalhado sobre sua pronúncia com tecnologia de IA."
  }, {
    number: 4,
    icon: <Award className="h-8 w-8 text-[#26A69A]" />,
    title: "Construa Sequências e Conquistas",
    description: "Mantenha-se motivado com elementos de gamificação e competições amigáveis."
  }];
  return;
};
export default HowItWorks;