import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  Download, 
  Receipt, 
  DollarSign, 
  Store, 
  Layers, 
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Box
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
import { EMPRESAS_PARCEIRAS, formatarMoeda, formatarNumero } from '../../data/mockDatabase';

interface TabEmpresasProps {
  onSelectEmpresaParaFiltro?: (empresa: EmpresaParceira) => void;
}

export const TabEmpresas: React.FC<TabEmpresasProps> = ({
  onSelectEmpresaParaFiltro
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('TODAS');
  const [sortField, setSortField] = useState<keyof EmpresaParceira>('creditoTotal');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [activeChartMetric, setActiveChartMetric] = useState<'credito' | 'cupons'>('credito');

  // Filter companies
  const empresasFiltradas = useMemo(() => {
    return EMPRESAS_PARCEIRAS.filter((emp) => {
      const matchText = 
        emp.nomeFantasia.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.razaoSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.cnpj.replace(/\D/g, '').includes(searchTerm.replace(/\D/g, ''));
      
      const matchCategoria = selectedCategoria === 'TODAS' || emp.categoria === selectedCategoria;

      return matchText && matchCategoria;
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
  }, [searchTerm, selectedCategoria, sortField, sortDirection]);

  // Aggregate KPIs
  const totalEmpresasAtivas = EMPRESAS_PARCEIRAS.filter(e => e.status === 'Ativa').length;
  const totalCuponsCapturados = EMPRESAS_PARCEIRAS.reduce((acc, e) => acc + e.cuponsValidos, 0);
  const valorTotalEmitidoNF = EMPRESAS_PARCEIRAS.reduce((acc, e) => acc + e.valorTotalNotas, 0);
  const creditoApuradoTotal = EMPRESAS_PARCEIRAS.reduce((acc, e) => acc + e.creditoTotal, 0);
  const creditoUrnasTotal = EMPRESAS_PARCEIRAS.reduce((acc, e) => acc + e.creditoUrnas, 0);
  const creditoDoacoesTotal = EMPRESAS_PARCEIRAS.reduce((acc, e) => acc + e.creditoDoacoes, 0);
  const totalUrnas = EMPRESAS_PARCEIRAS.reduce((acc, e) => acc + e.urnasInstaladas, 0);

  // Top 15 data for charts
  const top15Credito = useMemo(() => {
    return [...EMPRESAS_PARCEIRAS]
      .sort((a, b) => b.creditoTotal - a.creditoTotal)
      .slice(0, 15)
      .map(e => ({
        name: e.nomeFantasia.split('&')[0].split(' - ')[0].trim().slice(0, 18),
        creditoTotal: e.creditoTotal,
        creditoUrnas: e.creditoUrnas,
        creditoDoacoes: e.creditoDoacoes,
        cupons: e.cuponsValidos
      }));
  }, []);

  const top15Cupons = useMemo(() => {
    return [...EMPRESAS_PARCEIRAS]
      .sort((a, b) => b.cuponsValidos - a.cuponsValidos)
      .slice(0, 15)
      .map(e => ({
        name: e.nomeFantasia.split('&')[0].split(' - ')[0].trim().slice(0, 18),
        cupons: e.cuponsValidos,
        creditoTotal: e.creditoTotal
      }));
  }, []);

  const handleSort = (field: keyof EmpresaParceira) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const exportCSV = () => {
    const headers = ['CNPJ,Nome Fantasia,Razao Social,Categoria,Cupons Validos,Valor Notas (R$),Credito Total (R$),Credito Urnas (R$),Credito Doacoes (R$),Ticket Medio (R$),Urnas'];
    const rows = empresasFiltradas.map(e => 
      `"${e.cnpj}","${e.nomeFantasia}","${e.razaoSocial}","${e.categoria}",${e.cuponsValidos},${e.valorTotalNotas},${e.creditoTotal},${e.creditoUrnas},${e.creditoDoacoes},${e.ticketMedioCupom.toFixed(2)},${e.urnasInstaladas}`
    );
    const blob = new Blob([headers.concat(rows).join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `nfp_empresas_parceiras_vocacao_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const categorias = ['TODAS', 'Supermercados', 'Farmácias', 'Varejo & Moda', 'Construção & Casa', 'Restaurantes & Alimentos', 'Pet & Serviços'];

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

        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 bg-white hover:bg-[#D9FBFF] border border-[#BCD3DF] text-[#004A6D] px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4 text-[#004A6D]" />
          <span>Exportar Relatório CSV</span>
        </button>
      </div>

      {/* 4 KPIs for Tab 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          id="kpi-empresas-ativas"
          title="Empresas Parceiras"
          value={`${totalEmpresasAtivas} Redes`}
          subValue={`${totalUrnas} urnas físicas instaladas`}
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
                ? 'Top 15 Empresas Parceiras por Crédito Apurado (R$)' 
                : 'Top 15 Empresas Parceiras por Volume de Cupons Capturados'}
            </h2>
            <p className="text-xs text-[#004A6D]/70">
              {activeChartMetric === 'credito'
                ? 'Comparativo de crédito gerado com detalhamento entre Urnas físicas e Doações diretas/automáticas'
                : 'Ranking das maiores redes parceiras por volume total de notas processadas'}
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
              Por Crédito (R$)
            </button>
            <button
              onClick={() => setActiveChartMetric('cupons')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeChartMetric === 'cupons'
                  ? 'bg-[#004A6D] text-white shadow-2xs'
                  : 'text-[#004A6D] hover:bg-[#D9FBFF]'
              }`}
            >
              Por Volume de Cupons
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
                placeholder="Buscar por Nome da Empresa ou CNPJ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#F4F9FA] border border-[#BCD3DF] rounded-xl text-xs sm:text-sm font-medium text-[#002A3A] focus:outline-none focus:border-[#004A6D] focus:ring-1 focus:ring-[#004A6D]"
              />
            </div>

            {/* Category Pill Filter */}
            <div className="hidden lg:flex items-center gap-1 overflow-x-auto no-scrollbar">
              {categorias.slice(0, 5).map((cat) => (
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

          <div className="flex items-center gap-2 text-xs text-[#004A6D] font-semibold">
            <span>Exibindo:</span>
            <span className="bg-[#D9FBFF] px-2 py-0.5 rounded-md font-bold text-[#004A6D]">
              {empresasFiltradas.length} de {EMPRESAS_PARCEIRAS.length} empresas
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
                <th className="py-3 px-3 text-right cursor-pointer hover:text-[#002A3A]" onClick={() => handleSort('creditoTotal')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Crédito Total (R$)</span>
                    {sortField === 'creditoTotal' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-3 px-3 text-right">Separação (Urnas vs Doações)</th>
                <th className="py-3 px-3 text-right cursor-pointer hover:text-[#002A3A]" onClick={() => handleSort('ticketMedioCupom')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Ticket Médio</span>
                    {sortField === 'ticketMedioCupom' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-3 px-3 text-center">Urnas</th>
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
                  <td className="py-3 px-3 text-right">
                    <div className="font-black text-[#004A6D] text-sm">
                      {formatarMoeda(emp.creditoTotal)}
                    </div>
                    <div className="text-[10px] text-[#00E04B] font-bold">
                      +{emp.crescimentoYoY}% YoY
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="text-[11px] font-semibold text-[#004A6D]">
                      Urnas: {formatarMoeda(emp.creditoUrnas)}
                    </div>
                    <div className="text-[10px] text-[#004A6D]/70">
                      Doações: {formatarMoeda(emp.creditoDoacoes)}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-[#002A3A]">
                    {formatarMoeda(emp.ticketMedioCupom)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex items-center gap-1 font-bold text-xs bg-[#F4F9FA] px-2 py-0.5 rounded-md border border-[#BCD3DF]">
                      <Box className="w-3 h-3 text-[#EDCD01]" /> {emp.urnasInstaladas}
                    </span>
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
