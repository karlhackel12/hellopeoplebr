
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

const AboutCard: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sobre a Repetição Espaçada</CardTitle>
        <CardDescription>
          Memorização eficiente com base em ciência cognitiva
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>
          A repetição espaçada é uma técnica de aprendizado que utiliza intervalos crescentes de tempo entre as revisões
          para ajudar na memorização a longo prazo.
        </p>
        <p>
          Os itens que você acerta com facilidade serão revisados com menos frequência, enquanto os itens difíceis 
          aparecerão mais vezes até que você os domine.
        </p>
        <div className="flex justify-center mt-2">
          <Button variant="outline" asChild>
            <a 
              href="https://en.wikipedia.org/wiki/Spaced_repetition" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              Saiba mais <ExternalLink size={16} />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AboutCard;
