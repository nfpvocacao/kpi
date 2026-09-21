import streamlit as st

def render_business_rules_modal():
    st.markdown("""
    <div class="modal-box">
        <h3 style="color: #00e3e6; margin-top: 0;">📋 Regras de Negócio e Compliance SEFAZ-SP</h3>
        <p style="color: #d9fbff; font-size: 0.9rem;">
            Diretrizes técnicas aplicadas no processamento da Nota Fiscal Paulista para a entidade <b>Vocação</b>:
        </p>
        <hr style="border-color: rgba(0,227,230,0.2);">
        <ol style="color: #ffffff; font-size: 0.88rem; line-height: 1.6;">
            <li><b>Separação entre Urnas e Doações de Pessoas Físicas:</b><br>
                Registros de modalidade <code>CADASTRO</code> (urnas fisicas e digitação de cupons) pertencem às operações comerciais com empresas parceiras. Não devem ser misturados com doações voluntárias de Pessoas Físicas (PF).
            </li>
            <li style="margin-top: 10px;"><b>Filtro Estrito de Doadores Reais (PF):</b><br>
                Apenas as modalidades <code>DOACAO_AUTOMATICA</code> (Fidelidade SEFAZ-SP) e <code>DOACAO</code> vinculadas a um CPF válido são contabilizadas como doações diretas de pessoas físicas.
            </li>
            <li style="margin-top: 10px;"><b>Desduplicação de Documentos SEFAZ-SP:</b><br>
                Em caso de re-processamento ou re-importação de lotes, é priorizado o registro com status <code>StatusdoPedido = 'Pedido com documento encontrado.'</code>.
            </li>
        </ol>
    </div>
    """, unsafe_allow_html=True)

def render_database_status_modal():
    st.markdown("""
    <div class="modal-box">
        <h3 style="color: #00e3e6; margin-top: 0;">🗄️ Status da Arquitetura de Dados Multi-Tier</h3>
        <p style="color: #d9fbff; font-size: 0.9rem;">
            Status atual das conexões de banco de dados e sincronização de dados NFP:
        </p>
        <hr style="border-color: rgba(0,227,230,0.2);">
        <table style="width: 100%; color: #ffffff; font-size: 0.88rem;">
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                <td style="padding: 8px 0;"><b>Camada Primary (Cache):</b></td>
                <td style="color: #00e04b;">SQLite Local (nfp_database.db) — <b>ATIVO</b></td>
            </tr>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                <td style="padding: 8px 0;"><b>Camada Cloud Fallback:</b></td>
                <td style="color: #00e3e6;">AWS RDS MySQL (aplication.jovemmais) — <b>CONECTADO</b></td>
            </tr>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                <td style="padding: 8px 0;"><b>Última Atualização:</b></td>
                <td>Maio/2026 (Consolidado Oficial NFP)</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><b>Agente de Sincronização:</b></td>
                <td style="color: #edcd01;">Pronto para receber sinal GitHub API</td>
            </tr>
        </table>
    </div>
    """, unsafe_allow_html=True)
