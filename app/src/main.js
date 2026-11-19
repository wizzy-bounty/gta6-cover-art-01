// main.js — Vice Coast Studio editor.
// Wires the cover renderer to the page: photo uploads, panel crop/pan/zoom,
// layout + grade + size pickers, caption editing, undo/redo, PNG export,
// and ?shot= scenes for screenshots (cover / cover-portrait / cover-square / editor).
// Re-witnessed in the round-2 recording (2026-11-19): this file's final content was produced here.

import {
  LAYOUTS, GRADES, SIZES, layoutById, gradeById, sizeById,
  renderCover, panelAt,
} from './cover.js';
import { SAMPLE_SCENES, makeSampleCanvas } from './samples.js';

const $ = (sel) => document.querySelector(sel);
const preview = $('#preview');
const pctx = preview.getContext('2d');

const DEFAULT_STATE = {
  layout: 'quad',
  grade: 'sunset',
  size: 'wide',
  title: 'VICE COAST',
  subtitle: 'neon nights in leonida bay',
  badge: 'VICE COAST',
  stars: 4,
  effects: { grain: true, halftone: true, vignette: true },
  panelPhoto: [0, 1, 2, 0, 1, 2, 0, 1, 2],
  transforms: Array.from({ length: 9 }, () => ({ scale: 1, dx: 0, dy: 0 })),
};

let state = JSON.parse(JSON.stringify(DEFAULT_STATE));
let photos = []; // { img, name } — img is a canvas (sample) or HTMLImageElement (upload)
let selectedPanel = 0;
let history = [];
let historyIndex = -1;
let shotMode = null;

function snapshot() {
  return JSON.stringify({
    layout: state.layout, grade: state.grade, size: state.size,
    title: state.title, subtitle: state.subtitle, badge: state.badge,
    stars: state.stars, effects: state.effects,
    panelPhoto: state.panelPhoto, transforms: state.transforms,
  });
}

function pushHistory() {
  history = history.slice(0, historyIndex + 1);
  history.push(snapshot());
  historyIndex = history.length - 1;
  updateUndoRedo();
}

function applySnapshot(json) {
  const s = JSON.parse(json);
  state = { ...state, ...s };
  syncControls();
  render();
}

function updateUndoRedo() {
  $('#undoBtn').disabled = historyIndex <= 0;
  $('#redoBtn').disabled = historyIndex >= history.length - 1;
}

function undo() {
  if (historyIndex > 0) {
    historyIndex--;
    applySnapshot(history[historyIndex]);
  }
}

function redo() {
  if (historyIndex < history.length - 1) {
    historyIndex++;
    applySnapshot(history[historyIndex]);
  }
}

function render() {
  // In cover screenshot scenes the preview canvas IS the cover at full
  // viewport size — never resize it back to the editor preview size.
  if (shotMode && shotMode.startsWith('cover')) return;
  const size = sizeById(state.size);
  // Preview backing store: keep the cover aspect, cap the long side at 960 px.
  const scale = Math.min(1, 960 / Math.max(size.w, size.h));
  const pw = Math.round(size.w * scale);
  const ph = Math.round(size.h * scale);
  if (preview.width !== pw || preview.height !== ph) {
    preview.width = pw;
    preview.height = ph;
  }
  renderCover(pctx, pw, ph, { ...state, photos: photos.map((p) => p.img) });
  document.title = `Vice Coast Studio — ${layoutById(state.layout).name} · ${gradeById(state.grade).name}`;
}

function renderFullSize() {
  const size = sizeById(state.size);
  const canvas = document.createElement('canvas');
  canvas.width = size.w;
  canvas.height = size.h;
  renderCover(canvas.getContext('2d'), size.w, size.h, { ...state, photos: photos.map((p) => p.img) });
  return canvas;
}

function exportPNG() {
  const canvas = renderFullSize();
  const size = sizeById(state.size);
  canvas.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-coast-${state.size}-${state.layout}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }, 'image/png');
}

function buildControlButtons(container, items, currentId, onPick) {
  container.innerHTML = '';
  for (const item of items) {
    const b = document.createElement('button');
    b.className = 'chip' + (item.id === currentId ? ' active' : '');
    b.textContent = item.name;
    b.dataset.id = item.id;
    b.addEventListener('click', () => {
      pushHistory();
      onPick(item.id);
      buildControlButtons(container, items, item.id, onPick);
      render();
    });
    container.appendChild(b);
  }
}

function syncControls() {
  buildControlButtons($('#layoutRow'), LAYOUTS, state.layout, (id) => { state.layout = id; selectedPanel = 0; });
  buildControlButtons($('#gradeRow'), GRADES, state.grade, (id) => { state.grade = id; });
  buildControlButtons($('#sizeRow'), SIZES, state.size, (id) => { state.size = id; });
  $('#titleInput').value = state.title;
  $('#subtitleInput').value = state.subtitle;
  $('#badgeInput').value = state.badge;
  $('#starsInput').value = String(state.stars);
  $('#grainToggle').checked = state.effects.grain;
  $('#halftoneToggle').checked = state.effects.halftone;
  $('#vignetteToggle').checked = state.effects.vignette;
  renderPhotoStrip();
}

function renderPhotoStrip() {
  const strip = $('#photoStrip');
  strip.innerHTML = '';
  photos.forEach((p, i) => {
    const thumb = document.createElement('canvas');
    thumb.width = 120;
    thumb.height = 80;
    thumb.className = 'thumb';
    thumb.title = `${p.name} — click to put in the selected panel`;
    const tctx = thumb.getContext('2d');
    const s = Math.max(120 / p.img.width, 80 / p.img.height);
    const dw = p.img.width * s;
    const dh = p.img.height * s;
    tctx.drawImage(p.img, (120 - dw) / 2, (80 - dh) / 2, dw, dh);
    thumb.addEventListener('click', () => {
      pushHistory();
      state.panelPhoto[selectedPanel] = i;
      render();
    });
    strip.appendChild(thumb);
  });
  const hint = document.createElement('div');
  hint.className = 'strip-hint';
  hint.textContent = 'Click a photo to put it in the selected panel.';
  strip.appendChild(hint);
}

function addUpload(file) {
  if (!file || !file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      photos.push({ img, name: file.name.replace(/\.[^.]+$/, '') });
      pushHistory();
      state.panelPhoto[selectedPanel] = photos.length - 1;
      renderPhotoStrip();
      render();
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function setupPointer() {
  let dragging = null;
  const toCanvas = (e) => {
    const r = preview.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * preview.width,
      y: ((e.clientY - r.top) / r.height) * preview.height,
    };
  };
  preview.addEventListener('pointerdown', (e) => {
    const p = toCanvas(e);
    const hit = panelAt(state, preview.width, preview.height, p.x, p.y);
    if (hit >= 0) {
      selectedPanel = hit;
      dragging = { x: p.x, y: p.y, t: { ...state.transforms[hit] } };
      preview.setPointerCapture(e.pointerId);
      render();
    }
  });
  preview.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const p = toCanvas(e);
    const t = state.transforms[selectedPanel];
    t.dx = dragging.t.dx + (p.x - dragging.x);
    t.dy = dragging.t.dy + (p.y - dragging.y);
    render();
  });
  preview.addEventListener('pointerup', () => {
    if (dragging) {
      pushHistory();
      dragging = null;
    }
  });
  preview.addEventListener('wheel', (e) => {
    e.preventDefault();
    const p = toCanvas(e);
    const hit = panelAt(state, preview.width, preview.height, p.x, p.y);
    const idx = hit >= 0 ? hit : selectedPanel;
    const t = state.transforms[idx];
    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    t.scale = Math.min(4, Math.max(1, t.scale * factor));
    pushHistory();
    render();
  }, { passive: false });
}

function setupInputs() {
  $('#titleInput').addEventListener('input', (e) => { state.title = e.target.value; render(); });
  $('#titleInput').addEventListener('change', pushHistory);
  $('#subtitleInput').addEventListener('input', (e) => { state.subtitle = e.target.value; render(); });
  $('#subtitleInput').addEventListener('change', pushHistory);
  $('#badgeInput').addEventListener('input', (e) => { state.badge = e.target.value; render(); });
  $('#badgeInput').addEventListener('change', pushHistory);
  $('#starsInput').addEventListener('change', (e) => {
    pushHistory();
    state.stars = Math.min(5, Math.max(0, parseInt(e.target.value, 10) || 0));
    render();
  });
  for (const [key, id] of [['grain', 'grainToggle'], ['halftone', 'halftoneToggle'], ['vignette', 'vignetteToggle']]) {
    $(`#${id}`).addEventListener('change', (e) => {
      pushHistory();
      state.effects[key] = e.target.checked;
      render();
    });
  }
  $('#undoBtn').addEventListener('click', undo);
  $('#redoBtn').addEventListener('click', redo);
  $('#exportBtn').addEventListener('click', exportPNG);
  $('#resetBtn').addEventListener('click', () => {
    pushHistory();
    state.transforms = Array.from({ length: 9 }, () => ({ scale: 1, dx: 0, dy: 0 }));
    render();
  });
  $('#uploadInput').addEventListener('change', (e) => {
    for (const f of e.target.files) addUpload(f);
    e.target.value = '';
  });
  $('#uploadBtn').addEventListener('click', () => $('#uploadInput').click());
  const stage = $('#stage');
  stage.addEventListener('dragover', (e) => { e.preventDefault(); stage.classList.add('dragging'); });
  stage.addEventListener('dragleave', () => stage.classList.remove('dragging'));
  stage.addEventListener('drop', (e) => {
    e.preventDefault();
    stage.classList.remove('dragging');
    for (const f of e.dataTransfer.files) addUpload(f);
  });
}

function loadDefaultPhotos() {
  photos = SAMPLE_SCENES.map((s) => ({
    img: makeSampleCanvas(s.id, 1200, 800),
    name: s.name,
  }));
}

async function waitFonts() {
  try {
    await Promise.all([
      document.fonts.load('40px "Archivo Black"'),
      document.fonts.load('700 40px "Caveat"'),
    ]);
    await document.fonts.ready;
  } catch (e) { /* fall back to system fonts */ }
}

function applyShotPreset() {
  const params = new URLSearchParams(location.search);
  shotMode = params.get('shot');
  if (!shotMode) return;
  if (shotMode === 'cover') {
    state.layout = 'hero3'; state.grade = 'sunset'; state.size = 'wide';
  } else if (shotMode === 'cover-portrait') {
    state.layout = 'quad'; state.grade = 'neon'; state.size = 'portrait';
  } else if (shotMode === 'cover-square') {
    state.layout = 'nine'; state.grade = 'golden'; state.size = 'square';
  } else if (shotMode === 'editor') {
    state.layout = 'quad'; state.grade = 'sunset'; state.size = 'wide';
  }
  if (shotMode.startsWith('cover')) {
    // Full-viewport cover: the preview canvas IS the cover. The editor chrome
    // stays hidden only in cover scenes — never in the editor scene.
    document.body.classList.add('shot');
    const size = sizeById(state.size);
    const scale = Math.min(innerWidth / size.w, innerHeight / size.h);
    preview.width = Math.round(size.w * scale);
    preview.height = Math.round(size.h * scale);
    preview.style.width = `${preview.width}px`;
    preview.style.height = `${preview.height}px`;
    renderCover(pctx, preview.width, preview.height, { ...state, photos: photos.map((p) => p.img) });
    document.documentElement.dataset.ready = '1';
  }
}

async function init() {
  loadDefaultPhotos();
  setupInputs();
  setupPointer();
  applyShotPreset();
  syncControls();
  await waitFonts();
  if (shotMode && shotMode.startsWith('cover')) {
    renderCover(pctx, preview.width, preview.height, { ...state, photos: photos.map((p) => p.img) });
  } else {
    render();
  }
  pushHistory();
  document.documentElement.dataset.ready = '1';
}

init();
