import streamlit as st

def apply_custom_styles():
    st.markdown("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;600;700;800;900&display=swap');
    
    html, body, [class*="css"], .stApp {
        font-family: 'Raleway', sans-serif !important;
        background-color: #001b26 !important;
        color: #ffffff !important;
    }
    
    /* Header Institucional Vocação */
    .main-header-box {
        background: linear-gradient(135deg, #002a3a 0%, #004a6d 100%);
        border: 1px solid rgba(0, 227, 230, 0.25);
        border-radius: 16px;
        padding: 24px 28px;
        margin-bottom: 24px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    }
    
    .vocacao-tagline {
        color: #00e3e6;
        font-size: 0.85rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        margin-bottom: 4px;
    }
    
    .main-title {
        color: #ffffff;
        font-size: 2.1rem;
        font-weight: 900;
        margin: 0;
        letter-spacing: -0.5px;
    }
    
    .sub-title {
        color: #d9fbff;
        font-size: 0.95rem;
        font-weight: 400;
        margin-top: 6px;
    }
    
    /* Badges e Pílulas de Status */
    .status-badge-active {
        background: rgba(0, 224, 75, 0.15);
        border: 1px solid #00e04b;
        color: #00e04b;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        gap: 6px;
    }
    
    .status-badge-info {
        background: rgba(0, 227, 230, 0.15);
        border: 1px solid #00e3e6;
        color: #00e3e6;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        gap: 6px;
    }

    /* Cards de KPI com Cores Oficiais da Marca Vocação */
    .kpi-card {
        border-radius: 16px;
        padding: 20px 22px;
        margin-bottom: 16px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        transition: transform 0.2s ease-in-out;
    }
    .kpi-card:hover {
        transform: translateY(-3px);
    }
    
    .kpi-card-petroleo {
        background: #002a3a;
        color: #ffffff;
        border: 1px solid rgba(0, 227, 230, 0.3);
    }
    .kpi-card-petroleo .kpi-label { color: #d9fbff; font-size: 0.78rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; }
    .kpi-card-petroleo .kpi-val { color: #00e3e6; font-size: 1.8rem; font-weight: 900; margin-top: 4px; }
    .kpi-card-petroleo .kpi-sub { color: #00e04b; font-size: 0.8rem; font-weight: 700; margin-top: 4px; }
    
    .kpi-card-turquesa {
        background: #00e3e6;
        color: #002a3a;
    }
    .kpi-card-turquesa .kpi-label { color: #002a3a; font-size: 0.78rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; }
    .kpi-card-turquesa .kpi-val { color: #002a3a; font-size: 1.8rem; font-weight: 900; margin-top: 4px; }
    .kpi-card-turquesa .kpi-sub { color: #004a6d; font-size: 0.8rem; font-weight: 700; margin-top: 4px; }

    .kpi-card-amarelo {
        background: #edcd01;
        color: #002a3a;
    }
    .kpi-card-amarelo .kpi-label { color: #002a3a; font-size: 0.78rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; }
    .kpi-card-amarelo .kpi-val { color: #002a3a; font-size: 1.8rem; font-weight: 900; margin-top: 4px; }
    .kpi-card-amarelo .kpi-sub { color: #004a6d; font-size: 0.8rem; font-weight: 700; margin-top: 4px; }

    .kpi-card-verde {
        background: #00e04b;
        color: #002a3a;
    }
    .kpi-card-verde .kpi-label { color: #002a3a; font-size: 0.78rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; }
    .kpi-card-verde .kpi-val { color: #002a3a; font-size: 1.8rem; font-weight: 900; margin-top: 4px; }
    .kpi-card-verde .kpi-sub { color: #004a6d; font-size: 0.8rem; font-weight: 700; margin-top: 4px; }

    .kpi-card-rosa {
        background: #fd3168;
        color: #ffffff;
    }
    .kpi-card-rosa .kpi-label { color: #ffffff; font-size: 0.78rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; }
    .kpi-card-rosa .kpi-val { color: #ffffff; font-size: 1.8rem; font-weight: 900; margin-top: 4px; }
    .kpi-card-rosa .kpi-sub { color: #ffe6ed; font-size: 0.8rem; font-weight: 700; margin-top: 4px; }

    /* Customização das Abas */
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px;
        background-color: #002a3a;
        padding: 8px 12px;
        border-radius: 12px;
        border: 1px solid rgba(0, 227, 230, 0.2);
    }

    .stTabs [data-baseweb="tab"] {
        height: 44px;
        white-space: pre-wrap;
        border-radius: 8px;
        color: #d9fbff;
        font-weight: 600;
        font-size: 0.88rem;
        padding: 0 16px;
    }

    .stTabs [aria-selected="true"] {
        background-color: #00e3e6 !important;
        color: #002a3a !important;
        font-weight: 800 !important;
    }

    /* Modais Pop-up */
    .modal-box {
        background-color: #002a3a;
        border: 1px solid #00e3e6;
        border-radius: 14px;
        padding: 20px;
        margin-top: 10px;
    }
    </style>
    """, unsafe_allow_html=True)
