---
name: notebooklm
description: >-
  Operate Google NotebookLM (https://notebook.google.com/) as a unified,
  intent-driven capability engine via Antigravity's built-in browser subagent:
  extract YouTube transcripts and web/file/Drive sources, run web or Drive
  research, generate Slide Decks, Quizzes, Reports, Mind Maps, Flashcards,
  Audio/Video Overviews, and Infographics, run source-grounded Q&A with inline
  citation verification, and manage notebooks, collections, sharing, and
  cleanup.
---

# NotebookLM (Unified Intent Router & Capability Engine)

Operate **Google NotebookLM / Gemini Notebook** (`https://notebook.google.com/`) through one unified entry skill that resolves notebook context implicitly and routes each user request to the matching operational runbook(s) under `./references/`.

## Prerequisites & Shared Context Resolution

Follow `rules/AGENTS.md` on every route:
- **Browser & Auth**: Delegate all UI interaction to Antigravity's built-in `browser` subagent (`Model: "flash"`), navigate directly to `https://notebook.google.com/` (never `notebooklm.google.com`), reuse the active `browser` subagent via `send_message`, and run the Fast-Path Authentication Check (visual/DOM + HTTP `200` `batchexecute`) before pausing with `LOGIN_REQUIRED`.
- **Context Resolution Order** (`rules/AGENTS.md` Section 3):
  1. **Explicit Target**: User names an existing notebook or provides a `/notebook/<uuid>` URL.
  2. **Active Session / Open Tab Reuse**: Reuse the conversation's bound `[AGY-Session]` notebook — or the open `/notebook/<uuid>` browser tab if topically aligned — with zero redundant source re-ingestion.
  3. **Implicit Session Workspace**: Otherwise create a new notebook (`+ New notebook`) titled `[AGY-Session] <short topic>`.
- **Incremental Source Ingestion**: Inspect `Sources` before calling `+ Add sources` and add only missing URLs/materials; confirm target sources are checked (`<N> sources`).
- **Ground-Truth-First Principle**: NotebookLM is a dedicated ingestion and compilation engine (YouTube/external source capture, large-corpus synthesis, and multimodal Studio artifacts), not a substitute for reading ordinary local files directly. When extracting sources, prefer pulling raw transcripts and verified source excerpts back to Antigravity rather than relaying second-hand summaries alone.
- **Session Cleanup Policy**: Keep `[AGY-Session]` notebooks by default unless the user explicitly asks for disposable/ephemeral mode (`"delete after done"`, `"ephemeral"`, or equivalent phrasing in any language).

## Capability Menu (Bare `/notebooklm` or Missing Inputs)

If the user invokes `/notebooklm` with no arguments, or specifies only deliverables or only sources without a complete task:
1. **Do NOT open the browser to list or search existing notebooks first.**
2. **Write a concise 2–4 line overview first** covering what NotebookLM can create and ingest (without repeating the 6 source types or 8 Studio items in a markdown table).
3. **Call `notebooklm_studio_launcher`** (`antigravity-notebooklm_studio-ui`) following [Interactive UI Runbook](./references/ui-widgets.md) with adaptive context:
   - Bare `/notebooklm` (`{}`): **Step 1** asks *"What do you want to create?"*, then **Step 2** asks *"Add data sources"*.
   - Sources already provided (`hasSources: true` / `sources: [...]`): opens **Step 1 only** and skips Step 2.
   - Deliverables already provided (`preselectedDeliverables: [...]`, no sources): opens **Step 2** directly to collect sources.
4. **Never call `ask_question`** — leave the conversation open and non-blocking until the user clicks **Launch** (`app.sendMessage()`) or replies in chat.

## Intent Router

Read the target runbook(s) below matching the user's request before issuing browser steps:

| User Intent | Route When User Wants To... | Runbook |
| :--- | :--- | :--- |
| **Extract / Transcribe / Research** | Extract YouTube transcripts, summarize websites/PDFs/text/Drive/Play Books/Textbooks, run Fast/Deep Research, manage sources or notes | [Extract Runbook](./references/extract.md) |
| **Create Studio Artifacts** | Generate or export Slide Decks, Quizzes, Reports (`Timeline`, `Study Guide`, `FAQ`), Mind Maps, Flashcards, Audio Overviews, Video Overviews, or Infographics | [Create Runbook](./references/create.md) |
| **Ask / Chat / Verify Citations** | Ask questions over materials, configure chat persona/length (`Configure Chat`), mount Google Drive in chat, verify inline `[1]`/`[2]` citations, or save answers to notes | [Ask Runbook](./references/ask.md) |
| **Library / Share / Cleanup / Settings** | Browse `All`/`My notebooks`/`Discover`/`Collections`, search/sort/rename/pin/copy/delete notebooks, clean up `[AGY-Session]` notebooks, share, view analytics, or configure `/apps` settings | [Library Runbook](./references/library.md) |
| **Interactive Inline UI / Launcher** | Render the interactive 8-tile Studio Launcher MCP App (`notebooklm_studio_launcher` with direct `app.sendMessage()` loop injection) or compact YouTube transcript explorer | [Interactive UI Runbook](./references/ui-widgets.md) |

## Compound / Chained Intents

When a request spans multiple intents in one prompt or across follow-up turns (for example: *"extract this YouTube video, generate a Slide Deck and Quiz, then answer my questions"*):
1. Read each relevant runbook (`extract.md` -> `create.md` -> `ask.md`).
2. Resolve the notebook context **once** and execute all stages sequentially inside that single notebook so sources are ingested once and shared across every stage.
3. Unless the user requested ephemeral teardown, conclude by noting the `[AGY-Session]` notebook remains available for follow-up queries, further artifacts, or deletion on request.
