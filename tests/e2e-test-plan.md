# NotebookLM Plugin E2E Test Plan

Comprehensive live-browser and static verification plan covering `rules/AGENTS.md` (auth & implicit session context), the single user-facing `notebooklm` plugin skill (internal intent routes `extract`, `create`, `ask`, `library` under `skills/notebooklm/references/`), and the workspace-scoped maintainer skill `notebooklm-sync` (`.agents/skills/notebooklm-sync/`) against `https://notebook.google.com/`.

> **Safety Rule**: Unless operating inside a dedicated `[AGY-TEST]` or user-approved `[AGY-Session]` notebook, never delete pre-existing user notebooks, remove existing sources, or clear existing user chat history.

---

## Suite A: Authentication, Routing & Implicit Session Context (`rules/AGENTS.md`, `notebooklm`)

| ID | Scenario | Preconditions / Action | Expected Pass Criteria |
| :--- | :--- | :--- | :--- |
| `T-AUTH-01` | Fast-Path Signed-In Detection | Navigate directly to `https://notebook.google.com/` in signed-in browser session | Stays on `https://notebook.google.com/` (`Gemini Notebook`) with zero `accounts.google.com` redirect; Google Account avatar and `+ New notebook` visible; `batchexecute` RPCs return HTTP `200`. |
| `T-AUTH-02` | Canonical vs. Legacy Redirect Check | Inspect `rules/AGENTS.md` | Mandates `https://notebook.google.com/` and avoids `https://notebooklm.google.com/` SSO hops. |
| `T-AUTH-03` | Logged-Out / Auth Gate Handling | Navigate to `https://notebook.google.com/` when unauthenticated | Browser subagent stops immediately on `accounts.google.com` or `Sign in` UI and emits `LOGIN_REQUIRED`. |
| `T-CTX-01` | Intent Routing, Context Reuse & Incremental Ingestion | Chain `notebooklm` routes `extract` (YouTube URL) -> `create` (`Slide Deck` or `Mind Map`) -> `ask` (Q&A) in one conversation | All 3 routed stages execute in the same `[AGY-Session]` notebook with zero duplicate source uploads; existing sources are checked rather than re-ingested. |
| `T-CTX-02` | Session Retention vs. Ephemeral Cleanup | Run a task normally vs. with explicit `"delete after done"`, `"ephemeral"`, or equivalent phrasing in any language | Default mode retains `[AGY-Session]` notebook and notes availability; explicit ephemeral request deletes the `[AGY-Session]` notebook after output delivery. |

---

## Suite B: Content Extraction, YouTube & Research (`notebooklm` -> `references/extract.md`)

| ID | Scenario | Preconditions / Action | Expected Pass Criteria |
| :--- | :--- | :--- | :--- |
| `T-SRC-01` | YouTube Video URL Ingestion & Source Guide (Core) | Pass YouTube URL -> `+ Add sources` -> `Websites` -> `Insert` (`izAoDd`) -> open source row | Video ingests without scraping YouTube directly; **Source Guide** yields AI summary, clickable topic chips, and full extracted transcript text. |
| `T-SRC-02` | Website URL Ingestion & Quota Counter | Inspect `+ Add sources` counter (`<N> / 600`) and all 6 source types (`Upload files`, `Websites`, `Play Books`, `Drive`, `Textbooks`, `Copied text`) | All 6 source types present; Website URL option accepts HTTP/HTTPS URLs cleanly. |
| `T-SRC-03` | Copied Text Ingestion | `+ Add sources` -> `Copied text` -> paste sample reference text -> `Insert` (`cFji9` / `CYK0Xb`) | Source appears in `Sources`, increments `<N> sources` in chat bar, and opens `Studio > Note`. |
| `T-SRC-04` | Local File Upload via Sandbox Staging | Stage `agy_e2e_sample.md` in `browser_sandbox/uploads/agy_e2e_sample.md` -> `+ Add sources` -> `Upload files` -> attempt `setInputFiles('agy_e2e_sample.md')` | File ingests into `Sources`, OR if host browser sandbox blocks `setInputFiles` on `notebook.google.com`, agent cleanly falls back to `Copied text` (text/Markdown) or prompts user drag-and-drop / `Drive` (binary files). |
| `T-SRC-05` | Inline Discover / Research Bar | Inspect `Search the web for new sources` dropdowns (`Web`, `Drive` and `Fast Research`, `Deep Research`) | Both source scopes and both research depths are selectable. |
| `T-SRC-06` | Source Actions & Notes | Inspect `More` (`Rename source`, `Remove source`), `Sort sources` (`Recent`, `Title`, `Type`), and `+ Create note` / `Notes` (`Convert` to source) | Controls match `skills/notebooklm/references/extract.md`. |

---

## Suite C: Multimodal Artifact Creation (`notebooklm` -> `references/create.md`)

| ID | Scenario | Preconditions / Action | Expected Pass Criteria |
| :--- | :--- | :--- | :--- |
| `T-STUDIO-01` | All 8 Studio Create Tiles Inventory | Inspect `Studio` panel `[data-testid="create-artifact-tile"]` elements | All 8 tiles present: `Audio Overview`, `Slide Deck`, `Video Overview`, `Mind Map`, `Reports`, `Flashcards`, `Quiz`, `Infographic`. |
| `T-STUDIO-02` | Studio Artifact Generation (`Mind Map` / `Flashcards` / `Slide Deck`) | With active sources in session notebook, trigger `Mind Map` (`Choose language`, `Sources`, `What should the topic be?`, `Generate now` -> `R7cb6c`) or another Studio tile | Artifact generates and appears in `<artifact-library>`; opening displays `<artifact-viewer>` or `Studio > App` viewer controls cleanly. |
| `T-STUDIO-03` | Saved Artifact Viewer & Controls | Inspect saved artifact controls (`Play`/`Interactive mode` on Audio/Video, `<artifact-viewer>` `View <N> sources`, `Zoom in`/`Zoom out`, `More options` -> `Download`, `Open in new tab`) | Controls match `skills/notebooklm/references/create.md` (noting `scf.usercontent.goog` iframe sandbox behavior for Mind Map). |
| `T-STUDIO-04` | Reports Sub-Types | Verify `Reports` tile & saved report sub-types (`Timeline`, `Study Guide`, `FAQ`) | Labels and viewer actions match `skills/notebooklm/references/create.md`. |
| `T-STUDIO-05` | Output Language Override, Built-In Preview & Local Download | Generate a downloadable Studio artifact (`Infographic`, `Slide Deck`, `Reports`, or `Audio Overview`) while account `Output language` differs from chat language | Agent aligns language via per-artifact picker or temporary `Settings` -> `Output language` override and restores the original global language immediately; leaves the built-in browser open on the artifact preview; downloads output locally to `./notebooklm-outputs/` and returns a `file://` link. |
| `T-UI-01` | Adaptive 2-Step Workbench (`notebooklm_studio_launcher`) | Ask bare `/notebooklm` (no sources) vs. pass a YouTube URL without deliverables | Bare `/notebooklm` opens Step 1 (*"1. What do you want to create?"*) -> Step 2 (*"2. Add Data Sources"*) with zero pre-launch browser scan and no `ask_question`; when sources are already provided (`hasSources: true`), opens Step 1 only and skips Step 2; clicking **Launch** calls `app.sendMessage()`. |

---

## Suite D: Grounded Q&A & Citations (`notebooklm` -> `references/ask.md`)

| ID | Scenario | Preconditions / Action | Expected Pass Criteria |
| :--- | :--- | :--- | :--- |
| `T-CHAT-01` | Grounded Query & Inline Citations | Scope sources (`<N> sources`), enter prompt in `Query box`, click `Submit` | Assistant returns answer grounded in active sources with clickable inline citation pills (`[1]`, `[2]`, ...). |
| `T-CHAT-02` | Citation Verification (`hizoJc`) & `Save message to a note` | Click citation pill `[1]`, inspect highlighted excerpt in Sources panel, then click `Save message to a note` (`cFji9`) | Clicking `[1]` triggers `hizoJc` and opens exact source excerpt; `Save message to a note` saves note under `Notes` in `Sources`. |
| `T-CHAT-03` | `Configure Chat` Modal | Open `Notebook configuration` (`...`) -> `Configure Chat`, verify `Default`/`Learning Guide`/`Custom` (`10000` chars) and `Default`/`Longer`/`Shorter`, select `Shorter`, click `Save settings` (`s0tc2d`) | Configuration saves cleanly with HTTP `200` `s0tc2d`. |
| `T-CHAT-04` | Connected Apps Menu & Clear Chat | Open `Open connected apps menu` (`Google Drive`, `Connect an app`) and verify `Delete chat history` menu entry | Controls match `skills/notebooklm/references/ask.md`. |

---

## Suite E: Library, Sharing, Cleanup & Settings (`notebooklm` -> `references/library.md`)

| ID | Scenario | Preconditions / Action | Expected Pass Criteria |
| :--- | :--- | :--- | :--- |
| `T-NB-01` | Home Tabs, Search, Sort & Views | Inspect `All`, `My notebooks`, `Discover`, `Collections`, `Grid view`/`List view` (`Title`, `Sources`, `Created`, `Role`), `Sort notebooks` (`Most recent`, `Title`), and `Search notebooks` | All 4 tabs and controls match `skills/notebooklm/references/library.md`. |
| `T-NB-02` | Notebook Lifecycle (Create, Rename, Delete) | Click `+ New notebook`, rename to `[AGY-TEST] NotebookLM E2E Verification`, delete via `My notebooks` -> `Project actions` (`...`) -> `Delete` | New `/notebook/<uuid>` created, renamed, and cleanly deleted at teardown. |
| `T-NB-03` | Customize Notebook Dialog | Open `Notebook configuration` (`...`) -> `Customize notebook` | Dialog displays `Upload`, `Notebook title`, `Set custom notebook summary`, and `Done`. |
| `T-NB-04` | Collections & Pinning | Inspect `Collections` tab (`New collection`) and owned card `Project actions` (`Edit title`, `Add to collection`, `Pin to top`, `Delete`) | Options match `skills/notebooklm/references/library.md`. |
| `T-NB-05` | Share, Analytics & Settings (`/apps`) | Open `Share` modal, `Analytics`, and `Settings` -> `Connected apps` (`/apps`) | `Share` shows `Add people and groups`, `Notify people`, `Notebook Access`, `Copy link`, `Save`; `/apps` loads `Connected Apps` (`Google Drive`, `WW9MQ` HTTP `200`). |

---

## Suite F: Self-Maintenance Sync (`.agents/skills/notebooklm-sync`)

| ID | Scenario | Preconditions / Action | Expected Pass Criteria |
| :--- | :--- | :--- | :--- |
| `T-SYNC-01` | Single Public Skill & Manual-Only Maintainer Guard | Run `agy plugin validate . --strict` and `python3 tests/validate_plugin.py --check-loader` | Confirms the plugin exposes strictly 1 skill (`notebooklm`) with no `disable-model-invocation`, `GetAllPlugins` loads `skills: ["notebooklm"]` + `rules/AGENTS.md`, and workspace `.agents/skills/notebooklm-sync/SKILL.md` declares `disable-model-invocation: true`. |
| `T-SYNC-02` | Read-Only Audit & Sync Drift Check | Explicitly invoke `/notebooklm-sync` against `https://notebook.google.com/` | Runs strictly read-only inspection across all 6 surfaces in `.agents/skills/notebooklm-sync/references/audit-checklist.md`, outputs 4-bucket diff (`Added`, `Changed`, `Deprecated`, `Removed`), updates `skills/notebooklm/` + `tests/validate_plugin.py` + `tests/e2e-test-plan.md`, and passes both `agy plugin validate --strict` and `validate_plugin.py --check-loader`. |
