import type { WebsiteRequirements } from '../../types/requirement.types';
import RequirementCard from './RequirementCard';

interface RequirementListProps {
  requirements: WebsiteRequirements;
}

export default function RequirementList({ requirements }: RequirementListProps) {
  return (
    <div>
      <div style={{
        marginBottom: '20px',
        padding: '16px',
        backgroundColor: '#f0f0ff',
        borderRadius: '8px',
        border: '1px solid #d0d0ff',
      }}>
        <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
          Session ID: <code style={{ 
            backgroundColor: 'white', 
            padding: '2px 6px', 
            borderRadius: '4px',
            fontSize: '12px',
          }}>{requirements.session_id}</code>
        </p>
        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>
          Extracted: {new Date(requirements.extracted_at).toLocaleString()}
        </p>
      </div>

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
  );
}
