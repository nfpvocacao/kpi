import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { TabId } from '../components/NavigationTabs';

export interface UsuarioAutenticado {
  id: string;
  nome: string;
  email: string;
  id_vendedor?: number | null;
  abas_permitidas: TabId[];
  is_admin: boolean;
  ativo: boolean;
}

interface AuthContextType {
  usuario: UsuarioAutenticado | null;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<{ sucesso: boolean; mensagem?: string }>;
  logout: () => void;
  temPermissaoAba: (abaId: TabId) => boolean;
  alterarSenha: (senhaAtual: string, novaSenha: string) => Promise<{ sucesso: boolean; mensagem?: string }>;
}

const STORAGE_KEY = 'nfp_usuario_logado';

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY);
      if (salvo) {
        const parsed = JSON.parse(salvo);
        setUsuario(parsed);
      }
    } catch (err) {
      console.error('Erro ao restaurar sessão local:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, senha: string): Promise<{ sucesso: boolean; mensagem?: string }> => {
    try {
      setIsLoading(true);

      // Chama a função RPC de autenticação segura no PostgreSQL
      const { data, error } = await supabase.rpc('nfp_autenticar_usuario', {
        p_email: email.trim().toLowerCase(),
        p_senha: senha.trim()
      });

      if (error) {
        console.error('Erro ao autenticar usuário:', error);
        return { sucesso: false, mensagem: 'Erro de conexão com o banco de dados.' };
      }

      if (!data || data.length === 0) {
        return { sucesso: false, mensagem: 'E-mail ou senha incorretos.' };
      }

      const userRow = data[0];
      const userObj: UsuarioAutenticado = {
        id: userRow.id,
        nome: userRow.nome,
        email: userRow.email,
        id_vendedor: userRow.id_vendedor,
        abas_permitidas: (userRow.abas_permitidas || []) as TabId[],
        is_admin: Boolean(userRow.is_admin),
        ativo: Boolean(userRow.ativo)
      };

      setUsuario(userObj);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userObj));
      return { sucesso: true };
    } catch (err: any) {
      console.error('Erro inesperado no login:', err);
      return { sucesso: false, mensagem: 'Ocorreu um erro inesperado ao tentar entrar.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const temPermissaoAba = (abaId: TabId): boolean => {
    if (!usuario) return false;
    if (usuario.is_admin) return true;
    return usuario.abas_permitidas.includes(abaId);
  };

  const alterarSenha = async (senhaAtual: string, novaSenha: string): Promise<{ sucesso: boolean; mensagem?: string }> => {
    if (!usuario) {
      return { sucesso: false, mensagem: 'Usuário não autenticado.' };
    }

    try {
      const { data, error } = await supabase.rpc('nfp_alterar_minha_senha', {
        p_usuario_id: usuario.id,
        p_senha_atual: senhaAtual.trim(),
        p_nova_senha: novaSenha.trim()
      });

      if (error) {
        console.error('Erro ao alterar senha:', error);
        return { sucesso: false, mensagem: error.message || 'Erro ao alterar senha no banco.' };
      }

      return { sucesso: true };
    } catch (err: any) {
      console.error('Erro inesperado ao alterar senha:', err);
      return { sucesso: false, mensagem: err.message || 'Falha ao processar alteração de senha.' };
    }
  };

  return (
    <AuthContext.Provider value={{ usuario, isLoading, login, logout, temPermissaoAba, alterarSenha }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
