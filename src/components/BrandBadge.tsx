import React from 'react';

interface BrandBadgeProps {
  prefix?: string;
  highlightText: string;
  suffix?: string;
  colorVariant?: 'yellow' | 'cyan' | 'orange' | 'green' | 'pink';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const BrandBadge: React.FC<BrandBadgeProps> = ({
  prefix,
  highlightText,
  suffix,
  colorVariant = 'yellow',
  size = 'md',
  className = ''
}) => {
  const bgStyles = {
    yellow: 'bg-[#EDCD01] text-[#002A3A]',
    cyan: 'bg-[#00E3E6] text-[#002A3A]',
    orange: 'bg-[#E03F2A] text-white',
    green: 'bg-[#00E04B] text-[#002A3A]',
    pink: 'bg-[#FD3168] text-white'
  }[colorVariant];

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 rounded-sm',
    md: 'text-sm px-2.5 py-1 rounded-sm',
    lg: 'text-base px-3 py-1.5 rounded-sm'
  }[size];

  return (
    <span className={`inline-flex items-center gap-1 font-medium ${className}`}>
      {prefix && <span className="text-[#004A6D]">{prefix}</span>}
      <span className={`font-['Caveat',cursive] font-bold tracking-wide shadow-xs ${bgStyles} ${sizeStyles}`}>
        {highlightText}
      </span>
      {suffix && <span className="text-[#004A6D]">{suffix}</span>}
    </span>
  );
};
