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
      padding: '20px',
      backgroundColor: '#fafafa',
    }}>
      {messages.length === 0 ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          color: '#999',
          fontSize: '16px',
        }}>
          Start a conversation to build your website
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <LoadingSpinner />
            </div>
          )}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
}
