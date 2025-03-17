
import React from 'react';
import { Construction } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const VoicePracticeConstruction: React.FC = () => {
  return (
    <div className="container px-4 py-8 max-w-4xl mx-auto">
      <Card className="border-2 border-primary/20 shadow-md">
        <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <Construction className="h-16 w-16 text-primary mb-6" />
          <h1 className="text-2xl font-bold mb-2">Em Construção</h1>
          <p className="text-muted-foreground mb-6 max-w-md">
            Estamos trabalhando para trazer o recurso de prática de voz em breve.
            Volte em breve para experimentar esta funcionalidade!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoicePracticeConstruction;
