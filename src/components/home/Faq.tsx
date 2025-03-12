
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Faq: React.FC = () => {
  const faqs = [
    {
      question: "Preciso pagar algo para usar a plataforma como professor?",
      answer: "Não! O HelloPeople é 100% gratuito para professores. Você não precisa de cartão de crédito e não há custos ocultos."
    },
    {
      question: "Como funciona o modelo de comissão?",
      answer: "Você recebe 40% de cada assinatura de aluno (R$15,96 por aluno/mês). Por exemplo, com 5 alunos, você ganha R$79,80 extras todo mês."
    },
    {
      question: "Posso personalizar o conteúdo gerado por IA?",
      answer: "Sim! Você tem controle total para editar, ajustar e personalizar todo o conteúdo antes de enviar aos alunos."
    },
    {
      question: "Meus alunos atuais podem usar a plataforma?",
      answer: "Absolutamente. Você convida seus alunos existentes para a plataforma e eles acessam o conteúdo que você criar especificamente para eles."
    },
    {
      question: "Quanto tempo economizarei na preparação de aulas?",
      answer: "Professores relatam uma economia média de 3-5 horas por semana usando nossa plataforma para criar e gerenciar lições."
    },
    {
      question: "Como recebo minhas comissões?",
      answer: "As comissões são calculadas automaticamente e transferidas para sua conta bancária no início de cada mês. Trabalhamos com Pix e transferência bancária."
    }
  ];

  return (
    <section id="faq" className="py-20 md:py-28">
      <div className="container px-6 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-display">
            Perguntas Frequentes
          </h2>
          <p className="text-xl text-muted-foreground">
            Tudo o que você precisa saber sobre a plataforma HelloPeople
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-lg font-medium text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default Faq;
