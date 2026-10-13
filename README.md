# NFP Analytics - Vocação 📊

Plataforma integrada de inteligência de dados, auditoria fiscal e monitoramento de captação de recursos via **Nota Fiscal Paulista (SEFAZ-SP)** para a instituição **Vocação**.

---

## 📌 Sumário
1. [Visão Geral](#-visão-geral)
2. [Arquitetura & Tecnologias](#-arquitetura--tecnologias)
3. [Navegação e Funcionalidades das Abas](#-navegação-e-funcionalidades-das-abas)
   - [1. Desempenho & Captação](#1-desempenho--captação)
   - [2. Operações por Empresas Parceiras](#2-operações-por-empresas-parceiras)
   - [3. Doadores Reais (Pessoa Física)](#3-doadores-reais-pessoa-física)
   - [4. Doadores Automáticos](#4-doadores-automáticos)
   - [5. Benchmarking & Prospecção](#5-benchmarking--prospecção)
   - [6. Apresentação Institucional](#6-apresentação-institucional)
   - [7. Painel do Desenvolvedor & Processos ETL](#7-painel-do-desenvolvedor--processos-etl)
4. [Recursos Globais](#-recursos-globais)
   - [Filtro Temporal Dinâmico](#filtro-temporal-dinâmico)
   - [Modo TV (Painel para Telões)](#modo-tv-painel-para-telões)
   - [Modal de Regras de Negócio e Legislação](#modal-de-regras-de-negócio-e-legislação)
   - [Status do Banco e Sincronização](#status-do-banco-e-sincronização)
5. [Regras de Negócio e Legislação Fiscal](#-regras-de-negócio-e-legislação-fiscal)
6. [Pipeline de Dados & Processos de Carga (ETL)](#-pipeline-de-dados--processos-de-carga-etl)
7. [Como Executar o Projeto Localmente](#-como-executar-o-projeto-localmente)

---

## 🌟 Visão Geral

O **NFP Analytics** consolida milhões de registros de cupons fiscais doados à Vocação através do programa estadual da Nota Fiscal Paulista. O objetivo é fornecer visibilidade em tempo real para:
- Mensurar a arrecadação líquida e evolução mês a mês / ano a ano (YoY).
- Mapear a performance de cada parceiro comercial (redes de varejo, supermercados, farmácias, padarias e restaurantes).
- Identificar e fidelizar os principais doadores (compras cadastradas via CPF ou urnas físicas).
- Auditar a eficiência de liberação de créditos da SEFAZ por cupom e por estabelecimento.
- Apoiar a tomada de decisões da equipe de captação e diretoria executiva.

---

## 🛠 Arquitetura & Tecnologias

### Frontend
- **React 18** com **TypeScript** e **Vite** (configurado na porta `5180`).
- **Tailwind CSS** com sistema de cores customizado e tipografia Raleway.
- **Lucide React** para iconografia técnica e visual.
- **Recharts** para gráficos dinâmicos de área, barras e dispersão.
- **html-to-image** para exportação e captura de gráficos para apresentações e relatórios.

### Banco de Dados & Armazenamento
- **Supabase (PostgreSQL Cloud)**: Fonte de dados de alta disponibilidade conectada via `@supabase/supabase-js`.
- **SQLite Local (`nfp_database.db`)**: Base local otimizada para processamento rápido de ETL e consultas offline.
- **Arquivos de Base Fiscal**: Arquivos delimitados contendo cadastros oficiais de estabelecimentos e dados consolidados da SEFAZ (ex: `EMPRESAS NFP BASE LOCAL.txt`).

### Pipeline de Scripts (Python)
- `etl_import.py`: Processamento massivo de arquivos da SEFAZ e cargas consolidadas.
- `obter_dados.py` & `sync_local_empresas.py`: Normalização de CNPJs, nomes comerciais e agregações de receita.
- `sync_dumps_to_supabase.py` & `local_sync_agent.py`: Sincronização automática entre a base local SQLite e a nuvem Supabase.

---

## 📑 Navegação e Funcionalidades das Abas

### 1. Desempenho & Captação
Aba principal com visão executiva e indicadores macro da entidade:
- **KPIs Principais**:
  - **Valor Total Liberado (R$)**: Montante creditado pela SEFAZ no período selecionado.
  - **Total de Cupons Capturados**: Quantidade física e eletrônica de documentos processados.
  - **Ticket Médio por Cupom**: Retorno financeiro médio por documento fiscal.
  - **Eficiência de Liberação**: Percentual de cupons que geraram crédito versus notas zeradas.
- **Gráficos de Linha / Área Temporal**: Evolução mês a mês com comparativo anual (Ano Atual vs. Ano Anterior).
- **Detalhamento Mensal**: Tabela expansível com histórico de volume de cupons, receita por trimestre e sazonalidade.

### 2. Operações por Empresas Parceiras
Foco nas lojas, comércios e redes que geram cupons para a Vocação:
- **Tabela de Lojas & Redes**: Listagem por Razão Social, Nome Fantasia, CNPJ e Bairro/Região.
- **Métricas de Performance da Loja**:
  - Volume de cupons arrecadados no estabelecimento.
  - Valor financeiro gerado (R$).
  - Valor médio por cupom daquela unidade específica.
- **Filtros e Busca Rápida**: Pesquisa instantânea por nome da loja ou número de CNPJ.
- **Ranking das Melhores Parceiras**: Destaque das unidades que mais contribuem para a receita da instituição.

### 3. Doadores Reais (Pessoa Física)
Mapeamento dos doadores individuais e engajamento:
- **Raio-X do Doador**: Análise detalhada por CPF (com máscara de segurança).
- **Comportamento de Compra**: Identificação dos principais estabelecimentos frequentados pelo doador.
- **Matriz de Recorrência**: Divisão entre doadores frequentes (ativos todo mês), esporádicos e doadores inativos.
- **Ticket Médio Pessoal**: Média de crédito gerado por nota fiscal daquele perfil de doador.

### 4. Doadores Automáticos
Gestão de cadastros na modalidade de doação digital direta da SEFAZ:
- **Doação Automática via App NFP**: Pessoas que vincularam a Vocação como entidade beneficiária direta no login do site da Nota Fiscal Paulista.
- **Geração Recorrente sem Digitação**: Cupons gerados automaticamente sempre que o doador pede CPF na nota no varejo do Estado de SP.
- **Curva de Crescimento da Base**: Acompanhamento de novas adesões e taxa de retenção dos doadores cadastrados.

### 5. Benchmarking & Prospecção
Ferramenta estratégica de expansão territorial e prospecção:
- **Mapeamento de Oportunidades**: Análise de estabelecimentos com alto potencial de crédito de ICMS que ainda não possuem caixas ou urnas de captação ativas.
- **Segmentos do Varejo com Maior Retorno**: Identificação dos ramos de atividade (supermercados, lojas de material de construção, farmácias, restaurantes) com maior alíquota de crédito médio.
- **Planejamento de Rota de Coleta**: Apoio para otimizar as rotas físicas de recolhimento de urnas de cupons.

### 6. Apresentação Institucional
Ambiente visual de alto impacto desenvolvido para apresentações:
- **Visão Sintética Executiva**: Gráficos e números em escala ampliada, prontos para exibição em auditórios, reuniões de conselho ou encontros com patrocinadores.
- **Exportação Rápida**: Facilidade para copiar ou salvar capturas dos gráficos com estilo institucional.

### 7. Painel do Desenvolvedor & Processos ETL
Área restrita protegida por credencial técnica com:
- **Dicionário das Tabelas Supabase**: Estrutura das tabelas (`metricas_mensais`, `empresas_nfp`, `doadores`, `historico_nfp`).
- **Instruções Operacionais de Carga**: Passo a passo para rodar os scripts Python de importação de novas planilhas/dumps oficiais da SEFAZ.
- **Monitoramento de Integridade**: Status de sincronização entre a base local e a nuvem.

---

## 🎛 Recursos Globais

### Filtro Temporal Dinâmico
Presente no cabeçalho superior de todas as telas:
- Suporta múltiplos anos combinados (ex: 2024 + 2025 + 2026).
- Seleção de meses individuais ou trimestres.
- Presets rápidos: **Últimos 12 Meses**, **Histórico Completo (2009 a 2027)** ou **Intervalo Customizado (Range)**.

### Modo TV (Painel para Telões)
- Acionado pelo botão **Modo TV** no topo do sistema.
- Exibe métricas em tela cheia com carrossel automático alternando entre Desempenho, Top Parceiros e Metas.
- Ideal para telões na sede da organização e acompanhamento em equipe.

### Modal de Regras de Negócio e Legislação
Acessível pelo botão de escudo / regras fiscais no topo:
- Explicação transparente das regras da SEFAZ aplicadas aos cálculos do sistema (teto UFESP, rateio de 60%, limites de 7,5% por estabelecimento).

### Status do Banco e Sincronização
- Modal de status detalhando a latência de resposta, total de cupons processados, registros desduplicados e data/hora do último sync.
- Permite forçar atualização e verificar a saúde da conexão com o Supabase.

---

## ⚖ Regras de Negócio e Legislação Fiscal

O sistema adota estritamente os parâmetros legais da SEFAZ-SP (Resolução SF 56/2009 e alterações subsequentes):
1. **Teto de 10 UFESPs por Cupom**:
   - Um único cupom fiscal tem seu crédito limitado ao equivalente a 10 UFESPs (Unidades Fiscais do Estado de São Paulo), impedindo distorções provocadas por notas de valor excepcionalmente alto.
2. **Reserva Exclusiva de 60% para Entidades**:
   - Do montante total de ICMS devolvido pelo Estado de São Paulo, 60% é destinado prioritariamente às entidades de assistência social, saúde, educação e proteção animal devidamente cadastradas.
3. **Limite de 7,5% do ICMS por Estabelecimento**:
   - O rateio de créditos de uma loja é limitado a até 7,5% do ICMS efetivamente recolhido por aquele estabelecimento no mês de apuração.
4. **Modalidades de Captação**:
   - **Doação Automática com CPF**: O doador cadastra o CNPJ da entidade no portal/app da NFP uma única vez e todas as compras futuras destinam crédito automático.
   - **Cupom sem CPF (Urna / Digitação)**: Cupons recolhidos em caixas de estabelecimentos parceiros e cadastrados via aplicativo ou leitor até o dia 20 do mês subsequente.

---

## 🔄 Pipeline de Dados & Processos de Carga (ETL)

```
[Arquivos SEFAZ-SP / TXT] 
          │
          ▼
 [Scripts Python de ETL] ───► [SQLite Local: nfp_database.db]
 (etl_import.py / obter_dados.py)           │
                                            ▼
                               [sync_dumps_to_supabase.py]
                                            │
                                            ▼
                             [Supabase PostgreSQL (Nuvem)]
                                            │
                                            ▼
                            [NFP Analytics (React + Vite)]
```

- **Passo 1**: Os arquivos de remessa ou relatórios da SEFAZ são baixados e colocados no diretório do projeto.
- **Passo 2**: Os scripts Python descompactam, normalizam e limpam CNPJs com formatação inconsistente, tratando quebras de linha e desduplicando registros.
- **Passo 3**: Os registros são persistidos na base local `nfp_database.db`.
- **Passo 4**: O script de sincronização replica as métricas agregadas e consolidadas para o Supabase.
- **Passo 5**: A aplicação web consome a API do Supabase em tempo real com carregamento sob demanda.

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
- **Node.js** (v18 ou superior) e **npm**
- **Python 3.10+** (para execução dos scripts de ETL locais)

### Instalação de Dependências
```bash
# Na raiz do diretório c:/apps/kpi_nfp
npm install
```

### Executar o Servidor de Desenvolvimento
```bash
npm run dev
```
O Vite iniciará o servidor na porta configurada:
👉 **http://localhost:5180**

### Gerar Build de Produção
```bash
npm run build
```
O build compila o TypeScript, atualiza a versão automaticamente via `update-version.js` e gera o bundle otimizado na pasta `dist/`.
