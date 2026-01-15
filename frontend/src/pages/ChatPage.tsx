import { useNavigate } from 'react-router-dom';
import { useSession } from '../hooks/useSession';
import { useConversation } from '../hooks/useConversation';
import { useRequirements } from '../hooks/useRequirements';
import ChatWindow from '../components/chat/ChatWindow';
import ChatInput from '../components/chat/ChatInput';
import ErrorMessage from '../components/common/ErrorMessage';

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
      maxWidth: '900px',
      margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #ddd',
        backgroundColor: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
            AI Website Builder
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>
            Tell me about your website needs
          </p>
        </div>
        <button
          onClick={handleExtractRequirements}
          disabled={messages.length === 0 || isExtracting}
          style={{
            padding: '8px 16px',
            backgroundColor: messages.length === 0 || isExtracting ? '#ccc' : '#646cff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: messages.length === 0 || isExtracting ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          {isExtracting ? 'Extracting...' : 'View Requirements'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{ padding: '0 20px' }}>
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
