import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

def render_tab_desempenho(df_cons, anos_selecionados, meses_selecionados):
    # 1. Hero Banner Dark Blue Box
    st.markdown("""
    <div class="hero-banner-box">
        <div>
            <div class="hero-tag">PAINEL ESTRATÉGICO VOCAÇÃO • 🗓️ Ano de 2026 (Janeiro a Agosto)</div>
            <div class="hero-title">Desempenho & Faturamento NFP</div>
            <div class="hero-desc">
                Acompanhamento consolidado de créditos definitivos apurados pela Secretaria da Fazenda de SP e volume operacional de notas capturadas.
            </div>
        </div>
        <div class="tagline-card">
            <div style="font-size: 0.7rem; color: #00e3e6; font-weight: 800; text-transform: uppercase;">Tagline Oficial</div>
            <div style="font-size: 0.92rem; font-weight: 700; color: #ffffff;">
                Onde <span style="background: #edcd01; color: #002a3a; padding: 1px 5px; border-radius: 4px;">potencial</span> encontra caminho
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    # 2. Grid de 4 Cards de KPI Brancos (AI Studio Specs)
    col1, col2, col3, col4 = st.columns(4)

    with col1:
        st.markdown("""
        <div class="kpi-card-white">
            <div class="kpi-card-header">
                <span class="kpi-card-title">CRÉDITOS TOTAIS (SEFAZ)</span>
                <span class="kpi-pill-badge pill-cyan">APURAÇÃO LÍQUIDA</span>
            </div>
            <div class="kpi-big-val">R$ 1.779.200,00</div>
            <div class="kpi-subtext">Receita total confirmada</div>
            <div>
                <span class="kpi-growth-pill growth-positive">+63.7% vs ano anterior (YoY)</span>
            </div>
        </div>
        """, unsafe_allow_html=True)

    with col2:
        st.markdown("""
        <div class="kpi-card-white">
            <div class="kpi-card-header">
                <span class="kpi-card-title">CUPONS VÁLIDOS</span>
                <span class="kpi-pill-badge pill-yellow">DESDUPLICADOS</span>
            </div>
            <div class="kpi-big-val">754.500</div>
            <div class="kpi-subtext">Notas com crédito apurado</div>
            <div>
                <span class="kpi-growth-pill growth-info">-43.4% volume processado</span>
            </div>
        </div>
        """, unsafe_allow_html=True)

    with col3:
        st.markdown("""
        <div class="kpi-card-white">
            <div class="kpi-card-header">
                <span class="kpi-card-title">TICKET MÉDIO / NOTA</span>
                <span class="kpi-pill-badge pill-green">R$ POR NF</span>
            </div>
            <div class="kpi-big-val">R$ 2,36</div>
            <div class="kpi-subtext">Retorno médio por cupom</div>
            <div>
                <span class="kpi-growth-pill growth-positive">+12.8% eficiência unitária</span>
            </div>
        </div>
        """, unsafe_allow_html=True)

    with col4:
        st.markdown("""
        <div class="kpi-card-white">
            <div class="kpi-card-header">
                <span class="kpi-card-title">PARTICIPAÇÃO DOAÇÃO AUT</span>
                <span class="kpi-pill-badge pill-pink">DOADORES PLENOS</span>
            </div>
            <div class="kpi-big-val">57.4%</div>
            <div class="kpi-subtext">R$ 1.021.200,00</div>
            <div>
                <span class="kpi-growth-pill growth-positive">+10.7 p.p. recorrência alta</span>
            </div>
        </div>
        """, unsafe_allow_html=True)

    # 3. Seção de Gráficos em Cards Brancos
    gcol1, gcol2 = st.columns([7, 5])

    with gcol1:
        st.markdown("""
        <div class="chart-card-white">
            <h4 style="margin:0; color:#0f172a; font-weight:800;">⚙️ Evolução Mensal de Créditos por Categoria</h4>
            <div style="font-size:0.8rem; color:#64748b; margin-bottom:12px;">Segmentação entre Doação Automática, Doação Direta e Urnas/Parceiras (R$)</div>
        """, unsafe_allow_html=True)
        
        # Dados da evolução mensal acumulada
        months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago"]
        df_chart = pd.DataFrame({
            "Mês": months,
            "Automática": [110, 118, 125, 130, 138, 142, 148, 155],
            "Urnas (Cadastro)": [45, 48, 52, 50, 55, 58, 60, 62],
            "Direta": [15, 18, 20, 22, 24, 25, 26, 28]
        })

        fig_area = go.Figure()
        fig_area.add_trace(go.Scatter(x=months, y=df_chart["Automática"], mode='lines', stackgroup='one', name='Automática', line=dict(color='#004a6d', width=2), fillcolor='rgba(0,74,109,0.7)'))
        fig_area.add_trace(go.Scatter(x=months, y=df_chart["Urnas (Cadastro)"], mode='lines', stackgroup='one', name='Urnas (Cadastro)', line=dict(color='#edcd01', width=2), fillcolor='rgba(237,205,1,0.7)'))
        fig_area.add_trace(go.Scatter(x=months, y=df_chart["Direta"], mode='lines', stackgroup='one', name='Direta', line=dict(color='#00e3e6', width=2), fillcolor='rgba(0,227,230,0.7)'))

        fig_area.update_layout(
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            font=dict(color='#0f172a', family='Raleway'),
            margin=dict(l=10, r=10, t=10, b=10),
            xaxis=dict(gridcolor='#f1f5f9'),
            yaxis=dict(gridcolor='#f1f5f9', title='R$ em Milhares'),
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
        )
        st.plotly_chart(fig_area, use_container_width=True)
        st.markdown("</div>", unsafe_allow_html=True)

    with gcol2:
        st.markdown("""
        <div class="chart-card-white">
            <h4 style="margin:0; color:#0f172a; font-weight:800;">Composição de Receitas</h4>
            <div style="font-size:0.8rem; color:#64748b; margin-bottom:12px;">Divisão proporcional do faturamento por modalidade</div>
        """, unsafe_allow_html=True)
        
        df_pie = pd.DataFrame({
            "Modalidade": ["Doação Automática (PF)", "Urnas / Digitação (CAD)", "Doações Diretas (PF)", "Consumo Próprio"],
            "Valor": [1021200, 482000, 186000, 90000]
        })

        fig_pie = px.pie(
            df_pie,
            names="Modalidade",
            values="Valor",
            hole=0.6,
            color_discrete_sequence=['#004a6d', '#edcd01', '#00e3e6', '#00e04b']
        )
        fig_pie.update_layout(
            paper_bgcolor='rgba(0,0,0,0)',
            font=dict(color='#0f172a', family='Raleway'),
            showlegend=True,
            annotations=[dict(text='TOTAL<br><b>R$ 1779k</b>', x=0.5, y=0.5, font_size=15, showarrow=False)],
            margin=dict(l=10, r=10, t=10, b=10)
        )
        st.plotly_chart(fig_pie, use_container_width=True)
        st.markdown("</div>", unsafe_allow_html=True)
