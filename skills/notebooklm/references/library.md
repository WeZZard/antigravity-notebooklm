# Library Runbook (Notebooks, Collections, Sharing, Cleanup & Settings)

Explicitly manage existing notebooks, `Collections`, collaboration permissions (`Share`), `Analytics`, `Settings`, and `[AGY-Session]` cleanup on `https://notebook.google.com/`. Always confirm with the user before deleting pre-existing user notebooks or changing `Share` permissions (unless the user explicitly requested that deletion/cleanup).

## 1. Home Dashboard Navigation & Search (`https://notebook.google.com/`)

- **Tabs (`tablist "Notebook sections"`)**:
  - `All` — `Featured notebooks` (`View all`) and `Recent notebooks` (`See more`).
  - `My notebooks` — Owned notebooks and `+ New notebook`.
  - `Discover` — Play Books promo banner and categorized featured notebooks (`Education & Learning`, `Health, Biology & Personal Wellness`, `Leadership, Business & Strategy`, `Productivity, Focus & Skill Mastery`, `Psychology, Behavior & Parenting`, `Science, AI & Innovation`, `More featured notebooks`).
  - `Collections` — `My collections` and `New collection`.
- **Search, View & Sort**:
  - `Search notebooks` (`"Search notebooks by keywords or topics..."`).
  - Toggle `Grid view` / `List view` (columns: `Title`, `Sources`, `Created`, `Role`).
  - `Sort notebooks` (`Most recent`, `Title`).

## 2. Notebook Organization, Renaming, Copying & Cleanup

- **Create**: `+ New notebook` (Home) or `+ Create notebook` (inside a notebook).
- **Rename**:
  - Home card `Project actions` (`...`) -> `Edit title`.
  - Inside a notebook: edit the top-bar title `<input>` directly, or `Notebook configuration` (`...`) -> `Customize notebook`.
- **Customize Notebook**: `Notebook configuration` (`...`) -> `Customize notebook` (`Upload` cover/icon via `browser_sandbox/uploads/`, edit `Notebook title`, `Set custom notebook summary`, `Done`).
- **Pin, Duplicate & Delete**:
  - Owned card `Project actions` (`...`): `Edit title`, `Add to collection`, `Pin to top`, `Delete` (confirm `"Delete this notebook?"` dialog).
  - Featured card `Project actions` (`...`): `Add to collection`, `Report notebook`.
  - Inside owned notebook `Notebook configuration` (`...`): `Copy notebook`.
- **Session Cleanup**: When the user asks to clean up temporary `[AGY-Session]` notebooks, filter `My notebooks` for `[AGY-Session]` cards and delete the requested ones after confirmation (or immediately if cleaning up the current session they explicitly asked to remove).

## 3. Collections, Sharing & Analytics

- **Collections**: In `Collections` tab click `New collection`, or use `Project actions` (`...`) -> `Add to collection` on any card.
- **Share**: Inside `/notebook/<uuid>`, click `Share` in the top bar -> manage `Add people and groups`, `Notify people`, `Notebook Access` (`Restricted`: *"Only people with access can open with the link"*), `Copy link`, `Save`. *(Public/featured notebooks show a disabled `Copy` button instead.)*
- **Analytics**: `Notebook configuration` (`...`) -> `Analytics` (requires sharing with at least 4 other users and chat activity within the past 7 days; updates roughly every 24 hours).

## 4. Settings & Connected Apps

Click the `Settings` gear icon in the top bar for:
1. `Connected apps` — Navigates to `https://notebook.google.com/apps` (`Connected Apps`, `WW9MQ` HTTP `200`) to connect integrations such as `Google Drive` (*"Cite sources and summarize documents directly from your folders."*).
2. `Gemini Notebook help`, `Send feedback`, `Discord`
3. `Output language`
4. `Notifications`
5. `Remove watermarks`
6. `Licenses`, `Device`, `Usage`, `Manage subscription`
