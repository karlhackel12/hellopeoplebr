
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/ui/Logo';
import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = [
    {
      title: 'Platform',
      links: [
        { label: 'Features', href: '/#features' },
        { label: 'How It Works', href: '/#how-it-works' },
        { label: 'Pricing', href: '/#pricing' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Blog', href: '/blog' },
        { label: 'Help Center', href: '/help' },
        { label: 'Contact Us', href: '/contact' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '/about' },
        { label: 'Careers', href: '/careers' },
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
      ],
    },
  ];

  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="container px-6 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo size="lg" />
            <p className="mt-4 text-muted-foreground max-w-md">
              Learn languages naturally with AI-powered conversations and personalized feedback
              to achieve fluency faster than traditional methods.
            </p>
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
            &copy; {currentYear} HelloPeople. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground flex items-center">
            Made with <Heart size={14} className="mx-1 text-primary" /> for language learners worldwide
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
