import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { useVoicePractice } from '@/hooks/useVoicePractice';
import VoiceChatComponent from '@/components/student/voice-chat/VoiceChatComponent';
import VoicePracticeHistory from '@/components/student/voice-chat/VoicePracticeHistory';

/**
 * Página principal de prática de conversação
 */
const VoicePractice: React.FC = () => {
  const { 
    sessions, 
    assignedLessons,  
    isLoadingSessions, 
    isLoadingAssignedLessons 
  } = useVoicePractice();

  if (isLoadingSessions || isLoadingAssignedLessons) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Prática de Conversação</CardTitle>
          <CardDescription>
            Pratique seu inglês através de conversas com nosso assistente de voz
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="new-conversation" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-2">
          <TabsTrigger value="new-conversation">Nova Conversa</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>
        
        <TabsContent value="new-conversation">
          <VoiceChatComponent assignedLessons={assignedLessons || []} />
        </TabsContent>
        
        <TabsContent value="history">
          <VoicePracticeHistory sessions={sessions || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VoicePractice;
