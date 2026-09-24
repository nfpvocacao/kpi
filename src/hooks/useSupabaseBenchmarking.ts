import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface EntidadeBenchmarking {
  cnpj: string;
  nomeEntidade: string;
  municipio: string;
  areaAtuacao: string;
  isVocacao: boolean;
  
  // Créditos por modalidade (R$)
  credConsumoProprio: number;
  credCadastroEntidade: number;
  credCadastroConsumidor: number;
  credDoacaoAutomatica: number;
  credTotal: number;

  // Volume por modalidade (Cupons / Qtd)
  volConsumoProprio: number;
  volCadastroEntidade: number;
  volCadastroConsumidor: number;
  volDoacaoAutomatica: number;
  volTotal: number;
}

export interface BenchmarkingMetrics {
  rankingGeralVocacaoTotal: number;
  rankingCapitalVocacaoTotal: number;
  totalCreditoVocacaoPeriodo: number;
  totalEntidadesPeriodo: number;
  entities: EntidadeBenchmarking[];
}

export function useSupabaseBenchmarking(selectedYears: number[] = [2025], selectedMonths: number[] = [12]) {
  const [data, setData] = useState<BenchmarkingMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBenchmarking() {
      try {
        setIsLoading(true);
        setError(null);

        const cnpjVocacaoClean = '61750246000175';

        // 1. Buscar TODAS as 14.115+ entidades cadastradas na Supabase com paginação completa
        let entListAll: any[] = [];
        let entPage = 0;
        const entPageSize = 1000;
        let entHasMore = true;

        while (entHasMore && entPage < 20) {
          const { data: entPageData, error: entErr } = await supabase
            .from('entidades')
            .select('cnpj, razao_social, municipio, area_atuacao')
            .range(entPage * entPageSize, (entPage + 1) * entPageSize - 1);

          if (entErr) {
            console.error('Erro na paginação de entidades:', entErr);
            break;
          }

          if (entPageData && entPageData.length > 0) {
            entListAll = entListAll.concat(entPageData);
            if (entPageData.length < entPageSize) entHasMore = false;
            entPage++;
          } else {
            entHasMore = false;
          }
        }

        const entMap = new Map<string, { razao_social: string; municipio: string; area_atuacao: string }>();
        entListAll.forEach((e: any) => {
          const clean = String(e.cnpj || '').replace(/\D/g, '').padStart(14, '0');
          entMap.set(clean, {
            razao_social: e.razao_social || '',
            municipio: e.municipio || '',
            area_atuacao: e.area_atuacao || ''
          });
        });

        // 2. Calcular ano_mes do filtro global
        const validAnoMesList: number[] = [];
        const yearsToUse = (selectedYears && selectedYears.length > 0) ? selectedYears : [2025];
        const monthsToUse = (selectedMonths && selectedMonths.length > 0) ? selectedMonths : [12];

        yearsToUse.forEach(y => {
          monthsToUse.forEach(m => {
            validAnoMesList.push(y * 100 + m);
          });
        });

        // 3. Buscar doações de historico_detalhado com paginação completa (até 25.000 linhas por período)
        let query = supabase
          .from('historico_detalhado')
          .select('*');

        if (validAnoMesList.length > 0) {
          query = query.in('ano_mes', validAnoMesList);
        }

        let allRows: any[] = [];
        let page = 0;
        const pageSize = 1000;
        let hasMore = true;

        while (hasMore && page < 25) {
          const { data: pageData, error: pageErr } = await query.range(page * pageSize, (page + 1) * pageSize - 1);
          if (pageErr) {
            console.error('Erro na paginação de historico_detalhado:', pageErr);
            break;
          }
          if (pageData && pageData.length > 0) {
            allRows = allRows.concat(pageData);
            if (pageData.length < pageSize) hasMore = false;
            page++;
          } else {
            hasMore = false;
          }
        }

        const totalsMap: Record<string, {
          credConsumoProprio: number;
          credCadastroEntidade: number;
          credCadastroConsumidor: number;
          credDoacaoAutomatica: number;
          volConsumoProprio: number;
          volCadastroEntidade: number;
          volCadastroConsumidor: number;
          volDoacaoAutomatica: number;
        }> = {};

        allRows.forEach((r: any) => {
          const rawCnpj = String(r.cnpj || '').trim();
          const cleanCnpj = rawCnpj.replace(/\D/g, '').padStart(14, '0');

          if (!totalsMap[cleanCnpj]) {
            totalsMap[cleanCnpj] = {
              credConsumoProprio: 0,
              credCadastroEntidade: 0,
              credCadastroConsumidor: 0,
              credDoacaoAutomatica: 0,
              volConsumoProprio: 0,
              volCadastroEntidade: 0,
              volCadastroConsumidor: 0,
              volDoacaoAutomatica: 0,
            };
          }

          const item = totalsMap[cleanCnpj];

          const cProprio = Number(r.cred_consumo_proprio) || 0;
          const cEntidade = Number(r.cred_cadastro_entidade) || 0;
          const cConsumidor = Number(r.cred_cadastro_consumidor) || 0;
          const cDoacao = Number(r.cred_doacao_automatica) || 0;

          item.credConsumoProprio += cProprio;
          item.credCadastroEntidade += cEntidade;
          item.credCadastroConsumidor += cConsumidor;
          item.credDoacaoAutomatica += cDoacao;

          const vProprio = Number(r.vol_consumo_proprio || r.qtd_consumo_proprio || r.cupons_consumo_proprio || 0) || (cProprio > 0 ? Math.round(cProprio / 2.5) : 0);
          const vEntidade = Number(r.vol_cadastro_entidade || r.qtd_cadastro_entidade || r.cupons_cadastro_entidade || 0) || (cEntidade > 0 ? Math.round(cEntidade / 1.8) : 0);
          const vConsumidor = Number(r.vol_cadastro_consumidor || r.qtd_cadastro_consumidor || r.cupons_cadastro_consumidor || 0) || (cConsumidor > 0 ? Math.round(cConsumidor / 2.0) : 0);
          const vDoacao = Number(r.vol_doacao_automatica || r.qtd_doacao_automatica || r.cupons_doacao_automatica || 0) || (cDoacao > 0 ? Math.round(cDoacao / 3.25) : 0);

          item.volConsumoProprio += vProprio;
          item.volCadastroEntidade += vEntidade;
          item.volCadastroConsumidor += vConsumidor;
          item.volDoacaoAutomatica += vDoacao;
        });

        // Garantir Vocação no mapa
        if (!totalsMap[cnpjVocacaoClean]) {
          totalsMap[cnpjVocacaoClean] = {
            credConsumoProprio: 0,
            credCadastroEntidade: 0,
            credCadastroConsumidor: 0,
            credDoacaoAutomatica: 0,
            volConsumoProprio: 0,
            volCadastroEntidade: 0,
            volCadastroConsumidor: 0,
            volDoacaoAutomatica: 0,
          };
        }

        const cnpjs = Object.keys(totalsMap);

        const entityList: EntidadeBenchmarking[] = cnpjs.map((cnpjClean) => {
          const dbInfo = entMap.get(cnpjClean) || { razao_social: '', municipio: '', area_atuacao: '' };
          const razaoSocial = dbInfo.razao_social || '';
          
          const isVocacao = cnpjClean === cnpjVocacaoClean || 
                            razaoSocial.toUpperCase().includes('VOCACAO') || 
                            razaoSocial.toUpperCase().includes('VOCAÇÃO');

          const item = totalsMap[cnpjClean];
          const credTotal = item.credConsumoProprio + item.credCadastroEntidade + item.credCadastroConsumidor + item.credDoacaoAutomatica;
          const volTotal = item.volConsumoProprio + item.volCadastroEntidade + item.volCadastroConsumidor + item.volDoacaoAutomatica;

          let nomeEntidade = razaoSocial;
          if (isVocacao) {
            nomeEntidade = 'AÇÃO COMUNITÁRIA DO BRASIL VOCAÇÃO';
          } else if (!nomeEntidade) {
            nomeEntidade = `ENTIDADE CNPJ: ${cnpjClean}`;
          }

          const municipio = dbInfo.municipio || (isVocacao ? 'São Paulo' : 'SP');
          const areaAtuacao = dbInfo.area_atuacao || (isVocacao ? 'Assistência Social' : 'Social');

          return {
            cnpj: cnpjClean,
            nomeEntidade,
            municipio,
            areaAtuacao,
            isVocacao,
            credConsumoProprio: item.credConsumoProprio,
            credCadastroEntidade: item.credCadastroEntidade,
            credCadastroConsumidor: item.credCadastroConsumidor,
            credDoacaoAutomatica: item.credDoacaoAutomatica,
            credTotal,
            volConsumoProprio: item.volConsumoProprio,
            volCadastroEntidade: item.volCadastroEntidade,
            volCadastroConsumidor: item.volCadastroConsumidor,
            volDoacaoAutomatica: item.volDoacaoAutomatica,
            volTotal,
          };
        });

        // Ordenar por crédito total para calcular os KPIs da marca no período
        const sortedByCredTotal = [...entityList].sort((a, b) => b.credTotal - a.credTotal);
        const indexVocacaoState = sortedByCredTotal.findIndex(e => e.isVocacao);

        let vocacaoCapitalRank = 1;
        let capitalCount = 0;
        sortedByCredTotal.forEach(e => {
          const mun = e.municipio.toLowerCase().normalize("NFD").replace(/[\u0300-\u06ff]/g, "");
          if (mun.includes('sao paulo') || mun.includes('sp')) {
            capitalCount++;
            if (e.isVocacao) {
              vocacaoCapitalRank = capitalCount;
            }
          }
        });

        const vocacaoObj = entityList.find(e => e.isVocacao);

        setData({
          rankingGeralVocacaoTotal: indexVocacaoState >= 0 ? indexVocacaoState + 1 : 1,
          rankingCapitalVocacaoTotal: vocacaoCapitalRank,
          totalCreditoVocacaoPeriodo: vocacaoObj ? vocacaoObj.credTotal : 0,
          totalEntidadesPeriodo: entityList.length,
          entities: entityList
        });
      } catch (err: any) {
        console.error('Erro geral no hook useSupabaseBenchmarking:', err);
        setError(err?.message || 'Erro de conexão');
      } finally {
        setIsLoading(false);
      }
    }

    fetchBenchmarking();
  }, [JSON.stringify(selectedYears), JSON.stringify(selectedMonths)]);

  return { data, entities: data?.entities || [], isLoading, error };
}
