---
name: notebooklm-sync
description: >-
  Manual maintenance skill: audit the live Google NotebookLM / Gemini Notebook
  web app (https://notebook.google.com/) via Antigravity's built-in browser to
  detect newly launched features, changed UI labels or RPCs, and deprecated or
  removed capabilities, then add/update/prune this plugin's rules, skills,
  references, and test suite. Invoke only when explicitly triggered by the user
  (e.g., /notebooklm-sync); never auto-invoke during normal workflows.
disable-model-invocation: true
---

# NotebookLM Sync (Live UI Audit, Feature Calibration & Deprecation Pruning)

Keep the `antigravity-notebooklm` plugin synchronized with the live **Google NotebookLM / Gemini Notebook** web application (`https://notebook.google.com/`) through a repeatable, strictly read-only inspection and maintenance loop.

## Core Principles

1. **Strictly Read-Only Live Audit**: During reconnaissance, never create, modify, or delete user notebooks, sources, notes, chat messages, Studio artifacts, or sharing settings, and never send chat queries or trigger paid/quota generations. You may open and close menus/modals read-only to inspect labels and options.
2. **Observe Before Editing**: Ground every addition, rename, or removal in live screenshots, DOM/accessibility snapshots, and network `batchexecute` observations from `https://notebook.google.com/`.
3. **Add New, Fix Drifted, Prune Obsolete**:
   - **"Add new feature"**: When live NotebookLM introduces a new source type, Studio tile, research mode, setting, or workflow, add it to `skills/notebooklm/SKILL.md` and the appropriate route runbook under `skills/notebooklm/references/` (or add a new route runbook if a major standalone capability emerges).
   - **"Remove obsolete feature"**: When a previously documented feature, tab, tile, option, or button is removed from the live UI, delete its stale instructions from `rules/`, `skills/`, `references/`, and `README.md` so agents never search for dead UI controls.
   - **"Fix drifted UI"**: Update renamed labels, URL routes, `batchexecute` RPC IDs, and quota limits.
4. **Always Sync Tests Together**: Every feature addition, modification, or removal MUST also update `tests/validate_plugin.py` assertions and `tests/e2e-test-plan.md` test cases.
5. **English-Only Repository**: Keep all repository files (`plugin.json`, `README.md`, `rules/`, `skills/`, `.agents/`, `tests/`) strictly in English (zero CJK characters), verified by `tests/validate_plugin.py`.

## Workflow

### Step 1: Load Baseline & Locate Plugin Root

1. Read [Audit Checklist](./references/audit-checklist.md) to get the last calibration date, frontend build ID (`bl=...`), and the 6 canonical surfaces to inspect.
2. Resolve the plugin repository root (this maintainer skill lives at `.agents/skills/notebooklm-sync/` inside the plugin repo; or follow the symlink from `~/.gemini/config/plugins/antigravity-notebooklm`).

### Step 2: Run Strictly Read-Only Live Browser Audit

Delegate to Antigravity's `browser` subagent (`Model: "flash"`, reusing any open NotebookLM `browser` subagent via `send_message`) at `https://notebook.google.com/` using the Fast-Path Authentication Check from `rules/AGENTS.md`.

Instruct the `browser` subagent to inspect all 6 canonical surfaces from [Audit Checklist](./references/audit-checklist.md) without mutating any data:
1. **Auth, Routing & Build Signals**: Entry behavior on `https://notebook.google.com/`, title, account button, plan badge, `bl=` build tag, and HTTP `200` `batchexecute` RPC IDs.
2. **Home / Dashboard (`https://notebook.google.com/`)**: `tablist "Notebook sections"` tabs, search placeholder, `Grid view`/`List view` columns, `Sort notebooks` options, `+ New notebook` / `New collection`, `Project actions` (`...`) items on owned and featured cards, and `Settings` menu items + `/apps` (`Connected Apps`).
3. **Notebook Top Bar (`/notebook/<uuid>`)**: Editable title, `+ Create notebook`, `Share` modal controls, `Notebook configuration` (`...`) items (`Configure Chat`, `Customize notebook`, `Copy notebook`, `Analytics`, `Delete chat history`), and any new top-bar controls.
4. **Left Panel — `Sources`**: `+ Add sources` modal source limit (`<N> / <max>`), all source types and sub-filters, inline Discover/Research dropdowns (sources + modes), `Sort sources` options, `More` source actions, `+ Create note` / `Notes` collapsible section, and **Source Guide** controls.
5. **Center Panel — `Chat`**: Overview actions, suggested prompt chips, `Open connected apps menu`, `Query box` placeholder, source counter, message footer actions, inline citations (`hizoJc`), and `Configure Chat` modal options/limits.
6. **Right Panel — `Studio`**: All `create-artifact-tile` buttons (`data-artifact-type`, labels, badges, any newly added customization controls or tiles like Data Table) and `<artifact-library>` item/viewer actions (`Play`, `Interactive mode`, `<artifact-viewer>` controls, `Download`, `More`).

### Step 3: Produce a Structured 4-Bucket Drift Diff

Compare the live audit report against `rules/AGENTS.md`, `skills/notebooklm/SKILL.md`, `skills/notebooklm/references/*.md`, `mcp/capabilities.json`, `./references/audit-checklist.md`, `plugin.json`, `README.md`, `tests/validate_plugin.py`, and `tests/e2e-test-plan.md`, classifying every change:
- **Added**: New features, source types, Studio tiles, tabs, Connected Apps, or controls found in live UI.
- **Changed**: Renamed UI labels, updated limits (e.g., source quota), changed routes, or new RPC IDs.
- **Deprecated**: Features marked `New!`, experimental, or flagged for upcoming retirement.
- **Removed / Obsolete**: Capabilities still documented in the plugin that no longer exist on `https://notebook.google.com/`.

### Step 4: Patch Plugin Files & Prune Obsolete Capabilities

1. Update `rules/AGENTS.md` if entry URLs, auth signals, RPC endpoints, confirmation rules, or file upload constraints changed.
2. Update `skills/notebooklm/SKILL.md` and its route runbooks (`skills/notebooklm/references/extract.md`, `create.md`, `ask.md`, `library.md`, `ui-widgets.md`) — adding newly discovered capabilities, fixing drifted labels, and **deleting** removed features.
3. Update **`mcp/capabilities.json`** (`calibratedAt`, `frontendBuild`, `maxSources`, `sourceTypes`, `research`, `studioTiles`) whenever source types, research modes, or Studio tiles are added, renamed, or removed — `mcp/server.py` reads `mcp/capabilities.json` dynamically so the MCP App Pre-Flight Workbench stays current without rebuilding frontend JS (only rebuild `mcp/ui/` if layout or new widget controls are added).
4. If NotebookLM launches a major standalone capability that does not fit any existing route, add a new route runbook under `skills/notebooklm/references/<capability>.md`, wire it into `skills/notebooklm/SKILL.md`'s Intent Router table, and document it in `README.md`.
5. Update `plugin.json` (`version` bump if meaningful, `description`, `suggestedPrompts`), `README.md`, and [Audit Checklist](./references/audit-checklist.md) (update calibration date, build tag, and baseline surface inventory).

### Step 5: Update Test Suite & Run Integrity Verification

1. **Sync `tests/validate_plugin.py`**: Add checks for any new skills/source types/Studio tiles and remove checks for any deleted capabilities.
2. **Sync `tests/e2e-test-plan.md`**: Add E2E test cases for newly added features and mark/remove obsolete cases for deleted features.
3. **Run automated validation**:
   ```bash
   agy plugin validate . --strict
   python3 tests/validate_plugin.py --check-loader
   ```
   Confirm exit code `0` for both `agy plugin validate --strict` and `validate_plugin.py --check-loader`, verifying `antigravity-notebooklm` passes strict manifest/file validation and loads cleanly in `GetAllPlugins` with all expected skills and `rules/AGENTS.md`.

### Step 6: Report the Sync Changelog

Present a concise summary grouped by **Added**, **Changed**, **Deprecated**, and **Removed**, including clickable links to all updated files, the new calibration date/build tag, and the `validate_plugin.py --check-loader` pass result.
