import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qodhmytsayifaduwgtwu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZGhteXRzYXlpZmFkdXdndHd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwODgyMzAsImV4cCI6MjEwNTY2NDIzMH0.5iqQwlIhqeglanWcLgZZ7kS9IqMQv3_GirJNccLZEa8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Utilitário global para contornar o limite rígido de 1.000 registros do Supabase/PostgREST.
 * Executa paginação em paralelo via count + range.
 */
export async function fetchAllParallel<T = any>(
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
