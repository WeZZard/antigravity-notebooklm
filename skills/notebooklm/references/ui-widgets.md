# Interactive UI Runbook (2-Step Pre-Flight Workbench & Inline Views)

Render rich, non-blocking interactive UI inline in Antigravity chat:
- **NotebookLM 2-Step Pre-Flight Workbench** -> via the bundled **MCP App** tool `notebooklm_studio_launcher` (`antigravity-notebooklm_studio-ui`, `ui://notebooklm/studio-launcher.html`), dynamically backed by `mcp/capabilities.json`. Collects **"1. What do you want to create?"** first, then **"2. Add data sources"** (automatically skipping Step 2 if sources are already provided), with zero browser wait before submission.
- **Source & YouTube Transcript Explorer** -> via `<agent-embed>` inline HTML when presenting long primary transcripts.

---

## 1. Adaptive 2-Step Workbench (`notebooklm_studio_launcher`)

Use **immediately without opening the browser first** whenever sources and/or deliverables are missing:

| What the User Already Provided | Tool Arguments to Pass | Workbench Behavior |
| :--- | :--- | :--- |
| **Neither sources nor deliverables** (bare `/notebooklm`) | `{}` | Opens **Step 1 ("1. What do you want to create?")** -> user clicks `Next: Add Sources ->` -> **Step 2 ("2. Add Data Sources")** -> **Launch**. |
| **Sources provided, deliverables unspecified** (e.g., passed YouTube URL, file, or active notebook) | `{"sources": [...], "sourcesCount": N, "hasSources": true, "notebookTitle": "...", "notebookUrl": "..."}` | Opens **Step 1 only** — **automatically skips Step 2** (with an optional `+ Add more sources` button); user clicks **Launch** directly. |
| **Deliverables provided, no sources yet** (e.g., *"Make a Slide Deck and Quiz"*) | `{"preselectedDeliverables": ["Slide Deck", "Quiz"]}` | Jumps directly to **Step 2 ("2. Add Data Sources")** with those deliverables preselected -> user attaches sources and clicks **Launch**. |
| **Both sources and deliverables provided** | *(Do not open the workbench)* | Skip the launcher and execute directly via `extract` / `create` / `ask`. |

### Supported Choices & Visual Iconography Inside the 2-Step Workbench
Backed dynamically by `mcp/capabilities.json` (kept current by `/notebooklm-sync`), every button, source tab, staged source chip, and Studio tile uses crisp, color-coded **inline SVG iconography** matching NotebookLM's visual language (100% CSP-compliant, zero external icon requests):
- **Persistent Top-Bar `Output language` Dropdown Menu**: Always visible on both Step 1 and Step 2 with a globe icon and explicit `Output language` label (`Auto (Chat)`, `Account Default`, `English`, `Simplified Chinese`, `Traditional Chinese`, `Japanese`, `Korean`, `Spanish`, `French`, `German`).
1. **Step 1 — What to Create**:
   - Quick toggles with inline icons: `Extract Transcript` (`Source Guide` raw transcript & summary), `Ask Question` (inline question input).
   - 4x2 Studio grid covering all 8 live tiles, each with a dedicated color-tinted inline SVG badge (`Audio Overview`, `Slide Deck`, `Video Overview`, `Mind Map`, `Reports` with `Study Guide`/`Timeline`/`FAQ` sub-selector, `Flashcards`, `Quiz`, `Infographic`).
2. **Step 2 — Add Data Sources** *(shown only when sources are not yet provided, or via `+ Add sources`)*:
   - `YouTube / URLs` (`Websites` — YouTube play badge / web globe icon; multi-line YouTube/web URLs)
   - `Text` (`Copied text` — clipboard icon; raw notes or markdown)
   - `Local Files` (`Upload files` — upload tray icon; local file paths, falling back to `Copied text` if sandbox blocks `setInputFiles`)
   - `Research` (`Discover / Research` — search-plus icon; query + `Web`/`Drive` scope + `Fast Research`/`Deep Research` mode)
   - `Drive / Books / Existing` (dynamic Google Drive tri-color triangle, Play Books badge, Textbooks open book, or Existing notebook icon)
   - Optional `Delete after done` (ephemeral cleanup) checkbox.
3. **One-Shot Execution, Preview & Download (`app.sendMessage()`)**:
   - Clicking **Launch** injects a complete structured user message (sources, deliverables, `Output language`, and workspace download/preview instructions) into the Antigravity agent loop (`app.updateModelContext()` also stays synced as edits happen).
   - On the next turn, execute directly in `[AGY-Session]` (or the specified notebook) without scanning unrelated existing notebooks first, keep the generated preview open in Antigravity's built-in right-pane browser, and download downloadable outputs into `./notebooklm-outputs/<short-topic>/`.

### Turn Ordering & Non-Blocking Rules
1. **Write concise intro prose first** (2–4 lines). Do **not** repeat the 6 source types or 8 Studio tiles in a markdown table.
2. **Call `notebooklm_studio_launcher` cleanly** and end your turn **without calling `ask_question`**.
3. *(Fallback only if `antigravity-notebooklm_studio-ui` is unavailable)*: Write `<Artifact Directory Path>/notebooklm-studio-picker.html` (`UserFacing: true, RequestFeedback: false`) including an explicit `Output language` `<select>` dropdown menu and inline SVG icons for the source types and all 8 Studio tiles, and place `<agent-embed src="file:///<artifact_path>/notebooklm-studio-picker.html"></agent-embed>` at the **very bottom** of the reply, without `ask_question`.

---

## 2. Source & YouTube Transcript Explorer (`<agent-embed>`)

Use when [Extract Runbook](./extract.md) retrieves a long YouTube transcript or multi-source extraction that would otherwise flood chat prose.

1. Write `<Artifact Directory Path>/notebooklm-source-card.html` directly via `write_file` (`ArtifactMetadata: { UserFacing: true, RequestFeedback: false }`).
2. Follow `generative_ui` guardrails: load `https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js`, `<body class="bg-transparent text-[var(--foreground)] antialiased p-0 m-0">`, semantic tokens, compact height `<= 420px` (never `h-screen` / `100vh` / `height: 100%`), min font `12px`.
3. Include two tabs: `Summary & Topics` and searchable `Raw Transcript` (`max-h-56 overflow-y-auto`).
4. Place `<agent-embed src="file:///<artifact_path>/notebooklm-source-card.html"></agent-embed>` at the **very bottom** of your reply below concise summary prose, and do **not** call `ask_question`.
