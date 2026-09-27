import React, { useState } from 'react';
import { 
  Lock, 
  Terminal, 
  Database, 
  Code2, 
  CheckCircle2, 
  KeyRound, 
  FileText, 
  RefreshCw, 
  Server, 
  BookOpen,
  UserCheck,
  Building2
} from 'lucide-react';
import { BrandBadge } from '../BrandBadge';

export const TabDevDocs: React.FC = () => {
  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loggedUser, setLoggedUser] = useState<string>('');

  const validPasswords = ['muma', 'ailton', 'xandao'];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPass = passwordInput.trim().toLowerCase();
    if (validPasswords.includes(cleanPass)) {
      setIsAuthenticated(true);
      setLoggedUser(cleanPass.toUpperCase());
      setAuthError(null);
    } else {
      setAuthError('Senha incorreta. Acesso restrito à equipe técnica.');
    }
  };

  // Se não estiver autenticado, exibe a tela de login por senha
  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-white border border-[#BCD3DF] rounded-2xl p-8 max-w-md w-full shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-[#004A6D] text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black text-[#002A3A] font-['Raleway',sans-serif]">
              Área do Desenvolvedor
            </h2>
            <p className="text-xs text-[#004A6D]/80">
              Acesso restrito para equipe técnica, processos de ETL e atualização de banco.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#002A3A] mb-1.5 uppercase tracking-wider">
                Digite a senha de acesso:
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Informe sua credencial..."
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F4F9FA] border border-[#BCD3DF] rounded-xl text-sm font-semibold text-[#002A3A] focus:outline-none focus:border-[#004A6D] transition-colors"
                />
                <KeyRound className="w-4 h-4 text-[#004A6D] absolute left-3.5 top-3" />
              </div>
              {authError && (
                <p className="text-xs text-[#FD3168] font-bold mt-2">{authError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-[#004A6D] hover:bg-[#002A3A] text-white font-bold py-2.5 rounded-xl text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <Terminal className="w-4 h-4" />
              <span>Desbloquear Painel Dev</span>
            </button>
          </form>

          <div className="text-center border-t border-[#F0F5F8] pt-4">
            <span className="text-[11px] text-[#004A6D]/60 font-medium">
              Chaves autorizadas: MUMA | AILTON | XANDAO
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header do Painel Dev */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#BCD3DF]/60 rounded-2xl p-5 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#002A3A] tracking-tight font-['Raleway',sans-serif]">
              Painel do Desenvolvedor & Processos ETL
            </h1>
            <BrandBadge highlightText="Dev" prefix="Painel" colorVariant="cyan" size="sm" />
          </div>
          <p className="text-xs text-[#004A6D]/80 mt-1">
            Instruções operacionais, scripts de carga e dicionário de dados das tabelas do Supabase.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#D9FBFF] text-[#004A6D] px-3 py-1.5 rounded-xl text-xs font-extrabold">
            <UserCheck className="w-4 h-4 text-[#004A6D]" />
            <span>Sessão: {loggedUser}</span>
          </div>

          <button
            onClick={() => setIsAuthenticated(false)}
            className="text-xs font-bold text-[#FD3168] hover:underline cursor-pointer"
          >
            Bloquear
          </button>
        </div>
      </div>

      {/* Grid de Seções */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Bloco 1: Scripts de Sincronização */}
        <div className="bg-white border border-[#BCD3DF]/60 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#BCD3DF]/50 pb-3">
            <RefreshCw className="w-5 h-5 text-[#004A6D]" />
            <h2 className="text-base font-black text-[#002A3A]">
              1. Sincronização de Dumps (`nfp_empresas` e `nfp_doadores`)
            </h2>
          </div>

          <p className="text-xs text-[#004A6D]/80 leading-relaxed">
            Sempre que novos dumps MySQL forem gerados a partir do banco original (`backoffice`), coloque os arquivos `.sql` na raiz da aplicação e execute o script Python automatizado:
          </p>

          <div className="bg-[#002A3A] text-[#00E3E6] font-mono text-xs p-3.5 rounded-xl space-y-1">
            <div className="text-gray-400"># Executar a atualização da base Supabase:</div>
            <div>python sync_dumps_to_supabase.py</div>
          </div>

          <div className="space-y-2 text-xs text-[#002A3A]">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-[#00E04B]" />
              <span>`nfp_empresas`: Importa CNPJ, Razão Social, IDVendedor (Comissões) e Endereços.</span>
            </div>
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-[#00E04B]" />
              <span>`nfp_doadores`: Importa CPF, Tipo de Ligação (Funcionário, FaceToFace) e Bitrix.</span>
            </div>
          </div>
        </div>

        {/* Bloco 2: SQL de Criação de Tabelas */}
        <div className="bg-white border border-[#BCD3DF]/60 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#BCD3DF]/50 pb-3">
            <Database className="w-5 h-5 text-[#004A6D]" />
            <h2 className="text-base font-black text-[#002A3A]">
              2. Estrutura SQL no Supabase
            </h2>
          </div>

          <p className="text-xs text-[#004A6D]/80 leading-relaxed">
            Se precisar recriar a estrutura de tabelas no Supabase SQL Editor:
          </p>

          <div className="bg-[#F8FCFD] border border-[#BCD3DF] p-3 rounded-xl max-h-36 overflow-y-auto font-mono text-[11px] text-[#002A3A]">
            <pre>{`-- Tabela nfp_empresas
CREATE TABLE public.nfp_empresas (
  cnpj VARCHAR(20) PRIMARY KEY,
  tipo VARCHAR(80),
  empresa VARCHAR(100),
  fantasia VARCHAR(80),
  cupons INT,
  val_credito DOUBLE PRECISION,
  id_vendedor INT,
  cidade VARCHAR(70),
  cep VARCHAR(10)
);

-- Tabela nfp_doadores
CREATE TABLE public.nfp_doadores (
  cpf VARCHAR(20) PRIMARY KEY,
  doador VARCHAR(100),
  ligacao VARCHAR(30),
  id_bitrix INT
);`}</pre>
          </div>
        </div>

      </div>

      {/* Bloco 3: Dicionário de Variáveis e Regras */}
      <div className="bg-white border border-[#BCD3DF]/60 rounded-2xl p-5 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 border-b border-[#BCD3DF]/50 pb-3">
          <BookOpen className="w-5 h-5 text-[#004A6D]" />
          <h2 className="text-base font-black text-[#002A3A]">
            3. Regras Globais da Aplicação & comissões
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-[#F4F9FA] p-3.5 rounded-xl border border-[#BCD3DF]/40 space-y-1">
            <div className="font-bold text-[#002A3A]">IDVendedor / Comissões</div>
            <p className="text-[#004A6D]/80 text-[11px]">
              O campo `IDVendedor` em `nfp_empresas` mapeia o captador interno responsável pela conta para efeito de cálculo de comissão.
            </p>
          </div>

          <div className="bg-[#F4F9FA] p-3.5 rounded-xl border border-[#BCD3DF]/40 space-y-1">
            <div className="font-bold text-[#002A3A]">Origem de Doação (`Ligação`)</div>
            <p className="text-[#004A6D]/80 text-[11px]">
              Em `nfp_doadores`, os doadores cadastrados via aplicativo/FaceToFace são identificados para diferenciar doações automáticas de esporádicas.
            </p>
          </div>

          <div className="bg-[#F4F9FA] p-3.5 rounded-xl border border-[#BCD3DF]/40 space-y-1">
            <div className="font-bold text-[#002A3A]">Atualização da Base</div>
            <p className="text-[#004A6D]/80 text-[11px]">
              O pipeline utiliza `resolution=merge-duplicates` (upsert), preservando registros existentes e atualizando somente os alterados.
            </p>
          </div>
        </div>
      </div>

      {/* Bloco 4: Mapeamento de Tabelas do Supabase x Abas da Aplicação */}
      <div className="bg-white border border-[#BCD3DF]/60 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#BCD3DF]/50 pb-3">
          <Server className="w-5 h-5 text-[#004A6D]" />
          <h2 className="text-base font-black text-[#002A3A]">
            4. Arquitetura do Banco de Dados (Mapeamento Supabase x Abas do Site)
          </h2>
        </div>

        <div className="overflow-x-auto border border-[#BCD3DF] rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F4F9FA] border-b border-[#BCD3DF] text-[#004A6D] font-bold text-[11px]">
                <th className="py-2.5 px-3">Tabela no Supabase</th>
                <th className="py-2.5 px-3">Aba Correspondente no Site</th>
                <th className="py-2.5 px-3">Descrição / O que Alimenta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F5F8] text-[11px]">
              <tr className="hover:bg-[#F8FCFD]">
                <td className="py-2.5 px-3 font-mono font-bold text-[#002A3A]">vocacao_consolidado_interno</td>
                <td className="py-2.5 px-3 font-bold text-[#004A6D]">📈 Desempenho (YoY)</td>
                <td className="py-2.5 px-3 text-[#004A6D]/80">Alimenta KPIs gerais, gráficos de evolução histórica e comparativos de receita.</td>
              </tr>
              <tr className="hover:bg-[#F8FCFD]">
                <td className="py-2.5 px-3 font-mono font-bold text-[#002A3A]">vocacao_resumo_mensal_empresas</td>
                <td className="py-2.5 px-3 font-bold text-[#004A6D]">🏢 Empresas</td>
                <td className="py-2.5 px-3 text-[#004A6D]/80">Ranking mensal de lojas, score de eficiência, volume de cupons e créditos apurados.</td>
              </tr>
              <tr className="hover:bg-[#F8FCFD]">
                <td className="py-2.5 px-3 font-mono font-bold text-[#002A3A]">nfp_empresas</td>
                <td className="py-2.5 px-3 font-bold text-[#004A6D]">🏢 Empresas (Cadastro Mestre)</td>
                <td className="py-2.5 px-3 text-[#004A6D]/80">Cadastro oficial das redes (contém Razão Social, ID Vendedor, Cidade, Contatos).</td>
              </tr>
              <tr className="hover:bg-[#F8FCFD]">
                <td className="py-2.5 px-3 font-mono font-bold text-[#002A3A]">vocacao_resumo_mensal_doadores</td>
                <td className="py-2.5 px-3 font-bold text-[#004A6D]">🤝 Doadores Reais</td>
                <td className="py-2.5 px-3 text-[#004A6D]/80">Resumo consolidado por CPF (Volume de cupons, valor de NF, modalidade e crédito retornado).</td>
              </tr>
              <tr className="hover:bg-[#F8FCFD]">
                <td className="py-2.5 px-3 font-mono font-bold text-[#002A3A]">vocacao_doador_estabelecimento_mensal</td>
                <td className="py-2.5 px-3 font-bold text-[#004A6D]">🤝 Doadores Reais (Cruzamento)</td>
                <td className="py-2.5 px-3 text-[#004A6D]/80">Detalhamento doador x lojas (quais estabelecimentos o doador comprou e gerou créditos).</td>
              </tr>
              <tr className="hover:bg-[#F8FCFD]">
                <td className="py-2.5 px-3 font-mono font-bold text-[#002A3A]">nfp_doadores</td>
                <td className="py-2.5 px-3 font-bold text-[#004A6D]">🤝 Doadores Reais (Cadastro Mestre)</td>
                <td className="py-2.5 px-3 text-[#004A6D]/80">Cadastro mestre com CPF, Nome, Bitrix, Pessoa Responsável e Dados de Indicação.</td>
              </tr>
              <tr className="hover:bg-[#F8FCFD]">
                <td className="py-2.5 px-3 font-mono font-bold text-[#002A3A]">vocacao_mapa_interno</td>
                <td className="py-2.5 px-3 font-bold text-[#004A6D]">⚙️ Doadores Auto</td>
                <td className="py-2.5 px-3 text-[#004A6D]/80">Indicadores de doadores plenos/restritos e taxa de retenção da modalidade automática.</td>
              </tr>
              <tr className="hover:bg-[#F8FCFD]">
                <td className="py-2.5 px-3 font-mono font-bold text-[#002A3A]">historico_distribuicao</td>
                <td className="py-2.5 px-3 font-bold text-[#004A6D]">📊 Benchmarking (SEFAZ)</td>
                <td className="py-2.5 px-3 text-[#004A6D]/80">Valores distribuídos a entidades de Assistência Social no Estado de SP.</td>
              </tr>
              <tr className="hover:bg-[#F8FCFD]">
                <td className="py-2.5 px-3 font-mono font-bold text-[#002A3A]">entidades</td>
                <td className="py-2.5 px-3 font-bold text-[#004A6D]">📊 Benchmarking (SEFAZ)</td>
                <td className="py-2.5 px-3 text-[#004A6D]/80">Cadastro público de todas as entidades sem fins lucrativos da SEFAZ-SP.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
