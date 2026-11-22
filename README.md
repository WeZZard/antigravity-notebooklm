# Antigravity NotebookLM

An Antigravity plugin for [Google NotebookLM](https://notebook.google.com) exposing a single `notebooklm` skill with an interactive 2-step Studio Workbench, built-in browser preview, and automatic local downloads.

## Installation

### Option 1 — Antigravity CLI

```bash
git clone https://github.com/WeZZard/antigravity-notebooklm.git
agy plugin install ./antigravity-notebooklm
```

### Option 2 — Direct Clone into Plugins Directory

```bash
git clone https://github.com/WeZZard/antigravity-notebooklm.git \
  ~/.gemini/config/plugins/antigravity-notebooklm
```

### Prerequisites

- Antigravity with the built-in browser enabled
- Python 3 (for the bundled `studio-ui` MCP App server)
- A Google account signed into `https://notebook.google.com`

## Quick Usage

### 1. Interactive Workbench (`/notebooklm`)

Type `/notebooklm` to open the 2-step Studio Workbench — pick deliverables and output language, attach sources, and launch.

1. **Step 1 — Pick deliverables and output language**

   ![NotebookLM 2-Step Workbench — Step 1: Choose Deliverables](./assets/screenshots/workbench-step1-deliverables.png)

2. **Step 2 — Add data sources and launch**

   ![NotebookLM 2-Step Workbench — Step 2: Add Data Sources](./assets/screenshots/workbench-step2-sources.png)

3. **Result — Right-pane browser preview and local download**

   ![Generated Infographic Preview in Built-in Browser](./assets/screenshots/infographic-browser-preview.png)

### 2. Direct Chat Prompt

Ask directly in chat without opening the workbench:

```text
Use NotebookLM to extract the transcript from https://www.youtube.com/watch?v=TtOoLanFzGw and generate an Infographic.
```

The agent handles notebook setup, source ingestion, right-pane preview, and local download automatically.

## Capabilities

- **Sources**: YouTube and web URLs, local files, pasted text, Google Drive, Play Books, Textbooks, and Web/Drive research (`Fast Research` / `Deep Research`).
- **Studio Deliverables**: Audio Overview, Slide Deck, Video Overview, Mind Map, Reports (`Study Guide`, `Timeline`, `FAQ`), Flashcards, Quiz, and Infographic.
- **Grounded Q&A & Session Management**: Inline citation verification (`[1]`, `[2]`), configurable chat style/length, and automatic `[AGY-Session]` notebook lifecycle management.

## Validation & Maintenance

```bash
agy plugin validate . --strict
python3 tests/validate_plugin.py --check-loader
```

Maintainers can run `/notebooklm-sync` ([.agents/skills/notebooklm-sync/SKILL.md](./.agents/skills/notebooklm-sync/SKILL.md)) to audit and synchronize the plugin against live NotebookLM UI updates.
