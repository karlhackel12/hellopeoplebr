
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, ExternalLink } from 'lucide-react';

const AboutCard: React.FC = () => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="bg-gradient-to-r from-[#D6BCFA] to-[#E9D8FD] text-purple-900">
        <CardTitle className="text-xl flex items-center gap-2">
          <Brain className="h-5 w-5" /> Como Funciona?
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-4 pb-0 flex-grow prose prose-sm max-w-none">
        <p>
          A <strong>Repetição Espaçada</strong> é uma técnica de estudo baseada em como o cérebro memoriza informações a longo prazo.
        </p>
        
        <p>
          Ao revisar os conteúdos em intervalos crescentes de tempo, você fortalece as conexões neurais e evita o esquecimento.
        </p>
        
        <h3 className="text-lg font-medium mt-4 mb-2">Benefícios:</h3>
        <ul className="space-y-1 list-disc pl-5">
          <li>Memorização mais eficiente</li>
          <li>Retenção de longo prazo</li>
          <li>Estudo mais focado</li>
          <li>Economia de tempo</li>
        </ul>
      </CardContent>
      
      <CardFooter className="mt-auto pt-4">
        <Button variant="outline" className="w-full" asChild>
          <a href="https://pt.wikipedia.org/wiki/Repetição_espaçada" target="_blank" rel="noopener noreferrer">
            Saiba Mais <ExternalLink className="ml-1 h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AboutCard;
