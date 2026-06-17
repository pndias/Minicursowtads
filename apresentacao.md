---
marp: true
theme: uncover
class: invert
paginate: true
backgroundColor: #0A0E1A
color: #e2e8f0
style: |
  section { font-family: 'Inter','Segoe UI',sans-serif; }
  h1 { color: #00FF94; }
  h2 { color: #38bdf8; }
  code { background: #060d1a; color: #c9d1e8; }
  strong { color: #00FF94; }
  a { color: #38bdf8; }
---

<!--
DECK DE APRESENTAÇÃO — Minicurso Agentes CLI (1h30)
Exportar: Marp CLI ou extensão Marp for VS Code.
  PDF:  npx @marp-team/marp-cli apresentacao.md --pdf
  PPTX: npx @marp-team/marp-cli apresentacao.md --pptx
  HTML: npx @marp-team/marp-cli apresentacao.md --html
Cada "---" é um slide. Comentários <!-- ... --> viram notas do palestrante.
-->

# Agentes CLI
## Da Teoria à Produção

**IFRN · TADS · Minicurso · 1h30**

Harnesses · Skills · Contexto · PRDs · Multi-agentes

<!-- Apresente-se. Pergunte quem já usou Copilot/ChatGPT pra codar. -->

---

## Roteiro (1h30)

| Tempo | Bloco |
|-------|-------|
| 0:00–0:10 | Abertura & Contexto |
| 0:10–0:30 | O que são Agentes CLI |
| 0:30–0:55 | Harnesses, Skills & Extensões |
| 0:55–1:10 | Economia de Contexto & PRDs |
| 1:10–1:30 | Multi-agentes em Python |

---

# ① Abertura
### 0:00 – 0:10

---

## O pitch

> "Você já passou horas procurando um bug, lendo docs, abrindo 30 abas?
> Imagine um assistente que lê o projeto, entende o erro, pesquisa a
> solução e abre o PR — enquanto você toma um café."

<!-- Conte uma dor real de desenvolvimento. -->

---

## Por que AGORA (2025)?

- 2023: LLMs só **conversavam**
- 2024: ganharam **tool use**
- 2025: viraram **agentes autônomos** no terminal

Saber orquestrar agentes = o novo "saber usar Google"

**Produtividade 3–10x**

---

## Você vai sair sabendo

- Usar Claude Code / Gemini CLI em problemas reais
- Entender o **loop ReAct** e o **tool call**
- Configurar **harnesses, MCP e skills**
- **Economizar tokens** e compactar contexto
- Escrever **PRDs** que viram código
- Orquestrar **multi-agentes** (CrewAI / LangGraph)

---

## O ecossistema

- **Gemini CLI** — Google, gratuito, ótima porta de entrada
- **Claude Code** — agente de engenharia da Anthropic
- **Cursor / Windsurf** — agentes dentro da IDE
- **MCP** — padrão aberto p/ plugar ferramentas
- **SKILL.md** — instruções carregadas sob demanda

---

# ② O que são Agentes CLI
### 0:10 – 0:30

---

## Loop ReAct (Reason + Act)

```
1. OBSERVE → recebe tarefa
2. THINK   → raciocina
3. ACT     → chama ferramenta
4. OBSERVE → recebe resultado
5. REPEAT ou DONE
```

<!-- O coração de tudo: observar, pensar, agir, repetir. -->

---

## Anatomia de um agente

1. **Modelo (LLM)** — o cérebro
2. **Ferramentas** — mãos e olhos
3. **Loop / orquestrador** — repete até terminar
4. **Contexto / memória** — o que ele enxerga

Tire uma peça → deixa de ser agente

---

## Chatbot vs Agente

| Chatbot | Agente CLI |
|---------|-----------|
| Só texto | Executa ações |
| Sem arquivos | Lê e edita seu projeto |
| Sem internet | Pesquisa, abre URLs |
| Uma resposta | Loop até concluir |
| Você implementa | Ele implementa |

---

## O tool call por dentro

```json
// modelo PEDE:
{ "type": "tool_use", "name": "bash",
  "input": { "command": "pytest -q" } }

// harness RESPONDE:
{ "type": "tool_result",
  "content": "3 failed, 12 passed" }
```

O modelo **não roda** nada — pede; o **harness executa**.

---

## Níveis de autonomia

- **Sugestão** — mostra diff, você aplica
- **Aprovação** — pede OK a cada ação
- **Auto (edição)** — edita sozinho
- **Auto total (YOLO)** — roda tudo (só em sandbox!)

⚠️ Estagiário brilhante, não sênior. Trabalhe em **git**.

---

# ③ Harnesses, Skills & Extensões
### 0:30 – 0:55

---

## Harness = colete de ferramentas

Define o que o agente PODE fazer e **media** tudo:
executa ferramentas, aplica permissões, faz sandbox.

**Browser Harness** → um Chromium real que o agente controla:
vê a página, clica, extrai dados, preenche forms.

---

## MCP = o "USB-C" dos agentes

Padrão **aberto** (Anthropic). Rode um *MCP server*
(GitHub, Postgres, Slack...) e **qualquer** agente compatível pluga.

```json
{ "mcpServers": {
    "github": { "command": "npx",
      "args": ["-y","@modelcontextprotocol/server-github"] } } }
```

---

## SKILL.md — padrões sob demanda

```yaml
---
name: fastapi-padrao-ifrn
description: Use ao criar APIs FastAPI no IFRN
---
# Convenções: async/await, rotas em PT, testes pytest
```

Carregada **só quando relevante** → economiza tokens.

---

## Estendendo o agente

- **CLAUDE.md / GEMINI.md** — memória fixa do projeto
- **SKILL.md** — padrões sob demanda
- **Slash commands** — atalhos de prompt
- **MCP servers** — ferramentas externas
- **Custom tools** — funções suas
- **Hooks** — guarda-corpos automáticos
- **Subagents** — especialistas delegados

---

# ④ Economia de Contexto & PRDs
### 0:55 – 1:10

---

## Por que contexto importa

Janela = limite de tokens (ex: 200K ≈ 500 páginas)

Muito contexto = **caro + lento + menos preciso**
("lost in the middle")

Compactar = economizar **$$$** E **melhorar qualidade**

---

## A matemática do token

- 1 token ≈ 4 caracteres ≈ 0,75 palavra
- Cada requisição **reenvia todo o contexto**
- `node_modules` colado por engano ≈ 50K tokens

Compacte para ~20K → rápido, barato, focado

---

## Técnicas de economia

- `/compact` — resume o histórico
- SKILL.md curtas e precisas
- `.agentignore` — esconda node_modules, builds
- Sessão nova por tarefa
- Checkpoint em arquivo → recomeça limpo
- Subagents devolvem só a conclusão

---

## PRD — o briefing que vira código

```markdown
# PRD: Controle de Frequência (QR Code)
## Objetivo: professor registra presença via QR
## MVP: auth, gerar QR (15min), escanear, dashboard
## Stack: FastAPI + PostgreSQL + React
## Aceite: QR único, sem presença dupla, tempo real
## Fora do escopo: app nativo, biometria
```

---

## PRD eficiente tem

- Objetivo em 1–2 frases (o "porquê")
- Usuários e papéis
- MVP separado de fases futuras
- **Stack decidida** (não deixe o agente escolher)
- Critérios de aceite **mensuráveis**
- **Fora do escopo** explícito

---

## Padrões de prompt

- Dê um **papel**: "Você é arquiteto sênior..."
- Peça **plano antes do código** e espere OK
- Defina o **formato** de saída
- Dê **exemplos** (few-shot)
- **Critério de pronto**: "só pare quando pytest passar"

---

# ⑤ Multi-agentes em Python
### 1:10 – 1:30

---

## Por que (e quando NÃO)

Vários especialistas > um generalista sobrecarregado:
pesquisa, codifica, revisa, testa.

⚠️ Mas **80%** das tarefas: um agente único basta.
Multi-agente = mais custo e mais falhas. Use com critério.

---

## Frameworks

| Framework | Paradigma | Bom para |
|-----------|-----------|----------|
| CrewAI | Papéis + Tasks | Workflows simples |
| LangGraph | Grafo de estados | Fluxos com condicionais |
| AutoGen | Conversas | Código colaborativo |
| Pydantic AI | Type-safe | Produção |

---

## Padrões de orquestração

- **Sequencial** — A → B → C
- **Hierárquico** — gerente delega
- **Paralelo** — vários ao mesmo tempo
- **Loop** — gerar → testar → corrigir

---

## CrewAI em 1 tela

```python
arquiteto = Agent(role="Arquiteto", goal="...", backstory="...")
dev       = Agent(role="Dev Python", goal="...")
revisor   = Agent(role="Reviewer", goal="...")

crew = Crew(
  agents=[arquiteto, dev, revisor],
  tasks=[t_arq, t_code, t_review],
  process=Process.sequential)
crew.kickoff()
```

---

## Produção: o que ninguém conta

- **Custo**: meça tokens por execução
- **Loops infinitos**: sempre `max_turns`
- **Observabilidade**: LangSmith / logs
- **Evals**: meça se está melhorando
- **Segurança**: sandbox p/ executar código

---

## Leve pra vida

- Comece **simples** (1 agente resolve 80%)
- **CLAUDE.md** é seu melhor amigo
- **PRD antes do código**
- **Compacte** o contexto
- Multi-agente só com etapas separáveis
- **Você revisa** — é o engenheiro

---

# ⑥ Bônus: Deploy & Produção

---

## Do terminal para a nuvem

Em produção o agente roda **sozinho**, sem humano no teclado:
disparado por push, issue ou cron — em modo **headless**.

```bash
claude -p "Corrija o erro em logs/erro.txt e rode os testes" \
       --output-format json
```

---

## Agente revisa toda PR (GitHub Actions)

```yaml
on: { pull_request: { types: [opened, synchronize] } }
jobs:
  revisar:
    steps:
      - run: claude -p "Revise o diff. 1 linha por problema." > r.txt
        env: { ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }} }
      - run: gh pr comment ${{ github.event.number }} --body-file r.txt
```

---

## ⚠️ Segurança em CI

- Segredos via **GitHub Secrets** — nunca hardcode
- Permissões **mínimas** (read quando der)
- Cuidado com `pull_request_target` em repos públicos
- **Sandbox** + limite do que o agente toca

---

## Guarda-corpos em produção

- **Orçamento** de tokens por execução
- **Timeout** e max de iterações
- Tudo em **git/branch** (nunca push direto na main)
- **Human-in-the-loop** antes de deploy/merge
- **Logs** e observabilidade (auditoria)

---

# Obrigado! 🚀

Comece pelo **Exercício 0**.

Você é o engenheiro.
O agente é o estagiário brilhante.

`docs.anthropic.com/claude-code` · `modelcontextprotocol.io`
