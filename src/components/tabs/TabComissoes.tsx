import React, { useState, useMemo } from 'react';
import { 
  BadgePercent, 
  Search, 
  Download, 
  Users, 
  Receipt, 
  DollarSign, 
  Store,
  ChevronRight,
  ChevronDown,
  Loader2,
  Building2,
  Filter,
  CheckCircle2,
  Calendar,
  AlertCircle,
  TrendingUp,
  Award
} from 'lucide-react';
import { KPICard } from '../KPICard';
import { BrandBadge } from '../BrandBadge';
import { MetricaMensal, EmpresaParceira, VENDEDORES_MAP } from '../../types';
import { formatarMoeda, formatarNumero } from '../../data/mockDatabase';
import { useSupabaseEmpresas } from '../../hooks/useSupabaseEmpresas';

interface TabComissoesProps {
  metricasFiltradas?: MetricaMensal[];
  selectedYears?: number[];
  selectedMonths?: number[];
}

const NOMES_MESES = [
  '', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const TabComissoes: React.FC<TabComissoesProps> = ({
  metricasFiltradas = [],
  selectedYears = [2026],
  selectedMonths = []
}) => {
  const { topEmpresas, isLoading } = useSupabaseEmpresas({
    selectedYears,
    selectedMonths,
    limit: 10000
  });

  const [selectedVendedor, setSelectedVendedor] = useState<string>('TODOS');
  const [filtroTipo, setFiltroTipo] = useState<'TODAS' | 'NOVAS' | 'RECORRENTES'>('TODAS');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<'sintetico' | 'evolucao' | 'analitico'>('sintetico');

  // Valores Oficiais da Tela de Desempenho (Consolidado Institucional)
  const totalDesempenhoCreditos = metricasFiltradas.reduce((acc, m) => acc + m.creditoTotal, 0);
  const totalDesempenhoUrnas = metricasFiltradas.reduce((acc, m) => acc + m.creditoUrnas, 0);
  const totalDesempenhoDireta = metricasFiltradas.reduce((acc, m) => acc + m.creditoDoacao, 0);
  const totalDesempenhoAuto = metricasFiltradas.reduce((acc, m) => acc + m.creditoAutomatica, 0);
  const totalDesempenhoCupons = metricasFiltradas.reduce((acc, m) => acc + m.cuponsValidos, 0);
  const baseComercialTotal = totalDesempenhoUrnas + totalDesempenhoDireta;

  // IDs considerados comissionáveis
  const VENDEDORES_COMISSIONAVEIS_IDS = [1, 2, 3, 4, 6, 7, 8, 9, 10];

  // Identifica os meses presentes na filtragem atual
  const mesesAtivos = useMemo(() => {
    if (selectedMonths && selectedMonths.length > 0) {
      return [...selectedMonths].sort((a, b) => a - b);
    }
    return [1, 2, 3, 4, 5, 6]; // Padrão 1º semestre
  }, [selectedMonths]);

  // 1. Agrupamento e Cálculo Cronológico Mês a Mês
  const { 
    resumoVendedores, 
    empresasComVendedor, 
    saldoSemVendedor, 
    kpisEquipe,
    evolucaoMensalVendedores,
    comissaoCoordenacaoPorMes,
    totalComissaoCoordenacao,
    comissoesPorEmpresa
  } = useMemo(() => {
    const mapaVendedores = new Map<number, {
      idVendedor: number;
      nomeVendedor: string;
      totalLojas: number;
      lojasNovas: number;
      lojasRecorrentes: number;
      creditoNovas: number;
      creditoRecorrente: number;
      comissaoNovas: number;
      comissaoRecorrente: number;
      comissaoTotal: number;
      lojasAtivasComCredito: number;
      creditoCadastro: number;
      creditoAuto: number;
      totalCupons: number;
      totalCredito: number;
      comissaoPorMes: Record<number, number>;
      creditoPorMes: Record<number, number>;
    }>();

    // Apenas CNPJs com Vendedor Elegível
    const filtradas = topEmpresas.filter(emp => {
      const vId = emp.idVendedor;
      return vId !== null && vId !== undefined && vId > 0 && VENDEDORES_COMISSIONAVEIS_IDS.includes(vId);
    });
    const comissoesPorEmpresa = new Map<string, { comissao: number; isNova: boolean; isAbertura?: boolean }>();

    filtradas.forEach(emp => {
      const vId = emp.idVendedor!;
      const nome = VENDEDORES_MAP[vId] || `Vendedor #${vId}`;

      if (!mapaVendedores.has(vId)) {
        mapaVendedores.set(vId, {
          idVendedor: vId,
          nomeVendedor: nome,
          totalLojas: 0,
          lojasNovas: 0,
          lojasRecorrentes: 0,
          creditoNovas: 0,
          creditoRecorrente: 0,
          comissaoNovas: 0,
          comissaoRecorrente: 0,
          comissaoTotal: 0,
          lojasAtivasComCredito: 0,
          creditoCadastro: 0,
          creditoAuto: 0,
          totalCupons: 0,
          totalCredito: 0,
          comissaoPorMes: {},
          creditoPorMes: {}
        });
      }

      const v = mapaVendedores.get(vId)!;
      v.totalLojas += 1;
      if (emp.creditoTotal > 0) {
        v.lojasAtivasComCredito += 1;
      }
      
      const valorCadastro = Number(emp.creditoUrnas || (emp.creditoTotal - emp.creditoDoacoes) || 0);
      const valorDireta = Number(emp.creditoDoacoes || 0);
      const credLojaTotal = Number(emp.creditoTotal || 0);

      v.creditoCadastro += valorCadastro;
      v.creditoAuto += valorDireta;
      v.totalCupons += Number(emp.cuponsValidos || 0);
      v.totalCredito += credLojaTotal;

      // -------------------------------------------------------------
      // REGRA OFICIAL DE NOVAS (1,0% ABERTURA) vs RECORRENTES (0,5% MANUTENÇÃO)
      // * 1% só é pago se o vendedor atual for quem abriu a empresa (idVendedor === idVendedorAbertura).
      // -------------------------------------------------------------
      // REGRA OFICIAL DE ABERTURA (1,0%) vs RECORRENTES (0,5%)
      // * 1% é pago para as empresas onde o vendedor atual é quem abriu (idVendedor === idVendedorAbertura).
      // * Se o vendedor NÃO foi quem abriu, ela é tratada como recorrente (0,5%).
      // -------------------------------------------------------------
      const anoBase = selectedYears[0] || 2026;
      const dMensais = emp.dadosMensais || {};

      const isVendedorAbertura = Boolean(
        emp.idVendedor &&
        emp.idVendedorAbertura &&
        Number(emp.idVendedor) === Number(emp.idVendedorAbertura)
      );

      let lojaComissaoNovasAcum = 0;
      let lojaComissaoRecorrAcum = 0;
      let lojaCreditoNovasAcum = 0;
      let lojaCreditoRecorrAcum = 0;

      // Cálculo financeiro mês a mês
      mesesAtivos.forEach(m => {
        const dadosDoMes = dMensais[m];
        if (!dadosDoMes || (dadosDoMes.credito || 0) <= 0) return;

        const credMes = Number(dadosDoMes.credito || 0);
        v.creditoPorMes[m] = (v.creditoPorMes[m] || 0) + credMes;

        if (isVendedorAbertura) {
          // Vendedor que abriu a empresa recebe 1,0% (Abertura / Novas)
          const comissaoMes = credMes * 0.01;
          lojaCreditoNovasAcum += credMes;
          lojaComissaoNovasAcum += comissaoMes;
          v.comissaoPorMes[m] = (v.comissaoPorMes[m] || 0) + comissaoMes;
        } else {
          // Vendedor que não abriu recebe 0,5% (Recorrente de Manutenção)
          const comissaoMes = credMes * 0.005;
          lojaCreditoRecorrAcum += credMes;
          lojaComissaoRecorrAcum += comissaoMes;
          v.comissaoPorMes[m] = (v.comissaoPorMes[m] || 0) + comissaoMes;
        }
      });

      if (isVendedorAbertura) {
        v.lojasNovas += 1;
      } else {
        v.lojasRecorrentes += 1;
      }

      v.creditoNovas += lojaCreditoNovasAcum;
      v.creditoRecorrente += lojaCreditoRecorrAcum;
      v.comissaoNovas += lojaComissaoNovasAcum;
      v.comissaoRecorrente += lojaComissaoRecorrAcum;
      v.totalCredito = v.creditoNovas + v.creditoRecorrente;
      v.comissaoTotal = v.comissaoNovas + v.comissaoRecorrente;

      comissoesPorEmpresa.set(emp.id, {
        comissao: lojaComissaoNovasAcum + lojaComissaoRecorrAcum,
        isNova: isVendedorAbertura,
        isAbertura: isVendedorAbertura
      });
    });

    // Mapear também as empresas sem vendedor ou de outros captadores para o mapa global
    let saldoLojasNovas = 0;
    const anoBaseGlobal = selectedYears[0] || 2026;
    topEmpresas.forEach(emp => {
      const vId = emp.idVendedor;
      const temVendedorComiss = vId !== null && vId !== undefined && vId > 0 && VENDEDORES_COMISSIONAVEIS_IDS.includes(vId);
      const isNovaGeral = mesesAtivos.some(m => emp.dataInicio === `${anoBaseGlobal}-${String(m).padStart(2, '0')}`);
      
      if (!temVendedorComiss) {
        if (isNovaGeral) {
          saldoLojasNovas += 1;
        }
        comissoesPorEmpresa.set(emp.id, {
          comissao: 0,
          isNova: isNovaGeral
        });
      }
    });

    const listaResumo = Array.from(mapaVendedores.values()).sort((a, b) => b.totalCredito - a.totalCredito);

    const somaComissionavelNovas = listaResumo.reduce((acc, curr) => acc + curr.creditoNovas, 0);
    const somaComissionavelRecorr = listaResumo.reduce((acc, curr) => acc + curr.creditoRecorrente, 0);
    const somaComissionavelCredito = somaComissionavelNovas + somaComissionavelRecorr;
    const somaComissionavelCad = listaResumo.reduce((acc, curr) => acc + curr.creditoCadastro, 0);
    const somaComissionavelDireta = listaResumo.reduce((acc, curr) => acc + curr.creditoAuto, 0);
    const somaComissionavelCupons = listaResumo.reduce((acc, curr) => acc + curr.totalCupons, 0);

    const totalComissaoNovas = listaResumo.reduce((acc, curr) => acc + curr.comissaoNovas, 0);
    const totalComissaoRecorrente = listaResumo.reduce((acc, curr) => acc + curr.comissaoRecorrente, 0);
    const totalComissaoVendedores = listaResumo.reduce((acc, curr) => acc + curr.comissaoTotal, 0);

    // -------------------------------------------------------------
    // FRENTE 4: COMISSÃO DA COORDENAÇÃO DO PROGRAMA NFP
    // -------------------------------------------------------------
    const BASE_FIXA_2025_MENSAL = 53025.14;
    const calcAliquotaCoord = (base: number) => {
      if (base < 230000) return 0.04;
      if (base < 280000) return 0.05;
      if (base < 330000) return 0.06;
      if (base < 380000) return 0.07;
      if (base < 430000) return 0.08;
      if (base < 480000) return 0.09;
      return 0.10;
    };

    const comissaoCoordMes: Record<number, { baseElegivel: number; aliquota: number; valorComissao: number }> = {};
    let totalComissaoCoordAcum = 0;

    mesesAtivos.forEach(m => {
      const mObj = metricasFiltradas.find(item => {
        const mesItem = typeof item.mes === 'string' ? parseInt(item.mes.slice(5, 7), 10) : item.mes;
        return mesItem === m;
      });

      const credMesSefaz = mObj ? (mObj.creditoUrnas + mObj.creditoDoacao) : (baseComercialTotal / Math.max(1, mesesAtivos.length));
      const baseElegivelMes = credMesSefaz + BASE_FIXA_2025_MENSAL;
      const aliquota = calcAliquotaCoord(baseElegivelMes);
      const valorComissao = baseElegivelMes * aliquota;

      comissaoCoordMes[m] = {
        baseElegivel: baseElegivelMes,
        aliquota,
        valorComissao
      };
      totalComissaoCoordAcum += valorComissao;
    });

    // Saldo que não tem vendedor ou é consumo (para bater 100% com o Desempenho)
    const saldoLojas = Math.max(0, topEmpresas.length - filtradas.length);
    const saldoCad = Math.max(0, totalDesempenhoUrnas - somaComissionavelCad);
    const saldoDireta = Math.max(0, totalDesempenhoDireta - somaComissionavelDireta);
    const saldoCredito = Math.max(0, baseComercialTotal - somaComissionavelCredito);
    const saldoCupons = Math.max(0, totalDesempenhoCupons - somaComissionavelCupons);

    const kpis = {
      totalCredito: baseComercialTotal > 0 ? baseComercialTotal : somaComissionavelCredito,
      totalCreditoCadastro: totalDesempenhoUrnas > 0 ? totalDesempenhoUrnas : somaComissionavelCad,
      totalCreditoDireta: totalDesempenhoDireta > 0 ? totalDesempenhoDireta : somaComissionavelDireta,
      totalCupons: totalDesempenhoCupons > 0 ? totalDesempenhoCupons : somaComissionavelCupons,
      totalLojas: topEmpresas.length,
      lojasComVendedor: filtradas.length,
      vendedoresAtivos: listaResumo.length,
      totalComissaoVendedores,
      totalComissaoNovas,
      totalComissaoRecorrente,
      totalComissaoCoordenacao: totalComissaoCoordAcum,
      totalComissaoGeral: totalComissaoVendedores + totalComissaoCoordAcum
    };

    return {
      resumoVendedores: listaResumo,
      empresasComVendedor: filtradas,
      saldoSemVendedor: {
        totalLojas: saldoLojas,
        lojasNovas: saldoLojasNovas,
        lojasRecorrentes: Math.max(0, saldoLojas - saldoLojasNovas),
        creditoCadastro: saldoCad,
        creditoDireta: saldoDireta,
        totalCredito: saldoCredito,
        totalCupons: saldoCupons
      },
      kpisEquipe: kpis,
      evolucaoMensalVendedores: listaResumo,
      comissaoCoordenacaoPorMes: comissaoCoordMes,
      totalComissaoCoordenacao: totalComissaoCoordAcum,
      comissoesPorEmpresa
    };
  }, [topEmpresas, totalDesempenhoUrnas, totalDesempenhoDireta, baseComercialTotal, totalDesempenhoCupons, mesesAtivos, metricasFiltradas, totalDesempenhoCreditos]);

  // 2. Filtragem de CNPJs para a tabela analítica
  const empresasExibidas = useMemo(() => {
    return topEmpresas.filter(emp => {
      const vId = emp.idVendedor;
      const temVendedorComiss = vId !== null && vId !== undefined && vId > 0 && VENDEDORES_COMISSIONAVEIS_IDS.includes(vId);

      if (selectedVendedor !== 'TODOS') {
        if (selectedVendedor === 'SEM_VENDEDOR') {
          if (temVendedorComiss) return false;
        } else if (String(vId) !== selectedVendedor) {
          return false;
        }
      }

      const dadosCalc = comissoesPorEmpresa?.get(emp.id);
      const isNova = dadosCalc ? dadosCalc.isNova : false;

      if (filtroTipo === 'NOVAS' && !isNova) return false;
      if (filtroTipo === 'RECORRENTES' && isNova) return false;

      if (searchTerm.trim()) {
        const s = searchTerm.trim().toLowerCase();
        const cnpjClean = emp.cnpj.replace(/\D/g, '');
        const sClean = s.replace(/\D/g, '');
        const matchCnpj = (sClean && cnpjClean.includes(sClean)) || emp.cnpj.toLowerCase().includes(s);
        const matchNome = emp.razaoSocial.toLowerCase().includes(s) || emp.nomeFantasia.toLowerCase().includes(s);
        return matchCnpj || matchNome;
      }
      return true;
    }).sort((a, b) => b.creditoTotal - a.creditoTotal);
  }, [topEmpresas, selectedVendedor, filtroTipo, searchTerm, comissoesPorEmpresa, VENDEDORES_COMISSIONAVEIS_IDS]);

  // Exportação CSV
  const exportarCSV = () => {
    if (activeSubTab === 'sintetico') {
      const headers = [
        'ID Vendedor',
        'Vendedor',
        'Qtd Lojas',
        'Lojas Novas',
        'Crédito Novas (R$)',
        'Comissão Novas 1% (R$)',
        'Lojas Recorrentes',
        'Crédito Recorrente (R$)',
        'Comissão Recorr. 0.5% (R$)',
        'Crédito Total (R$)',
        'Comissão Total Vendedor (R$)'
      ];
      const rows = resumoVendedores.map(v => [
        v.idVendedor,
        `"${v.nomeVendedor}"`,
        v.totalLojas,
        v.lojasNovas,
        v.creditoNovas.toFixed(2),
        v.comissaoNovas.toFixed(2),
        v.lojasRecorrentes,
        v.creditoRecorrente.toFixed(2),
        v.comissaoRecorrente.toFixed(2),
        v.totalCredito.toFixed(2),
        v.comissaoTotal.toFixed(2)
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `comissao_resumo_vendedores_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (activeSubTab === 'evolucao') {
      const headers = ['Vendedor', ...mesesAtivos.map(m => NOMES_MESES[m] || `Mês ${m}`), 'Total Acumulado (R$)'];
      const rows = evolucaoMensalVendedores.map(v => [
        `"${v.nomeVendedor}"`,
        ...mesesAtivos.map(m => (v.comissaoPorMes[m] || 0).toFixed(2)),
        v.comissaoTotal.toFixed(2)
      ]);
      // Linha da Coordenação
      rows.push([
        '"Coordenação do Programa NFP"',
        ...mesesAtivos.map(m => (comissaoCoordenacaoPorMes[m]?.valorComissao || 0).toFixed(2)),
        totalComissaoCoordenacao.toFixed(2)
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `comissao_evolucao_mensal_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const headers = [
        'CNPJ',
        'Razão Social',
        'Nome Fantasia',
        'Data Início (1º Mês)',
        'ID Vendedor',
        'Vendedor',
        'Classificação',
        'Alíquota (%)',
        'Cupons',
        'Crédito Cadastro (R$)',
        'Doação Direta (R$)',
        'Crédito Total (R$)',
        'Comissão Calculada (R$)'
      ];
      const rows = empresasExibidas.map(e => {
        const dadosCalc = comissoesPorEmpresa?.get(e.id);
        const isNova = dadosCalc ? dadosCalc.isNova : (e.tipo === 'NOVO');
        const comissao = dadosCalc ? dadosCalc.comissao : (e.creditoTotal * (isNova ? 0.01 : 0.005));
        const aliquota = isNova ? '1,0%' : '0,5%';
        return [
          `"${e.cnpj}"`,
          `"${e.razaoSocial.replace(/"/g, '""')}"`,
          `"${e.nomeFantasia.replace(/"/g, '""')}"`,
          e.dataInicio || '2025-01',
          e.idVendedor || '',
          `"${e.nomeVendedor || ''}"`,
          isNova ? 'NOVA (1º MÊS)' : 'RECORRENTE (MANUTENÇÃO)',
          aliquota,
          e.cuponsValidos,
          e.creditoUrnas.toFixed(2),
          e.creditoDoacoes.toFixed(2),
          e.creditoTotal.toFixed(2),
          comissao.toFixed(2)
        ];
      });
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `comissao_analitico_carteiras_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4 bg-white border border-[#BCD3DF]/60 rounded-2xl shadow-2xs">
        <Loader2 className="w-10 h-10 text-[#004A6D] animate-spin" />
        <p className="text-sm font-bold text-[#002A3A]">
          Carregando dados das carteiras e comissões da SEFAZ...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Descrição e Avisos */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#BCD3DF]/60 p-5 rounded-2xl shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#EDCD01]/20 text-[#002A3A]">
              <BadgePercent className="w-5 h-5 text-[#004A6D]" />
            </span>
            <h1 className="text-xl font-black text-[#002A3A] tracking-tight">
              Apuração de Comissões & Bonificações NFP
            </h1>
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-[#00E04B]/20 text-[#006E24] border border-[#00E04B]/40">
              Política Oficial 2026
            </span>
          </div>
          <p className="text-xs text-[#004A6D]/80 mt-1 max-w-3xl">
            Cálculo oficial de remuneração variável conforme a Política NFP Vocação. As lojas são tratadas como <strong>Novas (1,0%)</strong> quando o vendedor atual é o <strong>vendedor de abertura</strong> (<code className="text-[10px] bg-slate-100 px-1 py-0.5 rounded">id_vendedor == id_vendedor_abertura</code>); caso contrário, são comissionadas como <strong>Recorrentes (0,5%)</strong>.
          </p>
        </div>

        {/* Botão de Exportação */}
        <button
          onClick={exportarCSV}
          disabled={isLoading || resumoVendedores.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#004A6D] text-white hover:bg-[#002A3A] text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0 disabled:opacity-50"
        >
          <Download className="w-4 h-4 text-[#00E3E6]" />
          <span>
            Exportar ({activeSubTab === 'sintetico' ? 'Resumo' : activeSubTab === 'evolucao' ? 'Grade Mensal' : 'Analítico'})
          </span>
        </button>
      </div>

      {/* Alerta de Governança sobre Fechamento Mensal */}
      {mesesAtivos.length > 1 ? (
        <div className="bg-amber-50/80 border border-amber-300 p-3.5 rounded-xl text-xs text-amber-900 flex items-start sm:items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
          <div className="flex-1">
            <span className="font-bold">Modo Acumulado ({mesesAtivos.length} meses selecionados):</span> Você está visualizando o demonstrativo consolidado de {NOMES_MESES[mesesAtivos[0]]} até {NOMES_MESES[mesesAtivos[mesesAtivos.length - 1]]}. O sistema calculou a comissão de cada loja mês a mês de forma cronológica exata. Para a folha de pagamento oficial de um fechamento, filtre um único mês.
          </div>
        </div>
      ) : (
        <div className="bg-[#D9FBFF]/40 border border-[#00E3E6]/60 p-3 rounded-xl text-xs text-[#002A3A] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#006E24] shrink-0" />
          <span>
            <strong>Competência Fechada:</strong> Apuração mensal de <strong>{NOMES_MESES[mesesAtivos[0]]}/{selectedYears[0] || 2026}</strong> pronta para liquidação financeira.
          </span>
        </div>
      )}

      {/* Cards de KPIs Principais (Equipe Comercial) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          id="kpi-comissao-total-equipe"
          title="Total Comissões Equipe Comercial"
          value={formatarMoeda(kpisEquipe.totalComissaoVendedores)}
          subValue={`Novas (1%): ${formatarMoeda(kpisEquipe.totalComissaoNovas)} | Recorr. (0,5%): ${formatarMoeda(kpisEquipe.totalComissaoRecorrente)}`}
          icon={Award}
          iconBgColor="bg-[#EDCD01]/20"
          iconColor="text-[#002A3A]"
        />

        <KPICard
          id="kpi-comissao-novas"
          title="Comissão Lojas Novas (1,0%)"
          value={formatarMoeda(kpisEquipe.totalComissaoNovas)}
          subValue={`Lojas abertas pelo captador oficial`}
          icon={BadgePercent}
          iconBgColor="bg-[#00E04B]/20"
          iconColor="text-[#006E24]"
        />

        <KPICard
          id="kpi-comissao-base-comercial"
          title="Base Comercial (Desempenho)"
          value={formatarMoeda(kpisEquipe.totalCredito)}
          subValue={`${formatarNumero(kpisEquipe.lojasComVendedor)} lojas atreladas a ${kpisEquipe.vendedoresAtivos} captadores`}
          icon={DollarSign}
          iconBgColor="bg-[#FD3168]/20"
          iconColor="text-[#FD3168]"
        />
      </div>

      {/* Barra de Filtros e Alternância de Visualização */}
      <div className="bg-white border border-[#BCD3DF]/60 p-4 rounded-2xl shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Seletor de Abas Internas */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F4F9FA] rounded-xl border border-[#BCD3DF]/50 w-full sm:w-auto">
            <button
              onClick={() => setActiveSubTab('sintetico')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'sintetico'
                  ? 'bg-[#004A6D] text-white shadow-2xs'
                  : 'text-[#004A6D] hover:bg-[#D9FBFF]/60'
              }`}
            >
              📊 Resumo por Vendedor
            </button>
            <button
              onClick={() => setActiveSubTab('evolucao')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'evolucao'
                  ? 'bg-[#004A6D] text-white shadow-2xs'
                  : 'text-[#004A6D] hover:bg-[#D9FBFF]/60'
              }`}
            >
              📅 Evolução Mensal (Grade)
            </button>
            <button
              onClick={() => setActiveSubTab('analitico')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'analitico'
                  ? 'bg-[#004A6D] text-white shadow-2xs'
                  : 'text-[#004A6D] hover:bg-[#D9FBFF]/60'
              }`}
            >
              🏢 Analítico por CNPJ ({empresasExibidas.length})
            </button>
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
            {/* Filtro Rápido de Novas vs Recorrentes no Analítico */}
            {activeSubTab === 'analitico' && (
              <div className="flex items-center gap-1 p-0.5 bg-[#F4F9FA] rounded-xl border border-[#BCD3DF]/50">
                <button
                  onClick={() => setFiltroTipo('TODAS')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filtroTipo === 'TODAS'
                      ? 'bg-[#004A6D] text-white shadow-2xs'
                      : 'text-[#004A6D] hover:bg-[#D9FBFF]/60'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setFiltroTipo('NOVAS')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    filtroTipo === 'NOVAS'
                      ? 'bg-[#00E04B] text-[#002A3A] shadow-xs'
                      : 'text-[#006E24] bg-[#00E04B]/20 hover:bg-[#00E04B]/30'
                  }`}
                >
                  <span>⭐ Novas do Mês</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-white text-[#006E24] text-[10px] font-black">
                    {resumoVendedores.reduce((acc, v) => acc + v.lojasNovas, 0) + saldoSemVendedor.lojasNovas}
                  </span>
                </button>
                <button
                  onClick={() => setFiltroTipo('RECORRENTES')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filtroTipo === 'RECORRENTES'
                      ? 'bg-[#004A6D] text-white shadow-2xs'
                      : 'text-[#004A6D] hover:bg-[#D9FBFF]/60'
                  }`}
                >
                  Recorrentes
                </button>
              </div>
            )}

            {/* Seletor de Vendedor */}
            <div className="relative w-full sm:w-60">
              <select
                value={selectedVendedor}
                onChange={e => setSelectedVendedor(e.target.value)}
                className="w-full pl-3 pr-8 py-2 bg-white border border-[#BCD3DF] rounded-xl text-xs font-bold text-[#002A3A] focus:outline-none focus:ring-2 focus:ring-[#00E3E6] appearance-none cursor-pointer"
              >
                <option value="TODOS">Todos os Vendedores ({resumoVendedores.length})</option>
                {resumoVendedores.map(v => (
                  <option key={v.idVendedor} value={String(v.idVendedor)}>
                    {v.nomeVendedor} (Comissão: {formatarMoeda(v.comissaoTotal)})
                  </option>
                ))}
                <option value="SEM_VENDEDOR">
                  Sem Vendedor / Não Comissionável ({saldoSemVendedor.totalLojas})
                </option>
              </select>
              <ChevronDown className="w-4 h-4 text-[#004A6D] absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Campo de Busca (para analítico) */}
            {activeSubTab === 'analitico' && (
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-[#004A6D]/60 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar CNPJ ou Empresa..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#BCD3DF] rounded-xl text-xs text-[#002A3A] placeholder-[#004A6D]/50 focus:outline-none focus:ring-2 focus:ring-[#00E3E6]"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Visualização 1: Tabela Sintética por Vendedor */}
      {activeSubTab === 'sintetico' && (
        <div className="bg-white border border-[#BCD3DF]/60 rounded-2xl shadow-2xs overflow-hidden">
          <div className="px-5 py-4 border-b border-[#BCD3DF]/50 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-[#002A3A]">
                Demonstrativo de Comissões por Vendedor (Frente Cadastro)
              </h2>
              <p className="text-[11px] text-[#004A6D]/70">
                Regra oficial: 1,0% sobre captação de novos e 0,5% sobre manutenção da carteira existente.
              </p>
            </div>
            <span className="text-xs text-[#004A6D]/70 font-semibold">
              Ordenado por Crédito Total Decrescente
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F9FA] text-[#004A6D] border-b border-[#BCD3DF]/50 uppercase tracking-wider text-[11px] font-black">
                <tr>
                  <th className="py-3 px-4">Vendedor / Captador</th>
                  <th className="py-3 px-3 text-center">Lojas Totais</th>
                  <th className="py-3 px-3 text-center">Novas (1%)</th>
                  <th className="py-3 px-3 text-right">Crédito Novas</th>
                  <th className="py-3 px-3 text-right text-[#006E24]">Comissão Novas (1%)</th>
                  <th className="py-3 px-3 text-center">Recorr. (0,5%)</th>
                  <th className="py-3 px-3 text-right">Crédito Recorr.</th>
                  <th className="py-3 px-3 text-right text-[#004A6D]">Comissão Recorr. (0,5%)</th>
                  <th className="py-3 px-3 text-right bg-[#D9FBFF]/30 text-[#002A3A]">Crédito Total</th>
                  <th className="py-3 px-4 text-right bg-[#EDCD01]/20 text-[#002A3A] font-black">Comissão Total (R$)</th>
                  <th className="py-3 px-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#BCD3DF]/30 font-medium">
                {resumoVendedores.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-8 text-center text-[#004A6D]/60 font-semibold">
                      Nenhum dado encontrado para os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  resumoVendedores.map(v => (
                    <tr 
                      key={v.idVendedor} 
                      className="hover:bg-[#F4F9FA]/80 transition-colors"
                    >
                      <td className="py-3 px-4 font-bold text-[#002A3A]">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#004A6D]/10 text-[#004A6D] font-black flex items-center justify-center text-[10px]">
                            {v.idVendedor}
                          </span>
                          <span>{v.nomeVendedor}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-[#004A6D]">
                        {v.totalLojas}
                      </td>
                      <td className="py-3 px-3 text-center font-semibold">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          v.lojasNovas > 0 
                            ? 'bg-[#00E04B]/20 text-[#006E24]' 
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {v.lojasNovas}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-[#004A6D]/80">
                        {formatarMoeda(v.creditoNovas)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-[#006E24]">
                        {formatarMoeda(v.comissaoNovas)}
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-[#004A6D]">
                        {v.lojasRecorrentes}
                      </td>
                      <td className="py-3 px-3 text-right text-[#004A6D]/80">
                        {formatarMoeda(v.creditoRecorrente)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-[#004A6D]">
                        {formatarMoeda(v.comissaoRecorrente)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-[#002A3A] bg-[#D9FBFF]/20">
                        {formatarMoeda(v.totalCredito)}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-[#002A3A] bg-[#EDCD01]/20 text-sm">
                        {formatarMoeda(v.comissaoTotal)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => {
                            setSelectedVendedor(String(v.idVendedor));
                            setActiveSubTab('analitico');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#004A6D]/10 hover:bg-[#004A6D] hover:text-white text-[#004A6D] text-[11px] font-bold transition-all cursor-pointer"
                        >
                          Ver Lojas
                        </button>
                      </td>
                    </tr>
                  ))
                )}
                {/* Linha de Conciliação: Sem Vendedor / Espontâneas / Não Comissionáveis */}
                {(saldoSemVendedor.totalCredito > 0 || saldoSemVendedor.totalLojas > 0 || saldoSemVendedor.lojasNovas > 0) && (
                  <tr className="bg-amber-50/60 border-t border-amber-200/80 text-[#002A3A]">
                    <td className="py-3 px-4 font-bold text-amber-900">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-900 font-black flex items-center justify-center text-[10px]">
                          ✕
                        </span>
                        <span>Sem Vendedor / Não Comissionável / Consumo</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-semibold text-amber-800">
                      {saldoSemVendedor.totalLojas}
                    </td>
                    <td className="py-3 px-3 text-center font-semibold text-amber-800">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        saldoSemVendedor.lojasNovas > 0 
                          ? 'bg-amber-200 text-amber-900' 
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {saldoSemVendedor.lojasNovas}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-amber-900">-</td>
                    <td className="py-3 px-3 text-right text-amber-900">-</td>
                    <td className="py-3 px-3 text-center font-semibold text-amber-800">
                      {saldoSemVendedor.lojasRecorrentes}
                    </td>
                    <td className="py-3 px-3 text-right text-amber-900 font-medium">
                      {formatarMoeda(saldoSemVendedor.totalCredito)}
                    </td>
                    <td className="py-3 px-3 text-right text-amber-900 font-medium">R$ 0,00</td>
                    <td className="py-3 px-3 text-right font-black text-amber-950 bg-amber-100/50">
                      {formatarMoeda(saldoSemVendedor.totalCredito)}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-amber-950 bg-amber-100/60">
                      R$ 0,00
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => {
                          setSelectedVendedor('SEM_VENDEDOR');
                          setFiltroTipo('NOVAS');
                          setActiveSubTab('analitico');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-200/80 hover:bg-amber-300 text-amber-900 text-[11px] font-bold transition-all cursor-pointer"
                      >
                        Ver Lojas ({saldoSemVendedor.lojasNovas})
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
              {resumoVendedores.length > 0 && (
                <tfoot className="bg-[#004A6D] text-white font-black text-xs">
                  <tr>
                    <td className="py-3.5 px-4">TOTAL COMERCIAL INSTITUCIONAL (DESEMPENHO)</td>
                    <td className="py-3.5 px-3 text-center">{kpisEquipe.totalLojas}</td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#00E04B] text-[#002A3A] font-black text-xs shadow-xs">
                        {resumoVendedores.reduce((acc, v) => acc + v.lojasNovas, 0) + saldoSemVendedor.lojasNovas}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      {formatarMoeda(resumoVendedores.reduce((acc, v) => acc + v.creditoNovas, 0))}
                    </td>
                    <td className="py-3.5 px-3 text-right text-[#00E04B]">
                      {formatarMoeda(kpisEquipe.totalComissaoNovas)}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      {resumoVendedores.reduce((acc, v) => acc + v.lojasRecorrentes, 0) + saldoSemVendedor.lojasRecorrentes}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      {formatarMoeda(Math.max(0, kpisEquipe.totalCredito - resumoVendedores.reduce((acc, v) => acc + v.creditoNovas, 0)))}
                    </td>
                    <td className="py-3.5 px-3 text-right text-[#00E3E6]">
                      {formatarMoeda(kpisEquipe.totalComissaoRecorrente)}
                    </td>
                    <td className="py-3.5 px-3 text-right text-[#00E3E6]">
                      {formatarMoeda(kpisEquipe.totalCredito)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-sm text-[#EDCD01] bg-[#003852]">
                      {formatarMoeda(kpisEquipe.totalComissaoVendedores)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {/* Visualização 2: Evolução Mensal (Grade de Meses para Gerência) */}
      {activeSubTab === 'evolucao' && (
        <div className="bg-white border border-[#BCD3DF]/60 rounded-2xl shadow-2xs overflow-hidden space-y-4">
          <div className="px-5 py-4 border-b border-[#BCD3DF]/50 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-[#002A3A]">
                Grade de Evolução Mensal das Comissões
              </h2>
              <p className="text-[11px] text-[#004A6D]/70">
                Visão executiva mês a mês do valor apurado para cada vendedor e para a Coordenação do Programa NFP.
              </p>
            </div>
            <span className="text-xs text-[#004A6D]/70 font-semibold">
              Período: {NOMES_MESES[mesesAtivos[0]]} a {NOMES_MESES[mesesAtivos[mesesAtivos.length - 1]]}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F9FA] text-[#004A6D] border-b border-[#BCD3DF]/50 uppercase tracking-wider text-[11px] font-black">
                <tr>
                  <th className="py-3 px-4">Beneficiário / Papel</th>
                  {mesesAtivos.map(m => (
                    <th key={m} className="py-3 px-3 text-right">
                      {NOMES_MESES[m] || `Mês ${m}`}
                    </th>
                  ))}
                  <th className="py-3 px-4 text-right bg-[#EDCD01]/20 text-[#002A3A] font-black">
                    Total Acumulado (R$)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#BCD3DF]/30 font-medium">
                {/* Linhas dos Vendedores Comerciais */}
                {evolucaoMensalVendedores.map(v => (
                  <tr key={v.idVendedor} className="hover:bg-[#F4F9FA]/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-[#002A3A]">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#004A6D]/10 text-[#004A6D] font-black flex items-center justify-center text-[10px]">
                          {v.idVendedor}
                        </span>
                        <span>{v.nomeVendedor}</span>
                      </div>
                    </td>
                    {mesesAtivos.map(m => {
                      const comMes = v.comissaoPorMes[m] || 0;
                      return (
                        <td key={m} className="py-3 px-3 text-right font-medium text-[#002A3A]">
                          {comMes > 0 ? formatarMoeda(comMes) : <span className="text-slate-400">-</span>}
                        </td>
                      );
                    })}
                    <td className="py-3 px-4 text-right font-black text-[#002A3A] bg-[#EDCD01]/10 text-sm">
                      {formatarMoeda(v.comissaoTotal)}
                    </td>
                  </tr>
                ))}

                {/* Subtotal da Equipe Comercial */}
                <tr className="bg-[#F4F9FA] border-t-2 border-[#BCD3DF]/60 font-bold text-[#004A6D]">
                  <td className="py-3 px-4">Subtotal Equipe Comercial</td>
                  {mesesAtivos.map(m => {
                    const subtotalMes = evolucaoMensalVendedores.reduce((acc, v) => acc + (v.comissaoPorMes[m] || 0), 0);
                    return (
                      <td key={m} className="py-3 px-3 text-right font-bold">
                        {formatarMoeda(subtotalMes)}
                      </td>
                    );
                  })}
                  <td className="py-3 px-4 text-right font-black text-[#004A6D] bg-[#EDCD01]/20 text-sm">
                    {formatarMoeda(kpisEquipe.totalComissaoVendedores)}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-[#004A6D] text-white font-black text-xs">
                <tr>
                  <td className="py-3.5 px-4">TOTAL COMISSÕES EQUIPE COMERCIAL</td>
                  {mesesAtivos.map(m => {
                    const subEquipe = evolucaoMensalVendedores.reduce((acc, v) => acc + (v.comissaoPorMes[m] || 0), 0);
                    return (
                      <td key={m} className="py-3.5 px-3 text-right text-[#00E3E6]">
                        {formatarMoeda(subEquipe)}
                      </td>
                    );
                  })}
                  <td className="py-3.5 px-4 text-right text-sm text-[#EDCD01] bg-[#003852]">
                    {formatarMoeda(kpisEquipe.totalComissaoVendedores)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Visualização 3: Tabela Analítica por CNPJ */}
      {activeSubTab === 'analitico' && (
        <div className="bg-white border border-[#BCD3DF]/60 rounded-2xl shadow-2xs overflow-hidden">
          <div className="px-5 py-4 border-b border-[#BCD3DF]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-black text-[#002A3A]">
                Detalhamento Analítico por CNPJ e Comissão Gerada
              </h2>
              <p className="text-[11px] text-[#004A6D]/70">
                Mostrando <strong>{empresasExibidas.length}</strong> lojas {filtroTipo === 'NOVAS' ? '⭐ Novas (1º Mês)' : filtroTipo === 'RECORRENTES' ? 'Recorrentes' : 'Totais'} de {topEmpresas.length} lojas ativas no período
              </p>
            </div>
            <div className="flex items-center gap-2">
              {filtroTipo !== 'TODAS' && (
                <button
                  onClick={() => setFiltroTipo('TODAS')}
                  className="text-xs text-[#00E04B] bg-[#00E04B]/10 border border-[#00E04B]/30 px-2 py-0.5 rounded-md hover:bg-[#00E04B]/20 font-bold cursor-pointer"
                >
                  Ver Todas ✕
                </button>
              )}
              {selectedVendedor !== 'TODOS' && (
                <button
                  onClick={() => setSelectedVendedor('TODOS')}
                  className="text-xs text-[#004A6D] hover:underline font-bold self-start sm:self-auto cursor-pointer"
                >
                  Limpar vendedor ✕
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F9FA] text-[#004A6D] border-b border-[#BCD3DF]/50 uppercase tracking-wider text-[11px] font-black">
                <tr>
                  <th className="py-3 px-4">CNPJ</th>
                  <th className="py-3 px-3">Empresa / Razão Social</th>
                  <th className="py-3 px-3">Vendedor</th>
                  <th className="py-3 px-2 text-center">Data Início</th>
                  <th className="py-3 px-2 text-center">Classificação</th>
                  <th className="py-3 px-2 text-center">Alíquota</th>
                  <th className="py-3 px-3 text-right">Cupons</th>
                  <th className="py-3 px-3 text-right">Créd. Urnas</th>
                  <th className="py-3 px-3 text-right">Doação Direta</th>
                  <th className="py-3 px-4 text-right bg-[#D9FBFF]/40 text-[#002A3A]">Crédito Total (R$)</th>
                  <th className="py-3 px-4 text-right bg-[#EDCD01]/20 text-[#002A3A] font-black">Comissão (R$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#BCD3DF]/30 font-medium">
                {empresasExibidas.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-8 text-center text-[#004A6D]/60 font-semibold">
                      Nenhuma empresa encontrada com os critérios informados.
                    </td>
                  </tr>
                ) : (
                  empresasExibidas.map(emp => {
                    const dadosCalc = comissoesPorEmpresa?.get(emp.id);
                    const isNova = dadosCalc ? dadosCalc.isNova : (emp.tipo === 'NOVO');
                    const comissao = dadosCalc ? dadosCalc.comissao : (emp.creditoTotal * (isNova ? 0.01 : 0.005));
                    const aliquotaTexto = isNova ? '1,0%' : '0,5%';

                    return (
                      <tr 
                        key={emp.id} 
                        className="hover:bg-[#F4F9FA]/80 transition-colors"
                      >
                        <td className="py-2.5 px-4 font-mono font-bold text-[#004A6D]">
                          {emp.cnpj}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-[#002A3A] truncate max-w-[240px]" title={emp.nomeFantasia || emp.razaoSocial}>
                            {emp.nomeFantasia || emp.razaoSocial}
                          </div>
                          <div className="text-[10px] text-[#004A6D]/60 truncate max-w-[240px]">
                            {emp.razaoSocial}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-[#002A3A]">
                          <div>
                            {emp.nomeVendedor || (emp.idVendedor ? `Captador #${emp.idVendedor}` : (
                              <span className="text-amber-800 font-medium italic">Sem Vendedor / Espontânea</span>
                            ))}
                          </div>
                          {emp.idVendedorAbertura && (
                            <div className="text-[10px] text-slate-500 font-normal">
                              Abertura: {VENDEDORES_MAP[emp.idVendedorAbertura] || `ID #${emp.idVendedorAbertura}`}
                              {emp.idVendedor && Number(emp.idVendedor) === Number(emp.idVendedorAbertura) && (
                                <span className="ml-1 text-[#006E24] font-bold">✓ (Mesmo)</span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono text-xs font-bold text-[#004A6D]">
                          {emp.dataInicio ? (
                            <span className="px-2 py-0.5 rounded bg-[#BCD3DF]/30 text-[#002A3A]">{emp.dataInicio}</span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isNova 
                              ? 'bg-[#00E04B]/20 text-[#006E24] border border-[#00E04B]/30' 
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {isNova ? 'NOVA (1º MÊS)' : 'RECORRENTE'}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-center font-bold text-[#004A6D]">
                          {aliquotaTexto}
                        </td>
                        <td className="py-2.5 px-3 text-right text-[#004A6D]">
                          {formatarNumero(emp.cuponsValidos)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-[#004A6D]/80">
                          {formatarMoeda(emp.creditoUrnas)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-[#00E04B] font-bold">
                          {formatarMoeda(emp.creditoDoacoes)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-black text-[#002A3A] bg-[#D9FBFF]/20">
                          {formatarMoeda(emp.creditoTotal)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-black text-[#002A3A] bg-[#EDCD01]/20">
                          {formatarMoeda(comissao)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

