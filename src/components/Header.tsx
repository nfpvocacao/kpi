import React, { useState } from 'react';
import { Database, RefreshCw, ShieldCheck, ChevronDown, Calendar, Filter, Tv } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { DatabaseState, PeriodFilter } from '../types';
import { PeriodSelectorPopover } from './PeriodSelectorPopover';

interface HeaderProps {
  periodFilter: PeriodFilter;
  onPeriodChange: (filter: PeriodFilter) => void;
  databaseState: DatabaseState;
  onOpenDatabaseModal: () => void;
  onOpenRulesModal: () => void;
  onSyncDatabase: () => void;
  onOpenTvMode?: () => void;
  isSyncing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  periodFilter,
  onPeriodChange,
  databaseState,
  onOpenDatabaseModal,
  onOpenRulesModal,
  onSyncDatabase,
  onOpenTvMode,
  isSyncing
}) => {
  const [isPeriodPopoverOpen, setIsPeriodPopoverOpen] = useState(false);

  // Helper to format button label
  const getPeriodLabel = (filter: PeriodFilter) => {
    if (filter.preset === 'ALL') return 'Todo o Histórico (2020-2027)';
    if (filter.preset === 'LAST_12') return 'Últimos 12 Meses';

    const sortedYears = [...filter.years].sort((a,b) => a-b);
    const yearsStr = sortedYears.length === 7 
      ? '2020-2026' 
      : sortedYears.length > 3
      ? `${sortedYears[0]}-${sortedYears[sortedYears.length-1]}`
      : sortedYears.join('+');

    const monthNamesShort = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const monthNamesFull = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    if (filter.months.length === 0) {
      return `Ano ${yearsStr} (Todos os Meses)`;
    }
    if (filter.months.length === 1) {
      return `${monthNamesFull[filter.months[0] - 1]} / ${yearsStr}`;
    }
    if (filter.months.length === 8 && filter.months.join(',') === '1,2,3,4,5,6,7,8' && filter.years.join(',') === '2026') {
      return 'Ano 2026 (Atual - Jan a Ago)';
    }
    
    const sortedMonths = [...filter.months].sort((a,b) => a-b);
    const isContiguous = sortedMonths.length > 1 && sortedMonths.every((val, i, arr) => i === 0 || val === arr[i-1] + 1);
    
    if (isContiguous) {
      return `${monthNamesShort[sortedMonths[0]-1]} a ${monthNamesShort[sortedMonths[sortedMonths.length-1]-1]} / ${yearsStr}`;
    }
    
    return `${sortedMonths.map(m => monthNamesShort[m-1]).join(', ')} / ${yearsStr}`;
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#D9FBFF] shadow-xs px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Left: Brand + Application Title */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-3">
              <BrandLogo variant="full" color="navy" />
              <div className="h-7 w-px bg-[#BCD3DF] hidden sm:block"></div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#004A6D]">
                    NFP <span className="text-[#00E3E6] bg-[#004A6D] px-1.5 py-0.5 rounded-sm text-sm">Analytics</span>
                  </span>
                  <span className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 bg-[#D9FBFF] text-[#004A6D] rounded-full border border-[#00E3E6]/40 hidden sm:inline-block">
                    SEFAZ-SP
                  </span>
                </div>
                <p className="text-xs text-[#004A6D]/70 font-medium">
                  Inteligência de Receita & Captação Institucional
                </p>
              </div>
            </div>

            {/* Mobile sync icon */}
            <button
              onClick={onSyncDatabase}
              disabled={isSyncing}
              className="md:hidden p-2 text-[#004A6D] hover:bg-[#D9FBFF] rounded-lg transition-colors"
              title="Sincronizar dados"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-[#00E3E6]' : ''}`} />
            </button>
          </div>

          {/* Right: Period Filter, Database Cache Indicator & Business Rules Button */}
          <div className="flex items-center flex-wrap gap-2.5 w-full md:w-auto justify-end">
            
            {/* Master Period Filter Button (Triggers Popover) */}
            <button
              onClick={() => setIsPeriodPopoverOpen(true)}
              className="flex items-center bg-[#F4F9FA] hover:bg-[#D9FBFF]/60 border border-[#BCD3DF] hover:border-[#004A6D] rounded-xl px-3.5 py-2 text-xs font-bold text-[#002A3A] transition-all shadow-xs cursor-pointer group"
              title="Clique para abrir o Seletor de Período Misto (Anos & Meses)"
            >
              <Calendar className="w-3.5 h-3.5 text-[#004A6D] mr-2 group-hover:text-[#00E3E6] transition-colors" />
              <span className="text-[#004A6D]/70 mr-1.5 font-semibold hidden lg:inline">Período:</span>
              <span className="font-black text-[#004A6D] mr-2 underline decoration-[#00E3E6] decoration-2 underline-offset-2">
                {getPeriodLabel(periodFilter)}
              </span>
              <Filter className="w-3 h-3 text-[#004A6D]/60 ml-1" />
              <ChevronDown className="w-3.5 h-3.5 text-[#004A6D] ml-1 group-hover:translate-y-0.5 transition-transform" />
            </button>

            {/* Sync Button */}
            <button
              onClick={onSyncDatabase}
              disabled={isSyncing}
              className="flex items-center gap-1.5 bg-[#004A6D] hover:bg-[#002A3A] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs disabled:opacity-75 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#00E3E6]' : ''}`} />
              <span className="hidden sm:inline">{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
            </button>

            {/* TV Mode Button */}
            {onOpenTvMode && (
              <button
                onClick={onOpenTvMode}
                className="flex items-center gap-1.5 bg-[#002A3A] hover:bg-[#001D29] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs border border-[#00E3E6]/40 cursor-pointer group"
                title="Abrir o Modo Apresentação TV com Carrossel Automático de Dashboards"
              >
                <Tv className="w-3.5 h-3.5 text-[#00E3E6] group-hover:scale-110 transition-transform" />
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse ml-0.5"></span>
              </button>
            )}

          </div>

        </div>
      </header>

      {/* Interactive Master Period Popover */}
      <PeriodSelectorPopover
        isOpen={isPeriodPopoverOpen}
        onClose={() => setIsPeriodPopoverOpen(false)}
        periodFilter={periodFilter}
        onApplyPeriod={onPeriodChange}
      />
    </>
  );
};

