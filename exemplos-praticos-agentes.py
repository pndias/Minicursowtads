# =============================================================
# MINICURSO: AGENTES CLI — EXEMPLOS PRÁTICOS
# IFRN · TADS · Junho 2025
# =============================================================

# ---------------------------------------------------------------
# EXEMPLO 1: Agente simples com Anthropic SDK
# Demonstra o loop básico de raciocínio com ferramentas
# ---------------------------------------------------------------

import anthropic
import subprocess
import json

client = anthropic.Anthropic()  # usa ANTHROPIC_API_KEY do ambiente

# Definimos as ferramentas que o agente pode usar
ferramentas = [
    {
        "name": "executar_bash",
        "description": "Executa um comando bash no terminal e retorna o output",
        "input_schema": {
            "type": "object",
            "properties": {
                "comando": {
                    "type": "string",
                    "description": "O comando bash a executar"
                }
            },
            "required": ["comando"]
        }
    },
    {
        "name": "ler_arquivo",
        "description": "Lê o conteúdo de um arquivo",
        "input_schema": {
            "type": "object",
            "properties": {
                "caminho": {
                    "type": "string",
                    "description": "Caminho do arquivo a ler"
                }
            },
            "required": ["caminho"]
        }
    }
]


def executar_ferramenta(nome: str, inputs: dict) -> str:
    """Executa a ferramenta e retorna o resultado como string."""
    if nome == "executar_bash":
        resultado = subprocess.run(
            inputs["comando"],
            shell=True,
            capture_output=True,
            text=True
        )
        return resultado.stdout or resultado.stderr
    
    if nome == "ler_arquivo":
        try:
            with open(inputs["caminho"]) as f:
                return f.read()
        except FileNotFoundError:
            return f"Arquivo não encontrado: {inputs['caminho']}"
    
    return "Ferramenta não encontrada"


def agente_simples(tarefa: str) -> str:
    """
    Agente que executa um loop ReAct até completar a tarefa.
    Demonstra: observe → think → act → observe → ...
    """
    mensagens = [{"role": "user", "content": tarefa}]
    
    while True:
        resposta = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=4096,
            tools=ferramentas,
            messages=mensagens
        )
        
        # Adiciona resposta ao histórico
        mensagens.append({
            "role": "assistant",
            "content": resposta.content
        })
        
        # Se parou de usar ferramentas, terminou
        if resposta.stop_reason == "end_turn":
            texto = next(
                (b.text for b in resposta.content if hasattr(b, "text")),
                "Tarefa concluída."
            )
            return texto
        
        # Processa chamadas de ferramentas
        resultados = []
        for bloco in resposta.content:
            if bloco.type == "tool_use":
                print(f"🔧 Usando ferramenta: {bloco.name}({bloco.input})")
                resultado = executar_ferramenta(bloco.name, bloco.input)
                resultados.append({
                    "type": "tool_result",
                    "tool_use_id": bloco.id,
                    "content": resultado
                })
        
        # Retorna resultados para o modelo continuar
        mensagens.append({"role": "user", "content": resultados})


# Uso:
# resultado = agente_simples(
#     "Liste os arquivos Python na pasta atual e me diga "
#     "quantas linhas cada um tem."
# )
# print(resultado)


# ---------------------------------------------------------------
# EXEMPLO 2: CrewAI — Equipe de desenvolvimento
# ---------------------------------------------------------------

from crewai import Agent, Task, Crew, Process
from crewai_tools import FileReadTool

file_tool = FileReadTool()


def criar_crew_desenvolvimento(prd_path: str = "docs/prd.md"):
    """
    Cria uma crew que lê um PRD e produz código.
    
    Agentes:
    - Arquiteto: projeta a solução
    - Desenvolvedor: implementa o código
    - Revisor: garante qualidade
    """
    
    arquiteto = Agent(
        role="Arquiteto de Software Sênior",
        goal="""Analisar os requisitos do PRD e produzir um documento de
        arquitetura claro com estrutura de pastas, endpoints e modelos.""",
        backstory="""Você tem 10 anos de experiência em sistemas web Python.
        Especialista em FastAPI, design patterns e sistemas escaláveis.
        Você pensa em manutenibilidade antes de performance.""",
        tools=[file_tool],
        verbose=True
    )
    
    desenvolvedor = Agent(
        role="Desenvolvedor Python Pleno",
        goal="""Implementar o MVP definido na arquitetura, com código limpo,
        type hints, docstrings e testes unitários.""",
        backstory="""Você escreve código Python idiomático. Segue PEP 8,
        usa type hints em tudo, escreve docstrings claras e cobre seu código
        com testes. Você não entrega sem testes passando.""",
        verbose=True
    )
    
    revisor = Agent(
        role="Code Reviewer Especialista em Segurança",
        goal="""Revisar o código em busca de: vulnerabilidades de segurança,
        N+1 queries, falta de validação de inputs, code smells.""",
        backstory="""Você tem histórico de encontrar bugs críticos antes de prod.
        Você lê código como um hacker e pensa como um usuário malicioso.""",
        verbose=True
    )
    
    # Tarefas encadeadas
    tarefa_arq = Task(
        description=f"""
        Leia o PRD em {prd_path} e produza um documento de arquitetura:
        
        1. Estrutura de pastas do projeto
        2. Lista de endpoints REST (método, rota, descrição)
        3. Modelos de dados (tabelas e campos principais)
        4. Dependências Python necessárias (requirements.txt)
        5. Decisões técnicas e justificativas
        
        Seja específico e preciso. O desenvolvedor vai implementar exatamente
        o que você especificar.
        """,
        expected_output="Documento de arquitetura completo em Markdown",
        agent=arquiteto
    )
    
    tarefa_dev = Task(
        description="""
        Com base na arquitetura definida pelo arquiteto:
        
        1. Implemente todos os arquivos da estrutura de pastas
        2. Crie os models SQLAlchemy
        3. Crie os schemas Pydantic
        4. Implemente os endpoints FastAPI
        5. Escreva testes pytest para cada endpoint
        6. Crie o requirements.txt
        
        Entregue o código completo, não esqueletos. Cada arquivo deve ser
        funcional e seguir as convenções Python modernas.
        """,
        expected_output="Todos os arquivos de código implementados e prontos para uso",
        agent=desenvolvedor,
        context=[tarefa_arq]
    )
    
    tarefa_rev = Task(
        description="""
        Revise todo o código produzido pelo desenvolvedor:
        
        1. Verifique vulnerabilidades (SQL injection, XSS, auth bypass)
        2. Procure N+1 queries no código de banco de dados
        3. Confirme validação de todos os inputs do usuário
        4. Verifique tratamento de erros e exceptions
        5. Cheque se os testes têm cobertura adequada
        
        Produza: lista de issues críticos, issues médios e sugestões de melhoria.
        Para cada issue crítico, forneça a correção.
        """,
        expected_output="Relatório de revisão com issues e código corrigido",
        agent=revisor,
        context=[tarefa_dev]
    )
    
    crew = Crew(
        agents=[arquiteto, desenvolvedor, revisor],
        tasks=[tarefa_arq, tarefa_dev, tarefa_rev],
        process=Process.sequential,
        verbose=True
    )
    
    return crew


# Uso:
# crew = criar_crew_desenvolvimento("docs/prd-frequencia.md")
# resultado = crew.kickoff()
# print(resultado)


# ---------------------------------------------------------------
# EXEMPLO 3: LangGraph — Agente com loop de correção automática
# ---------------------------------------------------------------

from langgraph.graph import StateGraph, END
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, SystemMessage
from typing import TypedDict
import subprocess
import tempfile
import os


class EstadoCodigo(TypedDict):
    """Estado compartilhado entre todos os nós do grafo."""
    tarefa: str           # Descrição do que implementar
    codigo: str           # Código atual
    erros: str            # Output dos testes/lint
    testes_ok: bool       # Se os testes passaram
    tentativas: int       # Número de tentativas
    max_tentativas: int   # Limite de tentativas


llm = ChatAnthropic(model="claude-sonnet-4-6")


def gerar_codigo(state: EstadoCodigo) -> EstadoCodigo:
    """Nó 1: Gera o código inicial para a tarefa."""
    print("📝 Gerando código...")
    
    resposta = llm.invoke([
        SystemMessage(content="""Você é um desenvolvedor Python experiente.
        Escreva código limpo, com type hints e docstrings.
        Sempre inclua os imports necessários.
        Responda SOMENTE com o código Python, sem explicações."""),
        HumanMessage(content=f"Implemente: {state['tarefa']}")
    ])
    
    return {
        **state,
        "codigo": resposta.content,
        "tentativas": state["tentativas"] + 1
    }


def rodar_testes(state: EstadoCodigo) -> EstadoCodigo:
    """Nó 2: Roda o código em um ambiente temporário."""
    print("🧪 Rodando testes...")
    
    # Salva o código em arquivo temporário
    with tempfile.NamedTemporaryFile(
        mode="w",
        suffix=".py",
        delete=False
    ) as f:
        f.write(state["codigo"])
        temp_path = f.name
    
    try:
        # Tenta executar o arquivo (detecta erros de sintaxe e runtime)
        resultado = subprocess.run(
            ["python", "-m", "py_compile", temp_path],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if resultado.returncode == 0:
            # Também roda com flake8 se disponível
            lint = subprocess.run(
                ["python", "-m", "flake8", "--max-line-length=100", temp_path],
                capture_output=True,
                text=True,
                timeout=10
            )
            erros = lint.stdout if lint.returncode != 0 else ""
            testes_ok = lint.returncode == 0
        else:
            erros = resultado.stderr
            testes_ok = False
            
    except Exception as e:
        erros = str(e)
        testes_ok = False
    finally:
        os.unlink(temp_path)
    
    return {**state, "erros": erros, "testes_ok": testes_ok}


def corrigir_codigo(state: EstadoCodigo) -> EstadoCodigo:
    """Nó 3: Corrige o código baseado nos erros encontrados."""
    print(f"🔧 Corrigindo erros (tentativa {state['tentativas']})...")
    
    resposta = llm.invoke([
        SystemMessage(content="""Você é um desenvolvedor Python especialista em debugging.
        Corrija o código fornecido baseado nos erros encontrados.
        Responda SOMENTE com o código corrigido, sem explicações."""),
        HumanMessage(content=f"""
Código com problemas:
```python
{state['codigo']}
```

Erros encontrados:
```
{state['erros']}
```

Corrija todos os erros e retorne o código completo corrigido.
        """)
    ])
    
    return {
        **state,
        "codigo": resposta.content,
        "tentativas": state["tentativas"] + 1
    }


def decidir_proximo_passo(state: EstadoCodigo) -> str:
    """Roteador: decide se termina, corrige ou desiste."""
    if state["testes_ok"]:
        print("✅ Código aprovado!")
        return "sucesso"
    elif state["tentativas"] >= state["max_tentativas"]:
        print(f"❌ Limite de {state['max_tentativas']} tentativas atingido.")
        return "falha"
    else:
        return "corrigir"


def construir_grafo_codigo():
    """Constrói e retorna o grafo de geração e correção de código."""
    grafo = StateGraph(EstadoCodigo)
    
    # Adicionar nós
    grafo.add_node("gerar", gerar_codigo)
    grafo.add_node("testar", rodar_testes)
    grafo.add_node("corrigir", corrigir_codigo)
    
    # Fluxo principal
    grafo.set_entry_point("gerar")
    grafo.add_edge("gerar", "testar")
    
    # Decisão após testar
    grafo.add_conditional_edges(
        "testar",
        decidir_proximo_passo,
        {
            "sucesso": END,
            "corrigir": "corrigir",
            "falha": END
        }
    )
    
    # Após corrigir, testa novamente
    grafo.add_edge("corrigir", "testar")
    
    return grafo.compile()


def gerar_codigo_com_autocorrecao(tarefa: str, max_tentativas: int = 3) -> dict:
    """
    Gera código Python para uma tarefa, corrigindo automaticamente até funcionar.
    
    Args:
        tarefa: Descrição do que implementar
        max_tentativas: Número máximo de tentativas de correção
        
    Returns:
        Dict com 'codigo', 'testes_ok' e 'tentativas'
    """
    app = construir_grafo_codigo()
    
    estado_inicial = {
        "tarefa": tarefa,
        "codigo": "",
        "erros": "",
        "testes_ok": False,
        "tentativas": 0,
        "max_tentativas": max_tentativas
    }
    
    resultado = app.invoke(estado_inicial)
    return resultado


# Uso:
# resultado = gerar_codigo_com_autocorrecao(
#     tarefa="Implemente uma função que recebe uma lista de números "
#            "e retorna os N maiores valores usando heapq",
#     max_tentativas=3
# )
# 
# if resultado["testes_ok"]:
#     print("✅ Código gerado com sucesso!")
#     print(resultado["codigo"])
# else:
#     print("❌ Não foi possível gerar código válido.")
#     print("Última versão:", resultado["codigo"])


# ---------------------------------------------------------------
# EXEMPLO 4: Compactação de contexto — utilitário prático
# ---------------------------------------------------------------

def compactar_contexto_sessao(
    historico: list[dict],
    arquivo_saida: str = ".claude/contexto-compactado.md"
) -> str:
    """
    Usa o Claude para compactar um histórico longo de conversa
    em um resumo estruturado, economizando tokens.
    
    Args:
        historico: Lista de mensagens da conversa
        arquivo_saida: Onde salvar o resumo
        
    Returns:
        O resumo gerado
    """
    # Serializa o histórico
    historico_texto = "\n".join([
        f"[{m['role'].upper()}]: {m['content'][:500]}..."
        if len(m.get('content', '')) > 500
        else f"[{m['role'].upper()}]: {m.get('content', '')}"
        for m in historico
        if isinstance(m.get('content'), str)
    ])
    
    resposta = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1000,
        messages=[{
            "role": "user",
            "content": f"""Resuma este histórico de desenvolvimento em um documento
de checkpoint técnico conciso. Inclua:

1. **Contexto do Projeto**: O que está sendo construído
2. **Arquivos Modificados**: Lista dos arquivos criados/editados
3. **Decisões Técnicas**: Escolhas importantes feitas e por quê
4. **Estado Atual**: O que está funcionando
5. **Próximos Passos**: O que falta fazer (bullets)
6. **Problemas Conhecidos**: Bugs ou limitações identificadas

Histórico:
{historico_texto}

Seja técnico e conciso. Este documento será usado para retomar a sessão."""
        }]
    )
    
    resumo = resposta.content[0].text
    
    # Salva em arquivo
    os.makedirs(os.path.dirname(arquivo_saida), exist_ok=True)
    with open(arquivo_saida, "w") as f:
        f.write(f"# Checkpoint de Contexto\n")
        f.write(f"# Gerado em: {__import__('datetime').datetime.now().isoformat()}\n\n")
        f.write(resumo)
    
    print(f"✅ Contexto compactado salvo em: {arquivo_saida}")
    print(f"📊 Redução: {len(historico_texto)} → {len(resumo)} chars "
          f"({100 - len(resumo)*100//max(len(historico_texto),1)}% menor)")
    
    return resumo


# ---------------------------------------------------------------
# TEMPLATE: PRD para projetos TADS/IFRN
# ---------------------------------------------------------------

TEMPLATE_PRD = """# PRD: {nome_projeto}

## 1. Objetivo
{descricao_objetivo}

## 2. Usuários e Papéis
| Papel | Descrição | Permissões principais |
|-------|-----------|----------------------|
| {papel_1} | {desc_papel_1} | {perm_1} |
| {papel_2} | {desc_papel_2} | {perm_2} |

## 3. Funcionalidades

### MVP (Fase 1 — entregar primeiro)
- [ ] {feature_mvp_1}
- [ ] {feature_mvp_2}
- [ ] {feature_mvp_3}

### Fase 2
- [ ] {feature_f2_1}
- [ ] {feature_f2_2}

## 4. Stack Tecnológica
- **Backend**: {stack_backend}
- **Frontend**: {stack_frontend}
- **Banco de Dados**: {stack_db}
- **Auth**: {stack_auth}
- **Deploy**: {stack_deploy}

## 5. Critérios de Aceite
- {criterio_1}
- {criterio_2}
- {criterio_3}

## 6. Fora do Escopo (NÃO implementar)
- {fora_escopo_1}
- {fora_escopo_2}

## 7. Restrições Técnicas
- {restricao_1}
- {restricao_2}

## 8. Referências
- {referencia_1}
"""


if __name__ == "__main__":
    print("""
╔══════════════════════════════════════════════════════╗
║     MINICURSO: AGENTES CLI — IFRN TADS               ║
║     Exemplos prontos para uso                        ║
╠══════════════════════════════════════════════════════╣
║                                                      ║
║  Exemplo 1: agente_simples(tarefa)                   ║
║    → Agente básico com ferramentas bash/arquivo      ║
║                                                      ║
║  Exemplo 2: criar_crew_desenvolvimento(prd)          ║
║    → CrewAI com arquiteto, dev e revisor             ║
║                                                      ║
║  Exemplo 3: gerar_codigo_com_autocorrecao(tarefa)    ║
║    → LangGraph com loop de correção automática       ║
║                                                      ║
║  Exemplo 4: compactar_contexto_sessao(historico)     ║
║    → Compacta histórico longo economizando tokens    ║
║                                                      ║
╚══════════════════════════════════════════════════════╝

Dependências:
  pip install anthropic crewai crewai-tools
  pip install langgraph langchain-anthropic

Variável de ambiente necessária:
  export ANTHROPIC_API_KEY="sua-chave-aqui"
    """)
