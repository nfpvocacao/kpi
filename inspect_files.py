import os
import pandas as pd

def compare_2022_data(nfp_dir):
    vocacao_cnpj = "61750246000175"
    
    # 1. Carregar Valores distribuídos
    valores_path = os.path.join(nfp_dir, "Valores distribuídos a entidades pelo Programa NFP (1).xlsx")
    df_valores_list = []
    if os.path.exists(valores_path):
        xl = pd.ExcelFile(valores_path)
        for sheet in xl.sheet_names:
            # Pegar meses de 2022
            parts = sheet.split(".")
            if len(parts) == 2 and parts[1] == "2022":
                m = int(parts[0])
                df = pd.read_excel(valores_path, sheet_name=sheet, skiprows=11)
                df.columns = [str(c).replace('\n', ' ').strip() for c in df.columns]
                df['cnpj_clean'] = df['CNPJ Entidade'].apply(lambda x: "".join([c for c in str(x).split(".")[0] if c.isdigit()]).zfill(14))
                df_voc = df[df['cnpj_clean'] == vocacao_cnpj]
                if len(df_voc) > 0:
                    df_valores_list.append({
                        'Mes': m,
                        'QtdDocs_Valores': df_voc['Qtd. Docs. Fiscais (c)'].values[0],
                        'CredDist_Valores': df_voc['Créditos Distribuídos (d) (1)'].values[0],
                        'CredDoa_Valores': df_voc['Créditos Doados (e) (2)'].values[0],
                        'Sorteios_Valores': df_voc['Prêmios de Sorteio (f) (3)'].values[0],
                        'Total_Valores': df_voc['Total (g) (4) = (1) + (2) + (3)'].values[0]
                    })
    df_valores_2022 = pd.DataFrame(df_valores_list).sort_values('Mes')
    
    # 2. Carregar Mapa Consolidado
    mapa_path = os.path.join(nfp_dir, "2025-01-01 Mapa Automatizacoes.xlsx")
    df_mapa_voc = pd.DataFrame()
    if os.path.exists(mapa_path):
        df_mapa = pd.read_excel(mapa_path, sheet_name="Consolidado")
        df_mapa_voc = df_mapa[df_mapa['AnoEms'] == 2022].sort_values('MesEms').copy()
        
    print("\n" + "="*110)
    print("COMPARAÇÃO DE TOTAIS EM 2022: VALORES DISTRIBUÍDOS VS CONSOLIDADO DO MAPA")
    print("="*110)
    
    for m in range(1, 13):
        row_val = df_valores_2022[df_valores_2022['Mes'] == m]
        row_map = df_mapa_voc[df_mapa_voc['MesEms'] == m]
        
        val_docs = row_val['QtdDocs_Valores'].values[0] if len(row_val) > 0 else "N/A"
        map_docs = row_map['TTCupons'].values[0] if len(row_map) > 0 else "N/A"
        
        val_total = row_val['Total_Valores'].values[0] if len(row_val) > 0 else "N/A"
        # TTCreditos no Mapa
        map_cred = row_map['TTCreditos'].values[0] if len(row_map) > 0 else "N/A"
        
        print(f"Mês {m:<2} | Docs: Valores={str(val_docs):<8} vs Mapa={str(map_docs):<8} | Financeiro: Valores Total={str(val_total):<10} vs Mapa TTCreditos={str(map_cred):<10}")

if __name__ == "__main__":
    nfp_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    compare_2022_data(nfp_dir)
