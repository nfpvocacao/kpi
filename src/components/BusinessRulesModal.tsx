import React from 'react';
import { X, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface BusinessRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BusinessRulesModal: React.FC<BusinessRulesModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white border border-[#BCD3DF] rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#004A6D] to-[#002A3A] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo variant="icon" color="cyan" className="w-8 h-5" />
            <div>
              <h3 className="font-extrabold text-base tracking-tight font-['Raleway',sans-serif]">
                Regras Fundamentais de Cálculo & Compliance
              </h3>
              <p className="text-xs text-white/70">
                Diretrizes de apuração da Nota Fiscal Paulista para a Vocação
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

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          
          {/* Rule 1 */}
          <div className="bg-[#F8FCFD] border-2 border-[#004A6D]/30 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#004A6D] text-white flex items-center justify-center font-black text-xs">
                1
              </span>
              <h4 className="font-extrabold text-sm text-[#004A6D]">
                Regra de Cadastradores (Urnas & Digitação)
              </h4>
            </div>
            <p className="text-[#002A3A] leading-relaxed pl-8">
              Cupons cadastrados sob o tipo <code className="bg-[#D9FBFF] px-1.5 py-0.5 rounded font-mono text-[#004A6D] font-bold">TipoDoacao = &apos;CADASTRO&apos;</code> (efetuados por cadastradores físicos e digitadores) representam operações de empresas parceiras e urnas físicas em pontos comerciais. 
            </p>
            <div className="pl-8 flex items-center gap-2 text-[#E03F2A] font-bold">
              <AlertTriangle className="w-4 h-4 text-[#E03F2A]" />
              <span>NÃO devem ser contabilizados como doações pessoais de pessoas físicas.</span>
            </div>
          </div>

          {/* Rule 2 */}
          <div className="bg-[#F8FCFD] border-2 border-[#00E3E6]/60 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#00E3E6] text-[#002A3A] flex items-center justify-center font-black text-xs">
                2
              </span>
              <h4 className="font-extrabold text-sm text-[#004A6D]">
                Regra de Doadores Reais (Pessoas Físicas)
              </h4>
            </div>
            <p className="text-[#002A3A] leading-relaxed pl-8">
              Doações reais de pessoas físicas são estritamente filtradas por:
            </p>
            <div className="pl-8">
              <div className="bg-white border border-[#BCD3DF] rounded-lg p-2.5 font-mono text-[#004A6D] font-bold">
                WHERE TipoDoacao IN (&apos;DOACAO_AUTOMATICA&apos;, &apos;DOACAO&apos;)
              </div>
            </div>
            <p className="text-[#004A6D]/80 leading-relaxed pl-8 text-[11px]">
              Esses cupons contêm CPF do doador e vinculação individual, permitindo métricas de LTV, recorrência e análise loja a loja.
            </p>
          </div>

          {/* Rule 3 */}
          <div className="bg-[#F8FCFD] border-2 border-[#00E04B]/60 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#00E04B] text-[#002A3A] flex items-center justify-center font-black text-xs">
                3
              </span>
              <h4 className="font-extrabold text-sm text-[#004A6D]">
                Regra de Desduplicação de Cupons
              </h4>
            </div>
            <p className="text-[#002A3A] leading-relaxed pl-8">
              Em cupons fiscais duplicados no banco de dados (ex: importação preliminar vs apuração definitiva), priorizar sempre o registro que possui:
            </p>
            <div className="pl-8">
              <div className="bg-white border border-[#00E04B] rounded-lg p-2.5 font-mono text-[#006E24] font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00E04B]" />
                StatusdoPedido = &apos;Pedido com documento encontrado.&apos;
              </div>
            </div>
            <p className="text-[#004A6D]/80 leading-relaxed pl-8 text-[11px]">
              Cupons com outros status temporários (&apos;Pedido em processamento&apos;) são desconsiderados caso exista o registro definitivo validado.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#F4F9FA] border-t border-[#BCD3DF] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#004A6D] text-white hover:bg-[#002A3A] transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
};
