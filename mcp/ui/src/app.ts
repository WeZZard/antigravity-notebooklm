import {
  App,
  applyDocumentTheme,
  applyHostFonts,
  applyHostStyleVariables,
} from '@modelcontextprotocol/ext-apps';

interface SourceTypeSpec {
  id: string;
  label: string;
  tabLabel: string;
  inputKind: string;
  placeholder: string;
  hint: string;
}

interface StudioTileSpec {
  id: string;
  artifactType?: string;
  tag: string;
  desc: string;
  subOptions?: string[];
}

interface CapabilitiesManifest {
  maxSources?: number;
  sourceTypes?: SourceTypeSpec[];
  research?: { scopes?: string[]; modes?: string[] };
  outputLanguages?: string[];
  studioTiles?: StudioTileSpec[];
}

interface LauncherContext {
  notebookTitle?: string;
  notebookUrl?: string;
  sourcesCount?: number;
  sources?: string[];
  hasSources?: boolean;
  preselectedDeliverables?: string[];
  outputLanguage?: string;
  note?: string;
  capabilities?: CapabilitiesManifest;
}

type SourceTabId = 'urls' | 'text' | 'files' | 'research' | 'ref';

interface StagedSource {
  id: string;
  kind:
    | 'Websites'
    | 'Copied text'
    | 'Upload files'
    | 'Research'
    | 'Drive'
    | 'Play Books'
    | 'Textbooks'
    | 'Existing notebook';
  label: string;
  value: string;
  meta?: string;
}

const DEFAULT_TILES: StudioTileSpec[] = [
  { id: 'Audio Overview', tag: 'Podcast', desc: 'Two-host AI podcast dialogue · Play & Interactive mode' },
  { id: 'Slide Deck', tag: 'Slides', desc: 'Presentation deck structured from active sources' },
  { id: 'Video Overview', tag: 'Video', desc: 'Narrated visual video summary · inline Play' },
  { id: 'Mind Map', tag: 'Interactive', desc: 'Topic hierarchy · Choose language & topic focus' },
  { id: 'Reports', tag: 'New!', desc: 'Study Guide, Timeline, FAQ, or custom report', subOptions: ['Study Guide', 'Timeline', 'FAQ'] },
  { id: 'Flashcards', tag: 'Study', desc: 'Interactive active-recall cards derived from sources' },
  { id: 'Quiz', tag: 'Test', desc: 'Interactive knowledge-check quiz grounded in sources' },
  { id: 'Infographic', tag: 'Visual', desc: 'Visual summary with Zoom in/out & Download controls' },
];

interface TileTheme {
  fg: string;
  bg: string;
  svg: string;
}

const TILE_THEME: Record<string, TileTheme> = {
  'Audio Overview': {
    fg: '#38BDF8',
    bg: 'rgba(56, 189, 248, 0.14)',
    svg: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"/><path d="M8 7v10"/><path d="M4 10v4"/><path d="M16 7v10"/><path d="M20 10v4"/></svg>',
  },
  'Slide Deck': {
    fg: '#EC4899',
    bg: 'rgba(236, 72, 153, 0.14)',
    svg: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 18v3"/><path d="M7 9h6"/><path d="M7 13h10"/></svg>',
  },
  'Video Overview': {
    fg: '#10B981',
    bg: 'rgba(16, 185, 129, 0.14)',
    svg: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="15" height="14" rx="2"/><polygon points="23 7 17 12 23 17 23 7"/></svg>',
  },
  'Mind Map': {
    fg: '#A855F7',
    bg: 'rgba(168, 85, 247, 0.14)',
    svg: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><circle cx="4" cy="6" r="2"/><circle cx="20" cy="6" r="2"/><circle cx="4" cy="18" r="2"/><circle cx="20" cy="18" r="2"/><path d="M9.5 10.5 5.8 7.4M14.5 10.5l3.7-3.1M9.5 13.5l-3.7 3.1M14.5 13.5l3.7 3.1"/></svg>',
  },
  Reports: {
    fg: '#F43F5E',
    bg: 'rgba(244, 63, 94, 0.14)',
    svg: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>',
  },
  Flashcards: {
    fg: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.14)',
    svg: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="14" height="14" rx="2"/><path d="M7 6V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-2"/></svg>',
  },
  Quiz: {
    fg: '#06B6D4',
    bg: 'rgba(6, 182, 212, 0.14)',
    svg: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 4.8.8c0 1.7-2.3 2.2-2.3 3.7"/><circle cx="12" cy="17" r=".6" fill="currentColor"/></svg>',
  },
  Infographic: {
    fg: '#EAB308',
    bg: 'rgba(234, 179, 8, 0.14)',
    svg: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 16v-4M12 16V8M17 16v-6"/></svg>',
  },
};

const SOURCE_ICONS: Record<string, string> = {
  youtube:
    '<svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="4" fill="#FF0000"/><polygon points="10 9 16 12 10 15" fill="#FFFFFF"/></svg>',
  web:
    '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  text:
    '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="13" y2="16"/></svg>',
  files:
    '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#818CF8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
  research:
    '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#06B6D4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><path d="M11 8v6M8 11h6"/></svg>',
  drive:
    '<svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true"><polygon points="8.5 3 15.5 3 22 14.5 15 14.5" fill="#F4B400"/><polygon points="8.5 3 2 14.5 5.5 20.5 12 9" fill="#0F9D58"/><polygon points="5.5 20.5 18.5 20.5 22 14.5 9 14.5" fill="#4285F4"/></svg>',
  play_books:
    '<svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true"><polygon points="5 3 20 12 5 21" fill="#3B82F6"/><path d="M8 8.5v7l5.5-3.5z" fill="#93C5FD"/></svg>',
  textbooks:
    '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H2z"/><path d="M22 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z"/></svg>',
  existing:
    '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#A855F7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
};

function getStagedSourceIcon(item: StagedSource): string {
  if (item.kind === 'Websites') {
    const low = item.value.toLowerCase();
    return low.includes('youtube.com') || low.includes('youtu.be')
      ? SOURCE_ICONS.youtube
      : SOURCE_ICONS.web;
  }
  if (item.kind === 'Copied text') return SOURCE_ICONS.text;
  if (item.kind === 'Upload files') return SOURCE_ICONS.files;
  if (item.kind === 'Research') return SOURCE_ICONS.research;
  if (item.kind === 'Drive') return SOURCE_ICONS.drive;
  if (item.kind === 'Play Books') return SOURCE_ICONS.play_books;
  if (item.kind === 'Textbooks') return SOURCE_ICONS.textbooks;
  return SOURCE_ICONS.existing;
}

function getRefKindIcon(kind: string): string {
  if (kind === 'Drive') return SOURCE_ICONS.drive;
  if (kind === 'Play Books') return SOURCE_ICONS.play_books;
  if (kind === 'Textbooks') return SOURCE_ICONS.textbooks;
  return SOURCE_ICONS.existing;
}

const app = new App({ name: 'NotebookLM 2-Step Workbench', version: '0.7.0' }, {});

let launcherCtx: LauncherContext = { notebookTitle: 'NotebookLM Studio', sourcesCount: 0 };
let step: 1 | 2 = 1;
let userNavigatedStep = false;
let activeSourceTab: SourceTabId = 'urls';
const stagedSources: StagedSource[] = [];
const selectedTiles = new Set<string>();
let reportSubtype = 'Study Guide';
let wantExtract = false;
let wantAsk = false;
let ephemeral = false;
let selectedLanguage = 'Auto (Chat language)';
let userEditedLanguage = false;
let focusedTile: StudioTileSpec | null = null;
let statusOverride: string | null = null;
let sending = false;

const titleEl = document.getElementById('nb-title') as HTMLElement;
const stepMetaEl = document.getElementById('nb-sources') as HTMLElement;

const step1Panel = document.getElementById('step1-panel') as HTMLElement;
const existingSourcesBar = document.getElementById('existing-sources-bar') as HTMLElement;
const langSelectEl = document.getElementById('lang-select') as HTMLSelectElement;
const extractToggleBtn = document.getElementById('act-extract') as HTMLButtonElement;
const askToggleBtn = document.getElementById('act-ask') as HTMLButtonElement;
const askInputWrap = document.getElementById('ask-wrap') as HTMLElement;
const askInputEl = document.getElementById('ask-input') as HTMLInputElement;
const gridEl = document.getElementById('tile-grid') as HTMLElement;
const reportBarEl = document.getElementById('report-subbar') as HTMLElement;
const ephemeralStep1Label = document.getElementById('ephemeral-step1-wrap') as HTMLElement;
const ephemeralStep1Chk = document.getElementById('ephemeral-chk-1') as HTMLInputElement;

const step2Panel = document.getElementById('step2-panel') as HTMLElement;
const chosenSummaryEl = document.getElementById('chosen-summary') as HTMLElement;
const backTopBtn = document.getElementById('back-top-btn') as HTMLButtonElement;
const tabRowEl = document.getElementById('src-tabs') as HTMLElement;
const srcTextareaEl = document.getElementById('src-textarea') as HTMLTextAreaElement;
const srcSingleEl = document.getElementById('src-single') as HTMLInputElement;
const researchOptsEl = document.getElementById('research-opts') as HTMLElement;
const researchScopeEl = document.getElementById('research-scope') as HTMLSelectElement;
const researchModeEl = document.getElementById('research-mode') as HTMLSelectElement;
const refRowEl = document.getElementById('ref-row') as HTMLElement;
const refIconEl = document.getElementById('ref-icon') as HTMLElement;
const refKindEl = document.getElementById('ref-kind') as HTMLSelectElement;
const srcHintEl = document.getElementById('src-hint') as HTMLElement;
const addSrcBtn = document.getElementById('add-src-btn') as HTMLButtonElement;
const stagedListEl = document.getElementById('staged-list') as HTMLElement;
const ephemeralStep2Chk = document.getElementById('ephemeral-chk-2') as HTMLInputElement;

const detailTitleEl = document.getElementById('detail-title') as HTMLElement;
const detailSubEl = document.getElementById('detail-sub') as HTMLElement;
const backBtn = document.getElementById('back-btn') as HTMLButtonElement;
const addMoreBtn = document.getElementById('add-more-btn') as HTMLButtonElement;
const clearBtn = document.getElementById('clear-btn') as HTMLButtonElement;
const primaryBtn = document.getElementById('primary-btn') as HTMLButtonElement;

function getTiles(): StudioTileSpec[] {
  const fromManifest = launcherCtx.capabilities?.studioTiles;
  return Array.isArray(fromManifest) && fromManifest.length > 0 ? fromManifest : DEFAULT_TILES;
}

function getSourceMeta(id: string): SourceTypeSpec | undefined {
  return launcherCtx.capabilities?.sourceTypes?.find((s) => s.id === id);
}

function hasExistingSources(): boolean {
  if (launcherCtx.hasSources) return true;
  if (typeof launcherCtx.sourcesCount === 'number' && launcherCtx.sourcesCount > 0) return true;
  return Array.isArray(launcherCtx.sources) && launcherCtx.sources.length > 0;
}

function applyHostContext(ctx: Record<string, any> | undefined): void {
  if (!ctx) return;
  if (ctx.theme) applyDocumentTheme(ctx.theme);
  if (ctx.styles?.variables) applyHostStyleVariables(ctx.styles.variables);
  if (ctx.styles?.css?.fonts) applyHostFonts(ctx.styles.css.fonts);
}

function applyPreselected(items: string[] | undefined): void {
  if (!Array.isArray(items) || items.length === 0) return;
  const tiles = getTiles();
  for (const raw of items) {
    const val = raw.trim();
    if (!val) continue;
    if (val.toLowerCase().includes('extract')) {
      wantExtract = true;
      continue;
    }
    if (val.toLowerCase().includes('ask')) {
      wantAsk = true;
      continue;
    }
    const matched = tiles.find((t) => t.id.toLowerCase() === val.toLowerCase());
    if (matched) selectedTiles.add(matched.id);
  }
}

function applyIncomingContext(incoming: LauncherContext): void {
  launcherCtx = { ...launcherCtx, ...incoming };
  applyPreselected(incoming.preselectedDeliverables);
  if (incoming.outputLanguage && !userEditedLanguage) {
    selectedLanguage = incoming.outputLanguage;
  }
  if (!userNavigatedStep) {
    const preselectedCount = selectedTiles.size + (wantExtract ? 1 : 0) + (wantAsk ? 1 : 0);
    if (!hasExistingSources() && preselectedCount > 0) {
      step = 2;
    } else {
      step = 1;
    }
  }
}

function createDraftSourceFromCurrentInput(): StagedSource | null {
  const raw =
    activeSourceTab === 'urls' || activeSourceTab === 'text'
      ? srcTextareaEl.value.trim()
      : srcSingleEl.value.trim();
  if (!raw) return null;

  const uid = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  if (activeSourceTab === 'urls') {
    const urls = raw.split(/\s+/).filter(Boolean);
    const short =
      urls.length === 1 ? urls[0].replace(/^https?:\/\/(www\.)?/, '').slice(0, 34) : `${urls.length} URLs`;
    return { id: uid, kind: 'Websites', label: `URL: ${short}`, value: urls.join('\n') };
  }
  if (activeSourceTab === 'text') {
    const preview = raw.replace(/\s+/g, ' ').slice(0, 28);
    return { id: uid, kind: 'Copied text', label: `Text: ${preview}...`, value: raw };
  }
  if (activeSourceTab === 'files') {
    const preview = raw.split(/[,\n]/)[0].trim();
    return { id: uid, kind: 'Upload files', label: `File: ${preview}`, value: raw };
  }
  if (activeSourceTab === 'research') {
    const scope = researchScopeEl.value || 'Web';
    const mode = researchModeEl.value || 'Fast Research';
    return {
      id: uid,
      kind: 'Research',
      label: `${scope} · ${mode}: ${raw.slice(0, 24)}`,
      value: raw,
      meta: `${scope} / ${mode}`,
    };
  }
  const refKind = (refKindEl.value || 'Drive') as StagedSource['kind'];
  return { id: uid, kind: refKind, label: `${refKind}: ${raw.slice(0, 26)}`, value: raw };
}

function commitCurrentInput(): boolean {
  const draft = createDraftSourceFromCurrentInput();
  if (!draft) return false;
  stagedSources.push(draft);
  srcTextareaEl.value = '';
  srcSingleEl.value = '';
  statusOverride = null;
  render();
  void syncPendingModelContext();
  return true;
}

function collectAllEffectiveSources(): StagedSource[] {
  const draft = createDraftSourceFromCurrentInput();
  return draft ? [...stagedSources, draft] : [...stagedSources];
}

function getSelectedDeliverableLabels(): string[] {
  const list: string[] = [];
  if (wantExtract) list.push('Extract Transcript');
  for (const id of selectedTiles) {
    list.push(id === 'Reports' ? `Reports (${reportSubtype})` : id);
  }
  if (wantAsk) {
    const q = askInputEl.value.trim();
    list.push(q ? `Ask: "${q}"` : 'Ask Question');
  }
  return list;
}

function getActionCount(): number {
  return selectedTiles.size + (wantExtract ? 1 : 0) + (wantAsk && askInputEl.value.trim() ? 1 : 0);
}

function hasAnyAction(): boolean {
  return getActionCount() > 0;
}

function buildPrompt(): string {
  const newSources = collectAllEffectiveSources();
  const lines: string[] = [];

  if (launcherCtx.notebookUrl) {
    lines.push(`Use NotebookLM notebook "${launcherCtx.notebookTitle || 'Active notebook'}" (${launcherCtx.notebookUrl}).`);
  } else if (newSources.some((s) => s.kind === 'Existing notebook')) {
    const nb = newSources.find((s) => s.kind === 'Existing notebook')!;
    lines.push(`Open and reuse existing NotebookLM notebook: ${nb.value}.`);
  } else {
    lines.push('Run via NotebookLM (notebook.google.com) using an implicit [AGY-Session] workspace without browsing unrelated notebooks first.');
  }

  const ingestSources = newSources.filter((s) => s.kind !== 'Existing notebook');
  if (ingestSources.length > 0) {
    lines.push('Ingest these data sources:');
    for (const s of ingestSources) {
      if (s.kind === 'Research') {
        lines.push(`- Discover/Research (${s.meta}): ${s.value}`);
      } else {
        lines.push(`- [${s.kind}] ${s.value}`);
      }
    }
  } else if (hasExistingSources()) {
    const cnt = launcherCtx.sourcesCount || launcherCtx.sources?.length || 1;
    const names = Array.isArray(launcherCtx.sources) && launcherCtx.sources.length > 0
      ? ` (${launcherCtx.sources.join(', ')})`
      : '';
    lines.push(`Use the ${cnt} existing source(s) already provided${names}.`);
  }

  const tasks: string[] = [];
  if (wantExtract) {
    tasks.push('Extract primary transcripts, key topics, and summaries via Source Guide');
  }
  if (selectedTiles.size > 0) {
    const formatted = Array.from(selectedTiles).map((id) =>
      id === 'Reports' ? `Reports (${reportSubtype})` : id,
    );
    tasks.push(`Generate Studio deliverable(s): ${formatted.join(', ')}`);
  }
  if (wantAsk) {
    const q = askInputEl.value.trim();
    if (q) tasks.push(`Answer with verified inline citations: "${q}"`);
  }
  if (tasks.length > 0) {
    lines.push(`Execute:\n${tasks.map((t) => `- ${t}`).join('\n')}`);
  }
  if (selectedLanguage === 'Account Default') {
    lines.push('Output language: Account Default (keep global Settings -> Output language unchanged).');
  } else if (selectedLanguage === 'Auto (Chat language)') {
    lines.push('Output language: Auto (match conversation language; set per-artifact or temporarily override Settings -> Output language and restore original setting after triggering).');
  } else {
    lines.push(`Output language: ${selectedLanguage} (set per-artifact or temporarily override Settings -> Output language and restore original setting after triggering).`);
  }
  if (selectedTiles.size > 0) {
    lines.push('Delivery: open generated preview in the built-in right-pane browser and download downloadable outputs locally to ./notebooklm-outputs/.');
  }
  if (ephemeral) {
    lines.push('Cleanup policy: delete after done (ephemeral [AGY-Session]).');
  }
  return lines.join('\n');
}

async function syncPendingModelContext(): Promise<void> {
  if (!app.getHostCapabilities()?.updateModelContext) return;
  const hasAnything = collectAllEffectiveSources().length > 0 || hasAnyAction();
  if (!hasAnything) {
    try {
      await app.updateModelContext({ content: [] });
    } catch {
      // Ignore host rejection when clearing context.
    }
    return;
  }
  try {
    await app.updateModelContext({
      content: [{ type: 'text', text: `NotebookLM Workbench selection:\n${buildPrompt()}` }],
    });
  } catch {
    // Non-fatal.
  }
}

function renderStep1(): void {
  const existing = hasExistingSources();
  const srcList = Array.isArray(launcherCtx.sources) ? launcherCtx.sources : [];
  existingSourcesBar.hidden = !existing;
  if (existing) {
    const cnt = launcherCtx.sourcesCount || srcList.length;
    const preview = srcList.length > 0 ? `: ${srcList.slice(0, 3).join(', ')}${srcList.length > 3 ? '...' : ''}` : '';
    existingSourcesBar.textContent = `Using ${cnt} provided source${cnt === 1 ? '' : 's'}${preview} (Step 2 skipped)`;
  }

  extractToggleBtn.className = wantExtract ? 'pill active' : 'pill';
  askToggleBtn.className = wantAsk ? 'pill active' : 'pill';
  askInputWrap.hidden = !wantAsk;

  ephemeralStep1Label.hidden = !existing;
  ephemeralStep1Chk.checked = ephemeral;

  const tiles = getTiles();
  gridEl.innerHTML = '';
  for (const tile of tiles) {
    const isSel = selectedTiles.has(tile.id);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = isSel ? 'tile selected' : 'tile';
    const theme = TILE_THEME[tile.id] || TILE_THEME.Reports;
    const iconStyle = isSel ? '' : `style="background:${theme.bg};color:${theme.fg}"`;
    btn.innerHTML = `
      <div class="tile-top">
        <span class="tile-icon" ${iconStyle}>${theme.svg}</span>
        <span class="tile-tag">${isSel ? 'Selected' : tile.tag}</span>
      </div>
      <div class="tile-label">${tile.id}</div>
    `;
    btn.addEventListener('click', () => {
      statusOverride = null;
      if (selectedTiles.has(tile.id)) selectedTiles.delete(tile.id);
      else selectedTiles.add(tile.id);
      focusedTile = tile;
      render();
      void syncPendingModelContext();
    });
    gridEl.appendChild(btn);
  }

  const reportsTile = tiles.find((t) => t.id === 'Reports');
  const subOpts = reportsTile?.subOptions || ['Study Guide', 'Timeline', 'FAQ'];
  reportBarEl.hidden = !selectedTiles.has('Reports');
  if (!reportBarEl.hidden) {
    reportBarEl.innerHTML = '<span class="sub-label">Report format:</span>';
    for (const opt of subOpts) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = reportSubtype === opt ? 'pill active' : 'pill';
      b.textContent = opt;
      b.addEventListener('click', () => {
        reportSubtype = opt;
        render();
        void syncPendingModelContext();
      });
      reportBarEl.appendChild(b);
    }
  }
}

function renderStep2(): void {
  const labels = getSelectedDeliverableLabels();
  chosenSummaryEl.textContent =
    labels.length > 0 ? `Creating: ${labels.join(' · ')}` : 'Add data sources (optional action)';
  ephemeralStep2Chk.checked = ephemeral;

  const tabs: { id: SourceTabId; label: string; icon: string }[] = [
    { id: 'urls', label: getSourceMeta('Websites')?.tabLabel || 'YouTube / URLs', icon: SOURCE_ICONS.youtube },
    { id: 'text', label: getSourceMeta('Copied text')?.tabLabel || 'Text', icon: SOURCE_ICONS.text },
    { id: 'files', label: getSourceMeta('Upload files')?.tabLabel || 'Local Files', icon: SOURCE_ICONS.files },
    { id: 'research', label: 'Research', icon: SOURCE_ICONS.research },
    { id: 'ref', label: 'Drive / Books / Existing', icon: SOURCE_ICONS.drive },
  ];

  tabRowEl.innerHTML = '';
  for (const tab of tabs) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = tab.id === activeSourceTab ? 'pill pill-ic active' : 'pill pill-ic';
    btn.innerHTML = `<span class="ic">${tab.icon}</span><span></span>`;
    (btn.querySelector('span:last-child') as HTMLElement).textContent = tab.label;
    btn.addEventListener('click', () => {
      activeSourceTab = tab.id;
      render();
    });
    tabRowEl.appendChild(btn);
  }

  const isMulti = activeSourceTab === 'urls' || activeSourceTab === 'text';
  srcTextareaEl.hidden = !isMulti;
  srcSingleEl.hidden = isMulti;
  researchOptsEl.hidden = activeSourceTab !== 'research';
  refRowEl.hidden = activeSourceTab !== 'ref';
  if (!refRowEl.hidden) {
    refIconEl.innerHTML = getRefKindIcon(refKindEl.value || 'Drive');
  }

  if (activeSourceTab === 'urls') {
    srcTextareaEl.placeholder =
      getSourceMeta('Websites')?.placeholder || 'Paste YouTube or website URLs (one per line)...';
    srcHintEl.textContent =
      getSourceMeta('Websites')?.hint || 'Public YouTube transcripts & visible web text.';
  } else if (activeSourceTab === 'text') {
    srcTextareaEl.placeholder =
      getSourceMeta('Copied text')?.placeholder || 'Paste raw notes, markdown, or copied text...';
    srcHintEl.textContent = getSourceMeta('Copied text')?.hint || 'Ingested directly as text source.';
  } else if (activeSourceTab === 'files') {
    srcSingleEl.placeholder =
      getSourceMeta('Upload files')?.placeholder || 'Local workspace file path(s)...';
    srcHintEl.textContent =
      getSourceMeta('Upload files')?.hint || 'Text/MD auto-stages; binaries use browser upload.';
  } else if (activeSourceTab === 'research') {
    const scopes = launcherCtx.capabilities?.research?.scopes || ['Web', 'Drive'];
    const modes = launcherCtx.capabilities?.research?.modes || ['Fast Research', 'Deep Research'];
    if (researchScopeEl.options.length === 0) {
      scopes.forEach((s) => researchScopeEl.add(new Option(s, s)));
    }
    if (researchModeEl.options.length === 0) {
      modes.forEach((m) => researchModeEl.add(new Option(m, m)));
    }
    srcSingleEl.placeholder = 'Enter topic or query to research...';
    srcHintEl.textContent = 'Runs NotebookLM inline Discover / Research during ingestion.';
  } else {
    srcSingleEl.placeholder = 'Drive folder/doc, Play Book title, Textbook, or Notebook URL...';
    srcHintEl.textContent = 'Reuses existing notebook or pulls Drive / Play Books / Textbooks.';
  }

  stagedListEl.innerHTML = '';
  stagedListEl.hidden = stagedSources.length === 0;
  for (const item of stagedSources) {
    const chip = document.createElement('span');
    chip.className = 'src-chip';
    chip.innerHTML = `<span class="ic">${getStagedSourceIcon(item)}</span><span class="src-chip-text"></span><button type="button" class="src-chip-x" aria-label="Remove">×</button>`;
    (chip.querySelector('.src-chip-text') as HTMLElement).textContent = item.label;
    (chip.querySelector('.src-chip-x') as HTMLButtonElement).addEventListener('click', () => {
      const idx = stagedSources.findIndex((s) => s.id === item.id);
      if (idx >= 0) stagedSources.splice(idx, 1);
      render();
      void syncPendingModelContext();
    });
    stagedListEl.appendChild(chip);
  }
}

function render(): void {
  const existing = hasExistingSources();
  const maxSrc = launcherCtx.capabilities?.maxSources ?? 600;
  const activeCount = typeof launcherCtx.sourcesCount === 'number' ? launcherCtx.sourcesCount : 0;

  titleEl.textContent = launcherCtx.notebookTitle || 'NotebookLM Studio';
  if (existing && step === 1) {
    stepMetaEl.textContent = `Ready · ${activeCount}/${maxSrc} sources`;
  } else {
    stepMetaEl.textContent = step === 1 ? 'Step 1 of 2' : 'Step 2 of 2';
  }

  const langs = launcherCtx.capabilities?.outputLanguages || [
    'Auto (Chat language)',
    'Account Default',
    'English',
    'Simplified Chinese',
    'Traditional Chinese',
    'Japanese',
    'Korean',
  ];
  const currentOpts = Array.from(langSelectEl.options).map((o) => o.value);
  if (currentOpts.join('|') !== langs.join('|')) {
    langSelectEl.innerHTML = '';
    for (const lang of langs) {
      langSelectEl.add(new Option(lang === 'Auto (Chat language)' ? 'Auto (Chat)' : lang, lang));
    }
  }
  if (!langs.includes(selectedLanguage)) {
    langSelectEl.add(new Option(selectedLanguage, selectedLanguage));
  }
  langSelectEl.value = selectedLanguage;

  step1Panel.hidden = step !== 1;
  step2Panel.hidden = step !== 2;

  if (step === 1) renderStep1();
  else renderStep2();

  const canMessage = Boolean(app.getHostCapabilities()?.message);
  const actionCount = getActionCount();
  const sourceInputsCount = collectAllEffectiveSources().length;
  const hasAnything = sourceInputsCount > 0 || actionCount > 0 || wantAsk;

  backBtn.hidden = step !== 2;
  addMoreBtn.hidden = !(step === 1 && existing);
  clearBtn.hidden = !hasAnything;

  if (sending) {
    primaryBtn.disabled = true;
    primaryBtn.textContent = 'Sending...';
  } else if (step === 1 && !existing) {
    primaryBtn.disabled = actionCount === 0;
    primaryBtn.textContent = 'Next: Add Sources ->';
  } else {
    const canLaunch = existing
      ? actionCount > 0
      : sourceInputsCount > 0 && (actionCount > 0 || sourceInputsCount > 0);
    primaryBtn.disabled = !canLaunch;
    const label = canMessage ? 'Launch' : 'Copy Prompt';
    primaryBtn.textContent = actionCount > 0 ? `${label} (${actionCount})` : label;
  }

  if (statusOverride) {
    detailTitleEl.textContent = statusOverride;
    detailSubEl.textContent = 'Dispatched to Antigravity agent loop';
  } else if (step === 1) {
    if (actionCount > 0) {
      detailTitleEl.textContent = focusedTile
        ? `${focusedTile.id} — ${focusedTile.desc}`
        : `${actionCount} deliverable(s) selected`;
      detailSubEl.textContent = existing
        ? `Sources ready — click ${canMessage ? 'Launch' : 'Copy Prompt'} to skip Step 2 and run`
        : 'Click Next to attach data sources';
    } else {
      detailTitleEl.textContent = '1. What would you like to create?';
      detailSubEl.textContent = existing
        ? 'Sources already supplied — pick deliverables to launch directly'
        : launcherCtx.note || 'Pick Studio deliverables, Extract Transcript, or Ask Question';
    }
  } else {
    detailTitleEl.textContent =
      sourceInputsCount > 0
        ? `${sourceInputsCount} source input(s) staged`
        : '2. Add the data sources for this run';
    detailSubEl.textContent =
      sourceInputsCount > 0
        ? `Click ${canMessage ? 'Launch' : 'Copy Prompt'} to send directly into chat`
        : 'Paste YouTube/web URLs, text, files, Research query, or Drive/book';
  }
}

async function dispatchLaunch(): Promise<void> {
  if (sending) return;
  const prompt = buildPrompt();
  const canMessage = Boolean(app.getHostCapabilities()?.message);

  if (canMessage) {
    sending = true;
    statusOverride = null;
    render();
    try {
      const result = await app.sendMessage({
        role: 'user',
        content: [{ type: 'text', text: prompt }],
      });
      if (!result?.isError) {
        statusOverride = 'Sent directly to chat!';
        stagedSources.length = 0;
        srcTextareaEl.value = '';
        srcSingleEl.value = '';
        selectedTiles.clear();
        wantExtract = false;
        wantAsk = false;
        askInputEl.value = '';
        focusedTile = null;
        sending = false;
        render();
        return;
      }
    } catch {
      // Fall back to clipboard on host error.
    }
    sending = false;
  }

  try {
    await navigator.clipboard.writeText(prompt);
    statusOverride = 'Copied prompt to clipboard!';
  } catch {
    statusOverride = 'Select and copy your prompt from model context.';
  }
  render();
}

primaryBtn.addEventListener('click', () => {
  if (step === 1 && !hasExistingSources()) {
    if (!hasAnyAction()) return;
    userNavigatedStep = true;
    step = 2;
    statusOverride = null;
    render();
    return;
  }
  void dispatchLaunch();
});

function goBackToStep1(): void {
  userNavigatedStep = true;
  step = 1;
  statusOverride = null;
  render();
}

backBtn.addEventListener('click', goBackToStep1);
backTopBtn.addEventListener('click', goBackToStep1);

addMoreBtn.addEventListener('click', () => {
  userNavigatedStep = true;
  step = 2;
  statusOverride = null;
  render();
});

addSrcBtn.addEventListener('click', () => {
  commitCurrentInput();
});

srcTextareaEl.addEventListener('input', () => {
  statusOverride = null;
  render();
});

srcSingleEl.addEventListener('input', () => {
  statusOverride = null;
  render();
});

srcSingleEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    commitCurrentInput();
  }
});

extractToggleBtn.addEventListener('click', () => {
  wantExtract = !wantExtract;
  statusOverride = null;
  render();
  void syncPendingModelContext();
});

askToggleBtn.addEventListener('click', () => {
  wantAsk = !wantAsk;
  statusOverride = null;
  render();
  if (wantAsk) askInputEl.focus();
  void syncPendingModelContext();
});

askInputEl.addEventListener('input', () => {
  statusOverride = null;
  render();
});

ephemeralStep1Chk.addEventListener('change', () => {
  ephemeral = ephemeralStep1Chk.checked;
  void syncPendingModelContext();
});

ephemeralStep2Chk.addEventListener('change', () => {
  ephemeral = ephemeralStep2Chk.checked;
  void syncPendingModelContext();
});

langSelectEl.addEventListener('change', () => {
  selectedLanguage = langSelectEl.value;
  userEditedLanguage = true;
  statusOverride = null;
  render();
  void syncPendingModelContext();
});

refKindEl.addEventListener('change', () => {
  render();
});

clearBtn.addEventListener('click', () => {
  statusOverride = null;
  stagedSources.length = 0;
  srcTextareaEl.value = '';
  srcSingleEl.value = '';
  selectedTiles.clear();
  wantExtract = false;
  wantAsk = false;
  askInputEl.value = '';
  ephemeral = false;
  selectedLanguage = launcherCtx.outputLanguage || 'Auto (Chat language)';
  userEditedLanguage = false;
  focusedTile = null;
  userNavigatedStep = true;
  step = 1;
  render();
  void syncPendingModelContext();
});

app.ontoolinput = (params) => {
  const args = (params?.arguments || {}) as LauncherContext;
  applyIncomingContext(args);
  render();
};

app.ontoolresult = (result) => {
  const sc = (result?.structuredContent || {}) as LauncherContext;
  if (sc && Object.keys(sc).length > 0) {
    applyIncomingContext(sc);
  }
  render();
};

app.onhostcontextchanged = (ctx) => {
  applyHostContext(ctx as Record<string, any>);
  render();
};

render();

app
  .connect()
  .then(() => {
    applyHostContext(app.getHostContext() as Record<string, any> | undefined);
    render();
  })
  .catch(() => {
    render();
  });
