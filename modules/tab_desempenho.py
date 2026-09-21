import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

def render_tab_desempenho(df_cons, anos_selecionados, meses_selecionados):
    st.markdown("### 📈 Faturamento Histórico e Detalhamento de Créditos")
    
    # Filtrar dados do consolidado para o período selecionado
    if not df_cons.empty and 'ano' in df_cons.columns:
        df_cons_ano = df_cons[df_cons['ano'].isin(anos_selecionados) & df_cons['mes'].isin(meses_selecionados)]
        anos_anteriores = [y - 1 for y in anos_selecionados]
        df_cons_ant = df_cons[df_cons['ano'].isin(anos_anteriores) & df_cons['mes'].isin(meses_selecionados)]
    else:
        df_cons_ano = pd.DataFrame()
        df_cons_ant = pd.DataFrame()

    # Cálculo dos KPIs
    if len(df_cons_ano) > 0:
        tt_cred_ano = df_cons_ano['tt_creditos'].sum()
        tt_cup_ano = df_cons_ano['tt_cupons'].sum()
        ticket_med_ano = tt_cred_ano / tt_cup_ano if tt_cup_ano > 0 else 0.0
        
        # Doações Automáticas
        tt_cred_auto = df_cons_ano['cred_doacao_automatica'].sum() if 'cred_doacao_automatica' in df_cons_ano.columns else 0.0
        pct_auto = (tt_cred_auto / tt_cred_ano * 100) if tt_cred_ano > 0 else 0.0
        
        # Crescimento YoY
        if len(df_cons_ant) > 0:
            tt_cred_ant_val = df_cons_ant['tt_creditos'].sum()
            crescimento_cred = ((tt_cred_ano - tt_cred_ant_val) / tt_cred_ant_val * 100) if tt_cred_ant_val > 0 else 0.0
        else:
            crescimento_cred = 0.0
    else:
        tt_cred_ano, tt_cup_ano, ticket_med_ano, crescimento_cred, pct_auto = 0.0, 0, 0.0, 0.0, 0.0

    # Layout de 4 Cards de KPI com Cores Oficiais
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.markdown(f"""
        <div class="kpi-card kpi-card-petroleo">
            <div class="kpi-label">Créditos Totais</div>
            <div class="kpi-val">R$ {tt_cred_ano:,.2f}</div>
            <div class="kpi-sub">{'+' if crescimento_cred >= 0 else ''}{crescimento_cred:.1f}% vs período anterior</div>
        </div>
        """, unsafe_allow_html=True)

    with col2:
        st.markdown(f"""
        <div class="kpi-card kpi-card-turquesa">
            <div class="kpi-label">Volume de Cupons</div>
            <div class="kpi-val">{tt_cup_ano:,}</div>
            <div class="kpi-sub">Cupons processados SEFAZ</div>
        </div>
        """, unsafe_allow_html=True)

    with col3:
        st.markdown(f"""
        <div class="kpi-card kpi-card-amarelo">
            <div class="kpi-label">Ticket Médio por Cupom</div>
            <div class="kpi-val">R$ {ticket_med_ano:.2f}</div>
            <div class="kpi-sub">Média de crédito por documento</div>
        </div>
        """, unsafe_allow_html=True)

    with col4:
        st.markdown(f"""
        <div class="kpi-card kpi-card-verde">
            <div class="kpi-label">Doação Automática (PF)</div>
            <div class="kpi-val">{pct_auto:.1f}%</div>
            <div class="kpi-sub">Participação no faturamento total</div>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("---")

    # Gráficos
    gcol1, gcol2 = st.columns([7, 5])
    
    with gcol1:
        st.markdown("#### Evolução Mensal do Faturamento (Créditos NFP)")
        if len(df_cons_ano) > 0 and 'data' in df_cons_ano.columns:
            fig_evo = px.line(
                df_cons_ano.sort_values('data'),
                x='data',
                y='tt_creditos',
                markers=True,
                line_shape='spline',
                color_discrete_sequence=['#00e3e6']
            )
            fig_evo.update_layout(
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                font=dict(color='#ffffff', family='Raleway'),
                xaxis=dict(title='', gridcolor='rgba(255,255,255,0.1)'),
                yaxis=dict(title='Créditos (R$)', gridcolor='rgba(255,255,255,0.1)')
            )
            st.plotly_chart(fig_evo, use_container_width=True)
        else:
            st.info("Nenhum dado disponível para o filtro selecionado.")

    with gcol2:
        st.markdown("#### Composição por Modalidade")
        if len(df_cons_ano) > 0 and 'cred_doacao_automatica' in df_cons_ano.columns:
            modalidades = {
                'Doação Automática (PF)': df_cons_ano['cred_doacao_automatica'].sum(),
                'Urnas / Digitação (CAD)': df_cons_ano['cred_cadastro_entidade'].sum(),
                'Doações Comuns (PF)': df_cons_ano['cred_cadastro_consumidor'].sum(),
                'Consumo Próprio': df_cons_ano['cred_consumo_proprio'].sum()
            }
            df_mod = pd.DataFrame(list(modalidades.items()), columns=['Modalidade', 'Valor'])
            df_mod = df_mod[df_mod['Valor'] > 0]
            
            if len(df_mod) > 0:
                fig_pie = px.pie(
                    df_mod,
                    names='Modalidade',
                    values='Valor',
                    hole=0.55,
                    color_discrete_sequence=['#00e3e6', '#edcd01', '#00e04b', '#fd3168']
                )
                fig_pie.update_layout(
                    paper_bgcolor='rgba(0,0,0,0)',
                    font=dict(color='#ffffff', family='Raleway'),
                    showlegend=True
                )
                st.plotly_chart(fig_pie, use_container_width=True)
        else:
            st.info("Nenhum dado de modalidade disponível.")
