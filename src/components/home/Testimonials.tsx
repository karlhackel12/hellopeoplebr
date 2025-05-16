
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Testimonials: React.FC = () => {
  const testimonials = [{
    quote: "Economizo 4 horas por semana na preparação de aulas e meus alunos adoram o sistema de repetição espaçada.",
    author: "Ana Silva",
    role: "Professora Independente, São Paulo",
    avatar: "/placeholder.svg",
    initials: "AS"
  }, {
    quote: "Com apenas 6 alunos na plataforma, aumentei minha renda mensal em quase R$100. E não preciso pagar nada!",
    author: "Carlos Mendes",
    role: "Professor de Business English, Rio de Janeiro",
    avatar: "/placeholder.svg",
    initials: "CM"
  }, {
    quote: "O módulo de pronúncia é fantástico! Meus alunos melhoraram muito depois de começarmos a usar o HelloPeople.",
    author: "Patrícia Oliveira",
    role: "Professora de Inglês, Belo Horizonte",
    avatar: "/placeholder.svg",
    initials: "PO"
  }];

  return (
    <section className="py-20 md:py-24 bg-[#F5F7FA]">
      <div className="container px-4 sm:px-6 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 font-display">
            O que Dizem Nossos Usuários
          </h2>
          <p className="text-lg text-muted-foreground">
            Professores e alunos estão transformando a forma de ensinar e aprender inglês
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-border/50">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.author} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-2">
                    <div className="flex justify-center">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#FFB400" className="text-yellow-500">
                          <path d="M12 17.8 5.8 21 7 14.1 2 9.3l7-1L12 2l3 6.3 7 1-5 4.8 1.2 6.9-6.2-3.2z"></path>
                        </svg>
                      ))}
                    </div>
                    
                    <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
                    
                    <div>
                      <p className="font-semibold">{testimonial.author}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
