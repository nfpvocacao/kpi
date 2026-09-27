import os
import re
import requests
import json

# Configurações do Supabase extraídas do .env
SUPABASE_URL = "https://qodhmytsayifaduwgtwu.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZGhteXRzYXlpZmFkdXdndHd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwODgyMzAsImV4cCI6MjEwNTY2NDIzMH0.5iqQwlIhqeglanWcLgZZ7kS9IqMQv3_GirJNccLZEa8"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates"
}

def clean_val(v):
    v = v.strip()
    if v.upper() == 'NULL':
        return None
    if v.startswith("'") and v.endswith("'"):
        return v[1:-1].replace("''", "'").replace("\\'", "'")
    try:
        if '.' in v:
            return float(v)
        return int(v)
    except ValueError:
        return v

def upload_to_supabase(table_name, records_batch):
    url = f"{SUPABASE_URL}/rest/v1/{table_name}"
    resp = requests.post(url, headers=HEADERS, data=json.dumps(records_batch))
    if resp.status_code not in (200, 201):
        print(f"Erro ao enviar para {table_name}: status {resp.status_code} - {resp.text[:200]}")
        return False
    return True

def sync_empresas():
    sql_path = "nfp_empresas.sql"
    if not os.path.exists(sql_path):
        print(f"Arquivo {sql_path} não encontrado.")
        return

    print("--- Sincronizando nfp_empresas ---")
    with open(sql_path, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()

    records = []
    for line in lines:
        if line.startswith("INSERT INTO `nfp_empresas`"):
            start = line.find("VALUES (") + 8
            end = line.rfind(");")
            if start > 7 and end > start:
                vals_str = line[start:end]
                parts = []
                in_quote = False
                curr = []
                for char in vals_str:
                    if char == "'" and (len(curr) == 0 or curr[-1] != '\\'):
                        in_quote = not in_quote
                        curr.append(char)
                    elif char == ',' and not in_quote:
                        parts.append(''.join(curr))
                        curr = []
                    else:
                        curr.append(char)
                if curr:
                    parts.append(''.join(curr))

                cleaned = [clean_val(p) for p in parts]
                if len(cleaned) >= 22:
                    rec = {
                        "cnpj": cleaned[0],
                        "tipo": cleaned[1],
                        "empresa": cleaned[2],
                        "fantasia": cleaned[3],
                        "cupons": cleaned[4],
                        "val_nf": cleaned[5],
                        "val_credito": cleaned[6],
                        "cota_cupons": cleaned[7],
                        "vl_cupom_alvo": cleaned[8],
                        "logradouro": cleaned[9],
                        "numero": cleaned[10],
                        "complemento": cleaned[11],
                        "bairro": cleaned[12],
                        "cidade": cleaned[13],
                        "uf": cleaned[14],
                        "cep": cleaned[15],
                        "obs": cleaned[16],
                        "telefone": cleaned[17],
                        "email": cleaned[18],
                        "urna": cleaned[19],
                        "id_vendedor": cleaned[20],
                        "id_status": cleaned[21]
                    }
                    records.append(rec)

    print(f"Total de empresas parsed: {len(records)}")
    
    batch_size = 300
    for i in range(0, len(records), batch_size):
        batch = records[i:i+batch_size]
        success = upload_to_supabase("nfp_empresas", batch)
        if success:
            print(f"Enviado lote {i} a {i+len(batch)} empresas...")
        else:
            print(f"Falha no lote {i}")

def sync_doadores():
    sql_path = "nfp_doadores.sql"
    if not os.path.exists(sql_path):
        print(f"Arquivo {sql_path} não encontrado.")
        return

    print("--- Sincronizando nfp_doadores ---")
    with open(sql_path, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()

    records = []
    for line in lines:
        if line.startswith("INSERT INTO `nfp_doadores`"):
            start = line.find("VALUES (") + 8
            end = line.rfind(");")
            if start > 7 and end > start:
                vals_str = line[start:end]
                parts = []
                in_quote = False
                curr = []
                for char in vals_str:
                    if char == "'" and (len(curr) == 0 or curr[-1] != '\\'):
                        in_quote = not in_quote
                        curr.append(char)
                    elif char == ',' and not in_quote:
                        parts.append(''.join(curr))
                        curr = []
                    else:
                        curr.append(char)
                if curr:
                    parts.append(''.join(curr))

                cleaned = [clean_val(p) for p in parts]
                if len(cleaned) >= 10:
                    rec = {
                        "cpf": cleaned[0],
                        "doador": cleaned[1],
                        "ligacao": cleaned[2],
                        "id_bitrix": cleaned[3],
                        "id_bitrix_indicacao": cleaned[4],
                        "id_pessoa_responsavel": cleaned[5],
                        "data_nascimento": cleaned[6],
                        "cpf_indicacao": cleaned[7],
                        "data_indicacao": cleaned[8],
                        "celular": cleaned[9]
                    }
                    records.append(rec)

    print(f"Total de doadores parsed: {len(records)}")
    
    batch_size = 300
    for i in range(0, len(records), batch_size):
        batch = records[i:i+batch_size]
        success = upload_to_supabase("nfp_doadores", batch)
        if success:
            print(f"Enviado lote {i} a {i+len(batch)} doadores...")
        else:
            print(f"Falha no lote {i}")

if __name__ == "__main__":
    print("Script de sincronização de Dumps para o Supabase iniciado.")
    sync_empresas()
    sync_doadores()
    print("Sincronização concluída.")
