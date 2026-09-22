import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, 
  Check, 
  X, 
  RotateCcw, 
  Filter, 
  ChevronDown, 
  CheckSquare, 
  Square,
  SlidersHorizontal,
  Info,
  ArrowRight
} from 'lucide-react';
import { PeriodFilter } from '../types';

interface PeriodSelectorPopoverProps {
  periodFilter: PeriodFilter;
  onApplyPeriod: (filter: PeriodFilter) => void;
  isOpen: boolean;
  onClose: () => void;
}

const ALL_YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009];
const MONTH_NAMES_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const MONTH_NAMES_FULL = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const PeriodSelectorPopover: React.FC<PeriodSelectorPopoverProps> = ({
  periodFilter,
  onApplyPeriod,
  isOpen,
  onClose
}) => {
  // Filter Mode: 'COMBO' or 'RANGE'
  const [mode, setMode] = useState<'COMBO' | 'RANGE'>(
    periodFilter.preset === 'RANGE' ? 'RANGE' : 'COMBO'
  );

  // Combo mode state
  const [tempYears, setTempYears] = useState<number[]>(periodFilter.years);
  const [tempMonths, setTempMonths] = useState<number[]>(periodFilter.months);

  // Range mode state (Default: 06/2025 a 05/2026)
  const [startMonth, setStartMonth] = useState<number>(6); // Junho
  const [startYear, setStartYear] = useState<number>(2025);
  const [endMonth, setEndMonth] = useState<number>(5);     // Maio
  const [endYear, setEndYear] = useState<number>(2026);

  // Dropdown Open States for Combo Mode
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isMonthOpen, setIsMonthOpen] = useState(false);

  const yearRef = useRef<HTMLDivElement>(null);
  const monthRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTempYears(periodFilter.years);
      setTempMonths(periodFilter.months);
      setIsYearOpen(false);
      setIsMonthOpen(false);

      if (periodFilter.preset === 'RANGE' && periodFilter.startMonthYear && periodFilter.endMonthYear) {
        setMode('RANGE');
        const [sy, sm] = periodFilter.startMonthYear.split('-');
        const [ey, em] = periodFilter.endMonthYear.split('-');
        setStartYear(parseInt(sy, 10));
        setStartMonth(parseInt(sm, 10));
        setEndYear(parseInt(ey, 10));
        setEndMonth(parseInt(em, 10));
      } else {
        setMode('COMBO');
      }
    }
  }, [isOpen, periodFilter]);

  if (!isOpen) return null;

  // Toggle single year
  const toggleYear = (year: number) => {
    setTempYears(prev => {
      if (prev.includes(year)) {
        if (prev.length === 1) return prev; // Keep at least 1 year
        return prev.filter(y => y !== year);
      } else {
        return [...prev, year].sort((a, b) => b - a);
      }
    });
  };

  // Select all / clear years
  const selectAllYears = () => {
    setTempYears([...ALL_YEARS]);
  };

  const selectOnlyCurrentYear = () => {
    setTempYears([2026]);
  };

  // Toggle single month
  const toggleMonth = (monthNum: number) => {
    setTempMonths(prev => {
      if (prev.includes(monthNum)) {
        return prev.filter(m => m !== monthNum);
      } else {
        return [...prev, monthNum].sort((a, b) => a - b);
      }
    });
  };

  // Apply Range Preset: 06/2025 a 05/2026
  const applyPreset06_2025_to_05_2026 = () => {
    setMode('RANGE');
    setStartMonth(6);
    setStartYear(2025);
    setEndMonth(5);
    setEndYear(2026);
  };

  const handleApply = () => {
    if (mode === 'RANGE') {
      const startStr = `${startYear}-${String(startMonth).padStart(2, '0')}`;
      const endStr = `${endYear}-${String(endMonth).padStart(2, '0')}`;
      
      // Calculate active years in range
      const activeYears: number[] = [];
      for (let y = startYear; y <= endYear; y++) {
        activeYears.push(y);
      }

      onApplyPeriod({
        years: activeYears,
        months: [],
        preset: 'RANGE',
        startMonthYear: startStr,
        endMonthYear: endStr
      });
    } else {
      onApplyPeriod({
        years: tempYears,
        months: tempMonths,
        preset: 'CUSTOM'
      });
    }
    onClose();
  };

  const handleReset = () => {
    setMode('COMBO');
    setTempYears([2026]);
    setTempMonths([1, 2, 3, 4, 5, 6, 7, 8]);
  };

  // Label Formatter for Combobox Display
  const getYearsSummaryLabel = () => {
    if (tempYears.length === ALL_YEARS.length) return 'Todos os Anos (2009 a 2026)';
    if (tempYears.length === 1) return `Ano ${tempYears[0]}`;
    if (tempYears.length === 0) return 'Selecione pelo menos 1 ano';
    const sorted = [...tempYears].sort((a, b) => b - a);
    if (sorted.length <= 3) return `Anos: ${sorted.join(', ')}`;
    return `${sorted.length} Anos (${sorted.slice(0, 3).join(', ')}...)`;
  };

  const getMonthsSummaryLabel = () => {
    if (tempMonths.length === 0 || tempMonths.length === 12) return 'Todos os Meses (Jan a Dez)';
    if (tempMonths.length === 1) return `Mês: ${MONTH_NAMES_FULL[tempMonths[0] - 1]}`;
    const sorted = [...tempMonths].sort((a, b) => a - b);
    const shortNames = sorted.map(m => MONTH_NAMES_SHORT[m - 1]);
    if (shortNames.length <= 4) return `Meses: ${shortNames.join(', ')}`;
    return `${shortNames.length} Meses (${shortNames.slice(0, 3).join(', ')}...)`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 px-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      
      {/* Popover Card */}
      <div 
        className="bg-white border border-[#BCD3DF] rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="bg-[#002A3A] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#004A6D] text-[#00E3E6]">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight flex items-center gap-2">
                Filtro de Período Personalizado
              </h3>
              <p className="text-xs text-[#BCD3DF]">
                Escolha por Comboboxes Múltiplos ou por Intervalo Contínuo De/Até
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="text-[#BCD3DF] hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="bg-slate-100 p-1.5 flex gap-1 border-b border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => setMode('COMBO')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              mode === 'COMBO'
                ? 'bg-white text-[#004A6D] shadow-xs ring-1 ring-slate-200'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#004A6D]" />
            1. Seleção Múltipla (Comboboxes)
          </button>
          
          <button
            type="button"
            onClick={() => setMode('RANGE')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              mode === 'RANGE'
                ? 'bg-[#002A3A] text-[#00E3E6] shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            2. Intervalo Contínuo (De / Até)
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* MODO 1: COMBOBOXES */}
          {mode === 'COMBO' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                
                {/* Combobox 1: ANOS */}
                <div className="space-y-2" ref={yearRef}>
                  <label className="block text-xs font-black text-slate-600 uppercase tracking-wider">
                    Anos Selecionados
                  </label>
                  
                  <button
                    type="button"
                    onClick={() => setIsYearOpen(!isYearOpen)}
                    className={`w-full bg-slate-50 hover:bg-slate-100 border rounded-2xl px-4 py-3 text-left flex items-center justify-between transition-all focus:outline-none focus:ring-2 focus:ring-[#004A6D] ${
                      isYearOpen ? 'border-[#004A6D] ring-2 ring-[#004A6D]/20 shadow-sm' : 'border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Calendar className="w-4 h-4 text-[#004A6D] shrink-0" />
                      <span className="text-xs font-extrabold text-slate-800 truncate">
                        {getYearsSummaryLabel()}
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${isYearOpen ? 'rotate-180 text-[#004A6D]' : ''}`} />
                  </button>

                  {/* Menu de Anos */}
                  {isYearOpen && (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl shadow-inner p-3 space-y-2">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-[11px]">
                        <button
                          type="button"
                          onClick={selectAllYears}
                          className="text-[#004A6D] font-extrabold hover:underline"
                        >
                          Selecionar Todos (2009 - 2026)
                        </button>
                        <button
                          type="button"
                          onClick={selectOnlyCurrentYear}
                          className="text-slate-600 font-bold hover:underline"
                        >
                          Apenas 2026
                        </button>
                      </div>

                      <div className="max-h-60 overflow-y-auto pr-1 space-y-1">
                        {ALL_YEARS.map(year => {
                          const isSelected = tempYears.includes(year);
                          return (
                            <button
                              key={year}
                              type="button"
                              onClick={() => toggleYear(year)}
                              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                                isSelected
                                  ? 'bg-[#002A3A] text-white shadow-xs'
                                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/60'
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-[#00E3E6]" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-300" />
                                )}
                                <span>Ano {year}</span>
                              </span>
                              {isSelected && <span className="text-[10px] text-[#00E3E6] font-semibold">Ativo</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Combobox 2: MESES */}
                <div className="space-y-2" ref={monthRef}>
                  <label className="block text-xs font-black text-slate-600 uppercase tracking-wider">
                    Meses Selecionados
                  </label>

                  <button
                    type="button"
                    onClick={() => setIsMonthOpen(!isMonthOpen)}
                    className={`w-full bg-slate-50 hover:bg-slate-100 border rounded-2xl px-4 py-3 text-left flex items-center justify-between transition-all focus:outline-none focus:ring-2 focus:ring-[#004A6D] ${
                      isMonthOpen ? 'border-[#004A6D] ring-2 ring-[#004A6D]/20 shadow-sm' : 'border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Calendar className="w-4 h-4 text-[#00E3E6] shrink-0" />
                      <span className="text-xs font-extrabold text-slate-800 truncate">
                        {getMonthsSummaryLabel()}
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${isMonthOpen ? 'rotate-180 text-[#004A6D]' : ''}`} />
                  </button>

                  {/* Menu de Meses */}
                  {isMonthOpen && (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl shadow-inner p-3 space-y-2">
                      <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-slate-200 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setTempMonths([])}
                          className="text-[#004A6D] font-extrabold hover:underline"
                        >
                          Todos os Meses
                        </button>
                        <span className="text-slate-300">•</span>
                        <button
                          type="button"
                          onClick={() => setTempMonths([1, 2, 3, 4, 5, 6])}
                          className="text-slate-600 font-bold hover:underline"
                        >
                          1º Sem (Jan-Jun)
                        </button>
                        <span className="text-slate-300">•</span>
                        <button
                          type="button"
                          onClick={() => setTempMonths([7, 8, 9, 10, 11, 12])}
                          className="text-slate-600 font-bold hover:underline"
                        >
                          2º Sem (Jul-Dez)
                        </button>
                      </div>

                      <div className="max-h-60 overflow-y-auto pr-1 space-y-1">
                        {MONTH_NAMES_FULL.map((mName, idx) => {
                          const monthNum = idx + 1;
                          const isSelected = tempMonths.length === 0 || tempMonths.includes(monthNum);
                          const isStrictSelected = tempMonths.includes(monthNum);
                          return (
                            <button
                              key={monthNum}
                              type="button"
                              onClick={() => toggleMonth(monthNum)}
                              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                                isStrictSelected
                                  ? 'bg-[#004A6D] text-white shadow-xs'
                                  : tempMonths.length === 0
                                  ? 'bg-[#D9FBFF]/80 text-[#004A6D] border border-[#00E3E6]/40 hover:bg-[#D9FBFF]'
                                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/60'
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                {isStrictSelected ? (
                                  <CheckSquare className="w-4 h-4 text-[#00E3E6]" />
                                ) : tempMonths.length === 0 ? (
                                  <CheckSquare className="w-4 h-4 text-[#004A6D]" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-300" />
                                )}
                                <span>{mName}</span>
                              </span>
                              <span className="text-[10px] opacity-75">{monthNum}º mês</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* MODO 2: INTERVALO CONTÍNUO (DE / ATÉ) */}
          {mode === 'RANGE' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              
              <div className="bg-[#002A3A]/5 border border-[#004A6D]/20 rounded-2xl p-4">
                <div className="text-xs font-extrabold text-[#002A3A] mb-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#004A6D]" />
                  Defina o Intervalo Exato de Datas (De Mês/Ano até Mês/Ano)
                </div>
                <p className="text-[11px] text-slate-600">
                  Ideal para períodos que cruzam viradas de ano, como <strong>06/2025 a 05/2026</strong>.
                </p>
              </div>

              {/* Botão de Atalho Rápido para 06/2025 a 05/2026 */}
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">
                  Atalho Recomendado
                </label>
                <button
                  type="button"
                  onClick={applyPreset06_2025_to_05_2026}
                  className="bg-[#004A6D] text-white hover:bg-[#002A3A] font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition-all active:scale-95"
                >
                  <span>Filtrar 06/2025 a 05/2026 (12 Meses Contínuos)</span>
                  <Check className="w-4 h-4 text-[#00E3E6]" />
                </button>
              </div>

              {/* Seletores De / Até */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                
                {/* DE (Início) */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <span className="text-xs font-black text-[#004A6D] uppercase tracking-wider block border-b border-slate-200 pb-1.5">
                    DE (Mês / Ano Inicial)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">Mês</label>
                      <select
                        value={startMonth}
                        onChange={(e) => setStartMonth(parseInt(e.target.value, 10))}
                        className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#004A6D]"
                      >
                        {MONTH_NAMES_FULL.map((mName, idx) => (
                          <option key={idx + 1} value={idx + 1}>
                            {String(idx + 1).padStart(2, '0')} - {mName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">Ano</label>
                      <select
                        value={startYear}
                        onChange={(e) => setStartYear(parseInt(e.target.value, 10))}
                        className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#004A6D]"
                      >
                        {ALL_YEARS.map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* ATÉ (Fim) */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <span className="text-xs font-black text-[#004A6D] uppercase tracking-wider block border-b border-slate-200 pb-1.5">
                    ATÉ (Mês / Ano Final)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">Mês</label>
                      <select
                        value={endMonth}
                        onChange={(e) => setEndMonth(parseInt(e.target.value, 10))}
                        className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#004A6D]"
                      >
                        {MONTH_NAMES_FULL.map((mName, idx) => (
                          <option key={idx + 1} value={idx + 1}>
                            {String(idx + 1).padStart(2, '0')} - {mName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">Ano</label>
                      <select
                        value={endYear}
                        onChange={(e) => setEndYear(parseInt(e.target.value, 10))}
                        className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#004A6D]"
                      >
                        {ALL_YEARS.map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* Resumo do Filtro Ativo */}
          <div className="bg-[#002A3A]/5 border border-[#BCD3DF] rounded-2xl p-4 flex items-start gap-3">
            <Info className="w-4 h-4 text-[#004A6D] shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 leading-relaxed">
              <span className="font-extrabold text-[#002A3A]">Resumo da Seleção:</span>{' '}
              {mode === 'RANGE' ? (
                <span className="font-bold text-[#004A6D]">
                  Intervalo Contínuo de {String(startMonth).padStart(2, '0')}/{startYear} até {String(endMonth).padStart(2, '0')}/{endYear}
                </span>
              ) : (
                <span>{getYearsSummaryLabel()} &bull; {getMonthsSummaryLabel()}</span>
              )}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-extrabold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Resetar Padrão
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-all"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2.5 rounded-xl bg-[#004A6D] hover:bg-[#002A3A] text-white text-xs font-black shadow-md flex items-center gap-2 transition-all active:scale-95"
            >
              <Filter className="w-3.5 h-3.5 text-[#00E3E6]" />
              Aplicar Filtro ({mode === 'RANGE' ? 'Intervalo Contínuo' : 'Comboboxes'})
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
