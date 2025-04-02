
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Logo from '@/components/ui/Logo';
import { useIsMobile } from '@/hooks/use-mobile';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { title: 'Benefícios', href: '/#beneficios' },
    { title: 'Como Funciona', href: '/#como-funciona' },
    { title: 'Recursos', href: '/#recursos' },
    { title: 'Preços', href: '/#precos' },
    { title: 'FAQ', href: '/#faq' },
  ];

  // Check if we're on the homepage
  const isHomePage = location.pathname === '/';

  return (
    <header 
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 sm:px-6 md:px-8',
        isScrolled ? 'py-2 sm:py-3 glass' : 'py-3 sm:py-5 bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Logo />
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
          <ul className="flex items-center space-x-3 lg:space-x-6">
            {navLinks.map((link) => (
              <li key={link.title}>
                <a 
                  href={isHomePage ? link.href.replace('/', '') : link.href} 
                  className="text-sm lg:text-base text-foreground/80 hover:text-foreground transition-colors"
                >
                  {link.title}
                </a>
              </li>
            ))}
          </ul>
          
          <div className="flex items-center space-x-2 lg:space-x-4">
            <Link to="/login">
              <Button variant="outline" size="sm" className="text-xs lg:text-sm font-medium">
                Entrar
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="text-xs lg:text-sm font-medium bg-[#36B37E] hover:bg-[#36B37E]/90">
                Comece Grátis
              </Button>
            </Link>
          </div>
        </nav>
        
        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center space-x-2">
          <Link to="https://wa.me/5511999999999" className="mr-1 sm:mr-2">
            <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 text-[#26A69A]">
              <MessageCircle size={isMobile ? 16 : 20} />
            </Button>
          </Link>
          <Button
            variant="ghost" 
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
            className="h-8 w-8 sm:h-9 sm:w-9"
          >
            {isMobileMenuOpen ? <X size={isMobile ? 18 : 24} /> : <Menu size={isMobile ? 18 : 24} />}
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-background/95 backdrop-blur-md border-b border-border animate-slide-down">
          <div className="px-4 sm:px-6 py-4 sm:py-6">
            <ul className="flex flex-col space-y-3 sm:space-y-5 mb-4 sm:mb-6">
              {navLinks.map((link) => (
                <li key={link.title}>
                  <a 
                    href={isHomePage ? link.href.replace('/', '') : link.href}
                    className="text-foreground/80 hover:text-foreground block py-1 text-sm sm:text-base"
                  >
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
            <div className="flex flex-col space-y-2 sm:space-y-3">
              <Link to="/login" className="w-full">
                <Button variant="outline" className="w-full text-sm">
                  Entrar
                </Button>
              </Link>
              <Link to="/register" className="w-full">
                <Button className="w-full bg-[#36B37E] hover:bg-[#36B37E]/90 text-sm">
                  Comece Grátis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
