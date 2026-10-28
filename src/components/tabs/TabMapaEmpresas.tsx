import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import { 
  MapPin, 
  Search, 
  Building2, 
  DollarSign, 
  Receipt, 
  ExternalLink, 
  Compass, 
  Layers, 
  Filter, 
  TrendingUp, 
  Navigation, 
  Phone, 
  Mail,
  Loader2,
  Sparkles,
  Inbox,
  Bot,
  HeartHandshake,
  Maximize2,
  Minimize2,
  Download,
  FileSpreadsheet,
  UserX,
  UserCheck,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Target
} from 'lucide-react';
import { EmpresaParceira, VENDEDORES_MAP } from '../../types';
import { useSupabaseEmpresas } from '../../hooks/useSupabaseEmpresas';
import { formatarMoeda, formatarNumero } from '../../data/mockDatabase';

interface TabMapaEmpresasProps {
  selectedYears?: number[];
  selectedMonths?: number[];
  onSelectEmpresaParaFiltro?: (empresa: EmpresaParceira) => void;
}

export type FrenteCaptaçãoFilter = 'TODAS' | 'CADASTRO' | 'DOACAO';

const formatShort = (v: number) => {
  if (v >= 1000000) return `R$ ${(v / 1000000).toFixed(1)}M`;
  if (v >= 10000) return `R$ ${(v / 1000).toFixed(0)}k`;
  if (v >= 1000) return `R$ ${(v / 1000).toFixed(1)}k`;
  return `R$ ${v.toFixed(0)}`;
};

// Ícone individual estilizado Booking com cor indicadora de frente de captação
const createCustomIcon = (credito: number, isSelected: boolean, frente: FrenteCaptaçãoFilter, cadCred: number, doaCred: number) => {
  let bgClass = 'bg-[#002A3A] text-white border-white';
  let badgeSize = 'px-2 py-1 text-xs font-bold';

  // Destaque visual por valor ou frente
  if (credito > 50000) {
    bgClass = isSelected 
      ? 'bg-[#FF5722] text-white ring-4 ring-[#FF5722]/50 scale-110' 
      : 'bg-[#FF5722] text-white border-white';
  } else if (credito > 10000) {
    bgClass = isSelected 
      ? 'bg-[#EDCD01] text-[#002A3A] ring-4 ring-[#EDCD01]/50 scale-110' 
      : 'bg-[#EDCD01] text-[#002A3A] border-[#002A3A]';
  } else {
    bgClass = isSelected 
      ? 'bg-[#00E3E6] text-[#002A3A] ring-4 ring-[#00E3E6]/50 scale-110' 
      : 'bg-[#002A3A] text-white border-white';
  }

  // Ponto indicador da frente predominante
  let dotColor = 'bg-[#00E3E6]'; // default
  if (cadCred > doaCred) {
    dotColor = 'bg-[#EDCD01]'; // Urnas / Cadastro
  } else if (doaCred > cadCred) {
    dotColor = 'bg-[#FD3168]'; // Doações
  }

  const html = `
    <div class="relative flex items-center justify-center cursor-pointer transition-transform transform">
      <div class="shadow-lg border-2 rounded-full ${bgClass} ${badgeSize} flex items-center gap-1.5 whitespace-nowrap shadow-black/30">
        <span class="w-2 h-2 rounded-full ${dotColor}"></span>
        <span>${formatShort(credito)}</span>
      </div>
      <div class="w-2 h-2 rotate-45 -mt-1 bg-inherit border-r border-b border-inherit mx-auto"></div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-booking-pin',
    html,
    iconSize: [68, 32],
    iconAnchor: [34, 30],
    popupAnchor: [0, -30]
  });
};

export const TabMapaEmpresas: React.FC<TabMapaEmpresasProps> = ({
  selectedYears = [2026],
  selectedMonths = [],
  onSelectEmpresaParaFiltro
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const clusterGroupRef = useRef<any>(null);
  const markersByIdRef = useRef<Record<string, L.Marker>>({});

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendedor, setSelectedVendedor] = useState<string>('TODOS');
  const [selectedFrente, setSelectedFrente] = useState<FrenteCaptaçãoFilter>('TODAS');
  const [isRadarOportunidades, setIsRadarOportunidades] = useState(false);
  const [sortBy, setSortBy] = useState<'CREDITO' | 'TICKET_MEDIO' | 'CUPONS' | 'NOME'>('CREDITO');
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string | null>(null);
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);
  const [geoDataMap, setGeoDataMap] = useState<Record<string, { lat: number; lng: number; logradouro?: string; bairro?: string; cep?: string; numero?: string; cidade?: string; estado?: string; fonte?: string }>>({});
  const [isLoadingGeo, setIsLoadingGeo] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Easter egg: "CHUPA FÁBIO!" ao atingir zoom máximo (200ms)
  const [showVocacaoEasterEgg, setShowVocacaoEasterEgg] = useState(false);

  // Redimensiona o Leaflet ao entrar ou sair do modo tela cheia
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [isFullscreen]);

  // Tecla ESC para sair de tela cheia
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Carrega empresas do Supabase para o período selecionado
  const { topEmpresas, isLoading: isEmpresasLoading } = useSupabaseEmpresas({
    selectedYears,
    selectedMonths,
    limit: 500
  });

  // Carrega base de geolocalização com alta precisão
  useEffect(() => {
    let isMounted = true;
    async function loadGeo() {
      try {
        setIsLoadingGeo(true);
        const res = await fetch('/data/empresas_geo.json?t=' + Date.now());
        if (res.ok) {
          const json = await res.json();
          if (isMounted) setGeoDataMap(json);
        }
      } catch (err) {
        console.warn('Geo data ainda não gerado ou arquivo ausente, usando fallback.');
      } finally {
        if (isMounted) setIsLoadingGeo(false);
      }
    }
    loadGeo();
    return () => {
      isMounted = false;
    };
  }, []);

  // Mescla dados de negócio com os dados geográficos REAIS e CONFIRMADOS (Sem coordenadas inventadas)
  const empresasCompletas = useMemo(() => {
    return topEmpresas
      .map(emp => {
        const cleanCnpj = emp.cnpj.replace(/\D/g, '').padStart(14, '0');
        const geo = geoDataMap[cleanCnpj] || geoDataMap[emp.cnpj];

        // Apenas estabelecimentos com geocodificação real confirmada entram no mapa
        if (!geo || !geo.lat || !geo.lng) {
          return null;
        }

        return {
          ...emp,
          latitude: geo.lat,
          longitude: geo.lng,
          hasGeo: true,
          logradouro: geo.logradouro || emp.logradouro,
          bairro: geo.bairro || emp.bairro,
          cep: geo.cep || emp.cep,
          numero: geo.numero || emp.numero,
          cidade: geo.cidade || emp.cidade || 'São Paulo',
          estado: geo.estado || emp.estado || 'SP',
          creditoUrnas: emp.creditoUrnas || 0,
          creditoDoacoes: emp.creditoDoacoes || 0
        };
      })
      .filter((e): e is NonNullable<typeof e> => e !== null);
  }, [topEmpresas, geoDataMap]);

  // Filtros de busca e frentes de captação
  const empresasFiltradas = useMemo(() => {
    return empresasCompletas.filter(emp => {
      // Filtro por Frente de Captação
      if (selectedFrente === 'CADASTRO' && (emp.creditoUrnas || 0) <= 0) {
        return false;
      }
      if (selectedFrente === 'DOACAO' && (emp.creditoDoacoes || 0) <= 0) {
        return false;
      }
      // Radar de Oportunidades: tem bom retorno em urnas (>= R$ 150) mas zero ou pouco em doações automáticas (<= R$ 20)
      if (isRadarOportunidades) {
        const temUrnas = (emp.creditoUrnas || 0) >= 150;
        const semDoacoes = (emp.creditoDoacoes || 0) <= 20;
        if (!temUrnas || !semDoacoes) return false;
      }

      // Busca por CNPJ, Nome, Bairro ou CEP
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchCnpj = emp.cnpj.includes(term);
        const matchNome = (emp.razaoSocial || '').toLowerCase().includes(term) || (emp.nomeFantasia || '').toLowerCase().includes(term);
        const matchBairro = (emp.bairro || '').toLowerCase().includes(term);
        const matchCep = (emp.cep || '').toLowerCase().includes(term);
        if (!matchCnpj && !matchNome && !matchBairro && !matchCep) return false;
      }

      // Vendedor (Todos, por ID ou Apenas Sem Vendedor / Órfãs)
      if (selectedVendedor !== 'TODOS') {
        if (selectedVendedor === 'SEM_VENDEDOR') {
          if (emp.idVendedor || emp.idVendedorAbertura) return false;
        } else {
          const vendId = parseInt(selectedVendedor, 10);
          if (emp.idVendedor !== vendId && emp.idVendedorAbertura !== vendId) return false;
        }
      }

      return true;
    });
  }, [empresasCompletas, selectedFrente, searchTerm, selectedVendedor, isRadarOportunidades]);

  // Sincronização Dinâmica ao Arrastar o Mapa e Ordenação Personalizada
  const empresasVisiveisNaTela = useMemo(() => {
    let list = empresasFiltradas;
    if (mapBounds) {
      list = empresasFiltradas.filter(emp => {
        if (!emp.latitude || !emp.longitude) return false;
        return mapBounds.contains([emp.latitude, emp.longitude]);
      });
    }

    return [...list].sort((a, b) => {
      if (sortBy === 'TICKET_MEDIO') {
        const tktA = a.cuponsValidos > 0 ? (a.creditoTotal / a.cuponsValidos) : 0;
        const tktB = b.cuponsValidos > 0 ? (b.creditoTotal / b.cuponsValidos) : 0;
        return tktB - tktA;
      }
      if (sortBy === 'CUPONS') {
        return (b.cuponsValidos || 0) - (a.cuponsValidos || 0);
      }
      if (sortBy === 'NOME') {
        const nomeA = a.nomeFantasia || a.razaoSocial || '';
        const nomeB = b.nomeFantasia || b.razaoSocial || '';
        return nomeA.localeCompare(nomeB);
      }
      // Padrão: CREDITO
      const valA = selectedFrente === 'CADASTRO' ? a.creditoUrnas : selectedFrente === 'DOACAO' ? a.creditoDoacoes : a.creditoTotal;
      const valB = selectedFrente === 'CADASTRO' ? b.creditoUrnas : selectedFrente === 'DOACAO' ? b.creditoDoacoes : b.creditoTotal;
      return (valB || 0) - (valA || 0);
    });
  }, [empresasFiltradas, mapBounds, sortBy, selectedFrente]);

  // Exportar locais visíveis para CSV/Excel com delimitador e UTF-8 BOM
  const exportarLocaisVisiveis = () => {
    if (empresasVisiveisNaTela.length === 0) return;

    const headers = [
      'CNPJ',
      'Nome Fantasia',
      'Razao Social',
      'Vendedor',
      'Categoria',
      'Credito Total (R$)',
      'Credito Urnas (R$)',
      'Credito Doacoes (R$)',
      'Cupons Validos',
      'Logradouro',
      'Numero',
      'Bairro',
      'Cidade',
      'Estado',
      'CEP'
    ];

    const rows = empresasVisiveisNaTela.map(e => [
      `"${e.cnpj}"`,
      `"${(e.nomeFantasia || e.razaoSocial).replace(/"/g, '""')}"`,
      `"${(e.razaoSocial || '').replace(/"/g, '""')}"`,
      `"${(e.idVendedor ? VENDEDORES_MAP[e.idVendedor] || 'Vendedor #' + e.idVendedor : 'Sem Vendedor (Oportunidade)')}"`,
      `"${e.categoria || 'Geral'}"`,
      (e.creditoTotal || 0).toFixed(2).replace('.', ','),
      (e.creditoUrnas || 0).toFixed(2).replace('.', ','),
      (e.creditoDoacoes || 0).toFixed(2).replace('.', ','),
      e.cuponsValidos || 0,
      `"${(e.logradouro || '').replace(/"/g, '""')}"`,
      `"${(e.numero || 'S/N')}"`,
      `"${(e.bairro || '').replace(/"/g, '""')}"`,
      `"${(e.cidade || '').replace(/"/g, '""')}"`,
      `"${(e.estado || 'SP')}"`,
      `"${e.cep || ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `parceiros_mapa_nfp_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Inicialização do Mapa Leaflet com Cluster Inteligente
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [-23.55052, -46.633308],
        zoom: 12,
        maxZoom: 19,
        zoomControl: false
      });

      // OpenStreetMap Oficial e Gratuito (Sem API Key)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      // Controle de Zoom
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // MarkerClusterGroup com SOMA DE VALORES ACUMULADOS NO ZOOM OUT
      // @ts-ignore
      const clusterGroup = (L as any).markerClusterGroup({
        maxClusterRadius: 65,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        iconCreateFunction: (cluster: any) => {
          const childMarkers = cluster.getAllChildMarkers();
          const totalClusterCredito = childMarkers.reduce((acc: number, m: any) => {
            return acc + (m.options.customCredito || 0);
          }, 0);
          const count = childMarkers.length;

          const html = `
            <div class="relative flex items-center justify-center cursor-pointer transition-transform transform hover:scale-105">
              <div class="shadow-2xl border-2 border-[#00E3E6] rounded-full bg-[#002A3A] text-white px-2.5 py-1 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shadow-black/40">
                <span class="w-2 h-2 rounded-full bg-[#00E3E6] animate-ping"></span>
                <span>${formatShort(totalClusterCredito)}</span>
                <span class="text-[10px] text-[#00E3E6] font-normal">(${count})</span>
              </div>
              <div class="w-2.5 h-2.5 rotate-45 -mt-1.5 bg-[#002A3A] border-r border-b border-[#00E3E6] mx-auto"></div>
            </div>
          `;

          return L.divIcon({
            html,
            className: 'custom-booking-cluster',
            iconSize: [80, 34],
            iconAnchor: [40, 32]
          });
        }
      });

      map.addLayer(clusterGroup);
      clusterGroupRef.current = clusterGroup;
      mapInstanceRef.current = map;

      // Atualiza os limites visíveis para filtrar a lateral ao mover o mouse
      const updateBounds = () => {
        setMapBounds(map.getBounds());
      };
      map.on('moveend', updateBounds);
      map.on('zoomend', updateBounds);
      setTimeout(updateBounds, 300);

      // Easter Egg: "CHUPA FÁBIO!" no Zoom Máximo (200ms)
      map.on('zoomend', () => {
        if (map.getZoom() >= 18) {
          setShowVocacaoEasterEgg(true);
          setTimeout(() => {
            setShowVocacaoEasterEgg(false);
          }, 200);
        }
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Atualização dos Pinos no MarkerCluster (1:1 com a lista filtrada, sem slice artificial)
  useEffect(() => {
    if (!mapInstanceRef.current || !clusterGroupRef.current) return;

    const clusterGroup = clusterGroupRef.current;
    clusterGroup.clearLayers();
    markersByIdRef.current = {};

    const bounds = L.latLngBounds([]);
    let hasPoints = false;

    empresasFiltradas.forEach(emp => {
      if (!emp.latitude || !emp.longitude) return;

      hasPoints = true;
      const isSelected = emp.id === selectedEmpresaId;
      bounds.extend([emp.latitude, emp.longitude]);

      const valorExibido = selectedFrente === 'CADASTRO'
        ? emp.creditoUrnas
        : selectedFrente === 'DOACAO'
          ? emp.creditoDoacoes
          : emp.creditoTotal;

      const icon = createCustomIcon(valorExibido, isSelected, selectedFrente, emp.creditoUrnas, emp.creditoDoacoes);
      // @ts-ignore
      const marker = L.marker([emp.latitude, emp.longitude], { 
        icon,
        // @ts-ignore
        customCredito: valorExibido 
      });

      // Popup Estilo Booking com Raio-X das Frentes de Captação
      const vendedorNome = emp.idVendedor ? VENDEDORES_MAP[emp.idVendedor] : 'Não atribuído';
      const enderecoTexto = [emp.logradouro, emp.numero, emp.bairro, emp.cidade, emp.cep].filter(Boolean).join(', ');

      const popupContent = document.createElement('div');
      popupContent.className = 'p-1 font-sans text-[#002A3A] min-w-[270px]';
      popupContent.innerHTML = `
        <div class="flex items-start justify-between gap-2 border-b border-gray-100 pb-2 mb-2">
          <div>
            <div class="text-[10px] font-bold tracking-wider uppercase text-cyan-700">${emp.categoria || 'Parceiro'}</div>
            <h4 class="font-bold text-sm leading-tight text-gray-900">${emp.nomeFantasia || emp.razaoSocial}</h4>
            <div class="text-[11px] text-gray-500 font-mono mt-0.5">${emp.cnpj}</div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2 bg-[#F4F9FA] p-2 rounded-lg mb-2">
          <div>
            <span class="text-[10px] text-gray-500 uppercase block font-medium">Retorno Total</span>
            <span class="text-xs font-bold text-emerald-600">${formatarMoeda(emp.creditoTotal)}</span>
          </div>
          <div>
            <span class="text-[10px] text-gray-500 uppercase block font-medium">Cupons Válidos</span>
            <span class="text-xs font-bold text-gray-800">${formatarNumero(emp.cuponsValidos)}</span>
          </div>
        </div>

        <!-- Raio-X por Frente de Captação -->
        <div class="bg-gray-50 rounded-lg p-2 mb-2 space-y-1 text-[11px] border border-gray-200/60">
          <div class="text-[10px] font-bold uppercase text-gray-400">Detalhamento por Frente:</div>
          <div class="flex items-center justify-between">
            <span class="flex items-center gap-1 text-gray-600">📦 Urnas / Cadastro:</span>
            <span class="font-bold text-amber-600 font-mono">${formatarMoeda(emp.creditoUrnas)}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="flex items-center gap-1 text-gray-600">🤝 Doações (App/Auto):</span>
            <span class="font-bold text-rose-600 font-mono">${formatarMoeda(emp.creditoDoacoes)}</span>
          </div>
        </div>

        <div class="space-y-1 text-xs text-gray-600 mb-2">
          <div class="flex items-center gap-1.5">
            <span class="text-gray-400">👤 Vendedor:</span>
            <span class="font-medium text-gray-700">${vendedorNome}</span>
          </div>
          ${emp.cep ? `
          <div class="flex items-center gap-1.5">
            <span class="text-gray-400">📍 CEP:</span>
            <span class="font-mono text-gray-700 font-medium">${emp.cep}</span>
          </div>` : ''}
          ${enderecoTexto ? `
          <div class="text-[11px] text-gray-500 line-clamp-2 mt-1">
            ${enderecoTexto}
          </div>` : ''}
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 330, className: 'booking-popup' });

      marker.on('click', () => {
        setSelectedEmpresaId(emp.id);
      });

      clusterGroup.addLayer(marker);
      markersByIdRef.current[emp.id] = marker;
    });

    // Adiciona camada de agrupamento de pinos (ClusterGroup) ao mapa
    if (!mapInstanceRef.current.hasLayer(clusterGroup)) {
      mapInstanceRef.current.addLayer(clusterGroup);
    }

    if (hasPoints && bounds.isValid() && !mapBounds) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [empresasFiltradas, selectedFrente]);

  // Centralizar mapa ao selecionar um card da lista lateral e ABRIR O POPUP AUTOMATICAMENTE
  const handleSelectCard = (emp: typeof empresasCompletas[0]) => {
    setSelectedEmpresaId(emp.id);
    if (mapInstanceRef.current && emp.latitude && emp.longitude) {
      mapInstanceRef.current.flyTo([emp.latitude, emp.longitude], 16, {
        duration: 0.9
      });

      setTimeout(() => {
        const marker = markersByIdRef.current[emp.id];
        if (marker) {
          marker.setZIndexOffset(10000);
          if (clusterGroupRef.current) {
            clusterGroupRef.current.zoomToShowLayer(marker, () => {
              marker.openPopup();
            });
          } else {
            marker.openPopup();
          }
        }
      }, 350);
    }
  };

  const totalCreditoVisivel = useMemo(() => {
    return empresasVisiveisNaTela.reduce((acc, curr) => {
      const val = selectedFrente === 'CADASTRO' 
        ? curr.creditoUrnas 
        : selectedFrente === 'DOACAO' 
          ? curr.creditoDoacoes 
          : curr.creditoTotal;
      return acc + (val || 0);
    }, 0);
  }, [empresasVisiveisNaTela, selectedFrente]);

  return (
    <div className={`flex flex-col bg-white transition-all ${
      isFullscreen 
        ? 'fixed inset-0 z-50 w-screen h-screen' 
        : 'h-[calc(100vh-175px)] w-full rounded-xl shadow-xs border border-gray-100 relative'
    }`}>
      {/* Easter Egg Flutuante: "CHUPA FÁBIO!" ao usar zoom máximo */}
      {showVocacaoEasterEgg && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[2000] pointer-events-none transition-all duration-300 animate-bounce">
          <div className="flex items-center gap-3 bg-gradient-to-r from-[#002A3A] via-[#004B67] to-[#00E3E6] text-white px-8 py-4 rounded-3xl shadow-2xl border-2 border-white/60 backdrop-blur-md">
            <Sparkles className="w-8 h-8 text-[#EDCD01] animate-spin" />
            <span className="font-extrabold text-2xl tracking-wider uppercase drop-shadow-md">
              CHUPA FÁBIO! 🚀
            </span>
          </div>
        </div>
      )}

      {/* Barra de Filtros e Resumo Superior */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xs rounded-t-xl z-10">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, CNPJ, bairro ou CEP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#00E3E6] focus:bg-white transition-all"
            />
          </div>

          {/* Filtro por Frente de Captação */}
          <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-xs">
            <button
              onClick={() => setSelectedFrente('TODAS')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                selectedFrente === 'TODAS'
                  ? 'bg-white text-[#002A3A] shadow-xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🌐 Todas as Frentes
            </button>
            <button
              onClick={() => setSelectedFrente('CADASTRO')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1 ${
                selectedFrente === 'CADASTRO'
                  ? 'bg-amber-500 text-white shadow-xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Inbox className="w-3 h-3" />
              Urnas / Cadastro
            </button>
            <button
              onClick={() => setSelectedFrente('DOACAO')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1 ${
                selectedFrente === 'DOACAO'
                  ? 'bg-rose-500 text-white shadow-xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <HeartHandshake className="w-3 h-3" />
              Doações
            </button>
          </div>

          {/* Filtro de Vendedor */}
          <select
            value={selectedVendedor}
            onChange={(e) => setSelectedVendedor(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-[#00E3E6]"
          >
            <option value="TODOS">Todos os Vendedores</option>
            <option value="SEM_VENDEDOR" className="text-amber-700 font-semibold">⚠️ Apenas Sem Vendedor (Oportunidades)</option>
            {Object.entries(VENDEDORES_MAP).map(([id, nome]) => (
              <option key={id} value={id}>{nome}</option>
            ))}
          </select>
        </div>

        {/* Resumo Dinâmico na Área Visível & Botões de Ação */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-gray-500">
            <Building2 className="w-4 h-4 text-[#002A3A]" />
            <span>Na tela: <strong className="text-gray-900 font-bold">{formatarNumero(empresasVisiveisNaTela.length)}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Retorno Visível: <strong className="text-emerald-700 font-mono font-bold">{formatarMoeda(totalCreditoVisivel)}</strong></span>
          </div>

          <div className="h-4 w-px bg-gray-200"></div>

          {/* Botão Radar de Oportunidades Comercial */}
          <button
            onClick={() => setIsRadarOportunidades(!isRadarOportunidades)}
            title="Filtrar parceiros com alta arrecadação em urnas (>= R$ 150) mas zero/poucas doações automáticas (<= R$ 20)"
            className={`p-1.5 px-2.5 rounded-lg border transition-all flex items-center gap-1.5 text-xs font-semibold ${
              isRadarOportunidades
                ? 'bg-purple-600 border-purple-700 text-white shadow-xs font-bold ring-2 ring-purple-300'
                : 'bg-white border-purple-200 text-purple-700 hover:bg-purple-50'
            }`}
          >
            <Target className={`w-3.5 h-3.5 ${isRadarOportunidades ? 'text-white' : 'text-purple-600'}`} />
            <span>{isRadarOportunidades ? '🎯 Radar Ativo' : 'Radar Oportunidades'}</span>
          </button>


          {/* Botão Exportar Lista da Região Visível */}
          <button
            onClick={exportarLocaisVisiveis}
            disabled={empresasVisiveisNaTela.length === 0}
            title="Exportar planilha Excel/CSV dos parceiros visíveis na tela"
            className="p-1.5 px-2.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 transition-all flex items-center gap-1.5 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Exportar Excel ({empresasVisiveisNaTela.length})</span>
          </button>

          {/* Botão de Tela Cheia */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Sair da Tela Cheia (ESC)" : "Expandir Mapa para Tela Cheia"}
            className={`p-1.5 px-2.5 rounded-lg border transition-all flex items-center gap-1.5 text-xs font-semibold ${
              isFullscreen
                ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100 shadow-xs'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-[#002A3A]'
            }`}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Restaurar</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-[#002A3A]" />
                <span>Tela Cheia</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Área Principal Split-View (Estilo Booking) */}
      <div className="flex-1 flex overflow-hidden border border-t-0 border-gray-200 rounded-b-xl bg-gray-50">
        
        {/* Painel Lateral: Lista de Cards Dinâmica ao arrastar o mouse */}
        <div className="w-[380px] lg:w-[440px] flex-shrink-0 flex flex-col bg-white border-r border-gray-200 overflow-hidden shadow-xs">
          <div className="p-2.5 px-3 bg-gray-50/90 border-b border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1.5 font-medium text-gray-700">
              <Navigation className="w-3.5 h-3.5 text-[#00E3E6]" />
              <span>{empresasVisiveisNaTela.length} locais</span>
            </span>

            {/* Menu de Ordenação da Barra Lateral */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-gray-400">Ordenar:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-[11px] font-semibold bg-white border border-gray-200 rounded-md px-2 py-1 text-gray-700 focus:outline-hidden focus:ring-1 focus:ring-[#00E3E6] shadow-2xs cursor-pointer"
              >
                <option value="CREDITO">💰 Maior Crédito</option>
                <option value="TICKET_MEDIO">🎯 Maior Ticket Médio</option>
                <option value="CUPONS">🧾 Mais Cupons</option>
                <option value="NOME">🔤 Nome (A-Z)</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 p-2 space-y-2">
            {isEmpresasLoading ? (
              <div className="flex flex-col items-center justify-center h-48 gap-2 text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin text-[#00E3E6]" />
                <span className="text-xs">Carregando estabelecimentos...</span>
              </div>
            ) : empresasVisiveisNaTela.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs">
                Nenhum estabelecimento encontrado nesta área do mapa. Arraste ou afaste o zoom.
              </div>
            ) : (
              empresasVisiveisNaTela.slice(0, 80).map((emp) => {
                const isSelected = emp.id === selectedEmpresaId;
                const vend = emp.idVendedor ? VENDEDORES_MAP[emp.idVendedor] : null;

                const valorExibido = selectedFrente === 'CADASTRO'
                  ? emp.creditoUrnas
                  : selectedFrente === 'DOACAO'
                    ? emp.creditoDoacoes
                    : emp.creditoTotal;

                return (
                  <div
                    key={emp.id}
                    onClick={() => handleSelectCard(emp)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#00E3E6] bg-[#00E3E6]/10 shadow-sm ring-1 ring-[#00E3E6]'
                        : 'border-gray-200/80 bg-white hover:border-gray-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-gray-100 text-gray-600 mb-1">
                          {emp.categoria || 'Comércio'}
                        </span>
                        <h4 className="text-xs font-bold text-gray-900 line-clamp-1">
                          {emp.nomeFantasia || emp.razaoSocial}
                        </h4>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">{emp.cnpj}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] font-bold text-emerald-600 font-mono block">
                          {formatarMoeda(valorExibido)}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {formatarNumero(emp.cuponsValidos)} cupons
                        </span>
                      </div>
                    </div>

                    {/* Breakdown das Frentes & Ticket Médio */}
                    <div className="grid grid-cols-3 gap-1 bg-gray-50/90 rounded-md p-1.5 my-1.5 text-[10px]">
                      <div>
                        <span className="text-gray-400 block">Urnas:</span>
                        <span className="font-semibold text-amber-700 font-mono">{formatarMoeda(emp.creditoUrnas)}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Doações:</span>
                        <span className="font-semibold text-rose-700 font-mono">{formatarMoeda(emp.creditoDoacoes)}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Tkt Médio:</span>
                        <span className="font-bold text-[#002A3A] font-mono">
                          {formatarMoeda(emp.cuponsValidos > 0 ? (emp.creditoTotal / emp.cuponsValidos) : 0)}
                        </span>
                      </div>
                    </div>

                    {/* Endereço & CEP */}
                    <div className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-1 pt-1.5 border-t border-gray-100">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span className="truncate">
                        {[emp.logradouro, emp.bairro, emp.cidade].filter(Boolean).join(' - ') || 'Endereço em processamento'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1.5">
                      <span>CEP: <strong className="text-gray-600 font-mono">{emp.cep || 'S/N'}</strong></span>
                      {vend && <span className="text-[#002A3A] font-medium">👤 {vend}</span>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Painel do Mapa Interativo */}
        <div className="flex-1 relative overflow-hidden">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Legenda de Categorias e Frentes no Mapa */}
          <div className="absolute top-4 right-4 z-[400] bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-gray-200 shadow-md text-xs space-y-2 pointer-events-auto max-w-[210px]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Legenda das Frentes</span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EDCD01]"></span>
              <span className="text-gray-700 text-[11px]">Urnas / Cadastro</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FD3168]"></span>
              <span className="text-gray-700 text-[11px]">Doações (App / Auto)</span>
            </div>
            
            <div className="pt-2 border-t border-gray-100 text-[10px] text-gray-400 leading-tight">
              🖱️ <em>A lista à esquerda acompanha em tempo real a área visível do mapa.</em>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
