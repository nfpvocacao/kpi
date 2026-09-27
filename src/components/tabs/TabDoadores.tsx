import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  HeartHandshake, 
  Search, 
  UserCheck, 
  Receipt, 
  DollarSign, 
  Store, 
  CheckCircle2, 
  Award,
  ArrowRight,
  Loader2,
  Calendar,
  X,
  TrendingUp,
  LineChart as LineIcon,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Sparkles,
  ArrowUp,
  ArrowUpDown,
  ArrowUp as ArrowUpIcon,
  ArrowDown as ArrowDownIcon
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Cell
} from 'recharts';
import { KPICard } from '../KPICard';
import { BrandBadge } from '../BrandBadge';
import { CopyChartButton } from '../CopyChartButton';
import { formatarMoeda, formatarNumero } from '../../data/mockDatabase';
import { useSupabaseDoadores, DoadorEstoqueLoja, DoadorRealSupabase } from '../../hooks/useSupabaseDoadores';

interface TabDoadoresProps {
  selectedYears?: number[];
  selectedMonths?: number[];
}

type SortField = 'nome' | 'cpf' | 'nivelScore' | 'cuponsAutomatica' | 'cuponsDireta' | 'totalCupons' | 'creditoAutomatica' | 'creditoDireta' | 'totalCredito';
type SortOrder = 'asc' | 'desc';

type LojaSortField = 'nomeEmpresa' | 'cuponsAuto' | 'cuponsDireta' | 'cupons' | 'valNF' | 'creditoAuto' | 'creditoDireta' | 'credito' | 'participacao';

export const TabDoadores: React.FC<TabDoadoresProps> = ({ selectedYears = [2026], selectedMonths = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalidadeFiltro, setModalidadeFiltro] = useState<'TODOS' | 'DOACAO_AUTOMATICA' | 'DOACAO'>('TODOS');
  const [selectedScoreLevel, setSelectedScoreLevel] = useState<string>('TODOS');
  const [selectedDoadorId, setSelectedDoadorId] = useState<string>('');
  const [lojasDoador, setLojasDoador] = useState<DoadorEstoqueLoja[]>([]);
  const [loadingLojas, setLoadingLojas] = useState<boolean>(false);

  // Sorting state for donor stores table
  const [lojaSortField, setLojaSortField] = useState<LojaSortField>('credito');
  const [lojaSortOrder, setLojaSortOrder] = useState<SortOrder>('desc');

  // Module Encapsulation State (Collapsible)
  const [isInteractiveModuleOpen, setIsInteractiveModuleOpen] = useState<boolean>(false);

  // Search Combobox state in module
  const [comboboxQuery, setComboboxQuery] = useState('');
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const comboboxRef = useRef<HTMLDivElement>(null);

  // Donor Historical Modal state
  const [isHistoricoModalOpen, setIsHistoricoModalOpen] = useState(false);
  const [historicoDoador, setHistoricoDoador] = useState<any[]>([]);
  const [loadingHistorico, setLoadingHistorico] = useState(false);

  const {
    doadores,
    totalDoadoresCount,
    kpis,
    isLoading,
    fetchLojasDoador,
    fetchDoadorHistoricoMensal
  } = useSupabaseDoadores({
    selectedYears,
    selectedMonths,
    searchTerm,
    modalidadeFilter: modalidadeFiltro
  });

  // Close combobox when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (comboboxRef.current && !comboboxRef.current.contains(e.target as Node)) {
        setIsComboboxOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Select first donor when list loads if none selected
  useEffect(() => {
    if (doadores.length > 0 && (!selectedDoadorId || !doadores.find(d => d.id === selectedDoadorId))) {
      setSelectedDoadorId(doadores[0].id);
    }
  }, [doadores, selectedDoadorId]);

  // Fetch store breakdown whenever selected donor changes
  useEffect(() => {
    if (!selectedDoadorId) return;
    let isMounted = true;
    setLoadingLojas(true);

    fetchLojasDoador(selectedDoadorId).then(res => {
      if (isMounted) {
        setLojasDoador(res);
        setLoadingLojas(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedDoadorId, selectedMonths.join(',')]);

  // Sorting state for table
  const [sortField, setSortField] = useState<SortField>('totalCredito');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Chart Ref for copying
  const chartRef = useRef<HTMLDivElement>(null);

  // Handle Sort column click
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Filter & Sort donors for the table
  const doadoresSorted = useMemo(() => {
    let filtered = doadores;

    // Filter by Search Term (Name or CPF formatted/unformatted)
    const q = searchTerm.trim().toLowerCase();
    if (q) {
      const qClean = q.replace(/\D/g, '');
      filtered = filtered.filter(d => {
        const matchName = d.nome.toLowerCase().includes(q);
        const matchCpfClean = qClean && d.cpf.replace(/\D/g, '').includes(qClean);
        const matchCpfRaw = d.cpf.toLowerCase().includes(q);
        return matchName || matchCpfClean || matchCpfRaw;
      });
    }

    // Filter by Score Level
    if (selectedScoreLevel !== 'TODOS') {
      filtered = filtered.filter(d => d.nivelScore === selectedScoreLevel);
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (valA === undefined || valA === null) valA = 0;
      if (valB === undefined || valB === null) valB = 0;

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = (valB || '').toString().toLowerCase();
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    return sorted;
  }, [doadores, searchTerm, selectedScoreLevel, sortField, sortOrder]);

  // Selected donor detail
  const doadorSelecionado = useMemo(() => {
    return doadores.find(d => d.id === selectedDoadorId) || doadores[0];
  }, [doadores, selectedDoadorId]);

  // Filtered donors list for combobox dropdown
  const comboboxFilteredDoadores = useMemo(() => {
    const q = comboboxQuery.trim().toLowerCase();
    if (!q) return doadores.slice(0, 50);
    const qClean = q.replace(/\D/g, '');
    return doadores.filter(d => {
      const matchName = d.nome.toLowerCase().includes(q);
      const matchCpfClean = qClean && d.cpf.replace(/\D/g, '').includes(qClean);
      const matchCpfRaw = d.cpf.toLowerCase().includes(q);
      return matchName || matchCpfClean || matchCpfRaw;
    }).slice(0, 50);
  }, [doadores, comboboxQuery]);

  // Open Historical Modal for selected donor
  const handleOpenHistorico = async () => {
    if (!doadorSelecionado) return;
    setIsHistoricoModalOpen(true);
    setLoadingHistorico(true);
    const hist = await fetchDoadorHistoricoMensal(doadorSelecionado.cpf);
    setHistoricoDoador(hist);
    setLoadingHistorico(false);
  };

  // Select donor and expand interactive module
  const handleSelectDoadorEInspecionar = (id: string) => {
    setSelectedDoadorId(id);
    setIsInteractiveModuleOpen(true);
  };

  // Clear Combobox Filter
  const handleClearCombobox = () => {
    setComboboxQuery('');
    setSearchTerm('');
  };

  // Chart data: Top 15 Doadores
  const top15Doadores = useMemo(() => {
    return doadores
      .slice(0, 15)
      .map(d => {
        const parts = d.nome.trim().split(' ');
        const shortName = parts[0] + (parts.length > 1 ? ' ' + parts[parts.length - 1][0] + '.' : '');
        return {
          id: d.id,
          name: shortName.slice(0, 15),
          credito: d.totalCredito,
          cupons: d.totalCupons,
          tipo: d.tipoDoacao
        };
      });
  }, [doadores]);

  // Modalidade Donut Data
  const modalidadeStats = useMemo(() => {
    const autoCredito = doadores
      .filter(d => d.tipoDoacao === 'DOACAO_AUTOMATICA')
      .reduce((acc, d) => acc + d.totalCredito, 0);
    const diretaCredito = doadores
      .filter(d => d.tipoDoacao === 'DOACAO')
      .reduce((acc, d) => acc + d.totalCredito, 0);

    return [
      { 
        name: 'Doação Automática (AUT)', 
        value: autoCredito, 
        color: '#004A6D', 
        count: doadores.filter(d => d.tipoDoacao === 'DOACAO_AUTOMATICA').length 
      },
      { 
        name: 'Doação Direta (Manual / App)', 
        value: diretaCredito, 
        color: '#00E3E6', 
        count: doadores.filter(d => d.tipoDoacao === 'DOACAO').length 
      }
    ];
  }, [doadores]);

  // Helper for Score Badge rendering
  const renderScoreBadge = (nivel: DoadorRealSupabase['nivelScore'], scorePct: number) => {
    switch (nivel) {
      case 'Elite (Diamante)':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-[#004A6D] text-[#00E3E6] border border-[#00E3E6]/40">
            <Sparkles className="w-3 h-3 text-[#00E3E6]" />
            Elite ({scorePct}%)
          </span>
        );
      case 'Alta Performance':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#EDCD01]/25 text-[#002A3A] border border-[#EDCD01]/50">
            🥇 Ouro ({scorePct}%)
          </span>
        );
      case 'Na Média':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#D9FBFF] text-[#004A6D] border border-[#BCD3DF]">
            🥈 Prata ({scorePct}%)
          </span>
        );
      case 'Em Desenvolvimento':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FF9F43]/20 text-[#D35400] border border-[#FF9F43]/40">
            🥉 Bronze ({scorePct}%)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-300">
            Iniciante ({scorePct}%)
          </span>
        );
    }
  };

  // Handle Loja Sort column click
  const handleLojaSort = (field: LojaSortField) => {
    if (lojaSortField === field) {
      setLojaSortOrder(lojaSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setLojaSortField(field);
      setLojaSortOrder('desc');
    }
  };

  // Sort lojas for selected donor
  const lojasSorted = useMemo(() => {
    const totalCreditoDoador = doadorSelecionado?.totalCredito > 0 ? doadorSelecionado.totalCredito : 1;
    return [...lojasDoador].sort((a, b) => {
      let valA: any = a[lojaSortField as keyof DoadorEstoqueLoja];
      let valB: any = b[lojaSortField as keyof DoadorEstoqueLoja];

      if (lojaSortField === 'participacao') {
        valA = (a.credito / totalCreditoDoador) * 100;
        valB = (b.credito / totalCreditoDoador) * 100;
      }

      if (valA === undefined || valA === null) valA = 0;
      if (valB === undefined || valB === null) valB = 0;

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = (valB || '').toString().toLowerCase();
        return lojaSortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      return lojaSortOrder === 'asc' ? valA - valB : valB - valA;
    });
  }, [lojasDoador, lojaSortField, lojaSortOrder, doadorSelecionado]);

  // Sort Icon Renderer for Main Doadores Table
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity ml-1" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUpIcon className="w-3 h-3 text-[#00E3E6] ml-1" />
    ) : (
      <ArrowDownIcon className="w-3 h-3 text-[#00E3E6] ml-1" />
    );
  };

  // Sort Icon Renderer for Lojas Table
  const renderLojaSortIcon = (field: LojaSortField) => {
    if (lojaSortField !== field) {
      return <ArrowUpDown className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity ml-1" />;
    }
    return lojaSortOrder === 'asc' ? (
      <ArrowUpIcon className="w-3 h-3 text-[#00E3E6] ml-1" />
    ) : (
      <ArrowDownIcon className="w-3 h-3 text-[#00E3E6] ml-1" />
    );
  };

  return (
    <div className="space-y-6 relative">
      
      {/* Title & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#002A3A] tracking-tight font-['Raleway',sans-serif]">
              Análise de Doadores Reais (Pessoas Físicas)
            </h1>
            <BrandBadge highlightText="trajetória" prefix="Construindo" suffix="social" colorVariant="yellow" size="sm" />
          </div>
          <p className="text-xs text-[#004A6D]/80">
            Base auditada e apurada de doações pessoais via <code className="bg-[#D9FBFF] px-1 py-0.5 rounded text-[#004A6D] font-mono font-bold">TipoDoacao IN (&apos;DOACAO_AUTOMATICA&apos;, &apos;DOACAO&apos;)</code> no Supabase.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#004A6D]">Modalidade:</span>
          <div className="bg-white border border-[#BCD3DF] rounded-xl p-1 flex items-center shadow-2xs">
            <button
              onClick={() => setModalidadeFiltro('TODOS')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                modalidadeFiltro === 'TODOS' ? 'bg-[#004A6D] text-white' : 'text-[#004A6D] hover:bg-[#D9FBFF]'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setModalidadeFiltro('DOACAO_AUTOMATICA')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                modalidadeFiltro === 'DOACAO_AUTOMATICA' ? 'bg-[#004A6D] text-white' : 'text-[#004A6D] hover:bg-[#D9FBFF]'
              }`}
            >
              Automática (AUT)
            </button>
            <button
              onClick={() => setModalidadeFiltro('DOACAO')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                modalidadeFiltro === 'DOACAO' ? 'bg-[#004A6D] text-white' : 'text-[#004A6D] hover:bg-[#D9FBFF]'
              }`}
            >
              Direta (Manual)
            </button>
          </div>
        </div>
      </div>

      {/* 4 KPIs for Tab 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          id="kpi-doadores-ativos"
          title="Doadores Reais Ativos"
          value={`${formatarNumero(kpis.totalDoadores)} Pessoas Físicas`}
          subValue="Base auditada e ativa no Supabase"
          icon={UserCheck}
          iconBgColor="bg-[#004A6D]"
          iconColor="text-white"
          badge={{ text: 'Pessoas Físicas', color: 'bg-[#D9FBFF] text-[#004A6D]' }}
        />

        <KPICard
          id="kpi-cupons-doados"
          title="Cupons Pessoais Doados"
          value={formatarNumero(kpis.totalCupons)}
          subValue="Notas voluntárias registradas"
          icon={Receipt}
          iconBgColor="bg-[#D9FBFF]"
          iconColor="text-[#004A6D]"
          badge={{ text: 'CPF Vinculado', color: 'bg-[#EDCD01]/30 text-[#002A3A]' }}
        />

        <KPICard
          id="kpi-credito-doadores"
          title="Crédito Gerado por Doadores"
          value={formatarMoeda(kpis.totalCredito)}
          subValue="Repasse efetivo da SEFAZ"
          icon={DollarSign}
          iconBgColor="bg-[#00E04B]/20"
          iconColor="text-[#006E24]"
          badge={{ text: 'Impacto Social', color: 'bg-[#FD3168] text-white' }}
        />

        <KPICard
          id="kpi-ticket-doador"
          title="Ticket Médio / Doador"
          value={formatarMoeda(kpis.ticketMedio)}
          subValue={kpis.totalCupons > 0 ? `${formatarMoeda(kpis.totalCredito / kpis.totalCupons)} / nota fiscal` : "Retorno médio por pessoa"}
          icon={HeartHandshake}
          iconBgColor="bg-[#EDCD01]/25"
          iconColor="text-[#002A3A]"
          badge={{ text: 'LTV Médio', color: 'bg-[#00E3E6]/30 text-[#004A6D]' }}
        />
      </div>

      {/* Top 15 Doadores Bar Chart (Full Width, Com Botão de Copiar Gráfico) */}
      <div ref={chartRef} className="bg-white border border-[#BCD3DF]/60 rounded-2xl p-5 shadow-2xs">
        <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-[#F0F5F8]">
          <div>
            <h2 className="text-base font-bold text-[#002A3A] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#EDCD01]" />
              Top 15 Doadores por Crédito Gerado (R$)
            </h2>
            <p className="text-xs text-[#004A6D]/70">
              Pessoas físicas com maior volume de crédito repassado à Vocação
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-xs font-semibold text-[#004A6D] bg-[#D9FBFF] px-2.5 py-1 rounded-full">
              Clique em um doador para inspecionar
            </span>
            <CopyChartButton 
              chartRef={chartRef} 
              title="Top_15_Doadores_Credito" 
            />
          </div>
        </div>

        <div className="h-72 w-full">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-xs text-[#004A6D] font-bold gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Carregando doadores do Supabase...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top15Doadores} margin={{ top: 10, right: 10, left: 10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8F1F5" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: '#004A6D', fontWeight: 600 }} 
                  angle={-25} 
                  textAnchor="end" 
                  height={50} 
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#004A6D' }} 
                  tickFormatter={(val) => `R$ ${val}`} 
                />
                <Tooltip 
                  formatter={(val: any) => [formatarMoeda(Number(val))]}
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    color: '#002A3A', 
                    borderRadius: '12px', 
                    border: '1px solid #BCD3DF', 
                    boxShadow: '0 10px 25px -5px rgba(0, 42, 58, 0.15), 0 8px 10px -6px rgba(0, 42, 58, 0.1)',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    padding: '10px 14px'
                  }}
                  labelStyle={{ color: '#002A3A', fontWeight: 'bold', marginBottom: '4px' }}
                />
                <Bar 
                  dataKey="credito" 
                  name="Crédito Gerado"
                  radius={[6, 6, 0, 0]}
                  onClick={(data: any) => {
                    if (data?.id) handleSelectDoadorEInspecionar(data.id);
                  }}
                  className="cursor-pointer"
                >
                  {top15Doadores.map((entry) => (
                    <Cell 
                      key={entry.id} 
                      fill={entry.id === selectedDoadorId ? '#00E3E6' : '#004A6D'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* TABELA PRINCIPAL DE DOADORES REAIS COM ORDENAÇÃO COMPLETA */}
      <div className="bg-white border border-[#BCD3DF]/60 rounded-2xl p-5 shadow-2xs space-y-4">
        
        {/* Table Header: Search Input + Score Level Filter Pills */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-[#F0F5F8]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#004A6D]/60 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar doador por Nome ou CPF (ex: 225.973 ou Murilo)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-[#F4F9FA] border border-[#BCD3DF] rounded-xl text-xs sm:text-sm font-medium text-[#002A3A] focus:outline-none focus:border-[#004A6D]"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#004A6D] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 5-Level Score Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            <span className="text-xs font-bold text-[#004A6D] flex items-center gap-1 shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Score:
            </span>
            <button
              onClick={() => setSelectedScoreLevel('TODOS')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors shrink-0 cursor-pointer ${
                selectedScoreLevel === 'TODOS' ? 'bg-[#004A6D] text-white' : 'bg-[#F4F9FA] text-[#004A6D] border border-[#BCD3DF] hover:bg-[#D9FBFF]'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setSelectedScoreLevel('Elite (Diamante)')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors shrink-0 cursor-pointer ${
                selectedScoreLevel === 'Elite (Diamante)' ? 'bg-[#004A6D] text-[#00E3E6]' : 'bg-[#F4F9FA] text-[#004A6D] border border-[#BCD3DF] hover:bg-[#D9FBFF]'
              }`}
            >
              💎 Elite
            </button>
            <button
              onClick={() => setSelectedScoreLevel('Alta Performance')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors shrink-0 cursor-pointer ${
                selectedScoreLevel === 'Alta Performance' ? 'bg-[#EDCD01] text-[#002A3A]' : 'bg-[#F4F9FA] text-[#004A6D] border border-[#BCD3DF] hover:bg-[#D9FBFF]'
              }`}
            >
              🥇 Ouro
            </button>
            <button
              onClick={() => setSelectedScoreLevel('Na Média')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors shrink-0 cursor-pointer ${
                selectedScoreLevel === 'Na Média' ? 'bg-[#004A6D] text-white' : 'bg-[#F4F9FA] text-[#004A6D] border border-[#BCD3DF] hover:bg-[#D9FBFF]'
              }`}
            >
              🥈 Prata
            </button>
            <button
              onClick={() => setSelectedScoreLevel('Em Desenvolvimento')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors shrink-0 cursor-pointer ${
                selectedScoreLevel === 'Em Desenvolvimento' ? 'bg-[#FF9F43] text-white' : 'bg-[#F4F9FA] text-[#004A6D] border border-[#BCD3DF] hover:bg-[#D9FBFF]'
              }`}
            >
              🥉 Bronze
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-[#004A6D] font-bold flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Carregando doadores reais do Supabase...
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F4F9FA] border-b border-[#BCD3DF] text-[#004A6D] font-bold uppercase text-[10px] sm:text-[11px]">
                  
                  {/* Doador(a) */}
                  <th 
                    onClick={() => handleSort('nome')}
                    className="py-2.5 px-3 cursor-pointer select-none group hover:bg-[#EAF5F8] transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Doador(a)</span>
                      {renderSortIcon('nome')}
                    </div>
                  </th>

                  {/* CPF */}
                  <th 
                    onClick={() => handleSort('cpf')}
                    className="py-2.5 px-3 cursor-pointer select-none group hover:bg-[#EAF5F8] transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>CPF</span>
                      {renderSortIcon('cpf')}
                    </div>
                  </th>

                  {/* Classificação (Score) */}
                  <th 
                    onClick={() => handleSort('nivelScore')}
                    className="py-2.5 px-3 cursor-pointer select-none group hover:bg-[#EAF5F8] transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Classificação (Score)</span>
                      {renderSortIcon('nivelScore')}
                    </div>
                  </th>

                  {/* Doação Automática (Notas) */}
                  <th 
                    onClick={() => handleSort('cuponsAutomatica')}
                    className="py-2.5 px-3 text-center bg-[#004A6D]/5 border-l border-r border-[#BCD3DF]/50 cursor-pointer select-none group hover:bg-[#004A6D]/10 transition-colors"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Doação Automática (Notas)</span>
                      {renderSortIcon('cuponsAutomatica')}
                    </div>
                  </th>

                  {/* Doação Direta (Notas) */}
                  <th 
                    onClick={() => handleSort('cuponsDireta')}
                    className="py-2.5 px-3 text-center bg-[#00E3E6]/10 border-r border-[#BCD3DF]/50 cursor-pointer select-none group hover:bg-[#00E3E6]/20 transition-colors"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Doação Direta (Notas)</span>
                      {renderSortIcon('cuponsDireta')}
                    </div>
                  </th>

                  {/* Total Notas */}
                  <th 
                    onClick={() => handleSort('totalCupons')}
                    className="py-2.5 px-3 text-right cursor-pointer select-none group hover:bg-[#EAF5F8] transition-colors"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Total Notas</span>
                      {renderSortIcon('totalCupons')}
                    </div>
                  </th>

                  {/* Crédito Doação Automática */}
                  <th 
                    onClick={() => handleSort('creditoAutomatica')}
                    className="py-2.5 px-3 text-right bg-[#004A6D]/5 border-l border-r border-[#BCD3DF]/50 cursor-pointer select-none group hover:bg-[#004A6D]/10 transition-colors"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Crédito Doação Automática</span>
                      {renderSortIcon('creditoAutomatica')}
                    </div>
                  </th>

                  {/* Crédito Doação Direta */}
                  <th 
                    onClick={() => handleSort('creditoDireta')}
                    className="py-2.5 px-3 text-right bg-[#00E3E6]/10 border-r border-[#BCD3DF]/50 cursor-pointer select-none group hover:bg-[#00E3E6]/20 transition-colors"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Crédito Doação Direta</span>
                      {renderSortIcon('creditoDireta')}
                    </div>
                  </th>

                  {/* Crédito Total */}
                  <th 
                    onClick={() => handleSort('totalCredito')}
                    className="py-2.5 px-3 text-right cursor-pointer select-none group hover:bg-[#EAF5F8] transition-colors"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Crédito Total</span>
                      {renderSortIcon('totalCredito')}
                    </div>
                  </th>

                  <th className="py-2.5 px-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F5F8]">
                {doadoresSorted.map((d) => {
                  const isSelected = d.id === selectedDoadorId;
                  return (
                    <tr 
                      key={d.id} 
                      className={`transition-colors cursor-pointer ${
                        isSelected ? 'bg-[#D9FBFF]/40 font-semibold' : 'hover:bg-[#F8FCFD]'
                      }`}
                      onClick={() => handleSelectDoadorEInspecionar(d.id)}
                    >
                      <td className="py-3 px-3 font-bold text-[#002A3A]">
                        {d.nome}
                      </td>
                      <td className="py-3 px-3 font-mono text-[#004A6D]">
                        {d.cpf}
                      </td>
                      <td className="py-3 px-3">
                        {renderScoreBadge(d.nivelScore, d.scorePct)}
                      </td>
                      {/* Coluna 31 - Doação Automática (Notas) */}
                      <td className="py-3 px-3 text-center font-bold text-[#004A6D] bg-[#004A6D]/5 border-l border-r border-[#BCD3DF]/30">
                        {d.cuponsAutomatica || 0}
                      </td>
                      {/* Coluna 10 - Doação Direta / Manual (Notas) */}
                      <td className="py-3 px-3 text-center font-bold text-[#002A3A] bg-[#00E3E6]/10 border-r border-[#BCD3DF]/30">
                        {d.cuponsDireta || 0}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-[#002A3A]">
                        {formatarNumero(d.totalCupons)}
                      </td>
                      {/* Coluna Crédito Doação Automática */}
                      <td className="py-3 px-3 text-right font-black text-[#004A6D] bg-[#004A6D]/5 border-l border-r border-[#BCD3DF]/30">
                        {formatarMoeda(d.creditoAutomatica)}
                      </td>
                      {/* Coluna Crédito Doação Direta / Manual */}
                      <td className="py-3 px-3 text-right font-black text-[#006E24] bg-[#00E3E6]/10 border-r border-[#BCD3DF]/30">
                        {formatarMoeda(d.creditoDireta)}
                      </td>
                      <td className="py-3 px-3 text-right font-black text-[#002A3A]">
                        {formatarMoeda(d.totalCredito)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectDoadorEInspecionar(d.id);
                          }}
                          className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-white border border-[#BCD3DF] hover:border-[#004A6D] text-[#004A6D] hover:bg-[#D9FBFF] transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          Ver Lojas <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MÓDULO INTERATIVO ENCAPSULADO & COLAPSÁVEL: DOADOR X LOJAS */}
      <div className="bg-gradient-to-br from-[#F8FCFD] to-[#EBF6F9] border-2 border-[#00E3E6]/60 rounded-2xl shadow-xs overflow-hidden transition-all">
        
        {/* Module Header Bar (Collapsible Toggle) */}
        <div 
          onClick={() => setIsInteractiveModuleOpen(!isInteractiveModuleOpen)}
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none hover:bg-[#D9FBFF]/20 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#004A6D] text-[#00E3E6] flex items-center justify-center font-bold shadow-xs">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-[#004A6D] text-[#00E3E6]">
                  Módulo Interativo Exclusivo
                </span>
                <span className="text-xs font-bold text-[#004A6D]">Cruzamento Inteligente</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-[#002A3A] tracking-tight font-['Raleway',sans-serif]">
                Doador x Lojas & Estabelecimentos Frequentes
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {doadorSelecionado && (
              <span className="hidden sm:inline-block text-xs font-extrabold text-[#004A6D] bg-white border border-[#BCD3DF] px-3 py-1.5 rounded-xl shadow-2xs">
                Doador Ativo: <strong className="text-[#002A3A]">{doadorSelecionado.nome.split(' ')[0]} ({formatarMoeda(doadorSelecionado.totalCredito)})</strong>
              </span>
            )}
            <button
              type="button"
              className="bg-[#004A6D] hover:bg-[#002A3A] text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-xs"
            >
              <span>{isInteractiveModuleOpen ? 'Recolher Módulo' : 'Expandir Módulo'}</span>
              {isInteractiveModuleOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Encapsulated Body */}
        {isInteractiveModuleOpen && doadorSelecionado && (
          <div className="p-5 sm:p-6 border-t border-[#BCD3DF] space-y-6 bg-white/70">
            
            {/* Top Selector + Clear Filter Button */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#BCD3DF]">
              <p className="text-xs text-[#004A6D]/80">
                Digite o Nome ou CPF para selecionar e auditar os estabelecimentos e o histórico acumulado do doador.
              </p>

              {/* Interactive Searchable Combobox with Clear Button */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <label className="text-xs font-bold text-[#004A6D] whitespace-nowrap">
                  Escolher Doador:
                </label>

                <div ref={comboboxRef} className="relative w-full sm:w-80">
                  <div className="relative">
                    <Search className="w-4 h-4 text-[#004A6D] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Digite Nome ou CPF..."
                      value={comboboxQuery || (isComboboxOpen ? '' : `${doadorSelecionado.nome} (${doadorSelecionado.cpf})`)}
                      onFocus={() => {
                        setIsComboboxOpen(true);
                        setComboboxQuery('');
                      }}
                      onChange={(e) => {
                        setComboboxQuery(e.target.value);
                        if (!isComboboxOpen) setIsComboboxOpen(true);
                      }}
                      className="w-full pl-9 pr-14 py-2 bg-white border-2 border-[#004A6D] rounded-xl text-xs font-bold text-[#002A3A] shadow-xs focus:ring-2 focus:ring-[#00E3E6] outline-none"
                    />
                    
                    {/* Clear Filter Button inside Combobox */}
                    {(comboboxQuery || searchTerm) && (
                      <button
                        type="button"
                        onClick={handleClearCombobox}
                        title="Limpar filtro de seleção"
                        className="absolute right-7 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FD3168] cursor-pointer p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <ChevronDown className="w-4 h-4 text-[#004A6D] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {isComboboxOpen && (
                    <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-[#BCD3DF] rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-[#F0F5F8]">
                      {comboboxFilteredDoadores.length === 0 ? (
                        <div className="p-3 text-xs text-[#004A6D]/70 font-semibold text-center">
                          Nenhum doador encontrado.
                        </div>
                      ) : (
                        comboboxFilteredDoadores.map((d) => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => {
                              setSelectedDoadorId(d.id);
                              setIsComboboxOpen(false);
                              setComboboxQuery('');
                            }}
                            className={`w-full text-left p-2.5 hover:bg-[#D9FBFF]/60 transition-colors flex items-center justify-between cursor-pointer ${
                              d.id === selectedDoadorId ? 'bg-[#D9FBFF] font-bold' : ''
                            }`}
                          >
                            <div className="truncate pr-2">
                              <span className="text-xs font-bold text-[#002A3A] block truncate">{d.nome}</span>
                              <span className="text-[10px] font-mono text-[#004A6D]">{d.cpf}</span>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-xs font-black text-[#004A6D] block">{formatarMoeda(d.totalCredito)}</span>
                              <span className="text-[10px] text-[#004A6D]/70">{d.totalCupons} cupons</span>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Explicit Clear Filter Button */}
                {(searchTerm || comboboxQuery) && (
                  <button
                    type="button"
                    onClick={handleClearCombobox}
                    className="text-xs font-bold text-[#FD3168] hover:underline cursor-pointer px-2 py-1"
                  >
                    Limpar Filtro
                  </button>
                )}
              </div>
            </div>

            {/* Selected Donor Profile Summary */}
            <div className="bg-white rounded-xl p-4 border border-[#BCD3DF] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 items-center flex-1">
                <div>
                  <span className="text-[10px] font-bold text-[#004A6D]/60 uppercase block">Nome Completo / CPF</span>
                  <span className="text-sm font-extrabold text-[#002A3A] block truncate">{doadorSelecionado.nome}</span>
                  <span className="text-[11px] font-mono text-[#004A6D]">{doadorSelecionado.cpf}</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#004A6D]/60 uppercase block">Score de Desempenho</span>
                  <div className="mt-0.5">
                    {renderScoreBadge(doadorSelecionado.nivelScore, doadorSelecionado.scorePct)}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#004A6D]/60 uppercase block">Modalidade NFP</span>
                  <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold mt-0.5 ${
                    doadorSelecionado.tipoDoacao === 'DOACAO_AUTOMATICA' ? 'bg-[#004A6D] text-white' : 'bg-[#00E3E6] text-[#002A3A]'
                  }`}>
                    {doadorSelecionado.tipoDoacao === 'DOACAO_AUTOMATICA' ? 'Automática (AUT)' : 'Direta / Manual'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#004A6D]/60 uppercase block">Total Cupons Gerados</span>
                  <span className="text-sm font-black text-[#004A6D]">{formatarNumero(doadorSelecionado.totalCupons)} notas</span>
                  <span className="text-[10px] font-bold text-[#004A6D]/80 block">
                    {doadorSelecionado.cuponsAutomatica || 0} AUT • {doadorSelecionado.cuponsDireta || 0} Diretas
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#004A6D]/60 uppercase block">Crédito Total Apurado</span>
                  <span className="text-base font-black text-[#002A3A]">{formatarMoeda(doadorSelecionado.totalCredito)}</span>
                  <span className="text-[10px] font-bold text-[#006E24] block">
                    {formatarMoeda(doadorSelecionado.creditoAutomatica)} AUT • {formatarMoeda(doadorSelecionado.creditoDireta)} Direta
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-[#BCD3DF] md:pl-4">
                {/* Action Button: Ver Histórico Mensal */}
                <button
                  type="button"
                  onClick={handleOpenHistorico}
                  className="bg-[#004A6D] hover:bg-[#002A3A] text-white px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <LineIcon className="w-4 h-4 text-[#00E3E6]" />
                  <span>Ver Histórico Mensal</span>
                </button>
              </div>
            </div>

            {/* Stores Breakdown for this Donor */}
            <div className="bg-white rounded-xl border border-[#BCD3DF] shadow-2xs overflow-hidden">
              <div className="px-4 py-3 bg-[#F4F9FA] border-b border-[#BCD3DF] flex items-center justify-between">
                <span className="text-xs font-bold text-[#004A6D] flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-[#00E3E6]" />
                  Lojas e Estabelecimentos de Compra de {doadorSelecionado.nome.split(' ')[0]}
                </span>
                <span className="text-[11px] font-semibold text-[#004A6D]/70">
                  {lojasDoador.length} estabelecimentos com cupons confirmados
                </span>
              </div>

              <div className="overflow-x-auto">
                {loadingLojas ? (
                  <div className="p-8 text-center text-xs text-[#004A6D] font-bold flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Auditando estabelecimentos do doador...
                  </div>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-white border-b border-[#F0F5F8] text-[#004A6D] font-bold uppercase text-[10px]">
                        
                        {/* Estabelecimento / Loja (A-Z) */}
                        <th 
                          onClick={() => handleLojaSort('nomeEmpresa')}
                          className="py-2.5 px-4 cursor-pointer select-none group hover:bg-[#F4F9FA] transition-colors"
                        >
                          <div className="flex items-center gap-1">
                            <span>Estabelecimento / Loja Parceira</span>
                            {renderLojaSortIcon('nomeEmpresa')}
                          </div>
                        </th>

                        {/* Cupons Automática */}
                        <th 
                          onClick={() => handleLojaSort('cuponsAuto')}
                          className="py-2.5 px-3 text-center bg-[#004A6D]/5 border-l border-r border-[#BCD3DF]/30 cursor-pointer select-none group hover:bg-[#004A6D]/10 transition-colors"
                        >
                          <div className="flex items-center justify-center gap-1">
                            <span>Cupons Automática</span>
                            {renderLojaSortIcon('cuponsAuto')}
                          </div>
                        </th>

                        {/* Cupons Direta */}
                        <th 
                          onClick={() => handleLojaSort('cuponsDireta')}
                          className="py-2.5 px-3 text-center bg-[#00E3E6]/10 border-r border-[#BCD3DF]/30 cursor-pointer select-none group hover:bg-[#00E3E6]/20 transition-colors"
                        >
                          <div className="flex items-center justify-center gap-1">
                            <span>Cupons Direta</span>
                            {renderLojaSortIcon('cuponsDireta')}
                          </div>
                        </th>

                        {/* Total Cupons */}
                        <th 
                          onClick={() => handleLojaSort('cupons')}
                          className="py-2.5 px-3 text-right cursor-pointer select-none group hover:bg-[#F4F9FA] transition-colors"
                        >
                          <div className="flex items-center justify-end gap-1">
                            <span>Total Cupons</span>
                            {renderLojaSortIcon('cupons')}
                          </div>
                        </th>

                        {/* Valor Compras */}
                        <th 
                          onClick={() => handleLojaSort('valNF')}
                          className="py-2.5 px-3 text-right cursor-pointer select-none group hover:bg-[#F4F9FA] transition-colors"
                        >
                          <div className="flex items-center justify-end gap-1">
                            <span>Valor Compras (NF)</span>
                            {renderLojaSortIcon('valNF')}
                          </div>
                        </th>

                        {/* Crédito Automática */}
                        <th 
                          onClick={() => handleLojaSort('creditoAuto')}
                          className="py-2.5 px-3 text-right bg-[#004A6D]/5 border-l border-r border-[#BCD3DF]/30 cursor-pointer select-none group hover:bg-[#004A6D]/10 transition-colors"
                        >
                          <div className="flex items-center justify-end gap-1">
                            <span>Crédito Automática</span>
                            {renderLojaSortIcon('creditoAuto')}
                          </div>
                        </th>

                        {/* Crédito Doação Direta */}
                        <th 
                          onClick={() => handleLojaSort('creditoDireta')}
                          className="py-2.5 px-3 text-right bg-[#00E3E6]/10 border-r border-[#BCD3DF]/30 cursor-pointer select-none group hover:bg-[#00E3E6]/20 transition-colors"
                        >
                          <div className="flex items-center justify-end gap-1">
                            <span>Crédito Doação Direta</span>
                            {renderLojaSortIcon('creditoDireta')}
                          </div>
                        </th>

                        {/* Crédito Total */}
                        <th 
                          onClick={() => handleLojaSort('credito')}
                          className="py-2.5 px-3 text-right cursor-pointer select-none group hover:bg-[#F4F9FA] transition-colors"
                        >
                          <div className="flex items-center justify-end gap-1">
                            <span>Crédito Total</span>
                            {renderLojaSortIcon('credito')}
                          </div>
                        </th>

                        {/* Participação */}
                        <th 
                          onClick={() => handleLojaSort('participacao')}
                          className="py-2.5 px-4 text-center cursor-pointer select-none group hover:bg-[#F4F9FA] transition-colors"
                        >
                          <div className="flex items-center justify-center gap-1">
                            <span>Participação</span>
                            {renderLojaSortIcon('participacao')}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0F5F8]">
                      {lojasSorted.map((loja, idx) => {
                        const totalCreditoDoador = doadorSelecionado.totalCredito > 0 ? doadorSelecionado.totalCredito : 1;
                        const percCredito = (loja.credito / totalCreditoDoador) * 100;

                        return (
                          <tr key={`${loja.cnpj}-${idx}`} className="hover:bg-[#F8FCFD] transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-bold text-[#002A3A] flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#00E3E6]"></span>
                                {loja.nomeEmpresa}
                                <span className="text-[10px] font-mono text-[#004A6D]/60 font-normal">({loja.cnpj})</span>
                              </div>
                            </td>
                            {/* Cupons Automática */}
                            <td className="py-3 px-3 text-center font-bold text-[#004A6D] bg-[#004A6D]/5 border-l border-r border-[#BCD3DF]/30">
                              {loja.cuponsAuto || 0}
                            </td>
                            {/* Cupons Direta */}
                            <td className="py-3 px-3 text-center font-bold text-[#002A3A] bg-[#00E3E6]/10 border-r border-[#BCD3DF]/30">
                              {loja.cuponsDireta || 0}
                            </td>
                            <td className="py-3 px-3 text-right font-bold text-[#004A6D]">
                              {loja.cupons}
                            </td>
                            <td className="py-3 px-3 text-right font-medium text-[#002A3A]">
                              {formatarMoeda(loja.valNF)}
                            </td>
                            {/* Crédito Automática */}
                            <td className="py-3 px-3 text-right font-black text-[#004A6D] bg-[#004A6D]/5 border-l border-r border-[#BCD3DF]/30">
                              {formatarMoeda(loja.creditoAuto || 0)}
                            </td>
                            {/* Crédito Doação Direta */}
                            <td className="py-3 px-3 text-right font-black text-[#006E24] bg-[#00E3E6]/10 border-r border-[#BCD3DF]/30">
                              {formatarMoeda(loja.creditoDireta || 0)}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <span className="font-black text-sm text-[#002A3A]">
                                {formatarMoeda(loja.credito)}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-14 bg-[#EEF5F8] rounded-full h-1.5 overflow-hidden">
                                  <div 
                                    className="bg-[#004A6D] h-full rounded-full" 
                                    style={{ width: `${Math.min(Math.max(percCredito, 0), 100)}%` }}
                                  ></div>
                                </div>
                                <span className="text-[10px] font-bold text-[#004A6D]">
                                  {percCredito < 1 && percCredito > 0 ? percCredito.toFixed(1) : percCredito.toFixed(0)}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* MODAL HISTÓRICO MENSAL DO DOADOR */}
      {isHistoricoModalOpen && doadorSelecionado && (
        <div className="fixed inset-0 z-50 bg-[#002A3A]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#BCD3DF] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 p-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#BCD3DF]/50 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#004A6D] text-[#00E3E6]">
                    Evolução Histórica
                  </span>
                  <span className="text-xs font-mono font-bold text-[#004A6D]">{doadorSelecionado.cpf}</span>
                </div>
                <h2 className="text-xl font-black text-[#002A3A] tracking-tight mt-1 font-['Raleway',sans-serif]">
                  Histórico de Créditos: {doadorSelecionado.nome}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoricoModalOpen(false)}
                className="w-9 h-9 bg-[#F4F9FA] hover:bg-[#EBF6F9] text-[#004A6D] rounded-xl flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingHistorico ? (
              <div className="p-12 text-center text-xs text-[#004A6D] font-bold flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Buscando histórico mensal do doador...
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Historical Line Chart */}
                <div className="bg-[#F8FCFD] border border-[#BCD3DF] rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#002A3A] flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-[#00E3E6]" />
                      Evolução de Créditos Doados Mês a Mês (R$)
                    </span>
                    <span className="text-[11px] font-semibold text-[#004A6D]">
                      {historicoDoador.length} meses registrados
                    </span>
                  </div>

                  <div className="h-56 w-full pt-2">
                    {historicoDoador.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-xs text-[#004A6D]">
                        Sem histórico prévio cadastrado.
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={historicoDoador} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8F1F5" />
                          <XAxis dataKey="mesNome" tick={{ fontSize: 11, fill: '#004A6D' }} />
                          <YAxis tick={{ fontSize: 11, fill: '#004A6D' }} tickFormatter={(val) => `R$ ${val}`} />
                          <Tooltip 
                            formatter={(val: any) => [formatarMoeda(Number(val)), 'Crédito Gerado']}
                            contentStyle={{ 
                              backgroundColor: '#FFFFFF', 
                              color: '#002A3A', 
                              borderRadius: '12px', 
                              border: '1px solid #BCD3DF',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              padding: '8px 12px'
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="credito" 
                            stroke="#004A6D" 
                            strokeWidth={3} 
                            dot={{ fill: '#00E3E6', r: 5, strokeWidth: 2, stroke: '#004A6D' }}
                            activeDot={{ r: 7, fill: '#00E3E6' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Table of Monthly Breakdown */}
                <div className="border border-[#BCD3DF] rounded-xl overflow-hidden">
                  <div className="px-4 py-2.5 bg-[#F4F9FA] border-b border-[#BCD3DF] flex items-center justify-between">
                    <span className="text-xs font-bold text-[#004A6D] flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-[#004A6D]" />
                      Detalhamento por Mês de Referência
                    </span>
                  </div>

                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-white border-b border-[#F0F5F8] text-[#004A6D] font-bold uppercase text-[10px]">
                        <th className="py-2.5 px-4">Mês / Ano</th>
                        <th className="py-2.5 px-4 text-center">Cupons</th>
                        <th className="py-2.5 px-4 text-right">Valor Compras (NF)</th>
                        <th className="py-2.5 px-4 text-right">Crédito Automático</th>
                        <th className="py-2.5 px-4 text-right">Crédito Direto</th>
                        <th className="py-2.5 px-4 text-right">Crédito Total (R$)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0F5F8]">
                      {historicoDoador.map((h, idx) => (
                        <tr key={`${h.mesNome}-${idx}`} className="hover:bg-[#F8FCFD] transition-colors">
                          <td className="py-2.5 px-4 font-bold text-[#002A3A]">
                            {h.mesNome}
                          </td>
                          <td className="py-2.5 px-4 text-center font-bold text-[#004A6D]">
                            {h.cupons} notas
                          </td>
                          <td className="py-2.5 px-4 text-right text-[#002A3A]">
                            {formatarMoeda(h.valNF)}
                          </td>
                          <td className="py-2.5 px-4 text-right font-semibold text-[#004A6D]">
                            {formatarMoeda(h.creditoAuto)}
                          </td>
                          <td className="py-2.5 px-4 text-right font-semibold text-[#004A6D]">
                            {formatarMoeda(h.creditoDireta)}
                          </td>
                          <td className="py-2.5 px-4 text-right font-black text-[#004A6D] text-sm">
                            {formatarMoeda(h.credito)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

            {/* Modal Footer */}
            <div className="flex justify-end pt-4 border-t border-[#F0F5F8]">
              <button
                type="button"
                onClick={() => setIsHistoricoModalOpen(false)}
                className="bg-[#F4F9FA] hover:bg-[#EBF6F9] text-[#004A6D] font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Floating Scroll-to-Top Button */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        title="Voltar ao topo da página"
        className="fixed bottom-6 right-6 z-40 bg-[#004A6D] hover:bg-[#002A3A] text-white p-3 rounded-full shadow-2xl border border-[#00E3E6]/40 transition-all cursor-pointer flex items-center justify-center gap-1.5 font-extrabold text-xs group"
      >
        <ArrowUp className="w-5 h-5 text-[#00E3E6] group-hover:-translate-y-0.5 transition-transform" />
        <span className="hidden sm:inline pr-1">Ir ao Topo</span>
      </button>

    </div>
  );
};
