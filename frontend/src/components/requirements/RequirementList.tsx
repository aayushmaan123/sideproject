import type { WebsiteRequirements } from '../../types/requirement.types';
import RequirementCard from './RequirementCard';

interface RequirementListProps {
  requirements: WebsiteRequirements;
}

export default function RequirementList({ requirements }: RequirementListProps) {
  return (
    <div>
      <div style={{
        marginBottom: 'var(--spacing-2xl)',
        padding: 'var(--spacing-lg)',
        backgroundColor: 'var(--color-primary-light)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-primary)',
        borderLeft: '4px solid var(--color-primary)',
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 'var(--spacing-sm)',
          marginBottom: 'var(--spacing-sm)',
        }}>
          <span style={{ fontSize: 'var(--font-size-lg)' }}>📋</span>
          <p style={{ 
            margin: 0, 
            fontSize: 'var(--font-size-xs)', 
            color: 'var(--color-text-secondary)',
            fontWeight: 'var(--font-weight-medium)',
          }}>
            Session ID: <code style={{ 
              backgroundColor: 'var(--color-bg-primary)', 
              padding: 'var(--spacing-xs) var(--spacing-sm)', 
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-xs)',
              fontFamily: 'var(--font-family-mono)',
              color: 'var(--color-primary)',
              border: '1px solid var(--color-primary)',
            }}>{requirements.session_id}</code>
          </p>
        </div>
        <p style={{ 
          margin: 0,
          fontSize: 'var(--font-size-xs)', 
          color: 'var(--color-text-secondary)',
        }}>
          Extracted: {new Date(requirements.extracted_at).toLocaleString()}
        </p>
      </div>

      <div style={{
        display: 'grid',
        gap: 'var(--spacing-lg)',
      }}>
        <RequirementCard 
          label="Business Type" 
          value={requirements.business_type} 
        />
        
        <RequirementCard 
          label="Key Features" 
          value={requirements.key_features} 
        />
        
        <RequirementCard 
          label="Target Audience" 
          value={requirements.target_audience} 
        />
        
        <RequirementCard 
          label="Design Preferences" 
          value={requirements.design_preferences} 
        />
        
        {requirements.additional_notes && (
          <RequirementCard 
            label="Additional Notes" 
            value={requirements.additional_notes} 
          />
        )}
      </div>
    </div>
  );
}
