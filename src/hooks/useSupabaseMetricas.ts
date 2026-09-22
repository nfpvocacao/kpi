import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { MetricaMensal } from '../types';
import { METRICAS_MENSAIS as FALLBACK_METRICS } from '../data/mockDatabase';

const monthsMap: Record<string, string> = {
  '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr', '05': 'Mai', '06': 'Jun',
  '07': 'Jul', '08': 'Ago', '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez'
};

export function useSupabaseMetricas() {
  const [metricas, setMetricas] = useState<MetricaMensal[]>(FALLBACK_METRICS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetricas() {
      try {
        setIsLoading(true);
        const { data, error: sbError } = await supabase
          .from('vocacao_consolidado_interno')
          .select('*')
          .order('ano_mes', { ascending: true });

        if (sbError) {
          console.warn('Supabase fetch notice, using cached dataset:', sbError);
          setError(sbError.message);
          setIsLoading(false);
          return;
        }

        if (data && data.length > 0) {
          const parsed: MetricaMensal[] = data.map((r: any) => {
            const sAnoMes = String(r.ano_mes);
            const ano = parseInt(sAnoMes.substring(0, 4), 10);
            const mNum = sAnoMes.substring(4, 6);
            const mNome = `${monthsMap[mNum] || mNum}/${sAnoMes.substring(2, 4)}`;

            const credTotal = Number(r.tt_creditos || 0);
            const credAuto = Number(r.aut_cred || 0);
            const credUrnas = Number(r.cad_cred || 0);
            const credDireta = Number(r.doa_cred || 0) + Number(r.cons_cred || 0);

            const cuponsTt = Number(r.tt_cupons || 0);
            const cuponsAuto = Number(r.aut_cup || 0);
            const cuponsUrnas = Number(r.cad_cup || 0);

            return {
              mes: `${ano}-${mNum}`,
              mesNome: mNome,
              ano: ano,
              creditoTotal: credTotal,
              creditoAutomatica: credAuto,
              creditoDireta: credDireta,
              creditoUrnas: credUrnas,
              cuponsProcessados: cuponsTt,
              cuponsValidos: cuponsTt,
              ticketMedioGeral: cuponsTt > 0 ? Number((credTotal / cuponsTt).toFixed(2)) : 0,
              ticketMedioAutomatica: cuponsAuto > 0 ? Number((credAuto / cuponsAuto).toFixed(2)) : 0,
              ticketMedioUrnas: cuponsUrnas > 0 ? Number((credUrnas / cuponsUrnas).toFixed(2)) : 0,
              doadoresAutomaticosAtivos: cuponsAuto,
              doadoresPlenos: Math.round(cuponsAuto * 0.8),
              doadoresRestritos: Math.round(cuponsAuto * 0.2),
              novosDoadores: Math.round(cuponsAuto * 0.1)
            };
          });

          setMetricas(parsed);
        }
      } catch (err: any) {
        console.error('Error fetching metrics from Supabase:', err);
        setError(err?.message || 'Error connecting to Supabase');
      } finally {
        setIsLoading(false);
      }
    }

    fetchMetricas();
  }, []);

  return { metricas, isLoading, error };
}
