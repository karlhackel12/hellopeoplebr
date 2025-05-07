import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
const Faq: React.FC = () => {
  const faqs = [{
    question: "Qual plano devo escolher para começar?",
    answer: "Recomendamos o plano que melhor atenda ao número de alunos que você tem. Temos o plano Básico (R$29,90/mês) para até 10 alunos, o Profissional (R$49,90/mês) para até 20 alunos, e o Business (R$59,90/mês) para mais de 20 alunos."
  }, {
    question: "Quanto tempo precisarei dedicar como professor?",
    answer: "O HelloPeople foi projetado para economizar seu tempo, não consumir mais dele. Após a configuração inicial (cerca de 30 minutos), você gastará apenas 15-20 minutos por semana revisando o progresso dos alunos e ajustando as atividades conforme necessário."
  }, {
    question: "Posso personalizar o conteúdo gerado por IA?",
    answer: "Sim! Você tem controle total para editar, ajustar e personalizar todo o conteúdo antes de enviar aos alunos. Nossa IA é uma ferramenta para economizar seu tempo, não para substituir sua expertise."
  }, {
    question: "Meus alunos atuais podem usar a plataforma?",
    answer: "Absolutamente. Você convida seus alunos existentes para a plataforma e eles acessam o conteúdo que você criar especificamente para eles. A plataforma complementa suas aulas presenciais ou online."
  }, {
    question: "Existe um número mínimo de alunos para começar?",
    answer: "Não, você pode começar a usar a plataforma com apenas um aluno. Nossos planos são baseados no número máximo de alunos que você pode gerenciar, com o plano Básico permitindo até 10 alunos por R$29,90/mês."
  }, {
    question: "Quanto tempo economizarei na preparação de aulas?",
    answer: "Professores relatam uma economia média de 3-5 horas por semana usando nossa plataforma para criar e gerenciar lições, exercícios e avaliações."
  }, {
    question: "Como a plataforma complementa minhas aulas existentes?",
    answer: "O HelloPeople não substitui suas aulas, mas as estende para além da sala de aula. Ele reforça o que você ensina através de prática consistente, permite acompanhar o progresso dos alunos, e identifica áreas que precisam de mais atenção nas próximas aulas."
  }];
  return <section id="faq" className="py-12 sm:py-16 md:py-20 lg:py-[50px]">
      <div className="container px-4 sm:px-6 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 font-display">
            Perguntas Frequentes
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
            Tudo o que você precisa saber sobre a plataforma HelloPeople
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-base sm:text-lg font-medium text-left py-3 sm:py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm sm:text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>)}
          </Accordion>
        </div>
      </div>
    </section>;
};
export default Faq;