import { useState, useEffect, useCallback } from "react";

const VERDE = "#00FF94";
const VERDE_DIM = "#00cc76";
const FUNDO = "#0A0E1A";
const CARD = "#111827";
const CARD2 = "#1a2235";
const BORDA = "#1e3050";
const TEXTO = "#e2e8f0";
const MUTED = "#94a3b8";
const ACCENT = "#38bdf8";
const AMBAR = "#f59e0b";
const ROXO = "#7c3aed";
const VERMELHO = "#f87171";

const timeline = [
  { tempo: "0:00–0:10", bloco: "Abertura & Contexto", cor: ROXO },
  { tempo: "0:10–0:30", bloco: "O que são Agentes CLI", cor: "#0ea5e9" },
  { tempo: "0:30–0:55", bloco: "Harnesses, Skills & Extensões", cor: "#10b981" },
  { tempo: "0:55–1:10", bloco: "Economia de Contexto & PRDs", cor: AMBAR },
  { tempo: "1:10–1:30", bloco: "Prática: Multi-agentes em Python", cor: VERDE },
  { tempo: "Bônus", bloco: "Deploy, CI/CD & Agentes em Produção", cor: "#ec4899" },
];

const secoes = [
  // =====================================================================
  // ① ABERTURA & CONTEXTO
  // =====================================================================
  {
    id: "abertura",
    titulo: "① Abertura & Contexto",
    subtitulo: "0:00 – 0:10 min",
    cor: ROXO,
    conteudo: [
      {
        tipo: "pitch",
        texto: `"Você já passou horas procurando um bug, lendo docs, abrindo 30 abas no browser?
Imagine um assistente que lê o projeto, entende o erro, pesquisa a solução e abre o PR — enquanto você toma um café."`,
      },
      {
        tipo: "conceito",
        titulo: "Por que isso importa AGORA (2025)?",
        texto: `Em 2023 LLMs só conversavam. Em 2024 ganharam "tool use". Em 2025 viraram agentes
autônomos que rodam no seu terminal, leem seu código, executam comandos e abrem Pull Requests.
A diferença entre um dev que sabe orquestrar agentes e um que não sabe está virando o
novo "saber usar Google" — uma habilidade que multiplica produtividade em 3-10x.
Este minicurso te dá o mapa: do conceito à orquestração de múltiplos agentes em produção.`,
      },
      {
        tipo: "topicos",
        titulo: "O que o aluno vai sair sabendo fazer:",
        itens: [
          "Usar agentes CLI (Claude Code, Gemini CLI) para resolver problemas reais",
          "Entender o loop ReAct e a anatomia de uma chamada de ferramenta (tool call)",
          "Configurar harnesses de browser, ferramentas (MCP) e skills customizadas",
          "Economizar tokens e compactar contexto em projetos longos",
          "Escrever PRDs que um agente transforma em código funcional",
          "Orquestrar múltiplos agentes em Python com CrewAI / LangGraph / AutoGen",
        ],
      },
      {
        tipo: "ecosistema",
        titulo: "O ecossistema em 1 minuto:",
        itens: [
          { nome: "Gemini CLI", desc: "CLI do Google, gratuito, bom ponto de entrada" },
          { nome: "Claude Code", desc: "Agente de engenharia da Anthropic (você está usando agora)" },
          { nome: "Cursor / Windsurf", desc: "IDEs com agentes embutidos no editor" },
          { nome: "Harness", desc: "Adaptadores que dão ao agente browser, terminal, arquivos" },
          { nome: "MCP (Model Context Protocol)", desc: "Padrão aberto para conectar agentes a ferramentas" },
          { nome: "Skills / SKILL.md", desc: "Instruções especializadas carregadas sob demanda" },
        ],
      },
      {
        tipo: "aviso",
        variante: "info",
        titulo: "Pré-requisitos para acompanhar",
        texto: `Python 3.10+, Node 18+, uma conta com API key (Anthropic, Google ou OpenAI) e
um terminal. Não precisa ser expert — se você já fez um CRUD, está pronto.
Tudo que mostrarmos roda em máquina comum de estudante.`,
      },
      {
        tipo: "glossario",
        titulo: "Mini-glossário (volte aqui quando travar):",
        itens: [
          { termo: "LLM", def: "Large Language Model — o 'cérebro' (ex: Claude, Gemini, GPT)" },
          { termo: "Agente", def: "LLM + ferramentas + loop de decisão autônomo" },
          { termo: "Tool / Ferramenta", def: "Função que o agente pode chamar (ler arquivo, rodar bash...)" },
          { termo: "Contexto", def: "Tudo que o modelo 'enxerga' numa requisição (texto + código)" },
          { termo: "Token", def: "Pedaço de texto (~4 caracteres). É a unidade de custo" },
          { termo: "Harness", def: "A 'casca' que conecta o LLM ao mundo real (terminal, browser)" },
          { termo: "MCP", def: "Protocolo para plugar ferramentas externas no agente" },
          { termo: "PRD", def: "Product Requirements Document — o briefing do que construir" },
        ],
      },
      {
        tipo: "exercicio",
        nivel: "Aquecimento",
        titulo: "Exercício 0 — Instale e fale com um agente",
        enunciado: `Instale o Gemini CLI (gratuito) OU o Claude Code e peça a ele a primeira tarefa:
"Liste os arquivos desta pasta e me diga em uma frase o que este projeto faz."
Observe que ele NÃO só responde — ele executa comandos para descobrir a resposta.`,
        dicas: [
          "Gemini CLI: npm install -g @google/gemini-cli && gemini",
          "Claude Code: npm install -g @anthropic-ai/claude-code && claude",
          "Repare quantas vezes o agente 'pensa → age → observa' antes de responder",
        ],
      },
    ],
  },

  // =====================================================================
  // ② O QUE SÃO AGENTES CLI
  // =====================================================================
  {
    id: "conceitos",
    titulo: "② O que são Agentes CLI",
    subtitulo: "0:10 – 0:30 min",
    cor: "#0ea5e9",
    conteudo: [
      {
        tipo: "diagrama",
        titulo: "Loop de raciocínio do agente (ReAct = Reason + Act):",
        codigo: `┌─────────────────────────────────────────┐
│          LOOP DO AGENTE (ReAct)          │
├─────────────────────────────────────────┤
│  1. OBSERVE  → Recebe tarefa/contexto   │
│       ↓                                 │
│  2. THINK    → Raciocina (scratchpad)   │
│       ↓                                 │
│  3. ACT      → Chama ferramenta         │
│       ↓                                 │
│  4. OBSERVE  → Recebe resultado         │
│       ↓                                 │
│  5. REPEAT ou DONE                      │
└─────────────────────────────────────────┘`,
      },
      {
        tipo: "conceito",
        titulo: "Anatomia de um agente (as 4 peças)",
        texto: `1. MODELO (LLM): o cérebro que raciocina e decide.
2. FERRAMENTAS (tools): mãos e olhos — ler/escrever arquivos, rodar bash, pesquisar web.
3. LOOP / ORQUESTRADOR: o código que chama o modelo, executa as ferramentas e devolve
   os resultados — repetindo até a tarefa terminar.
4. CONTEXTO / MEMÓRIA: o histórico da conversa + arquivos relevantes que o modelo enxerga.

Tire qualquer peça e deixa de ser agente: sem ferramentas é só um chatbot;
sem loop é uma única resposta; sem contexto ele esquece tudo.`,
      },
      {
        tipo: "comparativo",
        titulo: "Chatbot comum vs Agente CLI:",
        colunas: ["Chatbot comum", "Agente CLI"],
        linhas: [
          ["Só responde com texto", "Executa ações reais"],
          ["Sem memória de arquivos", "Lê e edita seu projeto"],
          ["Não acessa internet", "Pode pesquisar, abrir URLs"],
          ["Uma resposta por vez", "Loop até concluir a tarefa"],
          ["Você implementa", "Ele implementa por você"],
          ["Você verifica tudo", "Ele roda os testes e se corrige"],
        ],
      },
      {
        tipo: "codigo_comentado",
        titulo: "Como o modelo 'pede' uma ferramenta — o tool call por dentro:",
        codigo: `# O modelo NÃO roda código. Ele devolve um JSON pedindo uma ação.
# O HARNESS executa e devolve o resultado. Exemplo de um turno:

# 1) O modelo responde com um pedido de ferramenta:
{
  "type": "tool_use",
  "name": "bash",
  "input": { "command": "pytest -q" }
}

# 2) O harness roda 'pytest -q' e devolve o resultado ao modelo:
{
  "type": "tool_result",
  "content": "3 failed, 12 passed in 1.2s"
}

# 3) O modelo lê o erro, decide corrigir, e pede outra ferramenta:
{
  "type": "tool_use",
  "name": "edit_file",
  "input": { "path": "src/auth.py", "old": "<=", "new": "<" }
}
# ...e o loop continua até "0 failed".`,
      },
      {
        tipo: "codigo_comentado",
        titulo: "Exemplo real — pedindo ao agente para criar uma API:",
        codigo: `# No terminal, com Claude Code:
$ claude "Crie uma API REST em FastAPI com CRUD de usuários,
  usando SQLite, com auth JWT e testes com pytest.
  Siga o padrão do projeto em ./src"

# O agente vai:
# 1. Ler os arquivos em ./src para entender o padrão
# 2. Criar models, routers, schemas
# 3. Escrever os testes
# 4. Rodar pytest e corrigir erros automaticamente
# 5. Retornar com tudo funcionando`,
      },
      {
        tipo: "topicos",
        titulo: "Ferramentas que um agente CLI tipicamente tem:",
        itens: [
          "bash / shell — executa comandos no terminal",
          "read_file / write_file / edit_file — lê e edita arquivos",
          "glob / grep — encontra arquivos e padrões no código",
          "web_search / web_fetch — pesquisa e lê páginas da internet",
          "browser — navega, clica, preenche formulários, tira screenshots",
          "code_execution — roda Python, Node, etc. num sandbox",
          "memory — persiste informações entre sessões",
          "subagent / task — delega sub-tarefas a outros agentes",
        ],
      },
      {
        tipo: "comparativo",
        titulo: "Níveis de autonomia (e quando usar cada um):",
        colunas: ["Nível", "Comportamento", "Quando usar"],
        linhas: [
          ["Sugestão", "Mostra o diff, você aplica", "Código crítico, produção"],
          ["Aprovação", "Pede OK antes de cada ação", "Aprendendo a confiar"],
          ["Auto (edição)", "Edita arquivos sozinho, não roda comandos perigosos", "Dia a dia"],
          ["Auto total (YOLO)", "Roda tudo sem perguntar", "Sandbox / experimentos descartáveis"],
        ],
      },
      {
        tipo: "aviso",
        variante: "warn",
        titulo: "Cuidado: o agente é um estagiário brilhante, não um sênior",
        texto: `Ele pode 'alucinar' uma biblioteca que não existe, deletar arquivos errados ou
commitar segredos. Regras de ouro: trabalhe em git (dá pra reverter), revise diffs,
nunca dê acesso de produção sem necessidade e desconfie de confiança excessiva.`,
      },
      {
        tipo: "quiz",
        titulo: "Quiz relâmpago",
        pergunta: "O que diferencia um agente CLI de um chatbot comum?",
        opcoes: [
          "O agente usa um modelo maior",
          "O agente executa ações em loop usando ferramentas até concluir a tarefa",
          "O agente é sempre mais barato",
          "O agente não precisa de internet",
        ],
        correta: 1,
        explicacao: "A essência é o LOOP + FERRAMENTAS: observar, raciocinar, agir e repetir até terminar — não só responder texto.",
      },
      {
        tipo: "exercicio",
        nivel: "Básico",
        titulo: "Exercício 1 — Faça o agente trabalhar em loop",
        enunciado: `Peça a um agente CLI: "Crie um script Python que conte palavras de um arquivo .txt,
escreva um teste com pytest, rode o teste e corrija até passar." Observe e anote:
quantas iterações do loop ReAct ele fez? Em qual passo ele se corrigiu sozinho?`,
        dicas: [
          "Use --verbose (ou modo equivalente) para ver o raciocínio",
          "Crie um arquivo .txt de exemplo antes para ele ter o que testar",
          "Se ele acertar de primeira, peça um requisito a mais para forçar uma correção",
        ],
      },
    ],
  },

  // =====================================================================
  // ③ HARNESSES, SKILLS & EXTENSÕES
  // =====================================================================
  {
    id: "harnesses",
    titulo: "③ Harnesses, Skills & Extensões",
    subtitulo: "0:30 – 0:55 min",
    cor: "#10b981",
    conteudo: [
      {
        tipo: "conceito",
        titulo: "O que é um Harness?",
        texto: `Um harness é o "colete de ferramentas" do agente. Ele define quais capacidades
o agente tem acesso naquela sessão e MEDIA tudo que ele faz: executa as ferramentas,
aplica permissões, faz o sandboxing e devolve os resultados ao modelo.
O Browser Harness, por exemplo, dá ao agente um Chromium real que ele controla via
código — ele vê a página, clica em elementos, extrai dados, preenche formulários.`,
      },
      {
        tipo: "codigo_comentado",
        titulo: "Browser Harness em ação — scraping com agente:",
        codigo: `# O agente recebe as ferramentas "navigate", "snapshot" e "click"
# e raciocina sobre o que vê na tela

Tarefa: "Acesse o portal do IFRN, encontre o calendário acadêmico
         de 2025 e extraia todas as datas de provas."

# Agente pensa:
# → navigate("https://ifrn.edu.br")
# → snapshot()  (lê a árvore de acessibilidade da página)
# → encontra o link "Calendário Acadêmico", click(ref)
# → baixa/lê o PDF
# → extrai as datas e retorna em JSON estruturado`,
      },
      {
        tipo: "conceito",
        titulo: "MCP — o 'USB-C' dos agentes",
        texto: `MCP (Model Context Protocol) é um padrão aberto criado pela Anthropic e adotado
amplamente. Em vez de cada agente ter integrações próprias, você roda um "MCP server"
(GitHub, Postgres, Slack, Figma...) e QUALQUER agente compatível pode plugar nele.
É a diferença entre cada aparelho ter um carregador exclusivo e todos usarem USB-C.`,
      },
      {
        tipo: "codigo_comentado",
        titulo: "Configurando um MCP server (ex: GitHub + Postgres):",
        codigo: `// .mcp.json  (ou config do Claude Code / Cursor)
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_TOKEN": "ghp_xxx" }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres",
               "postgresql://localhost/ifrn_tads"]
    }
  }
}

// Agora o agente pode: "Liste as PRs abertas e cruze com a tabela
// 'alunos' no banco para ver quem ainda não entregou o trabalho."`,
      },
      {
        tipo: "codigo_comentado",
        titulo: "Escrevendo uma ferramenta customizada (Python / Anthropic SDK):",
        codigo: `# Toda ferramenta = um schema (o que o modelo vê) + uma função (o que roda)

ferramenta = {
    "name": "consultar_nota",
    "description": "Consulta a nota de um aluno por matricula no SUAP.",
    "input_schema": {
        "type": "object",
        "properties": {
            "matricula": {"type": "string", "description": "Matricula IFRN"}
        },
        "required": ["matricula"]
    }
}

def consultar_nota(matricula: str) -> str:
    # aqui voce chama a API real do SUAP / banco
    return f"Aluno {matricula}: media 8.5, frequencia 92%"

# O harness liga o schema a funcao: quando o modelo pede 'consultar_nota',
# o seu codigo roda e o resultado volta pro modelo.`,
      },
      {
        tipo: "skill_box",
        titulo: "O que é uma SKILL.md?",
        codigo: `---
name: fastapi-padrao-ifrn
description: Use quando criar APIs FastAPI no projeto IFRN.
             Contém convenções, estrutura de pastas e padrões.
---

# Padrão FastAPI — IFRN TADS

## Estrutura de pastas
src/
  routers/      # Um arquivo por recurso
  models/       # SQLAlchemy models
  schemas/      # Pydantic schemas
  services/     # Lógica de negócio

## Convenções
- Sempre usar async/await
- Nomear rotas em português: /usuarios, /disciplinas
- Testes obrigatórios em tests/ com pytest`,
        explicacao: "A SKILL é injetada no contexto SÓ quando relevante (carregamento sob demanda). Economiza tokens e garante que o agente siga seus padrões sem você repetir a cada conversa.",
      },
      {
        tipo: "topicos",
        titulo: "Técnicas para estender o agente (da mais simples à mais avançada):",
        itens: [
          "CLAUDE.md / GEMINI.md — memória fixa do projeto, lida em toda sessão",
          "SKILL.md files — padrões carregados sob demanda quando relevantes",
          "Slash commands customizados — atalhos para prompts que você repete",
          "MCP Servers — plugue GitHub, Jira, Slack, banco de dados via protocolo padrão",
          "Custom tools — funções Python/JS que o agente pode chamar",
          "Hooks — código que roda ANTES/DEPOIS de cada ação (lint, format, guard-rails)",
          "Subagents — agentes especializados que o principal invoca para sub-tarefas",
        ],
      },
      {
        tipo: "codigo_comentado",
        titulo: "CLAUDE.md — configuração e memória do projeto:",
        codigo: `# CLAUDE.md (na raiz do projeto)

## Projeto
Sistema de gestão acadêmica do IFRN — TADS 2025

## Stack
- Backend: FastAPI + SQLAlchemy + PostgreSQL
- Frontend: React + Tailwind
- Testes: pytest (backend), Vitest (frontend)

## Regras
- NUNCA commitar na branch main diretamente
- Sempre rodar os testes antes de declarar a tarefa completa
- Usar Português para nomes de variáveis de domínio
- Documentar funções públicas com docstrings

## Contexto
Pasta /docs contém os requisitos funcionais.
Pasta /infra contém os Dockerfiles.`,
      },
      {
        tipo: "aviso",
        variante: "tip",
        titulo: "Hooks = guarda-corpos automáticos",
        texto: `Um hook pode rodar 'prettier' depois que o agente edita um arquivo, bloquear
'rm -rf', ou rejeitar um commit com segredos. É como ter um revisor automático que
nunca dorme. No Claude Code: configure em settings.json (PreToolUse / PostToolUse).`,
      },
      {
        tipo: "exercicio",
        nivel: "Intermediário",
        titulo: "Exercício 2 — Escreva sua primeira SKILL.md",
        enunciado: `Crie uma SKILL.md que ensine o agente o padrão de commits do seu time
(ex: Conventional Commits). Depois peça a ele para commitar uma mudança e veja se
ele seguiu o padrão SEM você precisar explicar de novo.`,
        dicas: [
          "Frontmatter precisa de 'name' e 'description' — a description é o gatilho",
          "Seja específico: dê exemplos de bons e maus commits dentro da skill",
          "Teste: peça um commit ANTES e DEPOIS de adicionar a skill, compare",
        ],
      },
      {
        tipo: "exercicio",
        nivel: "Intermediário",
        titulo: "Exercício 3 — Plugue um MCP server",
        enunciado: `Configure o MCP server do GitHub (ou do filesystem) e peça ao agente:
"Resuma as 3 últimas issues abertas e proponha qual atacar primeiro."
Observe que ele agora acessa dados externos sem você colar nada manualmente.`,
        dicas: [
          "Comece pelo server-filesystem ou server-github (mais fáceis)",
          "Precisa de um token? Gere um Personal Access Token com escopo mínimo",
          "Se não tiver repo, use o server-everything (demo) do MCP para testar",
        ],
      },
    ],
  },

  // =====================================================================
  // ④ ECONOMIA DE CONTEXTO & PRDs
  // =====================================================================
  {
    id: "contexto",
    titulo: "④ Economia de Contexto & PRDs",
    subtitulo: "0:55 – 1:10 min",
    cor: AMBAR,
    conteudo: [
      {
        tipo: "conceito",
        titulo: "Por que contexto importa?",
        texto: `Agentes CLI têm uma "janela de contexto" — um limite de tokens que conseguem processar
de uma vez (ex: 200K tokens ≈ 500 páginas). Quanto mais código, histórico e docs você
empurra, mais CARO, mais LENTO e — surpresa — menos PRECISO o agente fica: ele se perde
no meio de muito texto ("lost in the middle"). Compactar = economizar dinheiro E melhorar
a qualidade das respostas.`,
      },
      {
        tipo: "codigo_comentado",
        titulo: "A matemática do token (por que você deveria se importar):",
        codigo: `# Regra de bolso: 1 token ≈ 4 caracteres ≈ 0,75 palavra (em inglês).
# Português gasta um pouco mais de tokens que inglês.

# Exemplo de custo de UMA sessão longa mal gerenciada:
#   - node_modules colado por engano ......... ~50.000 tokens
#   - histórico de 2h de conversa ............ ~80.000 tokens
#   - 10 arquivos relidos 5x cada ............ ~60.000 tokens
#   TOTAL desperdiçado ....................... ~190.000 tokens

# Cada requisição reenvia TODO o contexto. Numa conversa de 40 turnos,
# 190K tokens podem ser reenviados dezenas de vezes = $$$ e lentidão.
# Compactar para ~20K mantém o agente rápido, barato e focado.`,
      },
      {
        tipo: "topicos",
        titulo: "Técnicas de economia de contexto:",
        itens: [
          "/compact ou /summarize — pede ao agente para resumir o histórico e continuar",
          "SKILL.md curtas e precisas — só o essencial, carregadas sob demanda",
          ".gitignore / .agentignore — esconda node_modules, .venv, builds, datasets",
          "Sessões por tarefa — comece uma conversa nova para cada feature",
          "Checkpoints — peça ao agente para escrever um resumo em arquivo e recomeçar",
          "Subagents — delegue buscas grandes; o subagente devolve só a conclusão",
          "Docstrings como contexto — código bem documentado = menos explicação necessária",
          "Aponte arquivos específicos (@arquivo.py) em vez de mandar ler a pasta toda",
        ],
      },
      {
        tipo: "codigo_comentado",
        titulo: "Compactação manual de contexto (checkpoint em arquivo):",
        codigo: `# Quando a conversa está longa, peça:

"Resuma o que fizemos até agora em um parágrafo técnico conciso,
 incluindo: arquivos criados/modificados, decisões tomadas,
 e próximos passos pendentes. Salve em .claude/sessao-2025-06-17.md"

# Depois inicie nova sessão (contexto limpo) com:
"Leia .claude/sessao-2025-06-17.md e continue de onde paramos."`,
      },
      {
        tipo: "comparativo",
        titulo: "Onde colocar a informação (contexto vs RAG vs ferramenta):",
        colunas: ["Estratégia", "Quando usar", "Custo de contexto"],
        linhas: [
          ["Colar no prompt", "Pouca info, usada agora", "Alto (sempre reenviado)"],
          ["CLAUDE.md / SKILL", "Padrões do projeto", "Médio (sob demanda)"],
          ["RAG / busca", "Muitos docs, busca pontual", "Baixo (só o trecho achado)"],
          ["Ferramenta/MCP", "Dado vivo (banco, API)", "Baixo (busca quando precisa)"],
        ],
      },
      {
        tipo: "prd_box",
        titulo: "O que é um PRD e por que é poderoso com agentes?",
        texto: `PRD = Product Requirements Document. Com agentes CLI, um PRD bem escrito
substitui horas de explicação. O agente lê o PRD e entrega o projeto. É o briefing
que transforma "faz um sisteminha aí" em software de verdade.`,
        codigo: `# PRD: Sistema de Controle de Frequência — IFRN TADS

## Objetivo
Aplicação web para professores registrarem frequência de alunos
em tempo real via QR Code gerado na aula.

## Usuários
- Professor: gera QR, vê relatório de presença
- Aluno: escaneia QR com o celular para registrar presença

## Funcionalidades
### MVP (entregar primeiro)
- [ ] Auth com matrícula IFRN (OAuth ou login simples)
- [ ] Gerar QR Code único por aula (expira em 15 min)
- [ ] Aluno escaneia e registra presença
- [ ] Dashboard do professor com lista de presentes

### Fase 2
- [ ] Exportar para Excel
- [ ] Integração com SUAP

## Stack decidida
- Backend: FastAPI + PostgreSQL
- Frontend: React + Tailwind
- Deploy: Docker no servidor do IFRN

## Critérios de aceite
- QR deve ser único e expirar em 15 minutos
- Não deve ser possível registrar presença duas vezes
- Dashboard atualiza em tempo real (WebSocket ou polling 10s)

## O que NÃO está no escopo
- App mobile nativo
- Biometria
- Integração com câmera`,
      },
      {
        tipo: "topicos",
        titulo: "Estrutura de um PRD eficiente para agentes:",
        itens: [
          "Objetivo claro em 1-2 frases (o agente precisa saber o 'porquê')",
          "Usuários e seus papéis (define regras de negócio)",
          "Funcionalidades separadas por MVP e fases futuras",
          "Stack decidida (evita o agente escolher por conta própria)",
          "Critérios de aceite mensuráveis (o agente sabe quando terminar)",
          "Fora do escopo explícito (evita que o agente invente features)",
          "Restrições técnicas (versões, limites, padrões obrigatórios)",
        ],
      },
      {
        tipo: "topicos",
        titulo: "Padrões de prompt que funcionam (leve pra vida):",
        itens: [
          "Dê um PAPEL: 'Você é um arquiteto sênior de FastAPI...'",
          "Peça um PLANO antes do código: 'Antes de codar, liste os passos e espere meu OK'",
          "Defina o FORMATO de saída: 'Responda só com o diff' / 'em JSON'",
          "Dê EXEMPLOS (few-shot): mostre 1 caso de entrada→saída esperada",
          "Estabeleça CRITÉRIO DE PRONTO: 'só termine quando pytest passar 100%'",
          "Use NEGATIVOS: 'NÃO instale libs novas sem perguntar'",
        ],
      },
      {
        tipo: "exercicio",
        nivel: "Intermediário",
        titulo: "Exercício 4 — Escreva um PRD e deixe o agente construir",
        enunciado: `Escolha um mini-projeto (encurtador de URL, lista de tarefas, bot de avisos da turma).
Escreva um PRD seguindo a estrutura acima. Entregue SÓ o PRD ao agente e peça:
"Leia o PRD, faça um plano, espere meu OK, depois implemente o MVP com testes."
Compare a qualidade com um pedido vago do tipo "faz um app de tarefas".`,
        dicas: [
          "Force o 'espere meu OK' — você revisa o plano antes de gastar tokens",
          "Inclua a seção 'Fora do escopo' — é o que mais evita retrabalho",
          "Critérios de aceite mensuráveis = o agente sabe quando parar",
        ],
      },
      {
        tipo: "exercicio",
        nivel: "Básico",
        titulo: "Exercício 5 — Pratique a compactação",
        enunciado: `Numa conversa longa com um agente, peça um resumo-checkpoint em arquivo,
abra uma sessão nova, mande ele ler o arquivo e continuar. Meça (aproximadamente)
quanto contexto você economizou comparando o tamanho do resumo com o histórico original.`,
        dicas: [
          "Peça o resumo em tópicos: feito / decisões / pendências",
          "Bom resumo cabe em < 1 página e ainda permite continuar sem perdas",
        ],
      },
    ],
  },

  // =====================================================================
  // ⑤ MULTI-AGENTES EM PYTHON
  // =====================================================================
  {
    id: "multiagentes",
    titulo: "⑤ Prática: Frameworks Multi-Agentes em Python",
    subtitulo: "1:10 – 1:30 min",
    cor: VERDE,
    conteudo: [
      {
        tipo: "conceito",
        titulo: "Por que multi-agentes?",
        texto: `Um único agente tem limitações de contexto e de especialização. Com múltiplos agentes,
você tem um orquestrador que delega para especialistas: um agente pesquisa, outro escreve
código, outro revisa, outro testa. Como uma equipe real de desenvolvimento — cada um com
seu próprio contexto focado, o que reduz erros e custo.`,
      },
      {
        tipo: "aviso",
        variante: "warn",
        titulo: "Mas primeiro: você PRECISA de multi-agentes?",
        texto: `Regra honesta: 80% das tarefas um agente único resolve. Multi-agentes adiciona
complexidade, custo (mais chamadas de LLM) e pontos de falha. Use quando a tarefa tem
etapas CLARAMENTE separáveis e especializadas. Não use multi-agente por status.`,
      },
      {
        tipo: "comparativo",
        titulo: "Principais frameworks:",
        colunas: ["Framework", "Paradigma", "Melhor para"],
        linhas: [
          ["CrewAI", "Papéis (Crew + Agents + Tasks)", "Workflows colaborativos simples"],
          ["LangGraph", "Grafo de estados", "Fluxos complexos com condicionais/loops"],
          ["AutoGen (Microsoft)", "Conversas entre agentes", "Código colaborativo, debugging"],
          ["Pydantic AI", "Type-safe, Pythônico", "Produção, integração com APIs"],
          ["OpenAI Agents SDK", "Handoffs entre agentes", "Pipelines com handoff e guard-rails"],
        ],
      },
      {
        tipo: "comparativo",
        titulo: "Padrões de orquestração:",
        colunas: ["Padrão", "Como funciona", "Exemplo"],
        linhas: [
          ["Sequencial", "A → B → C em fila", "Pesquisar → escrever → revisar"],
          ["Hierárquico", "Um gerente delega aos demais", "Gerente distribui sub-tarefas"],
          ["Paralelo", "Vários ao mesmo tempo, junta no fim", "3 agentes analisam 3 módulos"],
          ["Loop/condicional", "Repete até critério (ex: testes ok)", "Gerar→testar→corrigir"],
        ],
      },
      {
        tipo: "codigo_comentado",
        titulo: "CrewAI — equipe de desenvolvimento:",
        codigo: `# pip install crewai crewai-tools

from crewai import Agent, Task, Crew, Process
from crewai_tools import SerperDevTool, FileReadTool

# Ferramentas disponíveis
search_tool = SerperDevTool()
file_tool = FileReadTool()

# 1. Definir os agentes (papéis)
arquiteto = Agent(
    role="Arquiteto de Software",
    goal="Projetar a estrutura do sistema baseada nos requisitos",
    backstory="""Você é um arquiteto sênior especialista em FastAPI
    e sistemas distribuídos. Sempre considera escalabilidade.""",
    tools=[file_tool],
    verbose=True
)

desenvolvedor = Agent(
    role="Desenvolvedor Python",
    goal="Implementar o código limpo e com testes",
    backstory="""Você escreve código Python idiomático, sempre com
    type hints, docstrings e cobertura de testes acima de 80%.""",
    verbose=True
)

revisor = Agent(
    role="Code Reviewer",
    goal="Revisar código em busca de bugs, segurança e boas práticas",
    backstory="Você tem olho clínico para vulnerabilidades e code smells.",
    verbose=True
)

# 2. Definir as tarefas
tarefa_arquitetura = Task(
    description="""Leia o PRD em docs/prd.md e projete a arquitetura
    do sistema. Entregue: estrutura de pastas, lista de endpoints,
    modelos de dados e decisões técnicas.""",
    expected_output="Documento de arquitetura em Markdown",
    agent=arquiteto
)

tarefa_codigo = Task(
    description="""Com base na arquitetura definida, implemente o MVP.
    Crie os arquivos em src/ seguindo o padrão FastAPI.""",
    expected_output="Código funcional com testes passando",
    agent=desenvolvedor,
    context=[tarefa_arquitetura]  # depende da tarefa anterior
)

tarefa_revisao = Task(
    description="Revise o código produzido e aponte problemas críticos.",
    expected_output="Relatório de revisão com issues e sugestões",
    agent=revisor,
    context=[tarefa_codigo]
)

# 3. Criar e executar a crew
crew = Crew(
    agents=[arquiteto, desenvolvedor, revisor],
    tasks=[tarefa_arquitetura, tarefa_codigo, tarefa_revisao],
    process=Process.sequential,  # ou Process.hierarchical
    verbose=True
)

resultado = crew.kickoff()
print(resultado)`,
      },
      {
        tipo: "codigo_comentado",
        titulo: "LangGraph — fluxo com condicionais (loop de auto-correção):",
        codigo: `# pip install langgraph langchain-anthropic

from langgraph.graph import StateGraph, END
from langchain_anthropic import ChatAnthropic
from typing import TypedDict

# Estado compartilhado entre os nós
class EstadoProjeto(TypedDict):
    tarefa: str
    codigo: str
    testes_passando: bool
    tentativas: int

llm = ChatAnthropic(model="claude-sonnet-4-6")

# Nós do grafo (cada um é um "agente")
def gerar_codigo(state):
    resposta = llm.invoke(f"Escreva uma função Python que {state['tarefa']}")
    return {"codigo": resposta.content, "tentativas": state["tentativas"] + 1}

def rodar_testes(state):
    # Aqui você rodaria pytest de verdade
    passou = "def test_" in state["codigo"] or "assert" in state["codigo"]
    return {"testes_passando": passou}

def corrigir_codigo(state):
    resposta = llm.invoke(
        "Este código falhou nos testes. Corrija:\\n" + state["codigo"]
    )
    return {"codigo": resposta.content}

# Roteador — decide o próximo passo
def decidir_proximo(state):
    if state["testes_passando"]:
        return "finalizar"
    elif state["tentativas"] >= 3:
        return "finalizar"          # desiste após 3 tentativas
    return "corrigir"

# Construir o grafo
grafo = StateGraph(EstadoProjeto)
grafo.add_node("gerar", gerar_codigo)
grafo.add_node("testar", rodar_testes)
grafo.add_node("corrigir", corrigir_codigo)

grafo.set_entry_point("gerar")
grafo.add_edge("gerar", "testar")
grafo.add_conditional_edges(
    "testar", decidir_proximo,
    {"finalizar": END, "corrigir": "corrigir"}
)
grafo.add_edge("corrigir", "testar")

app = grafo.compile()
resultado = app.invoke({
    "tarefa": "calcule o fatorial de um número",
    "codigo": "", "testes_passando": False, "tentativas": 0
})
print(resultado["codigo"])`,
      },
      {
        tipo: "codigo_comentado",
        titulo: "AutoGen — dois agentes conversando (dev + crítico):",
        codigo: `# pip install pyautogen

from autogen import AssistantAgent, UserProxyAgent

config = {"model": "gpt-4o", "api_key": "sk-..."}

# Agente que escreve código
dev = AssistantAgent(
    name="dev",
    llm_config={"config_list": [config]},
    system_message="Você escreve Python limpo e com testes."
)

# Agente que executa o código e devolve o resultado/erro
executor = UserProxyAgent(
    name="executor",
    human_input_mode="NEVER",       # 100% automático
    code_execution_config={"work_dir": "saida", "use_docker": False},
    max_consecutive_auto_reply=5
)

# Eles conversam até a tarefa terminar
executor.initiate_chat(
    dev,
    message="Implemente bubble sort, rode um teste e mostre a saída."
)`,
      },
      {
        tipo: "topicos",
        titulo: "Indo para produção — o que ninguém te conta:",
        itens: [
          "Custo: cada agente extra = mais chamadas de LLM. Meça tokens por execução",
          "Loops infinitos: SEMPRE coloque max_tentativas / max_turns",
          "Observabilidade: use LangSmith / logs para ver o que cada agente fez",
          "Determinismo: temperatura baixa + prompts claros = menos surpresas",
          "Avaliação: crie um conjunto de testes (evals) para medir se está melhorando",
          "Falhas: trate timeouts e respostas inválidas — agentes erram, planeje pra isso",
          "Segurança: sandbox para execução de código, nunca rode código não confiável solto",
        ],
      },
      {
        tipo: "exercicio",
        nivel: "Avançado · Capstone",
        titulo: "Exercício 6 — Monte sua mini-equipe de agentes",
        enunciado: `Usando CrewAI OU LangGraph, monte uma crew de 3 papéis (pesquisador, dev, revisor)
que receba o PRD que você escreveu no Exercício 4 e produza: um doc de arquitetura,
o código do MVP e um relatório de revisão. Adicione um limite de tentativas e logue o
custo aproximado em tokens.`,
        dicas: [
          "Comece com Process.sequential — mais fácil de depurar",
          "Reaproveite o PRD do Ex.4 como entrada (context da primeira task)",
          "Adicione um critério de pronto: revisor aprova ou manda corrigir (loop)",
          "Veja exemplos-praticos-agentes.py e exercicios.py para o esqueleto pronto",
        ],
      },
      {
        tipo: "topicos",
        titulo: "Dicas finais para levar pra vida:",
        itens: [
          "Comece simples — um agente único já resolve 80% dos casos",
          "CLAUDE.md / GEMINI.md são seus melhores amigos: documente tudo",
          "Escreva PRDs antes de código — o agente entrega muito mais com um bom briefing",
          "Compacte o contexto regularmente em sessões longas",
          "Use multi-agentes quando a tarefa tiver etapas claramente separáveis",
          "Revise sempre o que o agente produziu — você é o engenheiro, ele é o estagiário",
        ],
      },
      {
        tipo: "recursos",
        titulo: "Documentação para se aprofundar:",
        links: [
          { label: "Claude Code Docs", url: "https://docs.anthropic.com/en/docs/claude-code", desc: "Guia oficial do agente da Anthropic" },
          { label: "Gemini CLI", url: "https://github.com/google-gemini/gemini-cli", desc: "CLI gratuito do Google (open source)" },
          { label: "Model Context Protocol", url: "https://modelcontextprotocol.io", desc: "Especificação e servers MCP" },
          { label: "CrewAI Docs", url: "https://docs.crewai.com", desc: "Multi-agentes por papéis" },
          { label: "LangGraph Docs", url: "https://langchain-ai.github.io/langgraph/", desc: "Grafos de estado para agentes" },
          { label: "AutoGen", url: "https://microsoft.github.io/autogen/", desc: "Conversas multi-agente (Microsoft)" },
          { label: "Anthropic — Building Agents", url: "https://www.anthropic.com/research/building-effective-agents", desc: "Padrões de design de agentes" },
          { label: "Prompt Engineering Guide", url: "https://www.promptingguide.ai", desc: "Técnicas de prompt (ReAct, few-shot...)" },
        ],
      },
    ],
  },

  // =====================================================================
  // ⑥ BÔNUS: DEPLOY, CI/CD & AGENTES EM PRODUÇÃO
  // =====================================================================
  {
    id: "deploy",
    titulo: "⑥ Bônus: Deploy, CI/CD & Agentes em Produção",
    subtitulo: "Material extra",
    cor: "#ec4899",
    conteudo: [
      {
        tipo: "conceito",
        titulo: "Do terminal para a nuvem: onde agentes rodam",
        texto: `Até agora você rodou o agente na sua máquina, interativamente. Em produção ele roda
SOZINHO, sem humano no teclado: disparado por um evento (um push, uma issue, um cron).
Os lugares mais comuns: CI/CD (GitHub Actions), um container/serverless acionado por
webhook, ou um worker agendado. O segredo é o modo HEADLESS — o agente recebe a tarefa
por argumento, executa e devolve o resultado, sem prompts interativos.`,
      },
      {
        tipo: "comparativo",
        titulo: "Onde hospedar um agente:",
        colunas: ["Ambiente", "Disparado por", "Bom para"],
        linhas: [
          ["GitHub Actions", "push / PR / issue", "Revisão de PR, fix de bugs, docs"],
          ["Cron / scheduler", "horário", "Relatórios diários, triagem de issues"],
          ["Serverless (Lambda)", "webhook / fila", "Responder eventos sob demanda"],
          ["Container 24/7", "fila / API", "Bots interativos, alto volume"],
        ],
      },
      {
        tipo: "codigo_comentado",
        titulo: "Modo headless — agente sem interação (script/CI):",
        codigo: `# Claude Code em modo não-interativo: passa a tarefa e sai.
$ claude -p "Leia o erro em logs/erro.txt, corrija o código e rode os testes" \\
         --output-format json

# Gemini CLI headless:
$ gemini -p "Gere o CHANGELOG a partir dos commits desde a última tag"

# Útil em qualquer pipeline: a saída (JSON/texto) vira input do próximo passo.`,
      },
      {
        tipo: "codigo_comentado",
        titulo: "GitHub Actions — agente revisa toda PR automaticamente:",
        codigo: `# .github/workflows/revisao-agente.yml
name: Revisao por Agente
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  revisar:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write     # para comentar na PR
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }

      - name: Rodar agente de revisao
        env:
          ANTHROPIC_API_KEY: \${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          npm install -g @anthropic-ai/claude-code
          claude -p "Revise o diff desta PR (git diff origin/main).
            Aponte bugs, riscos de seguranca e melhorias.
            Seja conciso: 1 linha por problema." \\
            --output-format text > revisao.txt
          gh pr comment \${{ github.event.number }} --body-file revisao.txt
        # GH_TOKEN herdado automaticamente para o gh CLI`,
      },
      {
        tipo: "aviso",
        variante: "warn",
        titulo: "Segurança em CI — leia antes de dar a chave",
        texto: `Em CI o agente roda com acesso ao seu repo e a uma API key. Regras:
NUNCA exponha segredos em logs; use secrets do GitHub (nunca hardcode).
Dê permissões MÍNIMAS (read quando possível). Cuidado com 'pull_request_target'
em repos públicos — PRs de terceiros podem injetar comandos. Rode em sandbox e
limite o que o agente pode tocar.`,
      },
      {
        tipo: "topicos",
        titulo: "Guarda-corpos para agentes autônomos em produção:",
        itens: [
          "Orçamento de tokens/custo por execução — aborte se passar do limite",
          "Timeout e max de iterações — nada de loop infinito comendo créditos",
          "Lista branca de ferramentas — em CI, desligue o que não for necessário",
          "Tudo em git/branch — o agente nunca empurra direto na main",
          "Human-in-the-loop nos pontos críticos — aprovação antes de deploy/merge",
          "Logs e observabilidade — registre cada ação para auditar depois",
          "Idempotência — rodar de novo não deve duplicar efeitos",
        ],
      },
      {
        tipo: "comparativo",
        titulo: "Observabilidade — o que medir:",
        colunas: ["Métrica", "Por quê", "Ferramenta"],
        linhas: [
          ["Tokens / custo", "Não estourar orçamento", "Logs próprios, LangSmith"],
          ["Latência", "UX e custo de runner", "Métricas do CI"],
          ["Taxa de sucesso", "Saber se confia no agente", "Evals automatizados"],
          ["Ações executadas", "Auditoria e segurança", "Trace / logs estruturados"],
        ],
      },
      {
        tipo: "codigo_comentado",
        titulo: "Guard-rail simples de custo (wrapper em Python):",
        codigo: `import anthropic

LIMITE_TOKENS = 50_000          # teto por execução
gasto = 0

def chamar_com_teto(client, **kwargs):
    global gasto
    if gasto > LIMITE_TOKENS:
        raise RuntimeError(f"Orcamento estourado: {gasto} tokens")
    resp = client.messages.create(**kwargs)
    gasto += resp.usage.input_tokens + resp.usage.output_tokens
    print(f"[custo] +{resp.usage.output_tokens} | total={gasto}")
    return resp

# Em CI: se estourar, o job falha cedo em vez de consumir todos os creditos.`,
      },
      {
        tipo: "quiz",
        titulo: "Quiz relâmpago",
        pergunta: "Qual é a maior diferença ao rodar um agente em CI vs no seu terminal?",
        opcoes: [
          "Em CI o modelo é mais inteligente",
          "Em CI ele roda headless (sem humano), então guarda-corpos e segredos são críticos",
          "Em CI não precisa de API key",
          "Em CI o agente não pode editar arquivos",
        ],
        correta: 1,
        explicacao: "Sem humano no loop, qualquer erro vira automático. Por isso: permissões mínimas, limite de custo, sandbox e segredos via secrets — nunca hardcoded.",
      },
      {
        tipo: "exercicio",
        nivel: "Avançado",
        titulo: "Exercício 7 — Agente revisor na sua PR",
        enunciado: `Crie um workflow do GitHub Actions que, a cada PR aberta, roda um agente em modo
headless para revisar o diff e comentar na PR. Adicione um limite de custo e
permissões mínimas. Abra uma PR de teste e veja o comentário automático aparecer.`,
        dicas: [
          "Guarde a API key em Settings → Secrets → Actions (nunca no YAML)",
          "Use 'permissions: pull-requests: write' só onde precisa comentar",
          "Comece logando o diff num arquivo antes de mandar pro agente — depure barato",
          "Teste o comando 'claude -p ...' localmente antes de jogar no CI",
        ],
      },
      {
        tipo: "topicos",
        titulo: "Próximos passos — sua jornada depois do curso:",
        itens: [
          "Automatize 1 tarefa chata sua esta semana (changelog, triagem de issues...)",
          "Versione um CLAUDE.md no seu projeto real e evolua a cada sessão",
          "Monte um workflow de revisão de PR com agente (Exercício 7)",
          "Experimente um MCP server útil para o seu contexto (banco, Jira, Notion)",
          "Quando dominar 1 agente, evolua para multi-agentes só onde fizer sentido",
          "Compartilhe seus PRDs e skills com o time — conhecimento que escala",
        ],
      },
      {
        tipo: "recursos",
        titulo: "Aprofundar em produção:",
        links: [
          { label: "Claude Code em CI/CD", url: "https://docs.anthropic.com/en/docs/claude-code/github-actions", desc: "Rodar o agente no GitHub Actions" },
          { label: "Claude Code Headless", url: "https://docs.anthropic.com/en/docs/claude-code/sdk", desc: "SDK e modo não-interativo" },
          { label: "GitHub Actions Security", url: "https://docs.github.com/en/actions/security-guides", desc: "Segredos e permissões em workflows" },
          { label: "LangSmith", url: "https://docs.smith.langchain.com", desc: "Observabilidade e evals de agentes" },
        ],
      },
    ],
  },
];

// =====================================================================
// COMPONENTES
// =====================================================================

function CodeBlock({ codigo, grande }) {
  const [copiado, setCopiado] = useState(false);
  const copiar = () => {
    navigator.clipboard.writeText(codigo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  };
  return (
    <div style={{ position: "relative", marginTop: 12 }}>
      <button
        onClick={copiar}
        style={{
          position: "absolute", top: 8, right: 8,
          background: copiado ? VERDE : "#1e3a5f",
          color: copiado ? "#000" : TEXTO,
          border: "none", borderRadius: 4, padding: "2px 10px",
          fontSize: 11, cursor: "pointer", zIndex: 1
        }}
      >
        {copiado ? "✓ Copiado" : "Copiar"}
      </button>
      <pre style={{
        background: "#060d1a",
        border: `1px solid ${BORDA}`,
        borderRadius: 8,
        padding: "14px 16px",
        overflowX: "auto",
        fontSize: grande ? 15 : 12.5,
        lineHeight: 1.65,
        color: "#c9d1e8",
        margin: 0,
        fontFamily: "'Courier New', monospace"
      }}>
        {codigo}
      </pre>
    </div>
  );
}

function Quiz({ bloco }) {
  const [escolha, setEscolha] = useState(null);
  const respondido = escolha !== null;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ color: ACCENT, fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
        🧠 {bloco.titulo}
      </div>
      <div style={{
        background: CARD2, border: `1px solid ${BORDA}`,
        borderRadius: 10, padding: "14px 16px"
      }}>
        <div style={{ color: TEXTO, fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
          {bloco.pergunta}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {bloco.opcoes.map((op, i) => {
            const certa = i === bloco.correta;
            const escolhida = i === escolha;
            let bg = CARD, bd = BORDA, cor = TEXTO;
            if (respondido && certa) { bg = "#0a2010"; bd = "#10b981"; cor = "#6ee7b7"; }
            else if (respondido && escolhida && !certa) { bg = "#2a0a0a"; bd = "#f87171"; cor = "#fca5a5"; }
            return (
              <button key={i} onClick={() => !respondido && setEscolha(i)}
                disabled={respondido}
                style={{
                  textAlign: "left", background: bg, border: `1px solid ${bd}`,
                  color: cor, borderRadius: 7, padding: "9px 12px", fontSize: 13,
                  cursor: respondido ? "default" : "pointer"
                }}>
                {respondido && certa ? "✓ " : respondido && escolhida ? "✗ " : "○ "}{op}
              </button>
            );
          })}
        </div>
        {respondido && (
          <div style={{
            marginTop: 12, background: "#0a1628", border: `1px solid ${ACCENT}33`,
            borderRadius: 7, padding: "10px 12px", color: "#bae6fd", fontSize: 12.5
          }}>
            💡 {bloco.explicacao}
          </div>
        )}
      </div>
    </div>
  );
}

function Exercicio({ bloco }) {
  const [abrirDica, setAbrirDica] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        background: "linear-gradient(135deg, #14110a, #0a1410)",
        border: `1px solid ${VERDE}33`, borderLeft: `4px solid ${VERDE}`,
        borderRadius: 10, padding: "14px 16px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{
            background: VERDE, color: "#000", fontSize: 10, fontWeight: 800,
            padding: "2px 8px", borderRadius: 12, letterSpacing: 0.5
          }}>{bloco.nivel}</span>
          <span style={{ color: VERDE, fontSize: 14, fontWeight: 700 }}>✎ {bloco.titulo}</span>
        </div>
        <div style={{ color: TEXTO, fontSize: 13, lineHeight: 1.65, whiteSpace: "pre-line" }}>
          {bloco.enunciado}
        </div>
        {bloco.dicas && (
          <>
            <button onClick={() => setAbrirDica(!abrirDica)} style={{
              marginTop: 10, background: "transparent", border: `1px solid ${BORDA}`,
              color: ACCENT, borderRadius: 6, padding: "4px 12px", fontSize: 12, cursor: "pointer"
            }}>
              {abrirDica ? "▼ Ocultar dicas" : "▶ Ver dicas"}
            </button>
            {abrirDica && (
              <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                {bloco.dicas.map((d, i) => (
                  <div key={i} style={{
                    background: CARD, border: `1px solid ${BORDA}`, borderRadius: 6,
                    padding: "7px 11px", color: MUTED, fontSize: 12.5
                  }}>💡 {d}</div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const AVISO_ESTILO = {
  warn: { bg: "#1a1005", bd: "#f59e0b55", cor: "#fde68a", icon: "⚠️" },
  info: { bg: "#06121f", bd: "#38bdf855", cor: "#bae6fd", icon: "ℹ️" },
  tip: { bg: "#0a2010", bd: "#10b98155", cor: "#6ee7b7", icon: "💡" },
};

function Bloco({ bloco, i, grande }) {
  const fonteTit = grande ? 18 : 13;
  const fonteTxt = grande ? 17 : 13;

  if (bloco.tipo === "pitch") {
    return (
      <div style={{
        background: `linear-gradient(135deg, #1a0533, #0a1628)`,
        border: `1px solid #7c3aed44`, borderLeft: `4px solid #7c3aed`,
        borderRadius: 10, padding: "18px 20px", marginBottom: 16
      }}>
        <div style={{ fontSize: 13, color: VERDE, fontFamily: "monospace", marginBottom: 6 }}>
          // pitch de abertura
        </div>
        <div style={{ fontSize: grande ? 20 : 15, color: "#e2d9f3", fontStyle: "italic", lineHeight: 1.7 }}>
          {bloco.texto}
        </div>
      </div>
    );
  }
  if (bloco.tipo === "topicos") {
    return (
      <div style={{ marginBottom: 16 }}>
        {bloco.titulo && (
          <div style={{ color: ACCENT, fontSize: fonteTit, fontWeight: 600, marginBottom: 10 }}>
            {bloco.titulo}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {bloco.itens.map((item, j) => (
            <div key={j} style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              background: CARD2, border: `1px solid ${BORDA}`,
              borderRadius: 7, padding: "8px 12px"
            }}>
              <span style={{ color: VERDE, fontSize: fonteTxt, marginTop: 1 }}>▸</span>
              <span style={{ color: TEXTO, fontSize: fonteTxt, lineHeight: 1.5 }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (bloco.tipo === "ecosistema") {
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ color: ACCENT, fontSize: fonteTit, fontWeight: 600, marginBottom: 10 }}>
          {bloco.titulo}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {bloco.itens.map((item, j) => (
            <div key={j} style={{
              background: CARD2, border: `1px solid ${BORDA}`,
              borderRadius: 8, padding: "10px 14px"
            }}>
              <div style={{ color: VERDE, fontSize: grande ? 15 : 12, fontWeight: 700, marginBottom: 3 }}>
                {item.nome}
              </div>
              <div style={{ color: MUTED, fontSize: grande ? 14 : 12 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (bloco.tipo === "glossario") {
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ color: ACCENT, fontSize: fonteTit, fontWeight: 600, marginBottom: 10 }}>
          {bloco.titulo}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: grande ? "1fr 1fr" : "1fr 1fr", gap: 8 }}>
          {bloco.itens.map((item, j) => (
            <div key={j} style={{
              background: CARD2, border: `1px solid ${BORDA}`, borderRadius: 8, padding: "8px 12px"
            }}>
              <span style={{ color: AMBAR, fontSize: grande ? 15 : 12.5, fontWeight: 700 }}>{item.termo}</span>
              <span style={{ color: MUTED, fontSize: grande ? 14 : 12.5 }}> — {item.def}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (bloco.tipo === "diagrama" || bloco.tipo === "codigo_comentado") {
    return (
      <div style={{ marginBottom: 16 }}>
        {bloco.titulo && (
          <div style={{ color: ACCENT, fontSize: fonteTit, fontWeight: 600, marginBottom: 8 }}>
            {bloco.titulo}
          </div>
        )}
        <CodeBlock codigo={bloco.codigo} grande={grande} />
      </div>
    );
  }
  if (bloco.tipo === "comparativo") {
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ color: ACCENT, fontSize: fonteTit, fontWeight: 600, marginBottom: 10 }}>
          {bloco.titulo}
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: grande ? 15 : 12.5 }}>
            <thead>
              <tr>
                {bloco.colunas.map((col, j) => (
                  <th key={j} style={{
                    background: "#162033", color: VERDE, padding: "8px 12px",
                    textAlign: "left", border: `1px solid ${BORDA}`, fontWeight: 700
                  }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bloco.linhas.map((linha, j) => (
                <tr key={j}>
                  {linha.map((cel, k) => (
                    <td key={k} style={{
                      padding: "8px 12px", border: `1px solid ${BORDA}`,
                      color: k === 0 ? "#fbbf24" : TEXTO,
                      background: j % 2 === 0 ? CARD : CARD2,
                      fontSize: grande ? 15 : 12.5
                    }}>{cel}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  if (bloco.tipo === "conceito") {
    return (
      <div style={{
        background: CARD2, border: `1px solid ${BORDA}`,
        borderRadius: 10, padding: "14px 16px", marginBottom: 16
      }}>
        <div style={{ color: ACCENT, fontSize: fonteTit, fontWeight: 600, marginBottom: 8 }}>
          {bloco.titulo}
        </div>
        <div style={{ color: TEXTO, fontSize: fonteTxt, lineHeight: 1.7, whiteSpace: "pre-line" }}>
          {bloco.texto}
        </div>
      </div>
    );
  }
  if (bloco.tipo === "skill_box") {
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ color: ACCENT, fontSize: fonteTit, fontWeight: 600, marginBottom: 8 }}>
          {bloco.titulo}
        </div>
        <CodeBlock codigo={bloco.codigo} grande={grande} />
        {bloco.explicacao && (
          <div style={{
            background: "#0a2010", border: `1px solid #10b98133`,
            borderRadius: 7, padding: "10px 14px", marginTop: 8,
            color: "#6ee7b7", fontSize: grande ? 15 : 12.5
          }}>
            💡 {bloco.explicacao}
          </div>
        )}
      </div>
    );
  }
  if (bloco.tipo === "prd_box") {
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ color: ACCENT, fontSize: fonteTit, fontWeight: 600, marginBottom: 8 }}>
          {bloco.titulo}
        </div>
        <div style={{
          background: "#1a1005", border: `1px solid #f59e0b33`,
          borderRadius: 8, padding: "12px 14px", marginBottom: 10,
          color: "#fde68a", fontSize: fonteTxt, lineHeight: 1.6
        }}>
          {bloco.texto}
        </div>
        <CodeBlock codigo={bloco.codigo} grande={grande} />
      </div>
    );
  }
  if (bloco.tipo === "aviso") {
    const s = AVISO_ESTILO[bloco.variante] || AVISO_ESTILO.info;
    return (
      <div style={{
        background: s.bg, border: `1px solid ${s.bd}`, borderLeft: `4px solid ${s.bd}`,
        borderRadius: 10, padding: "12px 16px", marginBottom: 16
      }}>
        <div style={{ color: s.cor, fontSize: fonteTit, fontWeight: 700, marginBottom: 6 }}>
          {s.icon} {bloco.titulo}
        </div>
        <div style={{ color: s.cor, fontSize: fonteTxt, lineHeight: 1.65, whiteSpace: "pre-line", opacity: 0.92 }}>
          {bloco.texto}
        </div>
      </div>
    );
  }
  if (bloco.tipo === "recursos") {
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ color: ACCENT, fontSize: fonteTit, fontWeight: 600, marginBottom: 10 }}>
          {bloco.titulo}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: grande ? "1fr 1fr" : "1fr 1fr", gap: 8 }}>
          {bloco.links.map((l, j) => (
            <a key={j} href={l.url} target="_blank" rel="noopener noreferrer" style={{
              background: CARD2, border: `1px solid ${BORDA}`, borderRadius: 8,
              padding: "10px 14px", textDecoration: "none", display: "block"
            }}>
              <div style={{ color: ACCENT, fontSize: grande ? 15 : 12.5, fontWeight: 700 }}>↗ {l.label}</div>
              <div style={{ color: MUTED, fontSize: grande ? 14 : 12 }}>{l.desc}</div>
            </a>
          ))}
        </div>
      </div>
    );
  }
  if (bloco.tipo === "quiz") return <Quiz bloco={bloco} />;
  if (bloco.tipo === "exercicio") return <Exercicio bloco={bloco} />;
  return null;
}

function Timeline({ ativo, setAtivo }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
      {timeline.map((t, i) => (
        <button key={i} onClick={() => setAtivo(i)} style={{
          background: ativo === i ? t.cor : CARD,
          color: ativo === i ? "#fff" : MUTED,
          border: `1px solid ${ativo === i ? t.cor : BORDA}`,
          borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer",
          fontWeight: ativo === i ? 700 : 400, transition: "all 0.2s"
        }}>
          <div style={{ fontSize: 10, opacity: 0.8 }}>{t.tempo}</div>
          <div>{t.bloco}</div>
        </button>
      ))}
    </div>
  );
}

function Secao({ secao }) {
  return (
    <div>
      {secao.conteudo.map((bloco, i) => <Bloco key={i} bloco={bloco} i={i} />)}
    </div>
  );
}

// =====================================================================
// MODO APRESENTAÇÃO (slides em tela cheia)
// =====================================================================
function montarSlides() {
  const slides = [];
  // capa
  slides.push({ tipo: "capa" });
  secoes.forEach((secao) => {
    // slide de abertura da seção
    slides.push({ tipo: "secao_capa", secao });
    // um slide por bloco
    secao.conteudo.forEach((bloco) => {
      slides.push({ tipo: "bloco", secao, bloco });
    });
  });
  slides.push({ tipo: "fim" });
  return slides;
}

function Apresentacao({ sair }) {
  const slides = montarSlides();
  const [idx, setIdx] = useState(0);

  const ir = useCallback((delta) => {
    setIdx((i) => Math.min(slides.length - 1, Math.max(0, i + delta)));
  }, [slides.length]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") { e.preventDefault(); ir(1); }
      else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); ir(-1); }
      else if (e.key === "Home") setIdx(0);
      else if (e.key === "End") setIdx(slides.length - 1);
      else if (e.key === "Escape") sair();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ir, sair, slides.length]);

  const slide = slides[idx];
  const pct = Math.round((idx / (slides.length - 1)) * 100);

  return (
    <div style={{
      position: "fixed", inset: 0, background: FUNDO, zIndex: 100,
      display: "flex", flexDirection: "column", fontFamily: "'Inter','Segoe UI',sans-serif"
    }}>
      {/* barra de progresso */}
      <div style={{ height: 4, background: CARD }}>
        <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${VERDE}, ${ACCENT})`, transition: "width 0.2s" }} />
      </div>

      {/* topo */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 24px", borderBottom: `1px solid ${BORDA}` }}>
        <div style={{ color: MUTED, fontSize: 12 }}>
          {slide.secao ? slide.secao.titulo : "Minicurso Agentes CLI"}
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ color: MUTED, fontSize: 12 }}>{idx + 1} / {slides.length}</span>
          <button onClick={sair} style={{
            background: CARD2, color: TEXTO, border: `1px solid ${BORDA}`,
            borderRadius: 6, padding: "4px 12px", fontSize: 12, cursor: "pointer"
          }}>✕ Sair (Esc)</button>
        </div>
      </div>

      {/* corpo do slide */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ maxWidth: 1000, width: "100%" }}>
          {slide.tipo === "capa" && (
            <div style={{ textAlign: "center" }}>
              <div style={{ display: "inline-block", background: VERDE, color: "#000", fontWeight: 800, fontSize: 13, padding: "4px 14px", borderRadius: 20, letterSpacing: 1, marginBottom: 20 }}>
                IFRN · TADS · MINICURSO · 1h30
              </div>
              <h1 style={{ fontSize: 48, fontWeight: 800, margin: "0 0 14px", background: `linear-gradient(90deg, ${VERDE}, ${ACCENT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Agentes CLI: Da Teoria à Produção
              </h1>
              <p style={{ color: MUTED, fontSize: 20 }}>
                Harnesses · Skills · Contexto · PRDs · Multi-agentes em Python
              </p>
              <p style={{ color: VERDE, fontSize: 14, marginTop: 30 }}>→ use as setas ← → ou espaço para navegar</p>
            </div>
          )}
          {slide.tipo === "secao_capa" && (
            <div style={{ textAlign: "center" }}>
              <div style={{ color: slide.secao.cor, fontSize: 16, fontWeight: 700, marginBottom: 12 }}>{slide.secao.subtitulo}</div>
              <h1 style={{ fontSize: 44, fontWeight: 800, color: slide.secao.cor, margin: 0 }}>{slide.secao.titulo}</h1>
            </div>
          )}
          {slide.tipo === "bloco" && (
            <div>
              <div style={{ color: slide.secao.cor, fontSize: 14, fontWeight: 700, marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 }}>
                {slide.secao.titulo}
              </div>
              <Bloco bloco={slide.bloco} i={0} grande />
            </div>
          )}
          {slide.tipo === "fim" && (
            <div style={{ textAlign: "center" }}>
              <h1 style={{ fontSize: 44, fontWeight: 800, color: VERDE, margin: "0 0 16px" }}>Obrigado! 🚀</h1>
              <p style={{ color: TEXTO, fontSize: 20, marginBottom: 8 }}>Agora é praticar: comece pelo Exercício 0.</p>
              <p style={{ color: MUTED, fontSize: 16 }}>Você é o engenheiro. O agente é o estagiário brilhante.</p>
            </div>
          )}
        </div>
      </div>

      {/* navegação inferior */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 24px", borderTop: `1px solid ${BORDA}` }}>
        <button onClick={() => ir(-1)} disabled={idx === 0} style={{
          background: idx === 0 ? "#0a1020" : CARD2, color: idx === 0 ? "#374151" : TEXTO,
          border: `1px solid ${BORDA}`, borderRadius: 8, padding: "9px 20px",
          cursor: idx === 0 ? "not-allowed" : "pointer", fontSize: 13
        }}>← Anterior</button>
        <button onClick={() => ir(1)} disabled={idx === slides.length - 1} style={{
          background: idx === slides.length - 1 ? "#0a1020" : VERDE,
          color: idx === slides.length - 1 ? "#374151" : "#000",
          border: "none", borderRadius: 8, padding: "9px 20px",
          cursor: idx === slides.length - 1 ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 700
        }}>Próximo →</button>
      </div>
    </div>
  );
}

// =====================================================================
// APP
// =====================================================================
export default function App() {
  const [abaAtiva, setAbaAtiva] = useState(0);
  const [apresentando, setApresentando] = useState(false);

  if (apresentando) return <Apresentacao sair={() => setApresentando(false)} />;

  return (
    <div style={{
      background: FUNDO, minHeight: "100vh",
      fontFamily: "'Inter', 'Segoe UI', sans-serif", color: TEXTO, padding: "0"
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #060d1a 0%, #0f1f3d 100%)",
        borderBottom: `1px solid ${BORDA}`, padding: "20px 24px 16px"
      }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
            <div style={{
              background: VERDE, color: "#000", fontWeight: 800, fontSize: 11,
              padding: "3px 10px", borderRadius: 20, letterSpacing: 1
            }}>
              IFRN · TADS · MINICURSO
            </div>
            <div style={{ color: MUTED, fontSize: 12 }}>1h30min</div>
            <button onClick={() => setApresentando(true)} style={{
              marginLeft: "auto", background: VERDE, color: "#000", border: "none",
              borderRadius: 8, padding: "6px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer"
            }}>▶ Modo Apresentação</button>
          </div>
          <h1 style={{
            fontSize: 22, fontWeight: 800, margin: "0 0 4px",
            background: `linear-gradient(90deg, ${VERDE}, ${ACCENT})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>
            Agentes CLI: Da Teoria à Produção
          </h1>
          <p style={{ color: MUTED, fontSize: 13, margin: 0 }}>
            Harnesses · Skills · Economia de Contexto · PRDs · Multi-agentes em Python
          </p>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "20px 24px" }}>
        <Timeline ativo={abaAtiva} setAtivo={setAbaAtiva} />

        <div style={{
          background: CARD, border: `1px solid ${BORDA}`,
          borderTop: `3px solid ${secoes[abaAtiva].cor}`,
          borderRadius: 12, padding: "20px 22px", marginBottom: 20
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
            <div>
              <h2 style={{ margin: "0 0 4px", fontSize: 17, color: secoes[abaAtiva].cor }}>
                {secoes[abaAtiva].titulo}
              </h2>
              <div style={{ color: MUTED, fontSize: 12 }}>{secoes[abaAtiva].subtitulo}</div>
            </div>
          </div>
          <Secao secao={secoes[abaAtiva]} />
        </div>

        {/* Navegação */}
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <button onClick={() => setAbaAtiva(Math.max(0, abaAtiva - 1))} disabled={abaAtiva === 0}
            style={{
              background: abaAtiva === 0 ? "#0a1020" : CARD2,
              color: abaAtiva === 0 ? "#374151" : TEXTO,
              border: `1px solid ${BORDA}`, borderRadius: 8, padding: "9px 20px",
              cursor: abaAtiva === 0 ? "not-allowed" : "pointer", fontSize: 13
            }}>← Anterior</button>
          <div style={{ color: MUTED, fontSize: 12, display: "flex", alignItems: "center" }}>
            {abaAtiva + 1} / {secoes.length}
          </div>
          <button onClick={() => setAbaAtiva(Math.min(secoes.length - 1, abaAtiva + 1))}
            disabled={abaAtiva === secoes.length - 1}
            style={{
              background: abaAtiva === secoes.length - 1 ? "#0a1020" : VERDE,
              color: abaAtiva === secoes.length - 1 ? "#374151" : "#000",
              border: "none", borderRadius: 8, padding: "9px 20px",
              cursor: abaAtiva === secoes.length - 1 ? "not-allowed" : "pointer",
              fontSize: 13, fontWeight: 700
            }}>Próximo →</button>
        </div>

        {/* Rodapé */}
        <div style={{
          marginTop: 28, borderTop: `1px solid ${BORDA}`, paddingTop: 16,
          display: "flex", gap: 16, flexWrap: "wrap"
        }}>
          {[
            { label: "Claude Code", url: "https://docs.anthropic.com/en/docs/claude-code" },
            { label: "Gemini CLI", url: "https://github.com/google-gemini/gemini-cli" },
            { label: "CrewAI Docs", url: "https://docs.crewai.com" },
            { label: "LangGraph Docs", url: "https://langchain-ai.github.io/langgraph/" },
            { label: "MCP Protocol", url: "https://modelcontextprotocol.io" },
          ].map((link, i) => (
            <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
              style={{ color: ACCENT, fontSize: 12, textDecoration: "none" }}>
              ↗ {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
