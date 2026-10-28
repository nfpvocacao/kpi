import React, { useState, useMemo, useRef } from 'react';
import { 
  Megaphone, 
  Calendar, 
  Users, 
  UserCheck, 
  UserX, 
  TrendingUp, 
  Filter, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowUpRight, 
  Building2, 
  Tag, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Coins,
  Hourglass,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  User,
  Award,
  Target
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
  LabelList,
  Legend
} from 'recharts';
import { KPICard } from '../KPICard';
import { BrandBadge } from '../BrandBadge';
import { CopyChartButton } from '../CopyChartButton';
import { formatarMoeda, formatarNumero } from '../../data/mockDatabase';
import { useSupabaseCampanhas } from '../../hooks/useSupabaseCampanhas';

export interface DoadorCampanhaDetalhe {
  nome: string;
  cpf: string;
  fone?: string;
  statusMerito: 'NOVO' | 'PREEXISTENTE';
  ativado: boolean;
}

export interface CampanhaCaptacao {
  id: string;
  nomeAcao: string;
  dataInicio: string; // YYYY-MM-DD
  dataFim?: string;
  responsavel: string;
  localOuParceiro: string;
  status: 'EM_ANDAMENTO' | 'CONCLUIDA' | 'PLANEJADA';
  totalCadastrosBitrix: number;
  novosCpfsConquistados: number; // Validados: sem créditos anteriores
  cpfsPreexistentes: number;     // Já doavam antes do evento
  ativadosComCredito: number;    // Ativados no 1º mês (M+1)
  ativadosTotal?: number;        // Ativados no histórico total
  creditoEstimado: number;       // Calculado com média móvel (9,28 cupons * R$ 5,72)
  creditoRealizado: number;      // Crédito realizado no 1º mês pós-evento (M+1)
  creditoRealizadoAcumulado?: number; // Crédito acumulado total pós-evento (+1M retorno histórico)
  mesPrevisaoLiberacao: string;  // Mês em que a SEFAZ homologa os créditos
  descricao?: string;
  cpfsDetalhes?: DoadorCampanhaDetalhe[];
}

export type CampanhaSortField = 
  | 'nomeAcao' 
  | 'dataInicio' 
  | 'status' 
  | 'responsavel' 
  | 'totalCadastrosBitrix' 
  | 'novosCpfsConquistados' 
  | 'cpfsPreexistentes' 
  | 'ativadosComCredito' 
  | 'ativadosTotal'
  | 'creditoEstimado' 
  | 'creditoRealizado'
  | 'creditoRealizadoAcumulado';

export interface ResumoResponsavel {
  responsavel: string;
  totalAcoes: number;
  totalCadastrosBitrix: number;
  novosCpfsConquistados: number;
  taxaConversaoNovos: number;
  cpfsPreexistentes: number;
  ativadosComCredito: number;
  ativadosTotal: number;
  taxaAtivacao: number;
  taxaAtivacaoTotal: number;
  creditoEstimado: number;
  creditoRealizado: number;
  creditoRealizadoAcumulado: number;
}

// Parâmetros médios reais apurados (ex: Junho/2026: 12.993 cupons / 1.400 doadores = 9,28 cup/doador; Ticket = R$ 5,72)
export const PARAMETROS_ESTIMATIVA = {
  cuponsPorDoadorMes: 9.28,
  ticketMedioPorCupom: 5.72,
  valorMedioMensalPorDoador: 9.28 * 5.72 // R$ 53,08 / doador / mês
};

// Mock alinhado ao cronograma real da SEFAZ (Outubro/2026 recebe notas de Julho/2026 decorrentes de ações de Junho/2026)
export const MOCK_CAMPANHAS_BITRIX: CampanhaCaptacao[] = [
  {
    id: 'BITRIX-DEAL-101',
    nomeAcao: 'Ação Corporativa - Empresa Alpha Tech',
    dataInicio: '2026-06-08',
    dataFim: '2026-06-15',
    responsavel: 'Priscila Vasques',
    localOuParceiro: 'Sede Alpha Tech (Av. Paulista)',
    status: 'CONCLUIDA',
    totalCadastrosBitrix: 142,
    novosCpfsConquistados: 98,
    cpfsPreexistentes: 44,
    ativadosComCredito: 76,
    creditoEstimado: 98 * PARAMETROS_ESTIMATIVA.valorMedioMensalPorDoador,
    creditoRealizado: 4892.40,
    mesPrevisaoLiberacao: 'Outubro/2026 (Liquidado)',
    descricao: 'Estande no refeitório corporativo com QR Code e apoio do RH.'
  },
  {
    id: 'BITRIX-DEAL-102',
    nomeAcao: 'Ação de Rua - Feira Gastronômica Moema',
    dataInicio: '2026-06-20',
    dataFim: '2026-06-22',
    responsavel: 'Bianca Borges',
    localOuParceiro: 'Praça dos Pássaros - Moema',
    status: 'CONCLUIDA',
    totalCadastrosBitrix: 89,
    novosCpfsConquistados: 61,
    cpfsPreexistentes: 28,
    ativadosComCredito: 48,
    creditoEstimado: 61 * PARAMETROS_ESTIMATIVA.valorMedioMensalPorDoador,
    creditoRealizado: 3110.80,
    mesPrevisaoLiberacao: 'Outubro/2026 (Liquidado)',
    descricao: 'Abordagem ao público consumidor com foco em cadastro automático direto no app da NFP.'
  },
  {
    id: 'BITRIX-DEAL-103',
    nomeAcao: 'Mutirão Escolas Parceiras - Colégio Santo Amaro',
    dataInicio: '2026-07-14',
    dataFim: '2026-07-28',
    responsavel: 'Priscila Vasques',
    localOuParceiro: 'Colégio Santo Amaro',
    status: 'CONCLUIDA',
    totalCadastrosBitrix: 215,
    novosCpfsConquistados: 168,
    cpfsPreexistentes: 47,
    ativadosComCredito: 112,
    creditoEstimado: 168 * PARAMETROS_ESTIMATIVA.valorMedioMensalPorDoador,
    creditoRealizado: 0,
    mesPrevisaoLiberacao: 'Novembro/2026',
    descricao: 'Envolvimento de pais e professores na semana da cidadania solidária.'
  },
  {
    id: 'BITRIX-DEAL-104',
    nomeAcao: 'Ação Varejo - Shopping Market Place',
    dataInicio: '2026-08-10',
    dataFim: '2026-08-20',
    responsavel: 'Bianca Borges',
    localOuParceiro: 'Shopping Market Place - Praça de Eventos',
    status: 'CONCLUIDA',
    totalCadastrosBitrix: 130,
    novosCpfsConquistados: 94,
    cpfsPreexistentes: 36,
    ativadosComCredito: 58,
    creditoEstimado: 94 * PARAMETROS_ESTIMATIVA.valorMedioMensalPorDoador,
    creditoRealizado: 0,
    mesPrevisaoLiberacao: 'Dezembro/2026',
    descricao: 'Totem interativo e distribuição de folders explicativos sobre o impacto na Vocação.'
  },
  {
    id: 'BITRIX-DEAL-105',
    nomeAcao: 'Campanha Digital - Redes Sociais & Voluntários',
    dataInicio: '2026-09-05',
    responsavel: 'Bianca Borges',
    localOuParceiro: 'Campanha Online (Instagram/WhatsApp)',
    status: 'EM_ANDAMENTO',
    totalCadastrosBitrix: 110,
    novosCpfsConquistados: 75,
    cpfsPreexistentes: 35,
    ativadosComCredito: 34,
    creditoEstimado: 75 * PARAMETROS_ESTIMATIVA.valorMedioMensalPorDoador,
    creditoRealizado: 0,
    mesPrevisaoLiberacao: 'Janeiro/2027',
    descricao: 'Tráfego orgânico e disparos via WhatsApp direcionando para o cadastro no Bitrix.'
  },
  {
    id: 'BITRIX-DEAL-106',
    nomeAcao: 'Ação Esportiva - Corrida Solidária Ibirapuera',
    dataInicio: '2026-09-20',
    dataFim: '2026-09-21',
    responsavel: 'Priscila Vasques',
    localOuParceiro: 'Parque Ibirapuera - Portão 7',
    status: 'CONCLUIDA',
    totalCadastrosBitrix: 175,
    novosCpfsConquistados: 124,
    cpfsPreexistentes: 51,
    ativadosComCredito: 62,
    creditoEstimado: 124 * PARAMETROS_ESTIMATIVA.valorMedioMensalPorDoador,
    creditoRealizado: 0,
    mesPrevisaoLiberacao: 'Janeiro/2027',
    descricao: 'Tenda de hidratação solidária e adesão de atletas ao app da NFP.'
  },
  {
    id: 'BITRIX-DEAL-107',
    nomeAcao: 'Campanha Comércio Local - Pinheiros & Vila Madalena',
    dataInicio: '2026-10-02',
    responsavel: 'Bianca Borges',
    localOuParceiro: 'Lojas e Cafés da Região Oeste',
    status: 'EM_ANDAMENTO',
    totalCadastrosBitrix: 95,
    novosCpfsConquistados: 68,
    cpfsPreexistentes: 27,
    ativadosComCredito: 19,
    creditoEstimado: 68 * PARAMETROS_ESTIMATIVA.valorMedioMensalPorDoador,
    creditoRealizado: 0,
    mesPrevisaoLiberacao: 'Fevereiro/2027',
    descricao: 'Visitas presenciais da equipe de captação aos comerciantes e frequentadores.'
  }
];

interface TabCampanhasProps {
  selectedYears?: number[];
  selectedMonths?: number[];
}

export const TabCampanhas: React.FC<TabCampanhasProps> = ({
  selectedYears = [2026],
  selectedMonths = []
}) => {
  const { campanhas: campanhasBase, isLoading: isLoadingCampanhas } = useSupabaseCampanhas();
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  const [filtroResponsavel, setFiltroResponsavel] = useState<string>('TODOS');
  const [campanhaSelecionada, setCampanhaSelecionada] = useState<CampanhaCaptacao | null>(null);
  const [ocultarCpf, setOcultarCpf] = useState<boolean>(false);
  const [termoBuscaCpf, setTermoBuscaCpf] = useState<string>('');

  // Estados de Ordenação da Tabela Detalhada de Ações
  const [sortField, setSortField] = useState<CampanhaSortField>('novosCpfsConquistados');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Chaves primitivas serializadas para garantir reatividade imediata no React
  const keyMeses = useMemo(() => (selectedMonths || []).slice().sort((a,b) => a-b).join(','), [selectedMonths]);
  const keyAnos = useMemo(() => (selectedYears || []).slice().sort((a,b) => a-b).join(','), [selectedYears]);

  // Refs para cópia de imagens dos gráficos
  const chartRef = useRef<HTMLDivElement>(null);
  const chartRespRef = useRef<HTMLDivElement>(null);

  // Filtrar campanhas pelo Ano e Mês selecionados no topo do painel (Reativo Instantâneo)
  const campanhasPorPeriodo = useMemo(() => {
    return campanhasBase.filter(c => {
      if (!c.dataInicio) return true;
      const partes = c.dataInicio.split('-');
      const ano = Number(partes[0]);
      const mes = Number(partes[1]);

      // Filtro por Ano (se selecionado)
      if (selectedYears && selectedYears.length > 0 && !selectedYears.includes(ano)) {
        return false;
      }

      // Filtro por Mês (se selecionado, ex: Outubro = 10)
      if (selectedMonths && selectedMonths.length > 0 && !selectedMonths.includes(mes)) {
        return false;
      }

      return true;
    });
  }, [campanhasBase, keyAnos, keyMeses, selectedYears, selectedMonths]);

  // Lista dinâmica de responsáveis existentes no período selecionado
  const responsaveisDisponiveis = useMemo(() => {
    const nomes = Array.from(new Set(campanhasPorPeriodo.map(c => c.responsavel)));
    return nomes.sort();
  }, [campanhasPorPeriodo]);

  // Consolidação Quantitativa por Responsável (no período selecionado)
  const resumoPorResponsavel = useMemo<ResumoResponsavel[]>(() => {
    const mapa = new Map<string, ResumoResponsavel>();

    campanhasPorPeriodo.forEach((c) => {
      const resp = c.responsavel;
      if (!mapa.has(resp)) {
        mapa.set(resp, {
          responsavel: resp,
          totalAcoes: 0,
          totalCadastrosBitrix: 0,
          novosCpfsConquistados: 0,
          taxaConversaoNovos: 0,
          cpfsPreexistentes: 0,
          ativadosComCredito: 0,
          ativadosTotal: 0,
          taxaAtivacao: 0,
          taxaAtivacaoTotal: 0,
          creditoEstimado: 0,
          creditoRealizado: 0,
          creditoRealizadoAcumulado: 0
        });
      }

      const item = mapa.get(resp)!;
      item.totalAcoes += 1;
      item.totalCadastrosBitrix += c.totalCadastrosBitrix;
      item.novosCpfsConquistados += c.novosCpfsConquistados;
      item.cpfsPreexistentes += c.cpfsPreexistentes;
      item.ativadosComCredito += c.ativadosComCredito;
      item.ativadosTotal += (c.ativadosTotal ?? c.ativadosComCredito);
      item.creditoEstimado += c.creditoEstimado;
      item.creditoRealizado += c.creditoRealizado;
      item.creditoRealizadoAcumulado += (c.creditoRealizadoAcumulado ?? c.creditoRealizado);
    });

    return Array.from(mapa.values()).map(item => ({
      ...item,
      taxaConversaoNovos: item.totalCadastrosBitrix > 0 ? (item.novosCpfsConquistados / item.totalCadastrosBitrix) * 100 : 0,
      taxaAtivacao: item.novosCpfsConquistados > 0 ? (item.ativadosComCredito / item.novosCpfsConquistados) * 100 : 0,
      taxaAtivacaoTotal: item.novosCpfsConquistados > 0 ? (item.ativadosTotal / item.novosCpfsConquistados) * 100 : 0
    })).sort((a, b) => b.novosCpfsConquistados - a.novosCpfsConquistados);
  }, [campanhasBase]);

  // Totais Gerais da Equipe (Rodapé da Tabela de Responsáveis)
  const totaisEquipe = useMemo(() => {
    return resumoPorResponsavel.reduce((acc, r) => ({
      totalAcoes: acc.totalAcoes + r.totalAcoes,
      totalCadastrosBitrix: acc.totalCadastrosBitrix + r.totalCadastrosBitrix,
      novosCpfsConquistados: acc.novosCpfsConquistados + r.novosCpfsConquistados,
      cpfsPreexistentes: acc.cpfsPreexistentes + r.cpfsPreexistentes,
      ativadosComCredito: acc.ativadosComCredito + r.ativadosComCredito,
      ativadosTotal: acc.ativadosTotal + r.ativadosTotal,
      creditoEstimado: acc.creditoEstimado + r.creditoEstimado,
      creditoRealizado: acc.creditoRealizado + r.creditoRealizado,
      creditoRealizadoAcumulado: acc.creditoRealizadoAcumulado + r.creditoRealizadoAcumulado,
      taxaConversaoNovos: 0,
      taxaAtivacao: 0,
      taxaAtivacaoTotal: 0
    }), {
      totalAcoes: 0,
      totalCadastrosBitrix: 0,
      novosCpfsConquistados: 0,
      cpfsPreexistentes: 0,
      ativadosComCredito: 0,
      ativadosTotal: 0,
      creditoEstimado: 0,
      creditoRealizado: 0,
      creditoRealizadoAcumulado: 0,
      taxaConversaoNovos: 0,
      taxaAtivacao: 0,
      taxaAtivacaoTotal: 0
    });
  }, [resumoPorResponsavel]);

  // Manipulador de ordenação da tabela detalhada
  const handleSort = (field: CampanhaSortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Ícone de ordenação
  const renderSortIcon = (field: CampanhaSortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity ml-1 inline" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-[#00E3E6] ml-1 inline" />
    ) : (
      <ArrowDown className="w-3 h-3 text-[#00E3E6] ml-1 inline" />
    );
  };

  // Filtragem e Ordenação dinâmica da Tabela Detalhada
  const campanhasFiltradas = useMemo(() => {
    return campanhasPorPeriodo.filter(c => {
      const matchSearch = 
        c.nomeAcao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.responsavel.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = filtroStatus === 'TODOS' || c.status === filtroStatus;
      const matchResponsavel = filtroResponsavel === 'TODOS' || c.responsavel === filtroResponsavel;

      return matchSearch && matchStatus && matchResponsavel;
    }).sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }
      return sortDirection === 'asc' 
        ? String(valA || '').localeCompare(String(valB || '')) 
        : String(valB || '').localeCompare(String(valA || ''));
    });
  }, [campanhasBase, searchTerm, filtroStatus, filtroResponsavel, sortField, sortDirection]);

  // Rótulo dinâmico da métrica selecionada
  const labelOrdenacaoAtual = useMemo(() => {
    switch (sortField) {
      case 'nomeAcao': return 'Nome da Ação (A-Z)';
      case 'dataInicio': return 'Data de Início';
      case 'status': return 'Status';
      case 'responsavel': return 'Responsável';
      case 'totalCadastrosBitrix': return 'Total de Cadastros';
      case 'novosCpfsConquistados': return 'Novos CPFs (Mérito)';
      case 'cpfsPreexistentes': return 'CPFs Preexistentes';
      case 'ativadosComCredito': return 'Ativados SEFAZ';
      case 'creditoEstimado': return 'Crédito Estimado (R$)';
      case 'creditoRealizado': return 'Crédito Realizado (R$)';
      default: return 'Novos CPFs';
    }
  }, [sortField]);

  // Gráfico TOP 10 Espelho da Tabela Detalhada
  const top10EspelhoTabela = useMemo(() => {
    return campanhasFiltradas.slice(0, 10).map((c, index) => {
      let valorMetrica = c.novosCpfsConquistados;
      let labelMetrica = 'Novos CPFs';
      let tipo: 'moeda' | 'numero' = 'numero';

      if (sortField === 'creditoEstimado') {
        valorMetrica = c.creditoEstimado;
        labelMetrica = 'Crédito Estimado (R$)';
        tipo = 'moeda';
      } else if (sortField === 'creditoRealizado') {
        valorMetrica = c.creditoRealizado;
        labelMetrica = 'Crédito Realizado (R$)';
        tipo = 'moeda';
      } else if (sortField === 'totalCadastrosBitrix') {
        valorMetrica = c.totalCadastrosBitrix;
        labelMetrica = 'Total de Cadastros';
        tipo = 'numero';
      } else if (sortField === 'ativadosComCredito') {
        valorMetrica = c.ativadosComCredito;
        labelMetrica = 'Ativados SEFAZ';
        tipo = 'numero';
      } else if (sortField === 'cpfsPreexistentes') {
        valorMetrica = c.cpfsPreexistentes;
        labelMetrica = 'Preexistentes';
        tipo = 'numero';
      }

      const nomeCurto = c.nomeAcao.replace('Ação ', '').replace('Campanha ', '').slice(0, 20);

      return {
        pos: index + 1,
        name: nomeCurto,
        fullName: c.nomeAcao,
        responsavel: c.responsavel,
        valorMetrica,
        labelMetrica,
        tipo
      };
    });
  }, [campanhasFiltradas, sortField]);

  // Totais agregados da tabela filtrada
  const totalAcoes = campanhasFiltradas.length;
  const totalCadastros = campanhasFiltradas.reduce((acc, c) => acc + c.totalCadastrosBitrix, 0);
  const totalNovosValidados = campanhasFiltradas.reduce((acc, c) => acc + c.novosCpfsConquistados, 0);
  const totalPreexistentes = campanhasFiltradas.reduce((acc, c) => acc + c.cpfsPreexistentes, 0);
  const totalAtivados = campanhasFiltradas.reduce((acc, c) => acc + c.ativadosComCredito, 0);
  const totalCreditoEstimado = campanhasFiltradas.reduce((acc, c) => acc + c.creditoEstimado, 0);
  const totalCreditoRealizado = campanhasFiltradas.reduce((acc, c) => acc + c.creditoRealizado, 0);
  const totalCreditoAcumulado = campanhasFiltradas.reduce((acc, c) => acc + (c.creditoRealizadoAcumulado ?? c.creditoRealizado), 0);

  const taxaConversaoNovos = totalCadastros > 0 ? (totalNovosValidados / totalCadastros) * 100 : 0;

  const subtituloFiltro = filtroResponsavel !== 'TODOS' 
    ? `Desempenho de ${filtroResponsavel}` 
    : 'Visão consolidada da equipe de captação';

  return (
    <div className="space-y-6">
      
      {/* Header Limpo Padronizado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#002A3A] tracking-tight font-['Raleway',sans-serif]">
              Ações & Campanhas
            </h1>
            <BrandBadge highlightText="Bitrix24" prefix="Origem" colorVariant="cyan" size="sm" />
          </div>
          <p className="text-xs text-[#004A6D]/80">
            Acompanhamento das iniciativas de captação confrontando <strong>Crédito Estimado vs. Realizado (SEFAZ)</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#D9FBFF] text-[#004A6D] px-3 py-1.5 rounded-xl text-xs font-bold border border-[#00E3E6]/40 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-[#004A6D]" />
            <span>Auditoria Temporal Ativa</span>
          </div>
        </div>
      </div>

      {/* 4 KPIs Executivos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Ações no Período */}
        <KPICard
          id="kpi-acoes-totais"
          title="Ações Realizadas"
          value={formatarNumero(totalAcoes)}
          subValue={`${subtituloFiltro}`}
          icon={Megaphone}
          iconBgColor="bg-[#00E3E6]/20"
          iconColor="text-[#004A6D]"
        />

        {/* KPI 2: Novos CPFs Válidos */}
        <KPICard
          id="kpi-novos-cpfs"
          title="Novos CPFs (Mérito Real)"
          value={formatarNumero(totalNovosValidados)}
          subValue={`${taxaConversaoNovos.toFixed(1)}% de conversão (${formatarNumero(totalCadastros)} colhidos)`}
          icon={UserCheck}
          iconBgColor="bg-[#00E04B]/20"
          iconColor="text-[#006E24]"
          badge={{ text: `${formatarNumero(totalPreexistentes)} preexistentes`, color: 'bg-amber-100 text-amber-800' }}
        />

        {/* KPI 3: Crédito Realizado SEFAZ */}
        <KPICard
          id="kpi-credito-realizado"
          title="Crédito Realizado (1º Mês)"
          value={formatarMoeda(totalCreditoRealizado)}
          subValue={`Retorno histórico total (+1M): ${formatarMoeda(totalCreditoAcumulado)}`}
          icon={Coins}
          iconBgColor="bg-emerald-500/20"
          iconColor="text-emerald-700"
          badge={{ text: 'Mês Seguinte (M+1)', color: 'bg-emerald-100 text-emerald-800' }}
        />

        {/* KPI 4: Crédito Estimado Total */}
        <KPICard
          id="kpi-credito-estimado"
          title="Crédito Estimado (Potencial)"
          value={formatarMoeda(totalCreditoEstimado)}
          subValue="Projeção: 9,28 cup. × R$ 5,72 (R$ 53,08/mês)"
          icon={Sparkles}
          iconBgColor="bg-[#004A6D]/15"
          iconColor="text-[#004A6D]"
        />
      </div>

      {/* 1. Gráfico TOP 10 em Colunas (Espelho da Tabela Detalhada) */}
      <div ref={chartRef} className="bg-white border border-[#BCD3DF]/60 rounded-2xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#F0F5F8]">
          <div>
            <h2 className="text-base font-bold text-[#002A3A] flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-[#004A6D]" />
              Top 10 Ações & Iniciativas — {subtituloFiltro} (Ordenado por {labelOrdenacaoAtual})
            </h2>
            <p className="text-xs text-[#004A6D]/70">
              Espelho visual dos primeiros registros da tabela detalhada ordenados interativamente por {labelOrdenacaoAtual}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <CopyChartButton chartRef={chartRef} title={`Top10_Campanhas_${sortField}`} />
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={top10EspelhoTabela} 
              margin={{ top: 25, right: 10, left: 0, bottom: 45 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 10, fill: '#004A6D', fontWeight: 600 }} 
                interval={0} 
                angle={-25} 
                textAnchor="end"
                height={55}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#004A6D' }} 
                tickFormatter={(val) => {
                  if (sortField === 'creditoEstimado' || sortField === 'creditoRealizado') {
                    return `R$ ${(val / 1000).toFixed(0)}k`;
                  }
                  return formatarNumero(val);
                }} 
              />
              <Tooltip 
                formatter={(val: any, _name: any, props: any) => {
                  const item = props?.payload;
                  const numVal = Number(val);
                  if (item?.tipo === 'moeda') return [formatarMoeda(numVal), item.labelMetrica];
                  return [formatarNumero(numVal), item.labelMetrica];
                }}
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
              <Bar dataKey="valorMetrica" name={labelOrdenacaoAtual} fill="#004A6D" radius={[6, 6, 0, 0]}>
                {top10EspelhoTabela.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={index < 3 ? '#004A6D' : '#00E3E6'} />
                ))}
                <LabelList 
                  dataKey="valorMetrica" 
                  position="top" 
                  formatter={(val: any) => {
                    const num = Number(val);
                    if (num <= 0) return '';
                    if (sortField === 'creditoEstimado' || sortField === 'creditoRealizado') {
                      return num >= 1000 ? `R$ ${(num / 1000).toFixed(1)}k` : `R$ ${num.toFixed(0)}`;
                    }
                    return formatarNumero(num);
                  }}
                  style={{ 
                    fontSize: '10px', 
                    fill: '#002A3A', 
                    fontWeight: 800,
                    fontFamily: 'Raleway, sans-serif'
                  }} 
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Barra de Filtros: Busca + Filtro por Responsável + Filtro por Status */}
      <div className="bg-white border border-[#BCD3DF]/70 rounded-2xl p-4 shadow-2xs flex flex-col lg:flex-row items-center justify-between gap-3">
        
        {/* Busca por Ação */}
        <div className="relative w-full lg:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar ação..."
            className="w-full pl-9 pr-4 py-2 bg-[#F4F9FA] border border-[#BCD3DF] rounded-xl text-xs font-semibold text-[#002A3A] placeholder-[#004A6D]/50 focus:outline-none focus:border-[#004A6D]"
          />
          <Search className="w-4 h-4 text-[#004A6D]/60 absolute left-3 top-2.5" />
        </div>

        {/* Filtros Combinados */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          
          {/* Filtro de Responsável */}
          <div className="flex items-center gap-2 bg-[#F4F9FA] border border-[#BCD3DF] rounded-xl px-3 py-1.5 shadow-2xs">
            <User className="w-3.5 h-3.5 text-[#004A6D]" />
            <span className="text-xs font-bold text-[#004A6D]">Responsável:</span>
            <select
              value={filtroResponsavel}
              onChange={(e) => setFiltroResponsavel(e.target.value)}
              className="bg-transparent text-xs font-extrabold text-[#002A3A] focus:outline-none cursor-pointer"
            >
              <option value="TODOS">Todos os Responsáveis</option>
              {responsaveisDisponiveis.map((resp) => (
                <option key={resp} value={resp}>
                  {resp}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de Status */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-xs font-bold text-[#004A6D] shrink-0">Status:</span>
            {['TODOS', 'EM_ANDAMENTO', 'CONCLUIDA'].map((st) => (
              <button
                key={st}
                onClick={() => setFiltroStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  filtroStatus === st
                    ? 'bg-[#004A6D] text-white shadow-xs'
                    : 'bg-[#F4F9FA] text-[#004A6D] hover:bg-[#D9FBFF]'
                }`}
              >
                {st === 'TODOS' ? 'Todos' : st === 'EM_ANDAMENTO' ? 'Em Andamento' : 'Concluída'}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* 3. Tabela Gerencial Detalhada Fixa com Ordenação Interativa */}
      <div className="bg-white border border-[#BCD3DF]/70 rounded-2xl shadow-2xs overflow-hidden">
        
        <div className="p-4 bg-slate-50 border-b border-[#BCD3DF]/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-[#004A6D]" />
            <h3 className="font-extrabold text-sm text-[#002A3A]">
              Tabela Detalhada de Iniciativas — {subtituloFiltro} (Ordenada por {labelOrdenacaoAtual})
            </h3>
          </div>
          <span className="text-xs text-[#004A6D]/70 font-semibold">
            {campanhasFiltradas.length} iniciativa(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#BCD3DF]/60 bg-[#F4F9FA] text-[#004A6D] font-extrabold select-none">
                
                {/* Ação / Evento */}
                <th 
                  onClick={() => handleSort('nomeAcao')}
                  className="py-3 px-4 cursor-pointer hover:bg-[#D9FBFF]/60 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <span>Ação / Evento</span>
                    {renderSortIcon('nomeAcao')}
                  </div>
                </th>

                {/* Data Início */}
                <th 
                  onClick={() => handleSort('dataInicio')}
                  className="py-3 px-3 cursor-pointer hover:bg-[#D9FBFF]/60 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <span>Data Início</span>
                    {renderSortIcon('dataInicio')}
                  </div>
                </th>

                {/* Status */}
                <th 
                  onClick={() => handleSort('status')}
                  className="py-3 px-3 text-center cursor-pointer hover:bg-[#D9FBFF]/60 transition-colors group"
                >
                  <div className="flex items-center justify-center">
                    <span>Status</span>
                    {renderSortIcon('status')}
                  </div>
                </th>

                {/* Responsável */}
                <th 
                  onClick={() => handleSort('responsavel')}
                  className="py-3 px-3 cursor-pointer hover:bg-[#D9FBFF]/60 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <span>Responsável</span>
                    {renderSortIcon('responsavel')}
                  </div>
                </th>

                {/* Cadastros Bitrix */}
                <th 
                  onClick={() => handleSort('totalCadastrosBitrix')}
                  className="py-3 px-3 text-center cursor-pointer hover:bg-[#D9FBFF]/60 transition-colors group"
                >
                  <div className="flex items-center justify-center">
                    <span>Cadastros Bitrix</span>
                    {renderSortIcon('totalCadastrosBitrix')}
                  </div>
                </th>

                {/* Novos CPFs (Mérito) */}
                <th 
                  onClick={() => handleSort('novosCpfsConquistados')}
                  className="py-3 px-3 text-center cursor-pointer hover:bg-[#D9FBFF]/60 transition-colors group"
                >
                  <div className="flex items-center justify-center">
                    <span>Novos CPFs (Mérito)</span>
                    {renderSortIcon('novosCpfsConquistados')}
                  </div>
                </th>

                {/* Preexistentes */}
                <th 
                  onClick={() => handleSort('cpfsPreexistentes')}
                  className="py-3 px-3 text-center cursor-pointer hover:bg-[#D9FBFF]/60 transition-colors group"
                >
                  <div className="flex items-center justify-center">
                    <span>Preexistentes</span>
                    {renderSortIcon('cpfsPreexistentes')}
                  </div>
                </th>

                {/* Ativados 1M */}
                <th 
                  onClick={() => handleSort('ativadosComCredito')}
                  className="py-3 px-3 text-center cursor-pointer hover:bg-[#D9FBFF]/60 transition-colors group"
                  title="Doadores que geraram cupons no 1º mês após o evento (M+1)"
                >
                  <div className="flex items-center justify-center">
                    <span>Ativados 1M</span>
                    {renderSortIcon('ativadosComCredito')}
                  </div>
                </th>

                {/* Ativados Total */}
                <th 
                  onClick={() => handleSort('ativadosTotal')}
                  className="py-3 px-3 text-center cursor-pointer hover:bg-[#D9FBFF]/60 transition-colors group"
                  title="Total de doadores que geraram cupons em qualquer período pós-evento"
                >
                  <div className="flex items-center justify-center">
                    <span>Ativados Total</span>
                    {renderSortIcon('ativadosTotal')}
                  </div>
                </th>

                {/* Crédito Estimado */}
                <th 
                  onClick={() => handleSort('creditoEstimado')}
                  className="py-3 px-3 text-right cursor-pointer hover:bg-[#D9FBFF]/60 transition-colors group"
                >
                  <div className="flex items-center justify-end">
                    <span>Crédito Estimado</span>
                    {renderSortIcon('creditoEstimado')}
                  </div>
                </th>

                {/* Crédito Realizado 1M */}
                <th 
                  onClick={() => handleSort('creditoRealizado')}
                  className="py-3 px-3 text-right cursor-pointer hover:bg-[#D9FBFF]/60 transition-colors group"
                  title="Crédito apurado estritamente no 1º mês após o evento (M+1)"
                >
                  <div className="flex items-center justify-end">
                    <span>Crédito Realizado 1M</span>
                    {renderSortIcon('creditoRealizado')}
                  </div>
                </th>

                {/* Crédito Real Total (Retorno Histórico) */}
                <th 
                  onClick={() => handleSort('creditoRealizadoAcumulado')}
                  className="py-3 px-3 text-right cursor-pointer hover:bg-[#D9FBFF]/60 transition-colors group"
                  title="Total retorno histórico acumulado pós-evento (M+1 em diante)"
                >
                  <div className="flex items-center justify-end">
                    <span>Crédito Real Total</span>
                    {renderSortIcon('creditoRealizadoAcumulado')}
                  </div>
                </th>

                <th className="py-3 px-3 text-center">Previsão Liberação</th>
                <th className="py-3 px-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#BCD3DF]/40 font-medium text-[#002A3A]">
              {campanhasFiltradas.map((campanha) => {
                const ativ1M = campanha.ativadosComCredito || 0;
                const ativTot = campanha.ativadosTotal ?? ativ1M;

                const taxaAtiv1M = campanha.novosCpfsConquistados > 0 
                  ? ((ativ1M / campanha.novosCpfsConquistados) * 100).toFixed(0) 
                  : '0';

                const taxaAtivTot = campanha.novosCpfsConquistados > 0 
                  ? ((ativTot / campanha.novosCpfsConquistados) * 100).toFixed(0) 
                  : '0';

                const cred1M = campanha.creditoRealizado || 0;
                const credAcum = campanha.creditoRealizadoAcumulado ?? cred1M;
                const isLiquidado = campanha.mesPrevisaoLiberacao.toLowerCase().includes('liquidado');

                return (
                  <tr 
                    key={campanha.id} 
                    className="hover:bg-[#F6FAFD] transition-colors cursor-pointer group"
                    onClick={() => setCampanhaSelecionada(campanha)}
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#002A3A] group-hover:text-[#004A6D]">
                        {campanha.nomeAcao}
                      </div>
                      <span className="text-[10px] text-[#004A6D]/60 font-mono">
                        {campanha.id}
                      </span>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap text-slate-600 font-semibold">
                      {campanha.dataInicio.split('-').reverse().join('/')}
                    </td>

                    {/* Coluna STATUS */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {campanha.status === 'CONCLUIDA' ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Concluída
                        </span>
                      ) : (
                        <span className="bg-sky-100 text-sky-800 text-[10px] font-black px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Em Andamento
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="bg-[#D9FBFF] text-[#004A6D] px-2 py-0.5 rounded-md font-bold text-[11px]">
                        {campanha.responsavel}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center font-bold text-slate-700">
                      {formatarNumero(campanha.totalCadastrosBitrix)}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className="bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-md text-[11px]">
                        {formatarNumero(campanha.novosCpfsConquistados)}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className="bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded-md text-[10px] border border-amber-200">
                        {formatarNumero(campanha.cpfsPreexistentes)}
                      </span>
                    </td>

                    {/* Coluna ATIVADOS 1M */}
                    <td className="py-3 px-3 text-center">
                      <span className="font-extrabold text-[#004A6D]">
                        {formatarNumero(ativ1M)}
                      </span>
                      <span className="text-[10px] text-slate-500 ml-1">
                        ({taxaAtiv1M}%)
                      </span>
                    </td>

                    {/* Coluna ATIVADOS TOTAL */}
                    <td className="py-3 px-3 text-center">
                      <span className="font-extrabold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200 text-[11px]">
                        {formatarNumero(ativTot)}
                      </span>
                      <span className="text-[10px] text-slate-500 ml-1">
                        ({taxaAtivTot}%)
                      </span>
                    </td>

                    {/* Coluna CRÉDITO ESTIMADO */}
                    <td className="py-3 px-3 text-right font-bold text-slate-600">
                      {formatarMoeda(campanha.creditoEstimado)}
                    </td>

                    {/* Coluna CRÉDITO REALIZADO 1M */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      {cred1M > 0 ? (
                        <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                          {formatarMoeda(cred1M)}
                        </span>
                      ) : (
                        <span className="font-medium text-slate-400 text-[11px] italic">
                          R$ 0,00
                        </span>
                      )}
                    </td>

                    {/* Coluna CRÉDITO REALIZADO +1M (Retorno Histórico) */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      {credAcum > 0 ? (
                        <span className="font-extrabold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200">
                          {formatarMoeda(credAcum)}
                        </span>
                      ) : (
                        <span className="font-medium text-slate-400 text-[11px] italic">
                          R$ 0,00
                        </span>
                      )}
                    </td>

                    {/* Coluna PREVISÃO DE LIBERAÇÃO */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {isLiquidado ? (
                        <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-bold text-[10px] inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Liquidado
                        </span>
                      ) : (
                        <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md text-[10px] font-semibold inline-flex items-center gap-1">
                          <Hourglass className="w-3 h-3 text-amber-600" />
                          {campanha.mesPrevisaoLiberacao}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setCampanhaSelecionada(campanha);
                        }}
                        className="p-1 rounded-lg text-[#004A6D] hover:bg-[#D9FBFF] transition-colors"
                        title="Ver detalhes da ação"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {campanhasFiltradas.length === 0 && (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-slate-500 text-xs">
                    Nenhuma ação encontrada com os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. SEÇÃO CONSOLIDADA POR RESPONSÁVEL: POSICIONADA ABAIXO DA TABELA FIXA    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
        
        {/* Gráfico Comparativo por Responsável (5 colunas no desktop) */}
        <div ref={chartRespRef} className="lg:col-span-5 bg-white border border-[#BCD3DF]/60 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-[#F0F5F8]">
              <div>
                <h3 className="font-extrabold text-sm text-[#002A3A] flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#004A6D]" />
                  <span>Arrecadação & Novos CPFs por Responsável</span>
                </h3>
                <p className="text-[11px] text-[#004A6D]/70 mt-0.5">
                  Comparativo de captação entre os membros da equipe
                </p>
              </div>
              <CopyChartButton chartRef={chartRespRef} title="Comparativo_Responsaveis" />
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={resumoPorResponsavel} 
                  margin={{ top: 25, right: 10, left: -10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="responsavel" 
                    tick={{ fontSize: 11, fill: '#002A3A', fontWeight: 700 }}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: '#004A6D' }} 
                    tickFormatter={(val) => `${val}`}
                  />
                  <Tooltip 
                    formatter={(val: any, name: any) => {
                      const num = Number(val);
                      if (name === 'Crédito Estimado (R$)') return [formatarMoeda(num), name];
                      if (name === 'Crédito Realizado (R$)') return [formatarMoeda(num), name];
                      return [formatarNumero(num), name];
                    }}
                    contentStyle={{ 
                      backgroundColor: '#FFFFFF', 
                      borderRadius: '12px', 
                      border: '1px solid #BCD3DF', 
                      fontSize: '11px',
                      fontWeight: 'bold',
                      boxShadow: '0 8px 20px -4px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} 
                  />
                  <Bar dataKey="novosCpfsConquistados" name="Novos CPFs" fill="#004A6D" radius={[6, 6, 0, 0]}>
                    <LabelList 
                      dataKey="novosCpfsConquistados" 
                      position="top" 
                      style={{ fontSize: '11px', fill: '#004A6D', fontWeight: 800 }} 
                    />
                  </Bar>
                  <Bar dataKey="ativadosComCredito" name="Ativados SEFAZ" fill="#00E3E6" radius={[6, 6, 0, 0]}>
                    <LabelList 
                      dataKey="ativadosComCredito" 
                      position="top" 
                      style={{ fontSize: '11px', fill: '#007A7C', fontWeight: 800 }} 
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-2 border-t border-[#F0F5F8] text-[11px] text-slate-500 flex items-center justify-between">
            <span>Total da Equipe: <strong>{totaisEquipe.novosCpfsConquistados} novos CPFs</strong></span>
            <span className="font-bold text-emerald-700">Ativação Real: {totaisEquipe.novosCpfsConquistados > 0 ? ((totaisEquipe.ativadosComCredito / totaisEquipe.novosCpfsConquistados) * 100).toFixed(1) : 0}%</span>
          </div>
        </div>

        {/* Tabela Quantitativa Consolidada por Responsável (7 colunas no desktop) */}
        <div className="lg:col-span-7 bg-white border border-[#BCD3DF]/60 rounded-2xl shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 bg-slate-50 border-b border-[#BCD3DF]/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#004A6D]" />
                <h3 className="font-extrabold text-sm text-[#002A3A]">
                  Tabela Quantitativa Consolidada por Responsável
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-semibold">
                Clique na linha para filtrar as ações
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#BCD3DF]/60 bg-[#F4F9FA] text-[#004A6D] font-extrabold">
                    <th className="py-2.5 px-3">Responsável</th>
                    <th className="py-2.5 px-2 text-center">Ações</th>
                    <th className="py-2.5 px-2 text-center">Cadastros</th>
                    <th className="py-2.5 px-2 text-center">Novos CPFs</th>
                    <th className="py-2.5 px-2 text-center">Preexistentes</th>
                    <th className="py-2.5 px-2 text-center">Ativados 1M</th>
                    <th className="py-2.5 px-2 text-center">Ativados Total</th>
                    <th className="py-2.5 px-3 text-right">Crédito Est.</th>
                    <th className="py-2.5 px-3 text-right">Crédito Real 1M</th>
                    <th className="py-2.5 px-3 text-right">Crédito Real Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#BCD3DF]/30 font-medium text-[#002A3A]">
                  {resumoPorResponsavel.map((resp) => {
                    const isSelected = filtroResponsavel === resp.responsavel;

                    return (
                      <tr 
                        key={resp.responsavel}
                        onClick={() => setFiltroResponsavel(isSelected ? 'TODOS' : resp.responsavel)}
                        className={`transition-colors cursor-pointer group ${
                          isSelected 
                            ? 'bg-[#D9FBFF]/60 font-bold' 
                            : 'hover:bg-[#F6FAFD]'
                        }`}
                        title={`Clique para filtrar as ações de ${resp.responsavel}`}
                      >
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="w-6 h-6 rounded-lg bg-[#004A6D] text-white flex items-center justify-center font-bold text-[10px]">
                              {resp.responsavel[0]}
                            </span>
                            <span className="font-bold text-[#002A3A] group-hover:text-[#004A6D]">
                              {resp.responsavel}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-2 text-center font-bold text-slate-700">
                          {resp.totalAcoes}
                        </td>

                        <td className="py-3 px-2 text-center text-slate-600">
                          {formatarNumero(resp.totalCadastrosBitrix)}
                        </td>

                        <td className="py-3 px-2 text-center">
                          <span className="bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-md text-[11px]">
                            {formatarNumero(resp.novosCpfsConquistados)}
                          </span>
                        </td>

                        <td className="py-3 px-2 text-center">
                          <span className="bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded-md text-[10px] border border-amber-200">
                            {formatarNumero(resp.cpfsPreexistentes)}
                          </span>
                        </td>

                        <td className="py-3 px-2 text-center font-extrabold text-[#004A6D]">
                          {formatarNumero(resp.ativadosComCredito)}
                          <span className="text-[10px] font-normal text-slate-500 ml-1">
                            ({resp.taxaAtivacao.toFixed(0)}%)
                          </span>
                        </td>

                        <td className="py-3 px-2 text-center font-extrabold text-emerald-800">
                          {formatarNumero(resp.ativadosTotal)}
                          <span className="text-[10px] font-normal text-slate-500 ml-1">
                            ({resp.taxaAtivacaoTotal.toFixed(0)}%)
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right font-bold text-slate-600">
                          {formatarMoeda(resp.creditoEstimado)}
                        </td>

                        <td className="py-3 px-3 text-right">
                          {resp.creditoRealizado > 0 ? (
                            <span className="font-black text-emerald-700">
                              {formatarMoeda(resp.creditoRealizado)}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">
                              R$ 0,00
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right">
                          {resp.creditoRealizadoAcumulado > 0 ? (
                            <span className="font-black text-sky-800">
                              {formatarMoeda(resp.creditoRealizadoAcumulado)}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">
                              R$ 0,00
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

                {/* Rodapé Consolidado com Linha de Totais Gerais */}
                <tfoot>
                  <tr className="bg-[#002A3A] text-white font-extrabold border-t-2 border-[#00E3E6]">
                    <td className="py-2.5 px-3">
                      TOTAL GERAL DA EQUIPE
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      {totaisEquipe.totalAcoes}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      {formatarNumero(totaisEquipe.totalCadastrosBitrix)}
                    </td>
                    <td className="py-2.5 px-2 text-center text-[#00E3E6]">
                      {formatarNumero(totaisEquipe.novosCpfsConquistados)}
                    </td>
                    <td className="py-2.5 px-2 text-center text-amber-300">
                      {formatarNumero(totaisEquipe.cpfsPreexistentes)}
                    </td>
                    <td className="py-2.5 px-2 text-center text-[#00E3E6]">
                      {formatarNumero(totaisEquipe.ativadosComCredito)}
                    </td>
                    <td className="py-2.5 px-2 text-center text-emerald-300">
                      {formatarNumero(totaisEquipe.ativadosTotal)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-200">
                      {formatarMoeda(totaisEquipe.creditoEstimado)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#00E04B]">
                      {formatarMoeda(totaisEquipe.creditoRealizado)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#00E3E6]">
                      {formatarMoeda(totaisEquipe.creditoRealizadoAcumulado)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="p-3 bg-slate-50/70 border-t border-[#BCD3DF]/40 text-[11px] text-[#004A6D] flex items-center justify-between">
            <span>Dica: Clique no nome do responsável para filtrar a tabela detalhada acima.</span>
            {filtroResponsavel !== 'TODOS' && (
              <button
                onClick={() => setFiltroResponsavel('TODOS')}
                className="text-xs font-bold text-[#FD3168] hover:underline cursor-pointer"
              >
                Limpar Filtro ({filtroResponsavel})
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Modal de Detalhes da Ação Selecionada */}
      {campanhaSelecionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-[#BCD3DF] rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="bg-[#002A3A] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#00E3E6] uppercase tracking-wider block">
                  {campanhaSelecionada.id} • Bitrix24
                </span>
                <h3 className="font-extrabold text-base tracking-tight">
                  {campanhaSelecionada.nomeAcao}
                </h3>
              </div>
              <button
                onClick={() => setCampanhaSelecionada(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold block">Responsável:</span>
                  <span className="font-extrabold text-[#002A3A] text-xs">{campanhaSelecionada.responsavel}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold block">Data de Início:</span>
                  <span className="font-extrabold text-[#002A3A] text-xs">
                    {campanhaSelecionada.dataInicio.split('-').reverse().join('/')}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold block">Status da Ação:</span>
                  <span className="font-extrabold text-[#004A6D] text-xs">{campanhaSelecionada.status}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold block">Previsão SEFAZ:</span>
                  <span className="font-extrabold text-slate-700 text-xs">{campanhaSelecionada.mesPrevisaoLiberacao}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[11px] text-slate-500 font-semibold block">Local / Contexto:</span>
                  <span className="font-semibold text-slate-700">{campanhaSelecionada.localOuParceiro}</span>
                </div>
              </div>

              {campanhaSelecionada.descricao && (
                <div className="text-slate-600 bg-sky-50/50 p-3 rounded-xl border border-sky-100">
                  <strong className="text-[#004A6D] block mb-0.5">Descrição da Ação:</strong>
                  {campanhaSelecionada.descricao}
                </div>
              )}

              {/* Confronto Financeiro: Estimado vs Realizado */}
              <div className="bg-[#F4F9FA] border border-[#BCD3DF] rounded-2xl p-3.5 space-y-2">
                <h4 className="font-extrabold text-[#002A3A] flex items-center justify-between">
                  <span>Confronto Financeiro (SEFAZ):</span>
                  <span className="text-[11px] text-slate-500 font-normal">Base: 9,28 cup. × R$ 5,72 = R$ 53,08 / doador</span>
                </h4>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">Crédito Estimado:</span>
                    <strong className="text-sm text-slate-700 font-black">
                      {formatarMoeda(campanhaSelecionada.creditoEstimado)}
                    </strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">Crédito Realizado:</span>
                    <strong className="text-sm text-emerald-700 font-black">
                      {formatarMoeda(campanhaSelecionada.creditoRealizado)}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-2">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-extrabold text-[#002A3A]">Auditoria de Conversão e Mérito:</h4>
                  {campanhaSelecionada.cpfsDetalhes && campanhaSelecionada.cpfsDetalhes.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setOcultarCpf(!ocultarCpf)}
                      className="text-[11px] font-bold px-2.5 py-1 bg-[#D9FBFF] hover:bg-[#bceef5] text-[#004A6D] rounded-lg border border-[#00E3E6]/40 flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Alternar privacidade visual dos CPFs para apresentações"
                    >
                      {ocultarCpf ? '👁️ Exibir CPFs Completos' : '🙈 Ocultar CPFs (Mascara)'}
                    </button>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                    <span className="font-bold text-emerald-900">Novos CPFs (Sem histórico prévio na SEFAZ):</span>
                    <strong className="text-emerald-800">{campanhaSelecionada.novosCpfsConquistados}</strong>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-amber-50 border border-amber-100">
                    <span className="font-bold text-amber-900">CPFs Preexistentes (Já tinham doações anteriores):</span>
                    <strong className="text-amber-800">{campanhaSelecionada.cpfsPreexistentes}</strong>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-sky-50 border border-sky-100">
                    <span className="font-bold text-[#004A6D]">Ativados com Compras Registradas na SEFAZ:</span>
                    <strong className="text-[#004A6D]">{campanhaSelecionada.ativadosComCredito}</strong>
                  </div>
                </div>
              </div>

              {/* Tabela de Auditoria Individual dos CPFs da Ação */}
              {campanhaSelecionada.cpfsDetalhes && campanhaSelecionada.cpfsDetalhes.length > 0 ? (
                <div className="border border-[#BCD3DF] rounded-2xl overflow-hidden bg-white mt-3">
                  <div className="p-3 bg-slate-50 border-b border-[#BCD3DF]/60 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#004A6D]" />
                      <strong className="text-xs text-[#002A3A]">
                        Doadores Registrados nesta Ação ({campanhaSelecionada.cpfsDetalhes.length} CPFs)
                      </strong>
                    </div>
                    <div className="w-full sm:w-48">
                      <input
                        type="text"
                        placeholder="Buscar CPF ou nome..."
                        value={termoBuscaCpf}
                        onChange={(e) => setTermoBuscaCpf(e.target.value)}
                        className="w-full text-[11px] px-2.5 py-1 rounded-lg border border-slate-300 focus:outline-hidden focus:border-[#004A6D] bg-white"
                      />
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-[#F4F9FA] text-[10px] uppercase font-bold text-slate-500 sticky top-0">
                        <tr>
                          <th className="py-2 px-3">Nome / Contato</th>
                          <th className="py-2 px-3">CPF</th>
                          <th className="py-2 px-3 text-center">Mérito SEFAZ</th>
                          <th className="py-2 px-3 text-center">Ativação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {campanhaSelecionada.cpfsDetalhes
                          .filter(item => {
                            if (!termoBuscaCpf.trim()) return true;
                            const t = termoBuscaCpf.toLowerCase();
                            return (item.nome || '').toLowerCase().includes(t) || item.cpf.includes(t);
                          })
                          .map((item, idx) => {
                            const cpfExibido = ocultarCpf
                              ? item.cpf.length >= 11
                                ? `***.${item.cpf.slice(3, 6)}.${item.cpf.slice(6, 9)}-**`
                                : '***.***.***-**'
                              : item.cpf.length === 11
                              ? `${item.cpf.slice(0, 3)}.${item.cpf.slice(3, 6)}.${item.cpf.slice(6, 9)}-${item.cpf.slice(9, 11)}`
                              : item.cpf;

                            return (
                              <tr key={idx} className="hover:bg-sky-50/50 transition-colors">
                                <td className="py-2 px-3">
                                  <span className="font-bold text-[#002A3A] block truncate max-w-[200px]">
                                    {item.nome || 'Doador Sem Nome'}
                                  </span>
                                  {item.fone && (
                                    <span className="text-[10px] text-slate-400 font-mono">{item.fone}</span>
                                  )}
                                </td>
                                <td className="py-2 px-3 font-mono font-semibold text-slate-700">
                                  {cpfExibido}
                                </td>
                                <td className="py-2 px-3 text-center">
                                  {item.statusMerito === 'NOVO' ? (
                                    <span className="bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded text-[10px]">
                                      NOVO
                                    </span>
                                  ) : (
                                    <span className="bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded text-[10px]">
                                      PREEXISTENTE
                                    </span>
                                  )}
                                </td>
                                <td className="py-2 px-3 text-center">
                                  {item.ativado ? (
                                    <span className="text-emerald-700 font-black text-[11px] flex items-center justify-center gap-1">
                                      <CheckCircle2 className="w-3.5 h-3.5" /> Ativo
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 text-[10px] italic">
                                      Em Apuração
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-500 text-[11px]">
                  Cadastro agrupado via Bitrix sem registros individuais de CPF em lote.
                </div>
              )}

              <div className="pt-2 flex justify-between items-center">
                <span className="text-[10px] text-slate-400">
                  Dados auditados com a base oficial SEFAZ no Supabase
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setCampanhaSelecionada(null);
                    setTermoBuscaCpf('');
                  }}
                  className="bg-[#004A6D] hover:bg-[#002A3A] text-white font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Fechar Visualização
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
