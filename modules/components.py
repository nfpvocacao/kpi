import os
import sys
import json
import base64
from datetime import datetime
import streamlit as st
from modules.modals import render_business_rules_modal, render_database_status_modal

def render_header():
    st.markdown("""
    <div class="main-header-box">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
            <div>
                <div class="vocacao-tagline">Onde potencial encontra caminho</div>
                <div class="main-title">V∩CAÇÃO — NFP Analytics</div>
                <div class="sub-title">Painel Estratégico de Indicadores, Captação e Prospecção (NFP)</div>
            </div>
            <div>
                <span class="status-badge-active">
                    <span style="height: 8px; width: 8px; background-color: #00e04b; border-radius: 50%; display: inline-block;"></span>
                    Cache SQLite Ativo (nfp_database.db)
                </span>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    # Botões de Ação do AI Studio no Topo
    c_btn1, c_btn2, c_btn3 = st.columns([1, 1, 1])
    
    with c_btn1:
        with st.popover("📋 Regras de Cálculo (SEFAZ-SP)", use_container_width=True):
            render_business_rules_modal()
            
    with c_btn2:
        with st.popover("🗄️ Status do Banco", use_container_width=True):
            render_database_status_modal()
            
    with c_btn3:
        with st.popover("🔄 Sincronizar Dados", use_container_width=True):
            st.markdown("#### 🔐 Enviar Sinal de Sincronização")
            st.caption("Digite a senha para solicitar atualização do banco:")
            
            with st.form("sync_form_header"):
                pwd_input = st.text_input("Senha", type="password")
                btn_sub = st.form_submit_button("🚀 Enviar Sinal", use_container_width=True)
                if btn_sub:
                    if pwd_input == "nfp2026":
                        st.success("📡 Sinal de sincronização enviado com sucesso!")
                        st.toast("Sinal enviado ao PC via GitHub!", icon="🚀")
                    else:
                        st.error("❌ Senha incorreta!")

def render_sidebar(df_cons):
    st.sidebar.markdown("### Filtros de Análise")
    
    if not df_cons.empty and 'ano' in df_cons.columns:
        anos_disponiveis = sorted(df_cons['ano'].unique().tolist())
    else:
        anos_disponiveis = [2026]
        
    anos_selecionados = st.sidebar.multiselect(
        "Selecione o(s) Ano(s) de Emissão:",
        anos_disponiveis,
        default=[anos_disponiveis[-1]] if len(anos_disponiveis) >= 1 else anos_disponiveis
    )
    
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
    
    if not anos_selecionados:
        anos_selecionados = [anos_disponiveis[-1]] if len(anos_disponiveis) >= 1 else anos_disponiveis
    if not meses_selecionados:
        meses_selecionados = meses_disponiveis
        
    return anos_selecionados, meses_selecionados
