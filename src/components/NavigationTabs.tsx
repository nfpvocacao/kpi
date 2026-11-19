import React, { useState } from 'react';
import { 
  TrendingUp, 
  Building2, 
  MapPin, 
  HeartHandshake, 
  Users, 
  Target, 
  Presentation, 
  Code2, 
  BadgePercent, 
  QrCode, 
  Menu, 
  X,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export type TabId = 'desempenho' | 'empresas' | 'mapa' | 'comissoes' | 'doadores' | 'automaticos' | 'campanhas' | 'qrcode' | 'benchmarking' | 'apresentacao' | 'dev';

interface NavigationTabsProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  metricsBadgeCounts?: {
    empresasAtivas: number;
    doadoresReais: number;
    doadoresAuto: number;
  };
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onSelectTab,
  metricsBadgeCounts
}) => {
  const { usuario, temPermissaoAba } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const tabs = [
    {
      id: 'desempenho' as TabId,
      label: 'Desempenho',
      fullTitle: 'Desempenho & Captação NFP',
      icon: TrendingUp,
      badgeText: null,
      badgeColor: ''
    },
    {
      id: 'empresas' as TabId,
      label: 'Empresas',
      fullTitle: 'Operações por Empresas Parceiras',
      icon: Building2,
      badgeText: null,
      badgeColor: ''
    },
    {
      id: 'mapa' as TabId,
      label: 'Mapa Parceiros',
      fullTitle: 'Geolocalização & Retorno das Empresas Parceiras',
      icon: MapPin,
      badgeText: null,
      badgeColor: ''
    },
    {
      id: 'comissoes' as TabId,
      label: 'Comissões',
      fullTitle: 'Apuração de Carteiras & Comissões por Vendedor',
      icon: BadgePercent,
      badgeText: null,
      badgeColor: ''
    },
    {
      id: 'doadores' as TabId,
      label: 'Raio-X Doadores',
      fullTitle: 'Raio-X de Doadores de Pessoa Física (CPF)',
      icon: HeartHandshake,
      badgeText: null,
      badgeColor: ''
    },
    {
      id: 'automaticos' as TabId,
      label: 'Doadores Fidelizados',
      fullTitle: 'Doadores Fidelizados (Recorrentes SEFAZ)',
      icon: Users,
      badgeText: null,
      badgeColor: ''
    },
    {
      id: 'campanhas' as TabId,
      label: 'Ações & Campanhas',
      fullTitle: 'Ações & Campanhas de Captação (Bitrix24)',
      icon: Target,
      badgeText: null,
      badgeColor: ''
    },
    {
      id: 'qrcode' as TabId,
      label: 'QR Eventos',
      fullTitle: 'Gerador e Gestão de QR Codes para Eventos (Bitrix24)',
      icon: QrCode,
      badgeText: null,
      badgeColor: ''
    },
    {
      id: 'benchmarking' as TabId,
      label: 'Benchmarking',
      fullTitle: 'Benchmarking de Captação & Prospecção',
      icon: Target,
      badgeText: null,
      badgeColor: ''
    },
    {
      id: 'apresentacao' as TabId,
      label: 'Apresentação',
      fullTitle: 'Painel de Apresentação Institucional',
      icon: Presentation,
      badgeText: null,
      badgeColor: ''
    },
    {
      id: 'dev' as TabId,
      label: 'Dev / Processos',
      fullTitle: 'Área Técnica do Desenvolvedor e ETL',
      icon: Code2,
      badgeText: null,
      badgeColor: ''
    }
  ];

  // Filtra as abas conforme as permissões individuais do usuário
  const abasPermitidas = tabs.filter(tab => temPermissaoAba(tab.id));

  // Itens fixos da barra inferior do mobile
  // 2 à esquerda: desempenho, empresas
  // 1 central destacado: qrcode
  // 1 à direita: campanhas
  // 1 à direita: gaveta (mais)
  const isAbaNaBarraInferior = ['desempenho', 'empresas', 'qrcode', 'campanhas'].includes(activeTab);

  return (
    <>
      {/* ============================================================== */}
      {/* 1. VERSÃO DESKTOP (MD PARA CIMA) - MANTIDA INTACTA COM TODAS AS ABAS */}
      {/* ============================================================== */}
      <div className="hidden md:block bg-white border-b border-[#BCD3DF]/70 sticky top-[65px] z-20 px-3 lg:px-8 shadow-2xs">
        <div className="max-w-[1800px] mx-auto">
          <nav
            className="flex flex-wrap items-center gap-1.5 py-2.5"
            aria-label="Abas do Sistema NFP Analytics"
          >
            {abasPermitidas.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  id={`tab-btn-${tab.id}`}
                  onClick={() => onSelectTab(tab.id)}
                  title={tab.fullTitle}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-extrabold text-xs lg:text-sm transition-all duration-200 cursor-pointer text-center ${
                    isActive
                      ? 'bg-[#004A6D] text-white shadow-md ring-1 ring-[#004A6D]'
                      : 'bg-slate-50 text-[#004A6D] hover:bg-[#D9FBFF]/60 hover:text-[#002A3A] border border-slate-200/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#00E3E6]' : 'text-[#004A6D]'}`} />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. VERSÃO MOBILE (ABAIXO DE MD) - BARRA FIXA INFERIOR DE 5 MENUS */}
      {/* ============================================================== */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#BCD3DF] shadow-[0_-4px_16px_rgba(0,0,0,0.08)] px-2 py-1.5 pb-safe">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {/* 1. Desempenho */}
          <button
            onClick={() => onSelectTab('desempenho')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              activeTab === 'desempenho' ? 'text-[#004A6D] font-black' : 'text-slate-400 font-semibold'
            }`}
          >
            <TrendingUp className={`w-5 h-5 ${activeTab === 'desempenho' ? 'text-[#004A6D]' : 'text-slate-400'}`} />
            <span className="text-[10px] mt-0.5">Desemp.</span>
          </button>

          {/* 2. Empresas */}
          <button
            onClick={() => onSelectTab('empresas')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              activeTab === 'empresas' ? 'text-[#004A6D] font-black' : 'text-slate-400 font-semibold'
            }`}
          >
            <Building2 className={`w-5 h-5 ${activeTab === 'empresas' ? 'text-[#004A6D]' : 'text-slate-400'}`} />
            <span className="text-[10px] mt-0.5">Empresas</span>
          </button>

          {/* 3. CENTRAL EM DESTAQUE: QR Eventos */}
          <div className="flex flex-col items-center justify-center flex-1 -mt-5 relative">
            <button
              onClick={() => onSelectTab('qrcode')}
              className={`w-13 h-13 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 border-2 ${
                activeTab === 'qrcode'
                  ? 'bg-[#00E3E6] border-[#004A6D] text-[#002A3A] ring-4 ring-[#D9FBFF]'
                  : 'bg-[#004A6D] border-[#00E3E6] text-[#00E3E6]'
              }`}
              title="Gerador de QR Code"
            >
              <QrCode className="w-6 h-6" />
            </button>
            <span className={`text-[10px] mt-1 ${activeTab === 'qrcode' ? 'text-[#004A6D] font-black' : 'text-slate-500 font-bold'}`}>
              QR Code
            </span>
          </div>

          {/* 4. Campanhas */}
          <button
            onClick={() => onSelectTab('campanhas')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              activeTab === 'campanhas' ? 'text-[#004A6D] font-black' : 'text-slate-400 font-semibold'
            }`}
          >
            <Target className={`w-5 h-5 ${activeTab === 'campanhas' ? 'text-[#004A6D]' : 'text-slate-400'}`} />
            <span className="text-[10px] mt-0.5">Ações</span>
          </button>

          {/* 5. GAVETA / MAIS */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              !isAbaNaBarraInferior ? 'text-[#004A6D] font-black' : 'text-slate-400 font-semibold'
            }`}
          >
            <Menu className={`w-5 h-5 ${!isAbaNaBarraInferior ? 'text-[#004A6D]' : 'text-slate-400'}`} />
            <span className="text-[10px] mt-0.5">Mais</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. GAVETA INFERIOR (BOTTOM SHEET) PARA AS DEMAIS ABAS */}
      {/* ============================================================== */}
      {isDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-[#002A3A]/70 backdrop-blur-xs animate-in fade-in duration-200">
          {/* Backdrop click to close */}
          <div className="flex-1" onClick={() => setIsDrawerOpen(false)} />

          <div className="bg-white rounded-t-3xl max-h-[80vh] overflow-y-auto p-5 shadow-2xl border-t border-[#BCD3DF] animate-in slide-in-from-bottom duration-300">
            {/* Top drawer handle */}
            <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <h3 className="text-base font-black text-[#002A3A]">Todas as Telas</h3>
                <p className="text-xs text-[#004A6D]/70">Navegue pelas outras áreas do NFP Analytics</p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 pb-6">
              {abasPermitidas.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      onSelectTab(tab.id);
                      setIsDrawerOpen(false);
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#004A6D] text-white shadow-sm'
                        : 'bg-slate-50 hover:bg-[#D9FBFF]/50 text-[#002A3A] border border-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20 text-[#00E3E6]' : 'bg-white text-[#004A6D] shadow-2xs'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black">{tab.label}</div>
                        <div className={`text-[10px] ${isActive ? 'text-white/80' : 'text-[#004A6D]/70'}`}>
                          {tab.fullTitle}
                        </div>
                      </div>
                    </div>

                    <ChevronRight className={`w-4 h-4 ${isActive ? 'text-[#00E3E6]' : 'text-slate-400'}`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
