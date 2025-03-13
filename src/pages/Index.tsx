
import React from 'react';
import { Helmet } from 'react-helmet';
import Hero from '@/components/home/Hero';
import Benefits from '@/components/home/Benefits';
import HowItWorks from '@/components/home/HowItWorks';
import Features from '@/components/home/Features';
import Testimonials from '@/components/home/Testimonials';
import Pricing from '@/components/home/Pricing';
import Faq from '@/components/home/Faq';
import CtaSection from '@/components/home/CtaSection';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';

const Index: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>HelloPeople - Prática de Inglês Para Além da Sala de Aula</title>
        <meta name="description" content="Ajude seus alunos a alcançarem fluência mais rápido com prática personalizada entre as aulas enquanto ganha renda adicional. Plataforma 100% gratuita para professores de inglês." />
        <meta name="keywords" content="professores de inglês, ensino com IA, ferramentas para professores de inglês, IA para ensino de inglês, gamificação, repetição espaçada" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://hellopeople.com.br/" />
        <meta property="og:title" content="HelloPeople - Prática de Inglês Para Além da Sala de Aula" />
        <meta property="og:description" content="Ajude seus alunos a alcançarem fluência mais rápido com prática personalizada entre as aulas enquanto ganha renda adicional." />
        <meta property="og:image" content="/og-image.png" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://hellopeople.com.br/" />
        <meta property="twitter:title" content="HelloPeople - Prática de Inglês Para Além da Sala de Aula" />
        <meta property="twitter:description" content="Ajude seus alunos a alcançarem fluência mais rápido com prática personalizada entre as aulas enquanto ganha renda adicional." />
        <meta property="twitter:image" content="/og-image.png" />
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Hero />
          <Benefits />
          <HowItWorks />
          <Features />
          <Testimonials />
          <Pricing />
          <Faq />
          <CtaSection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
