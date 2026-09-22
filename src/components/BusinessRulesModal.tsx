import React from 'react';
import { X, ShieldCheck, CheckCircle2, FileText, Percent, Scale, Coins } from 'lucide-react';
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
      <div className="bg-white border border-[#BCD3DF] rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#002A3A] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#004A6D] text-[#00E3E6]">
              <ShieldCheck className="w-5 h-5 text-[#00E3E6]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">
                Regras Oficiais de Cálculo & Legislação SEFAZ-SP
              </h3>
              <p className="text-xs text-[#BCD3DF]">
                Parâmetros legais e regras de apuração do Programa Nota Fiscal Paulista
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
        <div className="p-6 space-y-4 max-h-[78vh] overflow-y-auto text-xs">
          
          {/* Regra 1: Teto por Cupom e UFESP */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#004A6D] text-[#00E3E6]">
                <Scale className="w-4 h-4" />
              </div>
              <h4 className="font-extrabold text-sm text-[#002A3A]">
                1. Teto Máximo de Crédito por Cupom (10 UFESPs)
              </h4>
            </div>
            <p className="text-slate-700 leading-relaxed pl-8">
              Conforme a legislação e regulamentação oficial da SEFAZ-SP (Resolução SF 56/2009), o valor máximo de crédito que um único cupom fiscal pode gerar é travado no teto de <strong>10 UFESPs</strong> (Unidade Fiscal do Estado de São Paulo).
            </p>
            <div className="pl-8 flex items-center gap-2 text-[#004A6D] font-bold text-[11px] bg-sky-50 p-2 rounded-xl border border-sky-200">
              <Coins className="w-4 h-4 text-[#00E3E6]" />
              <span>Evita distorções com compras de altíssimo valor e limita o crédito máximo por nota (R$ 384,20).</span>
            </div>
          </div>

          {/* Regra 2: Reserva de 60% e Percentual de ICMS */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#004A6D] text-[#00E3E6]">
                <Percent className="w-4 h-4" />
              </div>
              <h4 className="font-extrabold text-sm text-[#002A3A]">
                2. Reserva Exclusiva para Entidades (60% do ICMS Devolvido)
              </h4>
            </div>
            <p className="text-slate-700 leading-relaxed pl-8">
              Do montante total de ICMS devolvido pelo Estado de São Paulo no programa NFP, <strong>60% são destinados exclusivamente para Entidades Beneficentes Cadastradas</strong> (Assistência Social, Saúde, Educação e Proteção Animal).
            </p>
            <div className="pl-8 text-slate-600 text-[11px] leading-relaxed">
              O repasse por estabelecimento comercial tem um teto de até <strong>7,5% do ICMS recolhido pela loja</strong>, sendo distribuído proporcionalmente entre os cupons doados à instituição.
            </div>
          </div>

          {/* Regra 3: Modalidades de Doação (Automática vs Urna/Digitador) */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#004A6D] text-[#00E3E6]">
                <FileText className="w-4 h-4" />
              </div>
              <h4 className="font-extrabold text-sm text-[#002A3A]">
                3. Modalidades de Captação Reconhecidas
              </h4>
            </div>
            <div className="pl-8 space-y-2">
              <div className="bg-white border border-slate-200 rounded-xl p-3">
                <strong className="text-[#004A6D] block mb-0.5">Doação Automática (Com CPF):</strong>
                <p className="text-slate-600 text-[11px]">
                  O doador cadastra o CNPJ da Vocação no aplicativo Nota Fiscal Paulista. Qualquer compra com CPF gera crédito automático e recorrente para a instituição.
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-3">
                <strong className="text-[#004A6D] block mb-0.5">Doação Direta (Urna / Digitador):</strong>
                <p className="text-slate-600 text-[11px]">
                  Cupons fiscais sem CPF depositados em urnas parceiras. Devem ser registrados no sistema SEFAZ no prazo regulamentar (até o dia 20 do mês subsequente à emissão).
                </p>
              </div>
            </div>
          </div>

          {/* Regra 4: Prazos e Validade dos Créditos */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#004A6D] text-[#00E3E6]">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h4 className="font-extrabold text-sm text-[#002A3A]">
                4. Cronograma de Liberação e Validade de Resgate
              </h4>
            </div>
            <p className="text-slate-700 leading-relaxed pl-8">
              A SEFAZ-SP libera os créditos calculados semestralmente/mensalmente diretamente no portal oficial. 
            </p>
            <div className="pl-8 font-bold text-[#004A6D] text-[11px]">
              &bull; Prazo de resgate: Os créditos possuem validade de 12 meses a contar da data de liberação oficial pela Fazenda Estadual.
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-black bg-[#004A6D] text-white hover:bg-[#002A3A] transition-colors cursor-pointer shadow-md"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
};
