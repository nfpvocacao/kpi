# NFP Analytics - Vocação 📊

Plataforma integrada de inteligência de dados, auditoria fiscal e monitoramento de captação de recursos via **Nota Fiscal Paulista (SEFAZ-SP)** e **Bitrix24 CRM** para a instituição **Vocação**.

---

## 📌 Sumário
1. [Visão Geral](#-visão-geral)
2. [Arquitetura & Tecnologias](#-arquitetura--tecnologias)
3. [Autenticação & Controle de Acesso por Telas (RBAC Granular)](#-autenticação--controle-de-acesso-por-telas-rbac-granular)
4. [Navegação e Funcionalidades das Abas](#-navegação-e-funcionalidades-das-abas)
   - [1. Desempenho & Captação](#1-desempenho--captação)
   - [2. Operações por Empresas Parceiras](#2-operações-por-empresas-parceiras)
   - [3. Mapa Parceiros (Geolocalização & Booking-Style)](#3-mapa-parceiros-geolocalização--booking-style)
   - [4. Apuração de Comissões & Bonificações NFP (Política Oficial)](#4-apuração-de-comissões--bonificações-nfp-política-oficial)
   - [5. Raio-X de Doadores (Pessoa Física)](#5-raio-x-de-doadores-pessoa-física)
   - [6. Doadores Fidelizados (Automáticos SEFAZ)](#6-doadores-fidelizados-automáticos-sefaz)
   - [7. Ações & Campanhas (CRM Bitrix24 + Auditoria SEFAZ)](#7-ações--campanhas-crm-bitrix24--auditoria-sefaz)
   - [8. Benchmarking & Prospecção](#8-benchmarking--prospecção)
   - [9. Apresentação Institucional](#9-apresentação-institucional)
   - [10. Painel do Desenvolvedor & Processos ETL](#10-painel-do-desenvolvedor--processos-etl)
5. [Recursos Globais](#-recursos-globais)
   - [Filtro Temporal Dinâmico e Reativo](#filtro-temporal-dinâmico-e-reativo)
   - [Modo TV (Painel para Telões)](#modo-tv-painel-para-telões)
   - [Modal de Regras de Negócio e Legislação](#modal-de-regras-de-negócio-e-legislação)
   - [Status do Banco e Conexão Nuvem](#status-do-banco-e-conexão-nuvem)
6. [Regras de Negócio e Cronograma Fiscal SEFAZ-SP](#-regras-de-negócio-e-cronograma-fiscal-sefaz-sp)
7. [Pipeline de Dados & Sincronização 100% Cloud](#-pipeline-de-dados--sincronização-100-cloud)
8. [Dicionário de Dados Oficial (Supabase PostgreSQL)](#-dicionário-de-dados-oficial-supabase-postgresql)
9. [Como Executar o Projeto Localmente](#-como-executar-o-projeto-localmente)

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

### Pipeline de Scripts e Automação (Python & Batch)
- `obter_dados.py`: Automação Selenium com certificado digital A1 para login na SEFAZ-SP, extração dos dados atualizados de doadores plenos e restritos e gravação direta na planilha oficial no Google Drive (`G:\...`) com espelhamento automático para a pasta local `planilhas/` e raiz.
- `autorun_nfp.bat`: Executor sequencial em lote no Windows para extração SEFAZ (`obter_dados.py`), ETL de importação (`etl_import.py`) e sincronização de negócios Bitrix24 (`sync_bitrix_to_supabase.py`).
- `process_month_dump.py`: Processa dumps de Diário (`Diario_AAAA_MM.csv`) e arquivos de Créditos da Fazenda (`G:\Drives compartilhados\NFP\Fazenda\`). Possui **modo interativo** solicitando a competência (`MM/AAAA`, ex: `06/2026`), deduplica notas fiscais, separa estritamente os créditos de CADASTRO e DOAÇÃO, consolida as tabelas `vocacao_resumo_mensal_doadores`, `vocacao_doador_estabelecimento_mensal`, `vocacao_resumo_mensal_empresas` e executa o **UPSERT em `nfp_empresas` com gravação e preservação contínua da coluna `data_inicio`** (base para cálculo de lojas novas vs. recorrentes na apuração de comissões).
- `push_mapa_to_supabase.py`: Lê a planilha oficial `2025-01-01 Mapa Automatizacoes.xlsx` (do Drive com espelhamento local automático), cruza os dados apurados de `AUTCup` e `AUTCred` da aba `Consolidado` com a aba `Mapa`, recalcula o ticket médio oficial ($\text{Ticket Médio} = \text{AUTCred} / \text{AUTCup}$) e efetua o UPSERT nas tabelas `vocacao_consolidado_interno` e `vocacao_mapa_interno` no Supabase.
- `sync_bitrix_to_supabase.py`: Extrai os negócios e contatos do Bitrix24, cruza os CPFs com a base de doadores do Supabase (`vocacao_resumo_mensal_doadores`), calcula a anterioridade e persiste as iniciativas consolidadas em `nfp_campanhas_bitrix` com lista detalhada em `cpfs_detalhes`.
- `atualizar_bgs_bitrix.py`: Script de higienização em lote de negócios via API REST do Bitrix24.

---

## 🔐 Autenticação & Controle de Acesso por Telas (RBAC Granular)

A plataforma conta com um sistema corporativo completo de autenticação e governança de acessos:
- **Tela de Login Institucional (`LoginScreen`)**:
  - Acesso bloqueado para usuários não autenticados.
  - Credenciais auditadas diretamente no Supabase com hashing criptográfico seguro via extensão `pgcrypto` (`crypt` / `bcrypt` com salt).
  - Sessão persistida de forma segura no navegador (`localStorage`) via `AuthContext`.
- **Controle Granular de Telas por Usuário**:
  - Cada colaborador possui uma lista customizada de abas liberadas (`abas_permitidas: TEXT[]`).
  - O menu superior de navegação renderiza dinamicamente apenas as abas para as quais o usuário tem autorização expressa.
  - Tentativas de acesso a rotas restritas são interceptadas com fallback imediato para a primeira aba permitida.
  - Usuários marcados como **Administradores (`is_admin = true`)** possuem acesso universal a todas as 10 abas e ao modal de gestão de usuários.
- **Painel Administrativo de Usuários & Telas (`UsuariosModal`)**:
  - Apenas administradores podem abrir o painel pelo cabeçalho.
  - Permite cadastrar novos colaboradores, editar nomes/e-mails, redefinir senhas, vincular o `id_vendedor` oficial e marcar/desmarcar individualmente o acesso a qualquer uma das 10 abas da aplicação.
- **Autoatendimento de Troca de Senha (`AlterarSenhaModal`)**:
  - Qualquer usuário logado pode alterar sua própria senha diretamente pelo botão **`🔑 Senha`** no cabeçalho.
  - Validação da senha atual antes de autorizar a nova senha, executada em nível de banco através da RPC segura `nfp_alterar_minha_senha`.
- **Isolamento de Carteira para Vendedores**:
  - Ao logar com perfil vinculado a um captador comercial (`id_vendedor`), a aba de Comissões pré-seleciona e bloqueia a visualização para a carteira exclusiva daquele captador, resguardando a privacidade das demais carteiras.

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
- **Tabela Padrão & Matriz Mês a Mês**: Alternância dinâmica entre a visualização sintética e a Matriz Mês a Mês com o histórico detalhado de cupons de cada mês selecionado (com suporte a todos os 12 meses de Jan a Dez) e total do período.
- **Ordenação Dinâmica Multicoluna**: Ordenação instantânea por clique nos cabeçalhos de qualquer mês individual ou no totalizador do período.
- **Tabela de Suporte no Modal da Empresa**: Desmembramento completo mês a mês por empresa (Cupons, Crédito Cadastro, Crédito Doação, Outros/Consumo e Crédito Total Apurado), ordenado cronologicamente de forma decrescente (mais recente primeiro).
- **Filtro Oficial por Tipo**: Segmentação ágil da base pelos status operacionais:
  `CADASTRO`, `NOVO`, `DOAÇÃO`, `DESCONTINUAR`, `DESCARTAR`, `FECHOU`, `FORA`, `ANALISAR`.
- **Exportação CSV Direta**: Download completo sem limite de linhas respeitando exatamente os filtros ativos em tela e com a abertura mês a mês.
- **Classificação de Carteira**:
  - **Novas**: Empresas cujo primeiro registro de cupons ocorreu dentro do período selecionado.
  - **Ativas**: Empresas recorrentes com histórico prévio consolidado.
  - **Zero Crédito**: Identificação de lojas com cupons emitidos mas crédito líquido zerado pela SEFAZ.
- **Filtros e Busca Rápida**: Pesquisa instantânea por nome da loja ou número de CNPJ com reatividade instantânea na troca de períodos.

### 3. Mapa Parceiros (Geolocalização & Booking-Style)
Interface executiva de inteligência territorial e auditoria geográfica inspirada no padrão de usabilidade do **Booking.com**:
- **Geocodificação Rigorosa e Auditada**:
  - Enriquecimento contínuo de CNPJs via API oficial de CEPs brasileiros (`BrasilAPI /cep/v2/`), garantindo precisão métrica de logradouro e bairro sem pinos fictícios ou distorções no interior do estado.
  - Validação estrita por Bounding Box municipal da Grande São Paulo e conferência de prefixo postal.
- **Split-View Interativo (Mapa + Lista Lateral Dinâmica)**:
  - Painel lateral sincronizado em tempo real com a área visível do mapa (`mapBounds`). Ao arrastar o mapa ou aplicar zoom, a lista filtra automaticamente apenas os estabelecimentos contidos no enquadramento.
  - Seleção bidirecional: clicar em um card da lista executa zoom suave (`flyTo`) e abre automaticamente o popup informativo com o Raio-X completo das frentes de captação.
- **Detalhamento dos Cards**:
  - Exibição de Categoria, Razão Social / Nome Fantasia, CNPJ, Endereço com CEP e Vendedor responsável.
  - Grade com 3 métricas essenciais por parceiro: **Urnas (R$)**, **Doações Automáticas (R$)** e **Ticket Médio por Cupom (R$)**.
- **Menu de Ordenação da Lista Lateral**:
  - Alternância imediata da ordem de exibição entre: **Maior Crédito**, **Maior Ticket Médio por Cupom**, **Mais Cupons** e **Nome (A-Z)**.
- **Radar de Oportunidades Comercial**:
  - Botão de inteligência executiva (`🎯 Radar Oportunidades`) que isola estabelecimentos com alto volume de captação em urnas físicas ($\ge \text{R\$\ 150}$) e baixa/nula adesão em doações automáticas pelo aplicativo ($\le \text{R\$\ 20}$). Permite à equipe comercial identificar parceiros estratégicos para campanhas de ativação de caixa.
- **Filtro de Vendedor e Lojas Sem Vendedor**:
  - Segmentação por captador individual e opção rápida **"⚠️ Apenas Sem Vendedor (Oportunidades)"** para prospecção de parceiros órfãos.
- **Modo Tela Cheia (100% da Tela)**:
  - Botão de expansão para visão panorâmica total (`Maximize2` / `Minimize2`) com suporte a atalho de teclado `ESC` e recálculo automático de tamanho do mapa (`invalidateSize`).
- **Exportação Excel/CSV com UTF-8 BOM**:
  - Botão direto para exportar planilhas contendo apenas os parceiros visíveis na tela, com CNPJ, endereço completo, valores por frente e vendedor.

### 4. Apuração de Comissões & Bonificações NFP (Política Oficial)
Módulo executivo de remuneração variável e auditoria contábil embasado na **nova regra de comissão da Política NFP Vocação**:
- **Frente Cadastro (Comissão da Equipe Comercial)**:
  - **Lojas Novas (Abertura - 1,0%)**: Classificação com alíquota de **1,0%** sobre o crédito de Cadastro e Doação Direta aplicada quando o vendedor atual da loja é o vendedor de abertura original (`id_vendedor == id_vendedor_abertura`).
  - **Lojas Recorrentes (Manutenção - 0,5%)**: Alíquota de **0,5%** aplicada a todos os demais estabelecimentos ativos da carteira (manutenção contínua de lojas abertas por outros captadores ou pelo histórico institucional).
  - **Identificação Oficial de Abertura (`id_vendedor_abertura`)**: Registro definitivo na tabela `nfp_empresas` mapeado para mais de 1.300 estabelecimentos parceiros com base no histórico contratual de captação.
  - **Apuração Cronológica Precisa**: Ao visualizar períodos acumulados ou o ano fechado, o sistema calcula a comissão mês a mês, assegurando a exatidão das alíquotas conforme os créditos homologados pela SEFAZ.
- **Privacidade e Governança**:
  - A interface de comissões é estritamente focada nos resultados e premiações da equipe de captação comercial. Indicadores de coordenação e métricas gerenciais restritas são resguardados, garantindo transparência operacional e conformidade interna.
- **Três Visualizações Executivas**:
  - **📊 Resumo por Vendedor**: Tabela sintética com total de lojas, novas, recorrentes, créditos e comissões calculadas por captador, linha de conciliação de doações espontâneas/sem vendedor e rodapé institucional.
  - **📅 Evolução Mensal (Grade)**: Matriz mês a mês (Jan a Dez + Total) da comissão de cada captador da equipe comercial.
  - **🏢 Analítico por CNPJ**: Tabela auditável com todas as lojas, botões de filtro rápido (**`⭐ Novas do Mês`**, `Recorrentes`, `Todas`), indicação da data de início, vendedor responsável, vendedor de abertura e exportação CSV.

### 5. Raio-X de Doadores (Pessoa Física)
Mapeamento aprofundado dos doadores individuais (CPF) com leitura direta de `vocacao_resumo_mensal_doadores`:
- **Raio-X do Doador**: Histórico completo de compras e doações por CPF.
- **Comportamento de Compra**: Estabelecimentos mais frequentados pelo doador.
- **Matriz de Recorrência & Níveis de Engajamento**: Divisão por scores (Elite Diamante, Alta Performance, Na Média, Em Desenvolvimento, Iniciante).

### 6. Doadores Fidelizados (Automáticos SEFAZ)
Gestão dos cadastros vinculados na modalidade de doação digital direta da SEFAZ:
- **Doação Automática via App NFP**: Monitoramento da base fidelizada que vinculou a Vocação como entidade beneficiária direta.
- **Consolidação Mensal via `vocacao_mapa_interno`**: Acompanhamento de doadores ativos (plenos e restritos), novos cadastros e taxa de retenção.
- **Tabela Analítica Reativa (>= 2025)**: Exibição detalhada de competências a partir de 2025 ordenada cronologicamente de forma decrescente (mais recente primeiro).
- **Curva Real de Ticket Médio**: Gráficos contínuos com recálculo preciso baseado em $\text{AUTCred} / \text{AUTCup}$ eliminando descontinuidades ou zeramentos indevidos.

### 7. Ações & Campanhas (CRM Bitrix24 + Auditoria SEFAZ)
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

### 8. Benchmarking & Prospecção
Ferramenta estratégica de expansão territorial e prospecção de novos estabelecimentos comerciais parceiros.

### 9. Apresentação Institucional
Ambiente visual de alto impacto para projeção em telões, reuniões de diretoria e apresentações para patrocinadores com suporte a cópia de gráficos em alta resolução.

### 10. Painel do Desenvolvedor & Processos ETL
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

### Tabela: `vocacao_mapa_interno`
Indicadores analíticos mensais de doadores recorrentes da Nota Fiscal Paulista:
- `mes` (DATE, PK): Data de competência (ex: `2025-01-01`).
- `doadores_plenos` (INTEGER): Quantidade de doadores automáticos ativos sem restrições.
- `doadores_restritos` (INTEGER): Doadores com travas ou restrições no app da SEFAZ.
- `total_doadores` (INTEGER): Soma de doadores plenos e restritos.
- `qtde_cupons` (INTEGER): Quantidade total de cupons capturados no mês.
- `val_nf` (NUMERIC): Valor total de notas fiscais associadas.
- `aut_empr` (INTEGER): Total de empresas parceiras reconhecidas.
- `aut_cup` (INTEGER): Total de cupons gerados via doação automática.
- `aut_cred` (NUMERIC): Créditos efetivamente liberados na modalidade automática.
- `ticket_medio` (NUMERIC): Retorno financeiro médio por cupom automático ($\text{AUTCred} / \text{AUTCup}$).

### Tabela: `vocacao_consolidado_interno`
Consolidação macro por canal de captação (Cadastro, Doação Direta, Automática e Consumo):
- `ano_mes` (INTEGER, PK): Ano e mês concatenados (ex: `202501`).
- `total_empresas` (INTEGER): Quantidade de estabelecimentos comerciais ativos.
- `tt_cupons` (INTEGER): Soma geral de cupons processados.
- `tt_val_nf` (NUMERIC): Faturamento total das notas fiscais.
- `tt_creditos` (NUMERIC): Receita líquida total liberada no período.
- `aut_empr` / `aut_cup` / `aut_cred`: Métricas desmembradas exclusivas de doações automáticas.
- `cad_empr` / `cad_cup` / `cad_cred`: Métricas de cupons lançados via cadastro de voluntários.
### Tabela: `nfp_usuarios`
Tabela corporativa de autenticação, perfis e permissões granulares de tela:
- `id` (UUID, PK): Identificador único do usuário gerado via `gen_random_uuid()`.
- `email` (TEXT, UNIQUE): E-mail de acesso institucional.
- `nome` (TEXT): Nome completo do colaborador.
- `senha_hash` (TEXT): Hash seguro da senha criptografado com `pgcrypto` (`crypt` / `bcrypt`).
- `id_vendedor` (INTEGER, NULL): ID numérico do captador comercial correspondente (ex: 9 para Priscila, 3 para Márcia).
- `abas_permitidas` (TEXT[]): Array com as slugs das abas acessíveis pelo usuário (ex: `{'desempenho','empresas','campanhas'}`).
- `is_admin` (BOOLEAN): Flag que concede acesso irrestrito a todas as 9 abas e liberação do painel de gestão de usuários.
- `ativo` (BOOLEAN): Status do usuário no sistema.
- `created_at` (TIMESTAMPTZ): Registro cronológico de criação.

### Tabela: `nfp_empresas`
Cadastro cadastral de estabelecimentos parceiros com vínculo histórico de captação:
- `cnpj` (VARCHAR, PK): CNPJ oficial do estabelecimento comercial parceiro.
- `nome` (VARCHAR): Razão social ou nome fantasia da loja.
- `tipo` (VARCHAR): Classificação de status operacional (`CADASTRO`, `NOVO`, `DOAÇÃO`, etc.).
- `data_inicio` (VARCHAR): Competência de largada (`AAAA-MM`).
- `id_vendedor` (INTEGER): ID do vendedor atual gestor da carteira.
- `id_vendedor_abertura` (INTEGER): ID do vendedor de abertura original (chave de apuração para comissão de Novas a 1,0%).

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
