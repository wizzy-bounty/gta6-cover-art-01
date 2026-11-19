// samples.js — procedural sample photos for Vice Coast Studio.
// Each painter draws an original flat-illustration scene onto a canvas:
// a sunset boulevard, a neon night street, and a dawn fishing pier.
// Nothing here is a photograph of a real person or borrowed artwork.
// Re-witnessed in the round-2 recording (2026-11-19): this file's final content was produced here.

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function skyGradient(ctx, w, h, stops) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  for (const [at, color] of stops) g.addColorStop(at, color);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function sunDisc(ctx, x, y, r, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function palmTree(ctx, x, y, s, color) {
  // s = overall height in px. Trunk curves, fronds fan out from the crown.
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s / 100, s / 100);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(6, -45, -4, -88);
  ctx.stroke();
  ctx.lineWidth = 5;
  const crownX = -4;
  const crownY = -88;
  for (let i = 0; i < 7; i++) {
    const a = (-0.15 - i * 0.42) * Math.PI;
    const len = 42 - Math.abs(i - 3) * 4;
    const ex = crownX + Math.cos(a) * len;
    const ey = crownY + Math.sin(a) * len * 0.55 - 6;
    ctx.beginPath();
    ctx.moveTo(crownX, crownY);
    ctx.quadraticCurveTo(crownX + Math.cos(a) * len * 0.5, crownY - 14, ex, ey);
    ctx.stroke();
  }
  ctx.restore();
}

function skyline(ctx, w, horizon, color, lit) {
  // Dark building silhouettes with a few lit windows.
  let x = -w * 0.02;
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  while (x < w * 1.02) {
    const bw = w * (0.05 + rnd() * 0.07);
    const bh = horizon * (0.25 + rnd() * 0.55);
    ctx.fillStyle = color;
    ctx.fillRect(x, horizon - bh, bw, bh);
    if (lit) {
      ctx.fillStyle = 'rgba(255,214,120,0.85)';
      for (let wy = horizon - bh + 8; wy < horizon - 10; wy += 16) {
        for (let wx = x + 6; wx < x + bw - 6; wx += 14) {
          if (rnd() > 0.72) ctx.fillRect(wx, wy, 5, 7);
        }
      }
    }
    x += bw + w * 0.008;
  }
}

function convertible(ctx, x, y, s, body, glass) {
  // Low classic convertible silhouette, side view, facing right.
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s / 200, s / 200);
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(-95, 0);
  ctx.lineTo(-92, -26);
  ctx.quadraticCurveTo(-70, -34, -40, -32);
  ctx.lineTo(-18, -52);
  ctx.quadraticCurveTo(-8, -58, 6, -56);
  ctx.lineTo(52, -50);
  ctx.quadraticCurveTo(78, -44, 92, -22);
  ctx.lineTo(96, -4);
  ctx.quadraticCurveTo(96, 0, 90, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = glass;
  ctx.beginPath();
  ctx.moveTo(-14, -50);
  ctx.lineTo(48, -46);
  ctx.lineTo(66, -26);
  ctx.lineTo(-30, -30);
  ctx.closePath();
  ctx.fill();
  // Wheels.
  ctx.fillStyle = '#140b1e';
  for (const wx of [-58, 58]) {
    ctx.beginPath();
    ctx.arc(wx, -2, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e8e8e8';
    ctx.beginPath();
    ctx.arc(wx, -2, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#140b1e';
  }
  ctx.restore();
}

function personOnBoardwalk(ctx, x, y, s, color) {
  // Simple strolling figure silhouette (no identifiable person).
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s / 100, s / 100);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(0, -78, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0, -68);
  ctx.lineTo(2, -34);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -60);
  ctx.lineTo(-14, -44);
  ctx.moveTo(0, -60);
  ctx.lineTo(14, -48);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(2, -34);
  ctx.lineTo(-8, 0);
  ctx.moveTo(2, -34);
  ctx.lineTo(12, -2);
  ctx.stroke();
  ctx.restore();
}

export function paintBoulevard(ctx, w, h) {
  skyGradient(ctx, w, h, [[0, '#ff9a3d'], [0.45, '#ff5e62'], [0.75, '#c94b7c'], [1, '#3b1d5e']]);
  sunDisc(ctx, w * 0.68, h * 0.42, Math.min(w, h) * 0.11, '#ffe9a8');
  const horizon = h * 0.62;
  skyline(ctx, w, horizon, '#2a1145', true);
  // Road with perspective.
  ctx.fillStyle = '#1c0b2e';
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.lineTo(w * 0.30, horizon);
  ctx.lineTo(w * 0.72, horizon);
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#ffd166';
  ctx.lineWidth = Math.max(2, h * 0.008);
  ctx.setLineDash([h * 0.05, h * 0.04]);
  ctx.beginPath();
  ctx.moveTo(w * 0.51, h);
  ctx.lineTo(w * 0.51, horizon);
  ctx.stroke();
  ctx.setLineDash([]);
  // Palms along both sides.
  palmTree(ctx, w * 0.08, h * 0.98, h * 0.42, '#160a24');
  palmTree(ctx, w * 0.24, horizon + h * 0.10, h * 0.24, '#1d0d33');
  palmTree(ctx, w * 0.86, h * 0.96, h * 0.38, '#160a24');
  palmTree(ctx, w * 0.97, horizon + h * 0.08, h * 0.22, '#1d0d33');
  // Convertible hero.
  convertible(ctx, w * 0.52, h * 0.88, Math.min(w, h) * 0.62, '#ff2d55', '#9be7ff');
  personOnBoardwalk(ctx, w * 0.16, h * 0.86, h * 0.16, '#160a24');
  personOnBoardwalk(ctx, w * 0.80, h * 0.90, h * 0.14, '#160a24');
}

function neonSign(ctx, x, y, w, h, color, text) {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 22;
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.strokeRect(x, y, w, h);
  ctx.shadowBlur = 14;
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 ${Math.round(h * 0.52)}px "Archivo Black", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + w / 2, y + h / 2 + 1);
  ctx.restore();
}

export function paintNeonStreet(ctx, w, h) {
  skyGradient(ctx, w, h, [[0, '#050914'], [0.6, '#0d1233'], [1, '#1b1445']]);
  // Distant glow.
  const glow = ctx.createRadialGradient(w * 0.5, h * 0.42, 10, w * 0.5, h * 0.42, w * 0.55);
  glow.addColorStop(0, 'rgba(255,92,225,0.35)');
  glow.addColorStop(1, 'rgba(255,92,225,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  const horizon = h * 0.58;
  // Buildings left and right.
  ctx.fillStyle = '#0a0d24';
  ctx.fillRect(0, h * 0.10, w * 0.30, horizon - h * 0.10);
  ctx.fillRect(w * 0.70, h * 0.06, w * 0.30, horizon - h * 0.06);
  ctx.fillStyle = '#101736';
  ctx.fillRect(w * 0.30, h * 0.22, w * 0.16, horizon - h * 0.22);
  ctx.fillRect(w * 0.54, h * 0.18, w * 0.16, horizon - h * 0.18);
  // Lit windows.
  let seed = 11;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  ctx.fillStyle = 'rgba(255,220,130,0.9)';
  for (let i = 0; i < 90; i++) {
    const bx = rnd() < 0.5 ? rnd() * w * 0.28 : w * 0.72 + rnd() * w * 0.26;
    const by = h * 0.08 + rnd() * (horizon - h * 0.12);
    if (rnd() > 0.55) ctx.fillRect(bx, by, 6, 8);
  }
  // Neon signs, kept near the centre so square and portrait crops keep them.
  neonSign(ctx, w * 0.315, h * 0.16, w * 0.17, h * 0.10, '#ff5ce1', 'VICE');
  neonSign(ctx, w * 0.515, h * 0.12, w * 0.17, h * 0.10, '#00e5ff', 'NEON');
  neonSign(ctx, w * 0.345, h * 0.34, w * 0.13, h * 0.08, '#ffe14d', 'BAR');
  // Wet street with reflections.
  const street = ctx.createLinearGradient(0, horizon, 0, h);
  street.addColorStop(0, '#232a55');
  street.addColorStop(1, '#0a0d20');
  ctx.fillStyle = street;
  ctx.fillRect(0, horizon, w, h - horizon);
  // Ambient glow where the street meets the buildings.
  const streetGlow = ctx.createRadialGradient(w * 0.5, horizon, 10, w * 0.5, horizon, w * 0.42);
  streetGlow.addColorStop(0, 'rgba(150,90,255,0.30)');
  streetGlow.addColorStop(1, 'rgba(150,90,255,0)');
  ctx.fillStyle = streetGlow;
  ctx.fillRect(0, horizon, w, h - horizon);
  const streaks = [['#ff5ce1', 0.40], ['#00e5ff', 0.60], ['#ffe14d', 0.41], ['#ff5ce1', 0.56]];
  for (const [color, fx] of streaks) {
    const sg = ctx.createLinearGradient(0, horizon, 0, h);
    sg.addColorStop(0, color);
    sg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = sg;
    const sw = w * 0.028;
    ctx.fillRect(w * fx - sw / 2, horizon, sw, h - horizon);
  }
  ctx.globalAlpha = 1;
  // String lights.
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w * 0.28, h * 0.20);
  ctx.quadraticCurveTo(w * 0.5, h * 0.30, w * 0.72, h * 0.18);
  ctx.stroke();
  const bulbs = ['#ff5ce1', '#00e5ff', '#ffe14d', '#ff7a18'];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    const bx = lerp(w * 0.28, w * 0.72, t);
    const by = (1 - t) * (1 - t) * h * 0.20 + 2 * (1 - t) * t * h * 0.30 + t * t * h * 0.18;
    ctx.save();
    ctx.shadowColor = bulbs[i % 4];
    ctx.shadowBlur = 12;
    ctx.fillStyle = bulbs[i % 4];
    ctx.beginPath();
    ctx.arc(bx, by + 8, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  personOnBoardwalk(ctx, w * 0.46, h * 0.88, h * 0.20, '#02030a');
  personOnBoardwalk(ctx, w * 0.58, h * 0.90, h * 0.17, '#02030a');
}

export function paintPierDawn(ctx, w, h) {
  skyGradient(ctx, w, h, [[0, '#8ec9ee'], [0.4, '#fbc2a8'], [0.62, '#ff9e7d'], [1, '#2e6f8e']]);
  sunDisc(ctx, w * 0.30, h * 0.52, Math.min(w, h) * 0.09, '#fff3c4');
  // Clouds.
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  for (const [cx, cy, cw] of [[0.12, 0.16, 0.22], [0.55, 0.10, 0.28], [0.78, 0.24, 0.18]]) {
    ctx.beginPath();
    ctx.ellipse(w * cx, h * cy, w * cw / 2, h * 0.035, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Sea.
  const horizon = h * 0.58;
  const sea = ctx.createLinearGradient(0, horizon, 0, h);
  sea.addColorStop(0, '#3fa7c4');
  sea.addColorStop(0.5, '#1d7d9c');
  sea.addColorStop(1, '#0d4a63');
  ctx.fillStyle = sea;
  ctx.fillRect(0, horizon, w, h - horizon);
  // Sun glitter on the water.
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = '#ffe9a8';
  for (let i = 0; i < 26; i++) {
    const yy = horizon + 8 + i * ((h - horizon - 16) / 26);
    const ww = w * (0.02 + (i / 26) * 0.10) * (0.6 + ((i * 37) % 10) / 18);
    ctx.fillRect(w * 0.30 - ww / 2, yy, ww, 3);
  }
  ctx.restore();
  // Pier planks in perspective.
  ctx.fillStyle = '#6b4a2f';
  ctx.beginPath();
  ctx.moveTo(w * 0.42, h);
  ctx.lineTo(w * 0.48, horizon);
  ctx.lineTo(w * 0.56, horizon);
  ctx.lineTo(w * 0.68, h);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#4a2f1c';
  ctx.lineWidth = 2;
  for (let i = 0; i < 9; i++) {
    const t = i / 9;
    const y = lerp(h, horizon, t);
    const xl = lerp(w * 0.42, w * 0.48, t);
    const xr = lerp(w * 0.68, w * 0.56, t);
    ctx.beginPath();
    ctx.moveTo(xl, y);
    ctx.lineTo(xr, y);
    ctx.stroke();
  }
  // Fisherman silhouette at the pier end.
  const fx = w * 0.52;
  const fy = horizon + h * 0.02;
  ctx.save();
  ctx.translate(fx, fy);
  ctx.fillStyle = '#10222e';
  ctx.strokeStyle = '#10222e';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(0, -52, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0, -44);
  ctx.lineTo(1, -14);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -38);
  ctx.lineTo(-12, -24);
  ctx.moveTo(0, -38);
  ctx.lineTo(12, -26);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(1, -14);
  ctx.lineTo(-6, 0);
  ctx.moveTo(1, -14);
  ctx.lineTo(9, -1);
  ctx.stroke();
  // Fishing rod.
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(10, -28);
  ctx.lineTo(58, -72);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(58, -72);
  ctx.quadraticCurveTo(64, -40, 56, -6);
  ctx.stroke();
  // Bucket hat.
  ctx.fillStyle = '#10222e';
  ctx.beginPath();
  ctx.ellipse(0, -56, 13, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // Gulls.
  ctx.strokeStyle = '#1c2b33';
  ctx.lineWidth = 2.5;
  for (const [gx, gy, gs] of [[0.68, 0.14, 1], [0.76, 0.20, 0.8], [0.60, 0.08, 0.7]]) {
    const x = w * gx;
    const y = h * gy;
    const s = gs * Math.min(w, h) * 0.03;
    ctx.beginPath();
    ctx.moveTo(x - s, y);
    ctx.quadraticCurveTo(x - s * 0.4, y - s * 0.7, x, y);
    ctx.quadraticCurveTo(x + s * 0.4, y - s * 0.7, x + s, y);
    ctx.stroke();
  }
}

export const SAMPLE_SCENES = [
  { id: 'boulevard', name: 'Sunset Boulevard', paint: paintBoulevard },
  { id: 'neon', name: 'Neon Street', paint: paintNeonStreet },
  { id: 'pier', name: 'Dawn Pier', paint: paintPierDawn },
];

// Paint a sample scene into a fresh canvas and return it (usable as a photo).
export function makeSampleCanvas(sceneId, w = 1200, h = 800) {
  const scene = SAMPLE_SCENES.find((s) => s.id === sceneId) || SAMPLE_SCENES[0];
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  scene.paint(ctx, w, h);
  return canvas;
}
