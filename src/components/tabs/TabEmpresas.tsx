import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  Download, 
  Receipt, 
  DollarSign, 
  Store, 
  ChevronUp,
  ChevronDown,
  Box,
  Loader2,
  Calendar
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Cell 
} from 'recharts';
import { KPICard } from '../KPICard';
import { BrandBadge } from '../BrandBadge';
import { EmpresaParceira } from '../../types';
import { EMPRESAS_PARCEIRAS as FALLBACK_EMPRESAS, formatarMoeda, formatarNumero } from '../../data/mockDatabase';
import { useSupabaseEmpresas } from '../../hooks/useSupabaseEmpresas';

interface TabEmpresasProps {
  selectedYears?: number[];
  selectedMonths?: number[];
  onSelectEmpresaParaFiltro?: (empresa: EmpresaParceira) => void;
}

export const TabEmpresas: React.FC<TabEmpresasProps> = ({
  selectedYears = [2026],
  selectedMonths = [],
  onSelectEmpresaParaFiltro
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('TODAS');
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [sortField, setSortField] = useState<keyof EmpresaParceira>('creditoTotal');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [activeChartMetric, setActiveChartMetric] = useState<'credito' | 'cupons' | 'doacoes'>('credito');

  const {
    topEmpresas,
    totalEmpresasContagem,
    kpis,
    isLoading,
    isExporting,
    downloadFullCSV,
  } = useSupabaseEmpresas({
    selectedYears,
    selectedMonths: selectedMonth ? [selectedMonth] : [], // Se selectedMonth for nulo, traz todo o mês do banco (7.505 registros)
    searchTerm,
    limit: 100,
  });

  const empresasLista = topEmpresas;

  // Filter companies client-side for category pills or sort
  const empresasFiltradas = useMemo(() => {
    return empresasLista.filter((emp) => {
      const matchCategoria = selectedCategoria === 'TODAS' || emp.categoria === selectedCategoria;
      return matchCategoria;
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
  }, [empresasLista, selectedCategoria, sortField, sortDirection]);

  // Aggregate KPIs vindos do Supabase
  const totalEmpresasAtivas = totalEmpresasContagem;
  const totalCuponsCapturados = kpis.totalCupons;
  const valorTotalEmitidoNF = kpis.totalValorNF;
  const creditoApuradoTotal = kpis.totalCredito;
  const creditoUrnasTotal = kpis.totalCreditoUrnas;
  const creditoDoacoesTotal = kpis.totalCreditoDoacoes;

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
    { value: null, label: 'Todos os Meses' },
    { value: 5, label: 'Maio / 2026' }
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
          {/* Mês filter dropdown */}
          <div className="flex items-center gap-1.5 bg-white border border-[#BCD3DF] rounded-xl px-3 py-1.5 shadow-2xs">
            <Calendar className="w-4 h-4 text-[#004A6D]" />
            <select
              value={selectedMonth ?? ''}
              onChange={(e) => setSelectedMonth(e.target.value ? Number(e.target.value) : null)}
              className="bg-transparent text-xs font-bold text-[#004A6D] focus:outline-none cursor-pointer"
            >
              {meses.map(m => (
                <option key={m.value ?? 'all'} value={m.value ?? ''}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

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
          subValue={`Urnas: ${formatarMoeda(creditoUrnasTotal)} | Doações: ${formatarMoeda(creditoDoacoesTotal)}`}
          icon={Building2}
          iconBgColor="bg-[#00E04B]/20"
          iconColor="text-[#006E24]"
          badge={{ text: 'Apuração NFP', color: 'bg-[#FD3168] text-white' }}
        />
      </div>

      {/* Top 15 Charts Section */}
      <div className="bg-white border border-[#BCD3DF]/60 rounded-2xl p-5 shadow-2xs">
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
                    name === 'creditoUrnas' ? 'Crédito Urnas (CADASTRO)' : 'Crédito Doações (PF)'
                  ]}
                  contentStyle={{ backgroundColor: '#002A3A', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }}
                  itemStyle={{ color: '#FFFFFF' }}
                />
                <Bar dataKey="creditoUrnas" name="creditoUrnas" stackId="a" fill="#004A6D" radius={[0, 0, 0, 0]} />
                <Bar dataKey="creditoDoacoes" name="creditoDoacoes" stackId="a" fill="#00E3E6" radius={[4, 4, 0, 0]} />
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
                  formatter={(val: any) => [formatarMoeda(Number(val)), 'Crédito Doações Pessoais']}
                  contentStyle={{ backgroundColor: '#002A3A', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }}
                  itemStyle={{ color: '#FFFFFF' }}
                />
                <Bar dataKey="creditoDoacoes" fill="#00E3E6" radius={[4, 4, 0, 0]}>
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
                  formatter={(val: any) => [`${formatarNumero(Number(val))} cupons`, 'Volume']}
                  contentStyle={{ backgroundColor: '#002A3A', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }}
                  itemStyle={{ color: '#FFFFFF' }}
                />
                <Bar dataKey="cupons" fill="#EDCD01" radius={[4, 4, 0, 0]}>
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-[#F0F5F8]">
          <div className="flex items-center gap-3 flex-1">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#004A6D]/60 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar no banco por Nome da Empresa ou CNPJ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#F4F9FA] border border-[#BCD3DF] rounded-xl text-xs sm:text-sm font-medium text-[#002A3A] focus:outline-none focus:border-[#004A6D] focus:ring-1 focus:ring-[#004A6D]"
              />
            </div>

            {/* Category Pill Filter */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-xl">
              {categorias.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategoria(cat)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategoria === cat
                      ? 'bg-[#004A6D] text-white'
                      : 'bg-[#F4F9FA] text-[#004A6D] hover:bg-[#D9FBFF]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#004A6D] font-semibold whitespace-nowrap">
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#004A6D]" />}
            <span>Exibindo:</span>
            <span className="bg-[#D9FBFF] px-2 py-0.5 rounded-md font-bold text-[#004A6D]">
              Top {empresasFiltradas.length} de {formatarNumero(totalEmpresasAtivas)} lojas
            </span>
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
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F5F8]">
              {empresasFiltradas.map((emp) => (
                <tr key={emp.id} className="hover:bg-[#F8FCFD] transition-colors group">
                  <td className="py-3 px-3">
                    <div className="font-bold text-[#002A3A] group-hover:text-[#004A6D]">
                      {emp.nomeFantasia}
                    </div>
                    <div className="text-[11px] text-[#004A6D]/60 truncate max-w-[220px]">
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
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      emp.status === 'Ativa' ? 'bg-[#00E04B]/20 text-[#006E24]' :
                      emp.status === 'Em expansão' ? 'bg-[#00E3E6]/25 text-[#004A6D]' :
                      'bg-[#EDCD01]/30 text-[#002A3A]'
                    }`}>
                      {emp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
