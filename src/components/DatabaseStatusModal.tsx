import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Server, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Layers, 
  ShieldCheck,
  Cpu,
  Clock,
  ArrowRight
} from 'lucide-react';
import { DatabaseState } from '../types';
import { RAW_COUPONS_SAMPLE, formatarNumero } from '../data/mockDatabase';

interface DatabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  databaseState: DatabaseState;
  onToggleFallback: () => void;
  onSync: () => void;
  isSyncing: boolean;
}

export const DatabaseStatusModal: React.FC<DatabaseStatusModalProps> = ({
  isOpen,
  onClose,
  databaseState,
  onToggleFallback,
  onSync,
  isSyncing
}) => {
  const [activeView, setActiveView] = useState<'status' | 'dedup_sample'>('status');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white border border-[#BCD3DF] rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#004A6D] to-[#002A3A] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-white/10 text-[#00E3E6]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight font-['Raleway',sans-serif]">
                Arquitetura de Dados & Cache Analítico
              </h3>
              <p className="text-xs text-white/70">
                Resiliência Multi-Tier: SQLite Local (`nfp_database.db`) e AWS RDS MySQL
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Subnav */}
        <div className="flex border-b border-[#BCD3DF] px-6 bg-[#F4F9FA] text-xs font-bold">
          <button
            onClick={() => setActiveView('status')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
              activeView === 'status'
                ? 'border-[#004A6D] text-[#004A6D]'
                : 'border-transparent text-[#004A6D]/60 hover:text-[#004A6D]'
            }`}
          >
            Conectividade & Nós de Dados
          </button>
          <button
            onClick={() => setActiveView('dedup_sample')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
              activeView === 'dedup_sample'
                ? 'border-[#004A6D] text-[#004A6D]'
                : 'border-transparent text-[#004A6D]/60 hover:text-[#004A6D]'
            }`}
          >
            Auditoria da Regra 3 (Desduplicação)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {activeView === 'status' ? (
            <>
              {/* Active Tier Highlight */}
              <div className="bg-[#D9FBFF]/40 border border-[#00E3E6] rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#004A6D] text-[#00E3E6]">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#004A6D]/70 block">
                      Fonte de Consulta Ativa
                    </span>
                    <span className="font-extrabold text-[#002A3A] text-sm">
                      {databaseState.fontePrimaria}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-[#004A6D] mt-0.5">
                      <span className="flex items-center gap-1 font-semibold text-[#00E04B]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Online & Sincronizado
                      </span>
                      <span>•</span>
                      <span>Latência: {databaseState.tempoRespostaMs}ms</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={onToggleFallback}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-[#004A6D] text-[#004A6D] hover:bg-[#004A6D] hover:text-white transition-colors cursor-pointer"
                >
                  Testar Fallback RDS
                </button>
              </div>

              {/* Grid of Data Source Tiers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                {/* Local Cache Card */}
                <div className="border border-[#BCD3DF] rounded-xl p-4 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#002A3A] flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-[#004A6D]" /> SQLite Local Cache
                    </span>
                    <span className="bg-[#00E04B]/20 text-[#006E24] px-2 py-0.5 rounded text-[10px] font-black">
                      Primário
                    </span>
                  </div>
                  <p className="text-[#004A6D]/70 text-[11px]">
                    Arquivo <code className="bg-[#F4F9FA] px-1 py-0.5 rounded font-mono text-[#004A6D]">nfp_database.db</code> com índices otimizados para dashboards de alta performance.
                  </p>
                  <div className="pt-2 border-t border-[#F0F5F8] text-[11px] text-[#004A6D] space-y-1">
                    <div className="flex justify-between">
                      <span>Registros:</span>
                      <strong className="font-mono">{formatarNumero(databaseState.totalRegistrosCupons)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Última Sincronização:</span>
                      <strong>{databaseState.ultimaSincronizacao}</strong>
                    </div>
                  </div>
                </div>

                {/* Cloud MySQL RDS Card */}
                <div className="border border-[#BCD3DF] rounded-xl p-4 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#002A3A] flex items-center gap-1.5">
                      <Server className="w-4 h-4 text-[#00E3E6]" /> AWS RDS MySQL
                    </span>
                    <span className="bg-[#D9FBFF] text-[#004A6D] px-2 py-0.5 rounded text-[10px] font-black">
                      Hot Standby
                    </span>
                  </div>
                  <p className="text-[#004A6D]/70 text-[11px]">
                    Tabelas: <code className="bg-[#F4F9FA] px-1 py-0.5 rounded font-mono text-[#004A6D]">backoffice.nfp_cupons_capturados</code>, <code className="bg-[#F4F9FA] px-1 py-0.5 rounded font-mono text-[#004A6D]">nfp_empresas</code>, <code className="bg-[#F4F9FA] px-1 py-0.5 rounded font-mono text-[#004A6D]">nfp_doadores</code>.
                  </p>
                  <div className="pt-2 border-t border-[#F0F5F8] text-[11px] text-[#004A6D] space-y-1">
                    <div className="flex justify-between">
                      <span>Status Fallback:</span>
                      <span className="text-[#00E04B] font-bold">Disponível</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Host:</span>
                      <span className="font-mono truncate max-w-[130px]">rds-mysql-prod.sa-east-1</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Sync Actions */}
              <div className="bg-[#F8FCFD] border border-[#BCD3DF] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs">
                  <span className="font-bold text-[#002A3A] block">
                    Atualização Periódica de Lotes SEFAZ
                  </span>
                  <span className="text-[#004A6D]/70 text-[11px]">
                    Baixa novos registros capturados no app e consolida desduplicação em background.
                  </span>
                </div>
                <button
                  onClick={onSync}
                  disabled={isSyncing}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#004A6D] hover:bg-[#002A3A] text-white flex items-center gap-2 transition-colors shrink-0 shadow-xs cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#00E3E6]' : ''}`} />
                  <span>{isSyncing ? 'Sincronizando Banco...' : 'Executar Sincronização Agora'}</span>
                </button>
              </div>
            </>
          ) : (
            /* Auditoria Regra 3 */
            <div className="space-y-4">
              <div className="bg-[#F4F9FA] border border-[#BCD3DF] rounded-xl p-4 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-[#004A6D]">
                  <ShieldCheck className="w-4 h-4 text-[#00E04B]" />
                  <span>Exemplo de Desduplicação em Execução no Banco de Dados</span>
                </div>
                <p className="text-[#002A3A]/80 text-[11px] leading-relaxed">
                  Quando múltiplos registros com o mesmo número de cupom e estabelecimento são inseridos (por exemplo por digitação e posterior leitura no app), o motor de dados do NFP Analytics aplica a <strong>Regra 3</strong>: prioriza estritamente o cupom com status <code className="bg-[#D9FBFF] px-1 py-0.5 rounded font-mono text-[#004A6D] font-bold">&apos;Pedido com documento encontrado.&apos;</code> e descarta o temporário.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-[#004A6D] block">
                  Registros Brutos Identificados no Período Recente:
                </span>

                <div className="space-y-2 text-xs">
                  {RAW_COUPONS_SAMPLE.map((c) => {
                    const isPrioritized = c.statusPedido === 'Pedido com documento encontrado.';
                    const isDiscarded = c.statusPedido === 'Pedido em processamento';

                    return (
                      <div 
                        key={c.id} 
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                          isDiscarded 
                            ? 'bg-red-50/50 border-red-200 opacity-60' 
                            : 'bg-green-50/50 border-green-200'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#002A3A]">{c.numeroCupom}</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-gray-200">
                              {c.tipoDoacao}
                            </span>
                            <span className="text-[11px] text-[#004A6D]">{c.nomeEstabelecimento}</span>
                          </div>
                          <div className="text-[11px] text-[#004A6D]/80 mt-1">
                            Status: <strong className={isPrioritized ? 'text-[#006E24]' : 'text-red-700'}>{c.statusPedido}</strong>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            isDiscarded ? 'bg-red-200 text-red-800' : 'bg-[#00E04B] text-[#002A3A]'
                          }`}>
                            {isDiscarded ? 'Descartado na desduplicação' : 'Mantido (Regra 3)'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-[#F4F9FA] border-t border-[#BCD3DF] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#004A6D] text-white hover:bg-[#002A3A] transition-colors cursor-pointer"
          >
            Fechar Janela
          </button>
        </div>

      </div>
    </div>
  );
};
