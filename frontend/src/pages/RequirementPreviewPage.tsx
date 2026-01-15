import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../hooks/useSession';
import { useRequirements } from '../hooks/useRequirements';
import RequirementList from '../components/requirements/RequirementList';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

export default function RequirementPreviewPage() {
  const navigate = useNavigate();
  const { sessionId } = useSession();
  const { requirements, isLoading, error, fetchRequirements } = useRequirements(sessionId);

  // Fetch requirements on mount
  useEffect(() => {
    fetchRequirements();
  }, [fetchRequirements]);

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>
            Website Requirements
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666' }}>
            Extracted from your conversation
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#646cff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          Back to Chat
        </button>
      </div>

      {/* Error Display */}
      {error && <ErrorMessage message={error.message} />}

      {/* Loading State */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <LoadingSpinner />
          <p style={{ marginTop: '16px', color: '#666' }}>
            Loading requirements...
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && !requirements && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          border: '2px dashed #ddd',
        }}>
          <p style={{ fontSize: '18px', color: '#666', margin: '0 0 12px 0' }}>
            No requirements found
          </p>
          <p style={{ fontSize: '14px', color: '#999', margin: '0 0 20px 0' }}>
            Start a conversation in the chat to generate requirements
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#646cff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Go to Chat
          </button>
        </div>
      )}

      {/* Requirements Display */}
      {!isLoading && !error && requirements && (
        <RequirementList requirements={requirements} />
      )}
    </div>
  );
}
