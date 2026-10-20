# 📋 Especificação e Regras de Negócio: Política Integrada de Comissionamento e Bonificação (NFP Vocação)

> **Documento Oficial de Referência**: `Politica_NFP_Vocacao_Versao_1.docx`  
> **Vigência Oficial**: 1º de outubro de 2026  
> **Slogan Institucional**: *Onde potencial encontra caminho*

---

## 1. Princípio Fundamental de Igualdade Contábil
A abertura das bases e comissões no sistema **deve fechar rigorosamente com os totais apurados pela SEFAZ na tela de Desempenho** (ex: R$ 320.777,18 em Jun/26, sendo R$ 240.595,23 Urnas/Cadastro + R$ 5.910,09 Doação Direta + R$ 74.271,86 Doação Automática). Nenhuma divergência de centavos é permitida.

---

## 2. Frente 1: Captação e Manutenção de Estabelecimentos (Frente Cadastro)
Aplica-se à equipe de vendas/captadores de carteiras comerciais de CNPJs:

| Modalidade | Alíquota | Base de Cálculo / Regra |
| :--- | :---: | :--- |
| **Captação de Novo Estabelecimento** | **1,0%** | Sobre o crédito total gerado pelos cupons do estabelecimento, efetivamente reconhecido pela SEFAZ. Exige vínculo obrigatório ao `id_vendedor`. |
| **Manutenção / Relacionamento (Recorrente)** | **0,5%** | Sobre o crédito total gerado pelos cupons do estabelecimento já ativo, formalmente atribuído ao `id_vendedor`. |
| **Sem Vendedor / Não Comissionável / Consumo** | **0,0%** | CNPJs sem vendedor (`id_vendedor IS NULL`), contas institucionais ou notas de consumo próprio **não geram comissão**. |

---

## 3. Frente 2: Automatização Individual (Doadores PF)
Remuneração progressiva atribuível a colaboradores individuais por doadores cadastrados que forem validados e confirmados com geração efetiva de crédito pela SEFAZ:

| Faixa (Quantidade de Automatizações) | Valor Unitário por Doador na Faixa |
| :--- | :---: |
| **1 a 10** | **R$ 30,00** |
| **11 a 20** | **R$ 25,00** |
| **21 a 30** | **R$ 20,00** |
| **31 a 50** | **R$ 15,00** |
| **51 a 75** | **R$ 10,00** |
| **76 ou mais** | **R$ 5,00** |

*Exemplo da Política: 100 automatizações individuais validadas geram R$ 1.425,00 de comissão.*

---

## 4. Frente 3: Automatização Institucional (Eventos, Feiras e Ações Bitrix24)
Bonificação variável decorrente do volume total de automatizações validadas na ação institucional, paga proporcionalmente às horas efetivamente trabalhadas por participante:

| Volume de Automatizações Validadas na Ação | Bonificação Integral por Participante |
| :--- | :---: |
| **0 a 9** | Sem bonificação (R$ 0,00) |
| **10 a 150** | **R$ 50,00** |
| **151 a 299** | **R$ 75,00** |
| **300 a 499** | **R$ 100,00** |
| **500 a 699** | **R$ 200,00** |
| **700 a 899** | **R$ 300,00** |
| **900 a 1.199** | **R$ 400,00** |
| **1.200 ou mais** | **R$ 500,00** |

$$\text{Bonificação Individual} = \text{Bonificação Integral da Faixa} \times \left(\frac{\text{Horas Efetivamente Trabalhadas}}{\text{Carga Horária Total da Ação}}\right)$$

---

## 5. Frente 4: Comissão da Coordenação do Programa NFP
A base mensal elegível da Coordenação é consolidada pela soma de 4 parcelas (sem dupla contagem):

1. **Captação e Manutenção de Estabelecimentos**: Créditos da Frente Cadastro reconhecidos no mês.
2. **Base Histórica de 2025**: **R$ 53.025,14 fixos por mês** (R$ 636.301,63 / 12).
3. **Automatizações Individuais da Equipe**: Créditos reconhecidos das automatizações individuais validadas.
4. **Doações**: Créditos reconhecidos de doações de cupons PF.
*(Nota: Automatizações Institucionais NÃO integram a parcela adicional de Automatizações Individuais da base da Coordenação).*

### Tabela Progressiva da Coordenação (Incide sobre o valor integral da base):
| Base Mensal Elegível | Alíquota da Coordenação |
| :--- | :---: |
| **R$ 0,00 a R$ 229.999,99** | **4%** |
| **R$ 230.000,00 a R$ 279.999,99** | **5%** |
| **R$ 280.000,00 a R$ 329.999,99** | **6%** |
| **R$ 330.000,00 a R$ 379.999,99** | **7%** |
| **R$ 380.000,00 a R$ 429.999,99** | **8%** |
| **R$ 430.000,00 a R$ 479.999,99** | **9%** |
| **A partir de R$ 480.000,00** | **10%** |

*Exemplo da Política: Base de R$ 288.025,14 atinge a faixa de 6%, gerando R$ 17.281,51 de comissão para a Coordenação.*

---

## 6. Governança, Alçadas e Regras Gerais
- **Alçada da Diretoria**: Quando a soma da remuneração fixa com a remuneração variável projetada atingir 2,5 vezes o salário fixo mensal do colaborador, novas designações remuneradas dependem de autorização prévia da Diretoria.
- **Ciclo Fiscal D+4**: Os pagamentos ocorrem conforme a homologação e liquidação efetiva dos créditos pela SEFAZ.
- **Vedação de Dupla Contagem**: O mesmo resultado não pode ser comissionado em duplicidade.
