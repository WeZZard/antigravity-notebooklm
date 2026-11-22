# Create Runbook (Multimodal Studio Artifacts)

Generate Slide Decks, Quizzes, Reports, Mind Maps, Flashcards, Audio Overviews, Video Overviews, and Infographics from active session sources inside the Right Panel (`Studio`).

## 0. Interactive Studio Selection (When Deliverables or Sources Are Unspecified)

When the user wants to use Studio without specifying both target deliverable(s) and source(s) (e.g., bare `/notebooklm`, *"what can we make from this?"*, or *"make a Slide Deck"* with no sources yet):
1. Do **not** open the browser to scan existing notebooks first; write a brief 2–3 line intro summarizing the active context (without duplicating options in a markdown table).
2. Call `notebooklm_studio_launcher` (`antigravity-notebooklm_studio-ui` MCP server) following [Interactive UI Runbook](./ui-widgets.md):
   - Pass `sources` / `sourcesCount` / `hasSources: true` when sources are already provided so **Step 2 is skipped automatically**.
   - Pass `preselectedDeliverables` when the user named artifact(s) without sources so it opens directly on **Step 2 (Add Data Sources)**.
   - Pass `{}` when neither was given so it guides **Step 1 (What to create)** -> **Step 2 (Add sources)**.
3. End your turn **without calling `ask_question`** so the user can complete the widget and hit **Launch** (`app.sendMessage()`).

## 1. Prepare Active Sources

1. If the user supplied new materials alongside the artifact request, ingest only missing items first using [Extract Runbook](./extract.md).
2. Confirm the intended sources are checked in the left `Sources` panel (`<N> sources`).

## 1.5. Output Language Alignment (Non-Destructive Override)

Unless the user explicitly specified a language or selected `Account Default`, default to matching the **user's conversation language** (`Auto (Chat language)`):
1. **Per-Artifact Language First**: If clicking a Studio tile opens a modal with its own `Choose language` control (e.g., `Mind Map`), select the target language directly there without touching account settings.
2. **Global `Output language` Fallback with Automatic Restore**: For tiles that inherit the account-wide `Settings` gear -> `Output language` (`Configure settings` -> `Choose your language override` -> `Save settings`):
   - Before changing anything, open `Settings` -> `Output language` and **record the user's current `Output language`** (for example `Default` or `English`).
   - If the recorded value already matches the target language (or the user picked `Account Default`), close `Close user settings` without modifying anything.
   - Otherwise, select the matching native option in `Choose your language override` (e.g., native script option for `Simplified Chinese`, `Traditional Chinese`, `Japanese`, `Korean`, `Spanish`, `French`, `German`, or `English`), click `Save settings`, trigger the Studio generation, and **immediately restore `Output language` back to the recorded original setting** (`Save settings`) once generation has started so the user's global preference is never polluted.

## 2. All 8 Live Studio Create Tiles

In `Studio` (`<basic-create-artifact-button>` / `[data-testid="create-artifact-tile"]`):

| Tile Label | Artifact Type Attr | Outputs & Interaction Notes |
| :--- | :--- | :--- |
| `Audio Overview` | `data-artifact-type="1"` | AI podcast dialogue; saved item supports `Play` & `Interactive mode`. |
| `Slide Deck` | `data-artifact-type="8"` | Presentation slide deck generated from active sources. |
| `Video Overview` | `data-artifact-type="3"` | AI video overview; saved item supports `Play`. |
| `Mind Map` | `data-artifact-type="mindmap_app"` | Opens config modal (`Choose language`, `Sources`, `What should the topic be?`, AI Usage meter, `Generate later`, `Generate now` -> `R7cb6c` HTTP `200`). |
| `Reports` | `data-artifact-type="2"` | Structured written reports (`Timeline`, `Study Guide`, `FAQ`, custom; labeled `New!` in UI). |
| `Flashcards` | `data-artifact-type="flashcards"` | Interactive study flashcards derived from sources. |
| `Quiz` | `data-artifact-type="quiz"` | Interactive quiz based on sources. |
| `Infographic` | `data-artifact-type="7"` | Visual infographic viewed in `<artifact-viewer>` (`Zoom in`, `Zoom out`, `Download`). |

*(Note: In the live `notebook.google.com` `luminous-ui` build, tiles do not expose separate inline pencil/Customize icons on the grid; clicking a tile either starts creation/sub-options or opens its modal such as `Mind Map`.)*

## 3. Generate, Preview in Built-In Browser & Download Locally

1. Click the requested tile(s) by exact label (`Slide Deck`, `Quiz`, `Reports`, `Mind Map`, `Flashcards`, `Infographic`, `Audio Overview`, `Video Overview`). Multi-artifact requests can be triggered within the same notebook.
2. If a dialog opens (such as `Mind Map`'s modal or `Reports` format selection), apply the target language, topic/focus, or sub-type (`Timeline`, `Study Guide`, `FAQ`) and submit (`Generate now`).
3. If you temporarily switched global `Settings` -> `Output language` in Section 1.5, restore the user's recorded original `Output language` (`Save settings`) as soon as generation starts.
4. Wait for generation to finish inside **`<artifact-library>`**, then **open and keep the preview live in the built-in browser**:
   - **Standard `<artifact-viewer role="dialog">`** (`Infographic`, `Reports`, `Slide Deck`, `Flashcards`, `Quiz`): open the item and keep the built-in right-pane browser open on this preview (`Artifact title`, `View <N> sources`, `Zoom in`/`Zoom out`).
   - **Audio / Video items**: open or ready the player in the built-in browser (`Play`, `Interactive mode` for Audio).
   - **Web App Viewer (`Studio > App`)** (observed for `Mind Map`): open the generated item; if the embedded `scf.usercontent.goog` iframe is aborted by the browser sandbox (`net::ERR_ABORTED`), click `Open in new tab` so the live preview stays open in the built-in browser right pane for the user (do not close the preview or navigate back to Home unless running explicit ephemeral cleanup).
5. **Mandatory Local Download**:
   - Whenever `Download` is available (`More options` -> `Download` inside `<artifact-viewer>`, or item `More` -> `Download`), **always trigger `Download`**.
   - Record every downloaded file path returned by the `browser` subagent, copy the final file(s) into `./notebooklm-outputs/<short-topic>/` (or the user's requested workspace output path), and include clickable `file://` links in your final reply.
   - Follow the Session Cleanup Policy in `rules/AGENTS.md` (if ephemeral cleanup is requested, finish downloads first before deleting `[AGY-Session]`).
