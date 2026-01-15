import { useState } from 'react';
import type { KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input);
      setInput('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      padding: '12px',
      borderTop: '1px solid #ddd',
      backgroundColor: 'white',
    }}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={disabled}
        placeholder={disabled ? 'Sending...' : 'Type your message...'}
        style={{
          flex: 1,
          padding: '10px 14px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          fontSize: '14px',
          outline: 'none',
        }}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !input.trim()}
        style={{
          padding: '10px 20px',
          backgroundColor: disabled || !input.trim() ? '#ccc' : '#646cff',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: disabled || !input.trim() ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: '500',
        }}
      >
        Send
      </button>
    </div>
  );
}
