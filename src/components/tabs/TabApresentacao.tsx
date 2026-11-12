import React from 'react';
import { GraficoTrienalComparativo } from '../GraficoTrienalComparativo';
import { GraficoMensalCreditos } from '../GraficoMensalCreditos';
import { MetricaMensal } from '../../types';

interface TabApresentacaoProps {
  metricasFiltradas?: MetricaMensal[];
  selectedYears?: number[];
  selectedMonths?: number[];
}

export const TabApresentacao: React.FC<TabApresentacaoProps> = () => {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Gráfico de Evolução Trienal e Projeção (Receita x Custo de Captação x Resultado Líquido + Duplo Colchete) */}
      <GraficoTrienalComparativo />

      {/* 2. Gráfico de Evolução Mensal: Créditos Canal Automatização + Tabela Fixa Alinhada 1:1 */}
      <GraficoMensalCreditos />
    </div>
  );
};
