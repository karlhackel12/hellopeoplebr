
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

  return (
    <section id="como-funciona" className="py-16 sm:py-20 md:py-24 bg-background">
      <div className="container px-4 sm:px-6 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display mb-4">
            Como Funciona
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground">
            Transforme sua experiência de aprendizado e ensino de inglês em poucos passos
          </p>
        </div>

        <Tabs defaultValue="para-professores" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
            <TabsTrigger value="para-professores">Para Professores</TabsTrigger>
            <TabsTrigger value="para-alunos">Para Alunos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="para-professores">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {teacherSteps.map((step) => (
                <div 
                  key={step.number}
                  className="relative bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-border/50 flex flex-col items-center text-center"
                >
                  <div className="absolute -top-4 -left-2 bg-[#1E88E5] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md">
                    {step.number}
                  </div>
                  <div className="bg-[#1E88E5]/10 p-3 rounded-full mb-5">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="para-alunos">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {studentSteps.map((step) => (
                <div 
                  key={step.number}
                  className="relative bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-border/50 flex flex-col items-center text-center"
                >
                  <div className="absolute -top-4 -left-2 bg-[#26A69A] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md">
                    {step.number}
                  </div>
                  <div className="bg-[#26A69A]/10 p-3 rounded-full mb-5">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default HowItWorks;
