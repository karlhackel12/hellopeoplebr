
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, PlayCircle } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section id="inicio" className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full">
        <div className="absolute -top-[10%] -right-[5%] w-[40%] h-[40%] bg-[#1E88E5]/5 rounded-full blur-3xl" />
        <div className="absolute top-[20%] -left-[5%] w-[30%] h-[30%] bg-[#26A69A]/5 rounded-full blur-3xl" />
      </div>
      
      <div className="container px-6 md:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-block mb-5 py-1 px-3 border border-border bg-background/80 backdrop-blur-sm rounded-full animate-fade-in">
            <p className="text-sm font-medium text-foreground/80">
              Plataforma Para Professores de Inglês
            </p>
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display tracking-tight mb-6 animate-slide-up">
            Revolucione Suas Aulas de Inglês com IA - <span className="text-[#1E88E5]">100% Grátis</span> para Professores
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up animate-delay-100">
            Economize horas de preparação, melhore os resultados dos alunos e aumente sua renda mensal
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 animate-slide-up animate-delay-200">
            <Link to="/register">
              <Button size="lg" className="font-medium w-full sm:w-auto px-8 bg-[#36B37E] hover:bg-[#36B37E]/90">
                Comece Gratuitamente
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
            <a href="#como-funciona">
              <Button size="lg" variant="outline" className="font-medium w-full sm:w-auto px-8">
                Saiba Como Funciona
                <PlayCircle size={16} className="ml-2" />
              </Button>
            </a>
          </div>
          
          <p className="mt-6 text-sm text-muted-foreground animate-fade-in animate-delay-300">
            Sem cartão de crédito. Sem custos ocultos. Acesso completo.
          </p>
        </div>
        
        {/* Hero Image - Platform Preview */}
        <div className="mt-12 md:mt-16 max-w-5xl mx-auto rounded-xl overflow-hidden shadow-xl border border-border/60 animate-scale-in animate-delay-400">
          <div className="aspect-[16/9] bg-gradient-to-br from-[#1E88E5]/5 to-background relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <img 
                src="/placeholder.svg" 
                alt="Interface do HelloPeople" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
        
        {/* Teacher and Student Info Cards */}
        <div className="mt-16 grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="bg-card/40 backdrop-blur-sm border border-border/60 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-[#1E88E5]/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1E88E5]"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <h3 className="text-xl font-semibold">Para Professores</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Acesso 100% gratuito. Crie lições personalizadas, avaliações, e convide seus alunos.
            </p>
            <Link to="/register">
              <Button className="w-full bg-[#1E88E5] hover:bg-[#1E88E5]/90">
                Criar Conta de Professor
              </Button>
            </Link>
          </div>
          
          <div className="bg-card/40 backdrop-blur-sm border border-border/60 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-[#26A69A]/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#26A69A]"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path></svg>
              </div>
              <h3 className="text-xl font-semibold">Para Alunos</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Se seu professor te convidou, acesse a plataforma usando o código de convite.
            </p>
            <Link to="/invitation">
              <Button variant="outline" className="w-full">
                Inserir Código de Convite
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex items-center flex-col animate-pulse-light">
        <p className="text-sm text-muted-foreground mb-2">Role para explorar</p>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M12 5v14"></path><path d="m19 12-7 7-7-7"></path></svg>
      </div>
    </section>
  );
};

export default Hero;
