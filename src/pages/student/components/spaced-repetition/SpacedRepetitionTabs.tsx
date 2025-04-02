
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import ItemsList from './ItemsList';

interface SpacedRepetitionTabsProps {
  dueItems: any[];
  allItems: any[];
  isLoading: boolean;
}

const SpacedRepetitionTabs: React.FC<SpacedRepetitionTabsProps> = ({ 
  dueItems, 
  allItems,
  isLoading 
}) => {
  return (
    <Tabs defaultValue="due">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="due">Itens Pendentes</TabsTrigger>
        <TabsTrigger value="all">Todos os Itens</TabsTrigger>
      </TabsList>
      
      <TabsContent value="due" className="mt-0">
        <Card className="p-0 border-0">
          <ItemsList 
            items={dueItems} 
            emptyMessage="Não há itens pendentes para revisão"
            isLoading={isLoading}
          />
        </Card>
      </TabsContent>
      
      <TabsContent value="all" className="mt-0">
        <Card className="p-0 border-0">
          <ItemsList 
            items={allItems} 
            emptyMessage="Você ainda não tem itens de repetição espaçada"
            isLoading={isLoading}
          />
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default SpacedRepetitionTabs;
