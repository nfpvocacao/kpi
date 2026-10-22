import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

export const LoginScreen: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (!email.trim() || !senha.trim()) {
      setErro('Por favor, informe o e-mail e a senha.');
      return;
    }

    setIsSubmitting(true);
    const resultado = await login(email, senha);
    setIsSubmitting(false);

    if (!resultado.sucesso) {
      setErro(resultado.mensagem || 'Falha na autenticação.');
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#002A3A] via-[#004A6D] to-[#001D29] flex items-center justify-center p-4">
      {/* Container Principal */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20">
        
        {/* Topo com Logo e Identidade Visual */}
        <div className="bg-[#F4F9FA] p-8 text-center border-b border-[#BCD3DF]/40">
          <div className="flex justify-center mb-4">
            <BrandLogo className="h-10 text-[#004A6D]" />
          </div>
          <h1 className="text-xl font-black text-[#002A3A] tracking-tight">
            NFP Analytics
          </h1>
          <p className="text-xs text-[#004A6D]/80 font-medium mt-1">
            Plataforma Estratégica de Captação e Inteligência
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDCD01]/20 text-[#002A3A] text-[11px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-[#004A6D]" />
            Acesso Restrito & Seguro
          </div>
        </div>

        {/* Formulário de Login */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {erro && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{erro}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#004A6D] block">
              E-mail institucional
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#004A6D]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu.email@vocacao.org.br"
                className="w-full pl-10 pr-4 py-2.5 bg-[#F4F9FA] border border-[#BCD3DF] rounded-xl text-xs text-[#002A3A] placeholder-[#004A6D]/40 focus:outline-hidden focus:border-[#004A6D] focus:ring-2 focus:ring-[#004A6D]/15 font-medium transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#004A6D] block">
              Senha de acesso
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#004A6D]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-[#F4F9FA] border border-[#BCD3DF] rounded-xl text-xs text-[#002A3A] placeholder-[#004A6D]/40 focus:outline-hidden focus:border-[#004A6D] focus:ring-2 focus:ring-[#004A6D]/15 font-medium transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full py-3 px-4 bg-[#004A6D] hover:bg-[#003852] text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group mt-2"
          >
            {isSubmitting ? (
              <span>Autenticando...</span>
            ) : (
              <>
                <span>Entrar no Sistema</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <p className="text-center text-[11px] text-[#004A6D]/60 pt-2">
            Em caso de dúvidas ou acesso bloqueado, contate o administrador do sistema.
          </p>
        </form>
      </div>
    </div>
  );
};
