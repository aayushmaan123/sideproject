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
      marginBottom: '12px',
    }}>
      <div style={{
        maxWidth: '70%',
        padding: '10px 14px',
        borderRadius: '12px',
        backgroundColor: isUser ? '#646cff' : '#f3f3f3',
        color: isUser ? 'white' : '#333',
        wordWrap: 'break-word',
      }}>
        <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
          {message.content}
        </div>
        <div style={{
          fontSize: '11px',
          marginTop: '4px',
          opacity: 0.7,
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
