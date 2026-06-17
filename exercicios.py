# =============================================================
# MINICURSO: AGENTES CLI — EXERCÍCIOS (esqueletos para resolver)
# IFRN · TADS
# -------------------------------------------------------------
# Cada exercício tem: enunciado, TODOs e dicas.
# Resolva preenchendo os TODO. Soluções de referência em
# exemplos-praticos-agentes.py.
#
#   pip install anthropic crewai crewai-tools langgraph langchain-anthropic
#   export ANTHROPIC_API_KEY=sk-ant-...
# =============================================================


# -------------------------------------------------------------
# EXERCÍCIO 1 — Agente simples com loop de ferramentas (Básico)
# Objetivo: implementar o loop ReAct manualmente.
# O agente deve usar uma ferramenta 'contar_linhas' para
# responder "quantas linhas tem o arquivo X".
# -------------------------------------------------------------
import os

FERRAMENTAS_EX1 = [
    {
        "name": "contar_linhas",
        "description": "Conta quantas linhas tem um arquivo de texto.",
        "input_schema": {
            "type": "object",
            "properties": {"caminho": {"type": "string"}},
            "required": ["caminho"],
        },
    }
]


def contar_linhas(caminho: str) -> str:
    # TODO: abrir o arquivo e retornar o número de linhas como string.
    # Dica: trate FileNotFoundError e retorne uma mensagem de erro.
    raise NotImplementedError


def agente_ex1(tarefa: str) -> str:
    """
    TODO: implementar o loop:
      1. Enviar a tarefa + FERRAMENTAS_EX1 ao modelo (Anthropic SDK).
      2. Se o modelo pedir 'tool_use', chamar contar_linhas() e
         devolver o 'tool_result'.
      3. Repetir até o modelo parar de pedir ferramentas.
      4. Retornar o texto final.
    Dica: veja agente_simples() em exemplos-praticos-agentes.py.
    """
    raise NotImplementedError


# -------------------------------------------------------------
# EXERCÍCIO 2 — Ferramenta customizada (Intermediário)
# Adicione uma ferramenta 'buscar_na_web' (pode ser mock) e
# faça o agente combinar duas ferramentas numa só tarefa.
# -------------------------------------------------------------
def buscar_na_web(consulta: str) -> str:
    # TODO: retornar um resultado (pode ser fixo/mock para o exercício).
    raise NotImplementedError


# TODO: registre buscar_na_web no schema de ferramentas e teste com:
#   "Pesquise a versão mais recente do FastAPI e conte as linhas
#    do arquivo requirements.txt."


# -------------------------------------------------------------
# EXERCÍCIO 3 — Crew de 3 papéis (Avançado · Capstone)
# Monte uma crew (CrewAI) que recebe um PRD e produz:
# arquitetura -> código -> revisão.
# -------------------------------------------------------------
def montar_crew_capstone(prd_path: str = "docs/prd.md"):
    """
    TODO:
      1. Criar 3 Agent: pesquisador/arquiteto, desenvolvedor, revisor.
      2. Criar 3 Task encadeadas via context=[...].
      3. process=Process.sequential, verbose=True.
      4. Retornar a Crew (NÃO chamar kickoff aqui).
    Dica: veja criar_crew_desenvolvimento() em exemplos-praticos-agentes.py.
    Lembre: adicione limite de iterações e logue tokens (Exercício 6 do slide).
    """
    raise NotImplementedError


# -------------------------------------------------------------
# EXERCÍCIO 4 — Loop de auto-correção (Avançado)
# Use LangGraph: gerar -> testar -> (corrigir -> testar)* -> fim,
# com no máximo 3 tentativas.
# -------------------------------------------------------------
def construir_grafo_autocorrecao():
    """
    TODO:
      1. Definir o TypedDict de estado (tarefa, codigo, testes_ok, tentativas).
      2. Nós: gerar_codigo, rodar_testes, corrigir_codigo.
      3. add_conditional_edges para decidir finalizar/corrigir.
      4. Limitar a 3 tentativas.
    Dica: veja construir_grafo_codigo() em exemplos-praticos-agentes.py.
    """
    raise NotImplementedError


if __name__ == "__main__":
    print("Exercícios do minicurso — preencha os TODO e rode cada bloco.")
    print("Soluções de referência: exemplos-praticos-agentes.py")
