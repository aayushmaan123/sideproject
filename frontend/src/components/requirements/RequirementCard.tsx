interface RequirementCardProps {
  label: string;
  value: string | string[];
}

export default function RequirementCard({ label, value }: RequirementCardProps) {
  const displayValue = Array.isArray(value) ? value : [value];
  
  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '12px',
    }}>
      <h3 style={{
        margin: '0 0 8px 0',
        fontSize: '14px',
        fontWeight: '600',
        color: '#646cff',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}>
        {label}
      </h3>
      {displayValue.length === 1 ? (
        <p style={{
          margin: 0,
          fontSize: '15px',
          color: '#333',
          lineHeight: '1.5',
        }}>
          {displayValue[0]}
        </p>
      ) : (
        <ul style={{
          margin: 0,
          paddingLeft: '20px',
          fontSize: '15px',
          color: '#333',
          lineHeight: '1.8',
        }}>
          {displayValue.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
