import { useState } from 'react';
import type { KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);

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
      gap: 'var(--spacing-md)',
      padding: 'var(--spacing-lg) var(--spacing-2xl)',
      borderTop: '1px solid var(--color-gray-200)',
      backgroundColor: 'var(--color-bg-primary)',
      boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.05)',
    }}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={disabled}
        placeholder={disabled ? 'Sending...' : 'Type your message...'}
        style={{
          flex: 1,
          padding: 'var(--spacing-md) var(--spacing-lg)',
          border: `2px solid ${isFocused ? 'var(--color-primary)' : 'var(--color-gray-200)'}`,
          borderRadius: 'var(--radius-lg)',
          fontSize: 'var(--font-size-sm)',
          outline: 'none',
          transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
          backgroundColor: disabled ? 'var(--color-gray-100)' : 'var(--color-bg-primary)',
          color: 'var(--color-text-primary)',
          boxShadow: isFocused ? '0 0 0 3px var(--color-primary-light)' : 'none',
        }}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !input.trim()}
        style={{
          padding: 'var(--spacing-md) var(--spacing-2xl)',
          backgroundColor: disabled || !input.trim() ? 'var(--color-gray-300)' : 'var(--color-primary)',
          color: 'white',
          border: 'none',
          borderRadius: 'var(--radius-lg)',
          cursor: disabled || !input.trim() ? 'not-allowed' : 'pointer',
          fontSize: 'var(--font-size-sm)',
          fontWeight: 'var(--font-weight-semibold)',
          transition: 'all var(--transition-fast)',
          boxShadow: disabled || !input.trim() ? 'none' : 'var(--shadow-sm)',
          transform: disabled || !input.trim() ? 'none' : 'translateY(0)',
        }}
        onMouseEnter={(e) => {
          if (!disabled && input.trim()) {
            e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && input.trim()) {
            e.currentTarget.style.backgroundColor = 'var(--color-primary)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          }
        }}
      >
        Send
      </button>
    </div>
  );
}
