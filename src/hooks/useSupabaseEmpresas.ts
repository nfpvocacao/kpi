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
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);

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

        console.log('SUPABASE FETCH COMPLETO:', {
          totalLinhas: allKpiRows.length,
          sumCupons,
          sumCredito: Number(sumCredito.toFixed(2)),
          sumCreditoUrnas: Number(sumCreditoUrnas.toFixed(2)),
          sumCreditoDoacoes: Number(sumCreditoDoacoes.toFixed(2))
        });

        setTotalEmpresasContagem(allKpiRows.length);
        setKpis({
          totalCupons: sumCupons,
          totalValorNF: sumValorNF,
          totalCredito: Number(sumCredito.toFixed(2)),
          totalCreditoUrnas: Number(sumCreditoUrnas.toFixed(2)),
          totalCreditoDoacoes: Number(sumCreditoDoacoes.toFixed(2)),
        });

        // 2. Query para a lista (Top N ou busca filtrada diretamente no Supabase)
        let queryList = supabase
          .from('vocacao_resumo_mensal_empresas')
          .select('*');

        if (selectedMonths && selectedMonths.length > 0) {
          queryList = queryList.in('mes', selectedMonths);
        }
        if (searchTerm.trim()) {
          const s = searchTerm.trim();
          const cleanDigits = s.replace(/\D/g, '');

          if (cleanDigits.length >= 8) {
            // Se o usuário digitou números (com ou sem pontuação)
            let formattedCnpj = cleanDigits;
            if (cleanDigits.length === 14) {
              formattedCnpj = cleanDigits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
            }
            queryList = queryList.or(`nome_empresa.ilike.%${s}%,cnpj.ilike.%${s}%,cnpj.ilike.%${cleanDigits}%,cnpj.ilike.%${formattedCnpj}%`);
          } else {
            queryList = queryList.or(`nome_empresa.ilike.%${s}%,cnpj.ilike.%${s}%`);
          }
        }

        queryList = queryList.order('total_credito_apurado', { ascending: false }).limit(limit);

        const { data: listData, error: listError } = await queryList;

        if (listError) {
          console.error('Erro ao buscar lista de empresas:', listError);
          setError(listError.message);
        } else if (listData) {
          const map = new Map<string, EmpresaParceira>();

          listData.forEach((r: any) => {
            const cnpjKey = r.cnpj || '00.000.000/0000-00';
            const nome = r.nome_empresa || 'Empresa Parceira';

            let cat: EmpresaParceira['categoria'] = 'Serviços & Outros';
            const lowerNome = nome.toLowerCase();
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
                razaoSocial: nome,
                nomeFantasia: nome,
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
                cidade: 'São Paulo'
              });
            }

            const item = map.get(cnpjKey)!;
            item.cuponsValidos += Number(r.total_cupons || 0);
            item.valorTotalNotas += Number(r.total_valor_nf || 0);
            item.creditoTotal += Number(r.total_credito_apurado || 0);
            item.creditoUrnas += Number(r.credito_cadastro || 0);
            item.creditoDoacoes += Number(r.credito_doacao || 0);
          });

          const parsedList = Array.from(map.values()).map(e => ({
            ...e,
            creditoTotal: Number(e.creditoTotal.toFixed(2)),
            creditoUrnas: Number(e.creditoUrnas.toFixed(2)),
            creditoDoacoes: Number(e.creditoDoacoes.toFixed(2)),
            valorTotalNotas: Number(e.valorTotalNotas.toFixed(2)),
            ticketMedioCupom: e.cuponsValidos > 0 ? Number((e.creditoTotal / e.cuponsValidos).toFixed(2)) : 0
          }));

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

      // PostgREST max fetch pagination logic se necessário
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

  return {
    topEmpresas,
    totalEmpresasContagem,
    kpis,
    isLoading,
    isExporting,
    error,
    downloadFullCSV,
  };
}
