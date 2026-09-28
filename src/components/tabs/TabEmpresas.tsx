import React, { useState, useMemo, useRef } from 'react';
import { 
  Building2, 
  Search, 
  Download, 
  Receipt, 
  DollarSign, 
  Store, 
  ChevronUp,
  ChevronDown,
  ArrowUp,
  Box,
  Loader2,
  Calendar,
  LineChart as LineIcon,
  X,
  TrendingUp
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
import { EmpresaParceira, VENDEDORES_MAP } from '../../types';
import { EMPRESAS_PARCEIRAS as FALLBACK_EMPRESAS, formatarMoeda, formatarNumero } from '../../data/mockDatabase';
import { useSupabaseEmpresas } from '../../hooks/useSupabaseEmpresas';

interface TabEmpresasProps {
  selectedYears?: number[];
  selectedMonths?: number[];
  onSelectEmpresaParaFiltro?: (empresa: EmpresaParceira) => void;
  onNavigateToDoador?: (cpf: string) => void;
}

export const TabEmpresas: React.FC<TabEmpresasProps> = ({
  selectedYears = [2026],
  selectedMonths = [],
  onSelectEmpresaParaFiltro,
  onNavigateToDoador
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('TODAS');
  const [selectedScoreLevel, setSelectedScoreLevel] = useState<string>('TODOS');
  const [selectedVendedorFilter, setSelectedVendedorFilter] = useState<string>('TODOS');
  const [minCuponsFilter, setMinCuponsFilter] = useState<number>(0);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [sortField, setSortField] = useState<keyof EmpresaParceira>('creditoTotal');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [activeChartMetric, setActiveChartMetric] = useState<'credito' | 'cupons' | 'doacoes'>('credito');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 100;

  // Estado do botão flutuante "Ir ao Topo"
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Listener de Scroll para exibir o botão flutuante "Ir ao Topo"
  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Estado para empresa selecionada para ver evolução temporal e doadores
  const [empresaSelecionada, setEmpresaSelecionada] = useState<EmpresaParceira | null>(null);
  const [historicoMensal, setHistoricoMensal] = useState<any[]>([]);
  const [doadoresEmpresa, setDoadoresEmpresa] = useState<any[]>([]);
  const [loadingHistorico, setLoadingHistorico] = useState<boolean>(false);
  const [loadingDoadoresEmpresa, setLoadingDoadoresEmpresa] = useState<boolean>(false);
  const [metricHistorico, setMetricHistorico] = useState<'creditoApurado' | 'cupons' | 'valorNF'>('creditoApurado');

  const {
    topEmpresas,
    totalEmpresasContagem,
    kpis,
    isLoading,
    isExporting,
    downloadFullCSV,
    fetchEmpresaHistoricoMensal,
    fetchEmpresaDoadores
  } = useSupabaseEmpresas({
    selectedYears,
    selectedMonths: selectedMonth !== null ? [selectedMonth] : selectedMonths,
    searchTerm,
    limit: 100,
  });

  const handleSelecionarEmpresa = async (emp: EmpresaParceira) => {
    setEmpresaSelecionada(emp);
    setLoadingHistorico(true);
    setLoadingDoadoresEmpresa(true);
    const hist = await fetchEmpresaHistoricoMensal(emp.cnpj);
    setHistoricoMensal(hist);
    setLoadingHistorico(false);

    const doads = await fetchEmpresaDoadores(emp.cnpj);
    setDoadoresEmpresa(doads);
    setLoadingDoadoresEmpresa(false);
  };


  const empresasLista = topEmpresas;
  const chartRef = useRef<HTMLDivElement>(null);

  // Extrair lista de vendedores únicos presentes na base cadastral
  const vendedoresDisponiveis = useMemo(() => {
    const list = empresasLista
      .map(e => e.idVendedor)
      .filter((v): v is number => v !== null && v !== undefined);
    return Array.from(new Set(list)).sort((a, b) => a - b);
  }, [empresasLista]);

  // Filter companies client-side for category, score level pills, vendedor/origem, min cupons or sort
  const empresasFiltradas = useMemo(() => {
    return empresasLista.filter((emp) => {
      const matchCategoria = selectedCategoria === 'TODAS' || emp.categoria === selectedCategoria;
      const matchScore = selectedScoreLevel === 'TODOS' || emp.nivelScore === selectedScoreLevel;
      const matchCupons = minCuponsFilter === 0 || emp.cuponsValidos >= minCuponsFilter;
      
      let matchVendedor = true;
      if (selectedVendedorFilter === 'COM_VENDEDOR') {
        matchVendedor = !!emp.isCadastrada && emp.idVendedor !== null && emp.idVendedor !== undefined;
      } else if (selectedVendedorFilter === 'ESPONTANEAS') {
        matchVendedor = !emp.isCadastrada || emp.idVendedor === null || emp.idVendedor === undefined;
      } else if (selectedVendedorFilter.startsWith('VENDEDOR_')) {
        const vId = Number(selectedVendedorFilter.replace('VENDEDOR_', ''));
        matchVendedor = emp.idVendedor === vId;
      }

      return matchCategoria && matchScore && matchCupons && matchVendedor;
    }).sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }
      return sortDirection === 'asc' 
        ? String(valA).localeCompare(String(valB)) 
        : String(valB).localeCompare(String(valA));
    });
  }, [empresasLista, selectedCategoria, selectedScoreLevel, selectedVendedorFilter, minCuponsFilter, sortField, sortDirection]);

  // Resetar para a primeira página sempre que os filtros ou busca mudarem
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategoria, selectedScoreLevel, selectedVendedorFilter, minCuponsFilter, selectedMonth]);

  const totalPages = Math.ceil(empresasFiltradas.length / pageSize) || 1;

  const empresasPaginadas = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return empresasFiltradas.slice(start, start + pageSize);
  }, [empresasFiltradas, currentPage, pageSize]);



  // Aggregate KPIs vindos do Supabase
  const totalEmpresasAtivas = totalEmpresasContagem;
  const totalCuponsCapturados = kpis.totalCupons;
  const valorTotalEmitidoNF = kpis.totalValorNF;
  const creditoApuradoTotal = kpis.totalCredito;
  const creditoUrnasTotal = kpis.totalCreditoUrnas;
  const creditoDoacoesTotal = kpis.totalCreditoDoacoes;
  const creditoConsumoTotal = kpis.totalCreditoConsumo;

  // Top 15 data for charts
  const top15Credito = useMemo(() => {
    return [...empresasLista]
      .sort((a, b) => b.creditoTotal - a.creditoTotal)
      .slice(0, 15)
      .map(e => ({
        name: e.nomeFantasia.split('&')[0].split(' - ')[0].trim().slice(0, 18),
        creditoTotal: e.creditoTotal,
        creditoUrnas: e.creditoUrnas,
        creditoDoacoes: e.creditoDoacoes,
        cupons: e.cuponsValidos
      }));
  }, [empresasLista]);

  const top15Cupons = useMemo(() => {
    return [...empresasLista]
      .sort((a, b) => b.cuponsValidos - a.cuponsValidos)
      .slice(0, 15)
      .map(e => ({
        name: e.nomeFantasia.split('&')[0].split(' - ')[0].trim().slice(0, 18),
        cupons: e.cuponsValidos,
        creditoTotal: e.creditoTotal
      }));
  }, [empresasLista]);

  const top15Doacoes = useMemo(() => {
    return [...empresasLista]
      .sort((a, b) => b.creditoDoacoes - a.creditoDoacoes)
      .slice(0, 15)
      .map(e => ({
        name: e.nomeFantasia.split('&')[0].split(' - ')[0].trim().slice(0, 18),
        creditoDoacoes: e.creditoDoacoes,
        creditoTotal: e.creditoTotal,
        cupons: e.cuponsValidos
      }));
  }, [empresasLista]);

  const handleSort = (field: keyof EmpresaParceira) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const categorias = [
    'TODAS',
    'Supermercados',
    'Farmácias',
    'Varejo & Moda',
    'Construção & Casa',
    'Restaurantes & Alimentos',
    'Pet & Serviços',
    'Atacado & Distribuição',
    'Postos & Conveniência',
    'Serviços & Outros'
  ];

  const meses = [
    { value: null, label: 'Todos os Meses do Período' },
    { value: 1, label: 'Janeiro / 2026' },
    { value: 2, label: 'Fevereiro / 2026' },
    { value: 3, label: 'Março / 2026' },
    { value: 4, label: 'Abril / 2026' },
    { value: 5, label: 'Maio / 2026' },
    { value: 6, label: 'Junho / 2026' },
    { value: 7, label: 'Julho / 2026' },
    { value: 8, label: 'Agosto / 2026' },
    { value: 9, label: 'Setembro / 2026' },
    { value: 10, label: 'Outubro / 2026' },
    { value: 11, label: 'Novembro / 2026' },
    { value: 12, label: 'Dezembro / 2026' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#002A3A] tracking-tight font-['Raleway',sans-serif]">
              Operações por Empresa Parceira
            </h1>
            <BrandBadge highlightText="empresas" prefix="Onde" suffix="encontram talentos" colorVariant="cyan" size="sm" />
          </div>
          <p className="text-xs text-[#004A6D]/80">
            Inteligência operacional das redes conveniadas: apuração de urnas de cupom sem CPF vs doações automáticas em loja.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={downloadFullCSV}
            disabled={isExporting}
            className="inline-flex items-center gap-2 bg-[#004A6D] hover:bg-[#002A3A] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs self-start sm:self-auto cursor-pointer disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 text-white" />}
            <span>{isExporting ? 'Gerando CSV...' : 'Baixar Base Completa'}</span>
          </button>
        </div>
      </div>

      {/* 4 KPIs for Tab 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          id="kpi-empresas-ativas"
          title="Empresas Parceiras"
          value={`${formatarNumero(totalEmpresasAtivas)} Lojas`}
          subValue="Registradas no período selecionado"
          icon={Store}
          iconBgColor="bg-[#004A6D]"
          iconColor="text-white"
          badge={{ text: 'Rede Conveniada', color: 'bg-[#D9FBFF] text-[#004A6D]' }}
        />

        <KPICard
          id="kpi-cupons-capturados"
          title="Cupons Capturados"
          value={formatarNumero(totalCuponsCapturados)}
          subValue="Notas digitadas e registradas"
          icon={Receipt}
          iconBgColor="bg-[#D9FBFF]"
          iconColor="text-[#004A6D]"
          badge={{ text: 'Operação Urnas + App', color: 'bg-[#EDCD01]/30 text-[#002A3A]' }}
        />

        <KPICard
          id="kpi-valor-emitido"
          title="Valor Total Emitido em NF"
          value={formatarMoeda(valorTotalEmitidoNF)}
          subValue="Movimentação comercial total"
          icon={DollarSign}
          iconBgColor="bg-[#EDCD01]/25"
          iconColor="text-[#002A3A]"
          badge={{ text: 'Compras nas Lojas', color: 'bg-[#00E04B]/20 text-[#006E24]' }}
        />

        <KPICard
          id="kpi-credito-apurado-empresas"
          title="Crédito Apurado Total"
          value={formatarMoeda(creditoApuradoTotal)}
          subValue={`Consumo: ${formatarMoeda(creditoConsumoTotal)} | Cad/doações: ${formatarMoeda(creditoDoacoesTotal)}`}
          icon={Building2}
          iconBgColor="bg-[#00E04B]/20"
          iconColor="text-[#006E24]"
          badge={{ text: 'Apuração NFP', color: 'bg-[#FD3168] text-white' }}
        />
      </div>

      {/* Top 15 Charts Section */}
      <div ref={chartRef} className="bg-white border border-[#BCD3DF]/60 rounded-2xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#F0F5F8]">
          <div>
            <h2 className="text-base font-bold text-[#002A3A] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#004A6D]" />
              {activeChartMetric === 'credito' 
                ? 'Top 15 Empresas Parceiras por Crédito Apurado Total (R$)' 
                : activeChartMetric === 'doacoes'
                ? 'Top 15 Empresas Parceiras por Crédito de Doações Pessoais (AUT / Direta)'
                : 'Top 15 Empresas Parceiras por Volume de Cupons Capturados'}
            </h2>
            <p className="text-xs text-[#004A6D]/70">
              {activeChartMetric === 'credito'
                ? 'Ranking das 15 maiores empresas no período com detalhamento de Urnas vs Doações Pessoais'
                : activeChartMetric === 'doacoes'
                ? 'Ranking das 15 maiores empresas em repasse via Doações Automáticas e Diretas com CPF'
                : 'Ranking das 15 maiores empresas por volume total de notas no período'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-[#F4F9FA] p-1 rounded-xl border border-[#BCD3DF]/60 self-start sm:self-auto">
              <button
                onClick={() => setActiveChartMetric('credito')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeChartMetric === 'credito'
                    ? 'bg-[#004A6D] text-white shadow-2xs'
                    : 'text-[#004A6D] hover:bg-[#D9FBFF]'
                }`}
              >
                Por Crédito Total (R$)
              </button>
              <button
                onClick={() => setActiveChartMetric('doacoes')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeChartMetric === 'doacoes'
                    ? 'bg-[#00E3E6] text-[#002A3A] shadow-2xs'
                    : 'text-[#004A6D] hover:bg-[#D9FBFF]'
                }`}
              >
                Por Doações (R$)
              </button>
              <button
                onClick={() => setActiveChartMetric('cupons')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeChartMetric === 'cupons'
                    ? 'bg-[#004A6D] text-white shadow-2xs'
                    : 'text-[#004A6D] hover:bg-[#D9FBFF]'
                }`}
              >
                Por Volume
              </button>
            </div>
            <CopyChartButton chartRef={chartRef} title="Top15_Empresas_Parceiras" />
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {activeChartMetric === 'credito' ? (
              <BarChart data={top15Credito} margin={{ top: 10, right: 10, left: 10, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8F1F5" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10, fill: '#004A6D' }} 
                  interval={0} 
                  angle={-35} 
                  textAnchor="end"
                  height={50}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#004A6D' }} 
                  tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`} 
                />
                <Tooltip 
                  formatter={(val: any, name: any) => [
                    formatarMoeda(Number(val)),
                    name
                  ]}
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
                <Bar dataKey="creditoTotal" name="Crédito Total (R$)" fill="#004A6D" radius={[6, 6, 0, 0]} />
              </BarChart>

            ) : activeChartMetric === 'doacoes' ? (
              <BarChart data={top15Doacoes} margin={{ top: 10, right: 10, left: 10, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8F1F5" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10, fill: '#004A6D' }} 
                  interval={0} 
                  angle={-35} 
                  textAnchor="end" 
                  height={50}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#004A6D' }} 
                  tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`} 
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
                <Bar dataKey="creditoDoacoes" name="Crédito Doações Pessoais" fill="#00E3E6" radius={[4, 4, 0, 0]}>
                  {top15Doacoes.map((_, index) => (
                    <Cell key={`cell-doacao-${index}`} fill={index < 3 ? '#004A6D' : '#00E3E6'} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <BarChart data={top15Cupons} margin={{ top: 10, right: 10, left: 10, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8F1F5" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10, fill: '#004A6D' }} 
                  interval={0} 
                  angle={-35} 
                  textAnchor="end" 
                  height={50}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#004A6D' }} 
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} 
                />
                <Tooltip 
                  formatter={(val: any) => [`${formatarNumero(Number(val))} cupons`]}
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
                <Bar dataKey="cupons" name="Volume de Cupons" fill="#EDCD01" radius={[4, 4, 0, 0]}>
                  {top15Cupons.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index < 3 ? '#004A6D' : '#00E3E6'} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {activeChartMetric === 'credito' && (
          <div className="flex items-center justify-center gap-6 text-xs font-semibold mt-2 pt-2 border-t border-[#F0F5F8]">
            <span className="flex items-center gap-1.5 text-[#004A6D]">
              <span className="w-3 h-3 rounded-xs bg-[#004A6D]"></span> Crédito de Urnas (Tipo CADASTRO)
            </span>
            <span className="flex items-center gap-1.5 text-[#004A6D]">
              <span className="w-3 h-3 rounded-xs bg-[#00E3E6]"></span> Crédito de Doações Pessoais (AUT / Direta)
            </span>
          </div>
        )}
      </div>

      {/* Filter and Detailed Table */}
      <div className="bg-white border border-[#BCD3DF]/60 rounded-2xl p-5 shadow-2xs">
        
        {/* Filters Row */}
        <div className="flex flex-col space-y-3 mb-4 pb-4 border-b border-[#F0F5F8]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              {/* Search Input Ampliado */}
              <div className="relative flex-1 min-w-[260px]">
                <Search className="w-4 h-4 text-[#004A6D]/60 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por Nome da Empresa ou CNPJ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#F4F9FA] border border-[#BCD3DF] rounded-xl text-xs sm:text-sm font-medium text-[#002A3A] focus:outline-none focus:border-[#004A6D] focus:ring-1 focus:ring-[#004A6D]"
                />
              </div>

              {/* Dropdown de Origens / Vendedor Simplificado */}
              <div className="flex items-center gap-1.5 bg-[#F4F9FA] border border-[#BCD3DF] rounded-xl px-3 py-2 shadow-2xs">
                <Store className="w-4 h-4 text-[#004A6D]" />
                <select
                  value={selectedVendedorFilter}
                  onChange={(e) => setSelectedVendedorFilter(e.target.value)}
                  className="bg-transparent text-xs font-bold text-[#004A6D] focus:outline-none cursor-pointer"
                >
                  <option value="TODOS">Todas as Origens</option>
                  <option value="COM_VENDEDOR">💼 Com Vendedor Alocado</option>
                  <option value="ESPONTANEAS">🌱 Doações Espontâneas</option>
                  {vendedoresDisponiveis.map(vId => (
                    <option key={vId} value={`VENDEDOR_${vId}`}>
                      👤 {VENDEDORES_MAP[vId] ? `${VENDEDORES_MAP[vId]} (#${vId})` : `Captador #${vId}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dropdown de Categorias ao lado das Origens */}
              <div className="flex items-center gap-1.5 bg-[#F4F9FA] border border-[#BCD3DF] rounded-xl px-3 py-2 shadow-2xs">
                <Box className="w-4 h-4 text-[#004A6D]" />
                <select
                  value={selectedCategoria}
                  onChange={(e) => setSelectedCategoria(e.target.value)}
                  className="bg-transparent text-xs font-bold text-[#004A6D] focus:outline-none cursor-pointer"
                >
                  <option value="TODAS">Todas as Categorias</option>
                  {categorias.filter(c => c !== 'TODAS').map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#004A6D] font-semibold whitespace-nowrap self-end lg:self-auto">
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#004A6D]" />}
              <span>Exibindo:</span>
              <span className="bg-[#D9FBFF] px-2.5 py-1 rounded-lg font-bold text-[#004A6D] shadow-2xs border border-[#BCD3DF]/50">
                {empresasFiltradas.length > 0
                  ? `${(currentPage - 1) * pageSize + 1} - ${Math.min(currentPage * pageSize, empresasFiltradas.length)} de ${formatarNumero(empresasFiltradas.length)} lojas`
                  : '0 lojas'}
              </span>
            </div>
          </div>

          {/* Filtros de Termômetro de Score nos 5 Níveis (Sem texto prefixo longo) */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-[#F0F5F8]">
            <button
              onClick={() => setSelectedScoreLevel('TODOS')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                selectedScoreLevel === 'TODOS' ? 'bg-[#002A3A] text-white' : 'bg-[#F4F9FA] text-[#004A6D] hover:bg-[#D9FBFF]'
              }`}
            >
              Todos os Níveis
            </button>
            <button
              onClick={() => setSelectedScoreLevel('EXCEPCIONAL')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                selectedScoreLevel === 'EXCEPCIONAL' ? 'bg-[#006E24] text-white' : 'bg-[#00E04B]/15 text-[#006E24] hover:bg-[#00E04B]/30'
              }`}
            >
              ⭐ Excepcional (&gt; 100%)
            </button>
            <button
              onClick={() => setSelectedScoreLevel('BOM')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                selectedScoreLevel === 'BOM' ? 'bg-[#004A6D] text-white' : 'bg-[#D9FBFF] text-[#004A6D] hover:bg-[#BCEEFF]'
              }`}
            >
              🟢 Bom (80% a 100%)
            </button>
            <button
              onClick={() => setSelectedScoreLevel('MODERADO')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                selectedScoreLevel === 'MODERADO' ? 'bg-[#EDCD01] text-[#002A3A]' : 'bg-[#EDCD01]/20 text-[#002A3A] hover:bg-[#EDCD01]/40'
              }`}
            >
              🟡 Moderado (50% a 79%)
            </button>
            <button
              onClick={() => setSelectedScoreLevel('BAIXO')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                selectedScoreLevel === 'BAIXO' ? 'bg-[#E03F2A] text-white' : 'bg-[#E03F2A]/15 text-[#E03F2A] hover:bg-[#E03F2A]/30'
              }`}
            >
              🟠 Baixo (25% a 49%)
            </button>
            <button
              onClick={() => setSelectedScoreLevel('CRITICO')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                selectedScoreLevel === 'CRITICO' ? 'bg-[#FD3168] text-white' : 'bg-[#FD3168]/15 text-[#FD3168] hover:bg-[#FD3168]/30'
              }`}
            >
              🔴 Crítico / Gargalo (&lt; 25%)
            </button>
          </div>

          {/* Filtro de Corte Mínimo de Cupons Válidos (Sem texto prefixo longo) */}
          <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-[#F0F5F8]">
            {[
              { label: 'Todos os Volumes (≥ 0)', value: 0 },
              { label: '≥ 5 Cupons', value: 5 },
              { label: '≥ 10 Cupons', value: 10 },
              { label: '≥ 20 Cupons', value: 20 },
              { label: '≥ 50 Cupons', value: 50 },
              { label: '≥ 100 Cupons', value: 100 },
              { label: '≥ 500 Cupons', value: 500 }
            ].map(c => (
              <button
                key={c.value}
                onClick={() => setMinCuponsFilter(c.value)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  minCuponsFilter === c.value
                    ? 'bg-[#004A6D] text-white shadow-2xs'
                    : 'bg-[#F4F9FA] text-[#004A6D] hover:bg-[#D9FBFF] border border-[#BCD3DF]/40'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F4F9FA] border-b border-[#BCD3DF] text-[#004A6D] font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3 cursor-pointer hover:text-[#002A3A]" onClick={() => handleSort('nomeFantasia')}>
                  <div className="flex items-center gap-1">
                    <span>Empresa / Razão Social</span>
                    {sortField === 'nomeFantasia' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-3 px-3">CNPJ Formatado</th>
                <th className="py-3 px-3">Categoria</th>
                <th className="py-3 px-3 text-center cursor-pointer hover:text-[#002A3A]" onClick={() => handleSort('scoreEficiencia')}>
                  <div className="flex items-center justify-center gap-1">
                    <span>Score de Eficiência</span>
                    {sortField === 'scoreEficiencia' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-3 px-3 text-right cursor-pointer hover:text-[#002A3A]" onClick={() => handleSort('cuponsValidos')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Cupons Válidos</span>
                    {sortField === 'cuponsValidos' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-3 px-3 text-right cursor-pointer hover:text-[#002A3A]" onClick={() => handleSort('creditoUrnas')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Crédito Urnas (R$)</span>
                    {sortField === 'creditoUrnas' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-3 px-3 text-right cursor-pointer hover:text-[#002A3A]" onClick={() => handleSort('creditoDoacoes')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Doações Pessoais (R$)</span>
                    {sortField === 'creditoDoacoes' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-3 px-3 text-right cursor-pointer hover:text-[#002A3A]" onClick={() => handleSort('creditoTotal')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Crédito Total (R$)</span>
                    {sortField === 'creditoTotal' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-3 px-3 text-right cursor-pointer hover:text-[#002A3A]" onClick={() => handleSort('ticketMedioCupom')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Ticket Médio</span>
                    {sortField === 'ticketMedioCupom' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-3 px-3 text-center">Status / Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F5F8]">
              {empresasPaginadas.map((emp) => (
                <tr 
                  key={emp.id} 
                  onClick={() => handleSelecionarEmpresa(emp)}
                  className="hover:bg-[#F8FCFD] cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-3">
                    <div className="font-bold text-[#002A3A] group-hover:text-[#004A6D] flex items-center gap-1.5 flex-wrap">
                      <span>{emp.nomeFantasia}</span>
                      {emp.isCadastrada ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-[#00E04B]/20 text-[#006E24] border border-[#00E04B]/40">
                          {emp.nomeVendedor ? `Parceiro (${emp.nomeVendedor})` : (emp.idVendedor ? `Parceiro (Captador #${emp.idVendedor})` : 'Parceiro Cadastrado')}
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#F4F9FA] text-[#004A6D]/70 border border-[#BCD3DF]/60">
                          Espontâneo
                        </span>
                      )}
                      <LineIcon className="w-3.5 h-3.5 text-[#004A6D] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-[11px] text-[#004A6D]/60 truncate max-w-[240px]">
                      {emp.razaoSocial}
                    </div>
                  </td>

                  <td className="py-3 px-3 font-mono font-medium text-[#004A6D]">
                    {emp.cnpj}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#D9FBFF] text-[#004A6D]">
                      {emp.categoria}
                    </span>
                  </td>

                  {/* Coluna do Score de Eficiência nos 5 Níveis */}
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-black tracking-tight ${
                      emp.nivelScore === 'EXCEPCIONAL' ? 'bg-[#00E04B]/20 text-[#006E24] border border-[#00E04B]/40' :
                      emp.nivelScore === 'BOM' ? 'bg-[#D9FBFF] text-[#004A6D] border border-[#BCD3DF]' :
                      emp.nivelScore === 'MODERADO' ? 'bg-[#EDCD01]/25 text-[#002A3A] border border-[#EDCD01]/40' :
                      emp.nivelScore === 'BAIXO' ? 'bg-[#E03F2A]/15 text-[#E03F2A] border border-[#E03F2A]/30' :
                      'bg-[#FD3168]/20 text-[#FD3168] border border-[#FD3168]/40'
                    }`}>
                      {emp.scoreEficiencia}% ({emp.nivelScore})
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right font-bold text-[#002A3A]">
                    {formatarNumero(emp.cuponsValidos)}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-[#004A6D]">
                    {formatarMoeda(emp.creditoUrnas)}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-[#00E04B]">
                    {formatarMoeda(emp.creditoDoacoes)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="font-black text-[#002A3A] text-sm">
                      {formatarMoeda(emp.creditoTotal)}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-[#002A3A]">
                    {formatarMoeda(emp.ticketMedioCupom)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelecionarEmpresa(emp);
                      }}
                      className="inline-flex items-center gap-1 bg-[#D9FBFF] hover:bg-[#004A6D] text-[#004A6D] hover:text-white px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                    >
                      <TrendingUp className="w-3 h-3" />
                      <span>Ver Evolução</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Controles de Paginação (100 itens por página) */}
        {empresasFiltradas.length > pageSize && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#F0F5F8] mt-3 text-xs text-[#004A6D]">
            <div className="font-medium">
              Exibindo empresas <span className="font-bold">{(currentPage - 1) * pageSize + 1}</span> a <span className="font-bold">{Math.min(currentPage * pageSize, empresasFiltradas.length)}</span> de <span className="font-bold">{empresasFiltradas.length}</span> encontradas
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-3 py-1.5 rounded-lg border border-[#BCD3DF] font-bold hover:bg-[#D9FBFF] disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
              >
                Anterior
              </button>

              <span className="font-bold px-2">
                Página {currentPage} de {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-3 py-1.5 rounded-lg border border-[#BCD3DF] font-bold hover:bg-[#D9FBFF] disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
              >
                Próxima
              </button>
            </div>
          </div>
        )}

      </div>


      {/* Modal / Painel de Detalhes e Evolução Mensal da Empresa */}
      {empresaSelecionada && (
        <div className="fixed inset-0 bg-[#002A3A]/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#BCD3DF] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#BCD3DF]/60 pb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-black text-[#002A3A] font-['Raleway',sans-serif]">
                    {empresaSelecionada.nomeFantasia}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#D9FBFF] text-[#004A6D]">
                    {empresaSelecionada.categoria}
                  </span>
                  {empresaSelecionada.isCadastrada ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#00E04B]/20 text-[#006E24] border border-[#00E04B]/40">
                      {empresaSelecionada.nomeVendedor ? `Captador: ${empresaSelecionada.nomeVendedor}` : (empresaSelecionada.idVendedor ? `Captador #${empresaSelecionada.idVendedor}` : 'Base de Cadastro Ativa')}
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F4F9FA] text-[#004A6D]/70 border border-[#BCD3DF]">
                      Doação Espontânea (Sem Vendedor)
                    </span>
                  )}
                  {empresaSelecionada.nivelScore && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#002A3A] text-white">
                      Score: {empresaSelecionada.scoreEficiencia}% ({empresaSelecionada.nivelScore})
                    </span>
                  )}
                </div>
                <p className="text-xs font-mono text-[#004A6D]/80 mt-1">
                  CNPJ: {empresaSelecionada.cnpj} | Razão Social: {empresaSelecionada.razaoSocial}
                </p>
                {empresaSelecionada.logradouro && (
                  <p className="text-xs text-[#004A6D]/70 mt-0.5 font-sans">
                    📍 {empresaSelecionada.logradouro}, {empresaSelecionada.bairro || ''} - {empresaSelecionada.cidade} / CEP: {empresaSelecionada.cep || 'N/I'}
                  </p>
                )}
              </div>

              <button 
                onClick={() => setEmpresaSelecionada(null)}
                className="p-1.5 rounded-lg bg-[#F4F9FA] hover:bg-[#D9FBFF] text-[#004A6D] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* KPIs Resumo da Empresa Selecionada */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#F8FCFD] border border-[#BCD3DF]/50 rounded-xl p-3.5">
                <div className="text-xs text-[#004A6D]/70 font-semibold">Crédito Total Apurado</div>
                <div className="text-lg font-black text-[#002A3A] mt-0.5">
                  {formatarMoeda(empresaSelecionada.creditoTotal)}
                </div>
              </div>

              <div className="bg-[#F8FCFD] border border-[#BCD3DF]/50 rounded-xl p-3.5">
                <div className="text-xs text-[#004A6D]/70 font-semibold">Volume de Cupons</div>
                <div className="text-lg font-black text-[#004A6D] mt-0.5">
                  {formatarNumero(empresaSelecionada.cuponsValidos)} cupons
                </div>
              </div>

              <div className="bg-[#F8FCFD] border border-[#BCD3DF]/50 rounded-xl p-3.5">
                <div className="text-xs text-[#004A6D]/70 font-semibold">Valor Total Notas Emitidas</div>
                <div className="text-lg font-black text-[#006E24] mt-0.5">
                  {formatarMoeda(empresaSelecionada.valorTotalNotas)}
                </div>
              </div>
            </div>

            {/* Chart Section */}
            <div className="space-y-3 bg-[#F8FCFD] border border-[#BCD3DF]/60 rounded-xl p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#004A6D]" />
                  <h3 className="text-sm font-bold text-[#002A3A]">
                    Evolução Mês a Mês do Estabelecimento
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 bg-white border border-[#BCD3DF] rounded-lg p-1">
                  <button
                    onClick={() => setMetricHistorico('creditoApurado')}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                      metricHistorico === 'creditoApurado' ? 'bg-[#004A6D] text-white' : 'text-[#004A6D] hover:bg-[#D9FBFF]'
                    }`}
                  >
                    Crédito (R$)
                  </button>
                  <button
                    onClick={() => setMetricHistorico('cupons')}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                      metricHistorico === 'cupons' ? 'bg-[#004A6D] text-white' : 'text-[#004A6D] hover:bg-[#D9FBFF]'
                    }`}
                  >
                    Cupons
                  </button>
                  <button
                    onClick={() => setMetricHistorico('valorNF')}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                      metricHistorico === 'valorNF' ? 'bg-[#004A6D] text-white' : 'text-[#004A6D] hover:bg-[#D9FBFF]'
                    }`}
                  >
                    Valor NF (R$)
                  </button>
                </div>
              </div>

              {loadingHistorico ? (
                <div className="h-64 flex items-center justify-center text-xs text-[#004A6D] font-semibold gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Carregando dados mensais da empresa...</span>
                </div>
              ) : historicoMensal.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-xs text-[#004A6D]/60 font-semibold">
                  Nenhum registro mensal encontrado no banco para este CNPJ.
                </div>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={historicoMensal} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="mesNome" tick={{ fontSize: 11, fill: '#004A6D', fontWeight: 600 }} />
                      <YAxis tick={{ fontSize: 11, fill: '#004A6D' }} />
                      <Tooltip 
                        formatter={(val: number) => 
                          metricHistorico === 'cupons' ? formatarNumero(val) : formatarMoeda(val)
                        } 
                      />
                      <Bar 
                        dataKey={metricHistorico} 
                        fill="#004A6D" 
                        radius={[6, 6, 0, 0]} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Tabela de Suporte Fixa Mês a Mês com Desmembramento 100% Exato */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-[#002A3A] uppercase tracking-wider">
                Tabela de Suporte Mês a Mês (Desmembramento Completo do Crédito)
              </h3>
              
              <div className="overflow-x-auto border border-[#BCD3DF] rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F4F9FA] border-b border-[#BCD3DF] text-[#004A6D] font-bold text-[11px]">
                      <th className="py-2.5 px-3">Mês / Ano</th>
                      <th className="py-2.5 px-3 text-right">Cupons Válidos</th>
                      <th className="py-2.5 px-3 text-right">Crédito Cadastro (R$)</th>
                      <th className="py-2.5 px-3 text-right">Crédito Doação (R$)</th>
                      <th className="py-2.5 px-3 text-right">Crédito Outros / Consumo (R$)</th>
                      <th className="py-2.5 px-3 text-right">Crédito Apurado Total (R$)</th>
                      <th className="py-2.5 px-3 text-right">Valor Total Notas (R$)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F5F8]">
                    {[...historicoMensal].reverse().map((h, idx) => (
                      <tr key={idx} className="hover:bg-[#F8FCFD]">
                        <td className="py-2 px-3 font-bold text-[#002A3A]">{h.mesNome}</td>
                        <td className="py-2 px-3 text-right font-medium">{formatarNumero(h.cupons)}</td>
                        <td className="py-2 px-3 text-right font-medium text-[#004A6D]">{formatarMoeda(h.creditoCadastro)}</td>
                        <td className="py-2 px-3 text-right font-medium text-[#00E04B]">{formatarMoeda(h.creditoDoacao)}</td>
                        <td className="py-2 px-3 text-right font-medium text-[#004A6D]/80">{formatarMoeda(h.creditoOutros || 0)}</td>
                        <td className="py-2 px-3 text-right font-black text-[#002A3A] bg-[#D9FBFF]/30">{formatarMoeda(h.creditoApurado)}</td>
                        <td className="py-2 px-3 text-right font-medium text-[#004A6D]/80">{formatarMoeda(h.valorNF)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Rastreio de Doadores que Compraram Nesta Loja */}
            <div className="space-y-2 pt-2 border-t border-[#BCD3DF]/60">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#002A3A] uppercase tracking-wider flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-[#004A6D]" />
                  Doadores que Compraram Nesta Loja ({doadoresEmpresa.length})
                </h3>
                {loadingDoadoresEmpresa && (
                  <div className="flex items-center gap-1.5 text-xs text-[#004A6D]">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Buscando doadores...</span>
                  </div>
                )}
              </div>

              {loadingDoadoresEmpresa ? (
                <div className="p-6 text-center text-xs text-[#004A6D]/70 font-semibold bg-[#F8FCFD] rounded-xl border border-[#BCD3DF]/60">
                  Carregando lista de doadores desta loja...
                </div>
              ) : doadoresEmpresa.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#004A6D]/60 bg-[#F4F9FA] rounded-xl border border-[#BCD3DF]/50">
                  {empresaSelecionada.isCadastrada 
                    ? 'Empresa cadastrada comercialmente com urnas/pontos de coleta físicos.' 
                    : 'Nenhum registro individual de doador vinculado a este CNPJ no período selecionado.'}
                </div>
              ) : (
                <div className="overflow-x-auto border border-[#BCD3DF] rounded-xl max-h-60 overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-[#F4F9FA] border-b border-[#BCD3DF] text-[#004A6D] font-bold text-[11px] z-10">
                      <tr>
                        <th className="py-2.5 px-3">Doador / Nome</th>
                        <th className="py-2.5 px-3">CPF</th>
                        <th className="py-2.5 px-3 text-right">Cupons Doados</th>
                        <th className="py-2.5 px-3 text-right">Valor em Notas (R$)</th>
                        <th className="py-2.5 px-3 text-right">Crédito Gerado (R$)</th>
                        <th className="py-2.5 px-3 text-center">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0F5F8]">
                      {doadoresEmpresa.map((d, idx) => (
                        <tr key={idx} className="hover:bg-[#F8FCFD]">
                          <td className="py-2 px-3 font-bold text-[#002A3A]">{d.nome}</td>
                          <td className="py-2 px-3 font-mono text-[#004A6D]">{d.cpf}</td>
                          <td className="py-2 px-3 text-right font-medium">{formatarNumero(d.cupons)}</td>
                          <td className="py-2 px-3 text-right font-medium text-[#004A6D]/80">{formatarMoeda(d.valorNF)}</td>
                          <td className="py-2 px-3 text-right font-black text-[#006E24]">{formatarMoeda(d.credito)}</td>
                          <td className="py-2 px-3 text-center">
                            {onNavigateToDoador && d.cpf !== 'S/N' ? (
                              <button
                                onClick={() => {
                                  setEmpresaSelecionada(null);
                                  onNavigateToDoador(d.cpf);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-[#D9FBFF] hover:bg-[#004A6D] text-[#004A6D] hover:text-white font-bold text-[11px] transition-all cursor-pointer inline-flex items-center gap-1"
                              >
                                <span>Ver Doador</span>
                                <span>→</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-[#004A6D]/40">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Botão Flutuante "Ir ao Topo" */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          title="Ir ao topo da página"
          aria-label="Ir ao topo"
          className="fixed bottom-6 right-6 z-40 bg-[#004A6D] hover:bg-[#00344D] text-white px-5 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2.5 border border-[#00E3E6]/30 cursor-pointer"
        >
          <ArrowUp className="w-4 h-4 text-[#00E3E6] stroke-[2.5]" />
          <span className="font-extrabold text-xs tracking-wide">Ir ao Topo</span>
        </button>
      )}



    </div>
  );
};


