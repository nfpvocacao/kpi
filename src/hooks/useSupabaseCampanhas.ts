import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { CampanhaCaptacao, MOCK_CAMPANHAS_BITRIX } from '../components/tabs/TabCampanhas';

export function useSupabaseCampanhas() {
  const [campanhas, setCampanhas] = useState<CampanhaCaptacao[]>(MOCK_CAMPANHAS_BITRIX);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function carregarCampanhas() {
      try {
        setIsLoading(true);
        // Tenta buscar da tabela no Supabase
        const { data, error: sbError } = await supabase
          .from('nfp_campanhas_bitrix')
          .select('*')
          .order('data_inicio', { ascending: false });

        if (sbError) {
          // Se a tabela ainda estiver em processo de criação no Supabase, usa o fallback estruturado
          console.warn('Tabela nfp_campanhas_bitrix ainda não disponível no Supabase, utilizando dados em cache local:', sbError.message);
          if (isMounted) {
            setCampanhas(MOCK_CAMPANHAS_BITRIX);
            setIsLoading(false);
          }
          return;
        }

        if (data && data.length > 0 && isMounted) {
          const formatadas: CampanhaCaptacao[] = data.map((d: any) => ({
            id: d.id,
            nomeAcao: d.nome_campanha || d.nome_acao || 'Ação NFP',
            dataInicio: d.data_inicio || '',
            dataFim: d.data_fim || '',
            responsavel: d.responsavel || 'Não Informado',
            localOuParceiro: d.local_ou_parceiro || 'Iniciativa Bitrix24',
            status: d.status || 'CONCLUIDA',
            totalCadastrosBitrix: Number(d.total_cadastros || d.total_cadastros_bitrix || 0),
            novosCpfsConquistados: Number(d.novos_cpfs_conquistados || 0),
            cpfsPreexistentes: Number(d.cpfs_preexistentes || 0),
            ativadosComCredito: Number(d.ativados_com_credito || 0),
            ativadosTotal: Number(d.ativados_total ?? d.ativados_com_credito ?? 0),
            creditoEstimado: Number(d.credito_estimado || 0),
            creditoRealizado: Number(d.credito_realizado || 0),
            creditoRealizadoAcumulado: Number(d.credito_realizado_acumulado ?? d.credito_realizado ?? 0),
            mesPrevisaoLiberacao: d.previsao_liberacao || d.mes_previsao_liberacao || 'Em Apuração',
            descricao: d.descricao || '',
            cpfsDetalhes: Array.isArray(d.cpfs_detalhes) ? d.cpfs_detalhes : []
          }));
          setCampanhas(formatadas);
        } else if (isMounted) {
          setCampanhas(MOCK_CAMPANHAS_BITRIX);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Erro ao carregar dados do Bitrix');
          setCampanhas(MOCK_CAMPANHAS_BITRIX);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    carregarCampanhas();

    return () => {
      isMounted = false;
    };
  }, []);

  return { campanhas, isLoading, error };
}
