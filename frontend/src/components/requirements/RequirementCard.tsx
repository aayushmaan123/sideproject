interface RequirementCardProps {
  label: string;
  value: string | string[];
}

export default function RequirementCard({ label, value }: RequirementCardProps) {
  const displayValue = Array.isArray(value) ? value : [value];
  
  return (
    <div style={{
      backgroundColor: 'var(--color-bg-primary)',
      border: '1px solid var(--color-gray-200)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--spacing-xl)',
      marginBottom: 'var(--spacing-lg)',
      boxShadow: 'var(--shadow-sm)',
      transition: 'all var(--transition-base)',
      animation: 'fadeIn 0.4s ease-out',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.borderColor = 'var(--color-primary-light)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.borderColor = 'var(--color-gray-200)';
    }}
    >
      <h3 style={{
        margin: '0 0 var(--spacing-md) 0',
        fontSize: 'var(--font-size-xs)',
        fontWeight: 'var(--font-weight-semibold)',
        color: 'var(--color-primary)',
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
      }}>
        {label}
      </h3>
      {displayValue.length === 1 ? (
        <p style={{
          margin: 0,
          fontSize: 'var(--font-size-base)',
          color: 'var(--color-text-primary)',
          lineHeight: 'var(--line-height-relaxed)',
          fontWeight: 'var(--font-weight-medium)',
        }}>
          {displayValue[0]}
        </p>
      ) : (
        <ul style={{
          margin: 0,
          paddingLeft: 'var(--spacing-xl)',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-primary)',
          lineHeight: 'var(--line-height-relaxed)',
        }}>
          {displayValue.map((item, index) => (
            <li key={index} style={{ 
              marginBottom: 'var(--spacing-xs)',
              paddingLeft: 'var(--spacing-xs)',
            }}>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
