import os
import pandas as pd
import sqlite3
import glob
import re

DB_NAME = "nfp_database.db"

def get_db_connection():
    return sqlite3.connect(DB_NAME)

def clean_cnpj(val):
    if pd.isna(val):
        return None
    s = str(val).strip()
    if s.endswith(".0"):
        s = s[:-2]
    s = re.sub(r'\D', '', s)
    if not s:
        return None
    return s.zfill(14)

def parse_mes_ref(val):
    """
    Tenta analisar a coluna de mês de referência para retornar string YYYY-MM-DD
    """
    if pd.isna(val):
        return None
    try:
        dt = pd.to_datetime(val)
        return dt.strftime("%Y-%m-%d")
    except Exception:
        # Se for string formatada ex: "01/2023" ou "202301"
        s = str(val).strip()
        s = re.sub(r'\D', '', s)
        if len(s) == 6:
            # Assumir YYYYMM ou MMYYYY
            if int(s[:4]) >= 2000: # YYYYMM
                return f"{s[:4]}-{s[4:6]}-01"
            else: # MMYYYY
                return f"{s[2:6]}-{s[:2]}-01"
        return s

def setup_database(conn):
    cursor = conn.cursor()
    
    print("Criando tabelas no banco de dados...")
    
    # 1. Tabela de Entidades
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS entidades (
        cnpj TEXT PRIMARY KEY,
        razao_social TEXT,
        area_atuacao TEXT,
        municipio TEXT,
        status TEXT
    )
    """)
    
    # 2. Tabela de Histórico Detalhado (Arquivos Anuais)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS historico_detalhado (
        cnpj TEXT,
        ano_mes INTEGER,
        cred_consumo_proprio REAL,
        cred_cadastro_entidade REAL,
        cred_cadastro_consumidor REAL,
        cred_doacao_automatica REAL,
        docs_consumo_proprio INTEGER,
        docs_cadastro_entidade INTEGER,
        docs_cadastro_consumidor INTEGER,
        docs_doacao_automatica INTEGER,
        PRIMARY KEY (cnpj, ano_mes),
        FOREIGN KEY (cnpj) REFERENCES entidades(cnpj)
    )
    """)
    
    # 3. Tabela de Histórico Distribuição (Valores Distribuídos)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS historico_distribuicao (
        cnpj TEXT,
        mes_referencia TEXT,
        n_sorteio INTEGER,
        qtd_docs INTEGER,
        cred_distribuidos REAL,
        cred_doados REAL,
        premios_sorteio REAL,
        total REAL,
        PRIMARY KEY (cnpj, mes_referencia),
        FOREIGN KEY (cnpj) REFERENCES entidades(cnpj)
    )
    """)
    
    # 4. Tabela de Histórico Interno Vocação (Aba Consolidado)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS vocacao_consolidado_interno (
        ano_mes INTEGER PRIMARY KEY,
        total_empresas INTEGER,
        tt_cupons INTEGER,
        tt_val_nf REAL,
        tt_creditos REAL,
        ret_percent REAL,
        cad_empr INTEGER,
        cad_cup INTEGER,
        cad_nf REAL,
        cad_cred REAL,
        cad_ret REAL,
        doa_empr INTEGER,
        doa_cup INTEGER,
        doa_nf REAL,
        doa_cred REAL,
        doa_ret REAL,
        aut_empr INTEGER,
        aut_cup INTEGER,
        aut_nf REAL,
        aut_cred REAL,
        aut_ret REAL,
        cons_empr INTEGER,
        cons_cup INTEGER,
        cons_nf REAL,
        cons_cred REAL,
        cons_ret REAL
    )
    """)
    
    # 5. Tabela de Indicadores Mensais do Mapa (Aba Mapa)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS vocacao_mapa_interno (
        mes TEXT PRIMARY KEY,
        doadores_plenos INTEGER,
        doadores_restritos INTEGER,
        total_doadores INTEGER,
        qtde_cupons INTEGER,
        val_nf REAL,
        ticket_medio REAL,
        aut_empr INTEGER,
        aut_cup INTEGER,
        aut_nf REAL,
        medio REAL,
        aut_cred REAL,
        tx_ret REAL,
        cerd_cupom REAL,
        cup_restri REAL,
        val_restr REAL,
        medio_1 REAL,
        percent_plenos REAL
    )
    """)
    
    conn.commit()
    print("Tabelas criadas com sucesso.")

def import_annual_files(conn, nfp_dir):
    print("\n--- IMPORTANDO ARQUIVOS ANUAIS (2023, 2024, 2025) ---")
    files = glob.glob(os.path.join(nfp_dir, "Créditos e Documentos Entidades *.xlsx"))
    files = [f for f in files if not os.path.basename(f).startswith("~$")]
    
    for f in sorted(files):
        file_name = os.path.basename(f)
        print(f"Lendo {file_name}...")
        
        try:
            df = pd.read_excel(f, sheet_name="Relatório 1")
            
            # Limpar cabeçalhos (remover espaços extras e quebras)
            df.columns = [str(c).replace('\n', ' ').strip() for c in df.columns]
            
            # Ajustar CNPJ
            df['cnpj_clean'] = df['CNPJ Entidade'].apply(clean_cnpj)
            df = df.dropna(subset=['cnpj_clean', 'Mês Emissão Docs'])
            
            # 1. Atualizar Entidades (inserir ou ignorar se já existe)
            print(f"  Atualizando entidades a partir de {file_name}...")
            # Pegar último registro de cada CNPJ para termos o status/nome mais atualizado
            df_entidades = df.sort_values('Mês Emissão Docs').drop_duplicates(subset=['cnpj_clean'], keep='last')
            
            entidades_data = []
            for _, row in df_entidades.iterrows():
                # Corrigir typos comuns no nome se necessário
                name = str(row.get('Nome', '')).strip()
                area = str(row.get(' Tipo', row.get('Tipo', ''))).strip() # espaço antes do nome da coluna é comum
                muni = str(row.get('Município', '')).strip()
                status = str(row.get('Status', '')).strip()
                entidades_data.append((row['cnpj_clean'], name, area, muni, status))
                
            cursor = conn.cursor()
            cursor.executemany("""
            INSERT INTO entidades (cnpj, razao_social, area_atuacao, municipio, status)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(cnpj) DO UPDATE SET
                razao_social = excluded.razao_social,
                area_atuacao = excluded.area_atuacao,
                municipio = excluded.municipio,
                status = excluded.status
            """, entidades_data)
            
            # 2. Inserir Histórico Detalhado
            print(f"  Importando dados históricos de {file_name}...")
            
            # Colunas esperadas no Excel anual (com possíveis typos)
            col_map = {
                'cred_consumo_proprio': 'Créditos Consumo Próprio',
                'cred_cadastro_entidade': 'Créditos Docs Cadastrados Entidade',
                'cred_cadastro_consumidor': 'Créditos Docs Cadastrados Consumidor',
                'cred_doacao_automatica': 'Créditos Doação Automática',
                'docs_consumo_proprio': ' Docs Consumo Próprio', # notar espaço
                'docs_cadastro_entidade': 'Docs Cadastrados Ententidades', # notar typo
                'docs_cadastro_consumidor': 'Docs Cadastrados Consumidor',
                'docs_doacao_automatica': ' Docs Doação Automática' # notar espaço
            }
            
            historico_data = []
            for _, row in df.iterrows():
                cnpj = row['cnpj_clean']
                ano_mes = int(row['Mês Emissão Docs'])
                
                # Buscar valores usando fallback caso a coluna tenha nome ligeiramente diferente
                c_cons = float(row.get(col_map['cred_consumo_proprio'], row.get('Créditos Consumo Próprio', 0.0)))
                c_ent = float(row.get(col_map['cred_cadastro_entidade'], row.get('Créditos Docs Cadastrados Entidade', 0.0)))
                c_cons_don = float(row.get(col_map['cred_cadastro_consumidor'], row.get('Créditos Docs Cadastrados Consumidor', 0.0)))
                c_aut = float(row.get(col_map['cred_doacao_automatica'], row.get('Créditos Doação Automática', 0.0)))
                
                d_cons = int(row.get(col_map['docs_consumo_proprio'], row.get(' Docs Consumo Próprio', row.get('Docs Consumo Próprio', 0))))
                d_ent = int(row.get(col_map['docs_cadastro_entidade'], row.get('Docs Cadastrados Ententidades', row.get('Docs Cadastrados Entidade', 0))))
                d_cons_don = int(row.get(col_map['docs_cadastro_consumidor'], row.get('Docs Cadastrados Consumidor', 0)))
                d_aut = int(row.get(col_map['docs_doacao_automatica'], row.get(' Docs Doação Automática', row.get('Docs Doação Automática', 0))))
                
                historico_data.append((
                    cnpj, ano_mes, c_cons, c_ent, c_cons_don, c_aut,
                    d_cons, d_ent, d_cons_don, d_aut
                ))
                
            cursor.executemany("""
            INSERT INTO historico_detalhado (
                cnpj, ano_mes, cred_consumo_proprio, cred_cadastro_entidade, 
                cred_cadastro_consumidor, cred_doacao_automatica,
                docs_consumo_proprio, docs_cadastro_entidade, 
                docs_cadastro_consumidor, docs_doacao_automatica
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(cnpj, ano_mes) DO UPDATE SET
                cred_consumo_proprio = excluded.cred_consumo_proprio,
                cred_cadastro_entidade = excluded.cred_cadastro_entidade,
                cred_cadastro_consumidor = excluded.cred_cadastro_consumidor,
                cred_doacao_automatica = excluded.cred_doacao_automatica,
                docs_consumo_proprio = excluded.docs_consumo_proprio,
                docs_cadastro_entidade = excluded.docs_cadastro_entidade,
                docs_cadastro_consumidor = excluded.docs_cadastro_consumidor,
                docs_doacao_automatica = excluded.docs_doacao_automatica
            """, historico_data)
            
            conn.commit()
            print(f"  {file_name} importado. Total de linhas: {len(historico_data)}")
            
        except Exception as e:
            print(f"Erro ao importar {file_name}: {e}")

def import_valores_distribuidos(conn, nfp_dir):
    print("\n--- IMPORTANDO HISTÓRICO DE VALORES DISTRIBUÍDOS ---")
    val_path = os.path.join(nfp_dir, "Valores distribuídos a entidades pelo Programa NFP (1).xlsx")
    if not os.path.exists(val_path):
        print("Arquivo de Valores Distribuídos não encontrado.")
        return
        
    try:
        xl = pd.ExcelFile(val_path)
        sheet_names = xl.sheet_names
        print(f"Total de {len(sheet_names)} abas para processar.")
        
        cursor = conn.cursor()
        
        # Processar aba por aba
        for idx, sheet in enumerate(sheet_names):
            print(f"[{idx+1}/{len(sheet_names)}] Lendo aba {sheet}...")
            
            # Ler pulando as primeiras 11 linhas
            df = pd.read_excel(val_path, sheet_name=sheet, skiprows=11)
            
            # Limpar cabeçalhos
            df.columns = [str(c).replace('\n', ' ').strip() for c in df.columns]
            
            if 'CNPJ Entidade' not in df.columns:
                print(f"  Aviso: Aba {sheet} não possui coluna CNPJ Entidade. Pulando.")
                continue
                
            # Limpar CNPJ e filtrar nulos
            df['cnpj_clean'] = df['CNPJ Entidade'].apply(clean_cnpj)
            df = df.dropna(subset=['cnpj_clean'])
            
            # Tratar colunas
            # Mês de referência (às vezes é datetime, às vezes string)
            df['mes_ref_clean'] = df['Mês de Referência (a)'].apply(parse_mes_ref)
            
            dist_data = []
            entidades_update = []
            
            for _, row in df.iterrows():
                cnpj = row['cnpj_clean']
                mes_ref = row['mes_ref_clean']
                
                # Se não conseguiu extrair mês de referência válido, deduzir a partir do nome da aba
                if not mes_ref or len(mes_ref) < 10:
                    parts = sheet.split('.')
                    if len(parts) == 2:
                        mes_ref = f"{parts[1]}-{parts[0]}-01"
                    else:
                        continue # Pular se não der pra resolver a data
                        
                n_sorteio = row.get('Nº Sorteio', 0)
                if pd.isna(n_sorteio): n_sorteio = 0
                else: n_sorteio = int(n_sorteio)
                
                docs = row.get('Qtd. Docs. Fiscais (c)', row.get('Qtd. Docs. Fiscais', 0))
                if pd.isna(docs): docs = 0
                else: docs = int(docs)
                
                c_dist = float(row.get('Créditos Distribuídos (d) (1)', row.get('Créditos Distribuídos (d)\n(1)', row.get('Créditos Distribuídos', 0.0))))
                c_doad = float(row.get('Créditos Doados (e) (2)', row.get('Créditos Doados (e)\n(2)', row.get('Créditos Doados', 0.0))))
                premio = float(row.get('Prêmios de Sorteio (f) (3)', row.get('Prêmios de\nSorteio (f)\n(3)', row.get('Prêmios de Sorteio', 0.0))))
                total = float(row.get('Total (g) (4) = (1) + (2) + (3)', row.get('Total (g)\n(4) = (1) + (2) + (3)', row.get('Total', 0.0))))
                
                dist_data.append((
                    cnpj, mes_ref, n_sorteio, docs, c_dist, c_doad, premio, total
                ))
                
                # Informações cadastrais básicas da entidade
                razao = str(row.get('Razão Social', '')).strip()
                area = str(row.get('Área de Atuação (b)', row.get('Área de Atuação', ''))).strip()
                muni = str(row.get('Município (b)', row.get('Município', ''))).strip()
                entidades_update.append((cnpj, razao, area, muni, "Ativo"))
                
            # Atualizar entidades
            cursor.executemany("""
            INSERT INTO entidades (cnpj, razao_social, area_atuacao, municipio, status)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(cnpj) DO UPDATE SET
                razao_social = COALESCE(NULLIF(razao_social, ''), excluded.razao_social),
                area_atuacao = COALESCE(NULLIF(area_atuacao, ''), excluded.area_atuacao),
                municipio = COALESCE(NULLIF(municipio, ''), excluded.municipio)
            """, [(x[0], x[1], x[2], x[3], x[4]) for x in entidades_update])
            
            # Inserir histórico distribuição
            cursor.executemany("""
            INSERT INTO historico_distribuicao (
                cnpj, mes_ref_clean, n_sorteio, qtd_docs, cred_distribuidos, cred_doados, premios_sorteio, total
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(cnpj, mes_referencia) DO UPDATE SET
                n_sorteio = excluded.n_sorteio,
                qtd_docs = excluded.qtd_docs,
                cred_distribuidos = excluded.cred_distribuidos,
                cred_doados = excluded.cred_doados,
                premios_sorteio = excluded.premios_sorteio,
                total = excluded.total
            """.replace('mes_ref_clean', 'mes_referencia'), dist_data)
            
            conn.commit()
            print(f"  Aba {sheet} importada. Linhas: {len(dist_data)}")
            
    except Exception as e:
        print(f"Erro geral no arquivo de valores distribuídos: {e}")

def import_internal_map(conn, nfp_dir):
    print("\n--- IMPORTANDO PLANILHA DE MAPA INTERNO DA VOCAÇÃO ---")
    mapa_path = os.path.join(nfp_dir, "2025-01-01 Mapa Automatizacoes.xlsx")
    if not os.path.exists(mapa_path):
        print("Arquivo Mapa de Automatizacoes não encontrado.")
        return
        
    try:
        # 1. Importar a aba 'Consolidado'
        print("Lendo aba Consolidado...")
        df_cons = pd.read_excel(mapa_path, sheet_name="Consolidado")
        df_cons = df_cons.dropna(subset=['AnoEms', 'MesEms'])
        
        consolidado_data = []
        for _, row in df_cons.iterrows():
            try:
                # Tenta converter AnoEms e MesEms para inteiros. Se falhar, pula a linha (como cabeçalhos no meio do caminho)
                ano = int(row['AnoEms'])
                mes = int(row['MesEms'])
                
                # Validar limites de data coerentes para evitar ruídos/cabeçalhos extras (como 2026_05 e 7543)
                if not (2000 <= ano <= 2100) or not (1 <= mes <= 12):
                    continue
                    
                ano_mes = (ano * 100) + mes
                
                # Conversores seguros para evitar falhas em dados inconsistentes
                def safe_int(x):
                    try:
                        return int(float(x)) if not pd.isna(x) else 0
                    except:
                        return 0
                        
                def safe_float(x):
                    try:
                        return float(x) if not pd.isna(x) else 0.0
                    except:
                        return 0.0

                empresas = safe_int(row.get('Empresas', 0))
                tt_cup = safe_int(row.get('TTCupons', 0))
                tt_val = safe_float(row.get('TTValNF', 0.0))
                tt_cred = safe_float(row.get('TTCreditos', 0.0))
                ret_p = safe_float(row.get('Ret%', 0.0))
                
                cad_em = safe_int(row.get('CADEmpr', 0))
                cad_cup = safe_int(row.get('CADCup', 0))
                cad_nf = safe_float(row.get('CadNF', 0.0))
                cad_cred = safe_float(row.get('CADCred', 0.0))
                cad_ret = safe_float(row.get('Ret%.1', 0.0))
                
                doa_em = safe_int(row.get('DOAEmpr', 0))
                doa_cup = safe_int(row.get('DOACup', 0))
                doa_nf = safe_float(row.get('DOANF', 0.0))
                doa_cred = safe_float(row.get('DOACred', 0.0))
                doa_ret = safe_float(row.get('Ret%.2', 0.0))
                
                aut_em = safe_int(row.get('AUTEmpr', 0))
                aut_cup = safe_int(row.get('AUTCup', 0))
                aut_nf = safe_float(row.get('AUTNF', 0.0))
                aut_cred = safe_float(row.get('AUTCred', 0.0))
                aut_ret = safe_float(row.get('Unnamed: 21', 0.0))
                
                cons_em = safe_int(row.get('CONSEmpr', 0))
                cons_cup = safe_int(row.get('CONSCup', 0))
                cons_nf = safe_float(row.get('CONSNF', 0.0))
                cons_cred = safe_float(row.get('CONSCred', 0.0))
                cons_ret = safe_float(row.get('Ret%.3', 0.0))
                
                consolidado_data.append((
                    ano_mes, empresas, tt_cup, tt_val, tt_cred, ret_p,
                    cad_em, cad_cup, cad_nf, cad_cred, cad_ret,
                    doa_em, doa_cup, doa_nf, doa_cred, doa_ret,
                    aut_em, aut_cup, aut_nf, aut_cred, aut_ret,
                    cons_em, cons_cup, cons_nf, cons_cred, cons_ret
                ))
            except (ValueError, TypeError):
                # Pular linhas com formatos de ano/mês inválidos
                continue
            
        cursor = conn.cursor()
        cursor.executemany("""
        INSERT INTO vocacao_consolidado_interno (
            ano_mes, total_empresas, tt_cupons, tt_val_nf, tt_creditos, ret_percent,
            cad_empr, cad_cup, cad_nf, cad_cred, cad_ret,
            doa_empr, doa_cup, doa_nf, doa_cred, doa_ret,
            aut_empr, aut_cup, aut_nf, aut_cred, aut_ret,
            cons_empr, cons_cup, cons_nf, cons_cred, cons_ret
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(ano_mes) DO UPDATE SET
            total_empresas = excluded.total_empresas,
            tt_cupons = excluded.tt_cupons,
            tt_val_nf = excluded.tt_val_nf,
            tt_creditos = excluded.tt_creditos,
            ret_percent = excluded.ret_percent,
            cad_empr = excluded.cad_empr,
            cad_cup = excluded.cad_cup,
            cad_nf = excluded.cad_nf,
            cad_cred = excluded.cad_cred,
            cad_ret = excluded.cad_ret,
            doa_empr = excluded.doa_empr,
            doa_cup = excluded.doa_cup,
            doa_nf = excluded.doa_nf,
            doa_cred = excluded.doa_cred,
            doa_ret = excluded.doa_ret,
            aut_empr = excluded.aut_empr,
            aut_cup = excluded.aut_cup,
            aut_nf = excluded.aut_nf,
            aut_cred = excluded.aut_cred,
            aut_ret = excluded.aut_ret,
            cons_empr = excluded.cons_empr,
            cons_cup = excluded.cons_cup,
            cons_nf = excluded.cons_nf,
            cons_cred = excluded.cons_cred,
            cons_ret = excluded.cons_ret
        """, consolidado_data)
        print(f"  Aba Consolidado importada. Total de registros: {len(consolidado_data)}")
        
        # 2. Importar a aba 'Mapa'
        print("Lendo aba Mapa...")
        df_mapa = pd.read_excel(mapa_path, sheet_name="Mapa")
        df_mapa = df_mapa.dropna(subset=['Mês'])
        
        mapa_data = []
        for _, row in df_mapa.iterrows():
            try:
                dt = pd.to_datetime(row['Mês'])
                dt_str = dt.strftime("%Y-%m-%d")
                
                # Conversores seguros para evitar erros
                def safe_int(x):
                    try:
                        return int(float(x)) if not pd.isna(x) else 0
                    except:
                        return 0
                        
                def safe_float(x):
                    try:
                        return float(x) if not pd.isna(x) else 0.0
                    except:
                        return 0.0

                plenos = safe_int(row.get('Doadores Plenos', 0))
                restritos = safe_int(row.get('Doadores Restritos', 0))
                total_doad = safe_int(row.get('Total Doadores', 0))
                qtde_cup = safe_int(row.get('Qtde Cupons', 0))
                val_nf = safe_float(row.get('Val NF', 0.0))
                ticket_med = safe_float(row.get('Ticket médio', 0.0))
                
                aut_empr = safe_int(row.get('AUTEmpr', 0))
                aut_cup = safe_int(row.get('AUTCup', 0))
                aut_nf = safe_float(row.get('AUTNF', 0.0))
                medio = safe_float(row.get('Médio', 0.0))
                aut_cred = safe_float(row.get('AUTCred', 0.0))
                tx_ret = safe_float(row.get('Tx Ret', 0.0))
                cerd_cupom = safe_float(row.get('CerdCupom', 0.0))
                cup_restri = safe_float(row.get('CupRestri', 0.0))
                val_restr = safe_float(row.get('ValRestr', 0.0))
                medio_1 = safe_float(row.get('Médio.1', 0.0))
                percent_plenos = safe_float(row.get('%Plenos', 0.0))
                
                mapa_data.append((
                    dt_str, plenos, restritos, total_doad, qtde_cup, val_nf, ticket_med,
                    aut_empr, aut_cup, aut_nf, medio, aut_cred, tx_ret,
                    cerd_cupom, cup_restri, val_restr, medio_1, percent_plenos
                ))
            except Exception:
                # Pular linhas com datas ou números inválidos
                continue
            
        cursor.executemany("""
        INSERT INTO vocacao_mapa_interno (
            mes, doadores_plenos, doadores_restritos, total_doadores, qtde_cupons, val_nf, ticket_medio,
            aut_empr, aut_cup, aut_nf, medio, aut_cred, tx_ret,
            cerd_cupom, cup_restri, val_restr, medio_1, percent_plenos
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(mes) DO UPDATE SET
            doadores_plenos = excluded.doadores_plenos,
            doadores_restritos = excluded.doadores_restritos,
            total_doadores = excluded.total_doadores,
            qtde_cupons = excluded.qtde_cupons,
            val_nf = excluded.val_nf,
            ticket_medio = excluded.ticket_medio,
            aut_empr = excluded.aut_empr,
            aut_cup = excluded.aut_cup,
            aut_nf = excluded.aut_nf,
            medio = excluded.medio,
            aut_cred = excluded.aut_cred,
            tx_ret = excluded.tx_ret,
            cerd_cupom = excluded.cerd_cupom,
            cup_restri = excluded.cup_restri,
            val_restr = excluded.val_restr,
            medio_1 = excluded.medio_1,
            percent_plenos = excluded.percent_plenos
        """, mapa_data)
        
        conn.commit()
        print(f"  Aba Mapa importada. Total de registros: {len(mapa_data)}")
        
    except Exception as e:
        print(f"Erro ao importar planilha interna: {e}")

def main():
    # A pasta das planilhas fica na subpasta 'planilhas' do projeto
    nfp_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "planilhas"))
    
    # Mudar o diretório de trabalho para onde está o script
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    conn = get_db_connection()
    try:
        setup_database(conn)
        import_annual_files(conn, nfp_dir)
        import_valores_distribuidos(conn, nfp_dir)
        import_internal_map(conn, nfp_dir)
        print("\nProcesso de ETL concluído com sucesso!")
        
        # Mostrar algumas estatísticas rápidas
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM entidades")
        print(f"Total de entidades importadas: {cursor.fetchone()[0]}")
        cursor.execute("SELECT COUNT(*) FROM historico_detalhado")
        print(f"Total de registros históricos detalhados (anuais): {cursor.fetchone()[0]}")
        cursor.execute("SELECT COUNT(*) FROM historico_distribuicao")
        print(f"Total de registros de distribuição: {cursor.fetchone()[0]}")
        cursor.execute("SELECT COUNT(*) FROM vocacao_consolidado_interno")
        print(f"Total de registros consolidados internos da Vocação: {cursor.fetchone()[0]}")
        cursor.execute("SELECT COUNT(*) FROM vocacao_mapa_interno")
        print(f"Total de registros de indicadores mensais (Mapa): {cursor.fetchone()[0]}")
        
    finally:
        conn.close()

if __name__ == "__main__":
    main()
