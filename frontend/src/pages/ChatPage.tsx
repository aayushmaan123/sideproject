import { useNavigate } from 'react-router-dom';
import { useSession } from '../hooks/useSession';
import { useConversation } from '../hooks/useConversation';
import { useRequirements } from '../hooks/useRequirements';
import ChatWindow from '../components/chat/ChatWindow';
import ChatInput from '../components/chat/ChatInput';
import ErrorMessage from '../components/common/ErrorMessage';
import ThemeToggle from '../components/common/ThemeToggle';
import ConnectionStatusIndicator from '../components/common/ConnectionStatusIndicator';

export default function ChatPage() {
  const navigate = useNavigate();
  const { sessionId } = useSession();
  const { messages, isLoading, error, sendMessage } = useConversation(sessionId);
  const { extractRequirements, isLoading: isExtracting } = useRequirements(sessionId);

  const handleExtractRequirements = async () => {
    await extractRequirements();
    navigate('/requirements');
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      maxWidth: '1000px',
      margin: '0 auto',
      backgroundColor: 'var(--color-bg-primary)',
      boxShadow: 'var(--shadow-lg)',
    }}>
      {/* Header */}
      <div style={{
        padding: 'var(--spacing-xl) var(--spacing-2xl)',
        borderBottom: '1px solid var(--color-gray-200)',
        backgroundColor: 'var(--color-bg-primary)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 'var(--spacing-md)',
      }}>
        <div>
          <h1 style={{ 
            margin: 0, 
            fontSize: 'var(--font-size-2xl)', 
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-sm)',
          }}>
            <span style={{ fontSize: 'var(--font-size-3xl)' }}>🤖</span>
            AI Website Builder
          </h1>
          <p style={{ 
            margin: 'var(--spacing-xs) 0 0 0', 
            fontSize: 'var(--font-size-sm)', 
            color: 'var(--color-text-secondary)',
          }}>
            Tell me about your website needs
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center', flexWrap: 'wrap' }}>
          <ConnectionStatusIndicator />
          <ThemeToggle />
          <button
            onClick={handleExtractRequirements}
            disabled={messages.length === 0 || isExtracting}
            aria-label="View extracted requirements"
            style={{
              padding: 'var(--spacing-md) var(--spacing-xl)',
              backgroundColor: messages.length === 0 || isExtracting ? 'var(--color-gray-300)' : 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: messages.length === 0 || isExtracting ? 'not-allowed' : 'pointer',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              transition: 'all var(--transition-fast)',
              boxShadow: messages.length === 0 || isExtracting ? 'none' : 'var(--shadow-sm)',
            }}
            onMouseEnter={(e) => {
              if (messages.length > 0 && !isExtracting) {
                e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }
            }}
            onMouseLeave={(e) => {
              if (messages.length > 0 && !isExtracting) {
                e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }
            }}
          >
            {isExtracting ? 'Extracting...' : 'View Requirements'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{ padding: '0 var(--spacing-2xl)' }}>
          <ErrorMessage message={error.message} />
        </div>
      )}

      {/* Chat Window */}
      <ChatWindow messages={messages} isLoading={isLoading} />

      {/* Chat Input */}
      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
}
