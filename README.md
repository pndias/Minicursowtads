# Minicurso: Agentes CLI — Da Teoria à Produção

IFRN · TADS · 1h30. Material completo: curso interativo (web), deck de slides, exemplos e exercícios em Python.

## Conteúdo

| Arquivo | O que é |
|---------|---------|
| `minicurso-agentes-cli.jsx` | Curso interativo (React) — 5 seções, exercícios, quizzes e **Modo Apresentação** |
| `apresentacao.md` | Deck de slides (Marp) — exporta para PDF / PPTX / HTML |
| `exemplos-praticos-agentes.py` | Exemplos **resolvidos** (Anthropic SDK, CrewAI, LangGraph, PRD) |
| `exercicios.py` | Esqueletos de exercícios para o aluno preencher |

## Seções do curso

1. **Abertura & Contexto** — por que agentes agora, ecossistema, glossário
2. **O que são Agentes CLI** — loop ReAct, anatomia, tool call, autonomia
3. **Harnesses, Skills & Extensões** — browser, MCP, custom tools, SKILL.md, hooks
4. **Economia de Contexto & PRDs** — janela de contexto, tokens, compactação, PRDs
5. **Multi-agentes em Python** — CrewAI, LangGraph, AutoGen, produção

Cada seção tem **exercícios** (com dicas) e **quizzes** interativos.

## Rodar o curso interativo

```bash
npm install
npm run dev        # abre em http://localhost:5173
```

No topo, clique em **▶ Modo Apresentação** para slides em tela cheia.
Navegação: setas `← →`, `espaço`, `Home`/`End`, `Esc` para sair.

## Gerar os slides (PDF / PPTX)

```bash
# PDF
npx @marp-team/marp-cli apresentacao.md --pdf
# PowerPoint
npx @marp-team/marp-cli apresentacao.md --pptx
# HTML standalone
npx @marp-team/marp-cli apresentacao.md --html
```

Ou use a extensão **Marp for VS Code** (preview + export com 1 clique).

## Rodar os exemplos Python

```bash
pip install anthropic crewai crewai-tools langgraph langchain-anthropic
export ANTHROPIC_API_KEY=sk-ant-...
python exemplos-praticos-agentes.py   # exemplos resolvidos
python exercicios.py                  # esqueletos para praticar
```

## Trilha sugerida (1h30)

| Tempo | Atividade |
|-------|-----------|
| 0:00–0:10 | Abertura + **Ex. 0** (instalar e falar com um agente) |
| 0:10–0:30 | Conceitos + **Ex. 1** (loop ReAct) + quiz |
| 0:30–0:55 | Harnesses/Skills + **Ex. 2 e 3** (SKILL.md, MCP) |
| 0:55–1:10 | Contexto/PRD + **Ex. 4 e 5** (escrever PRD, compactar) |
| 1:10–1:30 | Multi-agentes + **Ex. 6** (capstone: crew de 3 papéis) |
