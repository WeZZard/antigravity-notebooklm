# Ask Runbook (Grounded Q&A & Citation Verification)

Operate the **Center Panel (`Chat`)** inside the active notebook (`/notebook/<uuid>`) to answer questions grounded in selected sources and verify inline citations.

## 1. Scope Sources, Connected Apps & Chat Persona

1. **Scope Sources**: Verify target sources are checked in `Sources` and reflected in the composer's `<N> sources` counter. If new materials were supplied, ingest missing items first via [Extract Runbook](./extract.md).
2. **Connected Apps (Optional)**: To include Google Drive folders in chat context, click `Open connected apps menu` (`tune` icon in the composer) -> `Google Drive` (or `Connect an app`).
3. **Configure Chat (Optional)**: When the user requests a specific role, custom instruction, or response length:
   - Open top-bar `Notebook configuration` (`...`) -> `Configure Chat` (owned/editable notebooks).
   - Select goal/style/role: `Default` (*"Best for general purpose research and brainstorming tasks."*), `Learning Guide`, or `Custom` (up to `10000` chars).
   - Select response length: `Default`, `Longer`, or `Shorter`.
   - Click `Save settings` (`s0tc2d` HTTP `200`).

## 2. Submit Queries & Verify Inline Citations

1. Check the Notebook Overview above the thread if useful (`Save to note`, `Copy summary`, or suggested prompt chips when chat is empty).
2. Enter the user's question into `Query box` (`placeholder="Ask a question or create something"`) and click `Submit` (upward arrow).
3. Wait for the assistant response to finish:
   - Optionally expand `Thoughts` to inspect reasoning.
   - Read the response and note every numbered inline citation pill (`[1]`, `[2]`, ...).
4. **Verify Citations**: Click key citation pills (`[1]`, `[2]`, ...; triggers `hizoJc`) to open the highlighted source excerpt in `Sources` and verify exact provenance before quoting or summarizing back to the user (`Close source view` when done).

## 3. Save to Note, Copy & Clear History

- **Save or Copy**:
  - Click `Save message to a note` (pin button on an assistant response; triggers `cFji9` HTTP `200` and saves into `Notes` inside `Sources`) when requested.
  - Use `Copy model response to clipboard` or `Rate response as good` / `Rate response as bad` as appropriate.
- **Clear History**: Only click `Notebook configuration` (`...`) -> `Delete chat history` (*"Chat history is private to you."*) when explicitly requested/confirmed by the user.
