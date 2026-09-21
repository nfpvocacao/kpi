import React from 'react';
import { 
  Users, 
  UserCheck, 
  TrendingUp, 
  ShieldCheck, 
  Repeat, 
  Zap, 
  Calendar,
  Sparkles,
  ArrowUpRight,
  Heart
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
  Tooltip, 
  Legend 
} from 'recharts';
import { KPICard } from '../KPICard';
import { BrandBadge } from '../BrandBadge';
import { MetricaMensal } from '../../types';
import { METRICAS_MENSAIS, formatarMoeda, formatarNumero, formatarPorcentagem } from '../../data/mockDatabase';

interface TabDoadoresAutomaticosProps {
  metricasFiltradas: MetricaMensal[];
}

export const TabDoadoresAutomaticos: React.FC<TabDoadoresAutomaticosProps> = ({
  metricasFiltradas
}) => {
  // Current latest month in the dataset
  const ultimoMes = metricasFiltradas[metricasFiltradas.length - 1] || METRICAS_MENSAIS[METRICAS_MENSAIS.length - 1];
  const primeiroMes = metricasFiltradas[0] || METRICAS_MENSAIS[0];

  const totalDoadoresAuto = ultimoMes.doadoresAutomaticosAtivos;
  const doadoresPlenos = ultimoMes.doadoresPlenos;
  const doadoresRestritos = ultimoMes.doadoresRestritos;

  const taxaPlenos = totalDoadoresAuto > 0 ? (doadoresPlenos / totalDoadoresAuto) * 100 : 0;
  const crescimentoBase = primeiroMes.doadoresAutomaticosAtivos > 0 
    ? ((totalDoadoresAuto - primeiroMes.doadoresAutomaticosAtivos) / primeiroMes.doadoresAutomaticosAtivos) * 100 
    : 0;

  // Average ticket comparison
  const ticketMedioAutoAtual = ultimoMes.ticketMedioAutomatica;
  const ticketMedioGeralAtual = ultimoMes.ticketMedioGeral;
  const premiumTicketAuto = ((ticketMedioAutoAtual - ticketMedioGeralAtual) / ticketMedioGeralAtual) * 100;

  // LTV Projection: based on monthly retention and annual coupons
  const ticketAnualMedioDoador = ticketMedioAutoAtual * 18 * 12; // ~18 cupons/mês

  return (
    <div className="space-y-6">
      
      {/* Title & Brand Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#002A3A] tracking-tight font-['Raleway',sans-serif]">
              Doadores Automáticos & Recorrência (Histórico)
            </h1>
            <BrandBadge highlightText="recorrência" prefix="Fidelidade &" suffix="garantida" colorVariant="green" size="sm" />
          </div>
          <p className="text-xs text-[#004A6D]/80">
            Inteligência de retenção e LTV da modalidade mais sustentável e de maior rentabilidade da Nota Fiscal Paulista.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold bg-[#D9FBFF] text-[#004A6D] px-3 py-1.5 rounded-xl border border-[#00E3E6]/40">
          <Repeat className="w-4 h-4 text-[#004A6D]" />
          <span>Base Ativa: {formatarNumero(totalDoadoresAuto)} doadores cadastrados</span>
        </div>
      </div>

      {/* 4 KPIs for Tab 4 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          id="kpi-base-automatica"
          title="Base de Doadores Automáticos"
          value={formatarNumero(totalDoadoresAuto)}
          subValue={`Crescimento de ${formatarPorcentagem(crescimentoBase)} no período`}
          trend={{
            value: formatarPorcentagem(crescimentoBase),
            isPositive: true,
            label: 'evolução histórica'
          }}
          icon={Users}
          iconBgColor="bg-[#004A6D]"
          iconColor="text-[#00E3E6]"
          badge={{ text: 'Alta Fidelidade', color: 'bg-[#D9FBFF] text-[#004A6D]' }}
        />

        <KPICard
          id="kpi-doadores-plenos"
          title="Doadores Plenos (Recorrentes)"
          value={formatarNumero(doadoresPlenos)}
          subValue={`${taxaPlenos.toFixed(1)}% da base automática é Plena`}
          trend={{
            value: `${taxaPlenos.toFixed(1)}%`,
            isPositive: true,
            label: 'índice de engajamento'
          }}
          icon={UserCheck}
          iconBgColor="bg-[#00E04B]/20"
          iconColor="text-[#006E24]"
          badge={{ text: 'Ativos 12m', color: 'bg-[#00E04B]/25 text-[#006E24]' }}
        />

        <KPICard
          id="kpi-ticket-comparativo"
          title="Ticket Médio / Nota (AUT)"
          value={formatarMoeda(ticketMedioAutoAtual)}
          subValue={`+${premiumTicketAuto.toFixed(1)}% superior ao ticket geral (${formatarMoeda(ticketMedioGeralAtual)})`}
          trend={{
            value: `+${premiumTicketAuto.toFixed(0)}%`,
            isPositive: true,
            label: 'rentabilidade unitária'
          }}
          icon={TrendingUp}
          iconBgColor="bg-[#EDCD01]/30"
          iconColor="text-[#002A3A]"
          badge={{ text: 'Premium SEFAZ', color: 'bg-[#FD3168] text-white' }}
        />

        <KPICard
          id="kpi-ltv-anual"
          title="LTV Anual Estimado / Doador"
          value={formatarMoeda(ticketAnualMedioDoador)}
          subValue="Receita líquida anual por doador pleno"
          icon={Zap}
          iconBgColor="bg-[#FD3168]/15"
          iconColor="text-[#FD3168]"
          badge={{ text: 'Receita Projetada', color: 'bg-[#EDCD01]/30 text-[#002A3A]' }}
        />
      </div>

      {/* Chart 1: Crescimento Histórico da Base de Doadores Automáticos (Plenos vs Restritos) */}
      <div className="bg-white border border-[#BCD3DF]/60 rounded-2xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#F0F5F8]">
          <div>
            <h2 className="text-base font-bold text-[#002A3A] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#004A6D]" />
              Crescimento Histórico da Base de Doadores Automáticos
            </h2>
            <p className="text-xs text-[#004A6D]/70">
              Evolução mensal da base ativa segmentada entre Doadores Plenos e Doadores Restritos
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
            <AreaChart data={metricasFiltradas} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
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
                formatter={(val: any, name: any) => [
                  `${formatarNumero(Number(val))} doadores`,
                  name === 'doadoresPlenos' ? 'Doadores Plenos' : 'Doadores Restritos'
                ]}
                contentStyle={{ backgroundColor: '#002A3A', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }}
              />
              <Area 
                type="monotone" 
                dataKey="doadoresPlenos" 
                stackId="1" 
                stroke="#004A6D" 
                fill="url(#colorPlenos)" 
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="doadoresRestritos" 
                stackId="1" 
                stroke="#00E3E6" 
                fill="url(#colorRestritos)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Evolução Comparativa do Ticket Médio: Doação Automática vs Geral */}
      <div className="bg-white border border-[#BCD3DF]/60 rounded-2xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#F0F5F8]">
          <div>
            <h2 className="text-base font-bold text-[#002A3A] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#00E04B]" />
              Evolução Comparativa do Ticket Médio por Cupom (R$)
            </h2>
            <p className="text-xs text-[#004A6D]/70">
              Comparativo direto: Retorno médio de notas de Doadores Automáticos (AUT) vs Geral (Urnas / Diretas)
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-[#004A6D]">
              <span className="w-3 h-0.5 bg-[#004A6D]"></span> Ticket AUT (Doação Automática)
            </span>
            <span className="flex items-center gap-1.5 text-[#004A6D]">
              <span className="w-3 h-0.5 bg-[#EDCD01]"></span> Ticket Geral Consolidado
            </span>
            <span className="flex items-center gap-1.5 text-[#004A6D]">
              <span className="w-3 h-0.5 bg-[#BCD3DF]"></span> Ticket Urnas Parceiras
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metricasFiltradas} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                formatter={(val: any, name: any) => [
                  formatarMoeda(Number(val)),
                  name === 'ticketMedioAutomatica' ? 'Ticket Automática (AUT)' :
                  name === 'ticketMedioGeral' ? 'Ticket Médio Geral' : 'Ticket Urnas'
                ]}
                contentStyle={{ backgroundColor: '#002A3A', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }}
              />
              <Line 
                type="monotone" 
                dataKey="ticketMedioAutomatica" 
                stroke="#004A6D" 
                strokeWidth={3} 
                dot={{ r: 3, fill: '#004A6D' }} 
                activeDot={{ r: 6, fill: '#00E3E6' }} 
              />
              <Line 
                type="monotone" 
                dataKey="ticketMedioGeral" 
                stroke="#EDCD01" 
                strokeWidth={2} 
                strokeDasharray="4 4"
                dot={{ r: 2, fill: '#EDCD01' }} 
              />
              <Line 
                type="monotone" 
                dataKey="ticketMedioUrnas" 
                stroke="#BCD3DF" 
                strokeWidth={1.5} 
                dot={false} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Strategic Insight Card: Plenos vs Restritos */}
      <div className="bg-gradient-to-r from-[#004A6D] to-[#002A3A] rounded-2xl p-6 text-white shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="md:col-span-2 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00E3E6]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#00E3E6]">
              Inteligência de Retenção Vocação
            </span>
          </div>
          <h3 className="text-lg font-black tracking-tight font-['Raleway',sans-serif]">
            Diferença Estratégica: Doador Pleno vs Doador Restrito
          </h3>
          <p className="text-xs text-white/80 leading-relaxed">
            <strong>Doadores Plenos ({taxaPlenos.toFixed(0)}% da base)</strong> possuem compras registradas em pelo menos 10 dos 12 meses do ano com cupom fiscal automático, gerando uma receita média previsível de R$ 680 a R$ 1.800/ano por pessoa. Estratégias de relacionamento ativo focam em converter doadores restritos em plenos.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center space-y-1">
          <span className="text-[11px] text-white/70 uppercase font-semibold block">Taxa de Conversão Plena</span>
          <div className="text-3xl font-black text-[#00E3E6]">
            {taxaPlenos.toFixed(1)}%
          </div>
          <span className="text-[10px] text-[#00E04B] font-bold block">
            +4.2% nos últimos 6 meses
          </span>
        </div>
      </div>

    </div>
  );
};
