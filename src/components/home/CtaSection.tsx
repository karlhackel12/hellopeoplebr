
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const CtaSection: React.FC = () => {
  return (
    <section className="py-20 md:py-24 bg-gradient-to-br from-[#1E88E5]/10 to-[#26A69A]/5">
      <div className="container px-6 md:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-display">
              Transforme seu Ensino de Inglês Hoje
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Zero custo. Zero risco. Comece a economizar tempo e aumentar sua renda.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="font-medium w-full sm:w-auto px-8 py-6 text-lg bg-[#FF8F00] hover:bg-[#FF8F00]/90">
                  Comece Gratuitamente
                  <ArrowRight size={20} className="ml-2" />
                </Button>
              </Link>
              <a href="https://wa.me/5511999999999">
                <Button size="lg" variant="outline" className="font-medium w-full sm:w-auto px-8 py-6 text-lg">
                  Fale Conosco
                </Button>
              </a>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Junte-se a centenas de professores que já estão transformando suas aulas com o HelloPeople
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
