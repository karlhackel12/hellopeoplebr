
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format, isPast, isToday, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';

interface ItemsListProps {
  items: any[];
  emptyMessage: string;
  isLoading: boolean;
}

const ItemsList: React.FC<ItemsListProps> = ({ items, emptyMessage, isLoading }) => {
  if (isLoading) {
    return <div className="p-4 text-center">Carregando...</div>;
  }

  if (!items || items.length === 0) {
    return (
      <div className="p-6 text-center">
        <Brain className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  const getReviewStatus = (nextReviewAt: string) => {
    if (!nextReviewAt) return null;
    
    const reviewDate = parseISO(nextReviewAt);
    
    if (isPast(reviewDate)) {
      return <Badge className="bg-[#9b87f5]">Atrasado</Badge>;
    }
    
    if (isToday(reviewDate)) {
      return <Badge className="bg-[#9b87f5]">Hoje</Badge>;
    }
    
    return (
      <Badge variant="outline" className="border-[#9b87f5] text-[#9b87f5]">
        {format(reviewDate, "d 'de' MMMM", { locale: pt })}
      </Badge>
    );
  };

  return (
    <div className="space-y-3 p-1">
      {items.map((item) => (
        <Card key={item.id} className="overflow-hidden">
          <CardContent className="p-4 flex justify-between items-center">
            <div className="flex-1">
              <h3 className="font-medium mb-1">
                {item.question?.text || item.question?.question_text || 'Questão sem texto'}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {item.question?.options?.find((o: any) => o.is_correct)?.text || 
                 item.question?.options?.find((o: any) => o.is_correct)?.option_text || 
                 'Sem resposta'}
              </p>
            </div>
            <div className="ml-4">
              {getReviewStatus(item.next_review_at || item.next_review_date)}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ItemsList;
