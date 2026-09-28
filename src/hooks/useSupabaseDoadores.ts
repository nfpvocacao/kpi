import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface DoadorRealSupabase {
  id: string; // cpf_doador
  cpf: string;
  nome: string;
  celular: string;
  tipoLigacao: string;
  tipoDoacao: 'DOACAO_AUTOMATICA' | 'DOACAO';
  totalCupons: number;
  cuponsValidos: number;
  cuponsAutomatica: number;
  cuponsDireta: number;
  totalValorNF: number;
  totalCredito: number;
  creditoAutomatica: number;
  creditoDireta: number;
  ano: number;
  mes: number;
  nivelScore: 'Elite (Diamante)' | 'Alta Performance' | 'Na Média' | 'Em Desenvolvimento' | 'Iniciante';
  scorePct: number;
}

export interface DoadorEstoqueLoja {
  cnpj: string;
  nomeEmpresa: string;
  cupons: number;
  cuponsAuto: number;
  cuponsDireta: number;
  valNF: number;
  credito: number;
  creditoAuto: number;
  creditoDireta: number;
}

export interface UseDoadoresParams {
  selectedYears?: number[];
  selectedMonths?: number[];
  searchTerm?: string;
  modalidadeFilter?: 'TODOS' | 'DOACAO_AUTOMATICA' | 'DOACAO';
}

export function useSupabaseDoadores(params: UseDoadoresParams = {}) {
  const { selectedYears = [2026], selectedMonths = [], searchTerm = '', modalidadeFilter = 'TODOS' } = params;

  const [doadores, setDoadores] = useState<DoadorRealSupabase[]>([]);
  const [totalDoadoresCount, setTotalDoadoresCount] = useState<number>(0);
  const [kpis, setKpis] = useState({
    totalDoadores: 0,
    totalCupons: 0,
    totalValorNF: 0,
    totalCredito: 0,
    creditoAutomatica: 0,
    creditoDireta: 0,
    ticketMedio: 0,
    mediaGeralMes: 0
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDoadores() {
      try {
        setIsLoading(true);
        setError(null);

        // 1. Buscar registros em vocacao_resumo_mensal_doadores
        let query = supabase
          .from('vocacao_resumo_mensal_doadores')
          .select('*');

        if (selectedMonths && selectedMonths.length > 0) {
          query = query.in('mes', selectedMonths);
        }

        // Buscar com suporte a paginação range se dataset for grande
        let allRows: any[] = [];
        let from = 0;
        const step = 1000;
        let hasMore = true;

        while (hasMore) {
          const { data: pageData, error: pageError } = await query.range(from, from + step - 1);
          if (pageError) {
            console.error('Erro ao buscar doadores no Supabase:', pageError);
            setError(pageError.message);
            setIsLoading(false);
            return;
          }
          if (pageData && pageData.length > 0) {
            allRows = allRows.concat(pageData);
            from += step;
            if (pageData.length < step) hasMore = false;
          } else {
            hasMore = false;
          }
        }

        // Aggregate by CPF across selected period
        const cpfMap: Record<string, DoadorRealSupabase> = {};

        allRows.forEach((r: any) => {
          const tipoLig = (r.tipo_ligacao || '').toUpperCase();
          if (tipoLig === 'CADASTRO') return;

          const cpf = r.cpf_doador || 'SEM_CPF';
          
          if (!cpfMap[cpf]) {
            cpfMap[cpf] = {
              id: cpf,
              cpf: cpf,
              nome: r.nome_doador || (cpf !== 'SEM_CPF' ? `Doador ${cpf}` : 'Doador Não Cadastrado'),
              celular: r.celular || '',
              tipoLigacao: r.tipo_ligacao || 'N/A',
              tipoDoacao: r.tipo_ligacao === 'DOACAO_AUTOMATICA' ? 'DOACAO_AUTOMATICA' : 'DOACAO',
              totalCupons: 0,
              cuponsValidos: 0,
              cuponsAutomatica: 0,
              cuponsDireta: 0,
              totalValorNF: 0,
              totalCredito: 0,
              creditoAutomatica: 0,
              creditoDireta: 0,
              ano: r.ano,
              mes: r.mes,
              nivelScore: 'Na Média',
              scorePct: 100
            };
          }

          const d = cpfMap[cpf];
          const cupsAutoRow = Number(r.cupons_doacao_automatica || 0);
          const cupsDiretaRow = Number(r.cupons_doacao_direta || 0);
          const credAutoRow = Number(r.credito_doacao_automatica || 0);
          const credDiretaRow = Number(r.credito_doacao_direta || 0);
          const totalCredRow = Number(r.total_credito_apurado || 0);
          const totalCupRow = Number(r.total_cupons || 0);

          d.totalCupons += totalCupRow;
          d.cuponsValidos += Number(r.cupons_validos || totalCupRow);
          d.cuponsAutomatica += cupsAutoRow;
          d.cuponsDireta += cupsDiretaRow;
          d.totalValorNF += Number(r.total_valor_nf || 0);
          d.totalCredito += totalCredRow;
          d.creditoAutomatica += credAutoRow;
          d.creditoDireta += credDiretaRow;

          if (r.tipo_ligacao === 'DOACAO_AUTOMATICA' || credAutoRow > 0 || cupsAutoRow > 0) {
            d.tipoDoacao = 'DOACAO_AUTOMATICA';
          }
        });

        const listAll = Object.values(cpfMap);

        // Fetch master names from nfp_doadores to enrich names where available
        const { data: nfpMaster } = await supabase
          .from('nfp_doadores')
          .select('cpf, doador, celular, ligacao');

        if (nfpMaster && nfpMaster.length > 0) {
          const nfpMap: Record<string, any> = {};
          nfpMaster.forEach(m => {
            if (m.cpf) nfpMap[m.cpf.trim()] = m;
          });

          listAll.forEach(d => {
            if (nfpMap[d.cpf]) {
              const m = nfpMap[d.cpf];
              if (m.doador) d.nome = m.doador;
              if (m.celular) d.celular = m.celular;
              if (m.ligacao) d.tipoLigacao = m.ligacao;
            }
          });
        }

        // Apply modalidade filter for macro KPIs
        const listAllModalidade = listAll.filter(d => 
          modalidadeFilter === 'TODOS' || d.tipoDoacao === modalidadeFilter
        );

        // Calculate global MACRO KPIs for selected period (not reduced by search query)
        let sumDoadores = listAllModalidade.length;
        let sumCupons = 0;
        let sumValorNF = 0;
        let sumCredito = 0;
        let sumCreditoAutomatica = 0;
        let sumCreditoDireta = 0;

        listAllModalidade.forEach(d => {
          sumCupons += d.totalCupons;
          sumValorNF += d.totalValorNF;
          sumCredito += d.totalCredito;
          sumCreditoAutomatica += d.creditoAutomatica;
          sumCreditoDireta += d.creditoDireta;
        });

        const ticketMedio = sumDoadores > 0 ? sumCredito / sumDoadores : 0;

        // Calculate Donor Score (5 Levels) relative to ticketMedio
        listAllModalidade.forEach(d => {
          const scorePct = ticketMedio > 0 ? (d.totalCredito / ticketMedio) * 100 : 100;
          d.scorePct = Number(scorePct.toFixed(0));

          if (scorePct >= 200) {
            d.nivelScore = 'Elite (Diamante)';
          } else if (scorePct >= 130) {
            d.nivelScore = 'Alta Performance';
          } else if (scorePct >= 80) {
            d.nivelScore = 'Na Média';
          } else if (scorePct >= 40) {
            d.nivelScore = 'Em Desenvolvimento';
          } else {
            d.nivelScore = 'Iniciante';
          }
        });

        // Apply search filter for detailed list
        const filtered = listAllModalidade.filter(d => {
          const s = searchTerm.toLowerCase().trim();
          const matchSearch = !s || 
            d.nome.toLowerCase().includes(s) || 
            d.cpf.replace(/\D/g, '').includes(s.replace(/\D/g, ''));
          
          return matchSearch;
        }).sort((a, b) => b.totalCredito - a.totalCredito);

        setTotalDoadoresCount(filtered.length);
        setDoadores(filtered);
        setKpis({
          totalDoadores: sumDoadores,
          totalCupons: sumCupons,
          totalValorNF: Number(sumValorNF.toFixed(2)),
          totalCredito: Number(sumCredito.toFixed(2)),
          creditoAutomatica: Number(sumCreditoAutomatica.toFixed(2)),
          creditoDireta: Number(sumCreditoDireta.toFixed(2)),
          ticketMedio: Number(ticketMedio.toFixed(2)),
          mediaGeralMes: Number(ticketMedio.toFixed(2))
        });
        setIsLoading(false);


      } catch (err: any) {
        console.error('Erro no hook useSupabaseDoadores:', err);
        setError(err.message);
        setIsLoading(false);
      }
    }

    fetchDoadores();
  }, [selectedYears.join(','), selectedMonths.join(','), searchTerm, modalidadeFilter]);

  // Function to fetch store breakdown for a specific donor CPF
  const fetchLojasDoador = async (cpf: string): Promise<DoadorEstoqueLoja[]> => {
    try {
      let query = supabase
        .from('vocacao_doador_estabelecimento_mensal')
        .select('*')
        .eq('cpf_doador', cpf);

      if (selectedMonths && selectedMonths.length > 0) {
        query = query.in('mes', selectedMonths);
      }

      const { data, error } = await query;
      if (error || !data) return [];

      const empMap: Record<string, DoadorEstoqueLoja> = {};

      data.forEach((r: any) => {
        if (r.tipo_ligacao === 'CADASTRO') return;

        const rawName = r.nome_empresa || '';
        const cnpj = r.cnpj_empresa || 'OUTROS';
        const totCupRow = Number(r.total_cupons || 0);
        const totCredRow = Number(r.total_credito_apurado || 0);

        let cupsAutoRow = Number(r.cupons_doacao_automatica || 0);
        let cupsDiretaRow = Number(r.cupons_doacao_direta || 0);
        let credAutoRow = Number(r.credito_doacao_automatica || 0);
        let credDiretaRow = Number(r.credito_doacao_direta || 0);
        let cleanEmpName = rawName.replace(/\s*\[AUT:\d+\|DIR:\d+\]$/, '').replace(/\s*\[AUT\]$/, '');

        // Fallback if explicit columns are not populated
        if (cupsAutoRow === 0 && cupsDiretaRow === 0) {
          if (rawName.endsWith('[AUT]')) {
            cupsAutoRow = totCupRow;
            credAutoRow = totCredRow;
          } else {
            cupsDiretaRow = totCupRow;
            credDiretaRow = totCredRow;
          }
        }

        if (!empMap[cnpj]) {
          empMap[cnpj] = {
            cnpj,
            nomeEmpresa: cleanEmpName || `Empresa CNPJ ${cnpj}`,
            cupons: 0,
            cuponsAuto: 0,
            cuponsDireta: 0,
            valNF: 0,
            credito: 0,
            creditoAuto: 0,
            creditoDireta: 0
          };
        }

        empMap[cnpj].cupons += totCupRow;
        empMap[cnpj].cuponsAuto += cupsAutoRow;
        empMap[cnpj].cuponsDireta += cupsDiretaRow;
        empMap[cnpj].valNF += Number(r.total_valor_nf || 0);
        empMap[cnpj].credito += totCredRow;
        empMap[cnpj].creditoAuto += credAutoRow;
        empMap[cnpj].creditoDireta += credDiretaRow;
      });

      return Object.values(empMap).sort((a, b) => b.credito - a.credito);
    } catch {
      return [];
    }
  };

  // Function to fetch monthly historical data for a specific donor CPF
  const fetchDoadorHistoricoMensal = async (cpf: string) => {
    const monthsMap: Record<number, string> = {
      1: 'Jan', 2: 'Fev', 3: 'Mar', 4: 'Abr', 5: 'Mai', 6: 'Jun',
      7: 'Jul', 8: 'Ago', 9: 'Set', 10: 'Out', 11: 'Nov', 12: 'Dez'
    };
    try {
      const { data, error } = await supabase
        .from('vocacao_resumo_mensal_doadores')
        .select('*')
        .eq('cpf_doador', cpf)
        .order('ano', { ascending: false })
        .order('mes', { ascending: false });

      if (error || !data) return [];
      return data.map((r: any) => ({
        ano: r.ano,
        mes: r.mes,
        mesNome: `${monthsMap[r.mes] || r.mes}/${String(r.ano).slice(2)}`,
        cupons: Number(r.total_cupons || 0),
        valNF: Number(r.total_valor_nf || 0),
        credito: Number(r.total_credito_apurado || 0),
        creditoAuto: Number(r.credito_doacao_automatica || 0),
        creditoDireta: Number(r.credito_doacao_direta || 0),
      }));
    } catch {
      return [];
    }
  };

  return {
    doadores,
    totalDoadoresCount,
    kpis,
    isLoading,
    error,
    fetchLojasDoador,
    fetchDoadorHistoricoMensal
  };
}
