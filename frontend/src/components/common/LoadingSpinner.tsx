export default function LoadingSpinner() {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--spacing-sm)',
      padding: 'var(--spacing-md) var(--spacing-lg)',
      backgroundColor: 'var(--color-bg-primary)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{
        width: '20px',
        height: '20px',
        border: '3px solid var(--color-gray-200)',
        borderTop: '3px solid var(--color-primary)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <span style={{
        fontSize: 'var(--font-size-sm)',
        color: 'var(--color-text-secondary)',
        fontWeight: 'var(--font-weight-medium)',
      }}>
        Thinking...
      </span>
    </div>
  );
}
