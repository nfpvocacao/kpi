import streamlit as st
import pandas as pd
import plotly.express as px
from modules.database import load_vocacao_doadores

def render_tab_doadores(anos_selecionados, meses_selecionados):
    st.markdown("### ❤️ Análise de Doadores Reais (Pessoas Físicas)")
    st.caption("Filtro estrito de compliance SEFAZ-SP: Apenas doações vinculadas diretamente a CPF (Doação Automática e Doação Direta voluntária).")

    df_doadores = load_vocacao_doadores()
    
    if df_doadores.empty:
        st.warning("Nenhum registro de doador pessoa física encontrado no banco.")
        return

    # KPIs Principais de Doadores
    total_doadores_unicos = len(df_doadores)
    credito_total_pf = df_doadores['total_credito_apurado'].sum() if 'total_credito_apurado' in df_doadores.columns else 0.0
    ticket_medio_doador = (credito_total_pf / total_doadores_unicos) if total_doadores_unicos > 0 else 0.0

    dcol1, dcol2, dcol3 = st.columns(3)
    
    with dcol1:
        st.markdown(f"""
        <div class="kpi-card kpi-card-rosa">
            <div class="kpi-label">Doadores Únicos Cadastrados</div>
            <div class="kpi-val">{total_doadores_unicos:,}</div>
            <div class="kpi-sub">Doadores com CPF ativo</div>
        </div>
        """, unsafe_allow_html=True)
        
    with dcol2:
        st.markdown(f"""
        <div class="kpi-card kpi-card-turquesa">
            <div class="kpi-label">Captação Total via PF</div>
            <div class="kpi-val">R$ {credito_total_pf:,.2f}</div>
            <div class="kpi-sub">Total doado por Pessoas Físicas</div>
        </div>
        """, unsafe_allow_html=True)
        
    with dcol3:
        st.markdown(f"""
        <div class="kpi-card kpi-card-amarelo">
            <div class="kpi-label">Ticket Médio por Doador</div>
            <div class="kpi-val">R$ {ticket_medio_doador:.2f}</div>
            <div class="kpi-sub">Média gerada por doador PF</div>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("---")
    
    # Ranking Top Doadores
    st.markdown("#### Top Doadores de Maior Impacto")
    top_doadores = df_doadores.head(15)
    
    if len(top_doadores) > 0:
        fig_doad = px.bar(
            top_doadores,
            x='total_credito_apurado',
            y='nome_doador' if 'nome_doador' in top_doadores.columns else 'cpf_doador',
            orientation='h',
            text_auto='.2f',
            color_discrete_sequence=['#fd3168']
        )
        fig_doad.update_layout(
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            font=dict(color='#ffffff', family='Raleway'),
            yaxis=dict(autorange='reversed', title=''),
            xaxis=dict(title='Crédito Apurado (R$)', gridcolor='rgba(255,255,255,0.1)')
        )
        st.plotly_chart(fig_doad, use_container_width=True)

    st.dataframe(df_doadores, use_container_width=True, hide_index=True)
