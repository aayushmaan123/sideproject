export default function TypingIndicator() {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--spacing-sm)',
      padding: 'var(--spacing-md) var(--spacing-lg)',
      backgroundColor: 'var(--color-bg-primary)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-gray-200)',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
        <div style={{
          width: '8px',
          height: '8px',
          backgroundColor: 'var(--color-gray-400)',
          borderRadius: '50%',
          animation: 'typingDot 1.4s infinite',
          animationDelay: '0s',
        }} />
        <div style={{
          width: '8px',
          height: '8px',
          backgroundColor: 'var(--color-gray-400)',
          borderRadius: '50%',
          animation: 'typingDot 1.4s infinite',
          animationDelay: '0.2s',
        }} />
        <div style={{
          width: '8px',
          height: '8px',
          backgroundColor: 'var(--color-gray-400)',
          borderRadius: '50%',
          animation: 'typingDot 1.4s infinite',
          animationDelay: '0.4s',
        }} />
      </div>
      <style>{`
        @keyframes typingDot {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.7;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
