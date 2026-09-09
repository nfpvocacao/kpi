import os
import pandas as pd

def inspect_mapa_tab():
    nfp_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    mapa_path = os.path.join(nfp_dir, "2025-01-01 Mapa Automatizacoes.xlsx")
    
    df = pd.read_excel(mapa_path, sheet_name="Mapa")
    print(f"Colunas brutas da aba Mapa: {list(df.columns)}")
    print(f"Tamanho total da aba Mapa: {len(df)}")
    print("\nPrimeiras 3 linhas:")
    print(df.head(3).to_dict('records'))
    print("\nÚltimas 3 linhas:")
    print(df.tail(3).to_dict('records'))

if __name__ == "__main__":
    inspect_mapa_tab()
