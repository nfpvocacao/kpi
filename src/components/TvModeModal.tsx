import React, { useState, useEffect, useRef } from 'react';
import { 
  Tv, 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  X, 
  Clock, 
  RefreshCw,
  TrendingUp,
  Building2,
  HeartHandshake,
  Users,
  Target,
  Presentation,
  Settings,
  CheckSquare,
  Square,
  BarChart3,
  Table as TableIcon,
  LayoutGrid
} from 'lucide-react';
import { TabId } from './NavigationTabs';
import { TabDesempenho } from './tabs/TabDesempenho';
import { TabEmpresas } from './tabs/TabEmpresas';
import { TabDoadores } from './tabs/TabDoadores';
import { TabDoadoresAutomaticos } from './tabs/TabDoadoresAutomaticos';
import { TabBenchmarking } from './tabs/TabBenchmarking';
import { TabApresentacao } from './tabs/TabApresentacao';
import { PeriodFilter, MetricaMensal } from '../types';

interface TvModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  ultimaSincronizacao?: string;
  periodFilter: PeriodFilter;
  metricasFiltradas: MetricaMensal[];
  metricasAnterior: MetricaMensal[];
  periodoLabel: string;
}

export interface TvSlideConfig {
  id: string;
  tabId: TabId;
  label: string;
  category: string;
  fullTitle: string;
  icon: React.ElementType;
}

export const TV_SLIDES_MASTER: TvSlideConfig[] = [
  {
    id: 'desempenho_cards',
    tabId: 'desempenho',
    label: 'Desempenho: Cards & KPIs',
    category: 'Desempenho',
    fullTitle: 'Desempenho NFP — Indicadores Macro de Receita',
    icon: TrendingUp
  },
  {
    id: 'desempenho_grafico_evolucao',
    tabId: 'desempenho',
    label: 'Desempenho: Evolução Temporal',
    category: 'Desempenho',
    fullTitle: 'Desempenho NFP — Evolução Temporal Mês a Mês',
    icon: BarChart3
  },
  {
    id: 'empresas_tabela',
    tabId: 'empresas',
    label: 'Empresas: Tabela & Ranking Lojas',
    category: 'Empresas',
    fullTitle: 'Empresas Parceiras — Ranking de Lojas & Captação',
    icon: Building2
  },
  {
    id: 'doadores_tabela',
    tabId: 'doadores',
    label: 'Doadores: Base de Doadores (PF)',
    category: 'Doadores',
    fullTitle: 'Doadores de Pessoa Física — Base Auditada',
    icon: HeartHandshake
  },
  {
    id: 'doadores_modulo_lojas',
    tabId: 'doadores',
    label: 'Doadores: Módulo Doador x Lojas',
    category: 'Doadores',
    fullTitle: 'Doadores — Rastreio Doador x Lojas Frequentes',
    icon: LayoutGrid
  },
  {
    id: 'automaticos_painel',
    tabId: 'automaticos',
    label: 'Doadores Automáticos: Painel Completo',
    category: 'Automáticos',
    fullTitle: 'Doadores Automáticos — Série Temporal & Plenos',
    icon: Users
  },
  {
    id: 'benchmarking_painel',
    tabId: 'benchmarking',
    label: 'Benchmarking: SEFAZ & Simulador',
    category: 'Benchmarking',
    fullTitle: 'Benchmarking SEFAZ — Comparativo & Projeções',
    icon: Target
  },
  {
    id: 'apresentacao_cards',
    tabId: 'apresentacao',
    label: 'Apresentação: Cards & Visão Geral',
    category: 'Apresentação',
    fullTitle: 'Apresentação — Resumo Executivo Institucional',
    icon: Presentation
  },
  {
    id: 'apresentacao_empilhado',
    tabId: 'apresentacao',
    label: 'Apresentação: Gráfico Empilhado',
    category: 'Apresentação',
    fullTitle: 'Apresentação — Desmembramento por Modalidade/Período',
    icon: BarChart3
  },
  {
    id: 'apresentacao_tabela_suporte',
    tabId: 'apresentacao',
    label: 'Apresentação: Tabela Mês a Mês',
    category: 'Apresentação',
    fullTitle: 'Apresentação — Tabela Completa Consolidada SEFAZ',
    icon: TableIcon
  }
];


export const TvModeModal: React.FC<TvModeModalProps> = ({
  isOpen,
  onClose,
  ultimaSincronizacao,
  periodFilter,
  metricasFiltradas,
  metricasAnterior,
  periodoLabel
}) => {
  const [selectedSlideIds, setSelectedSlideIds] = useState<string[]>(() => {
    return TV_SLIDES_MASTER.map(s => s.id);
  });
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [intervalSeconds, setIntervalSeconds] = useState<number>(60); // Padrão: 1 minuto (60s)
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [horaAtual, setHoraAtual] = useState<string>('');

  const containerRef = useRef<HTMLDivElement>(null);

  // Lista de Slides Ativos baseada na seleção
  const activeSlides = React.useMemo(() => {
    const list = TV_SLIDES_MASTER.filter(s => selectedSlideIds.includes(s.id));
    return list.length > 0 ? list : TV_SLIDES_MASTER;
  }, [selectedSlideIds]);

  // Reset index se estiver fora dos limites quando activeSlides mudar
  useEffect(() => {
    if (currentIndex >= activeSlides.length) {
      setCurrentIndex(0);
      setProgress(0);
    }
  }, [activeSlides.length, currentIndex]);

  // Relógio em tempo real
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setHoraAtual(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const clockInterval = setInterval(updateTime, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Atalhos de teclado (ESC para fechar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        if (isConfigOpen) {
          setIsConfigOpen(false);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isConfigOpen, activeSlides.length]);

  // Timer de Rotação dos Slides (Carrossel)
  useEffect(() => {
    if (!isOpen || !isPlaying || isConfigOpen) {
      return;
    }

    const stepMs = 100;
    const totalSteps = (intervalSeconds * 1000) / stepMs;
    const increment = 100 / totalSteps;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev + increment >= 100) {
          setCurrentIndex(curr => (curr + 1) % activeSlides.length);
          return 0;
        }
        return prev + increment;
      });
    }, stepMs);

    return () => clearInterval(timer);
  }, [isOpen, isPlaying, intervalSeconds, activeSlides.length, isConfigOpen]);

  const handleNext = () => {
    setProgress(0);
    setCurrentIndex(prev => (prev + 1) % activeSlides.length);
  };

  const handlePrev = () => {
    setProgress(0);
    setCurrentIndex(prev => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  const toggleSlideSelection = (id: string) => {
    setSelectedSlideIds(prev => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev;
        return prev.filter(x => x !== id);
      }
      return [...prev, id];
    });
  };

  const toggleAllSlides = () => {
    if (selectedSlideIds.length === TV_SLIDES_MASTER.length) {
      setSelectedSlideIds([TV_SLIDES_MASTER[0].id]);
    } else {
      setSelectedSlideIds(TV_SLIDES_MASTER.map(s => s.id));
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error('Erro ao entrar em tela cheia:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(err => console.error(err));
      setIsFullscreen(false);
    }
  };

  if (!isOpen) return null;

  const currentSlide = activeSlides[currentIndex] || activeSlides[0];
  const CurrentIcon = currentSlide.icon;


  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#F6FAFD] text-[#002A3A] flex flex-col overflow-hidden font-['Raleway',sans-serif]"
    >
      {/* Top TV Bar Controls */}
      <header className="bg-[#002A3A] text-white px-4 lg:px-8 py-3 flex items-center justify-between gap-4 shadow-xl z-30 shrink-0 border-b border-[#00E3E6]/30">
        
        {/* Left: TV Mode Branding + Live Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#004A6D] px-3 py-1.5 rounded-xl border border-[#00E3E6]/40">
            <Tv className="w-4 h-4 text-[#00E3E6] animate-pulse" />
            <span className="font-extrabold text-xs tracking-wider uppercase text-white">
              Versão TV • Apresentação
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-600/90 text-white rounded-full text-[11px] font-black uppercase tracking-wider shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            <span>AO VIVO</span>
          </div>
        </div>

        {/* Center: Current Slide Indicator & Carousel Progress */}
        <div className="flex items-center gap-3 bg-[#001D29] px-4 py-1.5 rounded-xl border border-[#BCD3DF]/20">
          <CurrentIcon className="w-4 h-4 text-[#00E3E6]" />
          <span className="text-xs font-black text-white truncate max-w-[260px] sm:max-w-none">
            {currentIndex + 1}/{activeSlides.length} — {currentSlide.fullTitle}
          </span>
        </div>

        {/* Right: Controls & Config Settings */}
        <div className="flex items-center gap-3">
          
          {/* Botão Configurar Relatórios/Telas */}
          <button
            onClick={() => setIsConfigOpen(true)}
            className="flex items-center gap-1.5 bg-[#004A6D] hover:bg-[#00E3E6] text-[#00E3E6] hover:text-[#002A3A] px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border border-[#00E3E6]/40 cursor-pointer"
            title="Escolher quais relatórios e abas irão passar na TV"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>⚙️ Selecionar Telas ({selectedSlideIds.length}/{TV_SLIDES_MASTER.length})</span>
          </button>

          {/* Hora Atual / Última Atualização */}
          <div className="hidden xl:flex flex-col text-right pr-3 border-r border-[#BCD3DF]/20 text-xs">
            <span className="text-[10px] text-[#BCD3DF] font-bold flex items-center gap-1 justify-end">
              <Clock className="w-3 h-3 text-[#00E3E6]" /> {horaAtual}
            </span>
            <span className="text-[10px] text-white/80 font-medium truncate">
              {ultimaSincronizacao ? `Sinc: ${ultimaSincronizacao}` : 'Dados SEFAZ 24/7'}
            </span>
          </div>

          {/* Interval Selector */}
          <div className="flex items-center gap-1.5 bg-[#004A6D] px-2.5 py-1 rounded-lg border border-[#BCD3DF]/30 text-xs">
            <Clock className="w-3.5 h-3.5 text-[#00E3E6]" />
            <span className="text-[11px] text-[#BCD3DF] font-bold hidden sm:inline">Intervalo:</span>
            <select
              value={intervalSeconds}
              onChange={(e) => {
                setIntervalSeconds(Number(e.target.value));
                setProgress(0);
              }}
              className="bg-[#002A3A] text-white text-xs font-black rounded px-1.5 py-0.5 border border-[#00E3E6]/40 focus:outline-none cursor-pointer"
            >
              <option value={15}>15 seg</option>
              <option value={30}>30 seg</option>
              <option value={60}>1 min (Padrão)</option>
              <option value={120}>2 min</option>
              <option value={300}>5 min</option>
            </select>
          </div>

          {/* Navigation Controls (Play/Pause, Prev, Next) */}
          <div className="flex items-center gap-1 bg-[#004A6D] p-1 rounded-lg border border-[#BCD3DF]/30">
            <button
              onClick={handlePrev}
              className="p-1 hover:bg-[#002A3A] rounded text-white transition-colors cursor-pointer"
              title="Slide Anterior (Seta Esquerda)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsPlaying(prev => !prev)}
              className="p-1 hover:bg-[#002A3A] rounded text-[#00E3E6] transition-colors cursor-pointer"
              title={isPlaying ? 'Pausar Carrossel (Espaço)' : 'Iniciar Carrossel (Espaço)'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            <button
              onClick={handleNext}
              className="p-1 hover:bg-[#002A3A] rounded text-white transition-colors cursor-pointer"
              title="Próximo Slide (Seta Direita)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 bg-[#004A6D] hover:bg-[#002A3A] text-white rounded-lg transition-colors cursor-pointer border border-[#BCD3DF]/30"
            title={isFullscreen ? 'Sair da Tela Cheia' : 'Entrar em Tela Cheia'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-[#00E3E6]" /> : <Maximize2 className="w-4 h-4 text-[#00E3E6]" />}
          </button>

          {/* Close TV Mode */}
          <button
            onClick={onClose}
            className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors cursor-pointer shadow-2xs"
            title="Fechar Modo TV (ESC)"
          >
            <X className="w-4 h-4" />
          </button>

        </div>
      </header>

      {/* Progress Bar (Countdown till next tab switch) */}
      <div className="h-1.5 bg-[#001D29] w-full shrink-0 relative overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#00E3E6] via-[#EDCD01] to-[#00E04B] transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Sub-navigation Active Slides Bar */}
      <div className="bg-white border-b border-[#BCD3DF]/70 px-4 py-2 flex items-center justify-center gap-2 overflow-x-auto shrink-0 shadow-2xs">
        {activeSlides.map((slide, idx) => {
          const Icon = slide.icon;
          const isActive = idx === currentIndex;
          return (
            <button
              key={slide.id}
              onClick={() => {
                setCurrentIndex(idx);
                setProgress(0);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer whitespace-nowrap ${
                isActive 
                  ? 'bg-[#004A6D] text-white shadow-xs ring-1 ring-[#004A6D]' 
                  : 'bg-slate-100 text-[#004A6D] hover:bg-[#D9FBFF]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#00E3E6]' : 'text-[#004A6D]'}`} />
              <span>{slide.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Dashboard Content Area */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-8 max-w-7xl w-full mx-auto">
        {currentSlide.tabId === 'desempenho' && (
          <TabDesempenho
            metricasFiltradas={metricasFiltradas}
            metricasAnterior={metricasAnterior}
            periodoLabel={periodoLabel}
          />
        )}

        {currentSlide.tabId === 'empresas' && (
          <TabEmpresas 
            selectedYears={periodFilter.years} 
            selectedMonths={periodFilter.months}
          />
        )}

        {currentSlide.tabId === 'doadores' && (
          <TabDoadores 
            selectedYears={periodFilter.years}
            selectedMonths={periodFilter.months}
          />
        )}

        {currentSlide.tabId === 'automaticos' && (
          <TabDoadoresAutomaticos
            metricasFiltradas={metricasFiltradas}
            selectedYears={periodFilter.years}
            selectedMonths={periodFilter.months}
          />
        )}

        {currentSlide.tabId === 'benchmarking' && (
          <TabBenchmarking 
            selectedYears={periodFilter.years}
            selectedMonths={periodFilter.months}
          />
        )}

        {currentSlide.tabId === 'apresentacao' && (
          <TabApresentacao
            metricasFiltradas={metricasFiltradas}
            selectedYears={periodFilter.years}
            selectedMonths={periodFilter.months}
          />
        )}
      </main>

      {/* Modal de Configuração de Seleção de Relatórios/Telas */}
      {isConfigOpen && (
        <div className="fixed inset-0 bg-[#002A3A]/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#BCD3DF] rounded-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-5">
            
            <div className="flex items-start justify-between border-b border-[#BCD3DF]/60 pb-3">
              <div>
                <h2 className="text-lg font-black text-[#002A3A] font-['Raleway',sans-serif] flex items-center gap-2">
                  <Settings className="w-5 h-5 text-[#004A6D]" />
                  Configurar Apresentação na TV
                </h2>
                <p className="text-xs text-[#004A6D]/80 mt-0.5">
                  Marque os relatórios e telas que você deseja exibir durante a rotação na TV.
                </p>
              </div>

              <button
                onClick={() => setIsConfigOpen(false)}
                className="p-1.5 rounded-lg bg-[#F4F9FA] hover:bg-[#D9FBFF] text-[#004A6D] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between bg-[#F4F9FA] p-3 rounded-xl border border-[#BCD3DF]/60">
              <span className="text-xs font-bold text-[#004A6D]">
                Telas Selecionadas: <strong className="text-[#002A3A]">{selectedSlideIds.length} de {TV_SLIDES_MASTER.length}</strong>
              </span>
              <button
                onClick={toggleAllSlides}
                className="text-xs font-black text-[#004A6D] hover:text-[#002A3A] underline cursor-pointer"
              >
                {selectedSlideIds.length === TV_SLIDES_MASTER.length ? 'Desmarcar Todos' : 'Marcar Todos'}
              </button>
            </div>

            {/* Checkboxes por Categoria */}
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {TV_SLIDES_MASTER.map((slide) => {
                const isSelected = selectedSlideIds.includes(slide.id);
                const Icon = slide.icon;

                return (
                  <div
                    key={slide.id}
                    onClick={() => toggleSlideSelection(slide.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected 
                        ? 'bg-[#D9FBFF]/40 border-[#004A6D] shadow-2xs' 
                        : 'bg-white border-[#BCD3DF]/60 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-[#004A6D] text-[#00E3E6]' : 'bg-gray-100 text-gray-500'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-[#002A3A]">{slide.label}</div>
                        <div className="text-[11px] text-[#004A6D]/70">{slide.fullTitle}</div>
                      </div>
                    </div>

                    <div className="shrink-0 text-[#004A6D]">
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-[#004A6D]" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-[#BCD3DF]/60 flex justify-end">
              <button
                onClick={() => {
                  setIsConfigOpen(false);
                  setCurrentIndex(0);
                  setProgress(0);
                }}
                className="px-5 py-2 rounded-xl bg-[#004A6D] hover:bg-[#002A3A] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Aplicar e Iniciar TV
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
