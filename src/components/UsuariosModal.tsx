import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { TabId } from './NavigationTabs';
import { VENDEDORES_MAP } from '../types';
import { X, UserPlus, Key, Trash2, Check, Shield, Users, Save, CheckSquare, Square } from 'lucide-react';

interface UsuarioBanco {
  id: string;
  nome: string;
  email: string;
  id_vendedor?: number | null;
  abas_permitidas: string[];
  is_admin: boolean;
  ativo: boolean;
}

interface UsuariosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TODAS_AS_ABAS: { id: TabId; label: string; desc: string }[] = [
  { id: 'desempenho', label: 'Desempenho', desc: 'Métricas gerais e consolidadas de captação NFP' },
  { id: 'empresas', label: 'Empresas', desc: 'Detalhamento de lojas e empresas parceiras' },
  { id: 'comissoes', label: 'Comissões', desc: 'Cálculo de carteiras e comissões da equipe' },
  { id: 'doadores', label: 'Raio-X Doadores', desc: 'Análise de doadores individuais e CPFs' },
  { id: 'automaticos', label: 'Doadores Fidelizados', desc: 'Doações automáticas recorrentes SEFAZ' },
  { id: 'campanhas', label: 'Ações & Campanhas', desc: 'Eventos de captação e campanhas ativas' },
  { id: 'benchmarking', label: 'Benchmarking', desc: 'Comparativos de mercado e prospecção' },
  { id: 'apresentacao', label: 'Apresentação', desc: 'Painel para projeção institucional' },
  { id: 'dev', label: 'Dev / Processos', desc: 'Acesso técnico, logs e rotinas de banco' }
];

export const UsuariosModal: React.FC<UsuariosModalProps> = ({ isOpen, onClose }) => {
  const [usuarios, setUsuarios] = useState<UsuarioBanco[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<UsuarioBanco | null>(null);
  const [isNovo, setIsNovo] = useState<boolean>(false);

  // Campos do formulário
  const [formNome, setFormNome] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formSenha, setFormSenha] = useState('');
  const [formIdVendedor, setFormIdVendedor] = useState<string>('');
  const [formIsAdmin, setFormIsAdmin] = useState(false);
  const [formAbas, setFormAbas] = useState<TabId[]>(['desempenho']);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('nfp_usuarios')
        .select('id, nome, email, id_vendedor, abas_permitidas, is_admin, ativo')
        .order('nome');

      if (error) throw error;
      setUsuarios((data || []) as UsuarioBanco[]);
    } catch (err: any) {
      console.error('Erro ao carregar usuários:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      carregarUsuarios();
      setUsuarioSelecionado(null);
      setIsNovo(false);
      setMensagem(null);
    }
  }, [isOpen]);

  const abrirEdicao = (u: UsuarioBanco) => {
    setUsuarioSelecionado(u);
    setIsNovo(false);
    setFormNome(u.nome);
    setFormEmail(u.email);
    setFormSenha(''); // Não exibe a senha atual
    setFormIdVendedor(u.id_vendedor ? String(u.id_vendedor) : '');
    setFormIsAdmin(u.is_admin);
    setFormAbas((u.abas_permitidas || []) as TabId[]);
    setMensagem(null);
  };

  const abrirNovo = () => {
    setUsuarioSelecionado(null);
    setIsNovo(true);
    setFormNome('');
    setFormEmail('');
    setFormSenha('');
    setFormIdVendedor('');
    setFormIsAdmin(false);
    setFormAbas(['desempenho', 'empresas']);
    setMensagem(null);
  };

  const toggleAba = (abaId: TabId) => {
    if (formAbas.includes(abaId)) {
      setFormAbas(formAbas.filter(a => a !== abaId));
    } else {
      setFormAbas([...formAbas, abaId]);
    }
  };

  const marcarTodasAbas = () => {
    setFormAbas(TODAS_AS_ABAS.map(a => a.id));
  };

  const desmarcarTodasAbas = () => {
    setFormAbas([]);
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem(null);

    if (!formNome.trim() || !formEmail.trim()) {
      setMensagem({ tipo: 'erro', texto: 'Nome e E-mail são obrigatórios.' });
      return;
    }

    if (isNovo && !formSenha.trim()) {
      setMensagem({ tipo: 'erro', texto: 'A senha é obrigatória para novos usuários.' });
      return;
    }

    try {
      setSalvando(true);
      const idVendedorNum = formIdVendedor ? parseInt(formIdVendedor, 10) : null;

      if (isNovo) {
        // Inserção com senha criptografada via função pgcrypto no PostgreSQL
        const { error } = await supabase.rpc('nfp_criar_usuario', {
          p_nome: formNome.trim(),
          p_email: formEmail.trim().toLowerCase(),
          p_senha: formSenha.trim(),
          p_id_vendedor: idVendedorNum,
          p_abas: formAbas,
          p_is_admin: formIsAdmin
        });

        // Caso a RPC não exista, faz o insert direto
        if (error) {
          const { error: insertErr } = await supabase.from('nfp_usuarios').insert({
            nome: formNome.trim(),
            email: formEmail.trim().toLowerCase(),
            senha_hash: formSenha.trim(),
            id_vendedor: idVendedorNum,
            abas_permitidas: formAbas,
            is_admin: formIsAdmin,
            ativo: true
          });
          if (insertErr) throw insertErr;
        }

        setMensagem({ tipo: 'sucesso', texto: 'Usuário cadastrado com sucesso!' });
      } else if (usuarioSelecionado) {
        // Atualização
        const updateData: any = {
          nome: formNome.trim(),
          email: formEmail.trim().toLowerCase(),
          id_vendedor: idVendedorNum,
          abas_permitidas: formAbas,
          is_admin: formIsAdmin
        };

        // Se digitou uma nova senha, atualiza
        if (formSenha.trim()) {
          updateData.senha_hash = formSenha.trim();
        }

        const { error } = await supabase
          .from('nfp_usuarios')
          .update(updateData)
          .eq('id', usuarioSelecionado.id);

        if (error) throw error;
        setMensagem({ tipo: 'sucesso', texto: 'Permissões atualizadas com sucesso!' });
      }

      await carregarUsuarios();
      if (isNovo) {
        setIsNovo(false);
        setUsuarioSelecionado(null);
      }
    } catch (err: any) {
      console.error('Erro ao salvar usuário:', err);
      setMensagem({ tipo: 'erro', texto: err.message || 'Erro ao salvar no banco.' });
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async (id: string) => {
    if (!confirm('Deseja realmente excluir este usuário?')) return;
    try {
      const { error } = await supabase.from('nfp_usuarios').delete().eq('id', id);
      if (error) throw error;
      setUsuarioSelecionado(null);
      setIsNovo(false);
      await carregarUsuarios();
    } catch (err: any) {
      alert('Erro ao excluir usuário: ' + err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-[#BCD3DF]/60">
        
        {/* Header do Modal */}
        <div className="px-6 py-4 bg-[#F4F9FA] border-b border-[#BCD3DF]/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-[#004A6D] text-white">
              <Users className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-black text-[#002A3A]">
                Gerenciamento de Usuários e Permissões de Telas
              </h2>
              <p className="text-xs text-[#004A6D]/70 font-medium">
                Selecione um usuário para flegar ou bloquear o acesso a cada aba do sistema
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#004A6D]/60 hover:text-[#004A6D] hover:bg-[#BCD3DF]/30 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo com Lista à Esquerda e Detalhe/Checkboxes à Direita */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-[#BCD3DF]/40">
          
          {/* Coluna Esquerda: Lista de Usuários */}
          <div className="md:col-span-4 p-4 space-y-3 bg-[#F4F9FA]/40 overflow-y-auto max-h-[600px]">
            <div className="flex items-center justify-between pb-2 border-b border-[#BCD3DF]/40">
              <span className="text-xs font-black uppercase text-[#004A6D] tracking-wider">
                Usuários ({usuarios.length})
              </span>
              <button
                onClick={abrirNovo}
                className="px-2.5 py-1 bg-[#004A6D] text-white rounded-lg text-xs font-bold hover:bg-[#003852] transition-all flex items-center gap-1 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Novo
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8 text-xs text-slate-400">Carregando usuários...</div>
            ) : usuarios.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">Nenhum usuário cadastrado.</div>
            ) : (
              usuarios.map(u => {
                const isSelected = usuarioSelecionado?.id === u.id;
                return (
                  <div
                    key={u.id}
                    onClick={() => abrirEdicao(u)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#D9FBFF]/60 border-[#00E3E6] shadow-xs'
                        : 'bg-white border-[#BCD3DF]/50 hover:border-[#004A6D]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-xs text-[#002A3A] truncate max-w-[160px]">
                        {u.nome}
                      </div>
                      {u.is_admin && (
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#004A6D]/70 truncate mb-1">
                      {u.email}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      {u.is_admin ? (
                        <span className="text-emerald-700 font-bold">Acesso Total (Todas as Abas)</span>
                      ) : (
                        <span>{u.abas_permitidas?.length || 0} de {TODAS_AS_ABAS.length} abas liberadas</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Coluna Direita: Formulário de Permissões */}
          <div className="md:col-span-8 p-6 overflow-y-auto max-h-[600px]">
            {usuarioSelecionado || isNovo ? (
              <form onSubmit={handleSalvar} className="space-y-5">
                
                {mensagem && (
                  <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    mensagem.tipo === 'sucesso' 
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}>
                    <Check className="w-4 h-4 shrink-0" />
                    <span>{mensagem.texto}</span>
                  </div>
                )}

                {/* Dados Pessoais */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#004A6D] block mb-1">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      required
                      value={formNome}
                      onChange={e => setFormNome(e.target.value)}
                      placeholder="Ex: Priscila Vasques"
                      className="w-full px-3 py-2 bg-[#F4F9FA] border border-[#BCD3DF] rounded-xl text-xs text-[#002A3A] focus:outline-hidden focus:border-[#004A6D] font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#004A6D] block mb-1">
                      E-mail
                    </label>
                    <input
                      type="email"
                      required
                      value={formEmail}
                      onChange={e => setFormEmail(e.target.value)}
                      placeholder="usuario@vocacao.org.br"
                      className="w-full px-3 py-2 bg-[#F4F9FA] border border-[#BCD3DF] rounded-xl text-xs text-[#002A3A] focus:outline-hidden focus:border-[#004A6D] font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#004A6D] block mb-1">
                      {isNovo ? 'Senha de Acesso' : 'Nova Senha (deixe em branco para manter)'}
                    </label>
                    <input
                      type="password"
                      value={formSenha}
                      onChange={e => setFormSenha(e.target.value)}
                      placeholder={isNovo ? '••••••••' : 'Manter a mesma senha'}
                      className="w-full px-3 py-2 bg-[#F4F9FA] border border-[#BCD3DF] rounded-xl text-xs text-[#002A3A] focus:outline-hidden focus:border-[#004A6D] font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#004A6D] block mb-1">
                      Vendedor Vinculado (Opcional)
                    </label>
                    <select
                      value={formIdVendedor}
                      onChange={e => setFormIdVendedor(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F4F9FA] border border-[#BCD3DF] rounded-xl text-xs text-[#002A3A] focus:outline-hidden focus:border-[#004A6D] font-medium"
                    >
                      <option value="">Nenhum (Visualização Geral)</option>
                      {Object.entries(VENDEDORES_MAP).map(([id, nome]) => (
                        <option key={id} value={id}>
                          ID {id} - {nome}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Opção Administrador */}
                <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-700" />
                    <div>
                      <div className="text-xs font-bold text-amber-900">Acesso de Administrador</div>
                      <div className="text-[10px] text-amber-700">Administradores têm acesso a todas as abas e gerenciam outros usuários</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formIsAdmin}
                    onChange={e => setFormIsAdmin(e.target.checked)}
                    className="w-4 h-4 text-[#004A6D] rounded border-slate-300 focus:ring-[#004A6D] cursor-pointer"
                  />
                </div>

                {/* Seção dos Checkboxes de Permissões de Abas */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-black uppercase text-[#004A6D] tracking-wider">
                        Permissões por Tela (Abas do Sistema)
                      </h3>
                      <p className="text-[11px] text-[#004A6D]/70 font-medium">
                        Flegue as abas que este usuário poderá visualizar na barra de navegação
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={marcarTodasAbas}
                        className="text-[10px] text-[#004A6D] font-bold hover:underline cursor-pointer"
                      >
                        Marcar Todas
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={desmarcarTodasAbas}
                        className="text-[10px] text-slate-500 font-bold hover:underline cursor-pointer"
                      >
                        Desmarcar Todas
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {TODAS_AS_ABAS.map(aba => {
                      const isFlegada = formIsAdmin || formAbas.includes(aba.id);
                      return (
                        <div
                          key={aba.id}
                          onClick={() => !formIsAdmin && toggleAba(aba.id)}
                          className={`p-3 rounded-2xl border transition-all flex items-start gap-3 select-none ${
                            formIsAdmin
                              ? 'bg-slate-50 border-slate-200 opacity-70 cursor-not-allowed'
                              : isFlegada
                              ? 'bg-[#00E04B]/10 border-[#00E04B]/40 cursor-pointer shadow-2xs'
                              : 'bg-white border-[#BCD3DF]/50 hover:border-[#BCD3DF] cursor-pointer'
                          }`}
                        >
                          <div className="mt-0.5">
                            {isFlegada ? (
                              <CheckSquare className="w-4 h-4 text-[#006E24]" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <div className={`text-xs font-bold ${isFlegada ? 'text-[#006E24]' : 'text-[#002A3A]'}`}>
                              {aba.label}
                            </div>
                            <div className="text-[10px] text-slate-500 line-clamp-1">
                              {aba.desc}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex items-center justify-between pt-4 border-t border-[#BCD3DF]/40">
                  {usuarioSelecionado && !isNovo && (
                    <button
                      type="button"
                      onClick={() => handleExcluir(usuarioSelecionado.id)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      Excluir Usuário
                    </button>
                  )}
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      type="submit"
                      disabled={salvando}
                      className="px-5 py-2.5 bg-[#004A6D] hover:bg-[#003852] text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{salvando ? 'Salvando...' : 'Salvar Permissões'}</span>
                    </button>
                  </div>
                </div>

              </form>
            ) : (
              <div className="text-center py-20 text-slate-400 space-y-2">
                <Users className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-medium">Selecione um usuário à esquerda ou clique em "Novo" para configurar permissões.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
