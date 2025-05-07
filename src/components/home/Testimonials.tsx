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
  return <section className="py-20 md:py-0">
      
    </section>;
};
export default Testimonials;