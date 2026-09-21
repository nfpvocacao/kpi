import streamlit as st
import pandas as pd
import plotly.express as px
from modules.database import get_benchmarking_data

def render_tab_benchmarking():
    st.markdown("### 🎯 Benchmarking & Simulador Interativo de Metas")
    st.markdown("Posicionamento institucional da Vocação frente às demais entidades de Assistência Social no Estado de SP e simulador de metas.")

    # Seção 1: Ranking de Posição Institucional
    st.markdown("#### 🏆 Posicionamento Institucional no Estado de São Paulo")
    
    bcol1, bcol2, bcol3 = st.columns(3)
    
    with bcol1:
        st.markdown("""
        <div class="kpi-card kpi-card-amarelo">
            <div class="kpi-label">Posição Capital (SP)</div>
            <div class="kpi-val">6º Lugar</div>
            <div class="kpi-sub">Entre todas as entidades sociais da Capital</div>
        </div>
        """, unsafe_allow_html=True)
        
    with bcol2:
        st.markdown("""
        <div class="kpi-card kpi-card-turquesa">
            <div class="kpi-label">Posição Estado (SP)</div>
            <div class="kpi-val">14º Lugar</div>
            <div class="kpi-sub">Entre todas as 3.200+ entidades estaduais</div>
        </div>
        """, unsafe_allow_html=True)

    with bcol3:
        st.markdown("""
        <div class="kpi-card kpi-card-verde">
            <div class="kpi-label">Área de Atuação</div>
            <div class="kpi-val">Assistência Social</div>
            <div class="kpi-sub">Categoria oficial SEFAZ-SP</div>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("---")

    # Seção 2: Simulador Interativo de Metas
    st.markdown("### 🧮 Simulador Interativo de Impacto e Metas")
    st.caption("Ajuste os parâmetros abaixo para calcular a projeção de captação e o número de crianças e jovens atendidos:")

    scol1, scol2 = st.columns(2)
    
    with scol1:
        novas_urnas = st.slider("Novos Pontos de Coleta (Urnas Fisicas):", min_value=0, max_value=200, value=25, step=5)
        cupons_por_urna = st.slider("Média de Cupons/Urna/Mês:", min_value=100, max_value=2000, value=500, step=50)

    with scol2:
        novos_doadores_pf = st.slider("Novos Doadores Automáticos (PF):", min_value=0, max_value=5000, value=500, step=50)
        ticket_estimado = st.number_input("Ticket Médio Estimado por Cupom (R$):", min_value=0.10, max_value=5.00, value=0.85, step=0.05)

    # Cálculos da Simulação
    cupons_adicionais_mes = novas_urnas * cupons_por_urna
    captacao_adicional_urnas_mes = cupons_adicionais_mes * ticket_estimado
    captacao_adicional_pf_mes = novos_doadores_pf * 12.50 # Média R$ 12,50/doador PF
    
    total_adicional_mes = captacao_adicional_urnas_mes + captacao_adicional_pf_mes
    total_adicional_ano = total_adicional_mes * 12
    jovens_impactados = int(total_adicional_ano / 1500) # R$ 1.500 investidos por jovem/ano

    # Exibição dos Resultados da Simulação
    st.markdown("#### Resultado da Projeção de Impacto")
    
    rcol1, rcol2, rcol3 = st.columns(3)
    
    with rcol1:
        st.markdown(f"""
        <div class="kpi-card kpi-card-petroleo">
            <div class="kpi-label">Projeção Adicional Mensal</div>
            <div class="kpi-val">R$ {total_adicional_mes:,.2f}</div>
            <div class="kpi-sub">Captação extra por mês</div>
        </div>
        """, unsafe_allow_html=True)

    with rcol2:
        st.markdown(f"""
        <div class="kpi-card kpi-card-turquesa">
            <div class="kpi-label">Projeção Adicional Anual</div>
            <div class="kpi-val">R$ {total_adicional_ano:,.2f}</div>
            <div class="kpi-sub">Captação extra em 12 meses</div>
        </div>
        """, unsafe_allow_html=True)

    with rcol3:
        st.markdown(f"""
        <div class="kpi-card kpi-card-verde">
            <div class="kpi-label">Jovens Atendidos</div>
            <div class="kpi-val">+{jovens_impactados} Jovens</div>
            <div class="kpi-sub">Impacto social direto gerado</div>
        </div>
        """, unsafe_allow_html=True)
