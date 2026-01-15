import type { Message } from '../../types/conversation.types';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '16px',
      animation: isUser ? 'slideInRight 0.3s ease-out' : 'slideInLeft 0.3s ease-out',
    }}>
      <div style={{
        maxWidth: '75%',
        padding: '12px 16px',
        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        backgroundColor: isUser ? 'var(--color-primary)' : 'var(--color-bg-primary)',
        color: isUser ? 'white' : 'var(--color-text-primary)',
        boxShadow: 'var(--shadow-sm)',
        wordWrap: 'break-word',
        border: isUser ? 'none' : '1px solid var(--color-gray-200)',
        transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
      }}>
        <div style={{ 
          fontSize: 'var(--font-size-sm)', 
          lineHeight: 'var(--line-height-relaxed)',
          whiteSpace: 'pre-wrap',
        }}>
          {message.content}
        </div>
        <div style={{
          fontSize: 'var(--font-size-xs)',
          marginTop: 'var(--spacing-xs)',
          opacity: 0.7,
          fontWeight: 'var(--font-weight-medium)',
        }}>
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
}
