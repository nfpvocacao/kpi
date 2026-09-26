import React, { useState, useMemo, useRef } from 'react';
import { 
  Presentation, 
  Sparkles, 
  TrendingUp, 
  Users, 
  Building2, 
  Award, 
  Loader2, 
  CheckCircle2,
  BarChart3,
  Calendar,
  Layers,
  HelpCircle,
  Table,
  PieChart,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  LabelList
} from 'recharts';
import { KPICard } from '../KPICard';
import { BrandBadge } from '../BrandBadge';
import { CopyChartButton } from '../CopyChartButton';
import { MetricaMensal } from '../../types';
import { formatarMoeda, formatarNumero } from '../../data/mockDatabase';
import { useSupabaseMapaInterno, MapaInternoRow } from '../../hooks/useSupabaseMapaInterno';
import { useSupabaseBenchmarking } from '../../hooks/useSupabaseBenchmarking';
import { useSupabaseMetricas } from '../../hooks/useSupabaseMetricas';

interface TabApresentacaoProps {
  metricasFiltradas?: MetricaMensal[];
  selectedYears?: number[];
  selectedMonths?: number[];
}

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const YEAR_COLORS: Record<number, string> = {
  2027: '#9333EA', // Purple Violet
  2026: '#00E3E6', // Cyan Neon
  2025: '#004A6D', // Deep Navy Blue
  2024: '#EDCD01', // Bright Yellow/Gold
  2023: '#FD3168', // Vibrant Pink
  2022: '#00E04B', // Emerald Green
};

const FALLBACK_COLORS = ['#00E3E6', '#004A6D', '#EDCD01', '#FD3168', '#00E04B', '#9333EA', '#F97316'];

const OPERACAO_STACK_COLORS: Record<string, string> = {
  'Automatizados': '#004A6D',    // Navy Blue
  'Cadastro': '#00E3E6',         // Cyan Neon
  'Doação (Direta)': '#EDCD01', // Gold / Yellow
  'Consumo (Próprio)': '#FD3168' // Pink / Magenta
};

const MONTH_STACK_COLORS: Record<string, string> = {
  Jan: '#004A6D',
  Fev: '#006E24',
  Mar: '#00E3E6',
  Abr: '#EDCD01',
  Mai: '#FD3168',
  Jun: '#9333EA',
  Jul: '#F97316',
  Ago: '#3B82F6',
  Set: '#10B981',
  Out: '#EC4899',
  Nov: '#8B5CF6',
  Dez: '#06B6D4'
};

const QUARTER_COLORS: Record<string, string> = {
  'Q1 (Jan-Mar)': '#004A6D',
  'Q2 (Abr-Jun)': '#00E3E6',
  'Q3 (Jul-Set)': '#EDCD01',
  'Q4 (Out-Dez)': '#FD3168'
};

const SEMESTER_COLORS: Record<string, string> = {
  '1º Semestre (Jan-Jun)': '#004A6D',
  '2º Semestre (Jul-Dez)': '#00E3E6'
};

type MetricType = 'credito' | 'doadores' | 'cupons' | 'ticket';
type StackedBreakdownMode = 'tipo' | 'mensal' | 'trimestral';

export const TabApresentacao: React.FC<TabApresentacaoProps> = ({
  metricasFiltradas = [],
  selectedYears = [],
  selectedMonths = []
}) => {
  const chartYoyRef = useRef<HTMLDivElement>(null);
  const chartStackedRef = useRef<HTMLDivElement>(null);

  const { data: mapaInterno, isLoading: isLoadingMapa } = useSupabaseMapaInterno();
  const { data: supabaseBenchmarking, isLoading: isLoadingBench } = useSupabaseBenchmarking(selectedYears, selectedMonths);
  const { metricas: supabaseMetricas, isLoading: isLoadingMetricas } = useSupabaseMetricas();

  const [selectedMetric, setSelectedMetric] = useState<MetricType>('credito');
  const [showDataLabels, setShowDataLabels] = useState<boolean>(true);

  const isLoading = isLoadingMapa || isLoadingBench || isLoadingMetricas;

  // Fonte de dados consolidada da aba Desempenho (vocacao_consolidado_interno)
  const allMetricas = useMemo(() => {
    const base = (metricasFiltradas && metricasFiltradas.length > 0) ? metricasFiltradas : supabaseMetricas;
    if (!base || base.length === 0) return [];
    if (selectedYears.length === 0 && selectedMonths.length === 0) return base;
    return base.filter(m => {
      const matchesYear = selectedYears.length === 0 || selectedYears.includes(m.ano);
      const mNum = m.mes && m.mes.includes('-') ? parseInt(m.mes.split('-')[1], 10) : 0;
      const matchesMonth = selectedMonths.length === 0 || (mNum > 0 && selectedMonths.includes(mNum));
      return matchesYear && matchesMonth;
    });
  }, [metricasFiltradas, supabaseMetricas, selectedYears, selectedMonths]);

  // Filtrar mapa interno de acordo com selectedYears e selectedMonths do filtro principal
  let filteredMapaInterno = mapaInterno;
  if (mapaInterno.length > 0 && (selectedYears.length > 0 || selectedMonths.length > 0)) {
    filteredMapaInterno = mapaInterno.filter(row => {
      const matchesYear = selectedYears.length === 0 || (row.ano && selectedYears.includes(row.ano));
      const matchesMonth = selectedMonths.length === 0 || (row.mes && selectedMonths.includes(row.mes));
      return matchesYear && matchesMonth;
    });
  }

  // Consolidação de estatísticas
  const totalDoadoresPlenos = filteredMapaInterno.reduce((acc, row) => acc + (row.doadores_plenos || 0), 0);
  const totalCuponsDigitados = filteredMapaInterno.reduce((acc, row) => acc + (row.total_cupons_auto || 0), 0);
  const totalCreditoDoacoes = filteredMapaInterno.reduce((acc, row) => acc + (row.total_credito_auto || 0), 0);

  // --- MONTAGEM DO GRÁFICO YoY (SOBREPOSIÇÃO MÊS A MÊS JAN..DEZ) ---
  const yoyChartResult = useMemo(() => {
    if (!mapaInterno || mapaInterno.length === 0) {
      return { chartData: [], availableYears: [] };
    }

    // Descobrir quais anos participarão do gráfico
    let yearsToInclude: number[] = [];
    if (selectedYears && selectedYears.length > 0) {
      yearsToInclude = [...selectedYears].sort((a, b) => a - b);
      if (yearsToInclude.length === 1) {
        const prevYear = yearsToInclude[0] - 1;
        const hasPrevData = mapaInterno.some(r => r.ano === prevYear);
        if (hasPrevData) {
          yearsToInclude.unshift(prevYear);
        }
      }
    } else {
      const allYears = Array.from(new Set(mapaInterno.map(r => r.ano).filter(Boolean) as number[])).sort((a, b) => a - b);
      yearsToInclude = allYears.slice(-2);
    }

    // Criar a estrutura base de 1 a 12 meses
    const chartData = MONTH_NAMES.map((mesLabel, idx) => {
      const mesNum = idx + 1;
      const dataRow: Record<string, any> = {
        mesNum,
        mesLabel
      };

      yearsToInclude.forEach(ano => {
        const row = mapaInterno.find(r => r.ano === ano && r.mes === mesNum);
        if (row) {
          if (selectedMetric === 'credito') {
            dataRow[`Ano_${ano}`] = row.total_credito_auto || 0;
          } else if (selectedMetric === 'doadores') {
            dataRow[`Ano_${ano}`] = row.doadores_plenos || 0;
          } else if (selectedMetric === 'cupons') {
            dataRow[`Ano_${ano}`] = row.total_cupons_auto || 0;
          } else if (selectedMetric === 'ticket') {
            dataRow[`Ano_${ano}`] = row.ticket_medio_auto || 0;
          }
        } else {
          dataRow[`Ano_${ano}`] = null;
        }
      });

      return dataRow;
    });

    return { chartData, availableYears: yearsToInclude };
  }, [mapaInterno, selectedYears, selectedMetric]);

  const { chartData, availableYears } = yoyChartResult;

  // --- MONTAGEM DO GRÁFICO DE COLUNAS EMPILHADAS POR ANO (BASE DA ABA DESEMPENHO) ---
  const stackedChartResult = useMemo(() => {
    if (availableYears.length === 0) {
      return { stackedData: [], stackKeys: [], colorMap: {} };
    }

    let stackKeys: string[] = [];
    let colorMap: Record<string, string> = {};

    if (selectedMetric === 'doadores') {
      stackKeys = ['Doadores Plenos', 'Doadores Restritos', 'Novos Doadores'];
      colorMap = {
        'Doadores Plenos': '#004A6D',
        'Doadores Restritos': '#00E3E6',
        'Novos Doadores': '#EDCD01'
      };
    } else {
      stackKeys = ['Automatizados', 'Cadastro', 'Doação', 'Consumo'];
      colorMap = {
        'Automatizados': '#004A6D',
        'Cadastro': '#00E3E6',
        'Doação': '#EDCD01',
        'Consumo': '#FD3168'
      };
    }

    const stackedData = availableYears.map(ano => {
      const rowData: Record<string, any> = {
        ano,
        anoLabel: `Ano ${ano}`,
        totalAno: 0
      };

      const yearMetricas = allMetricas.filter(m => m.ano === ano);

      let aut = 0, cad = 0, doa = 0, cons = 0;
      yearMetricas.forEach(m => {
        if (selectedMetric === 'credito') {
          aut += m.creditoAutomatica || 0;
          cad += m.creditoUrnas || 0;
          doa += m.creditoDoacao || 0;
          cons += m.creditoConsumo || 0;
        } else if (selectedMetric === 'cupons') {
          const autoCups = m.doadoresAutomaticosAtivos || Math.round((m.cuponsValidos || 0) * 0.7);
          const doaCups = m.cuponsDoacao || 0;
          const consCups = m.cuponsConsumo || 0;
          const cadCups = Math.max(0, (m.cuponsValidos || 0) - autoCups - doaCups - consCups);
          aut += autoCups;
          cad += cadCups;
          doa += doaCups;
          cons += consCups;
        } else if (selectedMetric === 'doadores') {
          aut += m.doadoresPlenos || 0;
          cad += m.doadoresRestritos || 0;
          doa += m.novosDoadores || 0;
        } else {
          aut += m.ticketMedioAutomatica || 0;
          cad += m.ticketMedioUrnas || 0;
        }
      });

      const totalAno = aut + cad + doa + cons;
      rowData.totalAno = totalAno;

      if (selectedMetric === 'doadores') {
        rowData['raw_Doadores Plenos'] = aut;
        rowData['raw_Doadores Restritos'] = cad;
        rowData['raw_Novos Doadores'] = doa;

        rowData['Doadores Plenos'] = totalAno > 0 ? Number(((aut / totalAno) * 100).toFixed(1)) : 0;
        rowData['Doadores Restritos'] = totalAno > 0 ? Number(((cad / totalAno) * 100).toFixed(1)) : 0;
        rowData['Novos Doadores'] = totalAno > 0 ? Number(((doa / totalAno) * 100).toFixed(1)) : 0;
      } else {
        rowData['raw_Automatizados'] = aut;
        rowData['raw_Cadastro'] = cad;
        rowData['raw_Doação'] = doa;
        rowData['raw_Consumo'] = cons;

        rowData['Automatizados'] = totalAno > 0 ? Number(((aut / totalAno) * 100).toFixed(1)) : 0;
        rowData['Cadastro'] = totalAno > 0 ? Number(((cad / totalAno) * 100).toFixed(1)) : 0;
        rowData['Doação'] = totalAno > 0 ? Number(((doa / totalAno) * 100).toFixed(1)) : 0;
        rowData['Consumo'] = totalAno > 0 ? Number(((cons / totalAno) * 100).toFixed(1)) : 0;
      }

      return rowData;
    });

    return { stackedData, stackKeys, colorMap };
  }, [allMetricas, availableYears, selectedMetric]);

  const { stackedData, stackKeys, colorMap } = stackedChartResult;

  // Formatação de valor no tooltip e eixo Y do gráfico
  const formatYValue = (val: number) => {
    if (val === null || val === undefined) return '-';
    if (selectedMetric === 'credito' || selectedMetric === 'ticket') {
      return formatarMoeda(val);
    }
    return formatarNumero(val);
  };

  const getMetricTitle = () => {
    switch (selectedMetric) {
      case 'credito': return 'Crédito Apurado SEFAZ (R$)';
      case 'doadores': return 'Doadores Plenos (CPF)';
      case 'cupons': return 'Volume de Cupons Digitados';
      case 'ticket': return 'Ticket Médio Automatizado (R$)';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header da Aba Apresentação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-[#BCD3DF]/70 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Presentation className="w-6 h-6 text-[#004A6D]" />
            <h1 className="text-2xl font-black text-[#002A3A] tracking-tight font-['Raleway',sans-serif]">
              Painel de Apresentação
            </h1>
            <BrandBadge highlightText="futuro" prefix="Onde começa o" colorVariant="orange" size="sm" />
          </div>
          <p className="text-xs text-[#004A6D]/80 mt-1">
            Visão comparativa ano a ano (YoY) para apresentações estratégicas e diretoria. Alinhado com o Supabase.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isLoading ? (
            <span className="flex items-center gap-1.5 text-xs font-extrabold text-[#004A6D] bg-[#D9FBFF] px-3 py-1.5 rounded-full border border-[#00E3E6]/60 shadow-2xs animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#004A6D]" />
              Carregando Dados...
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-extrabold text-[#006E24] bg-[#00E04B]/15 px-3 py-1.5 rounded-full border border-[#00E04B]/40 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#006E24]" />
              Base Atualizada (Supabase)
            </span>
          )}
        </div>
      </div>

      {/* Grid de Cards de Apresentação */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          id="kpi-apresentacao-doadores"
          title="Doadores Plenos (CPF)"
          value={formatarNumero(totalDoadoresPlenos)}
          subValue="Consolidado no período"
          icon={Users}
          iconBgColor="bg-[#004A6D]"
          iconColor="text-[#00E3E6]"
          badge={{ text: 'Pessoas Físicas', color: 'bg-[#D9FBFF] text-[#004A6D]' }}
        />

        <KPICard
          id="kpi-apresentacao-cupons"
          title="Volume de Cupons"
          value={formatarNumero(totalCuponsDigitados)}
          subValue="Notas registradas"
          icon={TrendingUp}
          iconBgColor="bg-[#D9FBFF]"
          iconColor="text-[#004A6D]"
          badge={{ text: 'Operação NFP', color: 'bg-[#EDCD01]/30 text-[#002A3A]' }}
        />

        <KPICard
          id="kpi-apresentacao-valor-nf"
          title="Crédito Período SEFAZ"
          value={formatarMoeda(supabaseBenchmarking?.totalCreditoVocacaoPeriodo || 0)}
          subValue="Consolidado Benchmarking"
          icon={Building2}
          iconBgColor="bg-[#EDCD01]/30"
          iconColor="text-[#002A3A]"
          badge={{ text: 'Capital & Estado', color: 'bg-[#00E04B]/20 text-[#006E24]' }}
        />

        <KPICard
          id="kpi-apresentacao-credito"
          title="Crédito Apurado SEFAZ"
          value={formatarMoeda(totalCreditoDoacoes)}
          subValue="Repasses confirmados"
          icon={Award}
          iconBgColor="bg-[#00E04B]/20"
          iconColor="text-[#006E24]"
          badge={{ text: 'Receita NFP', color: 'bg-[#FD3168] text-white' }}
        />
      </div>

      {/* GRÁFICO COMPARATIVO EM LINHAS (SOBREPOSIÇÃO DE ANOS - YOY) */}
      <div ref={chartYoyRef} className="bg-white rounded-2xl p-6 border border-[#BCD3DF]/80 shadow-md space-y-5">
        
        {/* Topo do Gráfico: Título + Seletor de Métrica */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#BCD3DF]/50 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#004A6D] text-[#00E3E6]">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-[#002A3A] tracking-tight">
                  Comparativo Anual Sobreposto (YoY)
                </h2>
                <p className="text-xs text-[#004A6D]/80">
                  {getMetricTitle()} — Comparação mês a mês (Jan a Dez) entre {availableYears.join(' vs ')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Seletores de Métrica */}
            <div className="flex flex-wrap items-center gap-1.5 bg-[#F0F5F8] p-1.5 rounded-xl border border-[#BCD3DF]/60">
              <button
                onClick={() => setSelectedMetric('credito')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedMetric === 'credito'
                    ? 'bg-[#004A6D] text-white shadow-xs'
                    : 'text-[#004A6D] hover:bg-white/60'
                }`}
              >
                Crédito (R$)
              </button>
              <button
                onClick={() => setSelectedMetric('doadores')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedMetric === 'doadores'
                    ? 'bg-[#004A6D] text-white shadow-xs'
                    : 'text-[#004A6D] hover:bg-white/60'
                }`}
              >
                Doadores (CPF)
              </button>
              <button
                onClick={() => setSelectedMetric('cupons')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedMetric === 'cupons'
                    ? 'bg-[#004A6D] text-white shadow-xs'
                    : 'text-[#004A6D] hover:bg-white/60'
                }`}
              >
                Cupons
              </button>
              <button
                onClick={() => setSelectedMetric('ticket')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedMetric === 'ticket'
                    ? 'bg-[#004A6D] text-white shadow-xs'
                    : 'text-[#004A6D] hover:bg-white/60'
                }`}
              >
                Ticket Médio
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowDataLabels(!showDataLabels)}
              title={showDataLabels ? 'Ocultar rótulos de valores no gráfico' : 'Exibir rótulos de valores no gráfico'}
              className={`p-2 rounded-xl border transition-all duration-200 shadow-2xs flex items-center justify-center shrink-0 ${
                showDataLabels
                  ? 'bg-[#004A6D] text-white border-[#004A6D]'
                  : 'bg-white hover:bg-[#D9FBFF] text-[#004A6D] border-[#BCD3DF]'
              }`}
            >
              {showDataLabels ? <Eye className="w-4 h-4 text-[#00E3E6]" /> : <EyeOff className="w-4 h-4 text-[#004A6D]" />}
            </button>
            <CopyChartButton chartRef={chartYoyRef} title="Comparativo_Anual_YoY" />
          </div>
        </div>

        {/* Indicador visual das linhas dos anos e Status Real vs Projetado */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-semibold text-[#002A3A] bg-[#F7FAFC] px-4 py-2.5 rounded-xl border border-[#BCD3DF]/40">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[#004A6D]/70 font-bold uppercase tracking-wider text-[10px]">Anos no gráfico:</span>
            {availableYears.map((ano, idx) => {
              const strokeColor = YEAR_COLORS[ano] || FALLBACK_COLORS[idx % FALLBACK_COLORS.length];
              return (
                <div key={ano} className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-lg border border-[#BCD3DF]/50 shadow-2xs">
                  <span className="w-3.5 h-1 rounded-full" style={{ backgroundColor: strokeColor }} />
                  <span className="font-extrabold text-[#002A3A]">Ano {ano}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-[11px] font-extrabold">
            <span className="inline-flex items-center gap-1 bg-[#00E04B]/15 text-[#006E24] px-2.5 py-1 rounded-md border border-[#00E04B]/30">
              <span className="w-2 h-2 rounded-full bg-[#006E24]" />
              Dados Reais (até Mai/2026)
            </span>
            <span className="inline-flex items-center gap-1 bg-[#EDCD01]/25 text-[#7A5A00] px-2.5 py-1 rounded-md border border-[#EDCD01]/50">
              <span className="w-2 h-2 rounded-full bg-[#EDCD01]" />
              Projetados (Jun/2026+)
            </span>
          </div>
        </div>

        {/* Renderização do Recharts */}
        <div className="h-[380px] w-full pt-2">
          {isLoading ? (
            <div className="h-full w-full flex items-center justify-center gap-2 text-[#004A6D] font-bold">
              <Loader2 className="w-6 h-6 animate-spin text-[#004A6D]" />
              Carregando gráfico comparativo...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 15, right: 30, left: 15, bottom: 15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#BCD3DF" opacity={0.5} />
                <XAxis 
                  dataKey="mesLabel" 
                  tick={{ fill: '#004A6D', fontSize: 12, fontWeight: 700 }}
                  axisLine={{ stroke: '#BCD3DF' }}
                />
                <YAxis 
                  tick={{ fill: '#004A6D', fontSize: 11 }}
                  axisLine={{ stroke: '#BCD3DF' }}
                  tickFormatter={(val) => {
                    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
                    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
                    return val;
                  }}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const labelMonthIdx = MONTH_NAMES.indexOf(String(label));

                      return (
                        <div className="bg-white border border-[#BCD3DF] p-3.5 rounded-xl shadow-lg space-y-2 text-xs min-w-[200px]">
                          <p className="text-[#002A3A] font-extrabold pb-1.5 border-b border-[#BCD3DF]/60 flex items-center justify-between">
                            <span>Mês: <span className="text-[#004A6D]">{label}</span></span>
                          </p>
                          <div className="space-y-1.5">
                            {payload.map((entry: any, index: number) => {
                              const yearNum = parseInt(String(entry.name || '').replace('Ano_', ''), 10);
                              const color = entry.color || entry.stroke || '#004A6D';
                              const isProj = yearNum > 2026 || (yearNum === 2026 && labelMonthIdx >= 5);

                              return (
                                <div key={`item-${index}`} className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-1.5 font-bold" style={{ color }}>
                                    <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-2xs" style={{ backgroundColor: color }} />
                                    <span>Ano {yearNum} {isProj ? '(Projetado)' : ''}:</span>
                                  </div>
                                  <span className="font-black text-[#002A3A]">
                                    {formatYValue(Number(entry.value))}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  formatter={(value) => {
                    const yearNum = String(value).replace('Ano_', '');
                    return <span className="text-xs font-extrabold text-[#002A3A]">Ano {yearNum}</span>;
                  }}
                />
                
                {availableYears.map((ano, idx) => {
                  const strokeColor = YEAR_COLORS[ano] || FALLBACK_COLORS[idx % FALLBACK_COLORS.length];
                  return (
                    <Line
                      key={ano}
                      type="monotone"
                      dataKey={`Ano_${ano}`}
                      name={`Ano_${ano}`}
                      stroke={strokeColor}
                      strokeWidth={3.5}
                      connectNulls={true}
                      dot={(dotProps: any) => {
                        const { cx, cy, payload } = dotProps;
                        if (!cx || !cy) return <React.Fragment key={`dot-${ano}-${payload?.mesNum}`} />;
                        const isProjPoint = ano > 2026 || (ano === 2026 && payload?.mesNum >= 6);
                        if (isProjPoint) {
                          return (
                            <g key={`proj-dot-${ano}-${payload?.mesNum}`}>
                              <circle cx={cx} cy={cy} r={6} fill="#FFF9E6" stroke={strokeColor} strokeWidth={2.5} />
                              <circle cx={cx} cy={cy} r={2} fill={strokeColor} />
                            </g>
                          );
                        }
                        return (
                          <circle key={`dot-${ano}-${payload?.mesNum}`} cx={cx} cy={cy} r={4.5} fill={strokeColor} stroke="#ffffff" strokeWidth={2} />
                        );
                      }}
                      activeDot={{ r: 8, stroke: strokeColor, strokeWidth: 2 }}
                    >
                      {showDataLabels && (
                        <LabelList
                          dataKey={`Ano_${ano}`}
                          position="top"
                          offset={8}
                          formatter={(val: any) => {
                            if (val === null || val === undefined || val === 0) return '';
                            if (selectedMetric === 'credito') {
                              if (val >= 1000000) return `R$${(val / 1000000).toFixed(1)}M`;
                              if (val >= 1000) return `R$${(val / 1000).toFixed(0)}k`;
                              return `R$${val}`;
                            }
                            if (selectedMetric === 'ticket') return `R$${val.toFixed(0)}`;
                            if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
                            return `${val}`;
                          }}
                          style={{ fontSize: 10, fontWeight: 800, fill: strokeColor }}
                        />
                      )}
                    </Line>
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>

      {/* TABELA FIXA SUPORTE ÀS INFORMAÇÕES DO GRÁFICO */}
      <div className="bg-white rounded-2xl border border-[#BCD3DF]/80 shadow-md p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#BCD3DF]/50 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#D9FBFF] text-[#004A6D]">
              <Table className="w-5 h-5 text-[#004A6D]" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#002A3A]">
                Tabela de Suporte — Detalhamento Mensal
              </h3>
              <p className="text-xs text-[#004A6D]/80">
                Dados consolidados mês a mês correspondentes ao gráfico ({getMetricTitle()})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-bold">
            <span className="bg-[#00E04B]/15 text-[#006E24] px-2.5 py-1 rounded-full border border-[#00E04B]/30">
              Até Mai/26 = Base Real
            </span>
            <span className="bg-[#EDCD01]/25 text-[#7A5A00] px-2.5 py-1 rounded-full border border-[#EDCD01]/50">
              Jun/26 em diante = Projetado
            </span>
          </div>
        </div>

        {/* Tabela Scrollável */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-[#002A3A] text-white">
                <th className="py-3 px-3.5 rounded-l-xl font-extrabold uppercase tracking-wider text-[11px] w-32">
                  Ano / Período
                </th>
                {MONTH_NAMES.map((m, mIdx) => (
                  <th key={m} className={`py-3 px-2.5 font-extrabold text-center uppercase text-[11px] ${mIdx >= 5 ? 'bg-[#00384E] text-[#EDCD01]' : ''}`}>
                    {m} {mIdx >= 5 ? '*' : ''}
                  </th>
                ))}
                <th className="py-3 px-3.5 rounded-r-xl font-extrabold text-right uppercase tracking-wider text-[11px] bg-[#004A6D]">
                  {selectedMetric === 'ticket' ? 'Média Ano' : 'Total Ano'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#BCD3DF]/40">
              {availableYears.map((ano, idx) => {
                const strokeColor = YEAR_COLORS[ano] || FALLBACK_COLORS[idx % FALLBACK_COLORS.length];
                
                // Extrair array de valores do mês 1 ao 12 para o ano atual
                const monthlyValues = MONTH_NAMES.map((_, mIdx) => {
                  const monthNum = mIdx + 1;
                  const row = mapaInterno?.find(r => r.ano === ano && r.mes === monthNum);
                  if (!row) return null;
                  if (selectedMetric === 'credito') return row.total_credito_auto || 0;
                  if (selectedMetric === 'doadores') return row.doadores_plenos || 0;
                  if (selectedMetric === 'cupons') return row.total_cupons_auto || 0;
                  if (selectedMetric === 'ticket') return row.ticket_medio_auto || 0;
                  return null;
                });

                // Calcular Total do Ano
                const validValues = monthlyValues.filter(v => v !== null) as number[];
                let yearTotal: number | null = null;
                if (validValues.length > 0) {
                  if (selectedMetric === 'ticket') {
                    yearTotal = validValues.reduce((acc, v) => acc + v, 0) / validValues.length;
                  } else {
                    yearTotal = validValues.reduce((acc, v) => acc + v, 0);
                  }
                }

                return (
                  <tr key={ano} className="hover:bg-[#F7FAFC] transition-colors font-medium text-[#002A3A]">
                    <td className="py-3 px-3.5 font-black flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: strokeColor }} />
                      <span className="text-[#002A3A] font-extrabold text-xs">Ano {ano}</span>
                    </td>
                    {monthlyValues.map((val, mIdx) => {
                      const isProjectedCell = ano > 2026 || (ano === 2026 && mIdx >= 5);

                      return (
                        <td 
                          key={mIdx} 
                          className={`py-3 px-2 text-center font-bold relative ${
                            isProjectedCell ? 'bg-[#FFF9E6]/80 text-[#7A5A00]' : ''
                          }`}
                        >
                          {val !== null ? (
                            <div className="flex flex-col items-center justify-center">
                              <span className={val === 0 ? 'text-[#004A6D]/40' : (isProjectedCell ? 'text-[#7A5A00]' : 'text-[#002A3A]')}>
                                {formatYValue(val)}
                              </span>
                              {isProjectedCell && (
                                <span className="text-[9px] font-extrabold text-[#B36B00] bg-[#EDCD01]/30 px-1 py-0.2 rounded mt-0.5">
                                  Projetado
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[#BCD3DF] font-normal">-</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="py-3 px-3.5 text-right font-black text-[#004A6D] bg-[#F0F5F8]/70">
                      {yearTotal !== null ? formatYValue(yearTotal) : '-'}
                    </td>
                  </tr>
                );
              })}

              {/* Linha de Variação YoY (%) se houver 2 ou mais anos */}
              {availableYears.length >= 2 && (() => {
                const prevYear = availableYears[availableYears.length - 2];
                const currYear = availableYears[availableYears.length - 1];

                const prevValues = MONTH_NAMES.map((_, mIdx) => {
                  const row = mapaInterno?.find(r => r.ano === prevYear && r.mes === mIdx + 1);
                  if (!row) return null;
                  if (selectedMetric === 'credito') return row.total_credito_auto || 0;
                  if (selectedMetric === 'doadores') return row.doadores_plenos || 0;
                  if (selectedMetric === 'cupons') return row.total_cupons_auto || 0;
                  if (selectedMetric === 'ticket') return row.ticket_medio_auto || 0;
                  return null;
                });

                const currValues = MONTH_NAMES.map((_, mIdx) => {
                  const row = mapaInterno?.find(r => r.ano === currYear && r.mes === mIdx + 1);
                  if (!row) return null;
                  if (selectedMetric === 'credito') return row.total_credito_auto || 0;
                  if (selectedMetric === 'doadores') return row.doadores_plenos || 0;
                  if (selectedMetric === 'cupons') return row.total_cupons_auto || 0;
                  if (selectedMetric === 'ticket') return row.ticket_medio_auto || 0;
                  return null;
                });

                // Variação do total geral acumulado
                const validPrev = prevValues.filter(v => v !== null) as number[];
                const validCurr = currValues.filter(v => v !== null) as number[];
                const sumPrev = validPrev.length > 0 ? validPrev.reduce((a, b) => a + b, 0) : 0;
                const sumCurr = validCurr.length > 0 ? validCurr.reduce((a, b) => a + b, 0) : 0;
                const totalYoyPct = sumPrev > 0 ? ((sumCurr - sumPrev) / sumPrev) * 100 : null;

                return (
                  <tr className="bg-[#D9FBFF]/30 font-bold border-t-2 border-[#00E3E6]/40 text-[#004A6D]">
                    <td className="py-3 px-3.5 font-black text-[#004A6D] flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-[#004A6D]" />
                      <span>Variação YoY</span>
                    </td>
                    {MONTH_NAMES.map((_, mIdx) => {
                      const p = prevValues[mIdx];
                      const c = currValues[mIdx];
                      let pct: number | null = null;
                      if (p !== null && c !== null && p > 0) {
                        pct = ((c - p) / p) * 100;
                      }

                      return (
                        <td key={mIdx} className="py-3 px-2.5 text-center font-extrabold text-[11px]">
                          {pct !== null ? (
                            <span className={pct >= 0 ? 'text-[#006E24]' : 'text-[#FD3168]'}>
                              {pct >= 0 ? '+' : ''}{pct.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-[#BCD3DF] font-normal">-</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="py-3 px-3.5 text-right font-black bg-[#D9FBFF]/60">
                      {totalYoyPct !== null ? (
                        <span className={totalYoyPct >= 0 ? 'text-[#006E24]' : 'text-[#FD3168]'}>
                          {totalYoyPct >= 0 ? '+' : ''}{totalYoyPct.toFixed(1)}%
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                );
              })()}
            </tbody>
          </table>
        </div>
      </div>

      {/* GRÁFICO DE COLUNAS EMPILHADAS POR ANO (CONVERSÃO DE PIZZA PARA BARRA COM % DE COMPOSIÇÃO) */}
      <div ref={chartStackedRef} className="bg-white rounded-2xl border border-[#BCD3DF]/80 shadow-md p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#BCD3DF]/50 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#004A6D] text-[#00E3E6]">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#002A3A] tracking-tight">
                Composição do Total por Ano (Colunas Empilhadas)
              </h3>
              <p className="text-xs text-[#004A6D]/80">
                Distribuição percentual e valores absolutos que compõem 100% do total de cada ano ({getMetricTitle()})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-extrabold text-[#004A6D] bg-[#D9FBFF] px-3 py-1.5 rounded-full border border-[#00E3E6]/60 shadow-2xs">
              Composição por Tipo de Operação
            </span>
            <CopyChartButton chartRef={chartStackedRef} title="Composicao_Total_Por_Ano" />
          </div>
        </div>

        {/* Chart Render */}
        <div className="h-[400px] w-full pt-2">
          {isLoading ? (
            <div className="h-full w-full flex items-center justify-center gap-2 text-[#004A6D] font-bold">
              <Loader2 className="w-6 h-6 animate-spin text-[#004A6D]" />
              Carregando composição das colunas...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stackedData} margin={{ top: 20, right: 30, left: 15, bottom: 20 }} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="#BCD3DF" opacity={0.5} />
                <XAxis 
                  dataKey="anoLabel" 
                  tick={{ fill: '#002A3A', fontSize: 13, fontWeight: 800 }}
                  axisLine={{ stroke: '#BCD3DF' }}
                />
                <YAxis 
                  domain={[0, 100]}
                  tick={{ fill: '#004A6D', fontSize: 11 }}
                  axisLine={{ stroke: '#BCD3DF' }}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const row = payload[0]?.payload;
                      const totalAno = row?.totalAno || 0;
                      return (
                        <div className="bg-white border border-[#BCD3DF] p-4 rounded-xl shadow-xl space-y-2 text-xs min-w-[240px]">
                          <div className="pb-1.5 border-b border-[#BCD3DF]/60 flex items-center justify-between">
                            <span className="font-extrabold text-[#002A3A] text-sm">{label}</span>
                            <span className="font-black text-[#004A6D] bg-[#D9FBFF] px-2 py-0.5 rounded">
                              Total: {formatYValue(totalAno)}
                            </span>
                          </div>
                          <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                            {payload.map((entry: any, index: number) => {
                              const keyName = String(entry.name || '');
                              const pctVal = Number(entry.value || 0);
                              const rawVal = Number(row?.[`raw_${keyName}`] || 0);
                              const color = entry.color || colorMap[keyName] || '#004A6D';

                              return (
                                <div key={`stack-${index}`} className="flex items-center justify-between gap-3 text-xs">
                                  <div className="flex items-center gap-1.5 font-bold" style={{ color }}>
                                    <span className="w-2.5 h-2.5 rounded-sm inline-block shrink-0 shadow-2xs" style={{ backgroundColor: color }} />
                                    <span>{keyName}:</span>
                                  </div>
                                  <div className="flex items-center gap-2 font-black text-[#002A3A]">
                                    <span>{formatYValue(rawVal)}</span>
                                    <span className="text-[10px] text-[#004A6D] font-extrabold bg-[#F0F5F8] px-1.5 py-0.5 rounded border border-[#BCD3DF]/40">
                                      {pctVal.toFixed(1)}%
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={40}
                  formatter={(value) => (
                    <span className="text-xs font-bold text-[#002A3A] mr-2">{value}</span>
                  )}
                />
                {stackKeys.map((keyName) => {
                  const isLightBg = keyName === 'Cadastro' || keyName === 'Doação';
                  const textColor = isLightBg ? '#002A3A' : '#ffffff';

                  return (
                    <Bar
                      key={keyName}
                      dataKey={keyName}
                      name={keyName}
                      stackId="a"
                      fill={colorMap[keyName] || '#004A6D'}
                      radius={[2, 2, 0, 0]}
                    >
                      <LabelList
                        dataKey={keyName}
                        position="center"
                        formatter={(val: number) => (val && val >= 5 ? `${val.toFixed(1)}%` : '')}
                        style={{ fill: textColor, fontSize: 11, fontWeight: 900 }}
                      />
                    </Bar>
                  );
                })}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* TABELA FIXA SUPORTE AO GRÁFICO DE COMPOSIÇÃO POR OPERAÇÃO */}
      <div className="bg-white rounded-2xl border border-[#BCD3DF]/80 shadow-md p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#BCD3DF]/50 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#004A6D] text-[#00E3E6]">
              <Table className="w-5 h-5 text-[#00E3E6]" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#002A3A]">
                Tabela de Suporte — Composição por Operação
              </h3>
              <p className="text-xs text-[#004A6D]/80">
                Detalhamento dos valores numéricos e participação de cada modalidade ({getMetricTitle()})
              </p>
            </div>
          </div>

          <span className="text-[11px] font-bold text-[#004A6D] bg-[#F0F5F8] px-3 py-1 rounded-full border border-[#BCD3DF]/50">
            Fonte: Base Desempenho (Consolidado)
          </span>
        </div>

        {/* Tabela Scrollável */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#002A3A] text-white">
                <th className="py-3 px-4 rounded-l-xl font-extrabold uppercase tracking-wider text-[11px] w-32">
                  Ano / Período
                </th>
                {stackKeys.map((keyName) => {
                  const color = colorMap[keyName] || '#004A6D';
                  return (
                    <th key={keyName} className="py-3 px-3.5 font-extrabold text-center uppercase text-[11px]">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full inline-block shadow-2xs" style={{ backgroundColor: color }} />
                        <span>{keyName}</span>
                      </div>
                    </th>
                  );
                })}
                <th className="py-3 px-4 rounded-r-xl font-extrabold text-right uppercase tracking-wider text-[11px] bg-[#004A6D]">
                  Total Acumulado
                </th>
                <th className="py-3 px-3.5 font-extrabold text-center uppercase text-[11px] bg-[#00384E] text-[#00E3E6]">
                  % Aut. Share
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#BCD3DF]/40">
              {stackedData.map((row) => {
                const totalAno = row.totalAno || 0;
                const autPct = Number(row[stackKeys[0]] || 0);

                return (
                  <tr key={row.ano} className="hover:bg-[#F7FAFC] transition-colors font-medium text-[#002A3A]">
                    <td className="py-3.5 px-4 font-extrabold text-xs text-[#002A3A]">
                      Ano {row.ano}
                    </td>
                    {stackKeys.map((keyName) => {
                      const rawVal = Number(row[`raw_${keyName}`] || 0);
                      const pct = Number(row[keyName] || 0);

                      return (
                        <td key={keyName} className="py-3.5 px-3.5 text-center font-bold">
                          <div className="flex flex-col items-center">
                            <span className="text-[#002A3A] font-black">{formatYValue(rawVal)}</span>
                            <span className="text-[10px] text-[#004A6D]/80 font-bold bg-[#F0F5F8] px-1.5 py-0.2 rounded mt-0.5 border border-[#BCD3DF]/40">
                              {pct.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      );
                    })}
                    <td className="py-3.5 px-4 text-right font-black text-[#004A6D] bg-[#F0F5F8]/70 text-xs">
                      {formatYValue(totalAno)}
                    </td>
                    <td className="py-3.5 px-3.5 text-center font-black text-[#006E24] bg-[#00E04B]/10 text-xs">
                      {autPct.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Caixa Informativa */}
      <div className="bg-white border border-[#BCD3DF]/70 rounded-2xl p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-[#D9FBFF] text-[#004A6D] shrink-0">
            <Sparkles className="w-5 h-5 text-[#004A6D]" />
          </div>
          <div>
            <h4 className="text-sm font-black text-[#002A3A]">
              Gráfico e Tabela de Suporte Atualizados
            </h4>
            <p className="text-xs text-[#004A6D]/80">
              As informações da tabela e dos gráficos respondem automaticamente à métrica selecionada e aos filtros aplicados.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};



