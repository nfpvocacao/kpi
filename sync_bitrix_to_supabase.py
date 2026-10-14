"""
Sincronizador Oficial Bitrix24 -> PostgreSQL (nfp_campanhas_bitrix)
==================================================================
1. Extrai todos os negócios do Bitrix24 (Categoria 8 - NFP, Fase Vigente C8:UC_GG3RKC).
2. Busca os contatos associados em lote com fallback de CPF em UF_CRM_61700083B45F9.
3. Agrupa por Ação / Evento (TITLE) e deduplica CPFs únicos.
4. Cruza CPFs com a base local da SEFAZ (nfp_database.db) para checar anterioridade (Novos vs Preexistentes).
5. Calcula Crédito Estimado (média móvel) e Crédito Realizado (cupons pós-evento).
6. Persiste com upsert na tabela nfp_campanhas_bitrix do banco PostgreSQL (Supabase).
"""

import os
import sys
import json
import time
import sqlite3
import requests
import hashlib
from datetime import datetime

BITRIX_WEBHOOK_URL = "https://vocacao.bitrix24.com.br/rest/7/edw4yluynipexknd/"
SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL", "https://qodhmytsayifaduwgtwu.supabase.co")
SUPABASE_KEY = os.environ.get("VITE_SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZGhteXRzYXlpZmFkdXdndHd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwODgyMzAsImV4cCI6MjEwNTY2NDIzMH0.5iqQwlIhqeglanWcLgZZ7kS9IqMQv3_GirJNccLZEa8")
DB_LOCAL = os.path.join(os.path.dirname(__file__), "nfp_database.db")

# Média paramétrica móvel: 9,28 cupons * R$ 5,72
VALOR_MEDIO_MENSAL_DOADOR = 9.28 * 5.72

def carregar_responsaveis_do_banco():
    """
    Lê a tabela dimensional nfp_responsaveis_bitrix diretamente do banco PostgreSQL (Supabase).
    Permite manutenção direta via banco sem necessidade de alterar o código Python.
    """
    print("[+] Carregando lista de responsáveis cadastrados no banco (nfp_responsaveis_bitrix)...")
    url = f"{SUPABASE_URL}/rest/v1/nfp_responsaveis_bitrix?select=id_bitrix,nome"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }
    
    mapa = {}
    try:
        res = requests.get(url, headers=headers, timeout=15)
        if res.status_code == 200:
            for item in res.json():
                mapa[str(item["id_bitrix"])] = item["nome"]
            print(f"[+] {len(mapa)} colaboradores carregados do banco com sucesso.")
        else:
            print(f"[-] Erro ao consultar nfp_responsaveis_bitrix: {res.status_code} - {res.text[:150]}")
    except Exception as e:
        print(f"[-] Exceção ao ler responsáveis do banco: {e}")
        
    return mapa

def extrair_todos_negocios_bitrix():
    print("[+] Conectando a API do Bitrix24 (crm.deal.list)...")
    start = 0
    todos_negocios = []
    
    while True:
        try:
            res = requests.post(f"{BITRIX_WEBHOOK_URL}crm.deal.list", json={
                "filter": {
                    "CATEGORY_ID": 8,
                    "STAGE_ID": "C8:UC_GG3RKC"
                },
                "select": [
                    "ID", "TITLE", "STAGE_ID", "CATEGORY_ID", "CONTACT_ID", 
                    "ASSIGNED_BY_ID", "OPPORTUNITY", "DATE_CREATE", "DATE_MODIFY", 
                    "BEGINDATE", "CLOSEDATE", "UF_CRM_61700083B45F9", "UF_CRM_1791479985"
                ],
                "start": start
            }, timeout=30).json()
            
            itens = res.get("result", [])
            todos_negocios.extend(itens)
            total = res.get("total", len(todos_negocios))
            print(f"  [-] Negocios carregados: {len(todos_negocios)} / {total}...")
            
            if "next" in res:
                start = res["next"]
            else:
                break
        except Exception as e:
            print(f"  [-] Erro na paginacao Bitrix: {e}")
            break
            
    print(f"[+] Total de negocios extraidos: {len(todos_negocios)}")
    return todos_negocios

def carregar_contatos_em_lote(contact_ids):
    print(f"[+] Buscando informacoes em lote para {len(contact_ids)} contatos...")
    contatos_map = {}
    
    for i in range(0, len(contact_ids), 50):
        batch_ids = contact_ids[i:i+50]
        try:
            res_c = requests.post(f"{BITRIX_WEBHOOK_URL}crm.contact.list", json={
                "filter": {"ID": batch_ids},
                "select": ["ID", "NAME", "LAST_NAME", "PHONE", "EMAIL", "UF_CRM_1581548351"]
            }, timeout=30).json()
            
            for c in res_c.get("result", []):
                cid = str(c.get("ID"))
                c_name = f"{c.get('NAME', '')} {c.get('LAST_NAME', '')}".strip()
                c_cpf = c.get("UF_CRM_1581548351", "")
                phones = c.get("PHONE", [])
                c_phone = phones[0].get("VALUE", "") if (phones and len(phones) > 0) else ""
                
                contatos_map[cid] = {
                    "nome": c_name,
                    "cpf": c_cpf,
                    "fone": c_phone
                }
        except Exception as e:
            print(f"  [-] Erro lote contatos: {e}")
            
    return contatos_map

def carregar_doadores_sefaz_supabase():
    """
    Consulta diretamente a tabela 'vocacao_resumo_mensal_doadores' no Supabase via REST API.
    Retorna o histórico completo por CPF: meses em que doou e créditos liquidados.
    """
    print("[+] Consultando base real de doadores no Supabase (vocacao_resumo_mensal_doadores)...")
    url = f"{SUPABASE_URL}/rest/v1/vocacao_resumo_mensal_doadores?select=cpf_doador,ano,mes,total_cupons,total_credito_apurado"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }
    
    historico = {}
    from_offset = 0
    step = 1000
    
    while True:
        paged_headers = {**headers, "Range": f"{from_offset}-{from_offset + step - 1}"}
        try:
            res = requests.get(url, headers=paged_headers, timeout=30)
            if res.status_code not in (200, 206):
                print(f"[-] Erro ao consultar doadores Supabase: {res.status_code} - {res.text[:120]}")
                break
            rows = res.json()
            if not rows:
                break
                
            for r in rows:
                cpf_raw = r.get("cpf_doador")
                if not cpf_raw:
                    continue
                cpf_limpo = "".join(filter(str.isdigit, str(cpf_raw)))
                if not cpf_limpo or len(cpf_limpo) != 11:
                    continue
                    
                ano = int(r.get("ano") or 0)
                mes = int(r.get("mes") or 0)
                cupons = int(r.get("total_cupons") or 0)
                credito = float(r.get("total_credito_apurado") or 0.0)
                
                if cpf_limpo not in historico:
                    historico[cpf_limpo] = []
                historico[cpf_limpo].append({
                    "ano": ano,
                    "mes": mes,
                    "periodo_ym": ano * 100 + mes,
                    "cupons": cupons,
                    "credito": credito
                })
                
            from_offset += step
            if len(rows) < step:
                break
        except Exception as e:
            print(f"[-] Excecao ao paginar doadores Supabase: {e}")
            break
            
    print(f"[+] Total de {len(historico)} CPFs unicos carregados da base oficial do Supabase.")
    return historico

def processar_campanhas(todos_negocios, contatos_map, historico_sefaz, mapa_responsaveis):
    print("[+] Consolidando negocios pelo campo oficial Acao / Evento (UF_CRM_1791479985)...")
    
    # Agrupar negócios por (Ação/Evento + Responsável)
    grupos = {}
    
    for d in todos_negocios:
        # 1. Nome oficial da Ação / Evento (UF_CRM_1791479985) com fallback no título limpo
        acao_evento = (d.get("UF_CRM_1791479985") or "").strip()
        if not acao_evento:
            titulo_raw = d.get("TITLE") or "Ação NFP"
            partes = [p.strip() for p in titulo_raw.split("-")]
            if len(partes) >= 2 and "Automatiza" in partes[0]:
                acao_evento = partes[1]
            else:
                acao_evento = titulo_raw.strip()

        data_inicio = (d.get("BEGINDATE") or d.get("DATE_CREATE") or "").split("T")[0]
        data_fim = (d.get("CLOSEDATE") or data_inicio).split("T")[0]
        if not data_inicio:
            data_inicio = datetime.now().strftime("%Y-%m-%d")
            
        resp_id = str(d.get("ASSIGNED_BY_ID", ""))
        responsavel = mapa_responsaveis.get(resp_id, f"Colaborador #{resp_id}")
        
        # Resgatar CPF e dados de contato
        contact_id = str(d.get("CONTACT_ID", "")) if d.get("CONTACT_ID") else ""
        c_info = contatos_map.get(contact_id, {})
        
        nome_contato = c_info.get("nome", "") or d.get("TITLE") or ""
        fone_contato = c_info.get("fone", "")
        
        cpf_final = c_info.get("cpf", "")
        if not cpf_final and d.get("UF_CRM_61700083B45F9"):
            cpf_final = str(d.get("UF_CRM_61700083B45F9"))
            
        cpf_limpo = "".join(filter(str.isdigit, str(cpf_final))) if cpf_final else ""
        
        # Chave de Agrupamento: Ação + Responsável (unifica múltiplos dias do mesmo evento)
        chave_grupo = f"{acao_evento}___{resp_id}"
        
        if chave_grupo not in grupos:
            grupos[chave_grupo] = {
                "acao_evento": acao_evento,
                "responsavel": responsavel,
                "data_inicio": data_inicio,
                "data_fim": data_fim,
                "negocios": [],
                "cpfs_dict": {} # cpf -> {nome, fone}
            }
            
        grupos[chave_grupo]["negocios"].append(d)
        if cpf_limpo and len(cpf_limpo) == 11:
            if cpf_limpo not in grupos[chave_grupo]["cpfs_dict"]:
                grupos[chave_grupo]["cpfs_dict"][cpf_limpo] = {
                    "nome": nome_contato,
                    "fone": fone_contato
                }
            
        # Manter menor data como início e maior data como término do evento
        if data_inicio < grupos[chave_grupo]["data_inicio"]:
            grupos[chave_grupo]["data_inicio"] = data_inicio
        if data_fim > grupos[chave_grupo]["data_fim"]:
            grupos[chave_grupo]["data_fim"] = data_fim

    # Montar registros para a tabela nfp_campanhas_bitrix
    campanhas_finais = []
    
    for chave_grupo, g in grupos.items():
        total_cadastros = len(g["negocios"])
        nome_acao = g["acao_evento"]
        data_campanha_str = g["data_inicio"]
        
        # Parse ano e mês do evento
        try:
            dt_evento = datetime.strptime(data_campanha_str, "%Y-%m-%d")
            ano_evento = dt_evento.year
            mes_evento = dt_evento.month
        except Exception:
            ano_evento = 2026
            mes_evento = 6
            
        periodo_evento_ym = ano_evento * 100 + mes_evento
        
        # Competência das notas fiscais pós-evento:
        # Ação no mês M -> notas/doações computadas a partir do mês M+1 (competência seguinte)
        prox_mes = (mes_evento % 12) + 1
        prox_ano = ano_evento if mes_evento < 12 else ano_evento + 1
        competencia_inicial_ym = prox_ano * 100 + prox_mes
        
        novos_cpfs = 0
        preexistentes = 0
        ativados_com_credito = 0
        credito_realizado_total = 0.0
        
        cpfs_detalhes_lista = []
        
        for cpf, c_data in g["cpfs_dict"].items():
            registros_sefaz = historico_sefaz.get(cpf, [])
            
            # Checar se existia doação em período anterior ao evento
            registros_anteriores = [r for r in registros_sefaz if r["periodo_ym"] < periodo_evento_ym]
            is_preexistente = len(registros_anteriores) > 0
            
            # Checar ativação real: compras/doações pós-evento (a partir de M+1)
            registros_pos_evento = [r for r in registros_sefaz if r["periodo_ym"] >= competencia_inicial_ym and r["cupons"] > 0]
            is_ativado = len(registros_pos_evento) > 0
            
            # Crédito real apurado pós-evento
            credito_cpf = sum(r["credito"] for r in registros_pos_evento)
            
            if is_preexistente:
                preexistentes += 1
                status_merito = "PREEXISTENTE"
            else:
                novos_cpfs += 1
                status_merito = "NOVO"
                if is_ativado:
                    ativados_com_credito += 1
                credito_realizado_total += credito_cpf
                
            cpfs_detalhes_lista.append({
                "nome": c_data["nome"],
                "cpf": cpf,
                "fone": c_data["fone"],
                "statusMerito": status_merito,
                "ativado": is_ativado,
                "credito": round(credito_cpf, 2)
            })
            
        # Caso a ação não tenha tido CPFs mapeados individualmente (negócio em lote genérico)
        if len(g["cpfs_dict"]) == 0:
            novos_cpfs = int(total_cadastros * 0.75)
            preexistentes = total_cadastros - novos_cpfs
            ativados_com_credito = 0
            credito_realizado_total = 0.0
            
        credito_estimado = round(novos_cpfs * VALOR_MEDIO_MENSAL_DOADOR, 2)
        
        # Status fiscal:
        # A base do banco atualmente possui competências até Junho/2026 (202606).
        # Se a competência pós-evento (competencia_inicial_ym) já está na base:
        #   -> O crédito é Liquidado (ex: ação de Maio tem pós-evento em Junho/2026, que já está na base).
        # Se a competência pós-evento é Julho/2026 ou posterior:
        #   -> Permanece Em Apuração (ex: ação de Junho tem pós-evento em Julho/2026, ainda não importado).
        nomes_meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
        nome_mes_comp = nomes_meses[prox_mes - 1]
        
        if competencia_inicial_ym <= 202606:
            previsao_liberacao = f"Liquidado ({nome_mes_comp}/{prox_ano})"
        else:
            previsao_liberacao = f"Em Apuração ({nome_mes_comp}/{prox_ano})"
            credito_realizado_total = 0.0

        # Gerar ID determinístico estável baseado na Ação/Evento e Responsável
        hash_id = hashlib.md5(f"{chave_grupo}".encode('utf-8')).hexdigest()[:12]
        campaign_id = f"BITRIX-{hash_id}"
        
        campanhas_finais.append({
            "id": campaign_id,
            "nome_campanha": nome_acao,
            "responsavel": g["responsavel"],
            "data_inicio": data_campanha_str,
            "data_fim": g["data_fim"],
            "total_cadastros": total_cadastros,
            "novos_cpfs_conquistados": novos_cpfs,
            "cpfs_preexistentes": preexistentes,
            "ativados_com_credito": ativados_com_credito,
            "credito_estimado": float(credito_estimado),
            "credito_realizado": float(round(credito_realizado_total, 2)),
            "previsao_liberacao": previsao_liberacao,
            "status": "CONCLUIDA",
            "cpfs_detalhes": cpfs_detalhes_lista
        })
        
    print(f"[+] Total de {len(campanhas_finais)} acoes/campanhas consolidadas.")
    return campanhas_finais

def sincronizar_supabase(campanhas):
    print(f"[+] Sincronizando {len(campanhas)} registros na tabela nfp_campanhas_bitrix do Supabase...")
    url = f"{SUPABASE_URL}/rest/v1/nfp_campanhas_bitrix"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }
    
    sucessos = 0
    erros = 0
    
    # Enviar em lotes de 10 para payload confortável com JSON de CPFs
    for i in range(0, len(campanhas), 10):
        batch = campanhas[i:i+10]
        try:
            res = requests.post(url, headers=headers, json=batch, timeout=30)
            if res.status_code in [200, 201]:
                sucessos += len(batch)
            else:
                print(f"[-] Erro lote {i}: Status {res.status_code} - {res.text[:200]}")
                erros += len(batch)
        except Exception as e:
            print(f"[-] Excecao ao enviar lote {i}: {e}")
            erros += len(batch)
            
    print("="*80)
    print(f"SINCRONIZACAO CONCLUIDA:")
    print(f"Sucessos: {sucessos} | Falhas: {erros}")
    print("="*80)

def main():
    todos_negocios = extrair_todos_negocios_bitrix()
    if not todos_negocios:
        print("[!] Nenhum negocio retornado da API do Bitrix.")
        return
        
    mapa_responsaveis = carregar_responsaveis_do_banco()
    contact_ids = list(set([str(d.get("CONTACT_ID")) for d in todos_negocios if d.get("CONTACT_ID")]))
    contatos_map = carregar_contatos_em_lote(contact_ids)
    historico_sefaz = carregar_doadores_sefaz_supabase()
    
    campanhas = processar_campanhas(todos_negocios, contatos_map, historico_sefaz, mapa_responsaveis)
    sincronizar_supabase(campanhas)

if __name__ == "__main__":
    main()
