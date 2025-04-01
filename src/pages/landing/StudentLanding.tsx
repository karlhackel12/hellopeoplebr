
import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  PlayCircle, 
  Zap, 
  BarChart, 
  MessageCircle, 
  Calendar, 
  Trophy 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  SwitchUserTypeLink, 
  FeatureCard,
  CTAButton 
} from '@/components/landing/SharedComponents';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const StudentLanding: React.FC = () => {
  const [inviteCode, setInviteCode] = React.useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = `/invitation/${inviteCode}`;
  };
  
  return (
    <>
      <Helmet>
        <title>HelloPeople - Para Alunos de Inglês</title>
        <meta name="description" content="Continue seu aprendizado de inglês entre as aulas com prática personalizada diária. Reforce o vocabulário e gramática com atividades criadas pelo seu professor." />
        <meta name="keywords" content="aulas de inglês, prática de inglês, app para estudar inglês, IA para aprender inglês" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <header className="fixed top-0 left-0 right-0 z-50 px-6 md:px-8 py-3 bg-background/80 backdrop-blur-md border-b border-border/10">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link to="/" className="flex items-center">
              <h1 className="text-xl font-bold">HelloPeople</h1>
            </Link>
            
            <div className="flex items-center space-x-6">
              <SwitchUserTypeLink targetUserType="teacher" className="hidden md:flex" />
              
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="outline" size="sm" className="font-medium">
                    Entrar
                  </Button>
                </Link>
                <form onSubmit={handleSubmit} className="hidden md:flex">
                  <Input
                    type="text"
                    placeholder="Seu código de convite"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    className="w-40 h-9 mr-2"
                  />
                  <Button size="sm" type="submit" className="font-medium bg-[#1E88E5] hover:bg-[#1E88E5]/90">
                    Acessar
                  </Button>
                </form>
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
                    Para Alunos de Inglês
                  </p>
                </div>
                
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display tracking-tight mb-6 animate-slide-up">
                  Continue seu Aprendizado de Inglês <span className="text-[#1E88E5]">Entre as Aulas</span>
                </h1>
                
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up animate-delay-100">
                  Pratique inglês diariamente com atividades personalizadas criadas pelo seu professor
                </p>
                
                <form onSubmit={handleSubmit} className="max-w-md mx-auto animate-slide-up animate-delay-200">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      type="text"
                      placeholder="Digite seu código de convite"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      className="h-12 text-base"
                    />
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="font-medium bg-[#1E88E5] hover:bg-[#1E88E5]/90 px-8"
                    >
                      Acessar Sua Conta
                      <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </div>
                </form>
                
                <div className="mt-6 text-sm text-muted-foreground animate-fade-in animate-delay-300 p-4 bg-blue-50 rounded-lg inline-block">
                  <p className="font-medium text-blue-700">Seu acesso é gratuito!</p>
                  <p>Peça seu código de convite ao seu professor de inglês</p>
                </div>
              </div>
              
              {/* Hero Image */}
              <div className="mt-12 md:mt-16 max-w-5xl mx-auto rounded-xl overflow-hidden shadow-xl border border-border/60 animate-scale-in animate-delay-400">
                <div className="aspect-[16/9] bg-gradient-to-br from-[#1E88E5]/5 to-background relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img 
                      src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81" 
                      alt="Estudantes praticando inglês em grupo com dispositivos digitais" 
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
                    <Zap className="h-6 w-6 text-[#FF8F00]" />
                  </div>}
                  title="Por que Você Esquece o que Aprendeu"
                  description="80% do vocabulário e gramática são esquecidos após uma semana sem prática constante entre as aulas de inglês."
                />
                
                {/* Solution Overview Card */}
                <FeatureCard
                  icon={<div className="h-10 w-10 rounded-full bg-[#26A69A]/10 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-[#26A69A]" />
                  </div>}
                  title="Nossa Solução"
                  description="Atividades diárias de 5-15 minutos baseadas nas suas aulas, com revisão espaçada do vocabulário e gramática para fixação permanente."
                />
              </div>
            </div>
          </section>
          
          {/* Core Features for Students */}
          <section id="recursos" className="py-20 bg-gradient-to-br from-[#1E88E5]/5 to-background">
            <div className="container px-6 md:px-8">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 font-display">
                  Ferramentas Para Alunos de Inglês
                </h2>
                <p className="text-xl text-muted-foreground">
                  Tudo o que você precisa para continuar aprendendo além da sala de aula
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {/* Feature Cards */}
                <FeatureCard
                  icon={<div className="h-10 w-10 rounded-full bg-[#1E88E5]/10 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-[#1E88E5]" />
                  </div>}
                  title="Prática Diária"
                  description="Atividades curtas e focadas baseadas no que você aprendeu nas aulas, com feedback imediato."
                />
                
                <FeatureCard
                  icon={<div className="h-10 w-10 rounded-full bg-[#36B37E]/10 flex items-center justify-center">
                    <MessageCircle className="h-6 w-6 text-[#36B37E]" />
                  </div>}
                  title="Prática de Conversação"
                  description="Pratique seu inglês falado com um parceiro de conversação AI personalizado pelo seu professor."
                />
                
                <FeatureCard
                  icon={<div className="h-10 w-10 rounded-full bg-[#FF8F00]/10 flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-[#FF8F00]" />
                  </div>}
                  title="Sistema de Conquistas"
                  description="Mantenha sua motivação alta com streaks diárias, pontos e conquistas por consistência."
                />
              </div>
              
              <div className="text-center mt-12">
                <CTAButton 
                  href="/invitation" 
                  className="font-medium bg-[#1E88E5] hover:bg-[#1E88E5]/90 px-8 py-6 text-lg"
                >
                  Acesse com Seu Código de Convite
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
                  Como Funciona para Alunos
                </h2>
                <p className="text-xl text-muted-foreground">
                  Três passos simples para praticar inglês todos os dias
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {/* Steps */}
                <div className="bg-card/40 backdrop-blur-sm border border-border/60 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-[#1E88E5] text-white flex items-center justify-center text-xl font-bold">1</div>
                    <h3 className="text-xl font-semibold">Receba o Convite</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Seu professor de inglês deve te convidar para que você tenha acesso à plataforma gratuitamente.
                  </p>
                </div>
                
                <div className="bg-card/40 backdrop-blur-sm border border-border/60 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-[#36B37E] text-white flex items-center justify-center text-xl font-bold">2</div>
                    <h3 className="text-xl font-semibold">Pratique Diariamente</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Complete atividades personalizadas de 5-15 minutos todos os dias, em qualquer lugar.
                  </p>
                </div>
                
                <div className="bg-card/40 backdrop-blur-sm border border-border/60 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-[#FF8F00] text-white flex items-center justify-center text-xl font-bold">3</div>
                    <h3 className="text-xl font-semibold">Acompanhe seu Progresso</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Visualize seu progresso, conquistas e mantenha sua sequência de estudos diários.
                  </p>
                </div>
              </div>
            </div>
          </section>
          
          {/* Student Testimonial */}
          <section className="py-20 bg-gradient-to-br from-[#1E88E5]/5 to-background">
            <div className="container px-6 md:px-8">
              <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
                <div className="grid md:grid-cols-5 gap-0">
                  <div className="md:col-span-3 p-8 md:p-12">
                    <h2 className="text-2xl md:text-3xl font-bold mb-6 font-display">
                      O Que Dizem Nossos Alunos
                    </h2>
                    
                    <div className="bg-[#F5F7FA] p-6 rounded-lg mb-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-[#E1E4E8] overflow-hidden">
                          <img src="https://images.unsplash.com/photo-1531297484001-80022131f5a1" alt="Foto do aluno" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-semibold">Roberto Silva</p>
                          <p className="text-sm text-muted-foreground">Estudante de Inglês Intermediário</p>
                        </div>
                      </div>
                      <p className="text-muted-foreground italic">
                        "Minha fluência melhorou muito depois que comecei a usar o HelloPeople. Costumo praticar por 10 minutos todos os dias no ônibus, e já consigo me comunicar muito melhor nas aulas."
                      </p>
                      <div className="flex mt-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#FFB400" className="text-yellow-500"><path d="M12 17.8 5.8 21 7 14.1 2 9.3l7-1L12 2l3 6.3 7 1-5 4.8 1.2 6.9-6.2-3.2z"></path></svg>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#FFB400" className="text-yellow-500"><path d="M12 17.8 5.8 21 7 14.1 2 9.3l7-1L12 2l3 6.3 7 1-5 4.8 1.2 6.9-6.2-3.2z"></path></svg>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#FFB400" className="text-yellow-500"><path d="M12 17.8 5.8 21 7 14.1 2 9.3l7-1L12 2l3 6.3 7 1-5 4.8 1.2 6.9-6.2-3.2z"></path></svg>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#FFB400" className="text-yellow-500"><path d="M12 17.8 5.8 21 7 14.1 2 9.3l7-1L12 2l3 6.3 7 1-5 4.8 1.2 6.9-6.2-3.2z"></path></svg>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#FFB400" className="text-yellow-500"><path d="M12 17.8 5.8 21 7 14.1 2 9.3l7-1L12 2l3 6.3 7 1-5 4.8 1.2 6.9-6.2-3.2z"></path></svg>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-lg mb-6">
                      <h3 className="font-semibold text-blue-800 mb-2">Acesso Exclusivo Por Convite</h3>
                      <p className="text-blue-700">
                        O acesso ao HelloPeople é exclusivo para alunos convidados por professores. Pergunte ao seu professor de inglês sobre como obter acesso.
                      </p>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="mt-8">
                      <p className="font-medium mb-3">Digite seu código de convite:</p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Input
                          type="text"
                          placeholder="Seu código de convite"
                          value={inviteCode}
                          onChange={(e) => setInviteCode(e.target.value)}
                          className="h-12 text-base"
                        />
                        <Button 
                          type="submit" 
                          className="font-medium bg-[#1E88E5] hover:bg-[#1E88E5]/90"
                        >
                          Acessar Agora
                          <ArrowRight size={16} className="ml-2" />
                        </Button>
                      </div>
                    </form>
                  </div>
                  
                  <div className="md:col-span-2 bg-gradient-to-br from-[#1E88E5]/10 to-[#36B37E]/10 p-8 md:p-12 flex items-center justify-center">
                    <div className="space-y-6">
                      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-8 w-8 rounded-full bg-[#36B37E]/20 flex items-center justify-center">
                            <Trophy className="h-4 w-4 text-[#36B37E]" />
                          </div>
                          <p className="font-medium">Sequência de 30 dias</p>
                        </div>
                        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#36B37E] rounded-full" style={{ width: '80%' }}></div>
                        </div>
                      </div>
                      
                      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-8 w-8 rounded-full bg-[#1E88E5]/20 flex items-center justify-center">
                            <MessageCircle className="h-4 w-4 text-[#1E88E5]" />
                          </div>
                          <p className="font-medium">Último Feedback</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          "Sua pronúncia melhorou 20% nas últimas 2 semanas!"
                        </p>
                      </div>
                      
                      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-8 w-8 rounded-full bg-[#FF8F00]/20 flex items-center justify-center">
                            <BarChart className="h-4 w-4 text-[#FF8F00]" />
                          </div>
                          <p className="font-medium">Progresso do Vocabulário</p>
                        </div>
                        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#FF8F00] rounded-full" style={{ width: '65%' }}></div>
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

export default StudentLanding;
