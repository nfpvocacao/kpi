import React from 'react';

interface BrandLogoProps {
  variant?: 'full' | 'icon';
  color?: 'navy' | 'white' | 'cyan';
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ 
  variant = 'full', 
  className = '' 
}) => {
  if (variant === 'icon') {
    return (
      <img 
        src="/vocacao-icon.png" 
        alt="Ícone Vocação" 
        className={className || 'h-6 sm:h-7 w-auto object-contain'}
      />
    );
  }

  return (
    <img 
      src="/vocacao-logo.png" 
      alt="Logo Vocação" 
      className={className || 'h-7 sm:h-8 w-auto object-contain'}
    />
  );
};
