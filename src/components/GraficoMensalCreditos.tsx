import React, { useRef, useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  LabelList
} from 'recharts';
import { Bot } from 'lucide-react';
import { CopyChartButton } from './CopyChartButton';
import { formatarMoeda } from '../data/mockDatabase';

// Nomes abreviados dos meses
const NOMES_MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

// Dados mensais oficiais extraídos da aba 'Resumo Automatização' da planilha
// Linhas: Plenos, Restritos, Total, Créditos Automatização, Retorno médio por cupom, Retorno médio Aut. (Pleno)
const DADOS_MENSAIS_AUTOMATIZACAO: Record<number, Array<{
  mes: number;
  plenos: number;
  restritos: number;
  total: number;
  creditos: number;
  retornoCupom: number;
  retornoPleno: number;
}>> = {
  2025: [
    { mes: 1, plenos: 725, restritos: 876, total: 1601, creditos: 42266.18, retornoCupom: 12.29, retornoPleno: 58.30 },
    { mes: 2, plenos: 723, restritos: 876, total: 1599, creditos: 42455.09, retornoCupom: 12.91, retornoPleno: 58.72 },
    { mes: 3, plenos: 709, restritos: 893, total: 1602, creditos: 42713.82, retornoCupom: 11.79, retornoPleno: 60.25 },
    { mes: 4, plenos: 718, restritos: 885, total: 1603, creditos: 52390.63, retornoCupom: 14.14, retornoPleno: 72.97 },
    { mes: 5, plenos: 718, restritos: 882, total: 1600, creditos: 50470.29, retornoCupom: 13.11, retornoPleno: 70.29 },
    { mes: 6, plenos: 733, restritos: 867, total: 1600, creditos: 53901.38, retornoCupom: 15.40, retornoPleno: 73.54 },
    { mes: 7, plenos: 743, restritos: 859, total: 1602, creditos: 35479.32, retornoCupom: 6.04, retornoPleno: 47.75 },
    { mes: 8, plenos: 747, restritos: 855, total: 1602, creditos: 41893.14, retornoCupom: 6.40, retornoPleno: 56.08 },
    { mes: 9, plenos: 753, restritos: 849, total: 1602, creditos: 38295.77, retornoCupom: 6.06, retornoPleno: 50.86 },
    { mes: 10, plenos: 885, restritos: 847, total: 1732, creditos: 39297.23, retornoCupom: 5.02, retornoPleno: 44.40 },
    { mes: 11, plenos: 1056, restritos: 847, total: 1903, creditos: 74167.12, retornoCupom: 6.45, retornoPleno: 70.23 },
    { mes: 12, plenos: 1141, restritos: 840, total: 1981, creditos: 122971.66, retornoCupom: 9.75, retornoPleno: 107.78 }
  ],
  2026: [
    { mes: 1, plenos: 1321, restritos: 839, total: 2160, creditos: 64261.30, retornoCupom: 5.54, retornoPleno: 48.65 },
    { mes: 2, plenos: 1322, restritos: 836, total: 2158, creditos: 62894.92, retornoCupom: 6.51, retornoPleno: 47.58 },
    { mes: 3, plenos: 1344, restritos: 836, total: 2180, creditos: 61402.48, retornoCupom: 5.38, retornoPleno: 45.69 },
    { mes: 4, plenos: 1342, restritos: 833, total: 2175, creditos: 71166.30, retornoCupom: 6.61, retornoPleno: 53.03 },
    { mes: 5, plenos: 1400, restritos: 827, total: 2227, creditos: 90418.52, retornoCupom: 7.19, retornoPleno: 64.58 },
    { mes: 6, plenos: 1582, restritos: 820, total: 2402, creditos: 74271.86, retornoCupom: 5.72, retornoPleno: 46.95 },
    { mes: 7, plenos: 1731, restritos: 819, total: 2550, creditos: 69596.23, retornoCupom: 4.97, retornoPleno: 40.21 },
    { mes: 8, plenos: 1988, restritos: 822, total: 2810, creditos: 104328.00, retornoCupom: 4.80, retornoPleno: 52.48 },
    { mes: 9, plenos: 3948, restritos: 827, total: 4775, creditos: 193068.80, retornoCupom: 4.85, retornoPleno: 48.90 },
    { mes: 10, plenos: 4401, restritos: 826, total: 5227, creditos: 207499.64, retornoCupom: 4.52, retornoPleno: 47.15 },
    { mes: 11, plenos: 6331, restritos: 826, total: 7157, creditos: 404614.21, retornoCupom: 5.81, retornoPleno: 63.91 },
    { mes: 12, plenos: 6581, restritos: 826, total: 7407, creditos: 600121.39, retornoCupom: 8.29, retornoPleno: 91.19 }
  ],
  2027: [
    { mes: 1, plenos: 6731, restritos: 826, total: 7557, creditos: 238685.46, retornoCupom: 4.43, retornoPleno: 35.46 },
    { mes: 2, plenos: 6881, restritos: 826, total: 7707, creditos: 266650.17, retornoCupom: 5.54, retornoPleno: 38.75 },
    { mes: 3, plenos: 7031, restritos: 826, total: 7857, creditos: 238331.69, retornoCupom: 4.84, retornoPleno: 33.90 },
    { mes: 4, plenos: 8381, restritos: 826, total: 9207, creditos: 348830.49, retornoCupom: 5.95, retornoPleno: 41.62 },
    { mes: 5, plenos: 8531, restritos: 826, total: 9357, creditos: 392674.72, retornoCupom: 5.75, retornoPleno: 46.03 },
    { mes: 6, plenos: 8681, restritos: 826, total: 9507, creditos: 312626.05, retornoCupom: 5.14, retornoPleno: 36.01 },
    { mes: 7, plenos: 8831, restritos: 826, total: 9657, creditos: 276591.69, retornoCupom: 4.47, retornoPleno: 31.32 },
    { mes: 8, plenos: 10181, restritos: 826, total: 11007, creditos: 351855.36, retornoCupom: 4.32, retornoPleno: 34.56 },
    { mes: 9, plenos: 10331, restritos: 826, total: 11157, creditos: 360758.52, retornoCupom: 4.37, retornoPleno: 34.92 },
    { mes: 10, plenos: 10481, restritos: 826, total: 11307, creditos: 341093.66, retornoCupom: 4.07, retornoPleno: 32.54 },
    { mes: 11, plenos: 10631, restritos: 826, total: 11457, creditos: 494128.88, retornoCupom: 4.65, retornoPleno: 46.48 },
    { mes: 12, plenos: 10781, restritos: 826, total: 11607, creditos: 804370.41, retornoCupom: 7.46, retornoPleno: 74.61 }
  ]
};

export const GraficoMensalCreditos: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [anoSelecionado, setAnoSelecionado] = useState<number>(2026);

  // Formatar em milhares compacto (ex: 64k)
  const formatarK = (val: number | null | undefined) => {
    if (!val || val === 0) return '0k';
    const mil = val / 1000;
    return `${mil.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}k`;
  };

  const dadosMes = useMemo(() => {
    const raw = DADOS_MENSAIS_AUTOMATIZACAO[anoSelecionado] || [];
    return raw.map(d => ({
      ...d,
      mesLabel: NOMES_MESES[d.mes - 1],
      labelCredito: `R$ ${formatarK(d.creditos)}`,
    }));
  }, [anoSelecionado]);

  // Custom Label com Pill Badge acima da linha para NUNCA colidir com o traço
  const renderCustomLabel = (props: any) => {
    const { x, y, value } = props;
    if (!value) return null;
    return (
      <g transform={`translate(${x},${y - 18})`}>
        {/* Fundo pill badge para garantir 100% de legibilidade */}
        <rect 
          x={-28} 
          y={-14} 
          width={56} 
          height={18} 
          rx={5} 
          fill="#FFFFFF" 
          stroke="#00829B" 
          strokeWidth={1.25}
          filter="drop-shadow(0px 1px 2px rgba(0, 42, 58, 0.12))"
        />
        <text 
          x={0} 
          y={-1.5} 
          textAnchor="middle" 
          fill="#003E5C" 
          fontSize={10} 
          fontWeight={800}
        >
          {value}
        </text>
      </g>
    );
  };

  // Custom Tooltip formatado institucional
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const d = payload[0].payload;
    return (
      <div className="bg-[#002A3A]/95 text-white p-4 rounded-xl shadow-2xl border border-[#00829B]/30 text-xs backdrop-blur-md min-w-[240px]">
        <p className="font-bold text-[#00E3E6] border-b border-white/10 pb-1.5 mb-2.5 text-sm flex justify-between">
          <span>{label} / {anoSelecionado}</span>
          <span className="text-[11px] text-white/70">Automatização</span>
        </p>
        <div className="space-y-1.5">
          <div className="flex justify-between gap-4">
            <span className="text-[#BCD3DF]">Créditos Automatização:</span>
            <span className="font-bold text-[#00E3E6]">{formatarMoeda(d.creditos)}</span>
          </div>
          <div className="flex justify-between gap-4 border-t border-white/10 pt-1">
            <span className="text-[#BCD3DF]">Total Automatizados:</span>
            <span className="font-bold">{d.total.toLocaleString('pt-BR')}</span>
          </div>
          <div className="flex justify-between text-[11px] text-white/70 pl-3">
            <span>Plenos:</span>
            <span className="text-white font-semibold">{d.plenos.toLocaleString('pt-BR')}</span>
          </div>
          <div className="flex justify-between text-[11px] text-white/70 pl-3">
            <span>Restritos:</span>
            <span className="text-white font-semibold">{d.restritos.toLocaleString('pt-BR')}</span>
          </div>
          <div className="flex justify-between gap-4 border-t border-white/10 pt-1">
            <span className="text-[#BCD3DF]">Retorno Médio / Cupom:</span>
            <span className="font-bold text-[#1E7E50]">R$ {d.retornoCupom.toFixed(2)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-[#BCD3DF]">Retorno Médio / Pleno:</span>
            <span className="font-bold text-[#00E3E6]">R$ {d.retornoPleno.toFixed(2)}</span>
          </div>
        </div>
      </div>
    );
  };

  // Largura da coluna de identificador dos KPIs
  const COL_LABEL_WIDTH = '72px';

  return (
    <div className="bg-white rounded-2xl border border-[#BCD3DF]/60 shadow-xs p-6 mb-8 transition-all hover:shadow-md">
      {/* Header com Controles (FORA da captura de imagem) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#BCD3DF]/40 mb-4">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-[#D9FBFF] text-[#003E5C] rounded-xl">
            <Bot className="w-5 h-5 text-[#003E5C]" />
          </span>
          <span className="text-sm font-semibold text-[#003E5C]">Painel Mensal de Automatização</span>
        </div>

        {/* Seletor do Ano (2025, 2026, 2027) + Botão Copiar */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex bg-[#F4F9FC] p-1 rounded-xl border border-[#BCD3DF]">
            {[2025, 2026, 2027].map(ano => (
              <button
                key={ano}
                type="button"
                onClick={() => setAnoSelecionado(ano)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  anoSelecionado === ano
                    ? 'bg-white text-[#003E5C] shadow-2xs border border-[#BCD3DF]'
                    : 'text-[#003E5C]/60 hover:text-[#003E5C]'
                }`}
              >
                Ano {ano}
              </button>
            ))}
          </div>

          <CopyChartButton 
            chartRef={chartRef} 
            title={`evolucao_mensal_automatizacao_${anoSelecionado}`} 
          />
        </div>
      </div>

      {/* ÁREA CAPTURADA PELO BOTÃO COPIAR (chartRef) */}
      <div ref={chartRef} className="p-4 bg-white rounded-2xl">
        {/* Título integrado na imagem copiada */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-[#002A3A]">
            Evolução Mensal: Créditos Canal Automatização ({anoSelecionado})
          </h3>
        </div>

        {/* CONTAINER DO GRÁFICO: COM PADDING-LEFT EXATO PARA COMBINAR COM A TABELA */}
        <div className="w-full" style={{ paddingLeft: COL_LABEL_WIDTH }}>
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dadosMes}
                margin={{ top: 35, right: 32, left: 32, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                
                {/* Eixo X com padding zero pois a margem externa de 32px já dá o respiro exato */}
                <XAxis 
                  dataKey="mesLabel" 
                  stroke="#003E5C" 
                  fontSize={12} 
                  fontWeight={700}
                  tickLine={false}
                  padding={{ left: 0, right: 0 }}
                />

                {/* Eixo Y OCULTO com domínio estendido para garantir folga aos badges */}
                <YAxis 
                  hide={true}
                  domain={['dataMin - 15000', 'dataMax * 1.18']}
                />

                <Tooltip content={<CustomTooltip />} />

                {/* Curva Oficial: Créditos Automatização (Teal Institucional #00829B) */}
                <Line 
                  type="monotone" 
                  dataKey="creditos" 
                  name="Créditos Automatização" 
                  stroke="#00829B" 
                  strokeWidth={3.5}
                  dot={{ r: 5.5, fill: '#00829B', stroke: '#FFFFFF', strokeWidth: 2 }}
                  activeDot={{ r: 8 }}
                >
                  <LabelList 
                    dataKey="labelCredito" 
                    content={renderCustomLabel}
                  />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TABELA FIXA ALINHADA 1:1 DE PONTA A PONTA COM AS COLUNAS DO GRÁFICO */}
        <div className="mt-3 border border-[#BCD3DF]/70 rounded-xl overflow-hidden shadow-2xs">
          <div className="w-full">
            {/* Header da Tabela com os Meses (Jan, Fev, Mar...) */}
            <div className="flex items-center bg-[#002A3A] text-white font-bold py-2 text-xs border-b border-white/20">
              <div 
                className="font-extrabold uppercase text-[10px] tracking-wider text-[#00E3E6] text-center shrink-0 border-r border-white/20"
                style={{ width: COL_LABEL_WIDTH }}
              >
                KPI
              </div>

              <div className="flex-1 grid grid-cols-12 text-center" style={{ paddingLeft: '32px', paddingRight: '32px' }}>
                {dadosMes.map(d => (
                  <div key={d.mes} className="font-extrabold text-[11px]">
                    {d.mesLabel}
                  </div>
                ))}
              </div>
            </div>

            {/* Linha 1: Plenos */}
            <div className="flex items-center py-2 text-xs border-b border-[#BCD3DF]/40 hover:bg-[#F4F9FC]/60 transition-colors bg-white font-semibold">
              <div 
                className="text-center shrink-0 text-[#003E5C] text-[10px] font-black border-r border-[#BCD3DF]/60 bg-white"
                style={{ width: COL_LABEL_WIDTH }}
                title="Automatizados Plenos"
              >
                Plenos
              </div>
              <div className="flex-1 grid grid-cols-12 text-center" style={{ paddingLeft: '32px', paddingRight: '32px' }}>
                {dadosMes.map(d => (
                  <div key={d.mes} className="text-[#003E5C] text-[11px] font-medium">
                    {d.plenos.toLocaleString('pt-BR')}
                  </div>
                ))}
              </div>
            </div>

            {/* Linha 2: Restritos */}
            <div className="flex items-center py-2 text-xs border-b border-[#BCD3DF]/40 hover:bg-[#F4F9FC]/60 transition-colors bg-[#F8FAFC] font-semibold">
              <div 
                className="text-center shrink-0 text-[#003E5C]/80 text-[10px] font-black border-r border-[#BCD3DF]/60 bg-[#F8FAFC]"
                style={{ width: COL_LABEL_WIDTH }}
                title="Automatizados Restritos"
              >
                Restritos
              </div>
              <div className="flex-1 grid grid-cols-12 text-center" style={{ paddingLeft: '32px', paddingRight: '32px' }}>
                {dadosMes.map(d => (
                  <div key={d.mes} className="text-[#003E5C]/80 text-[11px] font-medium">
                    {d.restritos.toLocaleString('pt-BR')}
                  </div>
                ))}
              </div>
            </div>

            {/* Linha 3: Total */}
            <div className="flex items-center py-2 text-xs border-b border-[#BCD3DF]/40 hover:bg-[#F4F9FC]/60 transition-colors bg-white font-bold">
              <div 
                className="text-center shrink-0 text-[#002A3A] text-[10px] font-black border-r border-[#BCD3DF]/60 bg-white"
                style={{ width: COL_LABEL_WIDTH }}
                title="Total de Automatizados"
              >
                Total
              </div>
              <div className="flex-1 grid grid-cols-12 text-center" style={{ paddingLeft: '32px', paddingRight: '32px' }}>
                {dadosMes.map(d => (
                  <div key={d.mes} className="text-[#002A3A] text-[11px] font-bold">
                    {d.total.toLocaleString('pt-BR')}
                  </div>
                ))}
              </div>
            </div>

            {/* Linha 4: P/Cupom */}
            <div className="flex items-center py-2 text-xs border-b border-[#BCD3DF]/40 hover:bg-[#F4F9FC]/60 transition-colors bg-white font-semibold">
              <div 
                className="text-center shrink-0 text-[#1E7E50] text-[10px] font-black border-r border-[#BCD3DF]/60 bg-white"
                style={{ width: COL_LABEL_WIDTH }}
                title="Retorno médio por cupom"
              >
                P/Cupom
              </div>
              <div className="flex-1 grid grid-cols-12 text-center" style={{ paddingLeft: '32px', paddingRight: '32px' }}>
                {dadosMes.map(d => (
                  <div key={d.mes} className="text-[#1E7E50] text-[10px] font-bold">
                    {d.retornoCupom.toFixed(2)}
                  </div>
                ))}
              </div>
            </div>

            {/* Linha 5: P/Pleno */}
            <div className="flex items-center py-2 text-xs hover:bg-[#F4F9FC]/60 transition-colors bg-[#F8FAFC] font-bold">
              <div 
                className="text-center shrink-0 text-[#003E5C] text-[10px] font-black border-r border-[#BCD3DF]/60 bg-[#F8FAFC]"
                style={{ width: COL_LABEL_WIDTH }}
                title="Retorno médio Aut. (Pleno)"
              >
                P/Pleno
              </div>
              <div className="flex-1 grid grid-cols-12 text-center" style={{ paddingLeft: '32px', paddingRight: '32px' }}>
                {dadosMes.map(d => (
                  <div key={d.mes} className="text-[#003E5C] text-[10px] font-extrabold">
                    {d.retornoPleno.toFixed(2)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
