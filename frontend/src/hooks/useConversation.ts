import { useState, useCallback } from 'react';
import type { Message } from '../types/conversation.types';
import type { ApiError } from '../types/api.types';
import { conversationApi } from '../api/conversationApi';

/**
 * Hook to manage conversation state and interactions
 */
export function useConversation(sessionId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  /**
   * Send a user message and get AI response
   */
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      // Clear any previous errors
      setError(null);
      
      // Add user message immediately
      const userMessage: Message = {
        id: `msg_${Date.now()}_user`,
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);

      try {
        // Call API to get AI response
        const response = await conversationApi.sendMessage(sessionId, content.trim());

        if (response.error) {
          setError(response.error);
          setIsLoading(false);
          return;
        }

        if (response.data) {
          // Add AI message
          const aiMessage: Message = {
            id: `msg_${Date.now()}_assistant`,
            role: 'assistant',
            content: response.data.response,
            timestamp: new Date(response.data.timestamp || Date.now()),
          };
          
          setMessages(prev => [...prev, aiMessage]);
        }
      } catch (err) {
        const apiError: ApiError = {
          message: err instanceof Error ? err.message : 'Failed to send message',
          details: err,
        };
        setError(apiError);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, isLoading]
  );

  /**
   * Clear all messages
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
}
