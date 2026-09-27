import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { EmpresaParceira } from '../types';

export interface UseEmpresasParams {
  selectedYears?: number[];
  selectedMonths?: number[];
  searchTerm?: string;
  limit?: number;
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

        // 0. Buscar Consumo Próprio e Crédito Total em vocacao_consolidado_interno
        const { data: dataConsolidado } = await supabase
          .from('vocacao_consolidado_interno')
          .select('ano_mes, cons_cred, tt_creditos');

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

        // 1. Contagem total e agregados gerais para os KPIs carregando o dataset completo via range
        let queryKpi = supabase
          .from('vocacao_resumo_mensal_empresas')
          .select('total_cupons, total_valor_nf, total_credito_apurado, credito_cadastro, credito_doacao');

        if (selectedMonths && selectedMonths.length > 0) {
          queryKpi = queryKpi.in('mes', selectedMonths);
        }

        // Buscar todas as páginas do Supabase (para evitar a trava padrão de 1.000 linhas do REST)
        let allKpiRows: any[] = [];
        let from = 0;
        const step = 1000;
        let hasMore = true;

        while (hasMore) {
          const { data: pageData, error: pageError } = await queryKpi.range(from, from + step - 1);
          if (pageError) {
            console.error('Erro na queryKpi do Supabase:', pageError);
            setError(pageError.message);
            setIsLoading(false);
            return;
          }
          if (pageData && pageData.length > 0) {
            allKpiRows = allKpiRows.concat(pageData);
            from += step;
            if (pageData.length < step) {
              hasMore = false;
            }
          } else {
            hasMore = false;
          }
        }

        let sumCupons = 0;
        let sumValorNF = 0;
        let sumCredito = 0;
        let sumCreditoUrnas = 0;
        let sumCreditoDoacoes = 0;

        allKpiRows.forEach((r: any) => {
          sumCupons += Number(r.total_cupons || 0);
          sumValorNF += Number(r.total_valor_nf || 0);
          sumCredito += Number(r.total_credito_apurado || 0);
          sumCreditoUrnas += Number(r.credito_cadastro || 0);
          sumCreditoDoacoes += Number(r.credito_doacao || 0);
        });

        const totalFinalCredito = sumCreditoSefaz > 0 ? sumCreditoSefaz : (sumCredito + sumConsumo);

        console.log('SUPABASE FETCH COMPLETO:', {
          totalLinhas: allKpiRows.length,
          sumCupons,
          sumCreditoSefaz: Number(totalFinalCredito.toFixed(2)),
          sumCreditoDoacoes: Number(sumCredito.toFixed(2)),
          sumConsumo: Number(sumConsumo.toFixed(2))
        });

        setTotalEmpresasContagem(allKpiRows.length);
        setKpis({
          totalCupons: sumCupons,
          totalValorNF: sumValorNF,
          totalCredito: Number(totalFinalCredito.toFixed(2)),
          totalCreditoUrnas: Number(sumCreditoUrnas.toFixed(2)),
          totalCreditoDoacoes: Number(sumCredito.toFixed(2)),
          totalCreditoConsumo: Number(sumConsumo.toFixed(2)),
        });

        // 2. Query para a lista (Top N ou busca filtrada diretamente no Supabase)
        // 2. Query para a lista de empresas
        // Se houver termo de busca, buscar CNPJs correspondentes também na tabela nfp_empresas (Fantasia / Razão Social)
        let matchingCnpjsFromCad: string[] = [];

        if (searchTerm.trim()) {
          const s = searchTerm.trim();
          const { data: nfpSearch } = await supabase
            .from('nfp_empresas')
            .select('cnpj')
            .or(`fantasia.ilike.%${s}%,empresa.ilike.%${s}%`)
            .limit(200);

          if (nfpSearch) {
            matchingCnpjsFromCad = nfpSearch.map((e: any) => e.cnpj).filter(Boolean);
          }
        }

        let queryList = supabase
          .from('vocacao_resumo_mensal_empresas')
          .select('*');

        if (selectedMonths && selectedMonths.length > 0) {
          queryList = queryList.in('mes', selectedMonths);
        }
        if (searchTerm.trim()) {
          const s = searchTerm.trim();
          const cleanDigits = s.replace(/\D/g, '');

          let orConditions = [`nome_empresa.ilike.%${s}%`, `cnpj.ilike.%${s}%`];
          if (cleanDigits.length >= 8) {
            let formattedCnpj = cleanDigits;
            if (cleanDigits.length === 14) {
              formattedCnpj = cleanDigits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
            }
            orConditions.push(`cnpj.ilike.%${cleanDigits}%`, `cnpj.ilike.%${formattedCnpj}%`);
          }
          if (matchingCnpjsFromCad.length > 0) {
            // Incluir os CNPJs encontrados na busca por Nome Fantasia/Razão Social
            const cnpjInList = matchingCnpjsFromCad.map(c => `cnpj.eq.${c}`).join(',');
            orConditions.push(cnpjInList);
          }

          queryList = queryList.or(orConditions.join(','));
        }

        // Carregar a lista completa de empresas (sem trava de 100 ou limit 1000) em lote para score e agregacao global
        let listData: any[] = [];
        let listFrom = 0;
        const listStep = 1000;
        let listHasMore = true;

        while (listHasMore) {
          const { data: pageListData, error: pageListError } = await queryList.range(listFrom, listFrom + listStep - 1);
          if (pageListError) {
            console.error('Erro ao buscar lista paginada de empresas:', pageListError);
            setError(pageListError.message);
            setIsLoading(false);
            return;
          }
          if (pageListData && pageListData.length > 0) {
            listData = listData.concat(pageListData);
            listFrom += listStep;
            if (pageListData.length < listStep) {
              listHasMore = false;
            }
          } else {
            listHasMore = false;
          }
        }

        if (listData && listData.length > 0) {
          // Buscar dados cadastrais oficiais da tabela nfp_empresas para cruzar com a lista
          const cnpjsDaLista = Array.from(new Set(listData.map((r: any) => r.cnpj).filter(Boolean)));

          let cadastroMap = new Map<string, any>();
          
          // Buscar todas as empresas cadastradas com vendedores na tabela nfp_empresas paginadamente
          let nfpEmpresasFrom = 0;
          const nfpStep = 1000;
          let nfpHasMore = true;

          while (nfpHasMore) {
            const { data: nfpPageData, error: nfpPageErr } = await supabase
              .from('nfp_empresas')
              .select('cnpj, fantasia, empresa, id_vendedor, cidade, bairro, logradouro, cep, telefone, email')
              .range(nfpEmpresasFrom, nfpEmpresasFrom + nfpStep - 1);

            if (nfpPageErr) {
              console.error('Erro ao buscar nfp_empresas:', nfpPageErr);
              nfpHasMore = false;
            } else if (nfpPageData && nfpPageData.length > 0) {
              nfpPageData.forEach((ne: any) => {
                if (ne.cnpj) {
                  cadastroMap.set(ne.cnpj, ne);
                }
              });
              nfpEmpresasFrom += nfpStep;
              if (nfpPageData.length < nfpStep) {
                nfpHasMore = false;
              }
            } else {
              nfpHasMore = false;
            }
          }


          const map = new Map<string, EmpresaParceira>();

          listData.forEach((r: any) => {
            const cnpjKey = r.cnpj || '00.000.000/0000-00';
            const nomeResumo = r.nome_empresa || 'Empresa Parceira';

            // Verifica se o CNPJ existe na tabela de cadastro oficial
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


          setTotalEmpresasContagem(map.size);

          // Calcular Ticket Médio de Crédito Geral do Período (Benchmark)
          const ticketMedioGeralPeriodo = sumCupons > 0 ? (sumCredito / sumCupons) : 0;

          const parsedList = Array.from(map.values()).map(e => {
            const ticketMedioLoja = e.cuponsValidos > 0 ? (e.creditoTotal / e.cuponsValidos) : 0;
            
            // Score = % do Ticket Médio da Loja vs Ticket Médio Geral do Período
            let scorePct = ticketMedioGeralPeriodo > 0 ? (ticketMedioLoja / ticketMedioGeralPeriodo) * 100 : 100;
            scorePct = Number(scorePct.toFixed(1));

            // Classificação nos 5 Níveis conforme regras especificadas:
            // > 100%: EXCEPCIONAL
            // 80% a 100%: BOM
            // 50% a 79%: MODERADO
            // 25% a 49%: BAIXO
            // < 25%: CRITICO
            let nivel: 'EXCEPCIONAL' | 'BOM' | 'MODERADO' | 'BAIXO' | 'CRITICO' = 'BOM';
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
        }

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

