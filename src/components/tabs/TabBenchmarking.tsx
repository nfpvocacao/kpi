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
  Loader2,
  AlertCircle,
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
import { useSupabaseBenchmarking, EntidadeBenchmarking } from '../../hooks/useSupabaseBenchmarking';

interface TabBenchmarkingProps {
  selectedYears?: number[];
  selectedMonths?: number[];
}

export const TabBenchmarking: React.FC<TabBenchmarkingProps> = ({
  selectedYears = [2025],
  selectedMonths = [12]
}) => {
  const { data: supabaseBenchmarking, entities, isLoading } = useSupabaseBenchmarking(selectedYears, selectedMonths);

  // Simulator State (Exclusivo Doadores Plenos - PF / Doação Automática CPF)
  const [metaDoadoresPlenos, setMetaDoadoresPlenos] = useState<number>(1500);
  const [retornoMedioNota, setRetornoMedioNota] = useState<number>(3.25);
  const [cuponsMesDoador, setCuponsMesDoador] = useState<number>(18);

  // Ranking Explorer Filters (Interactive section)
  const [metricType, setMetricType] = useState<'CREDITO' | 'VOLUME'>('CREDITO');
  const [modalidadeFilter, setModalidadeFilter] = useState<'TODAS' | 'CONSUMO_PROPRIO' | 'CADASTRO_ENTIDADE' | 'CADASTRO_CONSUMIDOR' | 'DOACAO_AUTOMATICA'>('DOACAO_AUTOMATICA');
  const [topNCount, setTopNCount] = useState<number>(10);
  const [searchEntidade, setSearchEntidade] = useState('');
  const [areaFiltro, setAreaFiltro] = useState<'TODAS' | 'Assistência Social' | 'Saúde'>('TODAS');

  // Fallback entity list
  const baseEntities = useMemo(() => {
    if (entities && entities.length > 0) return entities;
    return RANKING_SEFAZ_ENTIDADES.map((e: any, idx) => ({
      cnpj: e.id || String(idx),
      nomeEntidade: e.nomeEntidade,
      municipio: e.municipio,
      areaAtuacao: e.areaAtuacao,
      isVocacao: !!e.isVocacao,
      credConsumoProprio: e.creditoSemestre * 0.25,
      credCadastroEntidade: e.creditoSemestre * 0.35,
      credCadastroConsumidor: e.creditoSemestre * 0.20,
      credDoacaoAutomatica: e.creditoSemestre * 0.20,
      credTotal: e.creditoSemestre,
      volConsumoProprio: Math.round(e.volumeCupons * 0.25),
      volCadastroEntidade: Math.round(e.volumeCupons * 0.35),
      volCadastroConsumidor: Math.round(e.volumeCupons * 0.20),
      volDoacaoAutomatica: Math.round(e.volumeCupons * 0.20),
      volTotal: e.volumeCupons,
    }));
  }, [entities]);

  // Extract metric value per entity for the Explorer
  const getValue = (ent: EntidadeBenchmarking) => {
    if (metricType === 'CREDITO') {
      switch (modalidadeFilter) {
        case 'CONSUMO_PROPRIO': return ent.credConsumoProprio;
        case 'CADASTRO_ENTIDADE': return ent.credCadastroEntidade;
        case 'CADASTRO_CONSUMIDOR': return ent.credCadastroConsumidor;
        case 'DOACAO_AUTOMATICA': return ent.credDoacaoAutomatica;
        default: return ent.credTotal;
      }
    } else {
      switch (modalidadeFilter) {
        case 'CONSUMO_PROPRIO': return ent.volConsumoProprio;
        case 'CADASTRO_ENTIDADE': return ent.volCadastroEntidade;
        case 'CADASTRO_CONSUMIDOR': return ent.volCadastroConsumidor;
        case 'DOACAO_AUTOMATICA': return ent.volDoacaoAutomatica;
        default: return ent.volTotal;
      }
    }
  };

  // Process ranking dynamically for the Explorer
  const processedRanking = useMemo(() => {
    const list = baseEntities.map(ent => ({
      ...ent,
      valorCalculado: getValue(ent)
    }));

    // Sort descending by calculated value
    list.sort((a, b) => b.valorCalculado - a.valorCalculado);

    let capitalCount = 0;
    let socialCount = 0;

    return list.map((ent, idx) => {
      const munNorm = (ent.municipio || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u06ff]/g, "");
      const isCapital = munNorm.includes('sao paulo') || munNorm.includes('sp');
      const areaNorm = (ent.areaAtuacao || '').toLowerCase();
      const isSocial = areaNorm.includes('assistência social') || areaNorm.includes('social');

      if (isCapital) capitalCount++;
      if (isSocial) socialCount++;

      return {
        ...ent,
        posicaoGeral: idx + 1,
        posicaoCapital: isCapital ? capitalCount : null,
        posicaoSocial: isSocial ? socialCount : null
      };
    });
  }, [baseEntities, metricType, modalidadeFilter]);

  // Find Vocação for the active Explorer filter
  const vocacaoExplorerEntity = useMemo(() => {
    const found = processedRanking.find(e => e.isVocacao);
    if (found) return found;

    return {
      cnpj: '61750246000175',
      nomeEntidade: 'AÇÃO COMUNITÁRIA DO BRASIL VOCAÇÃO',
      municipio: 'São Paulo',
      areaAtuacao: 'Assistência Social',
      isVocacao: true,
      credConsumoProprio: 0,
      credCadastroEntidade: 0,
      credCadastroConsumidor: 0,
      credDoacaoAutomatica: 0,
      credTotal: 0,
      volConsumoProprio: 0,
      volCadastroEntidade: 0,
      volCadastroConsumidor: 0,
      volDoacaoAutomatica: 0,
      volTotal: 0,
      valorCalculado: 0,
      posicaoGeral: processedRanking.length + 1,
      posicaoCapital: 1,
      posicaoSocial: 1
    };
  }, [processedRanking]);

  // Filter entities by search and area in Explorer
  const entidadesFiltradas = useMemo(() => {
    return processedRanking.filter((ent) => {
      const matchName = ent.nomeEntidade.toLowerCase().includes(searchEntidade.toLowerCase()) ||
        ent.municipio.toLowerCase().includes(searchEntidade.toLowerCase()) ||
        ent.cnpj.includes(searchEntidade);
      const matchArea = areaFiltro === 'TODAS' || ent.areaAtuacao.includes(areaFiltro);
      return matchName && matchArea;
    });
  }, [processedRanking, searchEntidade, areaFiltro]);

  // Chart Data: Top N entities. If Vocação is NOT in Top N, append it at end.
  const chartRankingData = useMemo(() => {
    const topSlice = entidadesFiltradas.slice(0, Math.max(1, topNCount));
    const inTop = topSlice.some(e => e.isVocacao);

    let list = [...topSlice];
    if (!inTop && vocacaoExplorerEntity) {
      list.push(vocacaoExplorerEntity);
    }

    return list.map(e => {
      let displayName = e.nomeEntidade;
      if (e.isVocacao) {
        displayName = 'VOCAÇÃO';
      } else if (displayName.startsWith('ENTIDADE CNPJ:')) {
        displayName = `CNPJ ${e.cnpj.slice(0, 6)}...`;
      } else {
        displayName = displayName.split('-')[0].trim().slice(0, 15);
      }

      return {
        name: displayName,
        fullName: e.isVocacao ? 'AÇÃO COMUNITÁRIA DO BRASIL VOCAÇÃO' : e.nomeEntidade,
        valor: e.valorCalculado,
        isVocacao: !!e.isVocacao,
        posicaoGeral: e.posicaoGeral
      };
    });
  }, [entidadesFiltradas, topNCount, vocacaoExplorerEntity]);

  // Table Data: Vocação ALWAYS Row 1 (Pinned reference row), followed by complete Top N list
  const tableData = useMemo(() => {
    const topSlice = entidadesFiltradas.slice(0, Math.max(1, topNCount));
    return [vocacaoExplorerEntity, ...topSlice];
  }, [entidadesFiltradas, topNCount, vocacaoExplorerEntity]);

  // Simulator Calculations (Doadores Plenos PF - Doação Automática via CPF)
  const faturamentoMensalTotalProjetado = metaDoadoresPlenos * cuponsMesDoador * retornoMedioNota;
  const faturamentoAnualTotalProjetado = faturamentoMensalTotalProjetado * 12;
  const jovensImpactadosAno = Math.round(faturamentoAnualTotalProjetado / (450 * 12));

  // Top Macro KPIs based on TOTAL CREDITS in the period (Independent of local explorer filters)
  const hasData = supabaseBenchmarking ? supabaseBenchmarking.hasData : true;
  const posCapitalMacro = supabaseBenchmarking?.rankingCapitalVocacaoTotal || 1;
  const posGeralMacro = supabaseBenchmarking?.rankingGeralVocacaoTotal || 1;
  const totalCreditoMacro = supabaseBenchmarking?.totalCreditoVocacaoPeriodo || 0;

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
            Posicionamento competitivo da Vocação no ranking oficial da SEFAZ-SP e ferramenta de modelagem.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-[#004A6D] text-white text-xs font-black flex items-center gap-1.5 shadow-2xs">
            <Trophy className="w-4 h-4 text-[#EDCD01]" />
            <span>{hasData ? `#${posCapitalMacro}º Capital SP` : 'Capital: Sem dados'}</span>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-[#D9FBFF] text-[#004A6D] text-xs font-black border border-[#00E3E6]/50">
            {hasData ? `#${posGeralMacro}º Estado SP` : 'Estado: Sem dados'}
          </span>
        </div>
      </div>

      {/* 4 Macro KPIs (Top of Page) - Based on Total Period Credits */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          id="kpi-posicao-capital"
          title="Ranking SEFAZ (Capital SP)"
          value={hasData ? `#${posCapitalMacro}º Lugar` : 'Sem dados'}
          subValue={hasData ? "Consolidado Total do Período" : "Sem registros no filtro selecionado"}
          icon={Trophy}
          iconBgColor="bg-[#EDCD01]/30"
          iconColor="text-[#002A3A]"
          badge={{ text: 'Capital São Paulo', color: 'bg-[#004A6D] text-[#00E3E6]' }}
        />

        <KPICard
          id="kpi-posicao-estado"
          title="Ranking Estadual (SP)"
          value={hasData ? `#${posGeralMacro}º Lugar` : 'Sem dados'}
          subValue={hasData ? `Entre ${supabaseBenchmarking?.totalEntidadesPeriodo || processedRanking.length} entidades` : "0 entidades no período"}
          icon={Award}
          iconBgColor="bg-[#D9FBFF]"
          iconColor="text-[#004A6D]"
          badge={{ text: 'Estado de SP', color: 'bg-[#EDCD01]/30 text-[#002A3A]' }}
        />

        <KPICard
          id="kpi-crescimento-vocacao"
          title="Crédito Acumulado Vocação"
          value={hasData ? formatarMoeda(totalCreditoMacro) : 'R$ 0,00'}
          subValue={hasData ? "Total repassado no período" : "Nenhum repasse no filtro"}
          icon={TrendingUp}
          iconBgColor="bg-[#00E04B]/20"
          iconColor="text-[#006E24]"
          badge={{ text: 'Repasse em R$', color: 'bg-[#00E04B]/25 text-[#006E24]' }}
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

      {/* SIMULADOR DE CAPTAÇÃO DE DOADORES PLENOS (PF / DOAÇÃO AUTOMÁTICA CPF) */}
      <div className="bg-white border-2 border-[#004A6D] rounded-2xl p-6 shadow-sm space-y-6">
        
        {/* Simulator Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#BCD3DF]">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#004A6D] text-white">
                <Sliders className="w-4 h-4 text-[#00E3E6]" />
              </span>
              <h2 className="text-xl font-black text-[#002A3A] tracking-tight font-['Raleway',sans-serif]">
                Simulador de Captação — Doadores Plenos (PF / Doação Automática CPF)
              </h2>
            </div>
            <p className="text-xs text-[#004A6D]/80 mt-1">
              Simule a receita mensal e anual projetada com base no volume de doadores plenos cadastrados e retorno médio das notas da SEFAZ.
            </p>
          </div>

          <button
            onClick={() => {
              setMetaDoadoresPlenos(1500);
              setCuponsMesDoador(18);
              setRetornoMedioNota(3.25);
            }}
            className="text-xs font-bold text-[#004A6D] hover:underline self-start sm:self-auto cursor-pointer"
          >
            Restaurar Valores Padrão
          </button>
        </div>

        {/* Simulator Input Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Meta de Doadores Cadastrados */}
          <div className="bg-[#F4F9FA] p-5 rounded-xl border border-[#BCD3DF] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#002A3A] flex items-center gap-1.5 font-['Raleway',sans-serif]">
                <Users className="w-4 h-4 text-[#004A6D]" />
                Doadores Plenos (CPF)
              </span>
              <span className="bg-[#004A6D] text-[#00E3E6] px-2.5 py-1 rounded-lg text-xs font-black">
                {formatarNumero(metaDoadoresPlenos)}
              </span>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-[#004A6D] font-bold mb-1">
                <span>Meta de Doadores Ativos</span>
                <span>{formatarNumero(metaDoadoresPlenos)} doadores</span>
              </div>
              <input 
                type="range" 
                min="100" 
                max="10000" 
                step="100"
                value={metaDoadoresPlenos}
                onChange={(e) => setMetaDoadoresPlenos(Number(e.target.value))}
                className="w-full accent-[#004A6D] cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-[#004A6D]/70 italic">
              Pessoas físicas que cadastraram o CPF no app Nota Fiscal Paulista para doação automática.
            </p>
          </div>

          {/* Card 2: Frequência Mensal de Cupons */}
          <div className="bg-[#F4F9FA] p-5 rounded-xl border border-[#BCD3DF] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#002A3A] flex items-center gap-1.5 font-['Raleway',sans-serif]">
                <TrendingUp className="w-4 h-4 text-[#004A6D]" />
                Frequência de Compras
              </span>
              <span className="bg-[#004A6D] text-[#00E3E6] px-2.5 py-1 rounded-lg text-xs font-black">
                {cuponsMesDoador} cupons/mês
              </span>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-[#004A6D] font-bold mb-1">
                <span>Notas por Doador / Mês</span>
                <span>{cuponsMesDoador} notas</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="50" 
                step="1"
                value={cuponsMesDoador}
                onChange={(e) => setCuponsMesDoador(Number(e.target.value))}
                className="w-full accent-[#004A6D] cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-[#004A6D]/70 italic">
              Média estimada de notas fiscais geradas com CPF por doador a cada mês no comércio.
            </p>
          </div>

          {/* Card 3: Retorno Médio por Nota Fiscal */}
          <div className="bg-[#F4F9FA] p-5 rounded-xl border border-[#BCD3DF] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#002A3A] flex items-center gap-1.5 font-['Raleway',sans-serif]">
                <DollarSign className="w-4 h-4 text-[#004A6D]" />
                Retorno Médio / Nota
              </span>
              <span className="bg-[#004A6D] text-[#00E3E6] px-2.5 py-1 rounded-lg text-xs font-black">
                {formatarMoeda(retornoMedioNota)}
              </span>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-[#004A6D] font-bold mb-1">
                <span>Valor Médio Repassado SEFAZ</span>
                <span>{formatarMoeda(retornoMedioNota)}/nota</span>
              </div>
              <input 
                type="range" 
                min="0.5" 
                max="10.0" 
                step="0.25"
                value={retornoMedioNota}
                onChange={(e) => setRetornoMedioNota(Number(e.target.value))}
                className="w-full accent-[#004A6D] cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-[#004A6D]/70 italic">
              Valor histórico médio repassado pela SEFAZ por cada cupom fiscal doado.
            </p>
          </div>

        </div>

        {/* Projection Results */}
        <div className="bg-gradient-to-r from-[#002A3A] to-[#004A6D] text-white p-6 rounded-xl space-y-4 shadow-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#00E3E6]" />
                <h3 className="text-lg font-black tracking-tight font-['Raleway',sans-serif]">
                  Projeção Total de Captação Estimada
                </h3>
              </div>
              <p className="text-xs text-[#BCD3DF] mt-0.5">
                Impacto orçamentário projetado da base de doadores plenos (PF / Doação Automática CPF).
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <span className="text-[10px] text-[#BCD3DF] uppercase font-bold block">Faturamento Mensal</span>
                <span className="text-2xl font-black text-[#00E3E6]">
                  {formatarMoeda(faturamentoMensalTotalProjetado)}
                </span>
              </div>
              <div className="text-right pl-6 border-l border-[#BCD3DF]/30">
                <span className="text-[10px] text-[#BCD3DF] uppercase font-bold block">Faturamento Anual</span>
                <span className="text-3xl font-black text-[#EDCD01]">
                  {formatarMoeda(faturamentoAnualTotalProjetado)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#002A3A]/60 p-3 rounded-lg border border-[#00E3E6]/30 flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-white font-medium">
              <GraduationCap className="w-4 h-4 text-[#00E3E6]" />
              Impacto Social Direto Estimado:
            </span>
            <span className="font-bold text-[#00E3E6]">
              ~{jovensImpactadosAno} Jovens patrocinados em cursos profissionalizantes por ano
            </span>
          </div>
        </div>

      </div>

      {/* EXPLORADOR DO RANKING OFICIAL SEFAZ (INTERATIVO POR MODALIDADE E MÉTRICA) */}
      <div className="bg-white border border-[#BCD3DF] rounded-2xl p-6 shadow-xs space-y-6">
        
        {/* Header & Controls */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Trophy className="w-5 h-5 text-[#004A6D]" />
                <h2 className="text-xl font-black text-[#002A3A] tracking-tight font-['Raleway',sans-serif]">
                  Explorador do Ranking Oficial de Entidades SEFAZ
                </h2>
                {isLoading ? (
                  <span className="flex items-center gap-1.5 text-xs font-extrabold text-[#004A6D] bg-[#D9FBFF] px-2.5 py-1 rounded-full border border-[#00E3E6]/60 shadow-2xs animate-pulse">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#004A6D]" />
                    Atualizando...
                  </span>
                ) : !hasData ? (
                  <span className="flex items-center gap-1.5 text-xs font-extrabold text-[#D9381E] bg-[#FFEBEB] px-2.5 py-1 rounded-full border border-[#FFB8B8] shadow-2xs">
                    <AlertCircle className="w-3.5 h-3.5 text-[#D9381E]" />
                    Sem dados para o filtro
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-extrabold text-[#006E24] bg-[#00E04B]/15 px-2.5 py-1 rounded-full border border-[#00E04B]/40 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#006E24]" />
                    Atualizado (Dados SEFAZ)
                  </span>
                )}
              </div>
              <p className="text-xs text-[#004A6D]/80 mt-1">
                Ranking oficial consolidado dos repasses e apurações da Nota Fiscal Paulista SEFAZ-SP.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <span className="text-xs font-bold text-[#004A6D]">Exibir Top N:</span>
              <input
                type="number"
                min="3"
                max="100"
                value={topNCount}
                onChange={(e) => setTopNCount(Math.max(1, Number(e.target.value)))}
                className="w-16 p-1.5 bg-[#F4F9FA] border border-[#BCD3DF] rounded-xl text-xs font-black text-center text-[#002A3A] focus:outline-none focus:border-[#004A6D]"
              />
            </div>
          </div>

          {!hasData && !isLoading && (
            <div className="p-4 bg-[#FFF9E6] border border-[#FFE599] rounded-xl flex items-center gap-3 text-xs font-bold text-[#8A6D0B]">
              <AlertCircle className="w-5 h-5 text-[#D97706] shrink-0" />
              <span>
                Não foi possível apurar o ranking para os anos/meses selecionados pois não existem registros da SEFAZ no banco de dados para este filtro. Por favor, selecione outro período no filtro de cabeçalho.
              </span>
            </div>
          )}

          {/* Filter Bar 1: Metric Type + Sub-filter for 4 Types */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#F4F9FA] p-3.5 rounded-xl border border-[#BCD3DF]">
            
            {/* Filter 1: Métrica (Crédito vs Volume) */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#004A6D] min-w-[70px]">Métrica:</span>
              <div className="flex items-center bg-white p-1 rounded-lg border border-[#BCD3DF] text-xs w-full">
                <button
                  onClick={() => setMetricType('CREDITO')}
                  className={`flex-1 py-1 px-3 rounded-md font-extrabold transition-colors cursor-pointer ${
                    metricType === 'CREDITO' ? 'bg-[#004A6D] text-white' : 'text-[#004A6D]'
                  }`}
                >
                  Crédito (R$)
                </button>
                <button
                  onClick={() => setMetricType('VOLUME')}
                  className={`flex-1 py-1 px-3 rounded-md font-extrabold transition-colors cursor-pointer ${
                    metricType === 'VOLUME' ? 'bg-[#004A6D] text-white' : 'text-[#004A6D]'
                  }`}
                >
                  Volume (Cupons/Qtd)
                </button>
              </div>
            </div>

            {/* Filter 2: Modalidade (4 Tipos + Total) */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#004A6D] min-w-[70px]">Modalidade:</span>
              <select
                value={modalidadeFilter}
                onChange={(e: any) => setModalidadeFilter(e.target.value)}
                className="w-full p-1.5 bg-white border border-[#BCD3DF] rounded-lg text-xs font-bold text-[#002A3A] focus:outline-none focus:border-[#004A6D] cursor-pointer"
              >
                <option value="TODAS">Todos os 4 Tipos (Soma Total)</option>
                <option value="CONSUMO_PROPRIO">Consumo Próprio</option>
                <option value="CADASTRO_ENTIDADE">Cadastro pela Entidade</option>
                <option value="CADASTRO_CONSUMIDOR">Cadastro pelo Consumidor</option>
                <option value="DOACAO_AUTOMATICA">Doação Automática</option>
              </select>
            </div>

          </div>

          {/* Search & Area Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <div className="relative w-full sm:w-auto flex-1 max-w-sm">
              <Search className="w-4 h-4 text-[#004A6D]/60 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar entidade ou município..."
                value={searchEntidade}
                onChange={(e) => setSearchEntidade(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#F4F9FA] border border-[#BCD3DF] rounded-xl text-xs font-medium text-[#002A3A] focus:outline-none focus:border-[#004A6D]"
              />
            </div>

            <div className="flex items-center bg-[#F4F9FA] p-1 rounded-xl border border-[#BCD3DF] text-xs self-end sm:self-auto">
              <button
                onClick={() => setAreaFiltro('TODAS')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  areaFiltro === 'TODAS' ? 'bg-[#004A6D] text-white' : 'text-[#004A6D]'
                }`}
              >
                Todas as Áreas
              </button>
              <button
                onClick={() => setAreaFiltro('Assistência Social')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  areaFiltro === 'Assistência Social' ? 'bg-[#004A6D] text-white' : 'text-[#004A6D]'
                }`}
              >
                Assist. Social
              </button>
            </div>
          </div>
        </div>

        {/* Ranking Visual Comparison Chart */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[#004A6D] font-bold">
            <span>Comparativo Visual — Top {topNCount} Entidades {chartRankingData.some(c => c.isVocacao) ? '+ Destaque Vocação' : ''}</span>
            <span className="text-[#00E3E6] bg-[#004A6D] px-2.5 py-1 rounded-lg text-xs font-black uppercase shadow-2xs flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00E3E6] inline-block animate-pulse"></span>
              Destaque: Vocação (#00E3E6)
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartRankingData} margin={{ top: 10, right: 10, left: 15, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8F1F5" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10, fill: '#004A6D', fontWeight: 'bold' }} 
                  angle={-25} 
                  textAnchor="end" 
                  height={45} 
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#004A6D' }} 
                  tickFormatter={(val) => metricType === 'CREDITO' 
                    ? `R$ ${(val / 1000).toFixed(0)}k` 
                    : `${(val / 1000).toFixed(0)}k`} 
                />
                <Tooltip 
                  formatter={(val: any, name: any, item: any) => [
                    metricType === 'CREDITO' ? formatarMoeda(Number(val)) : formatarNumero(Number(val)),
                    item.payload.fullName
                  ]}
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    color: '#002A3A', 
                    borderRadius: '12px', 
                    border: '1px solid #BCD3DF', 
                    boxShadow: '0 10px 25px -5px rgba(0, 42, 58, 0.15)',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    padding: '10px 14px'
                  }}
                  labelStyle={{ color: '#002A3A', fontWeight: 'bold', marginBottom: '4px' }}
                />
                <Bar dataKey="valor" name={metricType === 'CREDITO' ? "Crédito (R$)" : "Volume (Qtd)"} radius={[4, 4, 0, 0]}>
                  {chartRankingData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isVocacao ? '#00E3E6' : '#004A6D'} 
                      stroke={entry.isVocacao ? '#002A3A' : undefined}
                      strokeWidth={entry.isVocacao ? 2.5 : 0}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ranking Table: Vocação ALWAYS Row 1 (Pinned), followed by complete Top N */}
        <div className="overflow-x-auto space-y-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F4F9FA] border-b border-[#BCD3DF] text-[#004A6D] font-bold uppercase text-[11px]">
                <th className="py-2.5 px-3 text-center">Posição Est.</th>
                <th className="py-2.5 px-3">Nome da Entidade Beneficente</th>
                <th className="py-2.5 px-3">Área de Atuação</th>
                <th className="py-2.5 px-3">Município</th>
                <th className="py-2.5 px-3 text-right">
                  {metricType === 'CREDITO' ? 'Valor Total (R$)' : 'Volume Total (Qtd)'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F5F8]">
              {tableData.map((ent, idx) => {
                const isPinnedRow = idx === 0;
                const uniqueKey = `row-${idx}-${ent.cnpj}`;

                return (
                  <tr 
                    key={uniqueKey}
                    className={`transition-colors ${
                      isPinnedRow || ent.isVocacao
                        ? 'bg-[#00E3E6]/25 font-black border-2 border-[#00E3E6]' 
                        : 'hover:bg-[#F8FCFD]'
                    }`}
                  >
                    <td className="py-3 px-3 text-center font-bold">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                        ent.posicaoGeral === 1 ? 'bg-[#EDCD01] text-[#002A3A]' :
                        ent.posicaoGeral === 2 ? 'bg-[#BCD3DF] text-[#002A3A]' :
                        ent.posicaoGeral === 3 ? 'bg-[#E03F2A]/30 text-[#E03F2A]' :
                        ent.isVocacao ? 'bg-[#004A6D] text-[#00E3E6] ring-2 ring-[#00E3E6]' :
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
                        {isPinnedRow && (
                          <span className="bg-[#004A6D] text-[#00E3E6] px-2 py-0.5 rounded text-[10px] font-black uppercase border border-[#00E3E6]">
                            Nossa Instituição (Vocação - Referência)
                          </span>
                        )}
                        {!isPinnedRow && ent.isVocacao && (
                          <span className="bg-[#004A6D] text-[#00E3E6] px-2 py-0.5 rounded text-[10px] font-black uppercase border border-[#00E3E6]">
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
                      {metricType === 'CREDITO' ? formatarMoeda(ent.valorCalculado) : formatarNumero(ent.valorCalculado)}
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
