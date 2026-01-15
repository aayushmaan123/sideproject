import { useEffect, useRef } from 'react';
import type { Message } from '../../types/conversation.types';
import ChatMessage from './ChatMessage';
import LoadingSpinner from '../common/LoadingSpinner';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
}

export default function ChatWindow({ messages, isLoading }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      padding: 'var(--spacing-2xl)',
      backgroundColor: 'var(--color-gray-50)',
      backgroundImage: 'linear-gradient(to bottom, var(--color-gray-50) 0%, var(--color-bg-secondary) 100%)',
    }}>
      {messages.length === 0 ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          color: 'var(--color-text-tertiary)',
          fontSize: 'var(--font-size-lg)',
          textAlign: 'center',
          padding: 'var(--spacing-2xl)',
        }}>
          <div style={{
            fontSize: 'var(--font-size-4xl)',
            marginBottom: 'var(--spacing-lg)',
          }}>
            💬
          </div>
          <p style={{ 
            margin: 0, 
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text-secondary)',
          }}>
            Start a conversation to build your website
          </p>
          <p style={{ 
            margin: 'var(--spacing-sm) 0 0 0',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-tertiary)',
          }}>
            Tell me about your business and requirements
          </p>
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 'var(--spacing-md)' }}>
              <LoadingSpinner />
            </div>
          )}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
}
