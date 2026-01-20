import { useConnectionStatus } from '../../hooks/useConnectionStatus';

export default function ConnectionStatusIndicator() {
  const { status, isConnected, checkConnection } = useConnectionStatus();

  if (status === 'checking') {
    return (
      <div style={{
        padding: 'var(--spacing-xs) var(--spacing-md)',
        backgroundColor: 'var(--color-warning)',
        color: 'white',
        fontSize: 'var(--font-size-xs)',
        borderRadius: 'var(--radius-full)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-xs)',
        fontWeight: 'var(--font-weight-medium)',
      }}>
        <span style={{ fontSize: '10px' }}>⏳</span>
        Checking...
      </div>
    );
  }

  if (isConnected) {
    return (
      <div style={{
        padding: 'var(--spacing-xs) var(--spacing-md)',
        backgroundColor: 'var(--color-success)',
        color: 'white',
        fontSize: 'var(--font-size-xs)',
        borderRadius: 'var(--radius-full)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-xs)',
        fontWeight: 'var(--font-weight-medium)',
      }}>
        <span style={{ fontSize: '10px' }}>●</span>
        Live API
      </div>
    );
  }

  return (
    <button
      onClick={checkConnection}
      aria-label="Reconnect to backend API"
      title="Click to retry connection"
      style={{
        padding: 'var(--spacing-xs) var(--spacing-md)',
        backgroundColor: 'var(--color-gray-600)',
        color: 'white',
        fontSize: 'var(--font-size-xs)',
        borderRadius: 'var(--radius-full)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-xs)',
        fontWeight: 'var(--font-weight-medium)',
        border: 'none',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-gray-700)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-gray-600)';
      }}
    >
      <span style={{ fontSize: '10px' }}>●</span>
      Mock Mode (Click to retry)
    </button>
  );
}
