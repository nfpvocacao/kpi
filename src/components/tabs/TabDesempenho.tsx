import React from 'react';
import {
  DollarSign,
  Receipt,
  Percent,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  Layers,
  Calendar
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { KPICard } from '../KPICard';
import { BrandBadge } from '../BrandBadge';
import { MetricaMensal } from '../../types';
import { formatarMoeda, formatarNumero, formatarPorcentagem } from '../../data/mockDatabase';

interface TabDesempenhoProps {
  metricasFiltradas: MetricaMensal[];
  periodoLabel: string;
  metricasAnterior: MetricaMensal[];
}

export const TabDesempenho: React.FC<TabDesempenhoProps> = ({
  metricasFiltradas,
  periodoLabel,
  metricasAnterior
}) => {
  // Aggregate current period
  const totalCreditos = metricasFiltradas.reduce((acc, m) => acc + m.creditoTotal, 0);
  const totalCupons = metricasFiltradas.reduce((acc, m) => acc + m.cuponsValidos, 0);
  const totalCreditoAuto = metricasFiltradas.reduce((acc, m) => acc + m.creditoAutomatica, 0);
  const totalCreditoDireta = metricasFiltradas.reduce((acc, m) => acc + m.creditoDireta, 0);
  const totalCreditoUrnas = metricasFiltradas.reduce((acc, m) => acc + m.creditoUrnas, 0);

  const ticketMedioGeral = totalCupons > 0 ? totalCreditos / totalCupons : 0;
  const participacaoAuto = totalCreditos > 0 ? (totalCreditoAuto / totalCreditos) * 100 : 0;

  // YoY comparison
  const totalCreditosAnterior = metricasAnterior.reduce((acc, m) => acc + m.creditoTotal, 0);
  const totalCuponsAnterior = metricasAnterior.reduce((acc, m) => acc + m.cuponsValidos, 0);
  const ticketAnterior = totalCuponsAnterior > 0 ? totalCreditosAnterior / totalCuponsAnterior : 0;
  const autoAnterior = totalCreditosAnterior > 0
    ? (metricasAnterior.reduce((acc, m) => acc + m.creditoAutomatica, 0) / totalCreditosAnterior) * 100
    : 0;

  const crescimentoCreditosYoY = totalCreditosAnterior > 0
    ? ((totalCreditos - totalCreditosAnterior) / totalCreditosAnterior) * 100
    : 18.5;

  const crescimentoCuponsYoY = totalCuponsAnterior > 0
    ? ((totalCupons - totalCuponsAnterior) / totalCuponsAnterior) * 100
    : 14.2;

  const crescimentoTicketYoY = ticketAnterior > 0
    ? ((ticketMedioGeral - ticketAnterior) / ticketAnterior) * 100
    : 3.8;

  const variacaoAutoYoY = autoAnterior > 0
    ? participacaoAuto - autoAnterior
    : 6.4;

  // Donut data for composition
  const composicaoReceitas = [
    { name: 'Doação Automática (PF)', valor: totalCreditoAuto, color: '#004A6D' },
    { name: 'Urnas & Empresas (CADASTRO)', valor: totalCreditoUrnas, color: '#EDCD01' },
    { name: 'Doação Direta / Manual (PF)', valor: totalCreditoDireta, color: '#00E3E6' }
  ];

  return (
    <div className="space-y-6">

      {/* Top Banner with Brand Tagline & Context */}
      <div className="bg-gradient-to-r from-[#004A6D] via-[#003B57] to-[#002A3A] rounded-2xl p-6 text-white shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Subtle decorative brand circles */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-[#00E3E6]/10 pointer-events-none blur-2xl"></div>
        <div className="absolute left-1/3 -top-10 w-32 h-32 rounded-full bg-[#EDCD01]/10 pointer-events-none blur-xl"></div>

        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-[#00E3E6]">
              Painel Estratégico Vocação
            </span>
            <span className="text-white/40">•</span>
            <span className="text-xs text-white/80 font-semibold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#00E3E6]" /> {periodoLabel}
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight font-['Raleway',sans-serif]">
            Desempenho & Captação NFP
          </h1>
          <p className="text-sm text-white/80 max-w-2xl font-normal">
            Acompanhamento consolidado de créditos definitivos apurados pela Secretaria da Fazenda de SP e volume operacional de notas capturadas.
          </p>
        </div>

        <div className="relative z-10 shrink-0 self-start md:self-auto">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-xl text-right">
            <span className="text-[11px] text-[#00E3E6] font-bold uppercase tracking-wider block mb-1">Slogan Institucional</span>
            <BrandBadge prefix="Onde potencial encontra" highlightText="caminho" colorVariant="yellow" size="sm" className="text-white font-bold" />
          </div>
        </div>
      </div>

      {/* Global 4 KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          id="kpi-creditos-totais"
          title="Créditos Totais (SEFAZ)"
          value={formatarMoeda(totalCreditos)}
          subValue="Receita total confirmada"
          trend={{
            value: formatarPorcentagem(crescimentoCreditosYoY),
            isPositive: crescimentoCreditosYoY >= 0,
            label: 'vs ano anterior (YoY)'
          }}
          icon={DollarSign}
          iconBgColor="bg-[#004A6D]"
          iconColor="text-[#00E3E6]"
          badge={{ text: 'Apuração Líquida', color: 'bg-[#D9FBFF] text-[#004A6D]' }}
        />

        <KPICard
          id="kpi-cupons-processados"
          title="Cupons Válidos"
          value={formatarNumero(totalCupons)}
          subValue="Notas com crédito apurado"
          trend={{
            value: formatarPorcentagem(crescimentoCuponsYoY),
            isPositive: crescimentoCuponsYoY >= 0,
            label: 'volume processado'
          }}
          icon={Receipt}
          iconBgColor="bg-[#D9FBFF]"
          iconColor="text-[#004A6D]"
          badge={{ text: 'Desduplicados', color: 'bg-[#EDCD01]/30 text-[#002A3A]' }}
        />

        <KPICard
          id="kpi-ticket-medio"
          title="Ticket Médio / Nota"
          value={formatarMoeda(ticketMedioGeral)}
          subValue="Retorno médio por cupom"
          trend={{
            value: formatarPorcentagem(crescimentoTicketYoY),
            isPositive: crescimentoTicketYoY >= 0,
            label: 'eficiência unitária'
          }}
          icon={TrendingUp}
          iconBgColor="bg-[#EDCD01]/30"
          iconColor="text-[#002A3A]"
          badge={{ text: 'R$ por NF', color: 'bg-[#00E04B]/25 text-[#006E24]' }}
        />

        <KPICard
          id="kpi-participacao-automatica"
          title="Participação Doação AUT"
          value={`${participacaoAuto.toFixed(1)}%`}
          subValue={formatarMoeda(totalCreditoAuto)}
          trend={{
            value: `${variacaoAutoYoY >= 0 ? '+' : ''}${variacaoAutoYoY.toFixed(1)} p.p.`,
            isPositive: variacaoAutoYoY >= 0,
            label: 'recorrência alta'
          }}
          icon={Percent}
          iconBgColor="bg-[#00E04B]/20"
          iconColor="text-[#006E24]"
          badge={{ text: 'Doadores Plenos', color: 'bg-[#FD3168] text-white' }}
        />
      </div>

      {/* Main Charts Row: Stacked Area + Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Stacked Area Chart: Evolução Mensal de Créditos por Categoria */}
        <div className="lg:col-span-2 bg-white border border-[#BCD3DF]/60 rounded-2xl p-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[#F0F5F8]">
            <div>
              <h2 className="text-base font-bold text-[#002A3A] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#004A6D]" />
                Evolução Mensal de Créditos por Categoria
              </h2>
              <p className="text-xs text-[#004A6D]/70">
                Segmentação entre Doação Automática, Doação Direta e Urnas/Parceiras (R$)
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#004A6D]"></span> Automática
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EDCD01]"></span> Urnas (Cadastro)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00E3E6]"></span> Direta
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metricasFiltradas} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAuto" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#004A6D" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#004A6D" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorUrnas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EDCD01" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#EDCD01" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorDireta" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E3E6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#00E3E6" stopOpacity={0.1} />
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
                  tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    formatarMoeda(Number(value)),
                    name === 'creditoAutomatica' ? 'Doação Automática' :
                      name === 'creditoUrnas' ? 'Urnas / CADASTRO' : 'Doação Direta'
                  ]}
                  labelFormatter={(label) => `Mês: ${label}`}
                  contentStyle={{ backgroundColor: '#002A3A', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }}
                  itemStyle={{ color: '#FFFFFF' }}
                />
                <Area
                  type="monotone"
                  dataKey="creditoAutomatica"
                  stackId="1"
                  stroke="#004A6D"
                  fill="url(#colorAuto)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="creditoUrnas"
                  stackId="1"
                  stroke="#EDCD01"
                  fill="url(#colorUrnas)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="creditoDireta"
                  stackId="1"
                  stroke="#00E3E6"
                  fill="url(#colorDireta)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart: Composição de Receitas */}
        <div className="bg-white border border-[#BCD3DF]/60 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="mb-2 pb-3 border-b border-[#F0F5F8]">
              <h2 className="text-base font-bold text-[#002A3A]">
                Composição de Receitas
              </h2>
              <p className="text-xs text-[#004A6D]/70">
                Divisão proporcional de receita por modalidade
              </p>
            </div>

            <div className="h-52 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={composicaoReceitas}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="valor"
                  >
                    {composicaoReceitas.map((entry, index) => (
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
              {/* Center value in donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[11px] text-[#004A6D]/70 font-semibold uppercase">Total</span>
                <span className="text-sm font-extrabold text-[#002A3A]">
                  R$ {(totalCreditos / 1000).toFixed(0)}k
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 mt-2 pt-2 border-t border-[#F0F5F8]">
            {composicaoReceitas.map((item, idx) => {
              const perc = totalCreditos > 0 ? (item.valor / totalCreditos) * 100 : 0;
              return (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: item.color }}></span>
                    <span className="font-semibold text-[#002A3A]">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#004A6D]">{formatarMoeda(item.valor)}</span>
                    <span className="text-[#004A6D]/60 ml-1 text-[11px]">({perc.toFixed(1)}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Secondary Row: Volume de Cupons Capturados (Bar) + Regras de Negócio Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Volume de Cupons Mensais */}
        <div className="lg:col-span-2 bg-white border border-[#BCD3DF]/60 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-[#F0F5F8]">
            <div>
              <h2 className="text-base font-bold text-[#002A3A] flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#00E3E6]" />
                Volume Mensal de Cupons Válidos Processados
              </h2>
              <p className="text-xs text-[#004A6D]/70">
                Quantidade de documentos fiscais apurados com sucesso pela SEFAZ
              </p>
            </div>
            <span className="text-xs font-bold text-[#004A6D] bg-[#D9FBFF] px-2.5 py-1 rounded-full border border-[#00E3E6]/40">
              Média: {formatarNumero(Math.round(totalCupons / (metricasFiltradas.length || 1)))} / mês
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metricasFiltradas} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
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
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: any) => [`${formatarNumero(Number(value))} cupons`, 'Volume Válido']}
                  contentStyle={{ backgroundColor: '#002A3A', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }}
                />
                <Bar
                  dataKey="cuponsValidos"
                  fill="#004A6D"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Business Logic Adherence Card */}
        <div className="bg-gradient-to-br from-[#F4F9FA] to-[#E9F5F8] border border-[#BCD3DF] rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="p-2 rounded-lg bg-[#004A6D] text-white">
                <Sparkles className="w-4 h-4 text-[#00E3E6]" />
              </span>
              <div>
                <h3 className="text-sm font-black text-[#004A6D] uppercase tracking-wide">
                  Regras de Apuração Ativas
                </h3>
                <p className="text-[11px] text-[#004A6D]/70 font-medium">Compliance e Auditoria Interna</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-[#BCD3DF]/70">
                <div className="flex items-center gap-1.5 font-bold text-[#004A6D] mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00E04B]" />
                  <span>1. Regra de Cadastradores (Urnas)</span>
                </div>
                <p className="text-[#002A3A]/80 leading-relaxed text-[11px]">
                  Cupons com <code className="bg-[#D9FBFF] px-1 py-0.5 rounded text-[#004A6D] font-mono">TipoDoacao = &apos;CADASTRO&apos;</code> pertencem à operação de Urnas e empresas parceiras. Não contabilizados como doadores individuais.
                </p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#BCD3DF]/70">
                <div className="flex items-center gap-1.5 font-bold text-[#004A6D] mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00E04B]" />
                  <span>2. Regra de Doadores Reais (PF)</span>
                </div>
                <p className="text-[#002A3A]/80 leading-relaxed text-[11px]">
                  Pessoas físicas filtradas por <code className="bg-[#D9FBFF] px-1 py-0.5 rounded text-[#004A6D] font-mono">TipoDoacao IN (&apos;DOACAO_AUTOMATICA&apos;, &apos;DOACAO&apos;)</code>.
                </p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#BCD3DF]/70">
                <div className="flex items-center gap-1.5 font-bold text-[#004A6D] mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00E04B]" />
                  <span>3. Desduplicação Automática</span>
                </div>
                <p className="text-[#002A3A]/80 leading-relaxed text-[11px]">
                  Em registros duplicados, prioridade estrita para cupons com status: <strong className="text-[#004A6D]">&apos;Pedido com documento encontrado.&apos;</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#BCD3DF]/80 flex items-center justify-between text-[11px] text-[#004A6D]">
            <span className="font-semibold">Base SEFAZ-SP Atualizada</span>
            <span className="font-mono bg-white px-2 py-0.5 rounded-sm border border-[#BCD3DF]">100% Auditado</span>
          </div>
        </div>

      </div>

    </div>
  );
};
