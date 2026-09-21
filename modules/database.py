import os
import sys
import sqlite3
import pandas as pd
import streamlit as st

def get_db_connection():
    db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "nfp_database.db")
    return sqlite3.connect(db_path)

def ensure_database_ready():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    db_path = os.path.join(root_dir, "nfp_database.db")
    
    # Se o arquivo for menor que 1KB (LFS pointer ou corrompido), remove para reconstrução limpa
    if os.path.exists(db_path) and os.path.getsize(db_path) < 1000:
        try:
            os.remove(db_path)
        except Exception:
            pass

    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='vocacao_consolidado_interno'")
        row = cur.fetchone()
        if not row:
            if root_dir not in sys.path:
                sys.path.append(root_dir)
            from etl_import import setup_database, sync_kpi_tables_from_mysql
            setup_database(conn)
            try:
                sync_kpi_tables_from_mysql(conn, ano=2026, mes=5)
            except Exception:
                pass
    except Exception:
        try:
            conn.close()
            if os.path.exists(db_path):
                os.remove(db_path)
            conn = get_db_connection()
            if root_dir not in sys.path:
                sys.path.append(root_dir)
            from etl_import import setup_database, sync_kpi_tables_from_mysql
            setup_database(conn)
            try:
                sync_kpi_tables_from_mysql(conn, ano=2026, mes=5)
            except Exception:
                pass
        except Exception:
            pass
    finally:
        try:
            conn.close()
        except Exception:
            pass

# Carregar dados do consolidado mensal
@st.cache_data(ttl=600)
def load_vocacao_consolidado():
    ensure_database_ready()
    conn = get_db_connection()
    try:
        df = pd.read_sql_query("SELECT * FROM vocacao_consolidado_interno ORDER BY ano_mes ASC", conn)
    except Exception:
        conn.close()
        return pd.DataFrame()
    conn.close()
    
    if len(df) == 0:
        return pd.DataFrame()
        
    df['ano'] = df['ano_mes'] // 100
    df['mes'] = df['ano_mes'] % 100
    df = df[(df['ano'] >= 2000) & (df['ano'] <= 2100) & (df['mes'] >= 1) & (df['mes'] <= 12)].copy()
    if len(df) > 0:
        df['data'] = pd.to_datetime(df.apply(lambda r: f"{int(r['ano'])}-{int(r['mes']):02d}-01", axis=1))
    return df

# Carregar mapa regional
@st.cache_data(ttl=600)
def load_vocacao_mapa():
    ensure_database_ready()
    conn = get_db_connection()
    try:
        df = pd.read_sql_query("SELECT * FROM vocacao_mapa_interno ORDER BY mes ASC", conn)
    except Exception:
        conn.close()
        return pd.DataFrame()
    conn.close()
    if len(df) > 0:
        df['data'] = pd.to_datetime(df['mes'])
    return df

# Carregar resumo por empresas parceiras
@st.cache_data(ttl=600)
def load_vocacao_empresas():
    ensure_database_ready()
    conn = get_db_connection()
    try:
        df = pd.read_sql_query("SELECT * FROM vocacao_resumo_mensal_empresas ORDER BY total_credito_apurado DESC", conn)
    except Exception:
        df = pd.DataFrame()
    conn.close()
    return df

# Carregar resumo por doadores reais (PF)
@st.cache_data(ttl=600)
def load_vocacao_doadores():
    ensure_database_ready()
    conn = get_db_connection()
    try:
        df = pd.read_sql_query("SELECT * FROM vocacao_resumo_mensal_doadores ORDER BY total_credito_apurado DESC", conn)
    except Exception:
        df = pd.DataFrame()
    conn.close()
    return df

# Carregar resumo por doador / estabelecimento loja
@st.cache_data(ttl=600)
def load_vocacao_doador_loja():
    ensure_database_ready()
    conn = get_db_connection()
    try:
        df = pd.read_sql_query("SELECT * FROM vocacao_doador_estabelecimento_mensal ORDER BY total_credito_apurado DESC", conn)
    except Exception:
        df = pd.DataFrame()
    conn.close()
    return df

# Carregar dados de benchmarking estadual
@st.cache_data(ttl=600)
def get_benchmarking_data(target_date="2023-01-01"):
    ensure_database_ready()
    conn = get_db_connection()
    try:
        df_state = pd.read_sql_query(f"""
            SELECT 
                cnpj, 
                razao_social, 
                municipio, 
                area_atuacao,
                qtd_docs,
                cred_distribuidos,
                cred_doados,
                premios_sorteio,
                total
            FROM historico_distribuicao
            JOIN entidades USING(cnpj)
            WHERE mes_referencia = '{target_date}' AND area_atuacao = 'Assistência Social'
            ORDER BY total DESC
        """, conn)
    except Exception:
        df_state = pd.DataFrame()
    conn.close()
    return df_state
