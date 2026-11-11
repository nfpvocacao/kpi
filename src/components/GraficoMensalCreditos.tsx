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
import { LineChart as LineChartIcon } from 'lucide-react';
import { CopyChartButton } from './CopyChartButton';
import { formatarMoeda } from '../data/mockDatabase';

// Dados mensais consolidados extraídos da planilha oficial (Resumo Cadastro e Resumo Automatização)
const DADOS_MENSAIS_PROJECAO: Record<number, Array<{
  mes: number;
  creditoCadastro: number;
  cuponsCadastro: number;
  retornoCupomCadastro: number;
  creditoAutomatizado: number;
  cuponsAutomatizado: number;
  retornoCupomAutomatizado: number;
}>> = {
  2025: [
    { mes: 1, creditoCadastro: 221638.62, cuponsCadastro: 229277, retornoCupomCadastro: 0.97, creditoAutomatizado: 42266.18, cuponsAutomatizado: 3439, retornoCupomAutomatizado: 12.29 },
    { mes: 2, creditoCadastro: 237975.87, cuponsCadastro: 222258, retornoCupomCadastro: 1.07, creditoAutomatizado: 42455.09, cuponsAutomatizado: 3289, retornoCupomAutomatizado: 12.91 },
    { mes: 3, creditoCadastro: 263948.77, cuponsCadastro: 212714, retornoCupomCadastro: 1.24, creditoAutomatizado: 42713.82, cuponsAutomatizado: 3623, retornoCupomAutomatizado: 11.79 },
    { mes: 4, creditoCadastro: 253832.29, cuponsCadastro: 232723, retornoCupomCadastro: 1.09, creditoAutomatizado: 52390.63, cuponsAutomatizado: 3704, retornoCupomAutomatizado: 14.14 },
    { mes: 5, creditoCadastro: 284203.75, cuponsCadastro: 267083, retornoCupomCadastro: 1.06, creditoAutomatizado: 50470.29, cuponsAutomatizado: 3851, retornoCupomAutomatizado: 13.11 },
    { mes: 6, creditoCadastro: 245634.55, cuponsCadastro: 233787, retornoCupomCadastro: 1.05, creditoAutomatizado: 53901.38, cuponsAutomatizado: 3500, retornoCupomAutomatizado: 15.40 },
    { mes: 7, creditoCadastro: 232876.24, cuponsCadastro: 231253, retornoCupomCadastro: 1.01, creditoAutomatizado: 35479.32, cuponsAutomatizado: 5870, retornoCupomAutomatizado: 6.04 },
    { mes: 8, creditoCadastro: 245022.39, cuponsCadastro: 232008, retornoCupomCadastro: 1.06, creditoAutomatizado: 41893.14, cuponsAutomatizado: 6550, retornoCupomAutomatizado: 6.40 },
    { mes: 9, creditoCadastro: 208308.85, cuponsCadastro: 196434, retornoCupomCadastro: 1.06, creditoAutomatizado: 38295.77, cuponsAutomatizado: 6321, retornoCupomAutomatizado: 6.06 },
    { mes: 10, creditoCadastro: 224710.21, cuponsCadastro: 199649, retornoCupomCadastro: 1.13, creditoAutomatizado: 39297.23, cuponsAutomatizado: 7828, retornoCupomAutomatizado: 5.02 },
    { mes: 11, creditoCadastro: 254065.84, cuponsCadastro: 213521, retornoCupomCadastro: 1.19, creditoAutomatizado: 74167.12, cuponsAutomatizado: 11497, retornoCupomAutomatizado: 6.45 },
    { mes: 12, creditoCadastro: 271929.89, cuponsCadastro: 226488, retornoCupomCadastro: 1.20, creditoAutomatizado: 122971.66, cuponsAutomatizado: 12608, retornoCupomAutomatizado: 9.75 }
  ],
  2026: [
    { mes: 1, creditoCadastro: 210908.66, cuponsCadastro: 207470, retornoCupomCadastro: 1.02, creditoAutomatizado: 64261.30, cuponsAutomatizado: 11598, retornoCupomAutomatizado: 5.54 },
    { mes: 2, creditoCadastro: 207314.06, cuponsCadastro: 186607, retornoCupomCadastro: 1.11, creditoAutomatizado: 62894.92, cuponsAutomatizado: 9657, retornoCupomAutomatizado: 6.51 },
    { mes: 3, creditoCadastro: 242405.25, cuponsCadastro: 218083, retornoCupomCadastro: 1.11, creditoAutomatizado: 61402.48, cuponsAutomatizado: 11412, retornoCupomAutomatizado: 5.38 },
    { mes: 4, creditoCadastro: 230333.27, cuponsCadastro: 203867, retornoCupomCadastro: 1.13, creditoAutomatizado: 71166.30, cuponsAutomatizado: 10772, retornoCupomAutomatizado: 6.61 },
    { mes: 5, creditoCadastro: 261288.13, cuponsCadastro: 219498, retornoCupomCadastro: 1.19, creditoAutomatizado: 90418.52, cuponsAutomatizado: 12572, retornoCupomAutomatizado: 7.19 },
    { mes: 6, creditoCadastro: 240595.23, cuponsCadastro: 202701, retornoCupomCadastro: 1.19, creditoAutomatizado: 74271.86, cuponsAutomatizado: 12993, retornoCupomAutomatizado: 5.72 },
    { mes: 7, creditoCadastro: 250630.10, cuponsCadastro: 214173, retornoCupomCadastro: 1.17, creditoAutomatizado: 69596.23, cuponsAutomatizado: 13999, retornoCupomAutomatizado: 4.97 },
    { mes: 8, creditoCadastro: 231415.34, cuponsCadastro: 206842, retornoCupomCadastro: 1.12, creditoAutomatizado: 104328.00, cuponsAutomatizado: 21735, retornoCupomAutomatizado: 4.80 },
    { mes: 9, creditoCadastro: 196740.59, cuponsCadastro: 175128, retornoCupomCadastro: 1.12, creditoAutomatizado: 193068.80, cuponsAutomatizado: 39808, retornoCupomAutomatizado: 4.85 },
    { mes: 10, creditoCadastro: 212231.15, cuponsCadastro: 177994, retornoCupomCadastro: 1.19, creditoAutomatizado: 207499.64, cuponsAutomatizado: 45907, retornoCupomAutomatizado: 4.52 },
    { mes: 11, creditoCadastro: 239956.47, cuponsCadastro: 190361, retornoCupomCadastro: 1.26, creditoAutomatizado: 404614.21, cuponsAutomatizado: 69641, retornoCupomAutomatizado: 5.81 },
    { mes: 12, creditoCadastro: 256828.55, cuponsCadastro: 201923, retornoCupomCadastro: 1.27, creditoAutomatizado: 600121.39, cuponsAutomatizado: 72391, retornoCupomAutomatizado: 8.29 }
  ],
  2027: [
    { mes: 1, creditoCadastro: 199196.10, cuponsCadastro: 184967, retornoCupomCadastro: 1.08, creditoAutomatizado: 238685.46, cuponsAutomatizado: 53848, retornoCupomAutomatizado: 4.43 },
    { mes: 2, creditoCadastro: 195801.14, cuponsCadastro: 166367, retornoCupomCadastro: 1.18, creditoAutomatizado: 266650.17, cuponsAutomatizado: 48167, retornoCupomAutomatizado: 5.54 },
    { mes: 3, creditoCadastro: 228943.54, cuponsCadastro: 194429, retornoCupomCadastro: 1.18, creditoAutomatizado: 238331.69, cuponsAutomatizado: 49217, retornoCupomAutomatizado: 4.84 },
    { mes: 4, creditoCadastro: 217541.90, cuponsCadastro: 181755, retornoCupomCadastro: 1.20, creditoAutomatizado: 348830.49, cuponsAutomatizado: 58667, retornoCupomAutomatizado: 5.95 },
    { mes: 5, creditoCadastro: 246777.71, cuponsCadastro: 195691, retornoCupomCadastro: 1.26, creditoAutomatizado: 392674.72, cuponsAutomatizado: 68248, retornoCupomAutomatizado: 5.75 },
    { mes: 6, creditoCadastro: 227233.93, cuponsCadastro: 180715, retornoCupomCadastro: 1.26, creditoAutomatizado: 312626.05, cuponsAutomatizado: 60767, retornoCupomAutomatizado: 5.14 },
    { mes: 7, creditoCadastro: 236711.61, cuponsCadastro: 190943, retornoCupomCadastro: 1.24, creditoAutomatizado: 276591.69, cuponsAutomatizado: 61817, retornoCupomAutomatizado: 4.47 },
    { mes: 8, creditoCadastro: 218564.17, cuponsCadastro: 184405, retornoCupomCadastro: 1.19, creditoAutomatizado: 351855.36, cuponsAutomatizado: 81448, retornoCupomAutomatizado: 4.32 },
    { mes: 9, creditoCadastro: 185815.10, cuponsCadastro: 156134, retornoCupomCadastro: 1.19, creditoAutomatizado: 360758.52, cuponsAutomatizado: 82648, retornoCupomAutomatizado: 4.37 },
    { mes: 10, creditoCadastro: 200445.27, cuponsCadastro: 168430, retornoCupomCadastro: 1.19, creditoAutomatizado: 341093.66, cuponsAutomatizado: 83848, retornoCupomAutomatizado: 4.07 },
    { mes: 11, creditoCadastro: 226631.05, cuponsCadastro: 180550, retornoCupomCadastro: 1.06, creditoAutomatizado: 494128.88, cuponsAutomatizado: 106310, retornoCupomAutomatizado: 4.65 },
    { mes: 12, creditoCadastro: 242566.05, cuponsCadastro: 191540, retornoCupomCadastro: 1.27, creditoAutomatizado: 804370.41, cuponsAutomatizado: 107810, retornoCupomAutomatizado: 7.46 }
  ]
};

export const GraficoMensalCreditos: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [anoSelecionado, setAnoSelecionado] = useState<number>(2026);

  // Formatar em milhares compacto (ex: 211k)
  const formatarK = (val: number | null | undefined) => {
    if (!val || val === 0) return '0k';
    const mil = val / 1000;
    return `${mil.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}k`;
  };

  const dadosMes = useMemo(() => {
    const raw = DADOS_MENSAIS_PROJECAO[anoSelecionado] || [];
    return raw.map(d => ({
      ...d,
      mesLabel: `${String(d.mes).padStart(2, '0')}`,
      labelCad: `R$ ${formatarK(d.creditoCadastro)}`,
      labelAut: `R$ ${formatarK(d.creditoAutomatizado)}`,
    }));
  }, [anoSelecionado]);

  // Custom Tooltip formatado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const d = payload[0].payload;
    return (
      <div className="bg-[#002A3A]/95 text-white p-4 rounded-xl shadow-2xl border border-[#00E3E6]/30 text-xs backdrop-blur-md min-w-[240px]">
        <p className="font-bold text-[#00E3E6] border-b border-white/10 pb-1.5 mb-2.5 text-sm flex justify-between">
          <span>Mês {label} / {anoSelecionado}</span>
          <span className="text-[11px] text-white/70">Créditos SEFAZ</span>
        </p>
        <div className="space-y-1.5">
          <div className="flex justify-between gap-4">
            <span className="text-[#BCD3DF] flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#004A6D] inline-block border border-white/30" />
              Cad:
            </span>
            <span className="font-bold">{formatarMoeda(d.creditoCadastro)}</span>
          </div>
          <div className="flex justify-between text-[11px] text-white/70 pl-4">
            <span>P/Cad:</span>
            <span className="font-semibold text-white">R$ {d.retornoCupomCadastro.toFixed(2)}</span>
          </div>

          <div className="flex justify-between gap-4 border-t border-white/10 pt-1.5">
            <span className="text-[#BCD3DF] flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00E3E6] inline-block" />
              Autom:
            </span>
            <span className="font-bold text-[#00E3E6]">{formatarMoeda(d.creditoAutomatizado)}</span>
          </div>
          <div className="flex justify-between text-[11px] text-white/70 pl-4">
            <span>P/Autom:</span>
            <span className="font-semibold text-[#00E3E6]">R$ {d.retornoCupomAutomatizado.toFixed(2)}</span>
          </div>
        </div>
      </div>
    );
  };

  // Largura da coluna de identificador (Cad, Autom, etc.)
  const COL_LABEL_WIDTH = '64px';

  return (
    <div className="bg-white rounded-2xl border border-[#BCD3DF]/60 shadow-xs p-6 mb-8 transition-all hover:shadow-md">
      {/* Header com Seletor de Ano e Botão Copiar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#BCD3DF]/40 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-[#D9FBFF] text-[#004A6D] rounded-xl">
              <LineChartIcon className="w-5 h-5 text-[#004A6D]" />
            </span>
            <h3 className="text-lg font-bold text-[#002A3A]">
              Evolução Mensal de Créditos: Cad x Autom ({anoSelecionado})
            </h3>
          </div>
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
                    ? 'bg-white text-[#004A6D] shadow-2xs border border-[#BCD3DF]'
                    : 'text-[#004A6D]/60 hover:text-[#004A6D]'
                }`}
              >
                Ano {ano}
              </button>
            ))}
          </div>

          <CopyChartButton 
            chartRef={chartRef} 
            title={`evolucao_mensal_creditos_${anoSelecionado}`} 
          />
        </div>
      </div>

      {/* Conteúdo Capturável para Copiar/Exportar */}
      <div ref={chartRef} className="p-4 bg-white rounded-2xl">
        {/* CONTAINER DO GRÁFICO: COM PADDING-LEFT EXATO PARA COMBINAR COM A TABELA */}
        <div className="w-full" style={{ paddingLeft: COL_LABEL_WIDTH }}>
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dadosMes}
                margin={{ top: 25, right: 0, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                
                {/* Eixo X com padding zero para que as ticks fiquem uniformemente espaçadas de ponta a ponta */}
                <XAxis 
                  dataKey="mesLabel" 
                  stroke="#004A6D" 
                  fontSize={12} 
                  fontWeight={700}
                  tickLine={false}
                  padding={{ left: 20, right: 20 }}
                />

                {/* Eixo Y OCULTO conforme solicitado */}
                <YAxis 
                  hide={true}
                  domain={['dataMin - 20000', 'dataMax + 40000']}
                />

                <Tooltip content={<CustomTooltip />} />

                {/* Linha 1: Crédito Cadastro (Azul Marinho) */}
                <Line 
                  type="monotone" 
                  dataKey="creditoCadastro" 
                  name="Cad" 
                  stroke="#004A6D" 
                  strokeWidth={3.5}
                  dot={{ r: 5, fill: '#004A6D', stroke: '#ffffff', strokeWidth: 2 }}
                  activeDot={{ r: 8 }}
                >
                  <LabelList 
                    dataKey="labelCad" 
                    position="top" 
                    fill="#004A6D" 
                    fontSize={10} 
                    fontWeight={700} 
                    offset={8}
                  />
                </Line>

                {/* Linha 2: Créditos Automatizados (Ciano Neon) */}
                <Line 
                  type="monotone" 
                  dataKey="creditoAutomatizado" 
                  name="Autom" 
                  stroke="#00E3E6" 
                  strokeWidth={4}
                  dot={{ r: 6, fill: '#00E3E6', stroke: '#004A6D', strokeWidth: 2.5 }}
                  activeDot={{ r: 8 }}
                >
                  <LabelList 
                    dataKey="labelAut" 
                    position="bottom" 
                    fill="#008E91" 
                    fontSize={10} 
                    fontWeight={800} 
                    offset={8}
                  />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TABELA FIXA ALINHADA 1:1 DE PONTA A PONTA COM AS COLUNAS DO GRÁFICO */}
        <div className="mt-2 border border-[#BCD3DF]/70 rounded-xl overflow-hidden shadow-2xs">
          <div className="w-full">
            {/* Header da Tabela */}
            <div className="flex items-center bg-[#002A3A] text-white font-bold py-2 text-xs border-b border-white/20">
              {/* Coluna KPI com largura fixa idêntica ao offset do gráfico */}
              <div 
                className="font-extrabold uppercase text-[10px] tracking-wider text-[#00E3E6] text-center shrink-0 border-r border-white/20"
                style={{ width: COL_LABEL_WIDTH }}
              >
                KPI
              </div>

              {/* 12 Colunas de Meses com padding interno de 20px idêntico ao XAxis */}
              <div className="flex-1 grid grid-cols-12 text-center px-5">
                {dadosMes.map(d => (
                  <div key={d.mes} className="font-extrabold text-[11px]">
                    {d.mesLabel}
                  </div>
                ))}
              </div>
            </div>

            {/* Linha 1: Cad */}
            <div className="flex items-center py-2 text-xs border-b border-[#BCD3DF]/40 hover:bg-[#F4F9FC]/60 transition-colors bg-white font-bold">
              <div 
                className="text-center shrink-0 text-[#004A6D] text-[11px] font-black border-r border-[#BCD3DF]/60 bg-white"
                style={{ width: COL_LABEL_WIDTH }}
                title="Crédito Cadastro"
              >
                Cad
              </div>
              <div className="flex-1 grid grid-cols-12 text-center px-5">
                {dadosMes.map(d => (
                  <div key={d.mes} className="text-[#004A6D] text-[11px] font-bold">
                    {formatarK(d.creditoCadastro)}
                  </div>
                ))}
              </div>
            </div>

            {/* Linha 2: Autom */}
            <div className="flex items-center py-2 text-xs border-b border-[#BCD3DF]/40 hover:bg-[#F4F9FC]/60 transition-colors bg-[#F8FAFC] font-bold">
              <div 
                className="text-center shrink-0 text-[#00A3A6] text-[11px] font-black border-r border-[#BCD3DF]/60 bg-[#F8FAFC]"
                style={{ width: COL_LABEL_WIDTH }}
                title="Crédito Automatizados"
              >
                Autom
              </div>
              <div className="flex-1 grid grid-cols-12 text-center px-5">
                {dadosMes.map(d => (
                  <div key={d.mes} className="text-[#00A3A6] text-[11px] font-bold">
                    {formatarK(d.creditoAutomatizado)}
                  </div>
                ))}
              </div>
            </div>

            {/* Linha 3: P/Cad */}
            <div className="flex items-center py-2 text-xs border-b border-[#BCD3DF]/40 hover:bg-[#F4F9FC]/60 transition-colors bg-white font-medium">
              <div 
                className="text-center shrink-0 text-[#002A3A] text-[10px] font-black border-r border-[#BCD3DF]/60 bg-white"
                style={{ width: COL_LABEL_WIDTH }}
                title="Valor por Cupom Cadastro"
              >
                P/Cad
              </div>
              <div className="flex-1 grid grid-cols-12 text-center px-5">
                {dadosMes.map(d => (
                  <div key={d.mes} className="text-[#002A3A] text-[10px] font-semibold">
                    {d.retornoCupomCadastro.toFixed(2)}
                  </div>
                ))}
              </div>
            </div>

            {/* Linha 4: P/Autom */}
            <div className="flex items-center py-2 text-xs hover:bg-[#F4F9FC]/60 transition-colors bg-[#F8FAFC] font-bold">
              <div 
                className="text-center shrink-0 text-[#006E24] text-[10px] font-black border-r border-[#BCD3DF]/60 bg-[#F8FAFC]"
                style={{ width: COL_LABEL_WIDTH }}
                title="Valor por Cupom Automatizado"
              >
                P/Autom
              </div>
              <div className="flex-1 grid grid-cols-12 text-center px-5">
                {dadosMes.map(d => (
                  <div key={d.mes} className="text-[#006E24] text-[10px] font-bold">
                    {d.retornoCupomAutomatizado.toFixed(2)}
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
