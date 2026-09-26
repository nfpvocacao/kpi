import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface MapaInternoRow {
  id?: string;
  ano_mes: number | string;
  ano?: number;
  mes?: number;
  mesNome?: string;
  doadores_automaticos?: number;
  doadores_plenos?: number;
  doadores_restritos?: number;
  novos_doadores?: number;
  ticket_medio_auto?: number;
  ticket_medio_geral?: number;
  total_credito_auto?: number;
  total_cupons_auto?: number;
  aut_cred?: number;
  cad_cred?: number;
  doa_cred?: number;
  cons_cred?: number;
  aut_cup?: number;
  cad_cup?: number;
  doa_cup?: number;
  cons_cup?: number;
  raw?: any;
}

const monthsMap: Record<string, string> = {
  '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr', '05': 'Mai', '06': 'Jun',
  '07': 'Jul', '08': 'Ago', '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez'
};

export function useSupabaseMapaInterno() {
  const [data, setData] = useState<MapaInternoRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMapaInterno() {
      try {
        setIsLoading(true);
        setError(null);

        const { data: dbRows, error: sbError } = await supabase
          .from('vocacao_mapa_interno')
          .select('*');

        if (sbError) {
          console.error('Erro ao buscar vocacao_mapa_interno:', sbError);
          setError(sbError.message);
          setIsLoading(false);
          return;
        }

        if (dbRows && dbRows.length > 0) {
          console.log('VOCACAO_MAPA_INTERNO REGISTROS:', dbRows);
          
          // Ordenar por data 'mes' (ex: '2018-06-01')
          dbRows.sort((a: any, b: any) => String(a.mes || '').localeCompare(String(b.mes || '')));

          const parsed: MapaInternoRow[] = dbRows.map((r: any, idx: number) => {
            const rawMes = String(r.mes || '');
            let ano = 2026;
            let mNum = '05';
            let mNome = rawMes;

            if (rawMes.length >= 7) {
              const parts = rawMes.split('-');
              ano = parseInt(parts[0], 10);
              mNum = parts[1];
              mNome = `${monthsMap[mNum] || mNum}/${String(ano).substring(2, 4)}`;
            }

            const doadoresPlenos = Number(r.doadores_plenos || 0);
            const doadoresRestritos = Number(r.doadores_restritos || 0);
            const totalDoadores = Number(r.total_doadores || (doadoresPlenos + doadoresRestritos) || 0);

            // aut_cup é o total real de cupons reconhecidos no crédito; se for 0, fallback para qtde_cupons
            const autCupRaw = Number(r.aut_cup || 0);
            const qtdeCuponsRaw = Number(r.qtde_cupons || 0);
            const totalCuponsAuto = autCupRaw > 0 ? autCupRaw : qtdeCuponsRaw;

            // aut_cred é o total de créditos somente dos automatizados
            const totalCreditoAuto = Number(r.aut_cred || r.credito_total || r.total_credito || 0);

            // Ticket médio entre crédito total automatizado (aut_cred) e quantidade de cupons automatizados
            const ticketAuto = totalCuponsAuto > 0 ? (totalCreditoAuto / totalCuponsAuto) : Number(r.ticket_medio || 0);

            return {
              id: r.id || `${rawMes}-${idx}`,
              ano_mes: rawMes,
              ano,
              mes: parseInt(mNum, 10),
              mesNome: mNome,
              doadores_automaticos: totalDoadores,
              doadores_plenos: doadoresPlenos,
              doadores_restritos: doadoresRestritos,
              novos_doadores: Number(r.novos_doadores || r.novos || 0),
              ticket_medio_auto: Number(ticketAuto.toFixed(2)),
              ticket_medio_geral: Number((r.ticket_medio_geral || ticketAuto).toFixed(2)),
              total_credito_auto: Number(totalCreditoAuto.toFixed(2)),
              total_cupons_auto: totalCuponsAuto,
              aut_cred: Number(r.aut_cred || 0),
              cad_cred: Number(r.cad_cred || 0),
              doa_cred: Number(r.doa_cred || 0),
              cons_cred: Number(r.cons_cred || 0),
              aut_cup: Number(r.aut_cup || 0),
              cad_cup: Number(r.cad_cup || 0),
              doa_cup: Number(r.doa_cup || 0),
              cons_cup: Number(r.cons_cup || 0),
              raw: r
            };
          });

          setData(parsed);
        }
      } catch (err: any) {
        console.error('Falha geral no hook useSupabaseMapaInterno:', err);
        setError(err?.message || 'Erro');
      } finally {
        setIsLoading(false);
      }
    }

    fetchMapaInterno();
  }, []);

  return { data, isLoading, error };
}
