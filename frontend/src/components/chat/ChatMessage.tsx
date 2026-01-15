import { useState, memo } from 'react';
import type { Message } from '../../types/conversation.types';
import CopyButton from '../common/CopyButton';

interface ChatMessageProps {
  message: Message;
}

function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [showCopy, setShowCopy] = useState(false);
  
  return (
    <div 
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '16px',
        animation: isUser ? 'slideInRight 0.3s ease-out' : 'slideInLeft 0.3s ease-out',
      }}
      onMouseEnter={() => setShowCopy(true)}
      onMouseLeave={() => setShowCopy(false)}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', gap: 'var(--spacing-xs)' }}>
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
        {showCopy && !isUser && (
          <div style={{ opacity: showCopy ? 1 : 0, transition: 'opacity var(--transition-fast)' }}>
            <CopyButton text={message.content} />
          </div>
        )}
      </div>
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(ChatMessage, (prevProps, nextProps) => {
  return prevProps.message.id === nextProps.message.id &&
         prevProps.message.content === nextProps.message.content;
});
