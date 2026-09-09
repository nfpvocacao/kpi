import streamlit as st
import sqlite3
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime

# Configuração da página
st.set_page_config(
    page_title="NFP Analytics | Vocação",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Conexão com o banco de dados
DB_PATH = "nfp_database.db"

def get_db_connection():
    return sqlite3.connect(DB_PATH)

# Injeção de estilo CSS para visualização Premium
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
    
    /* Configuração geral de fonte */
    html, body, [class*="css"], .stMarkdown {
        font-family: 'Outfit', sans-serif;
    }
    
    /* Customização do container principal */
    .reportview-container {
        background: #0e1117;
    }
    
    /* Título principal e cabeçalho */
    .main-title {
        font-size: 2.5rem;
        font-weight: 700;
        background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 5px;
    }
    .sub-title {
        color: #8892b0;
        font-size: 1.1rem;
        margin-bottom: 25px;
        font-weight: 400;
    }
    
    /* Cards de KPI com efeito Glassmorphism */
    .kpi-card {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
        margin-bottom: 15px;
        transition: transform 0.2s ease-in-out;
    }
    .kpi-card:hover {
        transform: translateY(-3px);
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(0, 242, 254, 0.3);
    }
    .kpi-label {
        font-size: 0.85rem;
        color: #8892b0;
        text-transform: uppercase;
        font-weight: 600;
        letter-spacing: 0.8px;
    }
    .kpi-val {
        font-size: 1.8rem;
        color: #ffffff;
        font-weight: 700;
        margin-top: 5px;
        margin-bottom: 0px;
    }
    .kpi-sub {
        font-size: 0.8rem;
        color: #00e676;
        margin-top: 4px;
        font-weight: 500;
    }
    .kpi-sub-red {
        font-size: 0.8rem;
        color: #ff1744;
        margin-top: 4px;
        font-weight: 500;
    }
</style>
""", unsafe_allow_html=True)

# Função auxiliar para formatar CNPJ
def format_cnpj(cnpj):
    if not cnpj or len(cnpj) != 14:
        return cnpj
    return f"{cnpj[:2]}.{cnpj[2:5]}.{cnpj[5:8]}/{cnpj[8:12]}-{cnpj[12:]}"

# Carregar dados
@st.cache_data(ttl=600)
def load_vocacao_consolidado():
    conn = get_db_connection()
    df = pd.read_sql_query("SELECT * FROM vocacao_consolidado_interno ORDER BY ano_mes ASC", conn)
    conn.close()
    
    # Criar coluna formatada de data/mês
    df['ano'] = df['ano_mes'] // 100
    df['mes'] = df['ano_mes'] % 100
    
    # Filtrar apenas anos e meses válidos para evitar crashes com registros inconsistentes
    df = df[(df['ano'] >= 2000) & (df['ano'] <= 2100) & (df['mes'] >= 1) & (df['mes'] <= 12)].copy()
    
    df['data'] = pd.to_datetime(df.apply(lambda r: f"{int(r['ano'])}-{int(r['mes']):02d}-01", axis=1))
    return df

@st.cache_data(ttl=600)
def load_vocacao_mapa():
    conn = get_db_connection()
    df = pd.read_sql_query("SELECT * FROM vocacao_mapa_interno ORDER BY mes ASC", conn)
    conn.close()
    df['data'] = pd.to_datetime(df['mes'])
    return df

@st.cache_data(ttl=600)
def get_benchmarking_data(target_date="2023-01-01"):
    conn = get_db_connection()
    
    # Obter ranking geral de Assistência Social no estado
    df_state = pd.read_sql_query(f"""
        SELECT 
            cnpj, 
            razao_social, 
            municipio, 
            area_atuacao,
            qtd_docs,
            cred_distribuidos,
            cred_doados,
            premios_sorteio,
            total
        FROM historico_distribuicao
        JOIN entidades USING(cnpj)
        WHERE mes_referencia = '{target_date}' AND area_atuacao = 'Assistência Social'
        ORDER BY total DESC
    """, conn)
    
    conn.close()
    return df_state

# Carregamento inicial de dados
df_cons = load_vocacao_consolidado()
df_mapa = load_vocacao_mapa()

# Cabeçalho Principal
st.markdown("<div class='main-title'>Nota Fiscal Paulista - Analytics</div>", unsafe_allow_html=True)
st.markdown("<div class='sub-title'>Painel Estratégico de Indicadores, Captação e Prospecção da Vocação</div>", unsafe_allow_html=True)

# Barra Lateral (Sidebar) de Filtros
st.sidebar.markdown("### Filtros de Análise")

anos_disponiveis = sorted(df_cons['ano'].unique().tolist())
# Seleção de múltiplos anos (combo/multiselect)
anos_selecionados = st.sidebar.multiselect(
    "Selecione o(s) Ano(s) de Emissão:", 
    anos_disponiveis, 
    default=[anos_disponiveis[-2]] if len(anos_disponiveis) >= 2 else anos_disponiveis
)

# Seleção de múltiplos meses (combo/multiselect)
meses_nomes = {
    1: "Janeiro", 2: "Fevereiro", 3: "Março", 4: "Abril", 5: "Maio", 6: "Junho",
    7: "Julho", 8: "Agosto", 9: "Setembro", 10: "Outubro", 11: "Novembro", 12: "Dezembro"
}
meses_disponiveis = list(meses_nomes.keys())
meses_selecionados = st.sidebar.multiselect(
    "Selecione o(s) Mês(es) de Emissão:",
    meses_disponiveis,
    default=meses_disponiveis,
    format_func=lambda x: meses_nomes[x]
)

# Sincronização de Dados (Envio de Sinal ao Agente Local Autorizado)
st.sidebar.markdown("---")
st.sidebar.markdown("### 🔄 Sincronização de Dados")

import os
import sys
import json
import subprocess
from datetime import datetime

trigger_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sync_trigger.json")
current_trigger_status = "idle"
if os.path.exists(trigger_file):
    try:
        with open(trigger_file, "r", encoding="utf-8") as tf:
            trigger_data = json.load(tf)
            current_trigger_status = trigger_data.get("status", "idle")
    except Exception:
        pass

if current_trigger_status == "pending":
    st.sidebar.warning("⏳ **Sincronização em andamento**: O Agente Local no seu computador está processando os dados...")

with st.sidebar.popover("🔄 Sincronizar Banco de Dados", use_container_width=True):
    st.markdown("#### 🔐 Confirmação do Servidor Raiz")
    st.caption("Digite a senha e a chave do dispositivo autorizado para enviar o sinal ao seu computador:")
    
    with st.form("sync_authorization_web_form"):
        pwd_input = st.text_input("Senha de Acesso", type="password", help="Digite a senha nfp2026")
        device_key_input = st.text_input("Chave do Dispositivo Autorizado", type="password", help="Digite a chave da sua máquina (ex: raiz)")
        btn_submit_sync = st.form_submit_button("🚀 Confirmar e Enviar Sinal ao PC", use_container_width=True)
        
        if btn_submit_sync:
            if pwd_input != "nfp2026":
                st.error("❌ Senha incorreta! Acesso negado.")
            elif device_key_input.strip().lower() not in ["raiz-vocacao", "raiz", "murilo"]:
                st.error("🔒 **Dispositivo Não Autorizado**: A chave informada não pertence ao Servidor Raiz autorizado.")
            else:
                with st.spinner("Enviando sinal de sincronização para o seu computador..."):
                    try:
                        # 1. Se estiver rodando localmente no PC autorizado, roda o ETL direto
                        is_local_pc = os.path.exists(os.path.join(os.path.dirname(os.path.abspath(__file__)), "planilhas"))
                        if is_local_pc:
                            sys.path.append(os.path.dirname(os.path.abspath(__file__)))
                            from etl_import import main as run_etl_main
                            run_etl_main()
                            st.cache_data.clear()
                            st.success("🎉 **Sucesso!** Planilhas e banco sincronizados localmente!")
                            st.toast("Relatórios recarregados!", icon="🚀")
                            st.rerun()
                        else:
                            # 2. Se estiver na WEB, atualiza o trigger file para o Agente Local ler
                            trigger_data = {
                                "status": "pending",
                                "timestamp": datetime.now().isoformat(),
                                "requested_by": "murilo_web"
                            }
                            with open(trigger_file, "w", encoding="utf-8") as tf:
                                json.dump(trigger_data, tf, indent=2)
                            
                            st.success("📡 **Sinal enviado com sucesso!** O Agente Local no seu PC iniciará a sincronização em instantes.")
                            st.info("O seu computador reimportará as planilhas e atualizará o site automaticamente!")
                            st.toast("Sinal enviado ao PC!", icon="📡")
                    except Exception as e:
                        st.error(f"Erro ao enviar sinal: {e}")

# Garantir fallback se o usuário desmarcar tudo
if not anos_selecionados:
    anos_selecionados = [anos_disponiveis[-2]] if len(anos_disponiveis) >= 2 else anos_disponiveis
if not meses_selecionados:
    meses_selecionados = meses_disponiveis

# Filtrar dados do consolidado para o período selecionado
df_cons_ano = df_cons[df_cons['ano'].isin(anos_selecionados) & df_cons['mes'].isin(meses_selecionados)]

# Calcular o mesmo período nos anos anteriores correspondentes para crescimento YoY
anos_anteriores = [y - 1 for y in anos_selecionados]
df_cons_anterior = df_cons[df_cons['ano'].isin(anos_anteriores) & df_cons['mes'].isin(meses_selecionados)]

# Layout de abas principais
tab_geral, tab_doadores, tab_market = st.tabs([
    "📈 Desempenho & Faturamento", 
    "👥 Doadores Automáticos", 
    "🎯 Benchmarking & Prospecção"
])

# ==========================================
# ABA 1: DESEMPENHO & FATURAMENTO
# ==========================================
with tab_geral:
    st.markdown("### Faturamento Histórico e Detalhamento de Créditos")
    
    # Cálculos dos KPIs do Ano Selecionado
    if len(df_cons_ano) > 0:
        tt_cred_ano = df_cons_ano['tt_creditos'].sum()
        tt_cup_ano = df_cons_ano['tt_cupons'].sum()
        ticket_med_ano = tt_cred_ano / tt_cup_ano if tt_cup_ano > 0 else 0.0
        
        # Calcular crescimento em relação ao ano anterior
        if len(df_cons_anterior) > 0:
            tt_cred_ant = df_cons_anterior['tt_creditos'].sum()
            crescimento_cred = ((tt_cred_ano - tt_cred_ant) / tt_cred_ant) * 100
        else:
            crescimento_cred = 0.0
    else:
        tt_cred_ano, tt_cup_ano, ticket_med_ano, crescimento_cred = 0.0, 0, 0.0, 0.0
        
    # Definir texto de exibição do período selecionado
    if len(anos_selecionados) == 1:
        lbl_periodo = str(anos_selecionados[0])
    elif len(anos_selecionados) <= 3:
        lbl_periodo = ", ".join(map(str, sorted(anos_selecionados)))
    else:
        lbl_periodo = "Múltiplos Anos"
        
    if len(meses_selecionados) < 12:
        lbl_periodo += " (" + ", ".join([meses_nomes[m][:3] for m in sorted(meses_selecionados)]) + ")"

    # Exibição dos KPIs em Colunas Customizadas
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.markdown(f"""
        <div class="kpi-card">
            <div class="kpi-label">Créditos Totais ({lbl_periodo})</div>
            <div class="kpi-val">R$ {tt_cred_ano:,.2f}</div>
            <div class="{ 'kpi-sub' if crescimento_cred >= 0 else 'kpi-sub-red' }">
                {'+' if crescimento_cred >= 0 else ''}{crescimento_cred:.1f}% vs ano anterior
            </div>
        </div>
        """, unsafe_allow_html=True)
        
    with col2:
        st.markdown(f"""
        <div class="kpi-card">
            <div class="kpi-label">Cupons Processados</div>
            <div class="kpi-val">{tt_cup_ano:,}</div>
            <div class="kpi-sub">Total de notas capturadas</div>
        </div>
        """, unsafe_allow_html=True)
        
    with col3:
        st.markdown(f"""
        <div class="kpi-card">
            <div class="kpi-label">Valor Médio por Nota (Retorno)</div>
            <div class="kpi-val">R$ {ticket_med_ano:.2f}</div>
            <div class="kpi-sub">Retorno médio por cupom fiscal</div>
        </div>
        """, unsafe_allow_html=True)
        
    with col4:
        # Calcular participação das Doações Automáticas
        if len(df_cons_ano) > 0:
            aut_cred_ano = df_cons_ano['aut_cred'].sum()
            part_aut = (aut_cred_ano / tt_cred_ano) * 100 if tt_cred_ano > 0 else 0.0
        else:
            part_aut = 0.0
        st.markdown(f"""
        <div class="kpi-card">
            <div class="kpi-label">Participação Doação Automática</div>
            <div class="kpi-val">{part_aut:.1f}%</div>
            <div class="kpi-sub">Fonte de receita mais recorrente</div>
        </div>
        """, unsafe_allow_html=True)

    # Gráfico 1: Evolução Mensal dos Créditos por Categoria
    st.markdown("#### Evolução Mensal de Créditos por Categoria (R$)")
    
    # Preparar DF para área empilhada (respeitando o filtro de período)
    df_area_cred = df_cons_ano.copy()
    
    # Criar coluna formatada em português para o eixo X
    meses_abrev = {
        1: "Jan", 2: "Fev", 3: "Mar", 4: "Abr", 5: "Mai", 6: "Jun",
        7: "Jul", 8: "Ago", 9: "Set", 10: "Out", 11: "Nov", 12: "Dez"
    }
    df_area_cred['Período'] = df_area_cred.apply(
        lambda r: f"{meses_abrev[int(r['mes'])]}/{str(int(r['ano']))[2:]}", 
        axis=1
    )
    
    df_melt_cred = df_area_cred.melt(
        id_vars=['data', 'Período'], 
        value_vars=['cad_cred', 'doa_cred', 'aut_cred', 'cons_cred'],
        var_name='Categoria', 
        value_name='Crédito'
    )
    # Traduzir categorias para nomes amigáveis
    cat_names = {
        'cad_cred': 'Urnas / Digitação (CAD)',
        'doa_cred': 'Doações Comuns (App/Site)',
        'aut_cred': 'Doações Automáticas (AUT)',
        'cons_cred': 'Consumo Próprio'
    }
    df_melt_cred['Categoria'] = df_melt_cred['Categoria'].map(cat_names)
    
    fig_area_cred = px.area(
        df_melt_cred, 
        x='Período', 
        y='Crédito', 
        color='Categoria',
        color_discrete_map={
            'Urnas / Digitação (CAD)': '#4facfe',
            'Doações Comuns (App/Site)': '#00f2fe',
            'Doações Automáticas (AUT)': '#b92b27',
            'Consumo Próprio': '#8892b0'
        },
        labels={'Período': 'Período de Emissão', 'Crédito': 'Créditos Recebidos (R$)'},
        template='plotly_dark'
    )
    fig_area_cred.update_layout(
        margin=dict(l=10, r=10, t=10, b=10),
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
        font_family="Outfit"
    )
    st.plotly_chart(fig_area_cred, use_container_width=True)
 
    # Gráfico 2: Evolução de Cupons vs Retorno Financeiro
    col_chart1, col_chart2 = st.columns(2)
    
    with col_chart1:
        st.markdown("#### Volume de Cupons Capturados por Categoria")
        df_melt_cup = df_area_cred.melt(
            id_vars=['data', 'Período'], 
            value_vars=['cad_cup', 'doa_cup', 'aut_cup', 'cons_cup'],
            var_name='Categoria', 
            value_name='Notas'
        )
        cat_cup_names = {
            'cad_cup': 'Urnas / Digitação (CAD)',
            'doa_cup': 'Doações Comuns (App/Site)',
            'aut_cup': 'Doações Automáticas (AUT)',
            'cons_cup': 'Consumo Próprio'
        }
        df_melt_cup['Categoria'] = df_melt_cup['Categoria'].map(cat_cup_names)
        
        fig_area_cup = px.area(
            df_melt_cup, 
            x='Período', 
            y='Notas', 
            color='Categoria',
            color_discrete_map={
                'Urnas / Digitação (CAD)': '#4facfe',
                'Doações Comuns (App/Site)': '#00f2fe',
                'Doações Automáticas (AUT)': '#b92b27',
                'Consumo Próprio': '#8892b0'
            },
            labels={'Período': 'Período de Emissão', 'Notas': 'Cupons Processados'},
            template='plotly_dark'
        )
        fig_area_cup.update_layout(margin=dict(l=10, r=10, t=10, b=10), legend=dict(visible=False), font_family="Outfit")
        st.plotly_chart(fig_area_cup, use_container_width=True)
        
    with col_chart2:
        st.markdown("#### Composição dos Créditos (Ano Selecionado)")
        # Gráfico Donut para o ano selecionado
        df_pie = df_cons_ano[['cad_cred', 'doa_cred', 'aut_cred', 'cons_cred']].sum().reset_index()
        df_pie.columns = ['Categoria', 'Valor']
        df_pie['Categoria'] = df_pie['Categoria'].map(cat_names)
        
        fig_pie = px.pie(
            df_pie, 
            values='Valor', 
            names='Categoria', 
            hole=0.4,
            color_discrete_sequence=['#4facfe', '#00f2fe', '#b92b27', '#8892b0'],
            template='plotly_dark'
        )
        fig_pie.update_layout(margin=dict(l=10, r=10, t=10, b=10), font_family="Outfit")
        st.plotly_chart(fig_pie, use_container_width=True)

# ==========================================
# ABA 2: DOADORES AUTOMÁTICOS
# ==========================================
with tab_doadores:
    st.markdown("### Análise da Base de Doadores Automáticos (Fidelidade)")
    st.markdown("A doação automática representa a fonte mais previsível e de maior potencial de faturamento do programa.")

    # Filtrar dados de doadores pelo período selecionado na barra lateral
    df_mapa_temp = df_mapa.copy()
    df_mapa_temp['ano'] = df_mapa_temp['data'].dt.year
    df_mapa_temp['mes_num'] = df_mapa_temp['data'].dt.month
    df_mapa_filtrado = df_mapa_temp[df_mapa_temp['ano'].isin(anos_selecionados) & df_mapa_temp['mes_num'].isin(meses_selecionados)]
    
    df_mapa_valid = df_mapa_filtrado[df_mapa_filtrado['doadores_plenos'] > 0]
    
    if len(df_mapa_valid) > 0:
        latest_row = df_mapa_valid.iloc[-1]
        latest_date = latest_row['data'].strftime('%B/%Y')
        
        plenos = latest_row['doadores_plenos']
        restritos = latest_row['doadores_restritos']
        total_doad = latest_row['total_doadores']
        ratio_plenos = latest_row['percent_plenos'] * 100
        aut_cred_mes = latest_row['aut_cred']
        ticket_aut = latest_row['medio']
        
        # KPIs do Doadores
        dcol1, dcol2, dcol3, dcol4 = st.columns(4)
        
        with dcol1:
            st.markdown(f"""
            <div class="kpi-card">
                <div class="kpi-label">Doadores Automáticos (Total)</div>
                <div class="kpi-val">{int(total_doad):,}</div>
                <div class="kpi-sub">Referência: {latest_date}</div>
            </div>
            """, unsafe_allow_html=True)
            
        with dcol2:
            st.markdown(f"""
            <div class="kpi-card">
                <div class="kpi-label">Doadores Plenos (Ativos)</div>
                <div class="kpi-val">{int(plenos):,}</div>
                <div class="kpi-sub">{ratio_plenos:.1f}% da base de doadores</div>
            </div>
            """, unsafe_allow_html=True)
            
        with dcol3:
            st.markdown(f"""
            <div class="kpi-card">
                <div class="kpi-label">Ticket Médio por Cupom AUT</div>
                <div class="kpi-val">R$ {ticket_aut:.2f}</div>
                <div class="kpi-sub">Média dos cupons automatizados</div>
            </div>
            """, unsafe_allow_html=True)
            
        with dcol4:
            st.markdown(f"""
            <div class="kpi-card">
                <div class="kpi-label">Faturamento Mensal (AUT)</div>
                <div class="kpi-val">R$ {aut_cred_mes:,.2f}</div>
                <div class="kpi-sub">Créditos de doação automática</div>
            </div>
            """, unsafe_allow_html=True)

        # Gráfico: Evolução da Base de Doadores Plenos vs Restritos
        st.markdown("#### Crescimento Histórico da Base de Doadores")
        
        fig_doadores = go.Figure()
        fig_doadores.add_trace(go.Scatter(
            x=df_mapa_valid['data'], y=df_mapa_valid['doadores_plenos'],
            mode='lines+markers', name='Doadores Plenos (Geram Créditos)',
            line=dict(color='#00f2fe', width=3),
            marker=dict(size=6)
        ))
        fig_doadores.add_trace(go.Scatter(
            x=df_mapa_valid['data'], y=df_mapa_valid['doadores_restritos'],
            mode='lines', name='Doadores Restritos',
            line=dict(color='#ff1744', width=2, dash='dot')
        ))
        fig_doadores.add_trace(go.Bar(
            x=df_mapa_valid['data'], y=df_mapa_valid['total_doadores'],
            name='Total de Doadores',
            marker_color='rgba(255, 255, 255, 0.05)',
            yaxis='y'
        ))
        
        fig_doadores.update_layout(
            template='plotly_dark',
            margin=dict(l=10, r=10, t=10, b=10),
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
            font_family="Outfit"
        )
        st.plotly_chart(fig_doadores, use_container_width=True)

        # Gráfico Comparativo: Retorno Médio por Cupom (Ticket Médio AUT vs Outros)
        st.markdown("#### Retorno Financeiro Médio (Ticket Médio) de Doações Automáticas vs Geral")
        
        fig_ticket = go.Figure()
        fig_ticket.add_trace(go.Scatter(
            x=df_mapa_valid['data'], y=df_mapa_valid['medio'],
            mode='lines+markers', name='Ticket Médio Doação Automática (AUT)',
            line=dict(color='#00e676', width=3)
        ))
        fig_ticket.add_trace(go.Scatter(
            x=df_mapa_valid['data'], y=df_mapa_valid['medio_1'],
            mode='lines', name='Ticket Médio Geral (Outros)',
            line=dict(color='#8892b0', width=2, dash='dash')
        ))
        fig_ticket.update_layout(
            template='plotly_dark',
            margin=dict(l=10, r=10, t=10, b=10),
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
            font_family="Outfit"
        )
        st.plotly_chart(fig_ticket, use_container_width=True)
    else:
        st.warning("Não há dados históricos de doadores automáticos disponíveis nas datas filtradas.")

# ==========================================
# ABA 3: BENCHMARKING & PROSPECÇÃO
# ==========================================
with tab_market:
    st.markdown("### Análise de Mercado (Benchmarking) & Prospecção de Metas")
    st.markdown("Vamos analisar como a Vocação se posiciona em relação a outras entidades do estado de São Paulo na mesma área de atuação (Assistência Social).")

    # Carregar as datas disponíveis no histórico de distribuição (rateio de 2009 a 2023)
    conn = get_db_connection()
    datas_dist_db = pd.read_sql_query("SELECT DISTINCT mes_referencia FROM historico_distribuicao ORDER BY mes_referencia DESC", conn)
    conn.close()
    
    if len(datas_dist_db) > 0:
        list_datas_dist = datas_dist_db['mes_referencia'].tolist()
        
        meses_abrev_num = {
            "01": "Janeiro", "02": "Fevereiro", "03": "Março", "04": "Abril", "05": "Maio", "06": "Junho",
            "07": "Julho", "08": "Agosto", "09": "Setembro", "10": "Outubro", "11": "Novembro", "12": "Dezembro"
        }
        
        def format_date_dist_lbl(val):
            parts = val.split('-')
            return f"{meses_abrev_num[parts[1]]}/{parts[0]}"
            
        date_dist_lbls = {val: format_date_dist_lbl(val) for val in list_datas_dist}
        
        ref_date = st.selectbox(
            "Selecione o Mês/Ano de Referência do Rateio Estadual:",
            list_datas_dist,
            format_func=lambda x: date_dist_lbls[x],
            key="benchmarking_sel_ref_date"
        )
        
        df_state = get_benchmarking_data(ref_date)
        lbl_data_ref = date_dist_lbls[ref_date]
    else:
        ref_date = "2023-01-01"
        df_state = get_benchmarking_data(ref_date)
        lbl_data_ref = "Janeiro/2023"
    
    if len(df_state) > 0:
        # Procurar posição da Vocação
        voc_cnpj_num = 61750246000175
        df_state['cnpj_num'] = df_state['cnpj'].astype(int)
        
        # Vocação no Estado
        pos_estado = df_state[df_state['cnpj_num'] == voc_cnpj_num].index.tolist()
        pos_estado_val = pos_estado[0] + 1 if len(pos_estado) > 0 else "N/A"
        
        # Vocação no Município (São Paulo)
        df_sp = df_state[df_state['municipio'] == 'São Paulo'].reset_index(drop=True)
        pos_sp = df_sp[df_sp['cnpj_num'] == voc_cnpj_num].index.tolist()
        pos_sp_val = pos_sp[0] + 1 if len(pos_sp) > 0 else "N/A"
        
        bcol1, bcol2, bcol3 = st.columns(3)
        
        with bcol1:
            st.markdown(f"""
            <div class="kpi-card">
                <div class="kpi-label">Posição no Estado (Geral)</div>
                <div class="kpi-val">#{pos_estado_val}</div>
                <div class="kpi-sub">De {len(df_state)} entidades de Assistência Social</div>
            </div>
            """, unsafe_allow_html=True)
            
        with bcol2:
            st.markdown(f"""
            <div class="kpi-card">
                <div class="kpi-label">Posição na Capital (São Paulo)</div>
                <div class="kpi-val">#{pos_sp_val}</div>
                <div class="kpi-sub">De {len(df_sp)} entidades de Assistência Social</div>
            </div>
            """, unsafe_allow_html=True)
            
        with bcol3:
            # Calcular o market share financeiro da Vocação na Capital
            total_cap_cred = df_sp['total'].sum()
            voc_total_mes = df_sp[df_sp['cnpj_num'] == voc_cnpj_num]['total'].values[0] if len(pos_sp) > 0 else 0.0
            market_share_sp = (voc_total_mes / total_cap_cred) * 100 if total_cap_cred > 0 else 0.0
            
            st.markdown(f"""
            <div class="kpi-card">
                <div class="kpi-label">Market Share da Vocação (Capital)</div>
                <div class="kpi-val">{market_share_sp:.2f}%</div>
                <div class="kpi-sub">Do total distribuído na cidade</div>
            </div>
            """, unsafe_allow_html=True)

        # Gráfico: Top 10 Entidades do Estado
        st.markdown(f"#### Maiores Captações do Estado em Assistência Social (Ref: {lbl_data_ref})")
        
        # Selecionar top 10 e incluir a Vocação caso ela não esteja entre as top 10
        df_top10 = df_state.head(10).copy()
        if len(pos_estado) > 0 and pos_estado[0] >= 10:
            df_voc_row = df_state[df_state['cnpj_num'] == voc_cnpj_num].copy()
            df_top10 = pd.concat([df_top10, df_voc_row])
            
        df_top10['CNPJ Formatado'] = df_top10['cnpj'].apply(format_cnpj)
        
        # Destacar a Vocação mudando a cor no gráfico
        df_top10['Cor'] = df_top10['cnpj_num'].apply(lambda x: 'Vocação (Destaque)' if x == voc_cnpj_num else 'Outras Entidades')
        
        fig_ranking = px.bar(
            df_top10, 
            y='razao_social', 
            x='total', 
            color='Cor',
            color_discrete_map={
                'Vocação (Destaque)': '#00f2fe',
                'Outras Entidades': '#4facfe'
            },
            orientation='h',
            labels={'total': 'Créditos + Sorteios Recebidos (R$)', 'razao_social': 'Entidade'},
            template='plotly_dark'
        )
        fig_ranking.update_layout(
            margin=dict(l=10, r=10, t=10, b=10),
            yaxis={'categoryorder': 'total ascending'},
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
            font_family="Outfit"
        )
        st.plotly_chart(fig_ranking, use_container_width=True)

        # Seção de Simulador e Prospecção
        st.markdown("---")
        st.markdown("### 🎯 Simulador de Captação e Prospecção")
        st.markdown("A Vocação pode planejar campanhas de aquisição de novos **Doadores Plenos** (Doação Automática) para aumentar sua receita. Utilize o simulador abaixo para prever o faturamento mensal estimado:")
        
        scol1, scol2 = st.columns(2)
        
        with scol1:
            # Inputs do Simulador
            st.markdown("#### Parâmetros da Simulação")
            metas_doadores = st.number_input(
                "Meta de Doadores Plenos Ativos:", 
                min_value=100, 
                max_value=100000, 
                value=int(plenos) if plenos > 0 else 5000, 
                step=100
            )
            
            # Usar ticket médio recente da base de dados como base
            ticket_estimado = st.number_input(
                "Retorno Financeiro Médio Estimado por Cupom (R$):",
                min_value=1.0,
                max_value=300.0,
                value=float(ticket_aut) if ticket_aut > 0 else 150.0,
                step=5.0
            )
            
            notas_por_doador = st.slider(
                "Quantidade Média de Cupons doados por doador/mês:",
                min_value=1,
                max_value=20,
                value=5,
                step=1
            )
            
        with scol2:
            st.markdown("#### Resultado da Simulação")
            
            # Cálculo de Projeção
            # Créditos Totais Estimados = Meta Doadores * Notas Média por doador * Ticket Médio
            faturamento_estimado_aut = metas_doadores * notas_por_doador * ticket_estimado
            faturamento_anual_estimado = faturamento_estimado_aut * 12
            
            st.markdown(f"""
            <div class="kpi-card" style="border-left: 5px solid #00e676;">
                <div class="kpi-label">Faturamento Mensal Estimado (AUT)</div>
                <div class="kpi-val" style="color: #00e676;">R$ {faturamento_estimado_aut:,.2f}</div>
                <div class="kpi-sub" style="color: #ffffff;">Faturamento Anual Projetado: R$ {faturamento_anual_estimado:,.2f}</div>
            </div>
            """, unsafe_allow_html=True)
            
            st.info("""
                💡 **Insight de Prospecção:** 
                Cada novo Doador Pleno cadastrado com o CNPJ da Vocação, doando em média 5 notas por mês, gera aproximadamente 
                **R$ {:.2f} mensais** em créditos (com base no ticket médio histórico). 
                Uma campanha para trazer 1.000 novos doadores automatizados representa um incremento de **R$ {:,.2f} anuais**.
            """.format(5 * ticket_estimado, 1000 * 5 * ticket_estimado * 12))
            
        # ==========================================
        # SEÇÃO: EXPLORADOR DE RANKING GERAL (2023-2025)
        # ==========================================
        st.markdown("---")
        st.markdown("### 🔍 Explorador de Rankings de Captação (Dados 2023 - 2025)")
        st.markdown("Consulte quais entidades lideraram a captação de recursos do programa NFP por período e tipo de crédito no estado.")
        
        # Carregar lista de períodos disponíveis no banco
        conn = get_db_connection()
        periodos_db = pd.read_sql_query("SELECT DISTINCT ano_mes FROM historico_detalhado ORDER BY ano_mes DESC", conn)
        conn.close()
        
        if len(periodos_db) > 0:
            list_ano_mes = periodos_db['ano_mes'].tolist()
            
            # Formatar a exibição das datas para MM/YYYY
            def format_ano_mes_lbl(val):
                ano = val // 100
                mes = val % 100
                return f"{mes:02d}/{ano}"
                
            periodo_lbls = {val: format_ano_mes_lbl(val) for val in list_ano_mes}
            
            rcol1, rcol2, rcol3 = st.columns(3)
            with rcol1:
                sel_periodo = st.selectbox(
                    "Selecione o Mês/Ano de Emissão:", 
                    list_ano_mes, 
                    format_func=lambda x: periodo_lbls[x],
                    key="ranking_sel_periodo"
                )
            with rcol2:
                sel_cat_lbl = st.selectbox(
                    "Selecione a Categoria de Crédito:",
                    [
                        "Doações Automáticas (Fidelidade)", 
                        "Urnas / Digitação (CAD)", 
                        "Doações Comuns (App/Site)", 
                        "Consumo Próprio", 
                        "Créditos Totais"
                    ],
                    key="ranking_sel_categoria"
                )
            with rcol3:
                sel_top_n = st.selectbox(
                    "Quantidade de Entidades (Top N):",
                    [5, 10, 20, 30, 50, 100],
                    index=1,
                    key="ranking_sel_top_n"
                )
                
            # Mapeamento das colunas do SQLite
            cat_map_db = {
                "Doações Automáticas (Fidelidade)": "h.cred_doacao_automatica",
                "Urnas / Digitação (CAD)": "h.cred_cadastro_entidade",
                "Doações Comuns (App/Site)": "h.cred_cadastro_consumidor",
                "Consumo Próprio": "h.cred_consumo_proprio",
                "Créditos Totais": "(h.cred_doacao_automatica + h.cred_cadastro_entidade + h.cred_cadastro_consumidor + h.cred_consumo_proprio)"
            }
            
            col_db = cat_map_db[sel_cat_lbl]
            
            # Executar consulta completa para calcular posições reais no estado
            conn = get_db_connection()
            df_full_rank = pd.read_sql_query(f"""
                SELECT 
                    e.cnpj as "CNPJ",
                    e.razao_social as "Razão Social", 
                    e.municipio as "Município", 
                    e.area_atuacao as "Área", 
                    {col_db} as "Valor (R$)"
                FROM historico_detalhado h
                JOIN entidades e ON h.cnpj = e.cnpj
                WHERE h.ano_mes = {sel_periodo}
                ORDER BY "Valor (R$)" DESC
            """, conn)
            conn.close()
            
            if len(df_full_rank) > 0:
                # Adicionar coluna de posição (1-indexed)
                df_full_rank['Posição'] = range(1, len(df_full_rank) + 1)
                
                # CNPJ da Vocação (limpo, string)
                voc_cnpj = '61750246000175'
                
                # Obter a linha da Vocação no ranking geral
                df_voc_row = df_full_rank[df_full_rank['CNPJ'] == voc_cnpj]
                
                # 1. Preparar DF para o Gráfico (se a Vocação não estiver no Top N, adiciona no final)
                df_chart_show = df_full_rank.head(sel_top_n).copy()
                if len(df_voc_row) > 0:
                    voc_pos = df_voc_row.iloc[0]['Posição']
                    if voc_pos > sel_top_n:
                        df_chart_show = pd.concat([df_chart_show, df_voc_row])
                        
                df_chart_show['Cor'] = df_chart_show['CNPJ'].apply(
                    lambda x: 'Vocação (Sua Entidade)' if x == voc_cnpj else 'Outras Entidades'
                )
                
                # Gráfico
                fig_rank_explore = px.bar(
                    df_chart_show,
                    y='Razão Social',
                    x='Valor (R$)',
                    color='Cor',
                    color_discrete_map={
                        'Vocação (Sua Entidade)': '#00f2fe',
                        'Outras Entidades': '#4facfe'
                    },
                    orientation='h',
                    labels={'Valor (R$)': 'Valor Recebido (R$)', 'Razão Social': 'Entidade'},
                    template='plotly_dark'
                )
                fig_rank_explore.update_layout(
                    margin=dict(l=10, r=10, t=10, b=10),
                    yaxis={'categoryorder': 'total ascending'},
                    legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
                    font_family="Outfit"
                )
                st.plotly_chart(fig_rank_explore, use_container_width=True)
                
                # 2. Preparar DF para a Tabela (a Vocação sempre vem primeiro, e depois vem a lista geral/Top N)
                if len(df_voc_row) > 0:
                    # Concatena a Vocação no início, seguido da lista geral do Top N (permitindo duplicata/repetição)
                    df_table_show = pd.concat([df_voc_row, df_full_rank.head(sel_top_n)]).reset_index(drop=True)
                else:
                    df_table_show = df_full_rank.head(sel_top_n).copy().reset_index(drop=True)
                
                # Função para destacar a linha da Vocação na tabela
                def style_row(row):
                    is_voc = row['CNPJ'] == voc_cnpj
                    return ['background-color: rgba(0, 242, 254, 0.15); font-weight: bold;' if is_voc else '' for _ in row]
                
                # Tabela formatada (exibindo coluna Posição e ocultando a coluna CNPJ)
                st.dataframe(
                    df_table_show[['Posição', 'CNPJ', 'Razão Social', 'Município', 'Área', 'Valor (R$)']]
                    .style.apply(style_row, axis=1)
                    .format({"Valor (R$)": "R$ {:,.2f}"}),
                    use_container_width=True,
                    hide_index=True,
                    column_config={"CNPJ": None}
                )
            else:
                st.warning("Nenhum registro encontrado para a categoria ou período selecionado.")
        else:
            st.warning("Períodos históricos não encontrados na tabela de dados detalhados.")
            
    else:
        st.warning("Não há dados de distribuição geral das entidades disponíveis para o benchmarking no período selecionado.")
