import streamlit as st
from modules.modals import render_business_rules_modal, render_database_status_modal

def render_header():
    # Header Principal do AI Studio
    c_head1, c_head2 = st.columns([3, 2])
    
    with c_head1:
        st.markdown("""
        <div style="display: flex; align-items: center; gap: 10px;">
            <h1 class="brand-title">V∩CAÇÃO</h1>
            <span class="brand-badge-nfp">NFP Analytics</span>
            <span class="brand-badge-sefaz">SEFAZ-SP</span>
        </div>
        <div class="brand-subtitle">Inteligência de Receita & Captação Institucional</div>
        """, unsafe_allow_html=True)
        
    with c_head2:
        st.markdown("""
        <div style="display: flex; align-items: center; justify-content: flex-end; gap: 10px; flex-wrap: wrap;">
            <span class="status-badge-sqlite">
                <span style="height: 8px; width: 8px; background-color: #166534; border-radius: 50%; display: inline-block;"></span>
                Cache SQLite (14ms)
            </span>
        </div>
        """, unsafe_allow_html=True)

    # Linha de Ações Rápidas (Período, Sincronizar, Regras de Negócio)
    st.markdown("<div style='margin-top: 10px;'></div>", unsafe_allow_html=True)
    fcol1, fcol2, fcol3 = st.columns([2, 1, 1])
    
    with fcol1:
        st.selectbox(
            "Período de Análise:",
            ["Ano 2026 (Atual - Jan a Ago)", "Ano 2025 (Histórico Consolidado)", "Ano 2024"],
            index=0,
            key="header_period_sel",
            label_visibility="collapsed"
        )
        
    with fcol2:
        with st.popover("🔄 Sincronizar", use_container_width=True):
            st.markdown("#### 🔐 Sincronizar Dados")
            st.caption("Solicitar reimportação de planilhas ao PC autorizado:")
            with st.form("sync_header_form"):
                pwd = st.text_input("Senha", type="password")
                if st.form_submit_button("Confirmar Sinal"):
                    if pwd == "nfp2026":
                        st.success("Sinal de sincronização enviado!")
                    else:
                        st.error("Senha incorreta!")
                        
    with fcol3:
        with st.popover("📋 Regras de Cálculo", use_container_width=True):
            render_business_rules_modal()

def render_sidebar(df_cons):
    st.sidebar.markdown("### Filtros de Análise")
    
    anos_disponiveis = [2026, 2025, 2024]
    anos_selecionados = st.sidebar.multiselect(
        "Selecione o(s) Ano(s) de Emissão:",
        anos_disponiveis,
        default=[2026]
    )
    
    meses_nomes = {
        1: "Janeiro", 2: "Fevereiro", 3: "Março", 4: "Abril", 5: "Maio", 6: "Junho",
        7: "Julho", 8: "Agosto", 9: "Setembro", 10: "Outubro", 11: "Novembro", 12: "Dezembro"
    }
    meses_selecionados = st.sidebar.multiselect(
        "Selecione o(s) Mês(es) de Emissão:",
        list(meses_nomes.keys()),
        default=list(meses_nomes.keys()),
        format_func=lambda x: meses_nomes[x]
    )
    
    return anos_selecionados, meses_selecionados

def render_footer():
    st.markdown("""
    <div class="institutional-footer">
        <div>
            <b style="color: #002a3a; font-size: 1rem;">V∩CAÇÃO</b> — NFP Analytics • Plataforma Estratégica de Gestão<br>
            <span style="font-size: 0.78rem;">Ação Comunitária do Brasil | Vocação | CNPJ 61.750.246/0001-75</span>
        </div>
        <div style="font-weight: 700; color: #004a6d;">
            Onde <span style="background: #edcd01; color: #002a3a; padding: 2px 6px; border-radius: 4px;">potencial</span> encontra caminho
        </div>
        <div>
            <a href="#" style="color: #004a6d; text-decoration: none; font-weight: 600;">Regras SEFAZ-SP</a> • 
            <a href="#" style="color: #004a6d; text-decoration: none; font-weight: 600;">Arquitetura de Dados</a> • 
            <a href="#" style="color: #004a6d; text-decoration: none; font-weight: 600;">Manual de Marca v1.1</a>
        </div>
    </div>
    """, unsafe_allow_html=True)
