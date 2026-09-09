import time
import json
import os
import sys
import subprocess
from datetime import datetime

REPO_DIR = os.path.dirname(os.path.abspath(__file__))
TRIGGER_FILE = os.path.join(REPO_DIR, "sync_trigger.json")

print("==================================================")
print("🚀 Agente de Sincronização Local NFP Iniciado!")
print("==================================================")
print(f"Monitorando o repositório em: {REPO_DIR}")
print("Aguardando solicitações enviadas pelo site web...")
print("Pressione Ctrl+C para encerrar.\n")

def check_and_execute_sync():
    # 1. Pull das últimas alterações do repositório (para ver se há sinal 'pending')
    try:
        subprocess.run(["git", "pull"], cwd=REPO_DIR, capture_output=True, text=True)
    except Exception as e:
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Aviso ao fazer git pull: {e}")

    if not os.path.exists(TRIGGER_FILE):
        return

    try:
        with open(TRIGGER_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)

        if data.get("status") == "pending":
            print(f"\n[{datetime.now().strftime('%H:%M:%S')}] 🔔 Solicitação de sincronização detectada!")
            print(f"Requerido em: {data.get('timestamp')} por {data.get('requested_by')}")
            print("Iniciando execução do ETL nas planilhas locais...")

            # Executar ETL Python
            sys.path.append(REPO_DIR)
            from etl_import import main as run_etl_main
            run_etl_main()
            print("✅ ETL concluído com sucesso!")

            # Atualizar trigger file para 'completed'
            data["status"] = "completed"
            data["completed_at"] = datetime.now().isoformat()
            with open(TRIGGER_FILE, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)

            # Git commit e push do banco atualizado
            print("📤 Enviando nfp_database.db atualizado para o GitHub...")
            subprocess.run(["git", "add", "nfp_database.db", "sync_trigger.json"], cwd=REPO_DIR, check=True)
            subprocess.run(["git", "commit", "-m", "chore: auto-sync database via Local Agent"], cwd=REPO_DIR, check=True)
            
            # Executar push
            push_res = subprocess.run(["git", "push"], cwd=REPO_DIR, capture_output=True, text=True)
            if push_res.returncode != 0:
                print("Tentando push com autenticação...")
                # Ler token se existir em .env ou ambiente
                env_file = os.path.join(REPO_DIR, ".env")
                token = ""
                if os.path.exists(env_file):
                    with open(env_file, "r") as ef:
                        for line in ef:
                            if line.startswith("GITHUB_TOKEN="):
                                token = line.strip().split("=", 1)[1]
                if token:
                    token_url = f"https://{token}@github.com/nfpvocacao/kpi.git"
                    subprocess.run(["git", "remote", "set-url", "origin", token_url], cwd=REPO_DIR, check=True)
                    subprocess.run(["git", "push"], cwd=REPO_DIR, check=True)
                    subprocess.run(["git", "remote", "set-url", "origin", "https://github.com/nfpvocacao/kpi.git"], cwd=REPO_DIR, check=True)
                else:
                    subprocess.run(["git", "push"], cwd=REPO_DIR, check=True)

            print("🎉 Sincronização e publicação concluídas com sucesso!")
            print("Aguardando novas solicitações...\n")

    except Exception as e:
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Erro na execução da sincronização: {e}")

def main_loop():
    while True:
        try:
            check_and_execute_sync()
        except KeyboardInterrupt:
            print("\nEncerrando Agente Local.")
            break
        except Exception as e:
            print(f"Erro no loop do agente: {e}")
        time.sleep(10)

if __name__ == "__main__":
    main_loop()
