import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../hooks/useSession';
import { useRequirements } from '../hooks/useRequirements';
import RequirementList from '../components/requirements/RequirementList';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import ThemeToggle from '../components/common/ThemeToggle';
import ConnectionStatusIndicator from '../components/common/ConnectionStatusIndicator';

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
      minHeight: '100vh',
      backgroundColor: 'var(--color-bg-secondary)',
      padding: 'var(--spacing-2xl)',
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 'var(--spacing-3xl)',
          flexWrap: 'wrap',
          gap: 'var(--spacing-lg)',
        }}>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: 'var(--font-size-3xl)', 
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
            }}>
              <span style={{ fontSize: 'var(--font-size-4xl)' }}>📄</span>
              Website Requirements
            </h1>
            <p style={{ 
              margin: 'var(--spacing-sm) 0 0 0', 
              fontSize: 'var(--font-size-base)', 
              color: 'var(--color-text-secondary)',
            }}>
              Extracted from your conversation
            </p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center', flexWrap: 'wrap' }}>
            <ConnectionStatusIndicator />
            <ThemeToggle />
            {requirements && (
              <button
                onClick={() => navigate(`/preview/${sessionId}/default-template-id`)}
                aria-label="Preview generated site"
                style={{
                  padding: 'var(--spacing-md) var(--spacing-xl)',
                  backgroundColor: 'var(--color-success)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-semibold)',
                  transition: 'all var(--transition-fast)',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                <span>🌐</span>
                Preview Site
              </button>
            )}
            <button
              onClick={() => navigate('/')}
              aria-label="Back to chat"
              style={{
                padding: 'var(--spacing-md) var(--spacing-xl)',
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                transition: 'all var(--transition-fast)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-sm)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              <span>←</span>
              Back to Chat
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && <ErrorMessage message={error.message} />}

        {/* Loading State */}
        {isLoading && (
          <div style={{ 
            textAlign: 'center', 
            padding: 'var(--spacing-4xl)',
            backgroundColor: 'var(--color-bg-primary)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)',
          }}>
            <LoadingSpinner />
            <p style={{ 
              marginTop: 'var(--spacing-xl)', 
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--font-size-base)',
            }}>
              Loading requirements...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && !requirements && (
          <div style={{
            textAlign: 'center',
            padding: 'var(--spacing-4xl) var(--spacing-2xl)',
            backgroundColor: 'var(--color-bg-primary)',
            borderRadius: 'var(--radius-lg)',
            border: '2px dashed var(--color-gray-300)',
            boxShadow: 'var(--shadow-md)',
          }}>
            <div style={{ fontSize: '64px', marginBottom: 'var(--spacing-lg)' }}>
              📋
            </div>
            <p style={{ 
              fontSize: 'var(--font-size-xl)', 
              color: 'var(--color-text-secondary)', 
              margin: '0 0 var(--spacing-sm) 0',
              fontWeight: 'var(--font-weight-semibold)',
            }}>
              No requirements found
            </p>
            <p style={{ 
              fontSize: 'var(--font-size-sm)', 
              color: 'var(--color-text-tertiary)', 
              margin: '0 0 var(--spacing-2xl) 0',
            }}>
              Start a conversation in the chat to generate requirements
            </p>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: 'var(--spacing-md) var(--spacing-2xl)',
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                transition: 'all var(--transition-fast)',
                boxShadow: 'var(--shadow-sm)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              Go to Chat
            </button>
          </div>
        )}

        {/* Requirements Display */}
        {!isLoading && !error && requirements && (
          <div style={{
            animation: 'fadeIn 0.4s ease-out',
          }}>
            <RequirementList requirements={requirements} />
          </div>
        )}
      </div>
    </div>
  );
}
