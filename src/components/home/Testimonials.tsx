
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      quote: "Economizo 4 horas por semana na preparação de aulas e meus alunos adoram o sistema de repetição espaçada.",
      author: "Ana Silva",
      role: "Professora Independente, São Paulo",
      avatar: "/placeholder.svg",
      initials: "AS"
    },
    {
      quote: "Com apenas 6 alunos na plataforma, aumentei minha renda mensal em quase R$100. E não preciso pagar nada!",
      author: "Carlos Mendes",
      role: "Professor de Business English, Rio de Janeiro",
      avatar: "/placeholder.svg",
      initials: "CM"
    },
    {
      quote: "O módulo de pronúncia é fantástico! Meus alunos melhoraram muito depois de começarmos a usar o HelloPeople.",
      author: "Patrícia Oliveira",
      role: "Professora de Inglês, Belo Horizonte",
      avatar: "/placeholder.svg",
      initials: "PO"
    }
  ];

  return (
    <section className="py-20 md:py-28">
      <div className="container px-6 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-display">
            O Que Dizem Nossos Professores
          </h2>
          <p className="text-xl text-muted-foreground">
            Descubra como o HelloPeople está transformando o ensino de inglês
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-white border-border/60 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="mb-6">
                  {[...Array(5)].map((_, i) => (
                    <svg 
                      key={i} 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="#FF8F00" 
                      className="inline-block mr-1"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  ))}
                </div>
                <blockquote className="text-lg mb-6 italic text-foreground leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.author} />
                    <AvatarFallback className="bg-[#1E88E5] text-white">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
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
