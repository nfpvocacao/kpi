/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { NavigationTabs, TabId } from './components/NavigationTabs';
import { TabDesempenho } from './components/tabs/TabDesempenho';
import { TabEmpresas } from './components/tabs/TabEmpresas';
import { TabDoadores } from './components/tabs/TabDoadores';
import { TabDoadoresAutomaticos } from './components/tabs/TabDoadoresAutomaticos';
import { TabBenchmarking } from './components/tabs/TabBenchmarking';
import { DatabaseStatusModal } from './components/DatabaseStatusModal';
import { BusinessRulesModal } from './components/BusinessRulesModal';
import { BrandLogo } from './components/BrandLogo';
import { BrandBadge } from './components/BrandBadge';
import { 
  INITIAL_DATABASE_STATE, 
  METRICAS_MENSAIS, 
  EMPRESAS_PARCEIRAS, 
  DOADORES_REAIS 
} from './data/mockDatabase';
import { DatabaseState } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('desempenho');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026');
  const [databaseState, setDatabaseState] = useState<DatabaseState>(INITIAL_DATABASE_STATE);
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Filter metrics based on selected period
  const { metricasFiltradas, metricasAnterior, periodoLabel } = useMemo(() => {
    if (selectedPeriod === '2026') {
      const current = METRICAS_MENSAIS.filter(m => m.ano === 2026);
      const prior = METRICAS_MENSAIS.filter(m => m.ano === 2025).slice(0, current.length);
      return {
        metricasFiltradas: current,
        metricasAnterior: prior,
        periodoLabel: 'Ano de 2026 (Janeiro a Agosto)'
      };
    } else if (selectedPeriod === '2025') {
      const current = METRICAS_MENSAIS.filter(m => m.ano === 2025);
      const prior = METRICAS_MENSAIS.filter(m => m.ano === 2024);
      return {
        metricasFiltradas: current,
        metricasAnterior: prior,
        periodoLabel: 'Ano de 2025 (Consolidado)'
      };
    } else if (selectedPeriod === '2024') {
      const current = METRICAS_MENSAIS.filter(m => m.ano === 2024);
      return {
        metricasFiltradas: current,
        metricasAnterior: [],
        periodoLabel: 'Ano de 2024 (Histórico Inicial)'
      };
    } else if (selectedPeriod === 'LAST_12') {
      const current = METRICAS_MENSAIS.slice(-12);
      const prior = METRICAS_MENSAIS.slice(-24, -12);
      return {
        metricasFiltradas: current,
        metricasAnterior: prior,
        periodoLabel: 'Últimos 12 Meses'
      };
    } else {
      // ALL
      return {
        metricasFiltradas: METRICAS_MENSAIS,
        metricasAnterior: [],
        periodoLabel: 'Histórico Completo (2024 a 2026)'
      };
    }
  }, [selectedPeriod]);

  // Sync simulation handler
  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      const now = new Date();
      const horaFormatada = now.toLocaleTimeString('pt-BR');
      const dataFormatada = now.toLocaleDateString('pt-BR');
      setDatabaseState(prev => ({
        ...prev,
        ultimaSincronizacao: `${dataFormatada} ${horaFormatada}`,
        totalRegistrosCupons: prev.totalRegistrosCupons + 1420,
        cuponsDesduplicados: prev.cuponsDesduplicados + 84,
        tempoRespostaMs: Math.floor(Math.random() * 8) + 10
      }));
    }, 1200);
  };

  // Toggle between SQLite Cache and AWS RDS Fallback
  const handleToggleFallback = () => {
    setDatabaseState(prev => {
      const isSqlite = prev.fontePrimaria.includes('SQLite');
      return {
        ...prev,
        fontePrimaria: isSqlite 
          ? 'AWS RDS MySQL (backoffice.nfp_cupons_capturados)' 
          : 'SQLite Local Cache (nfp_database.db)',
        tempoRespostaMs: isSqlite ? 48 : 14
      };
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F6FAFD] text-[#002A3A] font-['Raleway',sans-serif]">
      
      {/* Top Application Header */}
      <Header
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        databaseState={databaseState}
        onOpenDatabaseModal={() => setIsDatabaseModalOpen(true)}
        onOpenRulesModal={() => setIsRulesModalOpen(true)}
        onSyncDatabase={handleSync}
        isSyncing={isSyncing}
      />

      {/* 5-Tabs Navigation Bar */}
      <NavigationTabs
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        metricsBadgeCounts={{
          empresasAtivas: EMPRESAS_PARCEIRAS.length,
          doadoresReais: DOADORES_REAIS.length,
          doadoresAuto: DOADORES_REAIS.filter(d => d.tipoDoacao === 'DOACAO_AUTOMATICA').length
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {activeTab === 'desempenho' && (
          <TabDesempenho
            metricasFiltradas={metricasFiltradas}
            metricasAnterior={metricasAnterior}
            periodoLabel={periodoLabel}
          />
        )}

        {activeTab === 'empresas' && (
          <TabEmpresas />
        )}

        {activeTab === 'doadores' && (
          <TabDoadores />
        )}

        {activeTab === 'automaticos' && (
          <TabDoadoresAutomaticos
            metricasFiltradas={metricasFiltradas}
          />
        )}

        {activeTab === 'benchmarking' && (
          <TabBenchmarking />
        )}
      </main>

      {/* Footer strictly adhering to Vocação Brand Manual */}
      <footer className="bg-white border-t border-[#BCD3DF]/80 mt-12 py-8 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-4">
            <BrandLogo variant="full" color="navy" />
            <div className="h-6 w-px bg-[#BCD3DF] hidden sm:block"></div>
            <div>
              <p className="text-xs text-[#004A6D]/80 font-semibold">
                NFP Analytics • Plataforma Estratégica de Gestão
              </p>
              <p className="text-[11px] text-[#004A6D]/60">
                Ação Comunitária do Brasil • Vocação | CNPJ 60.912.870/0001-38
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <BrandBadge 
              highlightText="potencial" 
              prefix="Onde" 
              suffix="encontra caminho" 
              colorVariant="yellow" 
              size="sm" 
            />
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-[#004A6D]">
            <button
              onClick={() => setIsRulesModalOpen(true)}
              className="hover:underline cursor-pointer"
            >
              Regras SEFAZ-SP
            </button>
            <span>•</span>
            <button
              onClick={() => setIsDatabaseModalOpen(true)}
              className="hover:underline cursor-pointer"
            >
              Arquitetura de Dados
            </button>
            <span>•</span>
            <span className="text-[11px] text-[#004A6D]/60">
              Manual de Marca V 1.1
            </span>
          </div>

        </div>
      </footer>

      {/* Modals */}
      <DatabaseStatusModal
        isOpen={isDatabaseModalOpen}
        onClose={() => setIsDatabaseModalOpen(false)}
        databaseState={databaseState}
        onToggleFallback={handleToggleFallback}
        onSync={handleSync}
        isSyncing={isSyncing}
      />

      <BusinessRulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />

    </div>
  );
}
