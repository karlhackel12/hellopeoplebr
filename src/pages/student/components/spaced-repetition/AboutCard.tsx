
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Trophy, Clock, Info } from 'lucide-react';

const AboutCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Info className="h-5 w-5" /> Sobre Repetição Espaçada
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 text-sm">
          <p>
            <strong>Repetição Espaçada</strong> é uma técnica de aprendizado que incorpora intervalos crescentes 
            entre revisões de material previamente aprendido para explorar o efeito psicológico do espaçamento.
          </p>
          <div className="flex items-start gap-2">
            <Brain className="h-5 w-5 text-purple-500 mt-1 flex-shrink-0" />
            <p>
              O sistema agenda automaticamente revisões com base em quão bem você se lembra de cada item, 
              mostrando conteúdo difícil com mais frequência e conteúdo fácil com menos frequência.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Trophy className="h-5 w-5 text-amber-500 mt-1 flex-shrink-0" />
            <p>
              Ganhe pontos para cada questão respondida corretamente. Quanto mais rápido você responder e 
              melhor for sua recordação, mais pontos receberá.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
            <p>
              Apenas alguns minutos de revisão por dia podem melhorar drasticamente sua retenção 
              de longo prazo do material, em comparação com estudar tudo de uma vez.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AboutCard;
