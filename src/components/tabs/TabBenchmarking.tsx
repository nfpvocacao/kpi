import React, { useState, useMemo } from 'react';
import { 
  Target, 
  Trophy, 
  Award, 
  Sliders, 
  DollarSign, 
  Users, 
  TrendingUp, 
  HelpCircle, 
  Search, 
  Building, 
  Sparkles,
  CheckCircle2,
  GraduationCap
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
import { RANKING_SEFAZ_ENTIDADES, formatarMoeda, formatarNumero } from '../../data/mockDatabase';

export const TabBenchmarking: React.FC = () => {
  // Simulator State
  const [metaDoadoresPlenos, setMetaDoadoresPlenos] = useState<number>(1500);
  const [retornoMedioNota, setRetornoMedioNota] = useState<number>(3.25);
  const [cuponsMesDoador, setCuponsMesDoador] = useState<number>(18);
  const [novasUrnasEmpresas, setNovasUrnasEmpresas] = useState<number>(25);
  const [cuponsMesPorUrna, setCuponsMesPorUrna] = useState<number>(420);
  const [ticketUrna, setTicketUrna] = useState<number>(1.75);

  // Ranking Explorer Filter
  const [searchEntidade, setSearchEntidade] = useState('');
  const [areaFiltro, setAreaFiltro] = useState<'TODAS' | 'Assistência Social' | 'Saúde'>('TODAS');

  // Simulator Calculations
  const faturamentoMensalDoadores = metaDoadoresPlenos * cuponsMesDoador * retornoMedioNota;
  const faturamentoMensalUrnas = novasUrnasEmpresas * cuponsMesPorUrna * ticketUrna;
  const faturamentoMensalTotalProjetado = faturamentoMensalDoadores + faturamentoMensalUrnas;
  const faturamentoAnualTotalProjetado = faturamentoMensalTotalProjetado * 12;
  
  // Cost to sponsor a young person in Vocação's vocational/professional programs: ~R$ 450/month
  const jovensImpactadosAno = Math.round(faturamentoAnualTotalProjetado / (450 * 12));

  // Ranking filtering
  const entidadesFiltradas = useMemo(() => {
    return RANKING_SEFAZ_ENTIDADES.filter((ent) => {
      const matchName = ent.nomeEntidade.toLowerCase().includes(searchEntidade.toLowerCase()) ||
        ent.municipio.toLowerCase().includes(searchEntidade.toLowerCase());
      const matchArea = areaFiltro === 'TODAS' || ent.areaAtuacao.includes(areaFiltro);
      return matchName && matchArea;
    });
  }, [searchEntidade, areaFiltro]);

  // Chart: Top 10 Entities comparison
  const chartRankingData = useMemo(() => {
    return RANKING_SEFAZ_ENTIDADES.slice(0, 8).map(e => ({
      name: e.nomeEntidade.split('-')[0].trim().slice(0, 16),
      credito: e.creditoSemestre,
      isVocacao: !!e.isVocacao
    }));
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Title & Brand Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#002A3A] tracking-tight font-['Raleway',sans-serif]">
              Benchmarking SEFAZ & Simulador de Prospecção
            </h1>
            <BrandBadge highlightText="futuro" prefix="Onde começa o" colorVariant="orange" size="sm" />
          </div>
          <p className="text-xs text-[#004A6D]/80">
            Posicionamento competitivo da Vocação no ranking oficial da SEFAZ-SP e ferramenta de modelagem de metas de receita.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-[#004A6D] text-white text-xs font-black flex items-center gap-1.5 shadow-2xs">
            <Trophy className="w-4 h-4 text-[#EDCD01]" />
            <span>#6 Capital SP</span>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-[#D9FBFF] text-[#004A6D] text-xs font-black border border-[#00E3E6]/50">
            #14 Estado SP (Social)
          </span>
        </div>
      </div>

      {/* 4 KPIs for Tab 5 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          id="kpi-posicao-capital"
          title="Ranking SEFAZ (Capital SP)"
          value="#6 Lugar Geral"
          subValue="Entre todas as entidades sociais de SP"
          trend={{
            value: "+2 posições",
            isPositive: true,
            label: 'no último semestre'
          }}
          icon={Trophy}
          iconBgColor="bg-[#EDCD01]/30"
          iconColor="text-[#002A3A]"
          badge={{ text: 'Capital São Paulo', color: 'bg-[#004A6D] text-[#00E3E6]' }}
        />

        <KPICard
          id="kpi-posicao-estado"
          title="Ranking Estadual (SP)"
          value="#14 Posição"
          subValue="Área: Assistência Social / Juventude"
          trend={{
            value: "+3 posições",
            isPositive: true,
            label: 'evolução estadual'
          }}
          icon={Award}
          iconBgColor="bg-[#D9FBFF]"
          iconColor="text-[#004A6D]"
          badge={{ text: 'Estado de SP', color: 'bg-[#EDCD01]/30 text-[#002A3A]' }}
        />

        <KPICard
          id="kpi-crescimento-vocacao"
          title="Crescimento Semestral"
          value="+21.8%"
          subValue="Ritmo 2.4x maior que a média das TOP 10"
          trend={{
            value: "21.8%",
            isPositive: true,
            label: 'alta semestral'
          }}
          icon={TrendingUp}
          iconBgColor="bg-[#00E04B]/20"
          iconColor="text-[#006E24]"
          badge={{ text: 'Alta Performance', color: 'bg-[#00E04B]/25 text-[#006E24]' }}
        />

        <KPICard
          id="kpi-potencial-captacao"
          title="Meta Anual de Captação"
          value={formatarMoeda(3200000)}
          subValue="Meta orçamentária 2026 da Vocação"
          icon={Target}
          iconBgColor="bg-[#FD3168]/20"
          iconColor="text-[#FD3168]"
          badge={{ text: 'Planejamento 2026', color: 'bg-[#FD3168] text-white' }}
        />
      </div>

      {/* SIMULADOR DE CAPTAÇÃO E PROSPECÇÃO INTERATIVO */}
      <div className="bg-white border-2 border-[#004A6D] rounded-2xl p-6 shadow-sm space-y-6">
        
        {/* Simulator Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#BCD3DF]">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#004A6D] text-white">
                <Sliders className="w-4 h-4 text-[#00E3E6]" />
              </span>
              <h2 className="text-xl font-black text-[#002A3A] tracking-tight font-['Raleway',sans-serif]">
                Simulador de Captação & Prospecção NFP
              </h2>
            </div>
            <p className="text-xs text-[#004A6D]/80 mt-1">
              Ajuste as variáveis de expansão (doadores plenos, ticket médio e urnas) para simular o faturamento mensal e anual estimado.
            </p>
          </div>

          <button
            onClick={() => {
              setMetaDoadoresPlenos(1500);
              setRetornoMedioNota(3.25);
              setCuponsMesDoador(18);
              setNovasUrnasEmpresas(25);
              setCuponsMesPorUrna(420);
              setTicketUrna(1.75);
            }}
            className="text-xs font-bold text-[#004A6D] hover:underline self-start sm:self-auto cursor-pointer"
          >
            Restaurar Valores Padrão
          </button>
        </div>

        {/* Sliders Grid + Real-time Outcome Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Controls: Left 7 cols */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Control 1: Meta Doadores Plenos */}
            <div className="space-y-1.5 bg-[#F8FCFD] p-3.5 rounded-xl border border-[#BCD3DF]/70">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor="range-doadores-plenos" className="font-bold text-[#002A3A] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#004A6D]" />
                  Meta de Novos Doadores Plenos:
                </label>
                <span className="font-black text-[#004A6D] text-sm bg-white px-2 py-0.5 rounded border border-[#BCD3DF]">
                  {formatarNumero(metaDoadoresPlenos)} pessoas
                </span>
              </div>
              <input
                id="range-doadores-plenos"
                type="range"
                min="100"
                max="10000"
                step="100"
                value={metaDoadoresPlenos}
                onChange={(e) => setMetaDoadoresPlenos(Number(e.target.value))}
                className="w-full h-2 bg-[#BCD3DF] rounded-lg appearance-none cursor-pointer accent-[#004A6D]"
              />
              <div className="flex justify-between text-[10px] text-[#004A6D]/60">
                <span>100 doadores</span>
                <span>5.000 doadores</span>
                <span>10.000 doadores</span>
              </div>
            </div>

            {/* Control 2: Retorno Médio por Nota (R$) */}
            <div className="space-y-1.5 bg-[#F8FCFD] p-3.5 rounded-xl border border-[#BCD3DF]/70">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor="range-retorno-nota" className="font-bold text-[#002A3A] flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-[#00E04B]" />
                  Retorno Médio Estimado por Nota (R$):
                </label>
                <span className="font-black text-[#004A6D] text-sm bg-white px-2 py-0.5 rounded border border-[#BCD3DF]">
                  {formatarMoeda(retornoMedioNota)} / nota
                </span>
              </div>
              <input
                id="range-retorno-nota"
                type="range"
                min="1.50"
                max="6.00"
                step="0.05"
                value={retornoMedioNota}
                onChange={(e) => setRetornoMedioNota(Number(e.target.value))}
                className="w-full h-2 bg-[#BCD3DF] rounded-lg appearance-none cursor-pointer accent-[#004A6D]"
              />
              <div className="flex justify-between text-[10px] text-[#004A6D]/60">
                <span>R$ 1,50 (Mínimo)</span>
                <span>R$ 3,25 (Média Histórica)</span>
                <span>R$ 6,00 (Varejo Alto)</span>
              </div>
            </div>

            {/* Control 3: Cupons por Mês por Doador */}
            <div className="space-y-1.5 bg-[#F8FCFD] p-3.5 rounded-xl border border-[#BCD3DF]/70">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor="range-cupons-mes" className="font-bold text-[#002A3A] flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-[#EDCD01]" />
                  Quantidade Média de Cupons/Mês por Doador:
                </label>
                <span className="font-black text-[#004A6D] text-sm bg-white px-2 py-0.5 rounded border border-[#BCD3DF]">
                  {cuponsMesDoador} cupons/mês
                </span>
              </div>
              <input
                id="range-cupons-mes"
                type="range"
                min="5"
                max="40"
                step="1"
                value={cuponsMesDoador}
                onChange={(e) => setCuponsMesDoador(Number(e.target.value))}
                className="w-full h-2 bg-[#BCD3DF] rounded-lg appearance-none cursor-pointer accent-[#004A6D]"
              />
              <div className="flex justify-between text-[10px] text-[#004A6D]/60">
                <span>5 cupons</span>
                <span>18 cupons (Normal)</span>
                <span>40 cupons (Heavy User)</span>
              </div>
            </div>

            {/* Control 4: Novas Urnas em Empresas Parceiras */}
            <div className="space-y-1.5 bg-[#F8FCFD] p-3.5 rounded-xl border border-[#BCD3DF]/70">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor="range-novas-urnas" className="font-bold text-[#002A3A] flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#FD3168]" />
                  Expansão de Urnas em Empresas Parceiras:
                </label>
                <span className="font-black text-[#004A6D] text-sm bg-white px-2 py-0.5 rounded border border-[#BCD3DF]">
                  {novasUrnasEmpresas} urnas instaladas
                </span>
              </div>
              <input
                id="range-novas-urnas"
                type="range"
                min="0"
                max="100"
                step="5"
                value={novasUrnasEmpresas}
                onChange={(e) => setNovasUrnasEmpresas(Number(e.target.value))}
                className="w-full h-2 bg-[#BCD3DF] rounded-lg appearance-none cursor-pointer accent-[#004A6D]"
              />
              <div className="flex justify-between text-[10px] text-[#004A6D]/60">
                <span>0 urnas</span>
                <span>50 urnas</span>
                <span>100 urnas</span>
              </div>
            </div>

          </div>

          {/* Outcome Projection: Right 5 cols */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#004A6D] via-[#003A56] to-[#002A3A] text-white rounded-2xl p-6 flex flex-col justify-between shadow-md relative overflow-hidden">
            <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 w-40 h-40 bg-[#00E3E6]/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#00E3E6]">
                  Resultado da Projeção
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#EDCD01] text-[#002A3A]">
                  Modelo Preditivo
                </span>
              </div>

              {/* Monthly Revenue */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15">
                <span className="text-xs text-white/80 font-medium block">
                  Faturamento Mensal Estimado
                </span>
                <div className="text-3xl font-black text-[#00E3E6] mt-0.5 font-['Raleway',sans-serif]">
                  {formatarMoeda(faturamentoMensalTotalProjetado)}
                </div>
                <div className="text-[11px] text-white/70 mt-1 flex justify-between">
                  <span>Doadores AUT: {formatarMoeda(faturamentoMensalDoadores)}</span>
                  <span>Urnas: {formatarMoeda(faturamentoMensalUrnas)}</span>
                </div>
              </div>

              {/* Annual Revenue */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15">
                <span className="text-xs text-white/80 font-medium block">
                  Faturamento Anual Projetado (12 meses)
                </span>
                <div className="text-3xl lg:text-4xl font-black text-[#EDCD01] mt-0.5 font-['Raleway',sans-serif]">
                  {formatarMoeda(faturamentoAnualTotalProjetado)}
                </div>
                <p className="text-[11px] text-white/70 mt-1">
                  Volume anual projetado de {(metaDoadoresPlenos * cuponsMesDoador * 12 + novasUrnasEmpresas * cuponsMesPorUrna * 12).toLocaleString('pt-BR')} cupons fiscais.
                </p>
              </div>

              {/* Social Impact Metric */}
              <div className="bg-[#00E04B]/15 border border-[#00E04B]/30 rounded-xl p-3.5 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#00E04B] text-[#002A3A]">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#00E04B] uppercase block">
                    Impacto Social Estimado
                  </span>
                  <p className="text-xs text-white font-medium">
                    Capacidade de custear <strong className="text-[#00E3E6] text-sm">{jovensImpactadosAno} jovens</strong> por 1 ano completo nos programas educacionais e de inserção no mercado da Vocação!
                  </p>
                </div>
              </div>

            </div>

            <div className="mt-4 pt-3 border-t border-white/15 text-[11px] text-white/60 text-center">
              Base de cálculo calibrada com o histórico SEFAZ 2024-2026.
            </div>

          </div>

        </div>

      </div>

      {/* EXPLORADOR DE RANKINGS SEFAZ-SP */}
      <div className="bg-white border border-[#BCD3DF]/60 rounded-2xl p-5 shadow-2xs space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#F0F5F8]">
          <div>
            <h2 className="text-base font-bold text-[#002A3A] flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#EDCD01]" />
              Explorador do Ranking Oficial de Entidades (SEFAZ-SP)
            </h2>
            <p className="text-xs text-[#004A6D]/70">
              Quadro de classificação oficial das entidades beneficentes da área de Assistência Social e Saúde no Estado de SP.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#004A6D]/60 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filtrar entidade..."
                value={searchEntidade}
                onChange={(e) => setSearchEntidade(e.target.value)}
                className="pl-9 pr-3 py-1.5 bg-[#F4F9FA] border border-[#BCD3DF] rounded-xl text-xs font-medium text-[#002A3A] focus:outline-none focus:border-[#004A6D]"
              />
            </div>

            {/* Area Filter */}
            <div className="flex items-center bg-[#F4F9FA] p-1 rounded-xl border border-[#BCD3DF] text-xs">
              <button
                onClick={() => setAreaFiltro('TODAS')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  areaFiltro === 'TODAS' ? 'bg-[#004A6D] text-white' : 'text-[#004A6D]'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setAreaFiltro('Assistência Social')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  areaFiltro === 'Assistência Social' ? 'bg-[#004A6D] text-white' : 'text-[#004A6D]'
                }`}
              >
                Assist. Social
              </button>
            </div>
          </div>
        </div>

        {/* Ranking Visual Comparison Chart */}
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartRankingData} margin={{ top: 10, right: 10, left: 15, bottom: 35 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8F1F5" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 10, fill: '#004A6D' }} 
                angle={-25} 
                textAnchor="end" 
                height={40} 
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#004A6D' }} 
                tickFormatter={(val) => `R$ ${(val / 1000000).toFixed(1)}M`} 
              />
              <Tooltip 
                formatter={(val: any) => [formatarMoeda(Number(val)), 'Créditos Semestre']}
                contentStyle={{ backgroundColor: '#002A3A', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }}
              />
              <Bar dataKey="credito" radius={[4, 4, 0, 0]}>
                {chartRankingData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.isVocacao ? '#00E3E6' : '#004A6D'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Ranking Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F4F9FA] border-b border-[#BCD3DF] text-[#004A6D] font-bold uppercase text-[11px]">
                <th className="py-2.5 px-3 text-center">Posição</th>
                <th className="py-2.5 px-3">Nome da Entidade Beneficente</th>
                <th className="py-2.5 px-3">Área de Atuação</th>
                <th className="py-2.5 px-3">Município</th>
                <th className="py-2.5 px-3 text-right">Crédito Semestre (R$)</th>
                <th className="py-2.5 px-3 text-right">Volume Cupons</th>
                <th className="py-2.5 px-3 text-center">Crescimento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F5F8]">
              {entidadesFiltradas.map((ent) => (
                <tr 
                  key={ent.posicaoGeral} 
                  className={`transition-colors ${
                    ent.isVocacao 
                      ? 'bg-[#00E3E6]/15 font-black border-2 border-[#00E3E6]' 
                      : 'hover:bg-[#F8FCFD]'
                  }`}
                >
                  <td className="py-3 px-3 text-center font-bold">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                      ent.posicaoGeral === 1 ? 'bg-[#EDCD01] text-[#002A3A]' :
                      ent.posicaoGeral === 2 ? 'bg-[#BCD3DF] text-[#002A3A]' :
                      ent.posicaoGeral === 3 ? 'bg-[#E03F2A]/30 text-[#E03F2A]' :
                      ent.isVocacao ? 'bg-[#004A6D] text-white ring-2 ring-[#00E3E6]' :
                      'bg-[#F4F9FA] text-[#004A6D]'
                    }`}>
                      {ent.posicaoGeral}º
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#002A3A]">
                        {ent.nomeEntidade}
                      </span>
                      {ent.isVocacao && (
                        <span className="bg-[#004A6D] text-[#00E3E6] px-2 py-0.5 rounded text-[10px] font-black uppercase">
                          Nossa Instituição
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-[#004A6D]">
                    {ent.areaAtuacao}
                  </td>
                  <td className="py-3 px-3 text-[#004A6D]">
                    {ent.municipio}
                  </td>
                  <td className="py-3 px-3 text-right font-black text-[#004A6D] text-sm">
                    {formatarMoeda(ent.creditoSemestre)}
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-[#002A3A]">
                    {formatarNumero(ent.volumeCupons)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-sm text-[11px] font-extrabold ${
                      ent.crescimentoSemestre >= 15 ? 'bg-[#00E04B]/20 text-[#006E24]' : 'bg-[#D9FBFF] text-[#004A6D]'
                    }`}>
                      +{ent.crescimentoSemestre}%
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
