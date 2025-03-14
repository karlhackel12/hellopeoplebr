
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useUser } from './spaced-repetition/useUser';

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export const useVoiceConversation = (lessonId?: string) => {
  const { userId } = useUser();
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize or load an existing conversation
  const initConversation = useCallback(async (existingConversationId?: string) => {
    if (!userId) {
      toast.error('Please sign in to use the conversation feature');
      return false;
    }

    setIsLoading(true);
    try {
      if (existingConversationId) {
        // Load existing conversation
        const { data, error } = await supabase
          .from('conversation_messages')
          .select('role, content, created_at')
          .eq('conversation_id', existingConversationId)
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        
        if (data) {
          setMessages(data.map(msg => ({
            role: msg.role as 'user' | 'assistant' | 'system',
            content: msg.content,
            timestamp: msg.created_at
          })));
          setConversationId(existingConversationId);
        }
      } else {
        // New conversation
        setMessages([]);
        setConversationId(null);
      }
      return true;
    } catch (error) {
      console.error('Error initializing conversation:', error);
      toast.error('Failed to load the conversation');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Send message to AI
  const sendMessage = useCallback(async (
    userTranscript: string, 
    lessonTopics: string[] = [], 
    vocabularyItems: string[] = [],
    difficulty: number = 1
  ) => {
    if (!userId) {
      toast.error('Please sign in to use the conversation feature');
      return null;
    }

    setIsLoading(true);
    try {
      // Add user message to local state immediately for UI responsiveness
      setMessages(prev => [
        ...prev, 
        { 
          role: 'user', 
          content: userTranscript,
          timestamp: new Date().toISOString()
        }
      ]);

      // Call the edge function
      const { data, error } = await supabase.functions.invoke('voice-conversation', {
        body: {
          userTranscript,
          conversationId,
          lessonTopics,
          vocabularyItems,
          difficulty,
          userId
        }
      });

      if (error) throw error;
      
      // Set the conversation ID if it's a new conversation
      if (data?.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }

      // Add AI response to local state
      if (data?.response) {
        setMessages(prev => [
          ...prev, 
          { 
            role: 'assistant', 
            content: data.response,
            timestamp: new Date().toISOString()
          }
        ]);
      }

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId, conversationId]);

  // End the conversation and update stats
  const endConversation = useCallback(async (confidenceScore?: number) => {
    if (!conversationId || !userId) return false;
    
    try {
      // Update conversation session
      const { error } = await supabase
        .from('conversation_sessions')
        .update({
          completed_at: new Date().toISOString(),
          speaking_confidence: confidenceScore || null
        })
        .eq('id', conversationId)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error ending conversation:', error);
      toast.error('Failed to save conversation data');
      return false;
    }
  }, [conversationId, userId]);

  return {
    messages,
    conversationId,
    isLoading,
    initConversation,
    sendMessage,
    endConversation
  };
};
