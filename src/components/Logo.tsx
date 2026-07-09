import React from 'react';

interface LogoProps {
  size?: number;
  variant?: 'resident' | 'business' | 'contractor' | 'master' | 'light' | 'monochrome';
  showWordmark?: boolean;
  wordmarkSize?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 36,
  variant = 'master',
  showWordmark = true,
  wordmarkSize = '1.25rem'
}) => {
  const getColors = () => {
    switch (variant) {
      case 'resident':
        return { base: '#F6F8FD', stroke: '#2F6FED', my: '#2F6FED' };
      case 'business':
        return { base: '#F6F8FD', stroke: '#1FBF75', my: '#1FBF75' };
      case 'contractor':
        return { base: '#F6F8FD', stroke: '#F5A524', my: '#F5A524' };
      case 'light':
        return { base: '#0E0F12', stroke: '#2F6FED', my: '#2F6FED' };
      case 'monochrome':
        return { base: '#F6F8FD', stroke: '#F6F8FD', my: '#F6F8FD' };
      case 'master':
      default:
        return { base: '#F6F8FD', stroke: '#2F6FED', my: '#2F6FED' };
    }
  };

  const { base, stroke, my } = getColors();

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.35, fontFamily: '"Montserrat", sans-serif' }}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        fill="none" 
        style={{ flexShrink: 0 }}
      >
        <path 
          d="M20 82 L20 28 L50 60 L80 28 L80 82" 
          stroke={base} 
          strokeWidth="13" 
          fill="none" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <path 
          d="M50 60 L80 28" 
          stroke={stroke} 
          strokeWidth="13" 
          fill="none" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
      {showWordmark && (
        <span 
          style={{ 
            fontWeight: 800, 
            fontSize: wordmarkSize, 
            letterSpacing: '-0.03em', 
            color: variant === 'light' ? '#0E0F12' : '#F6F8FD', 
            lineHeight: 1 
          }}
        >
          <span style={{ color: my }}>My</span>Munevo
        </span>
      )}
    </div>
  );
};
