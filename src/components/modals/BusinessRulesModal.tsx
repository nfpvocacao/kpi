import React from 'react';
import { X, ShieldCheck } from 'lucide-react';

interface BusinessRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BusinessRulesModal: React.FC<BusinessRulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-[#002a3a]">
            <ShieldCheck className="w-6 h-6 text-[#00e3e6]" />
            <h3 className="font-bold text-lg">Regras de Cálculo & Compliance SEFAZ-SP</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="py-4 space-y-4 text-sm text-slate-600">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 font-medium">
            ⚠️ <b>Regra 1 (Operações Comerciais vs Doação PF):</b> Urnas e digitação (CADASTRO) operam via empresas parceiras e NÃO são doações de Pessoas Físicas.
          </div>
          <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-sky-900 font-medium">
            🔹 <b>Regra 2 (Filtro Estrito PF):</b> Doadores Reais (PF) consideram exclusivamente <code>DOACAO_AUTOMATICA</code> e <code>DOACAO</code> atreladas a CPF.
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 font-medium">
            ✅ <b>Regra 3 (Desduplicação SEFAZ):</b> Prioriza documentos com <code>StatusdoPedido = 'Pedido com documento encontrado.'</code>.
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 text-right">
          <button onClick={onClose} className="px-5 py-2 bg-[#004a6d] text-white font-semibold text-sm rounded-xl hover:bg-[#002a3a] transition-all">
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
