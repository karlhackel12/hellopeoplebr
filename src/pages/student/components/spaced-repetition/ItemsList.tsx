
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, List } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type ItemsListProps = {
  items: any[] | null;
  isLoading: boolean;
  emptyTitle: string;
  emptyDescription: string;
  icon: 'calendar' | 'list';
};

const ItemsList: React.FC<ItemsListProps> = ({ 
  items, 
  isLoading, 
  emptyTitle, 
  emptyDescription,
  icon 
}) => {
  const IconComponent = icon === 'calendar' ? Calendar : List;

  if (isLoading) {
    return (
      <div className="py-8 flex justify-center items-center">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="h-4 w-3/4 bg-slate-200 rounded"></div>
              <div className="h-3 w-1/2 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <IconComponent className="h-6 w-6 text-slate-500" />
        </div>
        <h3 className="text-lg font-medium mb-1">{emptyTitle}</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {emptyDescription}
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {items.map((item) => (
        <div key={item.id} className="py-3 flex justify-between items-center">
          <div>
            <h3 className="font-medium">
              {item.question?.question_text || item.lesson?.title || 'Unnamed item'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {icon === 'calendar' ? 'Due: ' : 'Next review: '}
              {formatDistanceToNow(new Date(item.next_review_date), { addSuffix: true })}
            </p>
          </div>
          <div className="text-sm">
            Difficulty: {Math.round(item.difficulty * 100) / 100}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ItemsList;
