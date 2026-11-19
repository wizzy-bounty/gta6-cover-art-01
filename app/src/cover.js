// cover.js — Vice Coast Studio cover renderer.
// Draws GTA-style multi-panel poster covers from photos, a caption and a grade.
// All original code: layouts, grades, lettering and effects are written here.
// Re-witnessed in the round-2 recording (2026-11-19): this file's final content was produced here.

export const LAYOUTS = [
  { id: 'quad', name: 'Quad Grid', panels: 4 },
  { id: 'hero3', name: 'Hero + Three', panels: 4 },
  { id: 'fullbleed', name: 'Full Bleed', panels: 1 },
  { id: 'tilted', name: 'Tilted Snaps', panels: 3 },
  { id: 'nine', name: 'Nine Panel', panels: 9 },
  { id: 'story', name: 'Story Strip', panels: 3 },
];

export const GRADES = [
  { id: 'sunset', name: 'Vice Sunset', top: '#ffb347', bottom: '#ff2d78', wash: '#ff7a18', washAlpha: 0.16, ink: '#1c0b2e' },
  { id: 'neon', name: 'Neon Nights', top: '#ff5ce1', bottom: '#00e5ff', wash: '#7b2fff', washAlpha: 0.20, ink: '#060b26' },
  { id: 'golden', name: 'Golden Hour', top: '#ffe29a', bottom: '#ff8c42', wash: '#ffc53d', washAlpha: 0.14, ink: '#2a1608' },
  { id: 'noir', name: 'Palm Noir', top: '#e8e8e8', bottom: '#3a3a3a', wash: '#ff2d78', washAlpha: 0.10, ink: '#000000' },
  { id: 'dusk', name: 'Pastel Dusk', top: '#fbc2eb', bottom: '#a6c1ee', wash: '#c084fc', washAlpha: 0.14, ink: '#241b3a' },
];

export const SIZES = [
  { id: 'square', name: 'Square 1080 × 1080', w: 1080, h: 1080 },
  { id: 'portrait', name: 'Portrait 1080 × 1350', w: 1080, h: 1350 },
  { id: 'wide', name: 'Wide 1920 × 1080', w: 1920, h: 1080 },
  { id: 'story', name: 'Story 1080 × 1920', w: 1080, h: 1920 },
];

export function layoutById(id) {
  return LAYOUTS.find((l) => l.id === id) || LAYOUTS[0];
}

export function gradeById(id) {
  return GRADES.find((g) => g.id === id) || GRADES[0];
}

export function sizeById(id) {
  return SIZES.find((s) => s.id === id) || SIZES[2];
}

// Deterministic pseudo-random generator so preview and export match exactly.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function roundRectPath(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function starPath(ctx, cx, cy, rOuter, rInner, points) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const a = (Math.PI * i) / points - Math.PI / 2;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

// Panel rectangles for a layout, as fractions of the cover, plus the title band.
export function layoutGeometry(layoutId, W, H) {
  const gap = Math.round(Math.min(W, H) * 0.012);
  const frame = Math.round(Math.min(W, H) * 0.018);
  const bandH = Math.round(H * 0.20);
  const inner = { x: frame, y: frame, w: W - frame * 2, h: H - frame * 2 - bandH };
  const panels = [];
  if (layoutId === 'quad') {
    const cw = (inner.w - gap) / 2;
    const ch = (inner.h - gap) / 2;
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 2; c++) {
        panels.push({ x: inner.x + c * (cw + gap), y: inner.y + r * (ch + gap), w: cw, h: ch, rot: 0 });
      }
    }
  } else if (layoutId === 'hero3') {
    const heroW = inner.w * 0.62;
    const sideW = inner.w - heroW - gap;
    const sideH = (inner.h - gap * 2) / 3;
    panels.push({ x: inner.x, y: inner.y, w: heroW, h: inner.h, rot: 0 });
    for (let i = 0; i < 3; i++) {
      panels.push({ x: inner.x + heroW + gap, y: inner.y + i * (sideH + gap), w: sideW, h: sideH, rot: 0 });
    }
  } else if (layoutId === 'fullbleed') {
    panels.push({ x: 0, y: 0, w: W, h: H, rot: 0 });
  } else if (layoutId === 'tilted') {
    const pw = inner.w * 0.46;
    const ph = inner.h * 0.62;
    panels.push({ x: inner.x + inner.w * 0.04, y: inner.y + inner.h * 0.06, w: pw, h: ph, rot: -0.055 });
    panels.push({ x: inner.x + inner.w * 0.50, y: inner.y + inner.h * 0.02, w: pw, h: ph, rot: 0.045 });
    panels.push({ x: inner.x + inner.w * 0.27, y: inner.y + inner.h * 0.34, w: pw, h: ph, rot: -0.015 });
  } else if (layoutId === 'nine') {
    const cw = (inner.w - gap * 2) / 3;
    const ch = (inner.h - gap * 2) / 3;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        panels.push({ x: inner.x + c * (cw + gap), y: inner.y + r * (ch + gap), w: cw, h: ch, rot: 0 });
      }
    }
  } else if (layoutId === 'story') {
    const heroH = inner.h * 0.56;
    const lowH = inner.h - heroH - gap;
    const lowW = (inner.w - gap) / 2;
    panels.push({ x: inner.x, y: inner.y, w: inner.w, h: heroH, rot: 0 });
    panels.push({ x: inner.x, y: inner.y + heroH + gap, w: lowW, h: lowH, rot: 0 });
    panels.push({ x: inner.x + lowW + gap, y: inner.y + heroH + gap, w: lowW, h: lowH, rot: 0 });
  }
  const band = { x: 0, y: H - bandH, w: W, h: bandH };
  return { panels, band, gap, frame, inner, bandH };
}

function drawPhotoCover(ctx, img, rect, t) {
  if (!img || !img.width) return;
  const base = Math.max(rect.w / img.width, rect.h / img.height);
  const s = base * (t && t.scale ? t.scale : 1);
  const dw = img.width * s;
  const dh = img.height * s;
  const dx = rect.x + (rect.w - dw) / 2 + (t && t.dx ? t.dx : 0);
  const dy = rect.y + (rect.h - dh) / 2 + (t && t.dy ? t.dy : 0);
  ctx.drawImage(img, dx, dy, dw, dh);
}

function applyGrade(ctx, rect, grade) {
  const g = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
  g.addColorStop(0, grade.top);
  g.addColorStop(1, grade.bottom);
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = g;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.globalCompositeOperation = 'soft-light';
  ctx.globalAlpha = grade.washAlpha * 2.4;
  ctx.fillStyle = grade.wash;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.restore();
}

function drawPanelFrame(ctx, rect, W, grade) {
  const bw = Math.max(2, Math.round(Math.min(W, rect.w) * 0.008));
  ctx.save();
  ctx.lineWidth = bw;
  ctx.strokeStyle = '#ffffff';
  ctx.strokeRect(rect.x + bw / 2, rect.y + bw / 2, rect.w - bw, rect.h - bw);
  ctx.lineWidth = Math.max(1, bw / 2);
  ctx.strokeStyle = grade.ink;
  ctx.strokeRect(rect.x + bw * 1.5, rect.y + bw * 1.5, rect.w - bw * 3, rect.h - bw * 3);
  ctx.restore();
}

function drawPolaroid(ctx, img, rect, rot, grade, t) {
  ctx.save();
  ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
  ctx.rotate(rot);
  ctx.translate(-rect.w / 2, -rect.h / 2);
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = Math.round(rect.w * 0.06);
  ctx.shadowOffsetY = Math.round(rect.h * 0.02);
  ctx.fillStyle = '#fdf6ec';
  ctx.fillRect(0, 0, rect.w, rect.h);
  ctx.shadowColor = 'transparent';
  const m = Math.round(rect.w * 0.045);
  const photoRect = { x: m, y: m, w: rect.w - m * 2, h: rect.h - m * 2 - Math.round(rect.h * 0.10) };
  ctx.save();
  ctx.beginPath();
  ctx.rect(photoRect.x, photoRect.y, photoRect.w, photoRect.h);
  ctx.clip();
  drawPhotoCover(ctx, img, photoRect, t);
  applyGrade(ctx, photoRect, grade);
  ctx.restore();
  drawPanelFrame(ctx, photoRect, rect.w, grade);
  ctx.restore();
}

function drawTitleBand(ctx, W, H, band, state, grade) {
  const { title, subtitle, badge, stars } = state;
  const g = ctx.createLinearGradient(0, band.y, 0, band.y + band.h);
  g.addColorStop(0, grade.ink);
  g.addColorStop(1, '#000000');
  ctx.fillStyle = g;
  ctx.fillRect(band.x, band.y, band.w, band.h);
  // Neon top edge.
  const edge = ctx.createLinearGradient(band.x, 0, band.x + band.w, 0);
  edge.addColorStop(0, grade.top);
  edge.addColorStop(0.5, grade.bottom);
  edge.addColorStop(1, grade.top);
  ctx.fillStyle = edge;
  ctx.fillRect(band.x, band.y, band.w, Math.max(3, H * 0.006));
  // Halftone dots across the band.
  if (state.effects.halftone) {
    const step = Math.max(9, Math.round(W / 160));
    ctx.save();
    for (let x = step / 2; x < W; x += step) {
      for (let y = band.y + step / 2; y < band.y + band.h; y += step) {
        const a = 0.05 + 0.10 * (1 - (y - band.y) / band.h);
        ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(1, step * 0.16), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }
  const pad = Math.round(W * 0.03);
  // Measure the badge first, then shrink the title until title + badge fit
  // side by side without overlapping (narrow covers: portrait, square).
  const badgeSize = Math.round(band.h * 0.17);
  const label = badge.toUpperCase();
  const badgeFont = `${badgeSize}px "Archivo Black", sans-serif`;
  const measureCtx = ctx;
  measureCtx.save();
  measureCtx.font = badgeFont;
  const bw = measureCtx.measureText(label).width + badgeSize * 2.2;
  measureCtx.restore();
  const gapTitleBadge = Math.round(W * 0.03);
  const titleAvail = W - pad * 2 - bw - gapTitleBadge;
  // Shrink the title until it truly fits: re-measure at each size (a single
  // ratio step can under-shoot when the canvas measures narrower than it
  // draws), then keep a margin for the draw-time letter-spacing and the
  // heavy outline stroke, which measureText does not count.
  const titleFloor = Math.round(band.h * 0.30);
  let titleSize = Math.round(band.h * 0.52);
  const measureTitle = (size) => {
    ctx.save();
    try { ctx.letterSpacing = `${Math.round(size * 0.02)}px`; } catch (e) { /* older canvas */ }
    ctx.font = `${size}px "Archivo Black", sans-serif`;
    const w = ctx.measureText(title.toUpperCase()).width;
    ctx.restore();
    return w;
  };
  let titleW = measureTitle(titleSize);
  while (titleW > titleAvail * 0.90 && titleSize > titleFloor) {
    titleSize = Math.max(titleFloor, titleSize - 2);
    titleW = measureTitle(titleSize);
  }
  ctx.save();
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  try { ctx.letterSpacing = `${Math.round(titleSize * 0.02)}px`; } catch (e) { /* older canvas */ }
  ctx.font = `${titleSize}px "Archivo Black", sans-serif`;
  const ty = band.y + band.h * 0.42;
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(3, titleSize * 0.14);
  ctx.strokeStyle = grade.ink;
  ctx.strokeText(title.toUpperCase(), pad, ty);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(title.toUpperCase(), pad, ty);
  ctx.restore();
  // Subtitle ribbon, tilted, in the script font.
  const subSize = Math.round(band.h * 0.26);
  ctx.save();
  ctx.translate(pad + Math.round(W * 0.02), band.y + band.h * 0.80);
  ctx.rotate(-0.02);
  ctx.font = `700 ${subSize}px "Caveat", cursive`;
  const ribbonW = Math.min(W * 0.62, ctx.measureText(subtitle).width + subSize * 2.4);
  const rg = ctx.createLinearGradient(0, 0, ribbonW, 0);
  rg.addColorStop(0, grade.bottom);
  rg.addColorStop(1, grade.top);
  ctx.fillStyle = rg;
  roundRectPath(ctx, 0, -subSize * 0.62, ribbonW, subSize * 1.24, subSize * 0.62);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText(subtitle, subSize * 0.9, subSize * 0.06);
  ctx.restore();
  // Badge pill + heat-meter stars, top-right of the band.
  ctx.save();
  ctx.font = badgeFont;
  const bx = W - pad - bw;
  const by = band.y + band.h * 0.16;
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  roundRectPath(ctx, bx, by, bw, badgeSize * 1.5, badgeSize * 0.75);
  ctx.fill();
  ctx.strokeStyle = grade.top;
  ctx.lineWidth = Math.max(2, badgeSize * 0.08);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText(label, bx + badgeSize * 1.1, by + badgeSize * 0.78);
  // Stars under the badge.
  const sr = badgeSize * 0.42;
  const gapStars = sr * 2.4;
  const totalW = gapStars * 5;
  const sx = W - pad - totalW;
  const sy = by + badgeSize * 1.5 + sr * 1.6;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    starPath(ctx, sx + i * gapStars + sr, sy, sr, sr * 0.45, 5);
    ctx.fillStyle = i < stars ? grade.top : 'rgba(255,255,255,0.25)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  ctx.restore();
}

// Main entry: render a cover into ctx at W x H from state.
// state: { layout, grade, photos, panelPhoto, transforms, title, subtitle,
//          badge, stars, effects: { grain, halftone, vignette } }
export function renderCover(ctx, W, H, state) {
  const grade = gradeById(state.grade);
  const geo = layoutGeometry(state.layout, W, H);
  // Backdrop.
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, grade.ink);
  bg.addColorStop(1, '#000000');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  const photos = state.photos || [];
  const pick = (i) => photos[(state.panelPhoto && state.panelPhoto[i] !== undefined ? state.panelPhoto[i] : i % Math.max(1, photos.length)) % Math.max(1, photos.length)];
  if (state.layout === 'tilted') {
    geo.panels.forEach((p, i) => {
      drawPolaroid(ctx, pick(i), p, p.rot, grade, state.transforms ? state.transforms[i] : null);
    });
  } else {
    geo.panels.forEach((p, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.rect(p.x, p.y, p.w, p.h);
      ctx.clip();
      drawPhotoCover(ctx, pick(i), p, state.transforms ? state.transforms[i] : null);
      applyGrade(ctx, p, grade);
      ctx.restore();
      drawPanelFrame(ctx, p, W, grade);
    });
  }
  if (state.layout === 'fullbleed') {
    // Scrim so the title stays readable over the photo.
    const scrim = ctx.createLinearGradient(0, geo.band.y - H * 0.12, 0, H);
    scrim.addColorStop(0, 'rgba(0,0,0,0)');
    scrim.addColorStop(1, 'rgba(0,0,0,0.72)');
    ctx.fillStyle = scrim;
    ctx.fillRect(0, geo.band.y - H * 0.12, W, H - (geo.band.y - H * 0.12));
  }
  drawTitleBand(ctx, W, H, geo.band, state, grade);
  if (state.effects.vignette) {
    const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.42, W / 2, H / 2, Math.max(W, H) * 0.75);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(0,0,0,0.38)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, W, H);
  }
  if (state.effects.grain) {
    const rnd = mulberry32(20261119);
    const n = Math.round((W * H) / 260);
    ctx.save();
    for (let i = 0; i < n; i++) {
      const x = rnd() * W;
      const y = rnd() * H;
      const light = rnd() > 0.5;
      ctx.fillStyle = light ? `rgba(255,255,255,${(rnd() * 0.07).toFixed(3)})` : `rgba(0,0,0,${(rnd() * 0.09).toFixed(3)})`;
      ctx.fillRect(x, y, 1.4, 1.4);
    }
    ctx.restore();
  }
  // Outer ink frame.
  ctx.save();
  ctx.lineWidth = Math.max(3, Math.round(Math.min(W, H) * 0.008));
  ctx.strokeStyle = grade.ink;
  ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, W - ctx.lineWidth, H - ctx.lineWidth);
  ctx.restore();
  return geo;
}

// Hit-test a point (canvas pixels) against the layout panels.
export function panelAt(state, W, H, x, y) {
  const geo = layoutGeometry(state.layout, W, H);
  for (let i = geo.panels.length - 1; i >= 0; i--) {
    const p = geo.panels[i];
    if (x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h) return i;
  }
  return -1;
}
