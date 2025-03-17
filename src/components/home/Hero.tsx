
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, PlayCircle, Clock, BarChart } from 'lucide-react';

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
              Plataforma para Professores de Inglês Independentes
            </p>
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display tracking-tight mb-6 animate-slide-up">
            Estenda o Aprendizado de Inglês <span className="text-[#1E88E5]">Além da Sala de Aula</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up animate-delay-100">
            Ajude seus alunos a alcançarem fluência mais rápido com prática personalizada entre as aulas enquanto ganha renda adicional
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 animate-slide-up animate-delay-200">
            <Link to="/register">
              <Button size="lg" className="font-medium w-full sm:w-auto px-8 bg-[#36B37E] hover:bg-[#36B37E]/90">
                Comece Gratuitamente como Professor
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
            <a href="#como-funciona">
              <Button size="lg" variant="outline" className="font-medium w-full sm:w-auto px-8">
                Veja Como Funciona
                <PlayCircle size={16} className="ml-2" />
              </Button>
            </a>
          </div>
          
          <p className="mt-6 text-sm text-muted-foreground animate-fade-in animate-delay-300">
            Sem cartão de crédito. Sem custos ocultos. 100% gratuito para professores.
          </p>
        </div>
        
        {/* Hero Image - Platform Preview */}
        <div className="mt-12 md:mt-16 max-w-5xl mx-auto rounded-xl overflow-hidden shadow-xl border border-border/60 animate-scale-in animate-delay-400">
          <div className="aspect-[16/9] bg-gradient-to-br from-[#1E88E5]/5 to-background relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <img 
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158" 
                alt="Alunos aprendendo inglês com o auxílio de tecnologia" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
        
        {/* Teacher and Student Info Cards */}
        <div className="mt-16 grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Problem Section Card */}
          <div className="bg-card/40 backdrop-blur-sm border border-border/60 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-[#FF8F00]/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-[#FF8F00]" />
              </div>
              <h3 className="text-xl font-semibold">Por que Alunos Têm Dificuldade</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Apenas 1-2 horas por semana em sala de aula não são suficientes. 80% do que é aprendido é esquecido após uma semana sem prática.
            </p>
            <div className="pt-2 flex items-center justify-between">
              <div className="text-center flex-1">
                <div className="text-2xl font-bold text-[#FF5630]">80%</div>
                <div className="text-sm text-muted-foreground">do aprendizado perdido</div>
              </div>
              <div className="h-10 border-r border-border/60"></div>
              <div className="text-center flex-1">
                <div className="text-2xl font-bold text-[#FF8F00]">1-2h</div>
                <div className="text-sm text-muted-foreground">aulas por semana</div>
              </div>
              <div className="h-10 border-r border-border/60"></div>
              <div className="text-center flex-1">
                <div className="text-2xl font-bold text-[#36B37E]">3x</div>
                <div className="text-sm text-muted-foreground">mais rápido com prática</div>
              </div>
            </div>
          </div>
          
          {/* Solution Overview Card */}
          <div className="bg-card/40 backdrop-blur-sm border border-border/60 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-[#26A69A]/10 flex items-center justify-center">
                <BarChart className="h-6 w-6 text-[#26A69A]" />
              </div>
              <h3 className="text-xl font-semibold">Nossa Solução</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Atividades personalizadas de 5-15 minutos diários, otimizadas por IA e repetição espaçada, com acompanhamento automático do progresso.
            </p>
            <div className="grid grid-cols-3 gap-3 mt-2">
              <div className="bg-[#1E88E5]/5 p-3 rounded-lg text-center">
                <div className="text-sm font-semibold text-[#1E88E5]">Prática Diária</div>
                <div className="text-xs text-muted-foreground mt-1">5-15 min/dia</div>
              </div>
              <div className="bg-[#26A69A]/5 p-3 rounded-lg text-center">
                <div className="text-sm font-semibold text-[#26A69A]">Repetição Espaçada</div>
                <div className="text-xs text-muted-foreground mt-1">Retenção científica</div>
              </div>
              <div className="bg-[#FF8F00]/5 p-3 rounded-lg text-center">
                <div className="text-sm font-semibold text-[#FF8F00]">Progresso</div>
                <div className="text-xs text-muted-foreground mt-1">Rastreamento automático</div>
              </div>
            </div>
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
