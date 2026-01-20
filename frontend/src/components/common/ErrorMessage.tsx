interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
}

export default function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  return (
    <div style={{
      backgroundColor: '#FEE2E2',
      border: '1px solid #FCA5A5',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--spacing-md) var(--spacing-lg)',
      margin: 'var(--spacing-md) 0',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 'var(--spacing-md)',
      boxShadow: 'var(--shadow-sm)',
      animation: 'slideInUp 0.3s ease-out',
    }}>
      <span style={{ 
        fontSize: 'var(--font-size-lg)', 
        flexShrink: 0,
      }}>
        ⚠️
      </span>
      <div style={{ flex: 1 }}>
        <p style={{ 
          margin: 0,
          color: '#991B1B',
          fontSize: 'var(--font-size-sm)',
          fontWeight: 'var(--font-weight-medium)',
          lineHeight: 'var(--line-height-normal)',
        }}>
          {message}
        </p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#991B1B',
            cursor: 'pointer',
            fontSize: 'var(--font-size-xl)',
            padding: '0',
            lineHeight: 1,
            flexShrink: 0,
            transition: 'opacity var(--transition-fast)',
            opacity: 0.7,
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
        >
          ×
        </button>
      )}
    </div>
  );
}
