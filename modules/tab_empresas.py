import streamlit as st
import pandas as pd
import plotly.express as px
from modules.database import load_vocacao_empresas

def render_tab_empresas(anos_selecionados, meses_selecionados):
    st.markdown("### 🏢 Operações por Empresa Parceira e Urnas Comerciais")
    st.markdown("Análise de desempenho dos 389 pontos de coleta (urnas de cupons fisicos) distribuídos nas 17 redes conveniadas.")

    df_emp = load_vocacao_empresas()
    
    if df_emp.empty:
        st.warning("Nenhum dado de empresa parceira encontrado no banco de dados local.")
        return

    # Filtros de busca rápida
    col_search, col_sort = st.columns([3, 1])
    with col_search:
        search_query = st.text_input("🔍 Buscar Rede ou CNPJ Parceiro:", "", placeholder="Digite o nome da loja ou CNPJ...")
    with col_sort:
        sort_col = st.selectbox("Ordenar Por:", ["Créditos Totais (R$)", "Volume de Cupons", "Ticket Médio (R$)"])

    df_filtered = df_emp.copy()
    if search_query:
        df_filtered = df_filtered[
            df_filtered['razao_social'].str.contains(search_query, case=False, na=False) |
            df_filtered['cnpj'].str.contains(search_query, case=False, na=False)
        ]

    # Ordenação
    if sort_col == "Créditos Totais (R$)":
        df_filtered = df_filtered.sort_values('total_credito_apurado', ascending=False)
    elif sort_col == "Volume de Cupons":
        df_filtered = df_filtered.sort_values('total_cupons', ascending=False)
    elif sort_col == "Ticket Médio (R$)":
        df_filtered['tm'] = df_filtered['total_credito_apurado'] / df_filtered['total_cupons']
        df_filtered = df_filtered.sort_values('tm', ascending=False)

    # Gráfico Top Redes Conveniadas
    st.markdown("#### Top Redes Parceiras por Captação de Créditos (R$)")
    top_10_emp = df_filtered.head(10)
    
    if len(top_10_emp) > 0:
        fig_emp = px.bar(
            top_10_emp,
            x='total_credito_apurado',
            y='razao_social',
            orientation='h',
            text_auto='.2f',
            color='total_credito_apurado',
            color_continuous_scale=['#004a6d', '#00e3e6']
        )
        fig_emp.update_layout(
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            font=dict(color='#ffffff', family='Raleway'),
            yaxis=dict(autorange='reversed', title=''),
            xaxis=dict(title='Crédito Apurado (R$)', gridcolor='rgba(255,255,255,0.1)'),
            coloraxis_showscale=False
        )
        st.plotly_chart(fig_emp, use_container_width=True)

    # Tabela detalhada
    st.markdown("#### Tabela Detalhada de Estabelecimentos Conveniados")
    st.dataframe(
        df_filtered[['cnpj', 'razao_social', 'total_cupons', 'total_credito_apurado']],
        use_container_width=True,
        hide_index=True
    )

    # Botão de Exportação CSV
    csv_data = df_filtered.to_csv(index=False).encode('utf-8')
    st.download_button(
        label="📥 Exportar Relatório de Empresas (CSV)",
        data=csv_data,
        file_name="operacoes_empresas_vocacao.csv",
        mime="text/csv"
    )
