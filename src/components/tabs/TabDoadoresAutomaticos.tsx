import React from 'react';
import { 
  Users, 
  UserCheck, 
  TrendingUp, 
  ShieldCheck, 
  Repeat, 
  Zap, 
  Sparkles,
  Loader2,
  Table
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { KPICard } from '../KPICard';
import { BrandBadge } from '../BrandBadge';
import { MetricaMensal } from '../../types';
import { formatarMoeda, formatarNumero, formatarPorcentagem } from '../../data/mockDatabase';
import { useSupabaseMapaInterno, MapaInternoRow } from '../../hooks/useSupabaseMapaInterno';

interface TabDoadoresAutomaticosProps {
  metricasFiltradas?: MetricaMensal[];
  selectedYears?: number[];
  selectedMonths?: number[];
}

export const TabDoadoresAutomaticos: React.FC<TabDoadoresAutomaticosProps> = ({
  metricasFiltradas = [],
  selectedYears = [],
  selectedMonths = []
}) => {
  const { data: mapaInterno, isLoading, error } = useSupabaseMapaInterno();

  // Filtrar dados da vocacao_mapa_interno de acordo com selectedYears e selectedMonths do filtro principal
  let filteredMapaInterno = mapaInterno;

  if (mapaInterno.length > 0) {
    if (selectedYears.length > 0 || selectedMonths.length > 0) {
      filteredMapaInterno = mapaInterno.filter(row => {
        const matchesYear = selectedYears.length === 0 || (row.ano && selectedYears.includes(row.ano));
        const matchesMonth = selectedMonths.length === 0 || (row.mes && selectedMonths.includes(row.mes));
        return matchesYear && matchesMonth;
      });
    } else if (metricasFiltradas.length > 0) {
      const periodosPermitidos = new Set<string>();
      metricasFiltradas.forEach(m => {
        let y = m.ano;
        let mNum = m.mes && m.mes.includes('-') ? parseInt(m.mes.split('-')[1], 10) : Number(m.mes || 0);
        if (y && mNum) {
          periodosPermitidos.add(`${y}-${mNum}`);
        }
      });
      filteredMapaInterno = mapaInterno.filter(row => row.ano && row.mes && periodosPermitidos.has(`${row.ano}-${row.mes}`));
    }
  }

  // Dados para gráficos e KPIs ordenados cronologicamente (ASC)
  const chartData = filteredMapaInterno.slice().sort((a, b) => 
    String(a.ano_mes || '').localeCompare(String(b.ano_mes || ''))
  );

  // 1º KPI: Sempre o valor mais atual do filtro (doadores plenos do último mês filtrado)
  const ultimoMesFiltrado = chartData[chartData.length - 1] || ({} as Partial<MapaInternoRow>);
  const doadoresPlenosMaisAtual = ultimoMesFiltrado.doadores_plenos || 0;
  const mesNomeMaisAtual = ultimoMesFiltrado.mesNome || 'Último Mês';

  // 2º KPI: Soma do filtro (total de cupons reconhecidos aut_cup / qtde_cupons)
  const totalCuponsAuto = chartData.reduce((acc, r) => acc + Number(r.total_cupons_auto || 0), 0);

  // 4º KPI: Soma dos créditos automatizados aut_cred no filtro
  const totalCreditoAuto = chartData.reduce((acc, r) => acc + Number(r.total_credito_auto || 0), 0);

  // 3º KPI: Média real do ticket médio no período (Crédito Total / Cupons Totais do período, ou média das médias)
  const arrayTicketsValidos = chartData
    .map(r => Number(r.ticket_medio_auto || 0))
    .filter(t => t > 0);

  const mediaDasMediasTicket = totalCuponsAuto > 0
    ? (totalCreditoAuto / totalCuponsAuto)
    : (arrayTicketsValidos.length > 0 ? arrayTicketsValidos.reduce((acc, t) => acc + t, 0) / arrayTicketsValidos.length : 0);

  // Tabela Analítica: Linhas da seleção do filtro (respeitando o filtro de data), > 2025 (>= 2026) e ordenadas com o mais recente PRIMEIRO (DESC)
  const tabelaAnaliticaData = filteredMapaInterno
    .filter(row => (row.ano || 0) >= 2026)
    .sort((a, b) => String(b.ano_mes || '').localeCompare(String(a.ano_mes || '')));

  return (
    <div className="space-y-6">
      
      {/* Title & Brand Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#002A3A] tracking-tight font-['Raleway',sans-serif]">
              Doadores Automáticos
            </h1>
            <BrandBadge highlightText="recorrência" prefix="Engajamento &" suffix="fidelidade" colorVariant="green" size="md" />
          </div>
          <p className="text-xs text-[#004A6D]/80">
            Acompanhamento da base de doadores recorrentes via doação automática da Nota Fiscal Paulista.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold bg-[#D9FBFF] text-[#004A6D] px-3 py-1.5 rounded-xl border border-[#00E3E6]/40">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-[#004A6D]" /> : <Repeat className="w-4 h-4 text-[#004A6D]" />}
          <span>Mês Mais Atual ({mesNomeMaisAtual}): {formatarNumero(doadoresPlenosMaisAtual)} doadores plenos</span>
        </div>
      </div>

      {/* 4 KPIs configurados com textos limpos para gestores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1º KPI: Doadores Plenos do Mês Mais Atual */}
        <KPICard
          id="kpi-doadores-plenos"
          title="Doadores Plenos (Recorrentes)"
          value={formatarNumero(doadoresPlenosMaisAtual)}
          subValue={`Posição mais recente (${mesNomeMaisAtual}) no filtro`}
          icon={UserCheck}
          iconBgColor="bg-[#00E04B]/20"
          iconColor="text-[#006E24]"
          badge={{ text: `Atual (${mesNomeMaisAtual})`, color: 'bg-[#00E04B]/25 text-[#006E24]' }}
        />

        {/* 2º KPI: Total de Cupons (Soma do filtro: aut_cup > 0 ? aut_cup : qtde_cupons) */}
        <KPICard
          id="kpi-total-cupons-auto"
          title="Total de Cupons Automatizados"
          value={formatarNumero(totalCuponsAuto)}
          subValue="Consolidado no período selecionado"
          icon={Users}
          iconBgColor="bg-[#004A6D]"
          iconColor="text-[#00E3E6]"
          badge={{ text: 'Consolidado', color: 'bg-[#D9FBFF] text-[#004A6D]' }}
        />

        {/* 3º KPI: Média dos períodos selecionados */}
        <KPICard
          id="kpi-ticket-medio-auto"
          title="Ticket Médio / Cupom"
          value={formatarMoeda(mediaDasMediasTicket)}
          subValue="Média apurada no período selecionado"
          icon={TrendingUp}
          iconBgColor="bg-[#EDCD01]/30"
          iconColor="text-[#002A3A]"
          badge={{ text: 'Média Apurada', color: 'bg-[#EDCD01]/40 text-[#002A3A]' }}
        />

        {/* 4º KPI: Crédito Total Automatizado */}
        <KPICard
          id="kpi-credito-total-auto"
          title="Crédito Total Automatizado"
          value={formatarMoeda(totalCreditoAuto)}
          subValue="Total de créditos de doações automáticas"
          icon={Zap}
          iconBgColor="bg-[#FD3168]/15"
          iconColor="text-[#FD3168]"
          badge={{ text: 'Receita Total', color: 'bg-[#FD3168] text-white' }}
        />
      </div>

      {/* Chart 1: Crescimento Histórico da Base de Doadores Automáticos (Plenos vs Restritos) */}
      <div className="bg-white border border-[#BCD3DF]/60 rounded-2xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#F0F5F8]">
          <div>
            <h2 className="text-base font-bold text-[#002A3A] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#004A6D]" />
              Evolução dos Doadores Automáticos (vocacao_mapa_interno)
            </h2>
            <p className="text-xs text-[#004A6D]/70">
              Série temporal dos doadores automáticos cadastrados segmentada entre Doadores Plenos e Restritos
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-[#004A6D]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#004A6D]"></span> Doadores Plenos
            </span>
            <span className="flex items-center gap-1.5 text-[#004A6D]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00E3E6]"></span> Doadores Restritos
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPlenos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#004A6D" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#004A6D" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorRestritos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00E3E6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#00E3E6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8F1F5" />
              <XAxis 
                dataKey="mesNome" 
                tick={{ fontSize: 11, fill: '#004A6D' }} 
                axisLine={{ stroke: '#BCD3DF' }} 
                tickLine={false} 
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#004A6D' }} 
                axisLine={false} 
                tickLine={false} 
              />
              <Tooltip 
                formatter={(val: any) => [`${formatarNumero(Number(val))} doadores`]}
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
              <Area 
                type="monotone" 
                name="Doadores Plenos"
                dataKey="doadores_plenos" 
                stackId="1" 
                stroke="#004A6D" 
                fill="url(#colorPlenos)" 
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                name="Doadores Restritos"
                dataKey="doadores_restritos" 
                stackId="1" 
                stroke="#00E3E6" 
                fill="url(#colorRestritos)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Evolução do Ticket Médio Automatizado */}
      <div className="bg-white border border-[#BCD3DF]/60 rounded-2xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#F0F5F8]">
          <div>
            <h2 className="text-base font-bold text-[#002A3A] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#00E04B]" />
              Evolução do Ticket Médio por Cupom (R$)
            </h2>
            <p className="text-xs text-[#004A6D]/70">
              Retorno médio obtido por cupom fiscal nos doadores automáticos
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-[#004A6D]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#004A6D]"></span> Ticket Médio / Cupom (AUT)
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8F1F5" />
              <XAxis 
                dataKey="mesNome" 
                tick={{ fontSize: 11, fill: '#004A6D' }} 
                axisLine={{ stroke: '#BCD3DF' }} 
                tickLine={false} 
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#004A6D' }} 
                domain={['auto', 'auto']}
                tickFormatter={(val) => `R$ ${val.toFixed(2)}`} 
                axisLine={false} 
                tickLine={false} 
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
              <Line 
                type="monotone" 
                name="Ticket Automática"
                dataKey="ticket_medio_auto" 
                stroke="#004A6D" 
                strokeWidth={3} 
                dot={{ r: 3, fill: '#004A6D' }} 
                activeDot={{ r: 6, fill: '#00E3E6' }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabela Analítica: Dados em Tempo Real da Tabela vocacao_mapa_interno */}
      <div className="bg-white border border-[#BCD3DF]/60 rounded-2xl p-5 shadow-2xs">
        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-[#F0F5F8]">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-[#004A6D]" />
            <h2 className="text-base font-bold text-[#002A3A]">
              Tabela Analítica (vocacao_mapa_interno)
            </h2>
          </div>
          <span className="text-xs text-[#004A6D] font-semibold bg-[#D9FBFF] px-2.5 py-1 rounded-full">
            {tabelaAnaliticaData.length} meses exibidos (&gt;2025)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F4F9FA] border-b border-[#BCD3DF] text-[#004A6D] font-bold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3">Mês / Ano</th>
                <th className="py-2.5 px-3 text-right">Doadores Automáticos</th>
                <th className="py-2.5 px-3 text-right">Doadores Plenos</th>
                <th className="py-2.5 px-3 text-right">Doadores Restritos</th>
                <th className="py-2.5 px-3 text-right">Novos Doadores</th>
                <th className="py-2.5 px-3 text-right">Ticket Médio (AUT)</th>
                <th className="py-2.5 px-3 text-right">Crédito Total AUT (R$)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F5F8]">
              {tabelaAnaliticaData.map((row, idx) => (
                <tr key={row.id || `${row.ano_mes}-${idx}`} className="hover:bg-[#F8FCFD] transition-colors">
                  <td className="py-2.5 px-3 font-bold text-[#002A3A]">
                    {row.mesNome || row.ano_mes}
                  </td>
                  <td className="py-2.5 px-3 text-right font-black text-[#004A6D]">
                    {formatarNumero(row.doadores_automaticos || 0)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-[#00E04B]">
                    {formatarNumero(row.doadores_plenos || 0)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-[#004A6D]/70">
                    {formatarNumero(row.doadores_restritos || 0)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold text-[#002A3A]">
                    {formatarNumero(row.novos_doadores || 0)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-[#002A3A]">
                    {formatarMoeda(row.ticket_medio_auto || 0)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-black text-[#004A6D]">
                    {formatarMoeda(row.total_credito_auto || 0)}
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
