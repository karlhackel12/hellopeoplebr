
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/ui/Logo';
import { Instagram, Tiktok, MessageCircle } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = [
    {
      title: 'Plataforma',
      links: [
        { label: 'Recursos', href: '/#recursos' },
        { label: 'Como Funciona', href: '/#como-funciona' },
        { label: 'Preços', href: '/#precos' },
      ],
    },
    {
      title: 'Recursos',
      links: [
        { label: 'Blog', href: '/blog' },
        { label: 'Central de Ajuda', href: '/ajuda' },
        { label: 'Fale Conosco', href: 'https://wa.me/5511999999999' },
      ],
    },
    {
      title: 'Empresa',
      links: [
        { label: 'Sobre Nós', href: '/sobre' },
        { label: 'Carreiras', href: '/carreiras' },
        { label: 'Política de Privacidade', href: '/privacidade' },
        { label: 'Termos de Uso', href: '/termos' },
      ],
    },
  ];

  return (
    <footer className="border-t border-border bg-[#F5F7FA]">
      <div className="container px-6 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 text-muted-foreground max-w-md">
              Revolucione suas aulas de inglês com nossa plataforma de IA que economiza horas de preparação, melhora os resultados dos alunos e aumenta sua renda mensal.
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="https://tiktok.com/@hellopeople" className="text-muted-foreground hover:text-[#1E88E5] transition-colors">
                <Tiktok size={24} />
              </a>
              <a href="https://instagram.com/hellopeople" className="text-muted-foreground hover:text-[#1E88E5] transition-colors">
                <Instagram size={24} />
              </a>
              <a href="https://wa.me/5511999999999" className="text-muted-foreground hover:text-[#1E88E5] transition-colors">
                <MessageCircle size={24} />
              </a>
            </div>
          </div>
          
          <div className="col-span-1 lg:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {footerLinks.map((section) => (
                <div key={section.title}>
                  <h3 className="font-medium mb-4">{section.title}</h3>
                  <ul className="space-y-3">
                    {section.links.map((link) => (
                      <li key={link.label}>
                        <a 
                          href={link.href} 
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} HelloPeople Brazil. Todos os direitos reservados.
          </p>
          <div className="flex space-x-4">
            <Link to="/termos" className="text-sm text-muted-foreground hover:text-foreground">
              Termos de Uso
            </Link>
            <Link to="/privacidade" className="text-sm text-muted-foreground hover:text-foreground">
              Política de Privacidade
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
