import esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '..', 'dist');
const outHtmlPath = path.join(outDir, 'studio-launcher.html');

const built = await esbuild.build({
  entryPoints: [path.join(__dirname, 'src', 'app.ts')],
  bundle: true,
  minify: true,
  format: 'iife',
  target: ['es2020'],
  write: false,
});

const jsBundle = built.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>NotebookLM 2-Step Workbench</title>
<style>
  :root {
    --bg-primary: var(--color-background-primary, transparent);
    --bg-card: var(--color-background-secondary, rgba(127, 127, 127, 0.08));
    --bg-chip: var(--color-background-tertiary, rgba(127, 127, 127, 0.14));
    --bg-input: var(--color-background-primary, rgba(127, 127, 127, 0.06));
    --fg-primary: var(--color-text-primary, #1f2328);
    --fg-muted: var(--color-text-secondary, #656d76);
    --bd-primary: var(--color-border-primary, rgba(127, 127, 127, 0.25));
    --accent: var(--color-ring-primary, #2563eb);
    --font-ui: var(--font-sans, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
  }
  [data-theme="dark"] {
    --fg-primary: var(--color-text-primary, #f0f6fc);
    --fg-muted: var(--color-text-secondary, #9198a1);
    --bg-card: var(--color-background-secondary, rgba(255, 255, 255, 0.05));
    --bg-chip: var(--color-background-tertiary, rgba(255, 255, 255, 0.1));
    --bg-input: var(--color-background-primary, rgba(0, 0, 0, 0.2));
    --bd-primary: var(--color-border-primary, rgba(255, 255, 255, 0.16));
  }
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    background: var(--bg-primary);
    color: var(--fg-primary);
    font-family: var(--font-ui);
    font-size: 13px;
    line-height: 1.35;
    -webkit-font-smoothing: antialiased;
  }
  .wrap {
    padding: 8px 2px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--bd-primary);
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .badge {
    width: 20px;
    height: 20px;
    border-radius: 5px;
    background: var(--accent);
    color: #fff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    flex-shrink: 0;
  }
  .nb-title {
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .nb-meta {
    font-size: 11px;
    color: var(--fg-muted);
    white-space: nowrap;
    flex-shrink: 0;
  }
  .top-controls {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  .lang-wrap {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
  .lang-label {
    font-size: 11px;
    color: var(--fg-muted);
    white-space: nowrap;
  }
  .section {
    display: flex;
    flex-direction: column;
    gap: 7px;
    padding: 8px 9px;
    border-radius: 8px;
    background: var(--bg-card);
    border: 1px solid var(--bd-primary);
  }
  .sec-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    flex-wrap: wrap;
  }
  .sec-title {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: var(--fg-muted);
  }
  .existing-banner {
    font-size: 11px;
    padding: 4px 8px;
    border-radius: 6px;
    background: var(--bg-chip);
    color: var(--fg-primary);
    border: 1px solid var(--bd-primary);
  }
  .chosen-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 4px 8px;
    border-radius: 6px;
    background: var(--bg-chip);
    border: 1px solid var(--bd-primary);
  }
  .chosen-text {
    font-size: 11px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .pill-row {
    display: flex;
    align-items: center;
    gap: 5px;
    flex-wrap: wrap;
  }
  .pill {
    appearance: none;
    border: 1px solid var(--bd-primary);
    background: transparent;
    color: var(--fg-muted);
    font: inherit;
    font-size: 11px;
    padding: 3px 8px;
    border-radius: 999px;
    cursor: pointer;
    transition: border-color 120ms ease, color 120ms ease, background-color 120ms ease;
  }
  .pill:hover {
    color: var(--fg-primary);
    border-color: var(--accent);
  }
  .pill.active {
    background: var(--accent);
    border-color: var(--accent);
    color: #fff;
    font-weight: 600;
  }
  .pill-ic {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
  .ic {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .ref-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .ref-badge {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    background: var(--bg-chip);
    border: 1px solid var(--bd-primary);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .src-row {
    display: flex;
    gap: 6px;
    align-items: stretch;
  }
  .src-inputs {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 5px;
    min-width: 0;
  }
  .ctrl, .select {
    width: 100%;
    background: var(--bg-input);
    color: var(--fg-primary);
    border: 1px solid var(--bd-primary);
    border-radius: 6px;
    padding: 5px 8px;
    font: inherit;
    font-size: 12px;
    outline: none;
  }
  .ctrl:focus, .select:focus {
    border-color: var(--accent);
  }
  textarea.ctrl {
    resize: vertical;
    min-height: 46px;
    max-height: 96px;
  }
  .inline-opts {
    display: flex;
    gap: 6px;
  }
  .select {
    width: auto;
    flex: 1;
    padding: 4px 6px;
    font-size: 11px;
  }
  .btn-add {
    appearance: none;
    border: 1px solid var(--bd-primary);
    background: var(--bg-chip);
    color: var(--fg-primary);
    font: inherit;
    font-size: 12px;
    font-weight: 600;
    padding: 0 10px;
    border-radius: 6px;
    cursor: pointer;
    white-space: nowrap;
  }
  .btn-add:hover { border-color: var(--accent); }
  .hint {
    font-size: 11px;
    color: var(--fg-muted);
  }
  .staged-list {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }
  .src-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    padding: 2px 7px;
    border-radius: 999px;
    background: var(--bg-chip);
    border: 1px solid var(--bd-primary);
    max-width: 100%;
  }
  .src-chip-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 220px;
  }
  .src-chip-x {
    appearance: none;
    border: none;
    background: transparent;
    color: var(--fg-muted);
    cursor: pointer;
    padding: 0 2px;
    font-size: 13px;
    line-height: 1;
  }
  .src-chip-x:hover { color: var(--fg-primary); }
  .chk-wrap {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: var(--fg-muted);
    cursor: pointer;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 6px;
  }
  @media (max-width: 520px) {
    .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  .tile {
    appearance: none;
    text-align: left;
    background: var(--bg-input);
    color: var(--fg-primary);
    border: 1px solid var(--bd-primary);
    border-radius: 8px;
    padding: 6px 8px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 4px;
    transition: border-color 120ms ease, box-shadow 120ms ease;
    font: inherit;
  }
  .tile:hover { border-color: var(--accent); }
  .tile.selected {
    border-color: var(--accent);
    box-shadow: 0 0 0 1px var(--accent);
  }
  .tile-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
  }
  .tile-icon {
    width: 20px;
    height: 20px;
    border-radius: 5px;
    background: var(--bg-chip);
    color: var(--fg-primary);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .tile.selected .tile-icon {
    background: var(--accent) !important;
    color: #fff !important;
  }
  .tile-tag {
    font-size: 10px;
    padding: 1px 5px;
    border-radius: 999px;
    background: var(--bg-chip);
    color: var(--fg-muted);
    white-space: nowrap;
  }
  .tile.selected .tile-tag {
    color: var(--fg-primary);
    font-weight: 600;
  }
  .tile-label {
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .sub-bar {
    display: flex;
    align-items: center;
    gap: 5px;
    flex-wrap: wrap;
    padding-top: 2px;
  }
  .sub-label {
    font-size: 11px;
    color: var(--fg-muted);
  }
  .select-compact {
    width: auto;
    flex: 0 0 auto;
    padding: 2px 7px;
    font-size: 11px;
    border-radius: 999px;
  }
  .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding-top: 6px;
    border-top: 1px solid var(--bd-primary);
  }
  .detail { min-width: 0; flex: 1; }
  .detail-title {
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .detail-sub {
    font-size: 11px;
    color: var(--fg-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .actions {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }
  .btn-ghost {
    appearance: none;
    border: 1px solid var(--bd-primary);
    background: transparent;
    color: var(--fg-muted);
    font: inherit;
    font-size: 12px;
    padding: 5px 9px;
    border-radius: 6px;
    cursor: pointer;
  }
  .btn-ghost:hover { color: var(--fg-primary); }
  .btn-primary {
    appearance: none;
    border: 1px solid transparent;
    background: var(--accent);
    color: #fff;
    font: inherit;
    font-size: 12px;
    font-weight: 600;
    padding: 5px 12px;
    border-radius: 6px;
    cursor: pointer;
    transition: opacity 120ms ease;
  }
  .btn-primary:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
  [hidden] { display: none !important; }
</style>
</head>
<body>
  <div class="wrap">
    <div class="topbar">
      <div class="brand">
        <span class="badge">N</span>
        <span id="nb-title" class="nb-title">NotebookLM Studio</span>
      </div>
      <div class="top-controls">
        <label class="lang-wrap" for="lang-select">
          <span class="ic"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></span>
          <span class="lang-label">Output language</span>
          <select id="lang-select" class="select select-compact" aria-label="Output language"></select>
        </label>
        <span id="nb-sources" class="nb-meta">Step 1 of 2</span>
      </div>
    </div>

    <div id="step1-panel" class="section">
      <div class="sec-head">
        <span class="sec-title">1. What do you want to create?</span>
        <div class="pill-row">
          <button id="act-extract" type="button" class="pill pill-ic"><span class="ic"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg></span><span>Extract Transcript</span></button>
          <button id="act-ask" type="button" class="pill pill-ic"><span class="ic"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span><span>Ask Question</span></button>
          <label id="ephemeral-step1-wrap" class="chk-wrap" hidden><input id="ephemeral-chk-1" type="checkbox" /> Delete after done</label>
        </div>
      </div>
      <div id="existing-sources-bar" class="existing-banner" hidden></div>
      <div id="ask-wrap" hidden>
        <input id="ask-input" class="ctrl" type="text" placeholder="Question to ask with inline source citations..." />
      </div>
      <div id="tile-grid" class="grid"></div>
      <div id="report-subbar" class="sub-bar" hidden></div>
    </div>

    <div id="step2-panel" class="section" hidden>
      <div class="chosen-bar">
        <span id="chosen-summary" class="chosen-text">Creating: ...</span>
        <button id="back-top-btn" type="button" class="pill">Change</button>
      </div>
      <div class="sec-head">
        <span class="sec-title">2. Add Data Sources</span>
        <div id="src-tabs" class="pill-row"></div>
      </div>
      <div class="src-row">
        <div class="src-inputs">
          <div id="research-opts" class="inline-opts" hidden>
            <select id="research-scope" class="select"></select>
            <select id="research-mode" class="select"></select>
          </div>
          <div id="ref-row" class="ref-row" hidden>
            <span id="ref-icon" class="ref-badge"></span>
            <select id="ref-kind" class="select">
              <option value="Drive">Google Drive</option>
              <option value="Play Books">Play Books</option>
              <option value="Textbooks">Textbooks</option>
              <option value="Existing notebook">Existing notebook (title / URL)</option>
            </select>
          </div>
          <textarea id="src-textarea" class="ctrl" rows="2" placeholder="Paste YouTube or website URLs..."></textarea>
          <input id="src-single" class="ctrl" type="text" hidden />
        </div>
        <button id="add-src-btn" type="button" class="btn-add">+ Add</button>
      </div>
      <div class="sec-head">
        <span id="src-hint" class="hint"></span>
        <label class="chk-wrap"><input id="ephemeral-chk-2" type="checkbox" /> Delete after done</label>
      </div>
      <div id="staged-list" class="staged-list" hidden></div>
    </div>

    <div class="footer">
      <div class="detail">
        <div id="detail-title" class="detail-title">1. What would you like to create?</div>
        <div id="detail-sub" class="detail-sub">Pick Studio deliverables, Extract Transcript, or Ask Question</div>
      </div>
      <div class="actions">
        <button id="back-btn" type="button" class="btn-ghost" hidden>&lt;- Back</button>
        <button id="add-more-btn" type="button" class="btn-ghost" hidden>+ Add sources</button>
        <button id="clear-btn" type="button" class="btn-ghost" hidden>Clear</button>
        <button id="primary-btn" type="button" class="btn-primary" disabled>Next: Add Sources -&gt;</button>
      </div>
    </div>
  </div>
  <script>${jsBundle}</script>
</body>
</html>
`;

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outHtmlPath, html, 'utf8');
console.log(`Built ${outHtmlPath} (${Buffer.byteLength(html, 'utf8')} bytes)`);
