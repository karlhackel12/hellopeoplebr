
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageSquare } from 'lucide-react';

const CtaSection: React.FC = () => {
  return (
    <section className="py-20 md:py-24 bg-gradient-to-br from-[#1E88E5]/10 to-[#26A69A]/5">
      <div className="container px-6 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="grid md:grid-cols-5 gap-0">
              {/* Left side content - 3/5 width */}
              <div className="md:col-span-3 p-8 md:p-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 font-display">
                  Transforme seu Ensino de Inglês Hoje
                </h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
                  Zero custo. Zero risco. Comece a economizar tempo e melhorar os resultados dos seus alunos agora mesmo.
                </p>
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <Link to="/register">
                    <Button size="lg" className="font-medium w-full sm:w-auto px-8 py-6 text-lg bg-[#36B37E] hover:bg-[#36B37E]/90">
                      Comece Gratuitamente
                      <ArrowRight size={20} className="ml-2" />
                    </Button>
                  </Link>
                  <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer">
                    <Button size="lg" variant="outline" className="font-medium w-full sm:w-auto px-8 py-6 text-lg">
                      <MessageSquare size={20} className="mr-2" />
                      Fale Conosco
                    </Button>
                  </a>
                </div>
                <p className="mt-6 text-sm text-muted-foreground">
                  Junte-se a centenas de professores que já estão transformando suas aulas com o HelloPeople
                </p>
                
                <div className="mt-12 pt-8 border-t border-border/60">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-[#36B37E]/10 p-2 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#36B37E]"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Sem cartão de crédito</p>
                        <p className="text-xs text-muted-foreground">Cadastro rápido e gratuito</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-[#1E88E5]/10 p-2 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1E88E5]"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path></svg>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Acesso completo</p>
                        <p className="text-xs text-muted-foreground">A todas as ferramentas</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-[#FF8F00]/10 p-2 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#FF8F00]"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Suporte em português</p>
                        <p className="text-xs text-muted-foreground">Atendimento local</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right side - Testimonial - 2/5 width */}
              <div className="md:col-span-2 bg-gradient-to-br from-[#26A69A]/10 to-[#1E88E5]/10 p-8 md:p-12 flex flex-col justify-center">
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-sm">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-[#F5F7FA] mb-4 overflow-hidden">
                      <img src="/placeholder.svg" alt="Foto de professor" className="w-full h-full object-cover" />
                    </div>
                    <div className="mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" className="text-[#36B37E]/30 mb-2 mx-auto"><path d="M10 11H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1zm0 .3c.7.2 1.1.7 1.2 1.3l.8 4.1A1 1 0 0 1 11 18H7a1 1 0 0 1-1-.9l-.6-4.2A1 1 0 0 1 6.2 12M17 11h-3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1zm0 .3c.7.2 1.1.7 1.2 1.3l.8 4.1a1 1 0 0 1-1 1.3h-4a1 1 0 0 1-1-.9l-.6-4.2a1 1 0 0 1 .8-1.3" stroke="currentColor" fill="currentColor"></path></svg>
                      <p className="text-muted-foreground italic mb-4">
                        Comecei a usar o HelloPeople há 3 meses. Meus alunos praticam mais e aprendem mais rápido. A plataforma realmente transformou meu método de ensino.
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">Carla Mendes</p>
                      <p className="text-sm text-muted-foreground">Professora de Inglês, São Paulo</p>
                    </div>
                    <div className="flex mt-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#FFB400" className="text-yellow-500"><path d="M12 17.8 5.8 21 7 14.1 2 9.3l7-1L12 2l3 6.3 7 1-5 4.8 1.2 6.9-6.2-3.2z"></path></svg>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#FFB400" className="text-yellow-500"><path d="M12 17.8 5.8 21 7 14.1 2 9.3l7-1L12 2l3 6.3 7 1-5 4.8 1.2 6.9-6.2-3.2z"></path></svg>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#FFB400" className="text-yellow-500"><path d="M12 17.8 5.8 21 7 14.1 2 9.3l7-1L12 2l3 6.3 7 1-5 4.8 1.2 6.9-6.2-3.2z"></path></svg>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#FFB400" className="text-yellow-500"><path d="M12 17.8 5.8 21 7 14.1 2 9.3l7-1L12 2l3 6.3 7 1-5 4.8 1.2 6.9-6.2-3.2z"></path></svg>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#FFB400" className="text-yellow-500"><path d="M12 17.8 5.8 21 7 14.1 2 9.3l7-1L12 2l3 6.3 7 1-5 4.8 1.2 6.9-6.2-3.2z"></path></svg>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#1E88E5]"></div>
                  <div className="w-2 h-2 rounded-full bg-[#1E88E5]/30"></div>
                  <div className="w-2 h-2 rounded-full bg-[#1E88E5]/30"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
