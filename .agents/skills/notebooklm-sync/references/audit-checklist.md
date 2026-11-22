# NotebookLM Live UI Audit Checklist & Baseline

- **Last Calibrated**: `2026-11-21`
- **Canonical URL**: `https://notebook.google.com/` (Title: `Gemini Notebook`)
- **Legacy Redirect URL (Avoid)**: `https://notebooklm.google.com/` (may trigger an unnecessary `accounts.google.com` SSO hop)
- **Observed Frontend Build (`bl=`)**: `boq_labs-tailwind-frontend_20261119.18_p0` (`luminous-ui`)
- **RPC Endpoint Pattern**: `POST https://notebook.google.com/_/LabsTailwindUi/data/batchexecute?rpcids=<RPC_ID>&...`

---

## Surface 1: Authentication, Routing & Build Signals
- **Expected Signed-In Visual/DOM Signals**:
  - Top-right `Google Account: ...` avatar button
  - Optional plan badge (`ULTRA` observed)
  - `+ New notebook` (Home) or `+ Create notebook` (Inside notebook)
  - `tablist "Notebook sections"` (`All`, `My notebooks`, `Discover`, `Collections`)
  - No `Sign in` button
- **Expected HTTP 200 RPC IDs**:
  - Home (`/`): `rBs0R`, `ZwVcOc`, `I3xc3c`, `hT54vc`
  - Connected Apps (`/apps`): `WW9MQ`
  - Notebook (`/notebook/<uuid>`): `rLM1Ne`, `hPTbtc`, `JFMDGd`, `sqTeoe`, `I3xc3c`, `e3bVqc`, `VfAZjd`, `vB2zic`, `sODAg`, `EylDcb`, `ozz5Z`, `cFji9`, `CYK0Xb` (Copied text), `izAoDd` (YouTube/Website ingestion), `s0tc2d` (`Configure Chat` save), `R7cb6c` (`Mind Map` generate), `khqZz`, `gArtLc`, `EEr8Nb`, `hizoJc`, `tr032e`

## Surface 2: Home / Dashboard (`https://notebook.google.com/`)
- **Top Bar**: `Gemini Notebook Homepage`, `Notebook sections` tabs (`All`, `My notebooks`, `Discover`, `Collections`), `Search notebooks` (`"Search notebooks by keywords or topics..."`), `Grid view` / `List view` (`Title`, `Sources`, `Created`, `Role`), `Settings` gear (11 items), plan badge, Google Apps waffle, Account avatar.
- **Settings Gear Menu (11 items)**: `Connected apps` (`/apps` -> `Google Drive`), `Gemini Notebook help`, `Send feedback`, `Discord`, `Output language` (`Configure settings` modal -> `Choose your language override` dropdown with `81` options starting with `Default`, `Close user settings`, `Save settings`), `Notifications`, `Remove watermarks`, `Licenses`, `Device`, `Usage`, `Manage subscription`.
- **Tab Views & Sorting**: `Featured notebooks` (`View all`), `Recent notebooks` (`Sort notebooks`: `Most recent`, `Title`; `+ New notebook`; `See more`), `My collections` (`New collection`), `Discover` categories (`Education & Learning`, `Health, Biology & Personal Wellness`, `Leadership, Business & Strategy`, `Productivity, Focus & Skill Mastery`, `Psychology, Behavior & Parenting`, `Science, AI & Innovation`, `More featured notebooks`).
- **Card `Project actions` (`...`)**:
  - Owned: `Edit title`, `Add to collection`, `Pin to top`, `Delete`
  - Featured: `Add to collection`, `Report notebook`

## Surface 3: Notebook Top Bar (`/notebook/<uuid>`)
- **Controls**: `Gemini Notebook Homepage`, editable title `<input>` (or static title + `Public` badge on featured notebooks), `+ Create notebook`, `Share` (`Copy` on public), `Notebook configuration` (`...`), `Settings`, plan badge, Account avatar.
- **`Share` Modal**: `Add people and groups`, `People with access` (`Owner`), `Notify people`, `Notebook Access` (`Restricted`), `Copy link`, `Save`.
- **`Notebook configuration` (`...`)**:
  - Owned: `Configure Chat`, `Customize notebook` (`Upload`, `Notebook title`, `Set custom notebook summary`, `Done`), `Copy notebook`, `Analytics`, `Delete chat history`
  - Public: `Delete chat history`

## Surface 4: Left Panel — `Sources`
- **Header & Actions**: `Sources`, `Collapse source panel`, `+ Add sources`, `+ Create note`.
- **Source Limit**: `600` sources per notebook (`<N> / 600`). Note: `+ New notebook` navigates to `/notebook/<uuid>?addSource=true` but `+ Add sources` may need an explicit click if it does not auto-open.
- **6 Source Types in `+ Add sources`**:
  1. `Upload files` (`pdf`, images, docs, audio, and more)
  2. `Websites` (`Website and YouTube URLs`, `Insert`)
  3. `Play Books` (`Explore Play Books`, `Unsupported books`, `Add to sources`)
  4. `Drive`
  5. `Textbooks` (`Topic`, `Level`, `Country` filters; 5 categories; `View details`, `Add to sources`)
  6. `Copied text` (`Insert`)
- **Inline Discover / Research Bar**: `"Search the web for new sources"` (`Discover sources based on the inputted query`), source dropdown (`Web`, `Drive`), mode dropdown (`Fast Research`, `Deep Research`), `Submit`.
- **Source List & Notes**: `Sort sources` (`Recent`, `Title`, `Type`), `Select all`, per-source checkbox + `More` (`Rename source`, `Remove source`), **Source Guide** (`Close source view`, `Open in new tab`, `Close source guide`, AI summary, key topic chips, full extracted text), `Notes` region (`Select all notes`, `note title editable`, `Convert`, `Delete note`, `Close note view`).

## Surface 5: Center Panel — `Chat`
- **Overview**: `Customize notebook` icon/title, source count & date, auto summary + `Save to note`, `Copy summary`, `Good summary`, `Bad summary`, up to 3 suggested prompt chips when empty.
- **Thread & Composer**: `Thoughts` toggle, inline citation pills (`[1]`, `[2]`, ... triggering `hizoJc`), footer actions (`Save message to a note`, `Copy model response to clipboard`, `Rate response as good`, `Rate response as bad`), `Open connected apps menu` (`Google Drive`, `Connect an app`), `Query box` (`"Ask a question or create something"`), `<N> sources`, `Submit`.
- **`Configure Chat` Modal**: Goal/style/role (`Default`, `Learning Guide`, `Custom` up to `10000` chars), Response length (`Default`, `Longer`, `Shorter`), `Save settings`.

## Surface 6: Right Panel — `Studio`
- **Header**: `Studio`, `Collapse studio panel`.
- **8 Create Artifact Tiles (`<basic-create-artifact-button>` / `[data-testid="create-artifact-tile"]`)**:
  1. `Audio Overview` (`data-artifact-type="1"`)
  2. `Slide Deck` (`data-artifact-type="8"`)
  3. `Video Overview` (`data-artifact-type="3"`)
  4. `Mind Map` (`data-artifact-type="mindmap_app"`)
  5. `Reports` (`data-artifact-type="2"`, `New!` badge; saved sub-types: `Timeline`, `Study Guide`, `FAQ`)
  6. `Flashcards` (`data-artifact-type="flashcards"`)
  7. `Quiz` (`data-artifact-type="quiz"`)
  8. `Infographic` (`data-artifact-type="7"`)
- **Note**: As of `2026-11-21`, there are NO inline pencil/Customize icons on the 8 create tiles and NO `Data Table` tile in this `luminous-ui` build. Clicking `Mind Map` opens a configuration modal (`Choose language`, `Sources`, `What should the topic be?`, AI Usage meter, `Generate later`, `Generate now`); opening the generated Mind Map opens `Studio > App` (`Close web page viewer`, editable `Artifact title`, `Share`, `Open in new tab`, `Expand`, `More options` -> `Delete`, `View <N> sources`, `Good content`, `Bad content`, embedding a cross-origin `scf.usercontent.goog` iframe).
- **Saved `<artifact-library>` & `<artifact-viewer role="dialog">`**: `Interactive mode`, `Play`, `More`, `Artifact title`, `Open in new tab`, `Collapse`, `More options` -> `Download`, `Close`, `View <N> sources`, `Zoom in` / `Zoom out`, `Good content` / `Bad content`.
