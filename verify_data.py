import sqlite3
import pandas as pd
import os

def check_mapa_data():
    conn = sqlite3.connect("nfp_database.db")
    
    # 1. Mostrar registros de 2018 na tabela vocacao_mapa_interno
    print("=== REGISTROS DE 2018 NO BANCO (vocacao_mapa_interno) ===")
    df_2018 = pd.read_sql_query("""
        SELECT mes, doadores_plenos, doadores_restritos, total_doadores, qtde_cupons, val_nf, ticket_medio, aut_cred
        FROM vocacao_mapa_interno
        WHERE mes LIKE '2018%'
        LIMIT 5
    """, conn)
    print(df_2018)
    
    # 2. Mostrar o registro específico de 2023-01-01 na planilha original
    print("\n=== VALORES DE JANEIRO/2023 DIRETAMENTE DA PLANILHA ORIGINAL (Aba Mapa) ===")
    nfp_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    mapa_path = os.path.join(nfp_dir, "2025-01-01 Mapa Automatizacoes.xlsx")
    df_excel = pd.read_excel(mapa_path, sheet_name="Mapa")
    df_excel['mes_clean'] = pd.to_datetime(df_excel['Mês'])
    row_excel = df_excel[df_excel['mes_clean'] == '2023-01-01']
    if len(row_excel) > 0:
        print(row_excel[['Mês', 'Doadores Plenos', 'Doadores Restritos', 'Total Doadores', 'Qtde Cupons', 'Val NF', 'Ticket médio', 'AUTCred']].to_dict('records'))
    else:
        print("Mês 2023-01-01 não encontrado na aba Mapa do Excel.")
        
    conn.close()

if __name__ == "__main__":
    check_mapa_data()
