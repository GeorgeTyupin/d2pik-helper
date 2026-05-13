// Hero data is loaded at startup from the Go backend via Wails.
// window.HEROES and window.HEROES_BY_ID are populated before renderApp() is called.

const POSITIONS = [
  { key: 'carry',        name: 'Керри',        num: '1' },
  { key: 'mid',          name: 'Мид',          num: '2' },
  { key: 'offlane',      name: 'Офлейн',       num: '3' },
  { key: 'softsupport',  name: 'Софт Саппорт', num: '4' },
  { key: 'hardsupport',  name: 'Хард Саппорт', num: '5' },
];

// Synthetic recommendation engine — placeholder until real Stratz matchup data is wired.
function scoreAgainst(heroId, enemyIds, allyIds) {
  let s = 0;
  for (const e of enemyIds) {
    if (!e) continue;
    s += (((heroId * 7 + e * 13) % 23) - 8);
  }
  for (const a of allyIds) {
    if (!a) continue;
    s += (((heroId * 11 + a * 5) % 17) - 5);
  }
  return Math.max(40, Math.min(95, 65 + s));
}

const THEMES = [
  { key: 'default',   name: 'Charcoal',   desc: 'Матовый графит',       swatch: { bg: '#131315', panel: '#1b1b1e', accent: '#cf4438', gold: '#c9a45e' } },
  { key: 'slate',     name: 'Slate',      desc: 'Холодный сине-серый',   swatch: { bg: '#12161c', panel: '#1a1f27', accent: '#de5648', gold: '#c9a45e' } },
  { key: 'ember',     name: 'Ember',      desc: 'Тёплый коричневый',     swatch: { bg: '#15110f', panel: '#1e1815', accent: '#c43a2e', gold: '#c9a45e' } },
  { key: 'midnight',  name: 'Midnight',   desc: 'Глубокая ночь',         swatch: { bg: '#0d1018', panel: '#161a26', accent: '#5e94d2', gold: '#c9a45e' } },
  { key: 'obsidian',  name: 'Obsidian',   desc: 'Чистый чёрный',         swatch: { bg: '#0c0c0d', panel: '#161618', accent: '#e04638', gold: '#d4b06a' } },
  { key: 'forest',    name: 'Forest',     desc: 'Мшистый зелёный',       swatch: { bg: '#101412', panel: '#181d1a', accent: '#cf9c46', gold: '#c9a45e' } },
  { key: 'plum',      name: 'Plum',       desc: 'Тёмная слива',          swatch: { bg: '#15101a', panel: '#1d1724', accent: '#c84a82', gold: '#c9a45e' } },
  { key: 'parchment', name: 'Parchment',  desc: 'Светлый пергамент',     swatch: { bg: '#f0ebe2', panel: '#e6e0d4', accent: '#a13128', gold: '#8a6a2e' }, light: true },
  { key: 'porcelain', name: 'Porcelain',  desc: 'Светлый, холодный',     swatch: { bg: '#f3f4f6', panel: '#e9ebef', accent: '#9d2d24', gold: '#8a6a2e' }, light: true },
];

// Adds computed display fields to a hero object from the Go backend.
function normalizeHero(h) {
  return {
    ...h,
    name: h.displayName,
    hue:  (h.id * 47) % 360,
    mark: h.displayName
      ? h.displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
      : '?',
  };
}

// Populated by app.js after GetHeroes() resolves.
window.HEROES = [];
window.HEROES_BY_ID = {};

// Demo draft data for simulate/paste fallback (uses real Stratz hero IDs).
window.DEMO_ENEMIES = [1, 2, 5, 8, 26];   // AM, Axe, CM, Jugg, Lina
window.DEMO_ALLIES  = [11, 22, 31, null, null]; // DS, WR, DP

Object.assign(window, { POSITIONS, scoreAgainst, THEMES, normalizeHero });
