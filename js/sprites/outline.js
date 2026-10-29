"use strict";
// ===== Shared helpers: shade, outline pass =====
const OUTL = '#1d1a24';
function shade(hex, k) {
  if (!hex || hex[0] !== '#') return hex; let h = hex.slice(1); if (h.length === 3) h = h.split('').map(x => x + x).join('');
  const n = parseInt(h, 16), f = v => Math.max(0, Math.min(255, Math.round(v * k)));
  return '#' + [f(n >> 16 & 255), f(n >> 8 & 255), f(n & 255)].map(v => v.toString(16).padStart(2, '0')).join('');
}
function outlinePass(cv, col) {
  const g = cv.getContext('2d'), w = cv.width, h = cv.height, im = g.getImageData(0, 0, w, h), d = im.data;
  const a = (x, y) => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 40;
  const n = parseInt(col.slice(1), 16), list = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (!a(x, y) && (a(x - 1, y) || a(x + 1, y) || a(x, y - 1) || a(x, y + 1))) list.push((y * w + x) * 4);
  for (const i of list) { d[i] = n >> 16 & 255; d[i + 1] = n >> 8 & 255; d[i + 2] = n & 255; d[i + 3] = 255; }
  g.putImageData(im, 0, 0);
}
