
import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  PlayCircle, 
  Clock, 
  BarChart, 
  Users, 
  PieChart, 
  CreditCard 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  SwitchUserTypeLink, 
  FeatureCard, 
  CTAButton 
} from '@/components/landing/SharedComponents';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const TeacherLanding: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>HelloPeople - Para Professores de Inglês</title>
        <meta name="description" content="Ajude seus alunos a alcançarem fluência mais rápido com prática personalizada entre as aulas enquanto ganha renda adicional. Plataforma 100% gratuita para professores de inglês." />
        <meta name="keywords" content="professores de inglês, ensino com IA, ferramentas para professores de inglês, IA para ensino de inglês" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <header className="fixed top-0 left-0 right-0 z-50 px-6 md:px-8 py-3 bg-background/80 backdrop-blur-md border-b border-border/10">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link to="/" className="flex items-center">
              <h1 className="text-xl font-bold">HelloPeople</h1>
            </Link>
            
            <div className="flex items-center space-x-6">
              <SwitchUserTypeLink targetUserType="student" className="hidden md:flex" />
              
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="outline" size="sm" className="font-medium">
                    Entrar
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="font-medium bg-[#36B37E] hover:bg-[#36B37E]/90">
                    Comece Grátis
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-grow pt-24">
          {/* Hero Section */}
          <section className="relative pt-16 pb-16 md:pt-24 md:pb-24 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full">
              <div className="absolute -top-[10%] -right-[5%] w-[40%] h-[40%] bg-[#1E88E5]/5 rounded-full blur-3xl" />
              <div className="absolute top-[20%] -left-[5%] w-[30%] h-[30%] bg-[#26A69A]/5 rounded-full blur-3xl" />
            </div>
            
            <div className="container px-6 md:px-8 relative z-10">
              <div className="text-center max-w-3xl mx-auto">
                <div className="inline-block mb-5 py-1 px-3 border border-border bg-background/80 backdrop-blur-sm rounded-full animate-fade-in">
                  <p className="text-sm font-medium text-foreground/80">
                    Para Professores de Inglês Independentes
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
                      Comece Gratuitamente
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
              
              {/* Hero Image */}
              <div className="mt-12 md:mt-16 max-w-5xl mx-auto rounded-xl overflow-hidden shadow-xl border border-border/60 animate-scale-in animate-delay-400">
                <div className="aspect-[16/9] bg-gradient-to-br from-[#1E88E5]/5 to-background relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img 
                      src="https://images.unsplash.com/photo-1519389950473-47ba0277781c" 
                      alt="Professor trabalhando com grupo de alunos e usando tecnologia para ensino de inglês" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* Problem & Solution Cards */}
          <section className="py-16 bg-gradient-to-b from-background to-background/50">
            <div className="container px-6 md:px-8">
              <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {/* Problem Section Card */}
                <FeatureCard
                  icon={<div className="h-10 w-10 rounded-full bg-[#FF8F00]/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-[#FF8F00]" />
                  </div>}
                  title="Por que Alunos Têm Dificuldade"
                  description="Apenas 1-2 horas por semana em sala de aula não são suficientes. 80% do que é aprendido é esquecido após uma semana sem prática."
                />
                
                {/* Solution Overview Card */}
                <FeatureCard
                  icon={<div className="h-10 w-10 rounded-full bg-[#26A69A]/10 flex items-center justify-center">
                    <BarChart className="h-6 w-6 text-[#26A69A]" />
                  </div>}
                  title="Nossa Solução"
                  description="Atividades personalizadas de 5-15 minutos diários, otimizadas por IA e repetição espaçada, com acompanhamento automático do progresso."
                />
              </div>
            </div>
          </section>
          
          {/* Core Features for Teachers */}
          <section id="recursos" className="py-20 bg-gradient-to-br from-[#1E88E5]/5 to-background">
            <div className="container px-6 md:px-8">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 font-display">
                  Ferramentas Para Professores de Inglês
                </h2>
                <p className="text-xl text-muted-foreground">
                  Tudo o que você precisa para estender o ensino além da sala de aula
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {/* Feature Cards */}
                <FeatureCard
                  icon={<div className="h-10 w-10 rounded-full bg-[#1E88E5]/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-[#1E88E5]" />
                  </div>}
                  title="Gestão de Alunos"
                  description="Convide seus alunos com um código único, monitore seu progresso e envie atividades personalizadas."
                />
                
                <FeatureCard
                  icon={<div className="h-10 w-10 rounded-full bg-[#36B37E]/10 flex items-center justify-center">
                    <BarChart className="h-6 w-6 text-[#36B37E]" />
                  </div>}
                  title="Análise de Progresso"
                  description="Visualize em tempo real o progresso de cada aluno, com métricas de engajamento e áreas de dificuldade."
                />
                
                <FeatureCard
                  icon={<div className="h-10 w-10 rounded-full bg-[#FF8F00]/10 flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-[#FF8F00]" />
                  </div>}
                  title="Comissões por Assinatura"
                  description="Ganhe até 30% de comissão nas assinaturas dos seus alunos, com pagamentos mensais automatizados."
                />
              </div>
              
              <div className="text-center mt-12">
                <CTAButton 
                  href="/register" 
                  className="font-medium bg-[#36B37E] hover:bg-[#36B37E]/90 px-8 py-6 text-lg"
                >
                  Comece Gratuitamente como Professor
                  <ArrowRight size={20} className="ml-2" />
                </CTAButton>
              </div>
            </div>
          </section>
          
          {/* How It Works */}
          <section id="como-funciona" className="py-20 bg-gradient-to-br from-background to-[#1E88E5]/5">
            <div className="container px-6 md:px-8">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 font-display">
                  Como Funciona para Professores
                </h2>
                <p className="text-xl text-muted-foreground">
                  Três passos simples para transformar suas aulas de inglês
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {/* Steps */}
                <div className="bg-card/40 backdrop-blur-sm border border-border/60 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-[#1E88E5] text-white flex items-center justify-center text-xl font-bold">1</div>
                    <h3 className="text-xl font-semibold">Crie sua Conta</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Registre-se gratuitamente e configure seu perfil de professor em menos de 5 minutos.
                  </p>
                </div>
                
                <div className="bg-card/40 backdrop-blur-sm border border-border/60 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-[#36B37E] text-white flex items-center justify-center text-xl font-bold">2</div>
                    <h3 className="text-xl font-semibold">Crie Conteúdo</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Use nossa IA para criar conteúdo personalizado ou importe suas próprias lições.
                  </p>
                </div>
                
                <div className="bg-card/40 backdrop-blur-sm border border-border/60 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-[#FF8F00] text-white flex items-center justify-center text-xl font-bold">3</div>
                    <h3 className="text-xl font-semibold">Convide Alunos</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Compartilhe seu código de convite com seus alunos e comece a monitorar seu progresso.
                  </p>
                </div>
              </div>
            </div>
          </section>
          
          {/* Commission Calculator */}
          <section className="py-20 bg-gradient-to-br from-[#1E88E5]/5 to-background">
            <div className="container px-6 md:px-8">
              <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
                <div className="grid md:grid-cols-5 gap-0">
                  <div className="md:col-span-3 p-8 md:p-12">
                    <h2 className="text-2xl md:text-3xl font-bold mb-6 font-display">
                      Calcule Sua Renda Adicional
                    </h2>
                    <p className="text-lg text-muted-foreground mb-8">
                      Ganhe até 30% de comissão nas assinaturas dos seus alunos na plataforma.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-6 mb-8">
                      <div className="bg-[#F5F7FA] p-6 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">5 Alunos</h3>
                          <PieChart className="h-5 w-5 text-[#1E88E5]" />
                        </div>
                        <div className="text-2xl font-bold text-[#36B37E]">R$ 150,00</div>
                        <div className="text-sm text-muted-foreground">por mês</div>
                      </div>
                      
                      <div className="bg-[#F5F7FA] p-6 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">10 Alunos</h3>
                          <PieChart className="h-5 w-5 text-[#1E88E5]" />
                        </div>
                        <div className="text-2xl font-bold text-[#36B37E]">R$ 300,00</div>
                        <div className="text-sm text-muted-foreground">por mês</div>
                      </div>
                    </div>
                    
                    <CTAButton 
                      href="/register" 
                      className="font-medium bg-[#36B37E] hover:bg-[#36B37E]/90 w-full sm:w-auto"
                    >
                      Comece a Ganhar Agora
                      <ArrowRight size={16} className="ml-2" />
                    </CTAButton>
                  </div>
                  
                  <div className="md:col-span-2 bg-gradient-to-br from-[#1E88E5]/10 to-[#36B37E]/10 p-8 md:p-12 flex items-center justify-center">
                    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-sm">
                      <div className="text-center">
                        <h3 className="font-bold text-lg mb-2">O que professores dizem</h3>
                        <p className="text-muted-foreground italic mb-4">
                          "Comecei a usar o HelloPeople há 3 meses. Meus alunos praticam mais, aprendem mais rápido e estou ganhando R$400 extras por mês."
                        </p>
                        <div>
                          <p className="font-semibold">Carla Mendes</p>
                          <p className="text-sm text-muted-foreground">Professora de Inglês, São Paulo</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default TeacherLanding;
