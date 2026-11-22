# NotebookLM Plugin E2E Last Run

- **Executed At**: `2026-11-21T19:10:00-08:00`
- **Target Surface**: `https://notebook.google.com/` (`Gemini Notebook`, build `boq_labs-tailwind-frontend_20261119.18_p0`)
- **Browser Subagent**: `5840e9cb-612d-40d5-b8c8-b45f98070b1b` (`Model: "flash"`)
- **Temporary Notebook**: `[AGY-TEST] NotebookLM E2E Verification` (`/notebook/77fa2fd0-7911-4961-b49b-01365c9382dc`) — **deleted and verified removed at teardown**

## Summary

| Test ID | Scenario | Outcome | Key Observations |
| :--- | :--- | :--- | :--- |
| `T-AUTH-01` | Fast-Path Signed-In Detection | **PASS** | Direct navigation to `https://notebook.google.com/` returned HTTP `200` with no redirect to `accounts.google.com`; avatar, `ULTRA` badge, `+ New notebook`, and `batchexecute` RPCs (`ZwVcOc`, `I3xc3c`, `ub2Bae`, `rBs0R`, `ozz5Z`) returned HTTP `200`. |
| `T-NB-02` | Notebook Lifecycle (Create, Rename, Delete) | **PASS** | `+ New notebook` created `/notebook/77fa2fd0-7911-4961-b49b-01365c9382dc` (`+ Add sources` modal did not auto-open), renamed to `[AGY-TEST] NotebookLM E2E Verification`, and deleted via `Project actions` -> `Delete` -> confirm. Verified absent from `My notebooks`. |
| `T-SRC-01` | YouTube Extraction & Source Guide | **PASS** | Inserted `https://www.youtube.com/watch?v=jNQXAC9IVRw` via `+ Add sources` -> `Websites` (`izAoDd` HTTP `200`, followed by `rLM1Ne`, `VfAZjd` HTTP `200`). Ingested as `Me at the zoo`; opened `Source guide` showing AI summary, 5 topic chips (`Elephant exhibit`, `Zoo visit`, `Long trunks`, `Animal observations`, `YouTube video`), and full transcript (`"All right, so here we are, in front of the elephants..."`). |
| `T-SRC-03` | Copied Text Ingestion | **PASS** | Pasted `NOVA-E2E-774` text via `Copied text` (`cFji9` / `CYK0Xb` HTTP `200`). Appeared in `Sources` (`2 sources` in chat bar) and auto-opened `Studio > Note` (`Pasted text is view only` / `Edit your note`). |
| `T-SRC-04` | Local File Upload (`setInputFiles`) | **SKIPPED (Sandbox Guard)** | `setInputFiles('agy_e2e_sample.md')` was blocked by Antigravity browser host with `NAVIGATION_NEEDS_PERMISSION: File upload is blocked on protected authentication pages`. Documented `Copied text` / user drag-and-drop fallback in `rules/AGENTS.md` and `skills/notebooklm-sources/SKILL.md`. |
| `T-CHAT-03` | `Configure Chat` Modal | **PASS** | Selected `Shorter` response length and saved (`Save settings`, `s0tc2d` HTTP `200`). |
| `T-CHAT-01` | Grounded Query & Inline Citations | **PASS** | Returned grounded response naming `elephants [1]` and `NOVA-E2E-774 [2]` with clickable inline citation pills (`1: Me at the zoo`, `2: Antigravity NotebookLM Test Note...`). |
| `T-CHAT-02` | Citation Excerpt (`hizoJc`) & Save Note | **PASS** | Clicking `[1]` opened `Me at the zoo` `Source guide` (`hizoJc` RPC); clicking `Save message to a note` (`cFji9` HTTP `200`) saved auto-titled note `Zoo Archive` under `Notes` in `Sources` (`3 sources`) and opened `Studio > Note`. |
| `T-STUDIO-02` | Studio Artifact (`Mind Map`) | **PASS (Sandbox iframe limit)** | Clicking `Mind Map` opened its config modal (`Choose language: English`, `Sources: 3 sources`, `What should the topic be?`, `Generate later`, `Generate now`); `Generate now` fired `R7cb6c` (HTTP `200`) and created `Elephants Notebook` in `<artifact-library>`. Opening it displayed `Studio > App` controls (`Close web page viewer`, editable `Artifact title`, `Share`, `Open in new tab`, `Expand`, `More options` -> `Delete`, `View 3 sources`, `Good content`, `Bad content`); inner cross-origin `scf.usercontent.goog` iframe `shim.html` was aborted by browser sandbox (`net::ERR_ABORTED`). |

## Static & Loader Verification

- Executed `python3 tests/validate_plugin.py --check-loader` after all doc updates.
