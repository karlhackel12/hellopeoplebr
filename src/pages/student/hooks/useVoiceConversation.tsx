
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ConversationMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at?: string;
  timestamp?: string;
}

export const useVoiceConversation = (lessonId?: string, assignmentId?: string) => {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any | null>(null);

  const initConversation = useCallback(async (existingSessionId?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      if (existingSessionId) {
        setConversationId(existingSessionId);
        
        // Fetch existing messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('conversation_messages')
          .select('*')
          .eq('conversation_id', existingSessionId)
          .order('created_at', { ascending: true });
        
        if (messagesError) throw messagesError;
        
        if (messagesData && messagesData.length > 0) {
          setMessages(messagesData);
        }
      } else {
        // New conversation will be created when first message is sent
        setMessages([]);
      }
    } catch (err: any) {
      console.error('Error initializing conversation:', err);
      setError(err.message || 'Failed to initialize conversation');
      toast.error('Failed to initialize conversation');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (
    transcript: string, 
    lessonTopics: string[] = [], 
    vocabularyItems: string[] = [],
    difficulty: number = 1
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      // Get the current authenticated user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error('User not authenticated');

      // Call the voice-conversation edge function
      const { data, error: functionError } = await supabase.functions.invoke(
        'voice-conversation',
        {
          body: {
            userTranscript: transcript,
            conversationId,
            lessonTopics,
            vocabularyItems,
            difficulty,
            userId: userData.user.id,
            lessonId,
            assignmentId
          }
        }
      );

      if (functionError) throw functionError;

      // Update the conversation ID if this was the first message
      if (!conversationId && data.conversationId) {
        setConversationId(data.conversationId);
      }

      // Add the new messages to the local state
      const newUserMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: transcript,
        created_at: new Date().toISOString()
      };

      const newAssistantMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, newUserMessage, newAssistantMessage]);
      
      return data.response;
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message');
      toast.error('Failed to send message');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, lessonId, assignmentId]);

  const endConversation = useCallback(async (
    confidenceScore?: number, 
    lessonId?: string,
    assignmentId?: string
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!conversationId) {
        return false;
      }

      // Get the current authenticated user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error('User not authenticated');

      // Call the voice-conversation edge function to mark as completed
      const { data, error: functionError } = await supabase.functions.invoke(
        'voice-conversation',
        {
          body: {
            markAsCompleted: true,
            conversationId,
            userId: userData.user.id,
            lessonId,
            assignmentId
          }
        }
      );

      if (functionError) throw functionError;

      // Update the UI
      toast.success('Conversation ended successfully');
      return true;
    } catch (err: any) {
      console.error('Error ending conversation:', err);
      setError(err.message || 'Failed to end conversation');
      toast.error('Failed to end conversation');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  const analyzeConversation = useCallback(async () => {
    try {
      if (!conversationId || messages.length < 2) {
        return null;
      }

      // Call analysis function
      const { data, error: functionError } = await supabase.functions.invoke(
        'analyze-conversation',
        {
          body: {
            conversationId
          }
        }
      );

      if (functionError) throw functionError;

      // Update analytics data for the UI
      setAnalyticsData(data);
      return data;
    } catch (err: any) {
      console.error('Error analyzing conversation:', err);
      return null;
    }
  }, [conversationId, messages.length]);

  return {
    messages,
    conversationId,
    isLoading,
    error,
    analyticsData,
    initConversation,
    sendMessage,
    endConversation,
    analyzeConversation
  };
};
