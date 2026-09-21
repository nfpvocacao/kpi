import React from 'react';
import { Database, RefreshCw, ShieldCheck, CheckCircle2, ChevronDown, SlidersHorizontal, Info } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { DatabaseState } from '../types';

interface HeaderProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  databaseState: DatabaseState;
  onOpenDatabaseModal: () => void;
  onOpenRulesModal: () => void;
  onSyncDatabase: () => void;
  isSyncing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  selectedPeriod,
  onPeriodChange,
  databaseState,
  onOpenDatabaseModal,
  onOpenRulesModal,
  onSyncDatabase,
  isSyncing
}) => {
  return (
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
          
          {/* Period Selector */}
          <div className="relative inline-flex items-center">
            <label htmlFor="period-select" className="sr-only">Filtrar Período</label>
            <div className="flex items-center bg-[#F4F9FA] border border-[#BCD3DF] rounded-lg px-3 py-1.5 text-sm font-semibold text-[#002A3A] hover:border-[#004A6D] transition-colors shadow-2xs">
              <span className="text-xs text-[#004A6D]/70 mr-2 font-normal hidden lg:inline">Período:</span>
              <select
                id="period-select"
                value={selectedPeriod}
                onChange={(e) => onPeriodChange(e.target.value)}
                className="bg-transparent border-none outline-none font-bold text-[#004A6D] cursor-pointer pr-5 appearance-none"
              >
                <option value="2026">Ano 2026 (Atual - Jan a Ago)</option>
                <option value="2025">Ano 2025 (Consolidado)</option>
                <option value="2024">Ano 2024 (Histórico)</option>
                <option value="ALL">Todo o Histórico (2024 - 2026)</option>
                <option value="LAST_12">Últimos 12 Meses</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#004A6D] pointer-events-none absolute right-3" />
            </div>
          </div>

          {/* Database Architecture Status Pill */}
          <button
            onClick={onOpenDatabaseModal}
            className="flex items-center gap-2 bg-[#F4F9FA] hover:bg-[#D9FBFF]/60 border border-[#BCD3DF] hover:border-[#00E3E6] px-3 py-1.5 rounded-lg text-xs font-medium text-[#004A6D] transition-all cursor-pointer shadow-2xs group"
            title="Clique para ver detalhes da arquitetura SQLite/AWS RDS"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E04B] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E04B]"></span>
            </span>
            <Database className="w-3.5 h-3.5 text-[#004A6D] group-hover:text-[#00E3E6] transition-colors" />
            <span className="hidden sm:inline font-semibold">Cache SQLite</span>
            <span className="text-[#004A6D]/60 hidden xl:inline">({databaseState.tempoRespostaMs}ms)</span>
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

          {/* Rules & Business Logic Info */}
          <button
            onClick={onOpenRulesModal}
            className="flex items-center gap-1 bg-white hover:bg-[#EDCD01]/20 border border-[#EDCD01] text-[#002A3A] px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
            title="Ver Regras Fundamentais de Cálculo da NFP"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#E03F2A]" />
            <span className="hidden md:inline">Regras de Cálculo</span>
          </button>

        </div>

      </div>
    </header>
  );
};
