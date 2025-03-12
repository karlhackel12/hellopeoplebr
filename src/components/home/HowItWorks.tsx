
import React from 'react';
import { UserPlus, PenLine, Users, CreditCard } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: 1,
      icon: <UserPlus className="h-8 w-8 text-[#1E88E5]" />,
      title: "Cadastre-se",
      description: "Acesso gratuito a todas as ferramentas. Sem cartão de crédito."
    },
    {
      number: 2,
      icon: <PenLine className="h-8 w-8 text-[#1E88E5]" />,
      title: "Crie Lições com IA",
      description: "Gere material personalizado em minutos baseado em tópico, nível e objetivos."
    },
    {
      number: 3,
      icon: <Users className="h-8 w-8 text-[#1E88E5]" />,
      title: "Convide seus Alunos",
      description: "Seus estudantes pagam R$39,90/mês pelo acesso ao conteúdo e ferramentas."
    },
    {
      number: 4,
      icon: <CreditCard className="h-8 w-8 text-[#1E88E5]" />,
      title: "Receba Comissões",
      description: "Ganhe 40% de cada assinatura automaticamente todo mês."
    },
  ];

  return (
    <section id="como-funciona" className="py-20 md:py-28">
      <div className="container px-6 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-display">
            Como Funciona
          </h2>
          <p className="text-xl text-muted-foreground">
            Siga estes quatro passos simples para começar a usar o HelloPeople
          </p>
        </div>
        
        <div className="max-w-5xl mx-auto">
          <div className="relative">
            {/* Timeline line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#1E88E5]/20 transform -translate-x-1/2" />
            
            {/* Timeline steps */}
            <div className="space-y-12 md:space-y-24 relative">
              {steps.map((step, index) => (
                <div 
                  key={index} 
                  className={`relative flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8 md:gap-16`}
                >
                  {/* Number indicator for desktop */}
                  <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 z-10">
                    <div className="w-12 h-12 rounded-full bg-white border-4 border-[#1E88E5] flex items-center justify-center text-lg font-bold text-[#1E88E5]">
                      {step.number}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:text-right md:pr-16' : 'md:text-left md:pl-16'}`}>
                    <div className="flex md:hidden items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-[#1E88E5]/10 flex items-center justify-center">
                        {step.icon}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-[#1E88E5] flex items-center justify-center text-white font-bold">
                        {step.number}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-3 font-display">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                  
                  {/* Image/Icon */}
                  <div className="hidden md:block w-1/2">
                    <div className={`${index % 2 === 0 ? 'ml-16' : 'mr-16'} h-32 w-32 rounded-full bg-[#1E88E5]/10 flex items-center justify-center`}>
                      {step.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
