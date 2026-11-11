import React, { useRef, useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  LabelList
} from 'recharts';
import { TrendingUp, Loader2 } from 'lucide-react';
import { CopyChartButton } from './CopyChartButton';
import { useSupabaseProjecaoTrienal } from '../hooks/useSupabaseProjecaoTrienal';
import { formatarMoeda } from '../data/mockDatabase';

export const GraficoTrienalComparativo: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const containerSvgRef = useRef<HTMLDivElement>(null);
  const { data: projecoes, loading } = useSupabaseProjecaoTrienal();
  const [modoVisao, setModoVisao] = useState<'anual' | 'mensal2026'>('anual');

  // Coordenadas calculadas no DOM para os colchetes e tendências
  const [coordsBarras, setCoordsBarras] = useState<{ x: number; yTop: number }[]>([]);

  // Formatador em milhares (k)
  const formatarK = (val: number | null | undefined) => {
    if (!val || val === 0) return '0k';
    const mil = val / 1000;
    return `${mil.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}k`;
  };

  // Preparar dados do Consolidado Anual (2025, 2026, 2027)
  const dadosAnual = [2025, 2026, 2027].map(ano => {
    const row = projecoes.find(p => p.ano === ano && p.tipo_registro === 'consolidado_anual');
    const recCad = Number(row?.receita_cadastro || 0);
    const recAut = Number(row?.receita_automatizacao || 0);
    const recTot = Number(row?.receita_total || (recCad + recAut) || 1);
    
    // Custos e Resultados
    // Para 2025: Custo = 1.569.600,00 e Resultado = 2.074.391,83
    let desp = Number(row?.despesa_total || 0);
    let res = Number(row?.resultado_liquido || 0);
    if (ano === 2025) {
      desp = 1569600;
      res = 2074391.83;
    }

    const pctCad = (recCad / recTot) * 100;
    const pctAut = (recAut / recTot) * 100;

    const alturaCusto = (desp / recTot) * 100;
    const alturaResultado = (res / recTot) * 100;

    return {
      periodo: `${ano}`,
      ano,
      receitaCadastroReal: recCad,
      receitaAutomatizacaoReal: recAut,
      receitaTotalReal: recTot,
      despesasReal: desp,
      resultadoReal: res,
      alturaReceitaAutomatizacao: pctAut,
      alturaReceitaCadastro: pctCad,
      alturaCusto,
      alturaResultado,
      pctAutomatizacaoReal: pctAut,
      pctCadastroReal: pctCad,
      // Labels formatados exatamente conforme solicitado
      labelAutInside: `${formatarK(recAut)} (${pctAut.toFixed(1)}%)`,
      labelCadInside: `${formatarK(recCad)} (${pctCad.toFixed(1)}%)`,
      labelTotTop: formatarK(recTot),
      labelCustoInside: formatarK(desp),
      labelResInside: formatarK(res),
    };
  });

  // Preparar dados mensais de 2026
  const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const dadosMensais2026 = projecoes
    .filter(p => p.ano === 2026 && p.tipo_registro === 'mensal')
    .sort((a, b) => (a.mes || 0) - (b.mes || 0))
    .map(p => {
      const recCad = Number(p.receita_cadastro || 0);
      const recAut = Number(p.receita_automatizacao || 0);
      const recTot = Number(p.receita_total || (recCad + recAut) || 1);
      const desp = Number(p.despesa_total || 0);
      const res = Number(p.resultado_liquido || 0);

      const pctCad = (recCad / recTot) * 100;
      const pctAut = (recAut / recTot) * 100;
      const alturaCusto = (desp / recTot) * 100;
      const alturaResultado = (res / recTot) * 100;

      return {
        periodo: MONTH_NAMES[(p.mes || 1) - 1],
        receitaCadastroReal: recCad,
        receitaAutomatizacaoReal: recAut,
        receitaTotalReal: recTot,
        despesasReal: desp,
        resultadoReal: res,
        alturaReceitaAutomatizacao: pctAut,
        alturaReceitaCadastro: pctCad,
        alturaCusto,
        alturaResultado,
        pctAutomatizacaoReal: pctAut,
        pctCadastroReal: pctCad,
        labelAutInside: `${formatarK(recAut)} (${pctAut.toFixed(1)}%)`,
        labelCadInside: `${formatarK(recCad)} (${pctCad.toFixed(1)}%)`,
        labelTotTop: formatarK(recTot),
        labelCustoInside: formatarK(desp),
        labelResInside: formatarK(res),
      };
    });

  const chartData = modoVisao === 'anual' ? dadosAnual : dadosMensais2026;

  // Atualizar coordenadas físicas reais dos retângulos para o colchete de crescimento YoY no topo
  useEffect(() => {
    const updatePositions = () => {
      if (!containerSvgRef.current) return;
      
      const containerRect = containerSvgRef.current.getBoundingClientRect();
      const svg = containerSvgRef.current.querySelector('svg.recharts-surface');
      if (!svg) return;

      const barGroups = svg.querySelectorAll('.recharts-bar-rectangles');
      if (!barGroups || barGroups.length < 2) return;

      // Pegar os retângulos da fatia superior de receita (Cadastro / topo de 100%)
      const topBarRects = barGroups[1]?.querySelectorAll('path.recharts-rectangle');
      if (!topBarRects || topBarRects.length === 0) return;

      const coords: { x: number; yTop: number }[] = [];

      topBarRects.forEach((rectPath) => {
        const bRect = rectPath.getBoundingClientRect();
        const xCenter = (bRect.left - containerRect.left) + bRect.width / 2;
        const yTop = bRect.top - containerRect.top;
        coords.push({ x: xCenter, yTop });
      });

      if (coords.length > 0) {
        setCoordsBarras(coords);
      }
    };

    const timer = setTimeout(updatePositions, 350);
    window.addEventListener('resize', updatePositions);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePositions);
    };
  }, [chartData, modoVisao, loading]);

  // Custom Tooltip formatado institucional
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const d = payload[0].payload;
    return (
      <div className="bg-[#002A3A]/95 text-white p-4 rounded-xl shadow-2xl border border-[#00829B]/30 text-xs backdrop-blur-md min-w-[230px]">
        <p className="font-bold text-[#00E3E6] border-b border-white/10 pb-1.5 mb-2.5 text-sm flex justify-between items-center">
          <span>{label}</span>
          <span className="text-[10px] text-white/70 font-normal">Base 100% Receita</span>
        </p>
        <div className="space-y-1.5">
          <div className="flex justify-between gap-4">
            <span className="text-[#BCD3DF] flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#00829B] inline-block" />
              Automatizados:
            </span>
            <span className="font-bold text-[#00E3E6]">
              {formatarMoeda(d.receitaAutomatizacaoReal)}{' '}
              <span className="text-white text-[11px]">({d.pctAutomatizacaoReal.toFixed(1)}%)</span>
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-[#BCD3DF] flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#003E5C] inline-block border border-white/20" />
              Cadastro:
            </span>
            <span className="font-bold">
              {formatarMoeda(d.receitaCadastroReal)}{' '}
              <span className="text-[#BCD3DF] text-[11px]">({d.pctCadastroReal.toFixed(1)}%)</span>
            </span>
          </div>
          <div className="flex justify-between gap-4 font-bold border-t border-white/10 pt-1 text-white">
            <span>Receita Total (100%):</span>
            <span>{formatarMoeda(d.receitaTotalReal)}</span>
          </div>
          <div className="flex justify-between gap-4 text-[#C53A3A] border-t border-white/10 pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#C53A3A] inline-block" />
              Custo Captação:
            </span>
            <span className="font-bold">
              {formatarMoeda(d.despesasReal)}{' '}
              <span className="text-white/80 text-[10px]">({d.alturaCusto.toFixed(1)}%)</span>
            </span>
          </div>
          <div className="flex justify-between gap-4 text-[#1E7E50] font-bold border-t border-white/10 pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#1E7E50] inline-block" />
              Resultado Líquido:
            </span>
            <span>
              {formatarMoeda(d.resultadoReal)}{' '}
              <span className="text-white/80 text-[10px]">({d.alturaResultado.toFixed(1)}%)</span>
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-[#BCD3DF]/60 shadow-xs p-6 mb-8 transition-all hover:shadow-md">
      {/* Barra de Controles Superiores (FORA da captura de cópia) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#BCD3DF]/40 mb-4">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-[#D9FBFF] text-[#003E5C] rounded-xl">
            <TrendingUp className="w-5 h-5 text-[#003E5C]" />
          </span>
          <span className="text-sm font-semibold text-[#003E5C]">Painel Executivo Trienal</span>
        </div>

        {/* Seletor de Modo + Botão Copiar Gráfico */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex bg-[#F4F9FC] p-1 rounded-xl border border-[#BCD3DF]">
            <button
              type="button"
              onClick={() => setModoVisao('anual')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                modoVisao === 'anual'
                  ? 'bg-white text-[#003E5C] shadow-2xs border border-[#BCD3DF]'
                  : 'text-[#003E5C]/60 hover:text-[#003E5C]'
              }`}
            >
              Anual (2025–2027)
            </button>
            <button
              type="button"
              onClick={() => setModoVisao('mensal2026')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                modoVisao === 'mensal2026'
                  ? 'bg-white text-[#003E5C] shadow-2xs border border-[#BCD3DF]'
                  : 'text-[#003E5C]/60 hover:text-[#003E5C]'
              }`}
            >
              Mensal 2026
            </button>
          </div>

          <CopyChartButton 
            chartRef={chartRef} 
            title={modoVisao === 'anual' ? 'evolucao_anual_proposta' : 'evolucao_mensal_2026_proposta'} 
          />
        </div>
      </div>

      {/* ÁREA CAPTURADA PELO BOTÃO COPIAR (chartRef) */}
      <div ref={chartRef} className="p-4 bg-white rounded-2xl relative">
        {/* Título do Gráfico na Imagem Copiada */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-[#002A3A]">
            Evolução Anual & Projeção {modoVisao === 'anual' ? '(2025–2027)' : '2026'}
          </h3>
        </div>

        {/* Legenda Institucional Sóbria (incluída na imagem) */}
        <div className="flex flex-wrap items-center justify-center gap-4 pb-4 px-2 select-none text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-xs bg-[#00829B] shrink-0" />
            <span className="text-[#002A3A]">Receita Automatizados</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-xs bg-[#003E5C] shrink-0" />
            <span className="text-[#002A3A]">Receita Cadastro</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-xs bg-[#C53A3A] shrink-0" />
            <span className="text-[#002A3A]">Custo Captação</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-xs bg-[#1E7E50] shrink-0" />
            <span className="text-[#002A3A]">Resultado Líquido</span>
          </div>
        </div>

        {loading ? (
          <div className="h-[440px] flex flex-col items-center justify-center gap-3 text-[#003E5C]/60">
            <Loader2 className="w-8 h-8 animate-spin text-[#00829B]" />
            <p className="text-sm font-semibold">Carregando dados da projeção...</p>
          </div>
        ) : (
          <>
            <div ref={containerSvgRef} className="h-[440px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 75, right: 30, left: 10, bottom: 20 }}
                  barGap={2}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  
                  {/* Eixo X com os anos */}
                  <XAxis 
                    dataKey="periodo" 
                    stroke="#003E5C" 
                    fontSize={13} 
                    fontWeight={700}
                    tickLine={false}
                  />

                  {/* Eixo Y Oculto (hide={true}) com domínio estendido para folga no topo */}
                  <YAxis 
                    hide={true}
                    domain={[0, 130]}
                  />

                  <Tooltip content={<CustomTooltip />} />

                  {/* 1. Coluna de Receita: AUTOMATIZADOS NA BASE (Teal Institucional #00829B) */}
                  <Bar 
                    dataKey="alturaReceitaAutomatizacao" 
                    name="Receita Automatizados" 
                    stackId="receita" 
                    fill="#00829B" 
                    radius={[0, 0, 4, 4]} 
                    barSize={100}
                  >
                    <LabelList 
                      dataKey="labelAutInside" 
                      position="center" 
                      fill="#FFFFFF" 
                      fontSize={11} 
                      fontWeight={800}
                    />
                  </Bar>

                  {/* 2. Coluna de Receita: CADASTRO NO TOPO (Azul Profundo #003E5C) */}
                  <Bar 
                    dataKey="alturaReceitaCadastro" 
                    name="Receita Cadastro" 
                    stackId="receita" 
                    fill="#003E5C" 
                    radius={[6, 6, 0, 0]} 
                    barSize={100}
                  >
                    {/* Dado Dentro da Faixa */}
                    <LabelList 
                      dataKey="labelCadInside" 
                      position="center" 
                      fill="#FFFFFF" 
                      fontSize={11} 
                      fontWeight={800}
                    />
                    {/* Total No Topo da Faixa */}
                    <LabelList 
                      dataKey="labelTotTop" 
                      position="top" 
                      fill="#002A3A" 
                      fontSize={12} 
                      fontWeight={900}
                      offset={6}
                    />
                  </Bar>

                  {/* 3. Coluna de Custo de Captação (Terracota Nobre #C53A3A) - DADO DENTRO */}
                  <Bar 
                    dataKey="alturaCusto" 
                    name="Custo Captação" 
                    fill="#C53A3A" 
                    radius={[6, 6, 0, 0]} 
                    barSize={100}
                  >
                    <LabelList 
                      dataKey="labelCustoInside" 
                      position="center" 
                      fill="#FFFFFF" 
                      fontSize={11} 
                      fontWeight={800}
                    />
                  </Bar>

                  {/* 4. Coluna de Resultado Líquido (Verde Institucional #1E7E50) - DADO DENTRO */}
                  <Bar 
                    dataKey="alturaResultado" 
                    name="Resultado Líquido" 
                    fill="#1E7E50" 
                    radius={[6, 6, 0, 0]} 
                    barSize={100}
                  >
                    <LabelList 
                      dataKey="labelResInside" 
                      position="center" 
                      fill="#FFFFFF" 
                      fontSize={11} 
                      fontWeight={800}
                    />
                  </Bar>
                </ComposedChart>
              </ResponsiveContainer>

              {/* COLCHETES DE CRESCIMENTO NO TOPO DAS COLUNAS DE RECEITA (COM MAIS ESPAÇO) */}
              {modoVisao === 'anual' && coordsBarras.length >= 3 && (
                <svg className="absolute inset-0 pointer-events-none w-full h-full z-10">
                  {/* Colchete 1: 2025 -> 2026 (+33.8%) */}
                  {(() => {
                    const x1 = coordsBarras[0].x;
                    const x2 = coordsBarras[1].x;
                    const y = coordsBarras[0].yTop - 42; // Linha bem elevada, acima do rótulo total
                    const xMid = (x1 + x2) / 2;
                    return (
                      <g>
                        {/* Linha do colchete com ganchos nas pontas */}
                        <path 
                          d={`M ${x1} ${y + 10} L ${x1} ${y} L ${x2} ${y} L ${x2} ${y + 10}`} 
                          fill="none" 
                          stroke="#003E5C" 
                          strokeWidth={1.75} 
                        />
                        {/* Pill badge de crescimento */}
                        <rect 
                          x={xMid - 28} 
                          y={y - 12} 
                          width={56} 
                          height={20} 
                          rx={10} 
                          fill="#D9FBFF" 
                          stroke="#00829B" 
                          strokeWidth={1.25} 
                        />
                        <text 
                          x={xMid} 
                          y={y + 2} 
                          textAnchor="middle" 
                          fill="#003E5C" 
                          fontSize={11} 
                          fontWeight={800}
                        >
                          +33,8%
                        </text>
                      </g>
                    );
                  })()}

                  {/* Colchete 2: 2026 -> 2027 (+44.7%) */}
                  {(() => {
                    const x1 = coordsBarras[1].x;
                    const x2 = coordsBarras[2].x;
                    const y = coordsBarras[1].yTop - 42;
                    const xMid = (x1 + x2) / 2;
                    return (
                      <g>
                        <path 
                          d={`M ${x1} ${y + 10} L ${x1} ${y} L ${x2} ${y} L ${x2} ${y + 10}`} 
                          fill="none" 
                          stroke="#003E5C" 
                          strokeWidth={1.75} 
                        />
                        <rect 
                          x={xMid - 28} 
                          y={y - 12} 
                          width={56} 
                          height={20} 
                          rx={10} 
                          fill="#D9FBFF" 
                          stroke="#00829B" 
                          strokeWidth={1.25} 
                        />
                        <text 
                          x={xMid} 
                          y={y + 2} 
                          textAnchor="middle" 
                          fill="#003E5C" 
                          fontSize={11} 
                          fontWeight={800}
                        >
                          +44,7%
                        </text>
                      </g>
                    );
                  })()}
                </svg>
              )}
            </div>

            {/* Cards Inferiores com Valores Reais em R$ e % */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5 pt-4 border-t border-[#BCD3DF]/30">
              {dadosAnual.map(anoData => (
                <div key={anoData.ano} className="bg-[#F8FAFC] p-4 rounded-xl border border-[#BCD3DF]/50 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#BCD3DF]/30">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#003E5C] text-white">
                      Ano {anoData.ano}
                    </span>
                    <span className="text-xs font-bold text-[#1E7E50]">
                      Margem: {anoData.receitaTotalReal > 0 ? ((anoData.resultadoReal / anoData.receitaTotalReal) * 100).toFixed(1) : 0}%
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#003E5C]/80">Receita Automatizados:</span>
                      <span className="font-bold text-[#00829B]">
                        {formatarMoeda(anoData.receitaAutomatizacaoReal)}{' '}
                        <span className="text-[11px] text-[#003E5C]">({anoData.pctAutomatizacaoReal.toFixed(1)}%)</span>
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-[#003E5C]/80">Receita Cadastro:</span>
                      <span className="font-bold text-[#003E5C]">
                        {formatarMoeda(anoData.receitaCadastroReal)}{' '}
                        <span className="text-[11px] text-[#00829B]">({anoData.pctCadastroReal.toFixed(1)}%)</span>
                      </span>
                    </div>

                    <div className="flex justify-between font-extrabold text-[#002A3A] border-t border-gray-200 pt-1">
                      <span>Receita Total (100%):</span>
                      <span>{formatarMoeda(anoData.receitaTotalReal)}</span>
                    </div>

                    <div className="flex justify-between text-[#C53A3A]">
                      <span>Custos Totais:</span>
                      <span className="font-bold">{formatarMoeda(anoData.despesasReal)}</span>
                    </div>

                    <div className="flex justify-between text-[#1E7E50] font-extrabold border-t border-gray-200 pt-1">
                      <span>Resultado Líquido:</span>
                      <span>{formatarMoeda(anoData.resultadoReal)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
