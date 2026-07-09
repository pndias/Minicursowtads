// Gera minicurso.html (auto-contido, tema escuro) a partir dos dados do
// artefato React minicurso-agentes-cli.jsx, sem transcrever nada: extrai os
// arrays `timeline` e `secoes` do proprio .jsx e renderiza HTML paginado.
// Depois converte para PDF via Google Chrome headless.
//
// Uso: node gerar_pdf.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(DIR, "minicurso-agentes-cli.jsx");
const OUT_HTML = path.join(DIR, "minicurso.html");
const OUT_PDF = path.join(DIR, "minicurso.pdf");

// ---- Extrai os dados do .jsx (constantes de cor + timeline + secoes) --------
const raw = fs.readFileSync(SRC, "utf8");
const inicio = raw.indexOf("const VERDE");
const fim = raw.indexOf("// COMPONENTES");
if (inicio < 0 || fim < 0) throw new Error("nao achei os dados no .jsx");
const bloco = raw.slice(inicio, fim);
// eslint-disable-next-line no-new-func
const { timeline, secoes, cores } = new Function(
  bloco + "\nreturn { timeline, secoes, cores: { VERDE, VERDE_DIM, FUNDO, CARD, CARD2, BORDA, TEXTO, MUTED, ACCENT, AMBAR, ROXO, VERMELHO } };"
)();

// ---- Helpers ----------------------------------------------------------------
const esc = (s) =>
  String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
// texto com \n vira <br> e mantem quebras
const txt = (s) => esc(s).replaceAll("\n", "<br>");

function codeBlock(codigo) {
  return `<pre class="code">${esc(codigo)}</pre>`;
}

// ---- Render por tipo de bloco ----------------------------------------------
function renderBloco(b) {
  switch (b.tipo) {
    case "pitch":
      return `<div class="pitch">${txt(b.texto)}</div>`;

    case "conceito":
      return `<div class="card">
        ${b.titulo ? `<h3>${esc(b.titulo)}</h3>` : ""}
        <p>${txt(b.texto)}</p></div>`;

    case "topicos":
      return `<div class="card">
        ${b.titulo ? `<h3>${esc(b.titulo)}</h3>` : ""}
        <ul>${b.itens.map((i) => `<li>${txt(i)}</li>`).join("")}</ul></div>`;

    case "ecosistema":
      return `<div class="card">
        ${b.titulo ? `<h3>${esc(b.titulo)}</h3>` : ""}
        <ul class="defs">${b.itens
          .map(
            (i) =>
              `<li><span class="term">${esc(i.nome)}</span> — ${txt(i.desc)}</li>`
          )
          .join("")}</ul></div>`;

    case "glossario":
      return `<div class="card">
        ${b.titulo ? `<h3>${esc(b.titulo)}</h3>` : ""}
        <ul class="defs">${b.itens
          .map(
            (i) =>
              `<li><span class="term">${esc(i.termo)}</span> — ${txt(i.def)}</li>`
          )
          .join("")}</ul></div>`;

    case "aviso": {
      const v = b.variante || "info";
      return `<div class="aviso aviso-${v}">
        ${b.titulo ? `<div class="aviso-tit">${esc(b.titulo)}</div>` : ""}
        <div>${txt(b.texto)}</div></div>`;
    }

    case "diagrama":
    case "codigo_comentado":
      return `<div class="codewrap">
        ${b.titulo ? `<h3>${esc(b.titulo)}</h3>` : ""}
        ${codeBlock(b.codigo)}</div>`;

    case "comparativo":
      return `<div class="codewrap">
        ${b.titulo ? `<h3>${esc(b.titulo)}</h3>` : ""}
        <table><thead><tr>${b.colunas
          .map((c) => `<th>${esc(c)}</th>`)
          .join("")}</tr></thead>
        <tbody>${b.linhas
          .map(
            (l) => `<tr>${l.map((c) => `<td>${txt(c)}</td>`).join("")}</tr>`
          )
          .join("")}</tbody></table></div>`;

    case "quiz":
      return `<div class="quiz">
        <div class="quiz-tit">🧠 ${esc(b.titulo || "Quiz")}</div>
        <div class="quiz-perg">${esc(b.pergunta)}</div>
        <ul class="quiz-ops">${b.opcoes
          .map(
            (o, i) =>
              `<li class="${i === b.correta ? "certa" : ""}">${
                i === b.correta ? "✓" : "○"
              } ${esc(o)}</li>`
          )
          .join("")}</ul>
        <div class="quiz-exp">💡 ${txt(b.explicacao)}</div></div>`;

    case "exercicio":
      return `<div class="exerc">
        <div class="exerc-head"><span class="nivel">${esc(
          b.nivel
        )}</span> <span class="exerc-tit">✎ ${esc(b.titulo)}</span></div>
        <div class="exerc-enun">${txt(b.enunciado)}</div>
        ${
          b.dicas && b.dicas.length
            ? `<div class="dicas">${b.dicas
                .map((d) => `<div class="dica">💡 ${txt(d)}</div>`)
                .join("")}</div>`
            : ""
        }</div>`;

    case "skill_box":
      return `<div class="codewrap skillbox">
        <h3>🧩 ${esc(b.titulo)}</h3>
        ${codeBlock(b.codigo)}
        ${b.explicacao ? `<div class="nota">${txt(b.explicacao)}</div>` : ""}</div>`;

    case "prd_box":
      return `<div class="codewrap prdbox">
        <h3>📄 ${esc(b.titulo)}</h3>
        ${b.texto ? `<p>${txt(b.texto)}</p>` : ""}
        ${codeBlock(b.codigo)}</div>`;

    case "recursos":
      return `<div class="card">
        ${b.titulo ? `<h3>${esc(b.titulo)}</h3>` : ""}
        <ul class="links">${b.links
          .map(
            (l) =>
              `<li><span class="term">${esc(l.label)}</span> — ${esc(
                l.desc
              )}<br><span class="url">${esc(l.url)}</span></li>`
          )
          .join("")}</ul></div>`;

    default:
      return `<div class="card"><pre class="code">${esc(
        JSON.stringify(b, null, 2)
      )}</pre></div>`;
  }
}

// ---- Monta o HTML -----------------------------------------------------------
const timelineHTML = timeline
  .map(
    (t) =>
      `<div class="tl-item" style="border-left-color:${t.cor}">
        <span class="tl-tempo">${esc(t.tempo)}</span>
        <span class="tl-bloco">${esc(t.bloco)}</span></div>`
  )
  .join("");

const secoesHTML = secoes
  .map(
    (s) => `<section class="secao" style="--cor:${s.cor}">
      <div class="secao-head">
        <h2>${esc(s.titulo)}</h2>
        <span class="subtitulo">${esc(s.subtitulo)}</span>
      </div>
      ${s.conteudo.map(renderBloco).join("\n")}
    </section>`
  )
  .join("\n");

const C = cores;
const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<title>Minicurso — Agentes CLI</title>
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: ${C.FUNDO}; color: ${C.TEXTO};
    font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; }
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .wrap { max-width: 900px; margin: 0 auto; padding: 32px 28px; }
  .capa { text-align: center; padding: 60px 0 30px; }
  .capa h1 { font-size: 34px; margin: 0 0 8px; color: ${C.VERDE}; letter-spacing: .5px; }
  .capa .sub { color: ${C.MUTED}; font-size: 15px; }
  .capa .badge { display:inline-block; margin-top:18px; padding:6px 16px;
    border:1px solid ${C.BORDA}; border-radius:20px; color:${C.ACCENT}; font-size:13px; }
  h2 { font-size: 22px; margin: 0; color: var(--cor, ${C.VERDE}); }
  h3 { font-size: 14.5px; margin: 0 0 8px; color: ${C.ACCENT}; }
  p { font-size: 13.5px; line-height: 1.65; margin: 0; color: ${C.TEXTO}; }
  .agenda { background: ${C.CARD}; border: 1px solid ${C.BORDA}; border-radius: 12px;
    padding: 18px 20px; margin: 24px 0; }
  .agenda h3 { color: ${C.VERDE}; font-size: 16px; }
  .tl-item { border-left: 4px solid ${C.BORDA}; padding: 6px 12px; margin: 6px 0;
    background: ${C.CARD2}; border-radius: 4px; display:flex; gap:12px; align-items:center; }
  .tl-tempo { color: ${C.MUTED}; font-size: 12px; font-family: monospace; min-width: 110px; }
  .tl-bloco { color: ${C.TEXTO}; font-size: 13.5px; font-weight: 600; }
  .secao { page-break-before: always; padding-top: 10px; }
  .secao-head { border-bottom: 2px solid var(--cor); padding-bottom: 8px;
    margin-bottom: 16px; display:flex; align-items:baseline; gap:12px; flex-wrap:wrap; }
  .subtitulo { color: ${C.MUTED}; font-size: 12.5px; font-family: monospace; }
  .card, .codewrap, .aviso, .quiz, .exerc { margin: 12px 0; page-break-inside: avoid; }
  .card { background: ${C.CARD}; border: 1px solid ${C.BORDA}; border-radius: 10px;
    padding: 14px 16px; }
  ul { margin: 6px 0 0; padding-left: 20px; }
  li { font-size: 13px; line-height: 1.6; margin: 4px 0; color: ${C.TEXTO}; }
  ul.defs { list-style: none; padding-left: 0; }
  ul.defs li { border-bottom: 1px solid ${C.BORDA}; padding: 6px 0; }
  .term { color: ${C.VERDE}; font-weight: 700; }
  .url { color: ${C.ACCENT}; font-family: monospace; font-size: 11.5px; }
  .pitch { background: linear-gradient(135deg, #1a1030, #0a1420);
    border: 1px solid ${C.ROXO}55; border-left: 4px solid ${C.ROXO};
    border-radius: 10px; padding: 18px 20px; font-size: 15px; font-style: italic;
    line-height: 1.7; color: #e9d5ff; margin: 12px 0; }
  pre.code { background: #060d1a; border: 1px solid ${C.BORDA}; border-radius: 8px;
    padding: 12px 14px; overflow-x: auto; font-size: 11.5px; line-height: 1.6;
    color: #c9d1e8; margin: 8px 0 0; font-family: 'Courier New', monospace;
    white-space: pre-wrap; word-break: break-word; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12.5px; }
  th, td { border: 1px solid ${C.BORDA}; padding: 7px 10px; text-align: left;
    vertical-align: top; color: ${C.TEXTO}; }
  th { background: ${C.CARD2}; color: ${C.VERDE}; font-size: 12px; }
  .aviso { border-radius: 10px; padding: 12px 16px; border-left: 4px solid; }
  .aviso-tit { font-weight: 700; margin-bottom: 4px; font-size: 13.5px; }
  .aviso div:last-child { font-size: 13px; line-height: 1.6; }
  .aviso-info { background: #0a1a2a; border-color: ${C.ACCENT}; color: #bae6fd; }
  .aviso-warn { background: #2a1a08; border-color: ${C.AMBAR}; color: #fde68a; }
  .aviso-tip  { background: #0a2018; border-color: ${C.VERDE}; color: #a7f3d0; }
  .quiz { background: ${C.CARD2}; border: 1px solid ${C.BORDA}; border-radius: 10px;
    padding: 14px 16px; }
  .quiz-tit { color: ${C.ACCENT}; font-size: 13px; font-weight: 600; margin-bottom: 6px; }
  .quiz-perg { font-weight: 600; font-size: 14px; margin-bottom: 10px; }
  .quiz-ops { list-style: none; padding-left: 0; margin: 0; }
  .quiz-ops li { background: ${C.CARD}; border: 1px solid ${C.BORDA}; border-radius: 7px;
    padding: 8px 12px; margin: 6px 0; font-size: 13px; }
  .quiz-ops li.certa { background: #0a2010; border-color: ${C.VERDE}; color: #6ee7b7;
    font-weight: 600; }
  .quiz-exp { margin-top: 10px; background: #0a1628; border: 1px solid ${C.ACCENT}44;
    border-radius: 7px; padding: 9px 12px; color: #bae6fd; font-size: 12.5px; }
  .exerc { background: linear-gradient(135deg, #14110a, #0a1410);
    border: 1px solid ${C.VERDE}44; border-left: 4px solid ${C.VERDE};
    border-radius: 10px; padding: 14px 16px; }
  .exerc-head { display:flex; align-items:center; gap:8px; margin-bottom:8px; flex-wrap:wrap; }
  .nivel { background: ${C.VERDE}; color: #000; font-size: 10px; font-weight: 800;
    padding: 2px 8px; border-radius: 12px; letter-spacing: .5px; }
  .exerc-tit { color: ${C.VERDE}; font-size: 14px; font-weight: 700; }
  .exerc-enun { font-size: 13px; line-height: 1.65; }
  .dicas { margin-top: 8px; }
  .dica { background: ${C.CARD}; border: 1px solid ${C.BORDA}; border-radius: 6px;
    padding: 6px 11px; color: ${C.MUTED}; font-size: 12px; margin: 5px 0; }
  .nota { margin-top: 8px; font-size: 12px; color: ${C.MUTED}; line-height: 1.6;
    font-style: italic; }
  .skillbox h3 { color: #a7f3d0; }
  .prdbox h3 { color: ${C.AMBAR}; }
</style></head><body><div class="wrap">
  <div class="capa">
    <h1>Agentes CLI na Prática</h1>
    <div class="sub">Do conceito à orquestração de múltiplos agentes em produção</div>
    <div class="sub" style="margin-top:6px">Minicurso — TADS / IFRN</div>
    <div class="badge">Material completo · 6 módulos · exercícios & quizzes</div>
  </div>
  <div class="agenda">
    <h3>🗓️ Agenda</h3>
    ${timelineHTML}
  </div>
  ${secoesHTML}
</div></body></html>`;

fs.writeFileSync(OUT_HTML, html);
console.log("HTML gerado:", OUT_HTML, `(${(html.length / 1024).toFixed(1)} KB)`);

// ---- Converte para PDF via Chrome headless ---------------------------------
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
if (fs.existsSync(CHROME)) {
  try {
    execFileSync(
      CHROME,
      [
        "--headless=new",
        "--disable-gpu",
        "--no-pdf-header-footer",
        `--print-to-pdf=${OUT_PDF}`,
        `file://${OUT_HTML}`,
      ],
      { stdio: "ignore" }
    );
    const kb = (fs.statSync(OUT_PDF).size / 1024).toFixed(1);
    console.log("PDF gerado:", OUT_PDF, `(${kb} KB)`);
  } catch (e) {
    console.error("Falha ao gerar PDF via Chrome:", e.message);
    console.error("Abra minicurso.html no navegador e use Ctrl+P → Salvar como PDF.");
  }
} else {
  console.log("Chrome nao encontrado — abra minicurso.html e imprima como PDF (Ctrl+P).");
}
