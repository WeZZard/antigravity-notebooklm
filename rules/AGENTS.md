# Google NotebookLM Plugin Operating Rules

These rules apply whenever the user works with **Google NotebookLM / Gemini Notebook** (`https://notebook.google.com`) using this plugin.

## 1. Browser Delegation, Canonical Entry URL & Session Reuse

- Always drive NotebookLM through Antigravity's built-in `browser` subagent (`invoke_subagent` with `TypeName: "browser"`, `Model: "flash"` unless the user specifies another model). Do not use `curl`, Playwright scripts, or external browser launchers to access NotebookLM.
- Always open **`https://notebook.google.com/`** directly as the canonical entry URL (page title `Gemini Notebook`). Avoid navigating through `https://notebooklm.google.com/`, which can trigger an unnecessary `accounts.google.com` SSO redirect hop even when the user is already signed in.
- Within a NotebookLM session, reuse the same `browser` subagent via `send_message` using its `conversationId` so the open notebook tab and authenticated session stay intact. Do not kill an idle `browser` subagent between steps.
- Give the `browser` subagent **semantic UI goals** (visible labels, roles, controls, and visual verification criteria) rather than brittle CSS classes, so workflows stay resilient across frontend updates.

## 2. Fast-Path Authentication Check (Signed-In Shortcut)

Before assuming the user needs to sign in, always verify whether an authenticated NotebookLM session is already active:

- **Check the current tab first** if already on `https://notebook.google.com/...`; otherwise navigate directly to `https://notebook.google.com/`.
- **Verify signed-in state using visual, DOM, and network signals together**:
  - **Above-the-fold visual & DOM signals**: Presence of the top-right `Google Account:` avatar button (and optional plan badge such as `ULTRA`, `PRO`, or `PLUS`), `+ New notebook` (Home) or `+ Create notebook` (inside a notebook), or `tablist "Notebook sections"` (`All`, `My notebooks`, `Discover`, `Collections`), with no `Sign in` button.
  - **URL & network signals**: Page remains on `https://notebook.google.com/` (e.g., `/`, `/?pli=1`, `/apps`, or `/notebook/<uuid>`) without redirecting to `accounts.google.com`, and NotebookLM's frontend RPC (`POST https://notebook.google.com/_/LabsTailwindUi/data/batchexecute`) returns HTTP `200` (for example Home RPCs `rBs0R`, `ZwVcOc`, `I3xc3c`, `hT54vc`; Connected Apps RPC `WW9MQ`; Notebook RPCs `rLM1Ne`, `hPTbtc`, `JFMDGd`, `izAoDd`, `cFji9`, `CYK0Xb`, `s0tc2d`, `R7cb6c`, `hizoJc`).
  - **Sandbox constraint**: Do not attempt to read `document.cookie`, `localStorage`, or `sessionStorage` via `page.evaluate`, as those APIs are blocked by the sandboxed browser runtime.
- **Shortcut**: As soon as the signed-in signals are confirmed, skip all authentication prompts and proceed directly to the user's task.
- Only pause with `LOGIN_REQUIRED` when direct navigation to `https://notebook.google.com/` blocks on `accounts.google.com` or renders a logged-out landing page with a `Sign in` button.

## 3. Implicit Notebook Context & Session Lifecycle (Capability-Engine Contract)

Treat NotebookLM as a headless capability platform for chat-driven intents under `notebooklm` (`extract`, `create`, and `ask` routes) rather than making the user manage notebooks manually:

- **When to Route to NotebookLM (Ground-Truth-First & Proactive Triggers)**:
  - **Proactively route through `notebooklm`** when the user shares a YouTube URL to extract or analyze, requests Google Drive / Play Books / Textbooks / Deep Research ingestion, wants to synthesize a large multi-source corpus, or asks to produce multimodal Studio deliverables (`Audio Overview` podcast, `Video Overview`, `Infographic`, `Slide Deck`, interactive `Quiz`, `Flashcards`, `Mind Map`, or a hosted shareable notebook).
  - **Ground-Truth-First boundary**: Do NOT route ordinary local code, Markdown, text, or simple PDF reading/Q&A through NotebookLM when Antigravity can read the raw local files directly; only send local files to NotebookLM when the user asks for Studio deliverables, large-corpus synthesis, or a hosted notebook. When extracting sources, prioritize retrieving raw transcripts and verified source excerpts back to Antigravity rather than relaying second-hand summaries alone.
- **Context Resolution Order**:
  1. **Explicit Target**: If the user names an existing notebook or passes a `/notebook/<uuid>` URL, open and operate inside that notebook.
  2. **Active Session / Open Tab Reuse**: Otherwise, if this conversation already has an active session notebook — or the open browser tab is already on a `/notebook/<uuid>` whose topic aligns with the user's request — reuse that exact notebook with zero redundant re-ingestion (e.g., chaining extraction -> Slide Deck -> Quiz -> Q&A in one notebook).
  3. **Implicit Session Workspace**: Otherwise, create a new notebook via `+ New notebook` and title it `[AGY-Session] <short topic>` (note: `+ New notebook` navigates to `/notebook/<uuid>?addSource=true`, though `+ Add sources` may need an explicit click if it does not auto-open).
- **Incremental Source Ingestion**: Always inspect the active notebook's `Sources` list before calling `+ Add sources`, and ingest only materials/URLs not already present in that notebook. Ensure target sources are checked (`<N> sources`) before running Chat or Studio actions.
- **Session Cleanup Policy**:
  - **Default (Retain)**: Keep `[AGY-Session]` notebooks after delivering outputs so the user can inspect them on the web or ask follow-up questions; briefly note in your reply that they can ask to delete the session notebook anytime.
  - **Explicit Disposable / Ephemeral Mode**: Only when the user explicitly requests cleanup/ephemeral execution (e.g., `"delete after done"`, `"ephemeral"`, or equivalent phrasing in any language), delete the temporary `[AGY-Session]` notebook immediately after delivering or downloading outputs.

## 4. Safety, Confirmation & Platform Boundaries

- **Confirm destructive or sharing actions**: Always ask the user for confirmation before executing destructive mutations (`Delete` notebook, `Remove source`, `Delete chat history`, `Delete note`) or modifying access permissions (`Share` -> adding people/groups or changing `Notebook Access`), unless the user explicitly requested that exact deletion or cleanup (such as explicit ephemeral `[AGY-Session]` teardown).
- **Google Sign-In / Authentication (`LOGIN_REQUIRED`)**: Protected auth origins (`accounts.google.com`) cannot be automated. Ask the user to sign in inside the browser pane, then resume the same `browser` subagent via `send_message`.
- **CAPTCHA / Anti-Bot Verification**: Never attempt to solve or bypass challenges. Pause and ask the user to complete verification.
- **Quota / Plan Upgrade Walls (`PAYMENT_REQUIRED`)**: If a source limit (`600` sources per notebook), daily artifact generation limit, or plan-gated feature blocks execution, pause and report the exact UI message to the user.

## 5. Local File Staging Contract

The `browser` subagent is sandboxed and cannot read arbitrary workspace or host paths directly:

- **For web uploads** (`Upload files` in `+ Add sources` or `Upload` in `Customize notebook`): Copy each file to `<Artifact Directory Path>/browser_sandbox/uploads/<filename>` (single-segment filename) and pass the bare `<filename>` to the `browser` subagent.
  - **Sandbox fallback**: If the browser host blocks `setInputFiles` on `https://notebook.google.com` with `"File upload is blocked on protected authentication pages"`, use `Copied text` in `+ Add sources` for plain-text or Markdown content; for binary files (PDF, audio, images), pause with the `Add sources` modal open and ask the user to drag-and-drop the file directly in the browser pane (or import it via `Drive`).
- **For visual reference inspection**: Copy reference images to `<Artifact Directory Path>/browser_sandbox/references/<filename>` and pass the full path.
- **For downloaded outputs** (Audio/Video Overviews, Infographics, Slide Decks, Reports, or exported artifacts): Whenever a generated Studio artifact supports download, **always trigger `Download`**, record the downloaded file paths returned by the `browser` subagent, copy final assets into the user's requested workspace output directory (default `./notebooklm-outputs/<short-topic>/`), and return clickable `file://` links. Leave the built-in browser open on the generated artifact preview unless tearing down an ephemeral notebook.
