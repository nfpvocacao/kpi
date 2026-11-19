import React, { useState, useEffect } from 'react';
import {
    QrCode,
    Plus,
    Calendar,
    User,
    Copy,
    Check,
    Download,
    Printer,
    Trash2,
    Search,
    Sparkles,
    X,
  Eye,
    RefreshCw
  } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { getQrCodeImageUrl } from '../../utils/qrCodeGenerator';

export interface ResponsavelEvento {
  id: string;
  nome: string;
}

export const LISTA_RESPONSAVEIS: ResponsavelEvento[] = [
  { id: '362580', nome: 'Vocação Institucional' },
  { id: '261524', nome: 'André Emilio Ferraz' },
  { id: '336206', nome: 'Bianca Pereira Borges' },
  { id: '26', nome: 'Jacqueline kuhl' },
  { id: '306598', nome: 'Laís Santos' },
  { id: '102885', nome: 'Priscila Vasques' },
  { id: '228456', nome: 'Richards Dobler Rodrigues' },
  { id: '41', nome: 'Sirlene Nardis' }
];

export interface EventoQrCode {
  id: string;
  nome: string;
  dia: string; // YYYY-MM-DD
  responsavelNome: string;
  responsavelId: string;
  codigoEvento: string;
  parametroResponsavel: string;
  urlCompleta: string;
  criadoEm: string;
  criadoPor?: string;
}

type TipoImpressao = 'QR_ONLY' | 'EVENTO_COMPLETO';

const STORAGE_KEY = 'nfp_eventos_qrcode_list_v2';
const BASE_URL = 'https://sejaumdoador.bitrix24.site/';

function sanitizarParaSlug(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

export const TabQrCodeEventos: React.FC = () => {
  const { usuario } = useAuth();
  const [eventos, setEventos] = useState<EventoQrCode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [salvando, setSalvando] = useState<boolean>(false);
  const [busca, setBusca] = useState('');
  const [isModalNovoOpen, setIsModalNovoOpen] = useState(false);
  const [eventoVisualizandoQr, setEventoVisualizandoQr] = useState<EventoQrCode | null>(null);

  // Estados de Impressão Controlada
  const [eventoParaImprimir, setEventoParaImprimir] = useState<EventoQrCode | null>(null);
  const [tipoImpressao, setTipoImpressao] = useState<TipoImpressao>('EVENTO_COMPLETO');
  const [eventoSelecionadoParaMenuPrint, setEventoSelecionadoParaMenuPrint] = useState<EventoQrCode | null>(null);

  // Form states
  const [formNome, setFormNome] = useState('');
  const [formDia, setFormDia] = useState('');
  const [formResponsavelId, setFormResponsavelId] = useState(LISTA_RESPONSAVEIS[0].id);
  const [formCodigo, setFormCodigo] = useState('');
  const [formParamResponsavelNome, setFormParamResponsavelNome] = useState('responsavel');
  const [copiadoId, setCopiadoId] = useState<string | null>(null);

    // Buscar eventos do Supabase com fallback no LocalStorage
    const carregarEventos = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('nfp_eventos_qrcode')
          .select('*')
          .order('dia', { ascending: false });

        if (error) {
          console.warn('Erro ao carregar do Supabase, usando cache local:', error);
          carregarDoLocalStorage();
        } else if (data && data.length > 0) {
          const mapeados: EventoQrCode[] = data.map((row: any) => ({
            id: row.id,
            nome: row.nome,
            dia: row.dia,
            responsavelNome: row.responsavel_nome,
            responsavelId: row.responsavel_id,
            codigoEvento: row.codigo_evento,
            parametroResponsavel: row.parametro_responsavel || 'responsavel',
            urlCompleta: row.url_completa,
            criadoEm: row.criado_em,
            criadoPor: row.criado_por
          }));
          setEventos(mapeados);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mapeados));
        } else {
          // Se a tabela estiver vazia, verifica se tem algo no localStorage para migrar
          carregarDoLocalStorage();
        }
      } catch (err) {
        console.error('Falha na conexão com Supabase:', err);
        carregarDoLocalStorage();
      } finally {
        setLoading(false);
      }
    };

    const carregarDoLocalStorage = () => {
      try {
        const salvo = localStorage.getItem(STORAGE_KEY);
        if (salvo) {
          setEventos(JSON.parse(salvo));
        } else {
          const respInicial = LISTA_RESPONSAVEIS[0];
          const inicial: EventoQrCode[] = [
            {
              id: 'evt-padrao-1',
              nome: 'Jantar Solidário Vocação 2026',
              dia: '2026-11-25',
              responsavelNome: respInicial.nome,
              responsavelId: respInicial.id,
              codigoEvento: 'jantar_solidario_2026',
              parametroResponsavel: 'responsavel',
              urlCompleta: `${BASE_URL}?evento=jantar_solidario_2026&responsavel=${respInicial.id}`,
              criadoEm: new Date().toISOString()
            }
          ];
          setEventos(inicial);
        }
      } catch (e) {
        console.error('Erro ao ler localStorage:', e);
      }
    };

    useEffect(() => {
      carregarEventos();
    }, []);

    const handleNomeChange = (val: string) => {
      setFormNome(val);
      if (!formCodigo || formCodigo === sanitizarParaSlug(formNome)) {
        setFormCodigo(sanitizarParaSlug(val));
      }
    };

    const montarUrl = (codigoEv: string, respId: string, paramResp: string) => {
      const slug = codigoEv ? sanitizarParaSlug(codigoEv) : 'xpto';
      let url = `${BASE_URL}?evento=${encodeURIComponent(slug)}`;
      if (paramResp.trim() && respId) {
        url += `&${paramResp.trim()}=${encodeURIComponent(respId)}`;
      }
      return url;
    };

      const handleCriarEvento = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formNome.trim() || !formDia || !formResponsavelId) {
          alert('Por favor, preencha todos os campos obrigatórios.');
          return;
        }

        setSalvando(true);
        const respObj = LISTA_RESPONSAVEIS.find(r => r.id === formResponsavelId) || LISTA_RESPONSAVEIS[0];
        const codigoFinal = formCodigo.trim() ? sanitizarParaSlug(formCodigo) : sanitizarParaSlug(formNome);
        const paramRespFinal = formParamResponsavelNome.trim() || 'responsavel';
        const urlFinal = montarUrl(codigoFinal, respObj.id, paramRespFinal);

        try {
          // 1. Inserir no Supabase
          const { data, error } = await supabase
            .from('nfp_eventos_qrcode')
            .insert({
              nome: formNome.trim(),
              dia: formDia,
              responsavel_nome: respObj.nome,
              responsavel_id: respObj.id,
              codigo_evento: codigoFinal,
              parametro_responsavel: paramRespFinal,
              url_completa: urlFinal,
              criado_por: usuario?.nome || usuario?.email || 'Sistema'
            })
            .select()
            .single();

          let novoEvento: EventoQrCode;

          if (!error && data) {
            novoEvento = {
              id: data.id,
              nome: data.nome,
              dia: data.dia,
              responsavelNome: data.responsavel_nome,
              responsavelId: data.responsavel_id,
              codigoEvento: data.codigo_evento,
              parametroResponsavel: data.parametro_responsavel,
              urlCompleta: data.url_completa,
              criadoEm: data.criado_em,
              criadoPor: data.criado_por
            };
          } else {
            // Fallback local caso haja falha temporária de rede
            console.warn('Falha no Supabase, gravando localmente:', error);
            novoEvento = {
              id: `evt-${Date.now()}`,
              nome: formNome.trim(),
              dia: formDia,
              responsavelNome: respObj.nome,
              responsavelId: respObj.id,
              codigoEvento: codigoFinal,
              parametroResponsavel: paramRespFinal,
              urlCompleta: urlFinal,
              criadoEm: new Date().toISOString(),
              criadoPor: usuario?.nome || 'Local'
            };
          }

          const atualizada = [novoEvento, ...eventos];
          setEventos(atualizada);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(atualizada));

          setFormNome('');
          setFormDia('');
          setFormCodigo('');
          setIsModalNovoOpen(false);
          setEventoVisualizandoQr(novoEvento);
        } catch (err) {
          console.error('Erro ao salvar evento:', err);
          alert('Erro ao gravar evento. Tente novamente.');
        } finally {
          setSalvando(false);
        }
      };

          const handleExcluirEvento = async (id: string) => {
            if (!confirm('Tem certeza que deseja remover este evento? Ele será removido para todos os usuários.')) {
              return;
            }

            try {
              // Tenta remover do Supabase
              await supabase.from('nfp_eventos_qrcode').delete().eq('id', id);
            } catch (e) {
              console.warn('Erro ao remover no Supabase:', e);
            }

            const atualizada = eventos.filter(e => e.id !== id);
            setEventos(atualizada);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(atualizada));

            if (eventoVisualizandoQr?.id === id) {
              setEventoVisualizandoQr(null);
            }
          };

          const handleCopiarLink = (url: string, id: string) => {
            navigator.clipboard.writeText(url);
            setCopiadoId(id);
            setTimeout(() => setCopiadoId(null), 2500);
          };

          const handleBaixarQrCode = async (evento: EventoQrCode) => {
            try {
              const imgUrl = getQrCodeImageUrl(evento.urlCompleta, 600);
              const response = await fetch(imgUrl);
              const blob = await response.blob();
              const blobUrl = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = blobUrl;
              a.download = `qrcode_${evento.codigoEvento}.png`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(blobUrl);
            } catch (e) {
              window.open(getQrCodeImageUrl(evento.urlCompleta, 600), '_blank');
            }
          };

          const executarImpressao = (evento: EventoQrCode, tipo: TipoImpressao) => {
            setEventoParaImprimir(evento);
            setTipoImpressao(tipo);
            setEventoSelecionadoParaMenuPrint(null);

            setTimeout(() => {
              window.print();
            }, 250);
          };

          const eventosFiltrados = eventos.filter(ev => {
            const q = busca.toLowerCase();
            return (
              ev.nome.toLowerCase().includes(q) ||
              ev.responsavelNome.toLowerCase().includes(q) ||
              ev.responsavelId.includes(q) ||
              ev.codigoEvento.toLowerCase().includes(q)
            );
          });

          return (
            <>
              <div className="space-y-3 max-w-4xl mx-auto print:hidden">
                {/* CABEÇALHO COMPACTO (1 LINHA) */}
                <div className="bg-white rounded-xl px-4 py-3 border border-[#BCD3DF]/70 shadow-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-[#D9FBFF] rounded-lg text-[#004A6D]">
                      <QrCode className="w-4 h-4 text-[#004A6D]" />
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-black text-[#002A3A] leading-tight">
                        Eventos & QR Codes
                      </h2>
                      <span className="text-[10px] text-[#004A6D]/70 font-semibold hidden sm:inline">
                        {eventos.length} cadastrado{eventos.length !== 1 ? 's' : ''} (Sincronizado no Banco)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={carregarEventos}
                      disabled={loading}
                      title="Atualizar lista do banco de dados"
                      className="p-1.5 bg-slate-50 hover:bg-[#D9FBFF] text-[#004A6D] border border-slate-200 rounded-lg text-xs cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    </button>

                    <button
                      onClick={() => {
                        const hoje = new Date().toISOString().split('T')[0];
                        setFormDia(hoje);
                        setIsModalNovoOpen(true);
                      }}
                      className="flex items-center gap-1.5 bg-[#004A6D] hover:bg-[#002A3A] text-white px-3.5 py-1.5 rounded-lg font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#00E3E6]" />
                      <span>+ Novo Evento</span>
                    </button>
                  </div>
                </div>

                {/* BARRA DE PESQUISA */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#004A6D]/50" />
                  <input
                    type="text"
                    placeholder="Buscar evento ou responsável..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-[#BCD3DF]/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00E3E6] shadow-2xs"
                  />
                </div>

                  {/* LISTA DE EVENTOS */ }
        {loading && eventos.length === 0 ? (
                  <div className="bg-white rounded-xl p-8 text-center border border-slate-200 shadow-2xs">
                    <RefreshCw className="w-6 h-6 text-[#004A6D] animate-spin mx-auto mb-2" />
                    <p className="text-xs font-bold text-[#004A6D]">Carregando eventos do banco...</p>
                  </div>
                ) : eventosFiltrados.length === 0 ? (
                  <div className="bg-white rounded-xl p-8 text-center border border-dashed border-[#BCD3DF] shadow-2xs">
                    <QrCode className="w-8 h-8 text-[#BCD3DF] mx-auto mb-2" />
                    <h3 className="text-xs font-bold text-[#002A3A]">Nenhum evento encontrado</h3>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {eventosFiltrados.map((ev) => {
                      const dataFormatada = ev.dia ? ev.dia.split('-').reverse().join('/') : 'Data não informada';

                      return (
                        <div
                          key={ev.id}
                          className="bg-white rounded-xl border border-[#BCD3DF]/70 p-3.5 shadow-2xs hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative"
                        >
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-black text-[#002A3A] truncate mb-1">
                              {ev.nome}
                            </h3>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#004A6D]">
                              <div className="flex items-center gap-1 font-bold">
                                <Calendar className="w-3 h-3 text-[#004A6D]/70" />
                                <span>{dataFormatada}</span>
                              </div>

                              <div className="flex items-center gap-1 font-medium">
                                <User className="w-3 h-3 text-[#004A6D]/70" />
                                <span className="truncate">{ev.responsavelNome}</span>
                                <span className="text-[10px] text-slate-400 font-mono">({ev.responsavelId})</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                            <button
                              onClick={() => setEventoVisualizandoQr(ev)}
                              className="flex items-center gap-1 bg-[#004A6D] hover:bg-[#002A3A] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#00E3E6]" />
                              <span>Ver QR</span>
                            </button>

                            <button
                              onClick={() => handleCopiarLink(ev.urlCompleta, ev.id)}
                      className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${copiadoId === ev.id
                                  ? 'bg-emerald-600 text-white border-emerald-600'
                                  : 'bg-slate-50 hover:bg-[#D9FBFF] text-[#004A6D] border-slate-200'
                      }`}
                            title="Copiar URL Bitrix"
                    >
                            {copiadoId === ev.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>

                          <button
                            onClick={() => setEventoSelecionadoParaMenuPrint(ev)}
                            className="p-1.5 rounded-lg text-xs font-bold bg-slate-50 hover:bg-[#D9FBFF] text-[#004A6D] border border-slate-200 transition-all cursor-pointer flex items-center justify-center"
                            title="Imprimir Material (QR ou Display)"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleExcluirEvento(ev.id)}
                            className="p-1.5 rounded-lg text-xs font-bold text-slate-300 hover:text-red-500 transition-colors cursor-pointer"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                </div>
                );
            })}
              </div>
        )}

              {/* MODAL IMPRESSÃO */}
              {eventoSelecionadoParaMenuPrint && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#002A3A]/75 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                  <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-[#BCD3DF] p-5 flex flex-col animate-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                      <div className="min-w-0 pr-2">
                        <h3 className="text-sm font-black text-[#002A3A]">
                          Imprimir Material
                        </h3>
                        <p className="text-[11px] text-[#004A6D] font-bold truncate">
                          {eventoSelecionadoParaMenuPrint.nome}
                        </p>
                      </div>
                      <button
                        onClick={() => setEventoSelecionadoParaMenuPrint(null)}
                        className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 mb-3 font-semibold">
                      Selecione o formato desejado para a impressão:
                    </p>

                    <div className="space-y-2 mb-4">
                      <button
                        onClick={() => executarImpressao(eventoSelecionadoParaMenuPrint, 'QR_ONLY')}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-[#BCD3DF] bg-[#F4F9FA] hover:bg-[#D9FBFF] hover:border-[#004A6D] transition-all cursor-pointer text-left group"
                      >
                        <div className="p-2 bg-white rounded-lg border border-[#BCD3DF] text-[#004A6D] group-hover:bg-[#004A6D] group-hover:text-white transition-colors">
                          <QrCode className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-black text-[#002A3A]">Somente QR Code</div>
                          <div className="text-[11px] text-[#004A6D] font-bold">Medida: 5,5 x 5,5 cm</div>
                          <div className="text-[10px] text-slate-500">Ideal para adesivos e crachás</div>
                        </div>
                      </button>

                      <button
                        onClick={() => executarImpressao(eventoSelecionadoParaMenuPrint, 'EVENTO_COMPLETO')}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-[#BCD3DF] bg-[#F4F9FA] hover:bg-[#D9FBFF] hover:border-[#004A6D] transition-all cursor-pointer text-left group"
                      >
                        <div className="p-2 bg-white rounded-lg border border-[#BCD3DF] text-[#004A6D] group-hover:bg-[#004A6D] group-hover:text-white transition-colors">
                          <Printer className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-black text-[#002A3A]">Display do Evento</div>
                          <div className="text-[11px] text-[#004A6D] font-bold">Medida: 10 x 14 cm</div>
                          <div className="text-[10px] text-slate-500">Cartaz de balcão com Logo Vocação</div>
                        </div>
                      </button>
                    </div>

                    <button
                      onClick={() => setEventoSelecionadoParaMenuPrint(null)}
                      className="w-full py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* MODAL VER QR */}
              {eventoVisualizandoQr && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#002A3A]/75 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                  <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-[#BCD3DF] p-5 flex flex-col items-center animate-in zoom-in-95 duration-200">
                    <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                      <div className="min-w-0 pr-2">
                        <h3 className="text-sm font-black text-[#002A3A] truncate">
                          {eventoVisualizandoQr.nome}
                        </h3>
                        <span className="text-[11px] text-[#004A6D] font-bold block">
                          {eventoVisualizandoQr.dia.split('-').reverse().join('/')} • {eventoVisualizandoQr.responsavelNome}
                        </span>
                      </div>
                      <button
                        onClick={() => setEventoVisualizandoQr(null)}
                        className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="w-[230px] h-[230px] p-2 bg-white rounded-xl border-2 border-[#004A6D] shadow-sm mb-3 flex items-center justify-center">
                      <img
                        src={getQrCodeImageUrl(eventoVisualizandoQr.urlCompleta, 450)}
                        alt={eventoVisualizandoQr.nome}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <p className="text-[11px] text-center text-[#004A6D]/80 font-medium mb-3">
                      Aponte a câmera do celular para abrir o cadastro NFP Bitrix24
                    </p>

                    <div className="w-full bg-slate-50 p-2 rounded-lg border border-slate-200 mb-3 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-[#002A3A] truncate">
                        {eventoVisualizandoQr.urlCompleta}
                      </span>
                      <button
                        onClick={() => handleCopiarLink(eventoVisualizandoQr.urlCompleta, 'modal')}
                        className="text-[10px] font-bold text-[#004A6D] hover:underline shrink-0"
                      >
                        {copiadoId === 'modal' ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>

                    <div className="w-full grid grid-cols-2 gap-2 mb-2">
                      <button
                        onClick={() => handleBaixarQrCode(eventoVisualizandoQr)}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold bg-[#F4F9FA] hover:bg-[#D9FBFF] text-[#004A6D] border border-[#BCD3DF] cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Baixar Imagem</span>
                      </button>
                      <button
                        onClick={() => executarImpressao(eventoVisualizandoQr, 'QR_ONLY')}
                        className="flex items-center justify-center gap-1 py-2 px-2 rounded-lg text-xs font-bold bg-[#004A6D] hover:bg-[#002A3A] text-white cursor-pointer shadow-xs"
                      >
                        <QrCode className="w-3.5 h-3.5 text-[#00E3E6]" />
                        <span>Imprimir QR (5.5)</span>
                      </button>
                    </div>

                    <button
                      onClick={() => executarImpressao(eventoVisualizandoQr, 'EVENTO_COMPLETO')}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold bg-[#D9FBFF] hover:bg-[#00E3E6]/30 text-[#004A6D] border border-[#00E3E6]/60 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#004A6D]" />
                      <span>Imprimir Display (10 x 14 cm)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* MODAL NOVO EVENTO */}
              {isModalNovoOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#002A3A]/70 backdrop-blur-xs p-4 overflow-y-auto">
                  <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-[#BCD3DF] overflow-hidden animate-in fade-in duration-200">
                    <div className="bg-[#004A6D] p-4 text-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-[#00E3E6]" />
                        <h3 className="text-sm font-black">Cadastrar Novo Evento</h3>
                      </div>
                      <button
                        onClick={() => setIsModalNovoOpen(false)}
                        className="text-white/70 hover:text-white p-1 rounded-lg cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleCriarEvento} className="p-4 space-y-3">
                      <div>
                        <label className="block text-xs font-extrabold text-[#002A3A] mb-1">
                          Nome do Evento <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Jantar Vocação 2026"
                          value={formNome}
                          onChange={(e) => handleNomeChange(e.target.value)}
                          className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#004A6D] focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-extrabold text-[#002A3A] mb-1">
                            Dia <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            required
                            value={formDia}
                            onChange={(e) => setFormDia(e.target.value)}
                            className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#004A6D] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-extrabold text-[#002A3A] mb-1">
                            Responsável <span className="text-red-500">*</span>
                          </label>
                          <select
                            required
                            value={formResponsavelId}
                            onChange={(e) => setFormResponsavelId(e.target.value)}
                            className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#004A6D] focus:outline-none bg-white font-bold text-[#002A3A]"
                          >
                            {LISTA_RESPONSAVEIS.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.nome}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="bg-[#D9FBFF]/40 border border-[#00E3E6]/60 p-2.5 rounded-lg text-[10px]">
                        <span className="font-bold text-[#004A6D] block mb-0.5">🔗 Link Bitrix Gerado:</span>
                        <code className="text-[#002A3A] font-mono break-all font-semibold">
                          {montarUrl(formCodigo || formNome, formResponsavelId, formParamResponsavelNome)}
                        </code>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setIsModalNovoOpen(false)}
                          className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={salvando}
                          className="flex items-center gap-1.5 bg-[#004A6D] hover:bg-[#002A3A] text-white px-4 py-1.5 rounded-lg font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#00E3E6]" />
                          <span>{salvando ? 'Salvando...' : 'Salvar no Banco'}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div >

          {/* ÁREA EXCLUSIVA DE IMPRESSÃO */ }
          {
            eventoParaImprimir && (
              <div id="area-impressao-exclusiva-container" className="hidden print:flex">
                {tipoImpressao === 'QR_ONLY' ? (
                    <div 
              style={{
                      width: '5.5cm',
                      height: '5.5cm',
                      padding: '0.2cm',
                      boxSizing: 'border-box',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1.5px solid #004A6D',
                      borderRadius: '8px',
                      background: '#ffffff',
                      pageBreakInside: 'avoid',
                      margin: 'auto'
                    }}
                  >
              <img
                      src={getQrCodeImageUrl(eventoParaImprimir.urlCompleta, 450)}
                      alt="QR Code"
                      style={{
                        width: '4.7cm',
                        height: '4.7cm',
                        objectFit: 'contain'
                      }}
                    />
                    <span style={{ fontSize: '7pt', fontWeight: 'bold', color: '#004A6D', marginTop: '1mm', textAlign: 'center' }}>
                      {eventoParaImprimir.codigoEvento}
                    </span>
                  </div>
                ) : (
                    <div 
              style={{
                      width: '10cm',
                      height: '14cm',
                      padding: '0.6cm',
                      boxSizing: 'border-box',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: '2.5px solid #004A6D',
                      borderRadius: '16px',
                      background: '#ffffff',
                      pageBreakInside: 'avoid',
                      textAlign: 'center',
                      margin: 'auto'
                    }}
                  >
                    <div>
                <img
                        src="/vocacao-logo.png"
                        alt="Vocação"
                        style={{ height: '0.9cm', margin: '0 auto 0.2cm auto', objectFit: 'contain' }}
                      />
                      <div style={{ fontSize: '10pt', fontWeight: '900', color: '#004A6D', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Nota Fiscal Paulista
                      </div>
                      <div style={{ fontSize: '8pt', fontWeight: '700', color: '#002A3A' }}>
                        Seja um Doador Automático
                      </div>
                    </div>

                      <div 
                style={{
                        width: '100%',
                        background: '#F4F9FA',
                        border: '1px solid #BCD3DF',
                        borderRadius: '8px',
                        padding: '0.2cm 0.3cm',
                        boxSizing: 'border-box'
                      }}
                    >
                      <div style={{ fontSize: '9pt', fontWeight: '900', color: '#002A3A', lineHeight: 1.2 }}>
                        {eventoParaImprimir.nome}
                      </div>
                      <div style={{ fontSize: '7.5pt', color: '#004A6D', marginTop: '2px', fontWeight: '600' }}>
                        Dia: {eventoParaImprimir.dia.split('-').reverse().join('/')} | Resp.: {eventoParaImprimir.responsavelNome}
                      </div>
                    </div>

                      <div 
                style={{
                        width: '6.2cm',
                        height: '6.2cm',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1.5px solid #004A6D',
                        borderRadius: '10px',
                        padding: '0.15cm',
                        background: '#ffffff'
                      }}
                    >
                <img
                        src={getQrCodeImageUrl(eventoParaImprimir.urlCompleta, 500)}
                        alt="QR Code do Evento"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </div>

                    <div>
                      <div style={{ fontSize: '8pt', fontWeight: '800', color: '#002A3A' }}>
                        Aponte a câmera do seu celular
                      </div>
                      <div style={{ fontSize: '6.5pt', color: '#555555', marginTop: '2px', maxWidth: '8cm' }}>
                        Cadastre-se e doe seus créditos para transformar a vida de crianças e jovens da Vocação.
                      </div>
                    </div>

                    <div style={{ fontSize: '6pt', color: '#888888', wordBreak: 'break-all' }}>
                      {eventoParaImprimir.urlCompleta}
                    </div>
                  </div>
                )}
              </div>
            )
          }
    </>
  );
};
