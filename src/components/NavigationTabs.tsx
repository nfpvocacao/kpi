import React from 'react';
import { TrendingUp, Building2, HeartHandshake, Users, Target } from 'lucide-react';

export type TabId = 'desempenho' | 'empresas' | 'doadores' | 'automaticos' | 'benchmarking';

interface NavigationTabsProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  metricsBadgeCounts?: {
    empresasAtivas: number;
    doadoresReais: number;
    doadoresAuto: number;
  };
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onSelectTab,
  metricsBadgeCounts
}) => {
  const tabs = [
    {
      id: 'desempenho' as TabId,
      label: 'Desempenho & Faturamento',
      shortLabel: 'Desempenho',
      icon: TrendingUp,
      badgeText: 'Global YoY',
      badgeColor: 'bg-[#00E3E6] text-[#002A3A]'
    },
    {
      id: 'empresas' as TabId,
      label: 'Operações por Empresa',
      shortLabel: 'Empresas',
      icon: Building2,
      badgeText: metricsBadgeCounts ? `${metricsBadgeCounts.empresasAtivas} ativas` : undefined,
      badgeColor: 'bg-[#EDCD01] text-[#002A3A]'
    },
    {
      id: 'doadores' as TabId,
      label: 'Análise de Doadores Reais',
      shortLabel: 'Doadores Reais',
      icon: HeartHandshake,
      badgeText: metricsBadgeCounts ? `${metricsBadgeCounts.doadoresReais} PF` : undefined,
      badgeColor: 'bg-[#FD3168] text-white'
    },
    {
      id: 'automaticos' as TabId,
      label: 'Doadores Automáticos (Histórico)',
      shortLabel: 'Automáticos',
      icon: Users,
      badgeText: metricsBadgeCounts ? `${metricsBadgeCounts.doadoresAuto} AUT` : undefined,
      badgeColor: 'bg-[#00E04B] text-[#002A3A]'
    },
    {
      id: 'benchmarking' as TabId,
      label: 'Benchmarking & Prospecção',
      shortLabel: 'Benchmarking',
      icon: Target,
      badgeText: '#6 Capital',
      badgeColor: 'bg-[#E03F2A] text-white'
    }
  ];

  return (
    <div className="bg-white border-b border-[#BCD3DF]/70 sticky top-[65px] z-20 px-4 lg:px-8 shadow-2xs">
      <div className="max-w-7xl mx-auto">
        <nav 
          className="flex space-x-2 md:space-x-4 overflow-x-auto no-scrollbar py-2"
          aria-label="Abas do Sistema NFP Analytics"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-semibold text-xs md:text-sm whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#004A6D] text-white shadow-sm ring-1 ring-[#004A6D]'
                    : 'text-[#004A6D] hover:bg-[#D9FBFF]/60 hover:text-[#002A3A]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#00E3E6]' : 'text-[#004A6D]/80'}`} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>

                {tab.badgeText && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tab.badgeColor} ml-1`}>
                    {tab.badgeText}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
