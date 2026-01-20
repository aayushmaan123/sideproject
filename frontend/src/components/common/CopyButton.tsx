import { useState } from 'react';

interface CopyButtonProps {
  text: string;
  onCopy?: () => void;
}

export default function CopyButton({ text, onCopy }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      aria-label="Copy message to clipboard"
      title={copied ? 'Copied!' : 'Copy to clipboard'}
      style={{
        padding: 'var(--spacing-xs) var(--spacing-sm)',
        backgroundColor: 'transparent',
        border: '1px solid var(--color-gray-300)',
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        fontSize: 'var(--font-size-xs)',
        color: 'var(--color-text-secondary)',
        transition: 'all var(--transition-fast)',
        opacity: 0.7,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = '1';
        e.currentTarget.style.backgroundColor = 'var(--color-gray-100)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = '0.7';
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {copied ? '✓ Copied' : '📋 Copy'}
    </button>
  );
}
