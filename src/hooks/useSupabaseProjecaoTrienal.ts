import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface ProjecaoTrienalRow {
  id: string;
  ano: number;
  mes: number | null;
  tipo_registro: 'mensal' | 'consolidado_anual';
  receita_cadastro: number;
  receita_automatizacao: number;
  receita_doacao: number;
  receita_consumo: number;
  receita_sorteio?: number;
  receita_ajustes?: number;
  receita_total: number;
  despesa_rh_comercial?: number;
  despesa_rh_adm?: number;
  despesa_rh_operacional?: number;
  despesa_rh_total?: number;
  despesa_op_separacao_digitacao?: number;
  despesa_op_locomocao?: number;
  despesa_op_coleta?: number;
  despesa_op_divulgacao?: number;
  despesa_op_outras?: number;
  despesa_operacional_total?: number;
  despesa_total: number;
  resultado_liquido: number;
  fontes_referenciadas?: string;
  created_at?: string;
}

export function useSupabaseProjecaoTrienal() {
  const [data, setData] = useState<ProjecaoTrienalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const { data: rows, error: err } = await supabase
          .from('nfp_projecao_trienal')
          .select('*')
          .order('ano', { ascending: true })
          .order('mes', { ascending: true, nullsFirst: false });

        if (err) throw err;
        setData(rows || []);
      } catch (e: any) {
        console.error('Erro ao buscar projecao trienal:', e);
        setError(e.message || 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, loading, error };
}

