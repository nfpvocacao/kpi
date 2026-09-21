import streamlit as st
import pandas as pd
import plotly.express as px
from modules.database import load_vocacao_doador_loja

def render_tab_fidelidade(anos_selecionados, meses_selecionados):
    st.markdown("### 👥 Doadores Automáticos & Recorrência (Fidelidade NFP)")
    st.markdown("Monitoramento de doações automáticas cadastradas via aplicativo/site da Nota Fiscal Paulista.")

    df_loja = load_vocacao_doador_loja()

    # Cards de Indicadores de Fidelidade
    fcol1, fcol2, fcol3 = st.columns(3)
    
    with fcol1:
        st.markdown("""
        <div class="kpi-card kpi-card-verde">
            <div class="kpi-label">Taxa de Retenção de Doadores</div>
            <div class="kpi-val">80.5%</div>
            <div class="kpi-sub">Doadores recorrentes ativos</div>
        </div>
        """, unsafe_allow_html=True)
        
    with fcol2:
        st.markdown("""
        <div class="kpi-card kpi-card-petroleo">
            <div class="kpi-label">Projeção LTV Anual (PF)</div>
            <div class="kpi-val">R$ 142.50</div>
            <div class="kpi-sub">Valor estimado por doador/ano</div>
        </div>
        """, unsafe_allow_html=True)
        
    with fcol3:
        st.markdown("""
        <div class="kpi-card kpi-card-amarelo">
            <div class="kpi-label">Recorrência Média</div>
            <div class="kpi-val">11.4 meses</div>
            <div class="kpi-sub">Permanência contínua no programa</div>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("---")
    st.markdown("#### Cruzamento: Doadores Automáticos por Estabelecimento Comercial")
    
    if not df_loja.empty:
        st.dataframe(df_loja, use_container_width=True, hide_index=True)
    else:
        st.info("Nenhum registro de vínculo por estabelecimento encontrado.")
