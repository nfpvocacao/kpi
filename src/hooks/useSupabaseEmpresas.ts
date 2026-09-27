import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { EmpresaParceira } from '../types';

export interface UseEmpresasParams {
  selectedYears?: number[];
  selectedMonths?: number[];
  searchTerm?: string;
  limit?: number;
}

// Helper function to fetch all rows in parallel using count + range
async function fetchAllParallel<T = any>(
  buildQuery: () => any,
  pageSize = 1000
): Promise<T[]> {
  const { data: firstPage, count, error } = await buildQuery().range(0, pageSize - 1);
  if (error) throw error;
  if (!firstPage || firstPage.length === 0) return [];

  const total = count ?? firstPage.length;
  if (total <= pageSize || firstPage.length < pageSize) {
    return firstPage as T[];
  }

  const pagePromises = [];
  for (let from = pageSize; from < total; from += pageSize) {
    const to = Math.min(from + pageSize - 1, total - 1);
    pagePromises.push(buildQuery().range(from, to));
  }

  const results = await Promise.all(pagePromises);
  let allRows = [...firstPage];
  for (const res of results) {
    if (res.error) throw res.error;
    if (res.data) {
      allRows.push(...res.data);
    }
  }
  return allRows as T[];
}

export function useSupabaseEmpresas(params: UseEmpresasParams = {}) {
  const { selectedYears = [2026], selectedMonths = [], searchTerm = '', limit = 100 } = params;

  const [topEmpresas, setTopEmpresas] = useState<EmpresaParceira[]>([]);
  const [totalEmpresasContagem, setTotalEmpresasContagem] = useState<number>(0);
  const [kpis, setKpis] = useState({
    totalCupons: 0,
    totalValorNF: 0,
    totalCredito: 0,
    totalCreditoUrnas: 0,
    totalCreditoDoacoes: 0,
    totalCreditoConsumo: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);

        const startTime = performance.now();

        // 1. Executar em PARALELO todas as buscas principais da base completa do período
        const [dataConsolidado, periodData, nfpEmpresasData] = await Promise.all([
          // Query 1: Consolidado Interno
          supabase
            .from('vocacao_consolidado_interno')
            .select('ano_mes, cons_cred, tt_creditos')
            .then(res => {
              if (res.error) console.error('Erro consolidado_interno:', res.error);
              return res.data || [];
            }),

          // Query 2: Resumo Mensal de Empresas completo do período (Paginado em Paralelo)
          fetchAllParallel(() => {
            let q = supabase
              .from('vocacao_resumo_mensal_empresas')
              .select('*', { count: 'exact' });

            if (selectedYears && selectedYears.length > 0) {
              q = q.in('ano', selectedYears);
            }
            if (selectedMonths && selectedMonths.length > 0) {
              q = q.in('mes', selectedMonths);
            }
            return q;
          }),

          // Query 3: Cadastro Oficial de Empresas (Paginado em Paralelo)
          fetchAllParallel(() =>
            supabase
              .from('nfp_empresas')
              .select('cnpj, fantasia, empresa, id_vendedor, cidade, bairro, logradouro, cep, telefone, email', { count: 'exact' })
          )
        ]);

        // Processar Consolidado Interno
        let sumConsumo = 0;
        let sumCreditoSefaz = 0;
        if (dataConsolidado && dataConsolidado.length > 0) {
          dataConsolidado.forEach((r: any) => {
            const sAnoMes = String(r.ano_mes);
            const ano = parseInt(sAnoMes.substring(0, 4), 10);
            const m = parseInt(sAnoMes.substring(4, 6), 10);

            if (selectedYears.includes(ano)) {
              if (selectedMonths.length === 0 || selectedMonths.includes(m)) {
                sumConsumo += Number(r.cons_cred || 0);
                sumCreditoSefaz += Number(r.tt_creditos || 0);
              }
            }
          });
        }

        // Map do Cadastro Oficial
        const cadastroMap = new Map<string, any>();
        if (nfpEmpresasData && nfpEmpresasData.length > 0) {
          nfpEmpresasData.forEach((ne: any) => {
            if (ne.cnpj) {
              cadastroMap.set(ne.cnpj, ne);
            }
          });
        }

        // 2. Calcular o Benchmark Global do Período (com a BASE COMPLETA do período, independente de filtros)
        let globalSumCupons = 0;
        let globalSumValorNF = 0;
        let globalSumCredito = 0;
        let globalSumCreditoUrnas = 0;
        let globalSumCreditoDoacoes = 0;

        periodData.forEach((r: any) => {
          globalSumCupons += Number(r.total_cupons || 0);
          globalSumValorNF += Number(r.total_valor_nf || 0);
          globalSumCredito += Number(r.total_credito_apurado || 0);
          globalSumCreditoUrnas += Number(r.credito_cadastro || 0);
          globalSumCreditoDoacoes += Number(r.credito_doacao || 0);
        });

        // Benchmark Global Fixo por Cupom no período
        const globalBenchmarkTicketMedio = globalSumCupons > 0 ? (globalSumCredito / globalSumCupons) : 0;

        // 3. Aplicar Filtro de Busca (SearchTerm) localmente sobre os dados se preenchido
        let listData = periodData;
        if (searchTerm.trim()) {
          const s = searchTerm.trim().toLowerCase();
          const cleanDigits = s.replace(/\D/g, '');

          listData = periodData.filter((r: any) => {
            const cnpj = (r.cnpj || '').toLowerCase();
            const cnpjClean = cnpj.replace(/\D/g, '');
            const nomeEmpresa = (r.nome_empresa || '').toLowerCase();

            const cadOficial = cadastroMap.get(r.cnpj);
            const fantasia = (cadOficial?.fantasia || '').toLowerCase();
            const razaoSocial = (cadOficial?.empresa || '').toLowerCase();

            if (nomeEmpresa.includes(s) || cnpj.includes(s) || fantasia.includes(s) || razaoSocial.includes(s)) {
              return true;
            }
            if (cleanDigits.length >= 4 && (cnpjClean.includes(cleanDigits) || cnpj.includes(cleanDigits))) {
              return true;
            }
            return false;
          });
        }

        // 4. Processar KPIs locais e Agrupamento das Empresas Filtradas
        let localSumCupons = 0;
        let localSumValorNF = 0;
        let localSumCredito = 0;
        let localSumCreditoUrnas = 0;

        const map = new Map<string, EmpresaParceira>();

        listData.forEach((r: any) => {
          localSumCupons += Number(r.total_cupons || 0);
          localSumValorNF += Number(r.total_valor_nf || 0);
          localSumCredito += Number(r.total_credito_apurado || 0);
          localSumCreditoUrnas += Number(r.credito_cadastro || 0);

          const cnpjKey = r.cnpj || '00.000.000/0000-00';
          const nomeResumo = r.nome_empresa || 'Empresa Parceira';

          const cadOficial = cadastroMap.get(cnpjKey);
          const isCadastrada = !!cadOficial;
          const nomeFantasia = cadOficial?.fantasia || cadOficial?.empresa || nomeResumo;
          const razaoSocial = cadOficial?.empresa || nomeResumo;
          const idVendedor = cadOficial?.id_vendedor ?? null;
          const cidade = cadOficial?.cidade || 'São Paulo';

          let cat: EmpresaParceira['categoria'] = 'Serviços & Outros';
          const lowerNome = nomeFantasia.toLowerCase();
          if (lowerNome.includes('alimento') || lowerNome.includes('restaurante') || lowerNome.includes('cafe') || lowerNome.includes('pizzaria') || lowerNome.includes('food') || lowerNome.includes('padaria') || lowerNome.includes('bar') || lowerNome.includes('hamburg') || lowerNome.includes('lanchonete')) {
            cat = 'Restaurantes & Alimentos';
          } else if (lowerNome.includes('supermercado') || lowerNome.includes('hortifruti') || lowerNome.includes('mercado') || lowerNome.includes('comercio de aliment') || lowerNome.includes('hipermercado') || lowerNome.includes('sacolao')) {
            cat = 'Supermercados';
          } else if (lowerNome.includes('atacad') || lowerNome.includes('distribuidora') || lowerNome.includes('comercial') || lowerNome.includes('atacarejo')) {
            cat = 'Atacado & Distribuição';
          } else if (lowerNome.includes('droga') || lowerNome.includes('farma') || lowerNome.includes('medicament') || lowerNome.includes('manipulac')) {
            cat = 'Farmácias';
          } else if (lowerNome.includes('posto') || lowerNome.includes('combustiv') || lowerNome.includes('convenienc') || lowerNome.includes('auto posto')) {
            cat = 'Postos & Conveniência';
          } else if (lowerNome.includes('pet') || lowerNome.includes('veterin') || lowerNome.includes('animal')) {
            cat = 'Pet & Serviços';
          } else if (lowerNome.includes('construc') || lowerNome.includes('tintas') || lowerNome.includes('casa') || lowerNome.includes('madeira') || lowerNome.includes('eletro') || lowerNome.includes('material')) {
            cat = 'Construção & Casa';
          } else if (lowerNome.includes('moda') || lowerNome.includes('vestuar') || lowerNome.includes('calcado') || lowerNome.includes('roupa') || lowerNome.includes('loja') || lowerNome.includes('magazine') || lowerNome.includes('shopping')) {
            cat = 'Varejo & Moda';
          }

          if (!map.has(cnpjKey)) {
            map.set(cnpjKey, {
              id: cnpjKey,
              cnpj: cnpjKey,
              razaoSocial: razaoSocial,
              nomeFantasia: nomeFantasia,
              categoria: cat,
              cuponsValidos: 0,
              valorTotalNotas: 0,
              creditoTotal: 0,
              creditoUrnas: 0,
              creditoDoacoes: 0,
              ticketMedioCupom: 0,
              urnasInstaladas: 1,
              status: 'Ativa',
              crescimentoYoY: 0,
              cidade: cidade,
              isCadastrada: isCadastrada,
              idVendedor: idVendedor,
              logradouro: cadOficial?.logradouro,
              bairro: cadOficial?.bairro,
              cep: cadOficial?.cep,
              telefone: cadOficial?.telefone,
              email: cadOficial?.email
            });
          }

          const item = map.get(cnpjKey)!;
          item.cuponsValidos += Number(r.total_cupons || 0);
          item.valorTotalNotas += Number(r.total_valor_nf || 0);
          item.creditoTotal += Number(r.total_credito_apurado || 0);
          item.creditoUrnas += Number(r.credito_cadastro || 0);
          item.creditoDoacoes += Number(r.credito_doacao || 0);
        });

        // Totais Finais dos Cards
        const isFiltered = searchTerm.trim().length > 0;
        const totalFinalCredito = isFiltered 
          ? localSumCredito 
          : (sumCreditoSefaz > 0 ? sumCreditoSefaz : (globalSumCredito + sumConsumo));

        setTotalEmpresasContagem(map.size);
        setKpis({
          totalCupons: isFiltered ? localSumCupons : globalSumCupons,
          totalValorNF: isFiltered ? localSumValorNF : globalSumValorNF,
          totalCredito: Number(totalFinalCredito.toFixed(2)),
          totalCreditoUrnas: Number((isFiltered ? localSumCreditoUrnas : globalSumCreditoUrnas).toFixed(2)),
          totalCreditoDoacoes: Number((isFiltered ? localSumCredito : globalSumCredito).toFixed(2)),
          totalCreditoConsumo: Number((isFiltered ? 0 : sumConsumo).toFixed(2)),
        });

        // 5. Calcular Score de Eficiência baseado SEMPRE no Benchmark Global Fixo do Período
        const parsedList = Array.from(map.values()).map(e => {
          const ticketMedioLoja = e.cuponsValidos > 0 ? (e.creditoTotal / e.cuponsValidos) : 0;
          
          let scorePct = 0;
          if (ticketMedioLoja === 0 || e.creditoTotal === 0) {
            // Se o crédito retornado é zero, o score de eficiência é obrigatoriamente 0% (CRITICO)
            scorePct = 0;
          } else if (globalBenchmarkTicketMedio > 0) {
            scorePct = (ticketMedioLoja / globalBenchmarkTicketMedio) * 100;
          } else {
            scorePct = 100;
          }
          scorePct = Number(scorePct.toFixed(1));

          let nivel: 'EXCEPCIONAL' | 'BOM' | 'MODERADO' | 'BAIXO' | 'CRITICO' = 'CRITICO';
          if (scorePct > 100) {
            nivel = 'EXCEPCIONAL';
          } else if (scorePct >= 80) {
            nivel = 'BOM';
          } else if (scorePct >= 50) {
            nivel = 'MODERADO';
          } else if (scorePct >= 25) {
            nivel = 'BAIXO';
          } else {
            nivel = 'CRITICO';
          }

          return {
            ...e,
            creditoTotal: Number(e.creditoTotal.toFixed(2)),
            creditoUrnas: Number(e.creditoUrnas.toFixed(2)),
            creditoDoacoes: Number(e.creditoDoacoes.toFixed(2)),
            valorTotalNotas: Number(e.valorTotalNotas.toFixed(2)),
            ticketMedioCupom: Number(ticketMedioLoja.toFixed(2)),
            scoreEficiencia: scorePct,
            nivelScore: nivel
          };
        });

        parsedList.sort((a, b) => b.creditoTotal - a.creditoTotal);
        setTopEmpresas(parsedList);

        const endTime = performance.now();
        console.log(`[OPTIMIZATION] useSupabaseEmpresas concluído em ${(endTime - startTime).toFixed(0)}ms. Linhas totais no período: ${periodData.length}, exibidas: ${parsedList.length}`);

      } catch (err: any) {
        console.error('Falha geral no hook useSupabaseEmpresas:', err);
        setError(err?.message || 'Error');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [JSON.stringify(selectedYears), JSON.stringify(selectedMonths), searchTerm, limit]);

  // Função para exportação sob demanda de TODOS os 7.505+ registros baseados no filtro atual
  const downloadFullCSV = async () => {
    try {
      setIsExporting(true);
      let queryFull = supabase
        .from('vocacao_resumo_mensal_empresas')
        .select('*');

      if (selectedYears && selectedYears.length > 0) {
        queryFull = queryFull.in('ano', selectedYears);
      }
      if (selectedMonths && selectedMonths.length > 0 && selectedMonths.length < 12) {
        queryFull = queryFull.in('mes', selectedMonths);
      }
      if (searchTerm.trim()) {
        const s = searchTerm.trim();
        queryFull = queryFull.or(`nome_empresa.ilike.%${s}%,cnpj.ilike.%${s}%`);
      }

      queryFull = queryFull.order('total_credito_apurado', { ascending: false });

      const { data: fullData, error: fullError } = await queryFull;

      if (fullError || !fullData) {
        throw new Error(fullError?.message || 'Falha ao obter base completa');
      }

      const headers = ['CNPJ,Nome Empresa,Ano,Mes,Total Cupons,Valor Total NF (R$),Credito Apurado (R$),Credito Urnas (R$),Credito Doacoes (R$)'];
      const rows = fullData.map(r => 
        `"${r.cnpj || ''}","${(r.nome_empresa || '').replace(/"/g, '""')}",${r.ano},${r.mes},${r.total_cupons || 0},${r.total_valor_nf || 0},${r.total_credito_apurado || 0},${r.credito_cadastro || 0},${r.credito_doacao || 0}`
      );

      const blob = new Blob([headers.concat(rows).join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `base_empresas_parceiras_completa_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      console.error('Erro ao baixar CSV completo:', err);
      alert('Erro ao exportar base completa: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Função para buscar o histórico completo mês a mês de uma única empresa
  const fetchEmpresaHistoricoMensal = async (cnpj: string, months?: number[]) => {
    try {
      let queryHist = supabase
        .from('vocacao_resumo_mensal_empresas')
        .select('*')
        .eq('cnpj', cnpj);

      if (months && months.length > 0) {
        queryHist = queryHist.in('mes', months);
      }

      queryHist = queryHist.order('mes', { ascending: true });

      const { data, error: histError } = await queryHist;

      if (histError) throw histError;

      const nomesMeses: { [key: number]: string } = {
        1: 'Janeiro', 2: 'Fevereiro', 3: 'Março', 4: 'Abril',
        5: 'Maio', 6: 'Junho', 7: 'Julho', 8: 'Agosto',
        9: 'Setembro', 10: 'Outubro', 11: 'Novembro', 12: 'Dezembro'
      };

      return (data || []).map((r: any) => {
        const creditoApurado = Number(r.total_credito_apurado || 0);
        const creditoCadastro = Number(r.credito_cadastro || 0);
        const creditoDoacao = Number(r.credito_doacao || 0);
        // Desmembramento de Outros / Consumo para o cálculo bater 100%
        const creditoOutros = Math.max(0, Number((creditoApurado - (creditoCadastro + creditoDoacao)).toFixed(2)));

        return {
          mes: r.mes,
          mesNome: `${nomesMeses[r.mes] || 'Mês ' + r.mes}/${r.ano || 2026}`,
          ano: r.ano || 2026,
          cupons: Number(r.total_cupons || 0),
          valorNF: Number(r.total_valor_nf || 0),
          creditoApurado: Number(creditoApurado.toFixed(2)),
          creditoCadastro: Number(creditoCadastro.toFixed(2)),
          creditoDoacao: Number(creditoDoacao.toFixed(2)),
          creditoOutros: creditoOutros
        };
      });
    } catch (err) {
      console.error('Erro ao buscar histórico mensal da empresa:', err);
      return [];
    }
  };

  return {
    topEmpresas,
    totalEmpresasContagem,
    kpis,
    isLoading,
    isExporting,
    error,
    downloadFullCSV,
    fetchEmpresaHistoricoMensal,
  };
}
