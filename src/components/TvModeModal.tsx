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
  Presentation
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

const TAB_LIST: { id: TabId; label: string; fullTitle: string; icon: React.ElementType }[] = [
  {
    id: 'desempenho',
    label: 'Desempenho & Captação',
    fullTitle: 'Desempenho & Captação NFP',
    icon: TrendingUp
  },
  {
    id: 'empresas',
    label: 'Empresas Parceiras',
    fullTitle: 'Operações por Empresas Parceiras',
    icon: Building2
  },
  {
    id: 'doadores',
    label: 'Doadores Reais (PF)',
    fullTitle: 'Análise de Doadores de Pessoa Física',
    icon: HeartHandshake
  },
  {
    id: 'automaticos',
    label: 'Doadores Automáticos',
    fullTitle: 'Doadores Automáticos Cadastrados',
    icon: Users
  },
  {
    id: 'benchmarking',
    label: 'Benchmarking SEFAZ',
    fullTitle: 'Benchmarking SEFAZ & Simulador',
    icon: Target
  },
  {
    id: 'apresentacao',
    label: 'Apresentação',
    fullTitle: 'Painel de Apresentação Institucional',
    icon: Presentation
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
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [intervalSeconds, setIntervalSeconds] = useState<number>(60); // Padrão: 1 minuto (60s)
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [horaAtual, setHoraAtual] = useState<string>('');

  const containerRef = useRef<HTMLDivElement>(null);

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
        onClose();
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
  }, [isOpen, currentIndex]);

  // Timer de Rotação das Abas (Carrossel)
  useEffect(() => {
    if (!isOpen || !isPlaying) {
      return;
    }

    const stepMs = 100; // Atualiza barra a cada 100ms
    const totalSteps = (intervalSeconds * 1000) / stepMs;
    const increment = 100 / totalSteps;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev + increment >= 100) {
          setCurrentIndex(curr => (curr + 1) % TAB_LIST.length);
          return 0;
        }
        return prev + increment;
      });
    }, stepMs);

    return () => clearInterval(timer);
  }, [isOpen, isPlaying, intervalSeconds]);

  const handleNext = () => {
    setProgress(0);
    setCurrentIndex(prev => (prev + 1) % TAB_LIST.length);
  };

  const handlePrev = () => {
    setProgress(0);
    setCurrentIndex(prev => (prev - 1 + TAB_LIST.length) % TAB_LIST.length);
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

  const currentTab = TAB_LIST[currentIndex];
  const CurrentIcon = currentTab.icon;

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

        {/* Center: Current Tab Indicator & Carousel Progress */}
        <div className="flex items-center gap-3 bg-[#001D29] px-4 py-1.5 rounded-xl border border-[#BCD3DF]/20">
          <CurrentIcon className="w-4 h-4 text-[#00E3E6]" />
          <span className="text-xs font-black text-white truncate max-w-[220px] sm:max-w-none">
            {currentIndex + 1}/{TAB_LIST.length} — {currentTab.fullTitle}
          </span>
        </div>

        {/* Right: Controls & Timer Settings */}
        <div className="flex items-center gap-3">
          
          {/* Hora Atual / Última Atualização */}
          <div className="hidden lg:flex flex-col text-right pr-3 border-r border-[#BCD3DF]/20 text-xs">
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
              title="Aba Anterior (Seta Esquerda)"
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
              title="Próxima Aba (Seta Direita)"
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

      {/* Sub-navigation Tabs (Quick Switch Bar) */}
      <div className="bg-white border-b border-[#BCD3DF]/70 px-4 py-2 flex items-center justify-center gap-2 overflow-x-auto shrink-0 shadow-2xs">
        {TAB_LIST.map((tab, idx) => {
          const Icon = tab.icon;
          const isActive = idx === currentIndex;
          return (
            <button
              key={tab.id}
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
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Dashboard Content Area */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-8 max-w-7xl w-full mx-auto">
        {currentIndex === 0 && (
          <TabDesempenho
            metricasFiltradas={metricasFiltradas}
            metricasAnterior={metricasAnterior}
            periodoLabel={periodoLabel}
          />
        )}

        {currentIndex === 1 && (
          <TabEmpresas 
            selectedYears={periodFilter.years} 
            selectedMonths={periodFilter.months}
          />
        )}

        {currentIndex === 2 && (
          <TabDoadores />
        )}

        {currentIndex === 3 && (
          <TabDoadoresAutomaticos
            metricasFiltradas={metricasFiltradas}
            selectedYears={periodFilter.years}
            selectedMonths={periodFilter.months}
          />
        )}

        {currentIndex === 4 && (
          <TabBenchmarking 
            selectedYears={periodFilter.years}
            selectedMonths={periodFilter.months}
          />
        )}

        {currentIndex === 5 && (
          <TabApresentacao
            metricasFiltradas={metricasFiltradas}
            selectedYears={periodFilter.years}
            selectedMonths={periodFilter.months}
          />
        )}
      </main>

    </div>
  );
};
