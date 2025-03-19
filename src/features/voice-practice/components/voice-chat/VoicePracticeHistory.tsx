import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { VoicePracticeSession } from '@/types/voice';

interface VoicePracticeHistoryProps {
  sessions: VoicePracticeSession[];
}

/**
 * Componente que exibe o histórico de sessões de prática de conversação
 */
const VoicePracticeHistory: React.FC<VoicePracticeHistoryProps> = ({ sessions }) => {
  if (!sessions || sessions.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-muted-foreground">
          Você ainda não realizou nenhuma prática de conversação.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Histórico de Prática</h2>
      
      {sessions.map((session) => {
        const startedAt = new Date(session.started_at);
        const completedAt = session.completed_at ? new Date(session.completed_at) : null;
        const duration = session.duration_seconds
          ? `${Math.floor(session.duration_seconds / 60)}m ${session.duration_seconds % 60}s`
          : 'Em andamento';
          
        const difficultyLabel = ['Iniciante', 'Intermediário', 'Avançado'][
          Math.min(2, Math.max(0, session.difficulty_level - 1))
        ];
        
        return (
          <Card key={session.id} className="hover:bg-accent/5 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{session.topic}</CardTitle>
                  <CardDescription>
                    {format(startedAt, "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}
                  </CardDescription>
                </div>
                <Badge variant={completedAt ? 'default' : 'outline'}>
                  {completedAt ? 'Concluído' : 'Em andamento'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Duração:</span>
                  <p>{duration}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Nível:</span>
                  <p>{difficultyLabel}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Lição:</span>
                  <p>{session.lesson?.title || 'Prática livre'}</p>
                </div>
              </div>
              
              {session.vocabulary_used && session.vocabulary_used.length > 0 && (
                <div className="mt-4">
                  <span className="text-sm font-medium text-muted-foreground">Vocabulário:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {session.vocabulary_used.slice(0, 5).map((word, index) => (
                      <Badge key={index} variant="secondary">{word}</Badge>
                    ))}
                    {session.vocabulary_used.length > 5 && (
                      <Badge variant="secondary">+{session.vocabulary_used.length - 5}</Badge>
                    )}
                  </div>
                </div>
              )}
              
              {session.analytics_data && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="text-md font-semibold mb-2">Análise de desempenho</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {session.analytics_data.fluency_score && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Fluência:</span>
                        <p>{session.analytics_data.fluency_score}/10</p>
                      </div>
                    )}
                    {session.analytics_data.grammar_quality && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Gramática:</span>
                        <p>{session.analytics_data.grammar_quality}/10</p>
                      </div>
                    )}
                    {session.analytics_data.vocabulary_count && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Palavras únicas:</span>
                        <p>{session.analytics_data.vocabulary_count}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default VoicePracticeHistory; 