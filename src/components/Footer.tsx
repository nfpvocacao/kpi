import React from 'react';
import { BrandBadge } from './BrandBadge';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-12 py-5 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>
          <span className="text-[#002a3a] text-sm font-black tracking-tight">V∩CAÇÃO</span>
          <span className="mx-2 text-slate-300">|</span>
          <span className="font-bold text-slate-700">NFP Analytics • Plataforma Estratégica de Gestão</span>
          <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
            Ação Comunitária do Brasil • Vocação | CNPJ 60.912.870/0001-38
          </div>
        </div>
        
        <div className="font-bold text-[#002a3a] text-xs">
          <BrandBadge prefix="Onde potencial encontra" highlightText="caminho" colorVariant="yellow" size="sm" />
        </div>

        <div className="flex items-center gap-2 font-semibold text-[#004a6d] text-[11px]">
          <a href="#" className="hover:underline">Regras SEFAZ-SP</a>
          <span className="text-slate-300">•</span>
          <a href="#" className="hover:underline">Arquitetura de Dados</a>
          <span className="text-slate-300">•</span>
          <a href="#" className="hover:underline">Manual de Marca V 1.1</a>
        </div>
      </div>
    </footer>
  );
};

