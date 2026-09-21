import streamlit as st
from modules.styles import apply_custom_styles
from modules.components import render_header, render_sidebar
from modules.database import load_vocacao_consolidado
from modules.tab_desempenho import render_tab_desempenho
from modules.tab_empresas import render_tab_empresas
from modules.tab_doadores import render_tab_doadores
from modules.tab_fidelidade import render_tab_fidelidade
from modules.tab_benchmarking import render_tab_benchmarking

# Configuração da página Streamlit
st.set_page_config(
    page_title="V∩CAÇÃO — NFP Analytics",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# 1. Aplicar temas e CSS customizados da marca Vocação
apply_custom_styles()

# 2. Renderizar cabeçalho institucional com botões e modais
render_header()

# 3. Carregar dados consolidados
df_cons = load_vocacao_consolidado()

# 4. Renderizar filtros laterais
anos_selecionados, meses_selecionados = render_sidebar(df_cons)

# 5. Navegação principal em 5 Abas Elegantes do AI Studio
tab1, tab2, tab3, tab4, tab5 = st.tabs([
    "📈 Desempenho & Faturamento NFP",
    "🏢 Operações por Empresa Parceira",
    "❤️ Análise de Doadores Reais (PF)",
    "👥 Doadores Automáticos & Recorrência",
    "🎯 Benchmarking & Simulador Interativo"
])

with tab1:
    render_tab_desempenho(df_cons, anos_selecionados, meses_selecionados)

with tab2:
    render_tab_empresas(anos_selecionados, meses_selecionados)

with tab3:
    render_tab_doadores(anos_selecionados, meses_selecionados)

with tab4:
    render_tab_fidelidade(anos_selecionados, meses_selecionados)

with tab5:
    render_tab_benchmarking()
