
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, Book } from 'lucide-react';

interface ItemsListProps {
  items: any[];
  emptyMessage: string;
  isLoading: boolean;
}

const ItemsList: React.FC<ItemsListProps> = ({ items, emptyMessage, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg">
        <div className="flex justify-center mb-2">
          <Brain className="h-12 w-12 text-muted-foreground/50" />
        </div>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const questionText = item.question?.question_text || 'Conteúdo da lição';
        const title = item.question ? 'Pergunta' : (item.lesson?.title || 'Lição');
        const date = new Date(item.next_review_date);
        const formattedDate = format(date, "dd 'de' MMMM", { locale: ptBR });
        const isToday = new Date().toDateString() === date.toDateString();
        const isPast = date < new Date() && !isToday;

        return (
          <div key={item.id} className="border rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {item.question ? (
                    <Brain className="h-4 w-4 text-purple-500" />
                  ) : (
                    <Book className="h-4 w-4 text-blue-500" />
                  )}
                  <span className="font-medium text-sm">{title}</span>
                </div>
                <p className="text-sm line-clamp-2">{questionText}</p>
              </div>
              
              <Badge variant={isPast ? "destructive" : (isToday ? "default" : "secondary")}>
                {isToday ? 'Hoje' : (isPast ? 'Atrasado' : formattedDate)}
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ItemsList;
