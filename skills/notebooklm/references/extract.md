# Extract Runbook (YouTube, Multi-Source Ingestion & Research)

Use NotebookLM as a headless extraction and research backend — incrementally ingesting materials into the active notebook context and returning structured summaries, key topics, and extracted transcripts directly in chat.

## 1. Incremental Source Ingestion (`+ Add sources`)

1. Inspect the left `Sources` panel (`<count> / 600` limit). Skip any URL or material already ingested in the active notebook.
2. For missing sources, open `+ Add sources` and pick from the 6 live source types:
   - **`Websites` (First-Class YouTube & Web Extraction)**: Paste one or more Website or YouTube URLs (separated by spaces/newlines) and click `Insert` (`izAoDd` HTTP `200`). *(Extracts visible web text and public YouTube text transcripts; paywalled/private/captionless items fail.)*
   - **`Copied text`**: Click `Copied text` -> `Paste copied text` -> `Insert` (`cFji9` / `CYK0Xb` HTTP `200`). Auto-opens `Studio > Note` (`Pasted text is view only` / `Edit your note`) and updates the chat `<N> sources` count.
   - **`Upload files`**: Stage local files to `<Artifact Directory Path>/browser_sandbox/uploads/<filename>` and pass the bare `<filename>`. Supports `pdf`, images, docs, audio, and more. *Sandbox fallback*: if the browser host blocks `setInputFiles` with `"File upload is blocked on protected authentication pages"`, fall back to `Copied text` for text/Markdown or pause with the `Add sources` modal open and ask the user to drag-and-drop binary files (or import via `Drive`).
   - **`Drive`**: Pick files/folders directly from Google Drive.
   - **`Play Books`**: Select books (`Explore Play Books`, `Unsupported books`) and click `Add to sources`.
   - **`Textbooks`**: Filter by `Topic`, `Level`, and `Country` across 5 categories (`Arts & Humanities`, `Sciences & Mathematics`, `Social Sciences & Law`, `Engineering & Technology`, `Business & Economics`), inspect with `View details`, and click `Add to sources`.

## 2. Inline Discover / Research Bar

When the user asks to discover or research sources on a topic instead of providing explicit URLs/files:
1. Locate `"Search the web for new sources"` (`aria-label="Discover sources based on the inputted query"`).
2. Select source scope: `Web` (*"Best sources from the web"*) or `Drive` (*"Your content from Google Drive"`).
3. Select depth mode: `Fast Research` (*"Great for quick results"*) or `Deep Research` (*"In-depth report and results"`).
4. Click `Submit` (arrow button), review discovered candidates, and import selected results into `Sources`.

## 3. Extract via Source Guide & Manage Sources / Notes

For YouTube videos, articles, or ingested documents (**Ground-Truth-First**):
1. Click each newly ingested source row in `Sources` to open **Source Guide**.
2. Prioritize capturing and returning primary ground truth — the **full extracted transcript / raw visible source text** — alongside:
   - The AI-generated source summary
   - Clickable key topic chips
   (Use `Close source view` or `Close source guide` when finished so Antigravity can reason directly over the primary text rather than relying solely on second-hand summaries.)
   - *Rich Inline Display (Optional)*: For long YouTube transcripts, you may render the compact **Source & YouTube Transcript Explorer** widget from [Generative UI Widgets](./ui-widgets.md) (`Summary & Topics` / searchable `Raw Transcript`) and offer follow-up Studio creation options (`Slide Deck`, `Quiz`, `Audio Overview`, etc.).
3. Source & Note controls:
   - `Sort sources` (`Recent`, `Title`, `Type`), `Select all` / per-source checkboxes, `More` (`Rename source`, `Remove source` — confirm removal of pre-existing user sources).
   - `+ Create note` / `Notes` region (`Select all notes`, `note title editable`, `Convert` to promote a note into a citable source, `Delete note` with confirmation).
