import React from 'react';

interface BrandLogoProps {
  variant?: 'full' | 'icon';
  color?: 'navy' | 'white' | 'cyan';
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ 
  variant = 'full', 
  color = 'navy',
  className = '' 
}) => {
  const fillColor = 
    color === 'white' ? '#FFFFFF' :
    color === 'cyan' ? '#00E3E6' : 
    '#004A6D';

  if (variant === 'icon') {
    // Only the iconic Vocação bridge arch
    return (
      <svg 
        viewBox="0 0 100 65" 
        className={className || 'w-10 h-7'} 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Vocação Ícone Arco"
      >
        <path 
          d="M12 55 C 12 18, 88 18, 88 55" 
          stroke={fillColor} 
          strokeWidth="14" 
          strokeLinecap="round" 
        />
      </svg>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 select-none font-['Raleway',sans-serif] tracking-tighter ${className}`}>
      <span 
        className="font-black text-2xl sm:text-3xl leading-none"
        style={{ color: fillColor }}
      >
        V
      </span>
      {/* The bridge arch replacing the 'O' */}
      <svg 
        viewBox="0 0 48 36" 
        className="w-7 h-5 sm:w-9 sm:h-6 inline-block mb-1" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M6 32 C 6 8, 42 8, 42 32" 
          stroke={fillColor} 
          strokeWidth="8" 
          strokeLinecap="round" 
        />
      </svg>
      <span 
        className="font-black text-2xl sm:text-3xl tracking-normal leading-none uppercase"
        style={{ color: fillColor }}
      >
        CAÇÃO
      </span>
    </div>
  );
};
