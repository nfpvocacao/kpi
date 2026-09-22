import React, { useState, useMemo } from 'react';
import { 
  HeartHandshake, 
  Search, 
  UserCheck, 
  Receipt, 
  DollarSign, 
  ShoppingBag, 
  Store, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles,
  Award,
  ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';
import { KPICard } from '../KPICard';
import { BrandBadge } from '../BrandBadge';
import { DoadorReal } from '../../types';
import { DOADORES_REAIS, formatarMoeda, formatarNumero } from '../../data/mockDatabase';

export const TabDoadores: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalidadeFiltro, setModalidadeFiltro] = useState<'TODOS' | 'DOACAO_AUTOMATICA' | 'DOACAO'>('TODOS');
  const [selectedDoadorId, setSelectedDoadorId] = useState<string>(DOADORES_REAIS[0].id);

  // Filtered donors
  const doadoresFiltrados = useMemo(() => {
    return DOADORES_REAIS.filter((doa) => {
      const matchText = 
        doa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doa.cpf.replace(/\D/g, '').includes(searchTerm.replace(/\D/g, ''));
      
      const matchModalidade = 
        modalidadeFiltro === 'TODOS' || doa.tipoDoacao === modalidadeFiltro;

      return matchText && matchModalidade;
    });
  }, [searchTerm, modalidadeFiltro]);

  // Selected donor detail
  const doadorSelecionado = useMemo(() => {
    return DOADORES_REAIS.find(d => d.id === selectedDoadorId) || DOADORES_REAIS[0];
  }, [selectedDoadorId]);

  // KPIs
  const totalDoadoresAtivos = DOADORES_REAIS.length;
  const totalCuponsDoados = DOADORES_REAIS.reduce((acc, d) => acc + d.totalCupons, 0);
  const totalCreditoGerado = DOADORES_REAIS.reduce((acc, d) => acc + d.creditoGerado, 0);
  const ticketMedioPorDoador = totalDoadoresAtivos > 0 ? totalCreditoGerado / totalDoadoresAtivos : 0;

  // Chart data: Top 15 Doadores
  const top15Doadores = useMemo(() => {
    return [...DOADORES_REAIS]
      .sort((a, b) => b.creditoGerado - a.creditoGerado)
      .slice(0, 15)
      .map(d => ({
        id: d.id,
        name: d.nome.split(' ')[0] + ' ' + (d.nome.split(' ')[1]?.[0] || '') + '.',
        credito: d.creditoGerado,
        cupons: d.totalCupons,
        tipo: d.tipoDoacao
      }));
  }, []);

  // Modalidade Donut Data
  const modalidadeStats = useMemo(() => {
    const autoCredito = DOADORES_REAIS
      .filter(d => d.tipoDoacao === 'DOACAO_AUTOMATICA')
      .reduce((acc, d) => acc + d.creditoGerado, 0);
    const diretaCredito = DOADORES_REAIS
      .filter(d => d.tipoDoacao === 'DOACAO')
      .reduce((acc, d) => acc + d.creditoGerado, 0);

    return [
      { name: 'Doação Automática (Fidelizada)', value: autoCredito, color: '#004A6D', count: DOADORES_REAIS.filter(d => d.tipoDoacao === 'DOACAO_AUTOMATICA').length },
      { name: 'Doação Direta (Manual / App)', value: diretaCredito, color: '#00E3E6', count: DOADORES_REAIS.filter(d => d.tipoDoacao === 'DOACAO').length }
    ];
  }, []);

  return (
    <div className="space-y-6">
      
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
            Regra Fundamental: Estritamente filtrado por <code className="bg-[#D9FBFF] px-1 py-0.5 rounded text-[#004A6D] font-mono font-bold">TipoDoacao IN (&apos;DOACAO_AUTOMATICA&apos;, &apos;DOACAO&apos;)</code>. Cadastros de empresas desconsiderados.
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
          value={`${totalDoadoresAtivos} Pessoas Físicas`}
          subValue="Base auditada e ativa"
          icon={UserCheck}
          iconBgColor="bg-[#004A6D]"
          iconColor="text-white"
          badge={{ text: 'Pessoas Físicas', color: 'bg-[#D9FBFF] text-[#004A6D]' }}
        />

        <KPICard
          id="kpi-cupons-doados"
          title="Cupons Pessoais Doados"
          value={formatarNumero(totalCuponsDoados)}
          subValue="Notas voluntárias registradas"
          icon={Receipt}
          iconBgColor="bg-[#D9FBFF]"
          iconColor="text-[#004A6D]"
          badge={{ text: 'CPF Vinculado', color: 'bg-[#EDCD01]/30 text-[#002A3A]' }}
        />

        <KPICard
          id="kpi-credito-doadores"
          title="Crédito Gerado por Doadores"
          value={formatarMoeda(totalCreditoGerado)}
          subValue="Repasse efetivo da SEFAZ"
          icon={DollarSign}
          iconBgColor="bg-[#00E04B]/20"
          iconColor="text-[#006E24]"
          badge={{ text: 'Impacto Social', color: 'bg-[#FD3168] text-white' }}
        />

        <KPICard
          id="kpi-ticket-doador"
          title="Ticket Médio / Doador"
          value={formatarMoeda(ticketMedioPorDoador)}
          subValue="Retorno médio por pessoa"
          icon={HeartHandshake}
          iconBgColor="bg-[#EDCD01]/25"
          iconColor="text-[#002A3A]"
          badge={{ text: 'LTV Médio', color: 'bg-[#00E3E6]/30 text-[#004A6D]' }}
        />
      </div>

      {/* Charts Row: Top 15 Doadores + Modalidade Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top 15 Doadores Bar Chart */}
        <div className="lg:col-span-2 bg-white border border-[#BCD3DF]/60 rounded-2xl p-5 shadow-2xs">
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
            <span className="text-xs font-semibold text-[#004A6D] bg-[#D9FBFF] px-2.5 py-1 rounded-full">
              Clique em um doador abaixo para inspecionar lojas
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top15Doadores} margin={{ top: 10, right: 10, left: 10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8F1F5" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10, fill: '#004A6D' }} 
                  angle={-30} 
                  textAnchor="end" 
                  height={45} 
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#004A6D' }} 
                  tickFormatter={(val) => `R$ ${val}`} 
                />
                <Tooltip 
                  formatter={(val: any) => [formatarMoeda(Number(val)), 'Crédito Gerado']}
                  contentStyle={{ backgroundColor: '#002A3A', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }}
                  itemStyle={{ color: '#FFFFFF' }}
                />
                <Bar 
                  dataKey="credito" 
                  radius={[4, 4, 0, 0]}
                  onClick={(data: any) => {
                    if (data?.id) setSelectedDoadorId(data.id);
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
          </div>
        </div>

        {/* Modalidade Donut */}
        <div className="bg-white border border-[#BCD3DF]/60 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="mb-2 pb-3 border-b border-[#F0F5F8]">
              <h2 className="text-base font-bold text-[#002A3A]">
                Distribuição por Modalidade
              </h2>
              <p className="text-xs text-[#004A6D]/70">
                Doação Automática vs Doação Direta
              </p>
            </div>

            <div className="h-44 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={modalidadeStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={68}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {modalidadeStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => formatarMoeda(Number(value))}
                    contentStyle={{ backgroundColor: '#002A3A', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }}
                    itemStyle={{ color: '#FFFFFF' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 mt-2 pt-2 border-t border-[#F0F5F8]">
            {modalidadeStats.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-xs shrink-0" style={{ backgroundColor: item.color }}></span>
                  <span className="font-semibold text-[#002A3A]">{item.name}</span>
                </div>
                <div className="text-right font-bold text-[#004A6D]">
                  {formatarMoeda(item.value)}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* MÓDULO INTERATIVO: DOADOR X LOJAS */}
      <div className="bg-gradient-to-br from-[#F8FCFD] to-[#EBF6F9] border-2 border-[#00E3E6]/60 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
        
        {/* Module Header with Selector */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#BCD3DF]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#004A6D] text-[#00E3E6]">
                Módulo Interativo Exclusivo
              </span>
              <span className="text-xs font-bold text-[#004A6D]">Cruzamento Inteligente</span>
            </div>
            <h2 className="text-xl font-black text-[#002A3A] tracking-tight mt-1 font-['Raleway',sans-serif]">
              Doador x Lojas & Estabelecimentos Frequentes
            </h2>
            <p className="text-xs text-[#004A6D]/80">
              Selecione qualquer doador da base para auditar em quais lojas parceiras ele comprou, quantidade de cupons e créditos gerados por loja.
            </p>
          </div>

          {/* Interactive Selector Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="select-doador" className="text-xs font-bold text-[#004A6D] whitespace-nowrap">
              Escolher Doador:
            </label>
            <select
              id="select-doador"
              value={selectedDoadorId}
              onChange={(e) => setSelectedDoadorId(e.target.value)}
              className="bg-white border border-[#004A6D] rounded-xl px-3 py-2 text-xs font-bold text-[#002A3A] shadow-xs focus:ring-2 focus:ring-[#00E3E6] outline-none max-w-[260px] truncate cursor-pointer"
            >
              {DOADORES_REAIS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nome} ({d.perfilFidelidade} • {d.totalCupons} cupons)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Donor Profile Summary */}
        <div className="bg-white rounded-xl p-4 border border-[#BCD3DF] shadow-2xs grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 items-center">
          <div>
            <span className="text-[10px] font-bold text-[#004A6D]/60 uppercase block">Nome Completo</span>
            <span className="text-sm font-extrabold text-[#002A3A] block truncate">{doadorSelecionado.nome}</span>
            <span className="text-[11px] font-mono text-[#004A6D]">{doadorSelecionado.cpf}</span>
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
            <span className="text-[10px] font-bold text-[#004A6D]/60 uppercase block">Perfil Fidelidade</span>
            <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-extrabold mt-0.5 ${
              doadorSelecionado.perfilFidelidade === 'Pleno' ? 'bg-[#00E04B]/20 text-[#006E24]' : 'bg-[#EDCD01]/30 text-[#002A3A]'
            }`}>
              {doadorSelecionado.perfilFidelidade === 'Pleno' ? 'Doador Pleno (Recorrente)' : 'Doador Restrito'}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-[#004A6D]/60 uppercase block">Histórico de Ativação</span>
            <span className="text-xs font-bold text-[#002A3A] block">{doadorSelecionado.mesesAtivo} meses contínuos</span>
            <span className="text-[10px] text-[#004A6D]/70">Desde {doadorSelecionado.dataAdesao}</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-[#004A6D]/60 uppercase block">Total Cupons Gerados</span>
            <span className="text-sm font-black text-[#004A6D]">{formatarNumero(doadorSelecionado.totalCupons)} notas</span>
            <span className="text-[10px] text-[#004A6D]/70 block">Ticket: {formatarMoeda(doadorSelecionado.ticketMedioCredito)}/nota</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-[#004A6D]/60 uppercase block">Crédito Total Apurado</span>
            <span className="text-base font-black text-[#002A3A]">{formatarMoeda(doadorSelecionado.creditoGerado)}</span>
            <span className="text-[10px] text-[#00E04B] font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[#00E04B]" /> SEFAZ {doadorSelecionado.statusSefaz}
            </span>
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
              {doadorSelecionado.lojasFrequentes.length} estabelecimentos com cupons confirmados
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-white border-b border-[#F0F5F8] text-[#004A6D] font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-4">Estabelecimento / Loja Parceira</th>
                  <th className="py-2.5 px-4 text-center">Quantidade de Cupons</th>
                  <th className="py-2.5 px-4 text-right">Valor Total de Compras</th>
                  <th className="py-2.5 px-4 text-right">Crédito NFP Gerado</th>
                  <th className="py-2.5 px-4 text-right">Ticket Médio / Cupom</th>
                  <th className="py-2.5 px-4 text-center">Participação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F5F8]">
                {doadorSelecionado.lojasFrequentes.map((loja, idx) => {
                  const percCredito = (loja.creditoGerado / doadorSelecionado.creditoGerado) * 100;
                  const ticketLoja = loja.quantidadeCupons > 0 ? loja.creditoGerado / loja.quantidadeCupons : 0;

                  return (
                    <tr key={idx} className="hover:bg-[#F8FCFD] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#002A3A] flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#00E3E6]"></span>
                          {loja.nomeLoja}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-[#004A6D]">
                        {loja.quantidadeCupons} cupons
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-[#002A3A]">
                        {formatarMoeda(loja.valorGasto)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-black text-sm text-[#004A6D]">
                          {formatarMoeda(loja.creditoGerado)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-[#002A3A]">
                        {formatarMoeda(ticketLoja)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 bg-[#EEF5F8] rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-[#004A6D] h-full rounded-full" 
                              style={{ width: `${percCredito}%` }}
                            ></div>
                          </div>
                          <span className="text-[10px] font-bold text-[#004A6D]">
                            {percCredito.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Donors Search and Full List Table */}
      <div className="bg-white border border-[#BCD3DF]/60 rounded-2xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#F0F5F8]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#004A6D]/60 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar doador por Nome ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#F4F9FA] border border-[#BCD3DF] rounded-xl text-xs sm:text-sm font-medium text-[#002A3A] focus:outline-none focus:border-[#004A6D]"
            />
          </div>
          <span className="text-xs text-[#004A6D] font-semibold">
            {doadoresFiltrados.length} doadores encontrados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F4F9FA] border-b border-[#BCD3DF] text-[#004A6D] font-bold uppercase text-[11px]">
                <th className="py-2.5 px-3">Doador(a)</th>
                <th className="py-2.5 px-3">CPF</th>
                <th className="py-2.5 px-3">Modalidade</th>
                <th className="py-2.5 px-3">Fidelidade</th>
                <th className="py-2.5 px-3 text-center">Tempo Ativo</th>
                <th className="py-2.5 px-3 text-right">Cupons</th>
                <th className="py-2.5 px-3 text-right">Crédito Total (R$)</th>
                <th className="py-2.5 px-3 text-right">Ticket Médio</th>
                <th className="py-2.5 px-3 text-center">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F5F8]">
              {doadoresFiltrados.map((d) => {
                const isSelected = d.id === selectedDoadorId;
                return (
                  <tr 
                    key={d.id} 
                    className={`transition-colors cursor-pointer ${
                      isSelected ? 'bg-[#D9FBFF]/40 font-semibold' : 'hover:bg-[#F8FCFD]'
                    }`}
                    onClick={() => setSelectedDoadorId(d.id)}
                  >
                    <td className="py-3 px-3 font-bold text-[#002A3A]">
                      {d.nome}
                    </td>
                    <td className="py-3 px-3 font-mono text-[#004A6D]">
                      {d.cpf}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        d.tipoDoacao === 'DOACAO_AUTOMATICA' ? 'bg-[#004A6D] text-white' : 'bg-[#00E3E6] text-[#002A3A]'
                      }`}>
                        {d.tipoDoacao === 'DOACAO_AUTOMATICA' ? 'Automática' : 'Direta'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-sm text-[10px] font-extrabold ${
                        d.perfilFidelidade === 'Pleno' ? 'bg-[#00E04B]/20 text-[#006E24]' : 'bg-[#EDCD01]/30 text-[#002A3A]'
                      }`}>
                        {d.perfilFidelidade}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center text-[#004A6D]">
                      {d.mesesAtivo} meses
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-[#002A3A]">
                      {formatarNumero(d.totalCupons)}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-[#004A6D]">
                      {formatarMoeda(d.creditoGerado)}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-[#002A3A]">
                      {formatarMoeda(d.ticketMedioCredito)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDoadorId(d.id);
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
        </div>
      </div>

    </div>
  );
};
