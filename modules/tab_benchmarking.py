import streamlit as st
import pandas as pd

def render_tab_benchmarking():
    st.markdown("### 🎯 Benchmarking & Prospecção Estadual (SEFAZ-SP)")
    st.caption("Ranking das principais entidades beneficentes do Estado de SP por volume de captação NFP no setor de Assistência Social e Juventude.")

    # Tabela do AI Studio com Vocação em 6º lugar (Destacada em Ciano)
    ranking_data = [
        {"pos": "3º", "nome": "APAE de São Paulo - Instituto Jô Clemente", "area": "Assistência Social", "cidade": "São Paulo", "valor": "R$ 5.240.000,00", "cupons": "2.100.000", "cresc": "+6.2%", "is_vocacao": False},
        {"pos": "4º", "nome": "Fundação Abrinq pelos Direitos da Criança e do Adolescente", "area": "Assistência Social", "cidade": "São Paulo", "valor": "R$ 3.980.000,00", "cupons": "1.800.000", "cresc": "+18.6%", "is_vocacao": False},
        {"pos": "5º", "nome": "Hospital de Amor de Barretos (Fundação Pio XII)", "area": "Saúde", "cidade": "Barretos", "valor": "R$ 3.850.000,00", "cupons": "1.540.000", "cresc": "+7.9%", "is_vocacao": False},
        {"pos": "6º", "nome": "Vocação - Ação Comunitária do Brasil", "area": "Assistência Social / Juventude", "cidade": "São Paulo", "valor": "R$ 1.478.000,00", "cupons": "638.000", "cresc": "+21.0%", "is_vocacao": True},
        {"pos": "7º", "nome": "Casas André Luiz - Instituição Espírita", "area": "Assistência Social", "cidade": "Guarulhos", "valor": "R$ 1.390.000,00", "cupons": "610.000", "cresc": "+5.4%", "is_vocacao": False},
        {"pos": "8º", "nome": "Lar das Moças Cegas", "area": "Assistência Social", "cidade": "Santos", "valor": "R$ 1.180.000,00", "cupons": "520.000", "cresc": "+4.8%", "is_vocacao": False},
        {"pos": "9º", "nome": "Aldeias Infantis SOS Brasil", "area": "Assistência Social", "cidade": "São Paulo", "valor": "R$ 1.120.000,00", "cupons": "480.000", "cresc": "+12.3%", "is_vocacao": False},
        {"pos": "10º", "nome": "Associação Beneficente Santa Fé", "area": "Assistência Social", "cidade": "São Paulo", "valor": "R$ 980.000,00", "cupons": "440.000", "cresc": "+0.7%", "is_vocacao": False},
        {"pos": "11º", "nome": "Casa do Zezinho", "area": "Assistência Social / Educação", "cidade": "São Paulo", "valor": "R$ 920.000,00", "cupons": "410.000", "cresc": "+14.4%", "is_vocacao": False},
        {"pos": "12º", "nome": "Instituto Ronald McDonald", "area": "Saúde / Assistência Social", "cidade": "São Paulo", "valor": "R$ 880.000,00", "cupons": "395.000", "cresc": "+6.6%", "is_vocacao": False},
        {"pos": "13º", "nome": "Associação Cruz Verde", "area": "Saúde / Assistência Social", "cidade": "São Paulo", "valor": "R$ 840.000,00", "cupons": "380.000", "cresc": "+5.1%", "is_vocacao": False},
        {"pos": "14º", "nome": "Liga Solidária", "area": "Assistência Social", "cidade": "São Paulo", "valor": "R$ 810.000,00", "cupons": "360.000", "cresc": "+9.8%", "is_vocacao": False},
    ]

    html_table = """
    <div class="ranking-table-card">
        <table style="width:100%; border-collapse: collapse; font-size: 0.88rem; color: #0f172a;">
            <thead>
                <tr style="border-bottom: 2px solid #e2e8f0; text-align: left; color: #64748b; font-size: 0.78rem; text-transform: uppercase;">
                    <th style="padding: 10px;">Posição</th>
                    <th style="padding: 10px;">Entidade Social</th>
                    <th style="padding: 10px;">Área de Atuação</th>
                    <th style="padding: 10px;">Município</th>
                    <th style="padding: 10px; text-align: right;">Créditos Totais</th>
                    <th style="padding: 10px; text-align: right;">Volume Cupons</th>
                    <th style="padding: 10px; text-align: center;">Var. YoY</th>
                </tr>
            </thead>
            <tbody>
    """

    for item in ranking_data:
        if item["is_vocacao"]:
            row_style = "background-color: #e0f2fe; border: 2px solid #00e3e6; font-weight: 800;"
            badge_html = '<span class="badge-nossa-inst">NOSSA INSTITUIÇÃO</span>'
        else:
            row_style = "border-bottom: 1px solid #f1f5f9;"
            badge_html = ""

        html_table += f"""
        <tr style="{row_style}">
            <td style="padding: 12px 10px; font-weight: 800; color: #004a6d;">{item['pos']}</td>
            <td style="padding: 12px 10px;">{item['nome']} {badge_html}</td>
            <td style="padding: 12px 10px; color: #475569;">{item['area']}</td>
            <td style="padding: 12px 10px; color: #475569;">{item['cidade']}</td>
            <td style="padding: 12px 10px; text-align: right; font-weight: 800; color: #002a3a;">{item['valor']}</td>
            <td style="padding: 12px 10px; text-align: right; color: #475569;">{item['cupons']}</td>
            <td style="padding: 12px 10px; text-align: center; color: #166534; font-weight: 700;">{item['cresc']}</td>
        </tr>
        """

    html_table += """
            </tbody>
        </table>
    </div>
    """

    st.markdown(html_table, unsafe_allow_html=True)
