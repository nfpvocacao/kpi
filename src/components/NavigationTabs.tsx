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
      label: 'Desempenho',
      fullTitle: 'Desempenho & Captação NFP',
      icon: TrendingUp,
      badgeText: 'YoY',
      badgeColor: 'bg-[#00E3E6] text-[#002A3A]'
    },
    {
      id: 'empresas' as TabId,
      label: 'Empresas',
      fullTitle: 'Operações por Empresas Parceiras',
      icon: Building2,
      badgeText: null,
      badgeColor: 'bg-[#EDCD01] text-[#002A3A]'
    },
    {
      id: 'doadores' as TabId,
      label: 'Doadores Reais',
      fullTitle: 'Análise de Doadores de Pessoa Física',
      icon: HeartHandshake,
      badgeText: null,
      badgeColor: 'bg-[#FD3168] text-white'
    },
    {
      id: 'automaticos' as TabId,
      label: 'Doadores Auto',
      fullTitle: 'Doadores Automáticos Cadastrados',
      icon: Users,
      badgeText: null,
      badgeColor: 'bg-[#00E04B] text-[#002A3A]'
    },
    {
      id: 'benchmarking' as TabId,
      label: 'Benchmarking',
      fullTitle: 'Benchmarking de Captação & Prospecção',
      icon: Target,
      badgeText: '#6',
      badgeColor: 'bg-[#E03F2A] text-white'
    }
  ];

  return (
    <div className="bg-white border-b border-[#BCD3DF]/70 sticky top-[65px] z-20 px-3 lg:px-8 shadow-2xs">
      <div className="max-w-7xl mx-auto">
        <nav 
          className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 py-2.5"
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
                title={tab.fullTitle}
                className={`flex items-center justify-center gap-1.5 px-2.5 py-2.5 rounded-xl font-extrabold text-xs lg:text-sm transition-all duration-200 cursor-pointer w-full text-center ${
                  isActive
                    ? 'bg-[#004A6D] text-white shadow-md ring-1 ring-[#004A6D]'
                    : 'bg-slate-50 text-[#004A6D] hover:bg-[#D9FBFF]/60 hover:text-[#002A3A] border border-slate-200/70'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#00E3E6]' : 'text-[#004A6D]'}`} />
                <span className="truncate">{tab.label}</span>

                {tab.badgeText && (
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${tab.badgeColor} shrink-0`}>
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
