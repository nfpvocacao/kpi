import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  id: string;
  title: string;
  value: string;
  subValue?: string;
  trend?: {
    value: string;
    isPositive: boolean;
    label: string;
  };
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  badge?: {
    text: string;
    color: string;
  };
  footnote?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  id,
  title,
  value,
  subValue,
  trend,
  icon: Icon,
  iconBgColor = 'bg-[#D9FBFF]',
  iconColor = 'text-[#004A6D]',
  badge,
  footnote
}) => {
  return (
    <div 
      id={id}
      className="bg-white border border-[#BCD3DF]/60 hover:border-[#004A6D]/40 rounded-2xl p-5 shadow-2xs transition-all duration-200 hover:shadow-xs flex flex-col justify-between relative overflow-hidden group"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#004A6D]/70 block">
            {title}
          </span>
          {badge && (
            <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-sm mt-1 uppercase ${badge.color}`}>
              {badge.text}
            </span>
          )}
        </div>
        <div className={`p-2.5 rounded-xl ${iconBgColor} shrink-0 group-hover:scale-105 transition-transform duration-200`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>

      <div className="mt-1">
        <div className="text-2xl lg:text-3xl font-black text-[#002A3A] tracking-tight font-['Raleway',sans-serif]">
          {value}
        </div>
        {subValue && (
          <p className="text-xs font-semibold text-[#004A6D]/80 mt-0.5">
            {subValue}
          </p>
        )}
      </div>

      <div className="mt-3 pt-2.5 border-t border-[#F0F5F8] flex items-center justify-between text-xs">
        {trend ? (
          <div className="flex items-center gap-1.5">
            <span className={`font-bold px-1.5 py-0.5 rounded-sm text-[11px] ${trend.isPositive ? 'bg-[#00E04B]/20 text-[#006E24]' : 'bg-[#E03F2A]/15 text-[#E03F2A]'}`}>
              {trend.value}
            </span>
            <span className="text-[#004A6D]/60 text-[11px] font-medium">{trend.label}</span>
          </div>
        ) : (
          <span className="text-[#004A6D]/60 text-[11px]">Consolidado SEFAZ</span>
        )}

        {footnote && (
          <span className="text-[11px] text-[#004A6D]/60 font-medium truncate max-w-[150px]" title={footnote}>
            {footnote}
          </span>
        )}
      </div>
    </div>
  );
};
