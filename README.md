# NFP Analytics - Vocação 📊

Plataforma integrada de inteligência de dados, auditoria fiscal e monitoramento de captação de recursos via **Nota Fiscal Paulista (SEFAZ-SP)** e **Bitrix24 CRM** para a instituição **Vocação**.

---

## 📌 Sumário
1. [Visão Geral](#-visão-geral)
2. [Arquitetura & Tecnologias](#-arquitetura--tecnologias)
3. [Navegação e Funcionalidades das Abas](#-navegação-e-funcionalidades-das-abas)
   - [1. Desempenho & Captação](#1-desempenho--captação)
   - [2. Operações por Empresas Parceiras](#2-operações-por-empresas-parceiras)
   - [3. Raio-X de Doadores (Pessoa Física)](#3-raio-x-de-doadores-pessoa-física)
   - [4. Doadores Fidelizados (Automáticos SEFAZ)](#4-doadores-fidelizados-automáticos-sefaz)
   - [5. Ações & Campanhas (CRM Bitrix24 + Auditoria SEFAZ)](#5-ações--campanhas-crm-bitrix24--auditoria-sefaz)
   - [6. Benchmarking & Prospecção](#6-benchmarking--prospecção)
   - [7. Apresentação Institucional](#7-apresentação-institucional)
   - [8. Painel do Desenvolvedor & Processos ETL](#8-painel-do-desenvolvedor--processos-etl)
4. [Recursos Globais](#-recursos-globais)
   - [Filtro Temporal Dinâmico e Reativo](#filtro-temporal-dinâmico-e-reativo)
   - [Modo TV (Painel para Telões)](#modo-tv-painel-para-telões)
   - [Modal de Regras de Negócio e Legislação](#modal-de-regras-de-negócio-e-legislação)
   - [Status do Banco e Conexão Nuvem](#status-do-banco-e-conexão-nuvem)
5. [Regras de Negócio e Cronograma Fiscal SEFAZ-SP](#-regras-de-negócio-e-cronograma-fiscal-sefaz-sp)
6. [Pipeline de Dados & Sincronização 100% Cloud](#-pipeline-de-dados--sincronização-100-cloud)
7. [Dicionário de Dados Oficial (Supabase PostgreSQL)](#-dicionário-de-dados-oficial-supabase-postgresql)
8. [Como Executar o Projeto Localmente](#-como-executar-o-projeto-localmente)

---

## 🌟 Visão Geral

O **NFP Analytics** consolida milhões de registros de cupons fiscais doados à Vocação através do programa estadual da Nota Fiscal Paulista e integra o funil de captação institucional do Bitrix24. O sistema fornece visibilidade estratégica em tempo real para:
- Mensurar a arrecadação líquida e evolução mês a mês / ano a ano (YoY).
- Mapear a performance de cada parceiro comercial (redes de varejo, supermercados, farmácias e restaurantes).
- Identificar e fidelizar os principais doadores (compras cadastradas via CPF ou urnas físicas).
- Auditar o mérito de novas campanhas no Bitrix24, separando novos doadores de doadores preexistentes.
- Monitorar a liquidação real dos créditos estaduais respeitando a defasagem fiscal de 4 meses da SEFAZ.

---

## 🛠 Arquitetura & Tecnologias

### Frontend
- **React 18** com **TypeScript** e **Vite** (porta `5180`).
- **Tailwind CSS** com sistema de cores institucional e tipografia oficial.
- **Lucide React** para iconografia técnica.
- **Recharts** para gráficos dinâmicos de barras, linhas, áreas e comparativos de equipe.
- **html-to-image** para exportação e captura de gráficos para apresentações executivas.

### Banco de Dados & Armazenamento (100% Cloud)
- **Supabase (PostgreSQL Cloud 24/7)**: Fonte primária oficial conectada via `@supabase/supabase-js`.
- **Row Level Security & REST API**: Consultas de alto desempenho com suporte a paginação `Range` e ordenações dinâmicas.

### Pipeline de Scripts e Automação (Python)
- `sync_bitrix_to_supabase.py`: Extrai os negócios e contatos do Bitrix24, cruza os CPFs com a base de doadores do Supabase (`vocacao_resumo_mensal_doadores`), calcula a anterioridade e persiste as iniciativas consolidadas em `nfp_campanhas_bitrix` com lista detalhada em `cpfs_detalhes`.
- `atualizar_bgs_bitrix.py`: Script de higienização em lote de negócios via API REST do Bitrix24.
- `autorun_nfp.bat`: Rotina de inicialização automática no Windows para manter a base sincronizada.

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
- **Tabela Padrão & Matriz Mês a Mês**: Alternância dinâmica entre a visualização sintética e a Matriz Mês a Mês com o histórico detalhado de cupons de cada mês selecionado (Jan a Dez) e total do período.
- **Ordenação Dinâmica Multicoluna**: Ordenação instantânea por clique nos cabeçalhos de qualquer mês individual ou no totalizador do período.
- **Filtro Oficial por Tipo**: Segmentação ágil da base pelos status operacionais:
  `CADASTRO`, `NOVO`, `DOAÇÃO`, `DESCONTINUAR`, `DESCARTAR`, `FECHOU`, `FORA`, `ANALISAR`.
- **Exportação CSV Direta**: Download completo sem limite de linhas respeitando exatamente os filtros ativos em tela e com a abertura mês a mês.
- **Classificação de Carteira**:
  - **Novas**: Empresas cujo primeiro registro de cupons ocorreu dentro do período selecionado.
  - **Ativas**: Empresas recorrentes com histórico prévio consolidado.
  - **Zero Crédito**: Identificação de lojas com cupons emitidos mas crédito líquido zerado pela SEFAZ.
- **Filtros e Busca Rápida**: Pesquisa instantânea por nome da loja ou número de CNPJ.

### 3. Raio-X de Doadores (Pessoa Física)
Mapeamento aprofundado dos doadores individuais (CPF) com leitura direta de `vocacao_resumo_mensal_doadores`:
- **Raio-X do Doador**: Histórico completo de compras e doações por CPF.
- **Comportamento de Compra**: Estabelecimentos mais frequentados pelo doador.
- **Matriz de Recorrência & Níveis de Engajamento**: Divisão por scores (Elite Diamante, Alta Performance, Na Média, Em Desenvolvimento, Iniciante).

### 4. Doadores Fidelizados (Automáticos SEFAZ)
Gestão dos cadastros vinculados na modalidade de doação digital direta da SEFAZ:
- **Doação Automática via App NFP**: Monitoramento da base fidelizada que vinculou a Vocação como entidade beneficiária direta.
- **Consolidação Mensal via `vocacao_mapa_interno`**: Acompanhamento de doadores ativos, novos cadastros e taxa de retenção.

### 5. Ações & Campanhas (CRM Bitrix24 + Auditoria SEFAZ)
Cockpit de auditoria e prestação de contas das iniciativas de captação presenciais e digitais:
- **Origem Bitrix24**: Integração oficial com os negócios da Categoria 8 (NFP - Vigente).
- **Consolidação Inteligente**: Agrupamento pelo campo oficial de Ação/Evento (`UF_CRM_1791479985`) e responsável captador, consolidando eventos de múltiplos dias em iniciativas únicas estáveis.
- **Auditoria de Anterioridade (Mérito SEFAZ)**:
  - **Novos CPFs Conquistados**: Doadores que nunca haviam realizado doações para a Vocação antes da data do evento.
  - **CPFs Preexistentes**: Doadores que já possuíam histórico de doações anterior ao evento.
- **Ativados SEFAZ Estritamente Reais**: Contagem de CPFs da ação que efetivamente registraram compras e cupons no período posterior ao evento.
- **Crédito Realizado Estrito (Zero Estimativa)**:
  - Aplica o ciclo fiscal da SEFAZ. Ações cujo mês de liberação de crédito ainda não foi homologado pelo Estado são marcadas como **R$ 0,00 ("Em Apuração")**.
- **Modal de Auditoria de CPFs**:
  - Tabela interna completa com todos os CPFs que compõem o número da ação.
  - Busca interna instantânea por nome ou CPF.
  - Exibição de CPFs limpos por padrão para conferência e auditoria.
  - Botão **`🙈 Ocultar CPFs (Máscara)` / `👁️ Exibir CPFs Completos`** para alternar a privacidade visual durante apresentações.
- **Ranking da Equipe**: Gráfico comparativo e tabela consolidada de desempenho por colaborador com linha de total geral.

### 6. Benchmarking & Prospecção
Ferramenta estratégica de expansão territorial e prospecção de novos estabelecimentos comerciais parceiros.

### 7. Apresentação Institucional
Ambiente visual de alto impacto para projeção em telões, reuniões de diretoria e apresentações para patrocinadores com suporte a cópia de gráficos em alta resolução.

### 8. Painel do Desenvolvedor & Processos ETL
Área administrativa restrita protegida por senha com status dos serviços e documentação das tabelas em nuvem.

---

## 🎛 Recursos Globais

### Filtro Temporal Dinâmico e Reativo
- Seleção de múltiplos anos (ex: 2024, 2025, 2026) e meses específicos.
- **Reatividade Instantânea**: Atualização imediata de todas as abas e tabelas ao trocar de mês, sem necessidade de atualizar a página (F5).

### Modo TV (Painel para Telões)
- Exibição em tela cheia com carrossel automático alternando entre indicadores de Desempenho e Metas.

### Modal de Regras de Negócio e Legislação
- Transparência das fórmulas de rateio da SEFAZ-SP (teto de 10 UFESPs por nota, rateio estadual de 60%, limite de 7,5% do ICMS recolhido por estabelecimento).

### Status do Banco e Conexão Nuvem
- Indicador 24/7 da conexão com o **Supabase PostgreSQL**, latência de resposta e data do último sync.

---

## ⚖ Regras de Negócio e Cronograma Fiscal SEFAZ-SP

### 1. Ciclo de Apuração e Liberação de Créditos
O repasse dos créditos pela SEFAZ-SP segue uma defasagem fiscal de 4 meses:
$$\text{Mês da Ação } (M) \longrightarrow \text{Primeiras Notas Emitidas } (M+1) \longrightarrow \text{Liquidação do Crédito pela SEFAZ } (M+4)$$

- **Exemplo Prático (Ação em Junho/2026 - Mês 06)**:
  - Evento realizado em Junho.
  - Notas fiscais válidas com CPF começam em Julho (Mês 07).
  - Crédito liberado pela SEFAZ em **Outubro/2026 (Mês 10)**.
  - Se os créditos de Outubro/2026 ainda não foram homologados e importados na base, o crédito realizado permanece como **R$ 0,00 ("Em Apuração")**.

### 2. Estimativa Paramétrica Móvel
- **Cupons Médios por Doador/Mês**: 9,28 cupons.
- **Ticket Médio por Cupom**: R$ 5,72.
- **Valor Médio Mensal por Doador**: $\text{R\$} 53,08$ ($9{,}28 \times 5{,}72$).
- **Crédito Estimado**: $\text{Novos CPFs} \times \text{R\$} 53,08$.

---

## 🔄 Pipeline de Dados & Sincronização 100% Cloud

```
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│           CRM Bitrix24          │       │      Portal SEFAZ-SP (NFP)      │
│  (Negócios Categoria 8 - NFP)   │       │   (Planilhas e Remessas Oficiais)│
└────────────────┬────────────────┘       └────────────────┬────────────────┘
                 │                                         │
                 │                                         │
                 ▼                                         ▼
      ┌────────────────────────────────────────────────────────┐
      │         Supabase PostgreSQL Cloud (Base Oficial)       │
      │                                                        │
      │  • vocacao_resumo_mensal_doadores (Histórico SEFAZ)    │
      │  • vocacao_mapa_interno (Doadores Automáticos)         │
      │  • nfp_responsaveis_bitrix (309 Colaboradores)         │
      └──────────────────────────┬─────────────────────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 │                               │
                 ▼ (sync_bitrix_to_supabase.py)  ▼
      ┌────────────────────────────────┐         │
      │      nfp_campanhas_bitrix      │         │
      │  • Ações consolidadas          │         │
      │  • cpfs_detalhes (JSONB)       │         │
      └────────────────┬───────────────┘         │
                       │                         │
                       └────────────┬────────────┘
                                    │
                                    ▼
                 ┌─────────────────────────────────────┐
                 │       NFP Analytics (React + Vite)  │
                 │         http://localhost:5180       │
                 └─────────────────────────────────────┘
```

1. **Extração CRM**: O script extrai negócios da Categoria 8 do Bitrix24 e busca os contatos associados com seus CPFs.
2. **Cruzamento em Nuvem**: Os CPFs são cruzados diretamente contra a tabela `vocacao_resumo_mensal_doadores` no Supabase para auditar a anterioridade de cada doador.
3. **Persistência Auditável**: As campanhas consolidadas e a lista detalhada de doadores são salvas com upsert em `nfp_campanhas_bitrix`.
4. **Consumo no Frontend**: A aplicação consome os dados atualizados instantaneamente via `@supabase/supabase-js`.

---

## 🗄 Dicionário de Dados Oficial (Supabase PostgreSQL)

### Tabela: `nfp_campanhas_bitrix`
Armazena as iniciativas consolidadas de captação e resultados fiscais:
- `id` (VARCHAR, PK): Identificador determinístico da ação (`BITRIX-{hash}`).
- `nome_campanha` (VARCHAR): Nome da ação/evento (`UF_CRM_1791479985`).
- `responsavel` (VARCHAR): Nome do colaborador responsável pela iniciativa.
- `data_inicio` (DATE): Data de início do evento.
- `data_fim` (DATE): Data de término do evento.
- `total_cadastros` (INTEGER): Quantidade de cadastros registrados no Bitrix24.
- `novos_cpfs_conquistados` (INTEGER): CPFs sem histórico prévio na SEFAZ.
- `cpfs_preexistentes` (INTEGER): CPFs que já doavam antes do evento.
- `ativados_com_credito` (INTEGER): CPFs que tiveram compras comprovadas após o evento.
- `credito_estimado` (NUMERIC): Projeção calculada com base na média paramétrica.
- `credito_realizado` (NUMERIC): Valor real de créditos homologados pela SEFAZ.
- `previsao_liberacao` (VARCHAR): Status fiscal ("Liquidado" ou "Em Apuração").
- `status` (VARCHAR): Status operacional da ação.
- `cpfs_detalhes` (JSONB): Lista estruturada dos doadores `[{"nome": "...", "cpf": "...", "fone": "...", "statusMerito": "...", "ativado": bool}]`.

### Tabela: `nfp_responsaveis_bitrix`
Catálogo dimensional de 309 colaboradores e captadores vinculados ao Bitrix:
- `id_bitrix` (INTEGER, PK): ID do usuário no Bitrix24.
- `nome` (VARCHAR): Nome completo do colaborador.

### Tabela: `vocacao_resumo_mensal_doadores`
Base consolidada de doadores reais com compras registradas na SEFAZ:
- `cpf_doador` (VARCHAR): CPF formatado do doador.
- `ano` (INTEGER) / `mes` (INTEGER): Período de apuração.
- `total_cupons` (INTEGER): Total de compras com CPF vinculadas.
- `cupons_validos` (INTEGER): Cupons aprovados pela SEFAZ.
- `total_credito_apurado` (NUMERIC): Crédito fiscal creditado à entidade.

### Tabela: `vocacao_resumo_mensal_empresas`
Base consolidada de faturamento e cupons por parceiro comercial:
- `cnpj` (VARCHAR): CNPJ da empresa/loja parceira.
- `nome_empresa` (VARCHAR): Razão Social ou Nome Fantasia.
- `ano` (INTEGER) / `mes` (INTEGER): Competência da emissão das notas.
- `total_cupons` (INTEGER): Volume de cupons doados.
- `total_valor_nf` (NUMERIC): Valor total dos cupons fiscais emitidos.
- `total_credito_apurado` (NUMERIC): Créditos efetivamente liberados pelo Estado.
- `tipo` (VARCHAR): Classificação operacional (CADASTRO, NOVO, DOAÇÃO, DESCONTINUAR, DESCARTAR, FECHOU, FORA, ANALISAR).

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
- **Node.js** (v18+) e **npm**
- **Python 3.10+** (com biblioteca `requests` instalada)

### Instalação de Dependências
```bash
npm install
```

### Executar a Aplicação Web
```bash
npm run dev
```
Acesse o painel: 👉 **http://localhost:5180**

### Executar a Sincronização do Bitrix24 sob Demanda
```bash
python sync_bitrix_to_supabase.py
```
*(Ou utilize o botão de sincronização disponível na aba Dev no próprio sistema).*

### Gerar Build de Produção
```bash
npm run build
```
O script compilará o bundle otimizado em `dist/` e atualizará automaticamente o número de versão institucional do sistema.
