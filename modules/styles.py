import streamlit as st

def apply_custom_styles():
    st.markdown("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;600;700;800;900&display=swap');
    
    /* Fundo Claro Limpo do AI Studio (Light Theme) */
    html, body, [class*="css"], .stApp {
        font-family: 'Raleway', sans-serif !important;
        background-color: #f8fafc !important;
        color: #0f172a !important;
    }
    
    /* Ocultar Barra Lateral (Sidebar) e Elementos Padrão */
    [data-testid="stSidebar"] { display: none !important; }
    #MainMenu, header, footer { visibility: hidden; }
    .stApp > header { display: none; }
    
    /* Container Principal */
    .block-container {
        padding-top: 1.5rem !important;
        padding-bottom: 2rem !important;
        max-width: 1350px !important;
    }
    
    /* Header Principal Institucional */
    .brand-title {
        font-size: 1.9rem;
        font-weight: 900;
        color: #002a3a;
        margin: 0;
        letter-spacing: -0.5px;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .brand-badge-nfp {
        background: #004a6d;
        color: #00e3e6;
        font-size: 0.75rem;
        font-weight: 800;
        padding: 3px 10px;
        border-radius: 6px;
        letter-spacing: 0.5px;
    }
    
    .brand-badge-sefaz {
        background: #e0f2fe;
        color: #0369a1;
        font-size: 0.75rem;
        font-weight: 700;
        padding: 3px 10px;
        border-radius: 6px;
        border: 1px solid #bae6fd;
    }

    .brand-subtitle {
        color: #64748b;
        font-size: 0.85rem;
        font-weight: 500;
        margin-top: 2px;
    }
    
    .status-badge-sqlite {
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        color: #166534;
        padding: 5px 14px;
        border-radius: 20px;
        font-size: 0.82rem;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        gap: 6px;
    }

    /* Hero Banner Dark Blue Box */
    .hero-banner-box {
        background: linear-gradient(135deg, #002a3a 0%, #004a6d 100%);
        border-radius: 14px;
        padding: 24px 30px;
        margin-top: 15px;
        margin-bottom: 24px;
        color: #ffffff;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 4px 16px rgba(0, 42, 58, 0.15);
    }

    .hero-tag {
        color: #00e3e6;
        font-size: 0.75rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .hero-title {
        color: #ffffff;
        font-size: 1.8rem;
        font-weight: 900;
        margin: 4px 0;
    }

    .hero-desc {
        color: #cbd5e1;
        font-size: 0.88rem;
        font-weight: 500;
        max-width: 650px;
    }

    .tagline-card {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 10px;
        padding: 12px 18px;
        text-align: right;
    }

    /* Cards de KPI Brancos do AI Studio */
    .kpi-card-white {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 14px;
        padding: 18px 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        margin-bottom: 15px;
    }

    .kpi-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }

    .kpi-card-title {
        font-size: 0.75rem;
        font-weight: 800;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .kpi-pill-badge {
        font-size: 0.68rem;
        font-weight: 800;
        padding: 2px 8px;
        border-radius: 6px;
    }
    
    .pill-cyan { background: #e0f2fe; color: #0284c7; }
    .pill-yellow { background: #fef9c3; color: #a16207; }
    .pill-green { background: #dcfce7; color: #15803d; }
    .pill-pink { background: #ffe4e6; color: #be123c; }

    .kpi-big-val {
        font-size: 1.8rem;
        font-weight: 900;
        color: #0f172a;
        margin: 4px 0;
        letter-spacing: -0.5px;
    }

    .kpi-subtext {
        font-size: 0.78rem;
        color: #64748b;
        margin-bottom: 8px;
    }

    .kpi-growth-pill {
        font-size: 0.72rem;
        font-weight: 800;
        padding: 3px 8px;
        border-radius: 12px;
        display: inline-block;
    }

    .growth-positive { background: #dcfce7; color: #166534; }
    .growth-info { background: #e0f2fe; color: #0369a1; }

    /* Estilização das Abas (Tabs) do AI Studio */
    .stTabs [data-baseweb="tab-list"] {
        gap: 12px;
        background-color: transparent;
        padding: 4px 0;
        border-bottom: 2px solid #e2e8f0;
        margin-bottom: 20px;
    }

    .stTabs [data-baseweb="tab"] {
        height: 44px;
        border-radius: 8px;
        color: #475569;
        font-weight: 700;
        font-size: 0.88rem;
        padding: 0 18px;
        background-color: #ffffff;
        border: 1px solid #cbd5e1;
    }

    .stTabs [aria-selected="true"] {
        background-color: #004a6d !important;
        color: #ffffff !important;
        border-color: #004a6d !important;
    }

    /* White Chart Containers */
    .chart-card-white {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 14px;
        padding: 20px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        margin-bottom: 20px;
    }

    /* Botões de Popover */
    div[data-testid="stPopover"] > button {
        background: #ffffff !important;
        border: 1px solid #cbd5e1 !important;
        color: #0f172a !important;
        font-weight: 700 !important;
        border-radius: 8px !important;
        padding: 6px 14px !important;
    }
    div[data-testid="stPopover"] > button:hover {
        background: #f1f5f9 !important;
        border-color: #004a6d !important;
        color: #004a6d !important;
    }
    </style>
    """, unsafe_allow_html=True)
