// GTA 6 Trophy Guide — checklist, filters, spoiler mode, roadmap, export/import.
// Plain ES module, no dependencies, no network calls at run time beyond loading
// the app's own data/trophies.json. Progress lives in localStorage.

const DATA_URL = 'data/trophies.json';
const STORE_KEY = 'gta6-trophy-guide-v1';
const GRADE_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 };

const STAGES = [
  { n: 1, title: 'Stage 1 — Play the opening', text: 'Start the story and finish the opening mission Gone Fishing, then Chapter 1. Nothing here is missable; just play. Trophies: the opener and the Chapter 1 completion.' },
  { n: 2, title: 'Stage 2 — Chapters 2–3 and the early open world', text: 'Push through Chapters 2 and 3, finish the Breakfast Run mission, and try the easy open-world trophies as you pass them: Combat Focus kills, a cocktail on Ocean Beach, the showroom smash and a round of bowling.' },
  { n: 3, title: 'Stage 3 — Mid-story, activities and stranger strands', text: 'Finish Chapter 4 and its named missions, start the stranger strands (Andy, Kenton, Billy), and work the activity set: shooting range golds, races, drone races, fishing, arcade, the partner wanted-level trophies and the airport and robbery one-offs.' },
  { n: 4, title: 'Stage 4 — Late story, collectibles and cleanup', text: 'Finish the remaining story missions and stranger finales (Randy, Tyrone, the 8-strand silver), then sweep the long counts: 250 stunts, 100 vehicles, 100 WAiNK It spots, card sets, meditation spots, exploring all of Leonida, bank vaults, marked-bill laundering, spending and garages. This is where the missable choice trophy lives — see Actions Speak Louder and keep a save before major story decisions.' },
  { n: 5, title: 'Stage 5 — The finale', text: 'Complete the final mission. After the credits, the open world stays available for cleanup.' },
  { n: 6, title: 'Stage 6 — Platinum', text: 'Finish the 100% completion trophy and the platinum unlocks with the last trophy you earn. Use the checklist to find what is left.' },
];

const state = {
  trophies: [],
  earned: new Set(),
  kind: 'all',
  grade: 'all',
  query: '',
  hideEarned: false,
  spoiler: false,
  openId: null,
  view: 'checklist',
};

const $ = (id) => document.getElementById(id);
const els = {};

function loadStored() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (Array.isArray(data.earned)) state.earned = new Set(data.earned.filter((n) => Number.isInteger(n)));
    if (data.settings) {
      state.spoiler = !!data.settings.spoiler;
      state.hideEarned = !!data.settings.hideEarned;
    }
  } catch { /* corrupted save: start fresh */ }
}

function saveStored() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({
      earned: [...state.earned].sort((a, b) => a - b),
      settings: { spoiler: state.spoiler, hideEarned: state.hideEarned },
    }));
  } catch { /* storage unavailable: progress stays in memory */ }
}

function gradeLabel(g) {
  return g.charAt(0).toUpperCase() + g.slice(1);
}

function isHidden(t) {
  return state.spoiler && t.kind === 'story' && !state.earned.has(t.id);
}

function matchesFilters(t) {
  if (state.kind === 'missable') {
    if (!t.missable) return false;
  } else if (state.kind !== 'all' && t.kind !== state.kind) {
    return false;
  }
  if (state.grade !== 'all' && t.grade !== state.grade) return false;
  if (state.hideEarned && state.earned.has(t.id)) return false;
  if (state.query) {
    const q = state.query.toLowerCase();
    const hay = `${t.name} ${t.description} ${t.guide}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

function trophyRow(t) {
  const li = document.createElement('li');
  li.className = 'item' + (state.earned.has(t.id) ? ' earned' : '') + (t.missable ? ' missable' : '');
  li.dataset.id = String(t.id);

  const head = document.createElement('div');
  head.className = 'item-head';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = state.earned.has(t.id);
  box.setAttribute('aria-label', `Mark ${t.name} as earned`);
  box.addEventListener('change', () => {
    if (box.checked) state.earned.add(t.id); else state.earned.delete(t.id);
    saveStored();
    render();
  });
  head.appendChild(box);

  const body = document.createElement('div');
  body.className = 'item-body';
  const name = document.createElement('div');
  name.className = 'tname';
  name.textContent = isHidden(t) ? 'Hidden story trophy' : t.name;
  if (isHidden(t)) name.classList.add('spoiled');
  body.appendChild(name);
  const desc = document.createElement('div');
  desc.className = 'tdesc';
  desc.textContent = isHidden(t)
    ? 'Spoiler protection is on — earn this trophy to reveal its name and description.'
    : t.description;
  body.appendChild(desc);

  const tags = document.createElement('div');
  tags.className = 'tags';
  const gradeTag = document.createElement('span');
  gradeTag.className = `tag grade-${t.grade}`;
  gradeTag.textContent = gradeLabel(t.grade);
  tags.appendChild(gradeTag);
  const kindTag = document.createElement('span');
  kindTag.className = `tag kind-${t.kind}`;
  kindTag.textContent = t.kind;
  tags.appendChild(kindTag);
  if (t.missable) {
    const m = document.createElement('span');
    m.className = 'tag miss';
    m.textContent = 'Missable';
    tags.appendChild(m);
  }
  if (state.earned.has(t.id)) {
    const e = document.createElement('span');
    e.className = 'tag';
    e.textContent = 'Earned ✓';
    tags.appendChild(e);
  }
  body.appendChild(tags);

  if (state.openId === t.id && !isHidden(t)) {
    const detail = document.createElement('div');
    detail.className = 'detail';
    const h = document.createElement('h4');
    h.textContent = 'Guide';
    detail.appendChild(h);
    const g = document.createElement('p');
    g.textContent = t.guide;
    detail.appendChild(g);
    const src = document.createElement('p');
    src.className = 'src';
    src.innerHTML = '';
    const b = document.createElement('b');
    b.textContent = 'Source: ';
    src.appendChild(b);
    src.appendChild(document.createTextNode(`${t.sources} Guidance is my own reading of the official description — not yet verified in-game.`));
    detail.appendChild(src);
    const st = document.createElement('p');
    st.className = 'stage';
    st.textContent = `Roadmap: ${STAGES.find((s) => s.n === t.stage)?.title ?? ''}${t.missable ? ' — Missable: keep a save before story choices.' : ''}`;
    detail.appendChild(st);
    body.appendChild(detail);
  }
  head.appendChild(body);
  head.addEventListener('click', (ev) => {
    if (ev.target === box) return;
    state.openId = state.openId === t.id ? null : t.id;
    render();
  });
  li.appendChild(head);
  return li;
}

function renderList() {
  const list = els.list;
  list.innerHTML = '';
  const shown = state.trophies
    .filter(matchesFilters)
    .sort((a, b) => (GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade]) || (a.id - b.id));
  for (const t of shown) list.appendChild(trophyRow(t));
  els.empty.hidden = shown.length !== 0;
  els.count.textContent = shown.length === state.trophies.length
    ? `${state.trophies.length} trophies — ${state.earned.size} earned`
    : `Showing ${shown.length} of ${state.trophies.length} trophies — ${state.earned.size} earned`;
}

function renderProgress() {
  const n = state.trophies.length || 55;
  const pct = Math.round((state.earned.size / n) * 100);
  els.fill.style.width = `${pct}%`;
  els.progressText.textContent = `${state.earned.size} / ${n} earned`;
  els.progressPct.textContent = `${pct}%`;
}

function renderRoadmap() {
  const box = els.roadmap;
  box.innerHTML = '';
  for (const stage of STAGES) {
    const div = document.createElement('div');
    div.className = 'stage-block';
    const h = document.createElement('h3');
    h.textContent = stage.title;
    div.appendChild(h);
    const p = document.createElement('p');
    p.textContent = stage.text;
    div.appendChild(p);
    const ol = document.createElement('ol');
    for (const t of state.trophies.filter((x) => x.stage === stage.n)) {
      const li = document.createElement('li');
      const earned = state.earned.has(t.id);
      li.textContent = `${earned ? '✓ ' : ''}${t.name} (${gradeLabel(t.grade)})`;
      if (t.missable) {
        const span = document.createElement('span');
        span.className = 'miss-note';
        span.textContent = ' — MISSABLE';
        li.appendChild(span);
      }
      ol.appendChild(li);
    }
    div.appendChild(ol);
    box.appendChild(div);
  }
}

function setView(view) {
  state.view = view;
  for (const v of ['checklist', 'roadmap', 'settings']) {
    $(`view-${v}`).hidden = v !== view;
  }
  for (const tab of document.querySelectorAll('.tab')) {
    const active = tab.dataset.view === view;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
  }
  if (view === 'roadmap') renderRoadmap();
}

function render() {
  renderProgress();
  renderList();
  if (state.view === 'roadmap') renderRoadmap();
}

function syncControls() {
  els.search.value = state.query;
  els.hideEarned.checked = state.hideEarned;
  els.spoiler.checked = state.spoiler;
  els.spoiler2.checked = state.spoiler;
  for (const chip of document.querySelectorAll('#kindChips .chip')) {
    chip.classList.toggle('active', chip.dataset.kind === state.kind);
  }
  for (const chip of document.querySelectorAll('#gradeChips .chip')) {
    chip.classList.toggle('active', chip.dataset.grade === state.grade);
  }
}

function exportProgress() {
  const payload = {
    app: 'gta6-trophy-guide',
    version: 1,
    exportedAt: new Date().toISOString(),
    earned: [...state.earned].sort((a, b) => a - b),
    settings: { spoiler: state.spoiler, hideEarned: state.hideEarned },
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  els.ioStatus.textContent = `Exported ${payload.earned.length} earned trophies.`;
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      const ids = Array.isArray(data.earned) ? data.earned : (Array.isArray(data) ? data : null);
      if (!ids) throw new Error('no earned list');
      const valid = new Set(state.trophies.map((t) => t.id));
      const kept = ids.filter((n) => Number.isInteger(n) && valid.has(n));
      state.earned = new Set(kept);
      if (data.settings) {
        state.spoiler = !!data.settings.spoiler;
        state.hideEarned = !!data.settings.hideEarned;
      }
      saveStored();
      syncControls();
      render();
      els.ioStatus.textContent = `Imported ${kept.length} earned trophies${kept.length !== ids.length ? ` (${ids.length - kept.length} entries ignored)` : ''}.`;
    } catch {
      els.ioStatus.textContent = 'Import failed: that file is not a progress export from this guide.';
    }
  };
  reader.readAsText(file);
}

function applyHash() {
  const hash = location.hash;
  if (hash === '#/roadmap') { setView('roadmap'); return; }
  if (hash === '#/settings') { setView('settings'); return; }
  const m = /^#\/trophy-(\d+)$/.exec(hash);
  if (m) {
    setView('checklist');
    state.openId = Number(m[1]);
    state.kind = 'all';
    state.grade = 'all';
    state.query = '';
    syncControls();
    render();
    const row = document.querySelector(`.item[data-id="${m[1]}"]`);
    if (row) {
      // Only scroll when the trophy starts below the fold; a trophy already
      // near the top stays put so the header stays in the shot.
      const top = row.getBoundingClientRect().top;
      if (top > window.innerHeight || top < 0) row.scrollIntoView({ block: 'nearest' });
    }
  }
}

async function init() {
  els.list = $('trophyList');
  els.empty = $('emptyMsg');
  els.count = $('resultCount');
  els.fill = $('progressFill');
  els.progressText = $('progressText');
  els.progressPct = $('progressPct');
  els.search = $('search');
  els.hideEarned = $('hideEarned');
  els.spoiler = $('spoilerToggle');
  els.spoiler2 = $('spoilerToggle2');
  els.roadmap = $('roadmapStages');
  els.ioStatus = $('ioStatus');

  loadStored();

  // Screenshot helper: ?demo marks a few trophies earned in memory only,
  // so the cover shot shows progress. It never writes to localStorage.
  if (new URLSearchParams(location.search).has('demo')) {
    for (const id of [2, 3, 4, 8, 44, 45]) state.earned.add(id);
  }

  const res = await fetch(DATA_URL);
  const data = await res.json();
  state.trophies = Array.isArray(data) ? data : data.trophies;

  for (const tab of document.querySelectorAll('.tab')) {
    tab.addEventListener('click', () => setView(tab.dataset.view));
  }
  els.search.addEventListener('input', () => { state.query = els.search.value.trim(); renderList(); });
  els.hideEarned.addEventListener('change', () => { state.hideEarned = els.hideEarned.checked; saveStored(); renderList(); });
  const spoilerChange = (on) => { state.spoiler = on; saveStored(); syncControls(); render(); };
  els.spoiler.addEventListener('change', () => spoilerChange(els.spoiler.checked));
  els.spoiler2.addEventListener('change', () => spoilerChange(els.spoiler2.checked));
  for (const chip of document.querySelectorAll('#kindChips .chip')) {
    chip.addEventListener('click', () => { state.kind = chip.dataset.kind; syncControls(); renderList(); });
  }
  for (const chip of document.querySelectorAll('#gradeChips .chip')) {
    chip.addEventListener('click', () => { state.grade = chip.dataset.grade; syncControls(); renderList(); });
  }
  $('exportBtn').addEventListener('click', exportProgress);
  $('importFile').addEventListener('change', (ev) => {
    const file = ev.target.files && ev.target.files[0];
    if (file) importProgress(file);
    ev.target.value = '';
  });
  $('resetBtn').addEventListener('click', () => {
    if (window.confirm('Reset all earned trophies? This cannot be undone.')) {
      state.earned.clear();
      saveStored();
      render();
      els.ioStatus.textContent = 'Progress reset.';
    }
  });
  window.addEventListener('hashchange', applyHash);

  syncControls();
  render();
  applyHash();
}

init();
