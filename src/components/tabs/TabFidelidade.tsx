import React from 'react';
import { Users, UserCheck, TrendingUp, Zap, RefreshCw } from 'lucide-react';
import { BrandBadge } from '../BrandBadge';

export const TabFidelidade: React.FC = () => {
  return (
    <div className="space-y-6">
      
      {/* 1. Header da Aba 4 (Doadores Automáticos) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#002a3a] flex items-center gap-2 tracking-tight">
            Doadores Automáticos & Recorrência (Histórico)
            <BrandBadge highlightText="recorrência" prefix="Fidelidade &" suffix="garantida" colorVariant="green" size="sm" />
          </h2>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Inteligência de retenção e LTV da modalidade mais sustentável e de maior rentabilidade da Nota Fiscal Paulista.
          </p>
        </div>

        <div className="bg-[#d7f7f8] border border-[#a5f3fc] text-[#008ba3] px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 self-start md:self-auto shadow-xs">
          <RefreshCw className="w-3.5 h-3.5 text-[#008ba3]" />
          <span>Base Ativa: 3.080 doadores cadastrados</span>
        </div>
      </div>

      {/* 2. Grid dos 4 KPI Cards do AI Studio (Imagem 3) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Base de Doadores Automáticos */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">BASE DE DOADORES AUTOMÁTICOS</h3>
              <span className="inline-block mt-1 bg-[#d7f7f8] text-[#008ba3] text-[10px] font-extrabold px-2 py-0.5 rounded">
                ALTA FIDELIDADE
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#002a3a] text-white flex items-center justify-center">
              <Users className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight my-1">
            3.080
          </div>
          <div className="text-xs text-slate-500 font-medium mb-3">Crescimento de +28.9% no período</div>
          <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5">
            <span className="bg-[#dcfce7] text-[#15803d] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
              +28.9%
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">evolução histórica</span>
          </div>
        </div>

        {/* Card 2: Doadores Plenos */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">DOADORES PLENOS (RECORRENTES)</h3>
              <span className="inline-block mt-1 bg-[#dcfce7] text-[#15803d] text-[10px] font-extrabold px-2 py-0.5 rounded">
                ATIVOS 12M
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#dcfce7] text-[#166534] flex items-center justify-center">
              <UserCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight my-1">
            2.480
          </div>
          <div className="text-xs text-slate-500 font-medium mb-3">80.5% da base automática é Plena</div>
          <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5">
            <span className="bg-[#dcfce7] text-[#15803d] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
              80.5%
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">índice de engajamento</span>
          </div>
        </div>

        {/* Card 3: Ticket Médio / Nota */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">TICKET MÉDIO / NOTA (AUT)</h3>
              <span className="inline-block mt-1 bg-[#ffe4e6] text-[#be123c] text-[10px] font-extrabold px-2 py-0.5 rounded">
                PREMIUM SEFAZ
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#fef9c3] text-[#854d0e] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight my-1">
            R$ 3,24
          </div>
          <div className="text-xs text-slate-500 font-medium mb-3">+33.9% superior ao ticket geral (R$ 2.42)</div>
          <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5">
            <span className="bg-[#dcfce7] text-[#15803d] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
              +34%
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">rentabilidade unitária</span>
          </div>
        </div>

        {/* Card 4: LTV Anual Estimado */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">LTV ANUAL ESTIMADO / DOADOR</h3>
              <span className="inline-block mt-1 bg-[#fef9c3] text-[#854d0e] text-[10px] font-extrabold px-2 py-0.5 rounded">
                RECEITA PROJETADA
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#ffe4e6] text-[#be123c] flex items-center justify-center">
              <Zap className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight my-1">
            R$ 699,84
          </div>
          <div className="text-xs text-slate-500 font-medium mb-3">Receita líquida anual por doador pleno</div>
          <div className="text-[10px] text-slate-400 font-semibold border-t border-slate-100 pt-2">Consolidado SEFAZ</div>
        </div>

      </div>

      {/* 3. Painel de Análise de Retenção & Fidelidade */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          📊 Distribuição de Retenção por Nível de Recorrência (Meses Ativos)
        </h3>
        <p className="text-slate-500 text-xs">
          Análise cohort do comportamento de doações continuadas via app SEFAZ-SP.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
            <div className="text-xs font-bold text-slate-500 uppercase">Doadores Iniciantes (1-3 meses)</div>
            <div className="text-xl font-black text-[#002a3a] mt-1">600 doadores</div>
            <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
              <div className="bg-sky-400 h-full w-[19.5%]"></div>
            </div>
            <div className="text-[10px] text-slate-500 mt-1.5 font-semibold">19.5% da base cadastrada</div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
            <div className="text-xs font-bold text-slate-500 uppercase">Doadores em Retenção (4-11 meses)</div>
            <div className="text-xl font-black text-[#002a3a] mt-1">800 doadores</div>
            <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
              <div className="bg-[#004a6d] h-full w-[26%]"></div>
            </div>
            <div className="text-[10px] text-slate-500 mt-1.5 font-semibold">26.0% da base cadastrada</div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
            <div className="text-xs font-bold text-emerald-800 uppercase">Doadores Plenos / Recorrentes (12+ meses)</div>
            <div className="text-xl font-black text-emerald-900 mt-1">2.480 doadores</div>
            <div className="w-full bg-emerald-200 h-2 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-600 h-full w-[80.5%]"></div>
            </div>
            <div className="text-[10px] text-emerald-700 mt-1.5 font-bold">80.5% retenção de alta fidelidade</div>
          </div>
        </div>
      </div>

    </div>
  );
};

