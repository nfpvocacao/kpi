import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { X, KeyRound, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

interface AlterarSenhaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AlterarSenhaModal: React.FC<AlterarSenhaModalProps> = ({ isOpen, onClose }) => {
  const { usuario, alterarSenha } = useAuth();
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  if (!isOpen) return null;

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem(null);

    if (!senhaAtual.trim()) {
      setMensagem({ tipo: 'erro', texto: 'Informe sua senha atual.' });
      return;
    }

    if (!novaSenha.trim()) {
      setMensagem({ tipo: 'erro', texto: 'Informe a nova senha.' });
      return;
    }

    if (novaSenha.length < 6) {
      setMensagem({ tipo: 'erro', texto: 'A nova senha deve ter pelo menos 6 caracteres.' });
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setMensagem({ tipo: 'erro', texto: 'A confirmação de senha não confere com a nova senha.' });
      return;
    }

    try {
      setLoading(true);
      const res = await alterarSenha(senhaAtual, novaSenha);
      if (res.sucesso) {
        setMensagem({ tipo: 'sucesso', texto: 'Senha alterada com sucesso!' });
        setSenhaAtual('');
        setNovaSenha('');
        setConfirmarSenha('');
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setMensagem({ tipo: 'erro', texto: res.mensagem || 'Não foi possível alterar a senha.' });
      }
    } catch (err: any) {
      setMensagem({ tipo: 'erro', texto: err.message || 'Erro inesperado.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-[#BCD3DF]/60">
        
        {/* Topo do Modal */}
        <div className="px-6 py-4 bg-[#F4F9FA] border-b border-[#BCD3DF]/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#004A6D] text-white">
              <KeyRound className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-sm font-black text-[#002A3A]">
                Alterar Minha Senha
              </h2>
              <p className="text-[11px] text-[#004A6D]/70 font-medium truncate max-w-[220px]">
                {usuario?.nome} ({usuario?.email})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#004A6D]/60 hover:text-[#004A6D] hover:bg-[#BCD3DF]/30 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSalvar} className="p-6 space-y-4">
          {mensagem && (
            <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
              mensagem.tipo === 'sucesso' 
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {mensagem.tipo === 'sucesso' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{mensagem.texto}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#004A6D] block">
              Senha Atual
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#004A6D]/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={senhaAtual}
                onChange={e => setSenhaAtual(e.target.value)}
                placeholder="Informe sua senha atual"
                className="w-full pl-9 pr-3 py-2 bg-[#F4F9FA] border border-[#BCD3DF] rounded-xl text-xs text-[#002A3A] focus:outline-hidden focus:border-[#004A6D] font-medium"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#004A6D] block">
              Nova Senha (mínimo 6 caracteres)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#004A6D]/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={novaSenha}
                onChange={e => setNovaSenha(e.target.value)}
                placeholder="Digite a nova senha"
                className="w-full pl-9 pr-3 py-2 bg-[#F4F9FA] border border-[#BCD3DF] rounded-xl text-xs text-[#002A3A] focus:outline-hidden focus:border-[#004A6D] font-medium"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#004A6D] block">
              Confirmar Nova Senha
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#004A6D]/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={confirmarSenha}
                onChange={e => setConfirmarSenha(e.target.value)}
                placeholder="Repita a nova senha"
                className="w-full pl-9 pr-3 py-2 bg-[#F4F9FA] border border-[#BCD3DF] rounded-xl text-xs text-[#002A3A] focus:outline-hidden focus:border-[#004A6D] font-medium"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-[#004A6D]/70 hover:bg-[#F4F9FA] rounded-xl transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[#004A6D] hover:bg-[#003852] text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Atualizar Senha'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
