import React from 'react';
import { X, Database, CheckCircle2 } from 'lucide-react';

interface DatabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseStatusModal: React.FC<DatabaseStatusModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-[#002a3a]">
            <Database className="w-6 h-6 text-[#004a6d]" />
            <h3 className="font-bold text-lg">Status da Arquitetura Multi-Tier</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="py-4 space-y-3">
          <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="font-semibold text-sm text-emerald-900">Cache Primary (SQLite Local)</span>
            </div>
            <span className="text-xs font-bold bg-emerald-200 text-emerald-800 px-2 py-1 rounded-md">Ativo (14ms)</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="font-semibold text-sm text-slate-700">Cloud Fallback (AWS RDS MySQL)</span>
            <span className="text-xs font-bold bg-slate-200 text-slate-700 px-2 py-1 rounded-md">Conectado</span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 text-right">
          <button onClick={onClose} className="px-5 py-2 bg-[#004a6d] text-white font-semibold text-sm rounded-xl hover:bg-[#002a3a] transition-all">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
