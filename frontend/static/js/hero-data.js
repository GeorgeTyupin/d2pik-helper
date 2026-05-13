// Abstract hero database — names are factual references for a companion utility.
// Portraits are NOT recreated; we render abstract color-disc monograms.
// Each hero gets: name, monogram, hue (oklch base), primary attribute, roles.

const HEROES = [
  // Carry / Mid pool
  { id: 'jugg',  name: 'Juggernaut',        mark: 'JG', hue: 145, attr: 'agi', roles: ['carry'] },
  { id: 'am',    name: 'Anti-Mage',         mark: 'AM', hue: 280, attr: 'agi', roles: ['carry'] },
  { id: 'pa',    name: 'Phantom Assassin',  mark: 'PA', hue: 320, attr: 'agi', roles: ['carry'] },
  { id: 'sf',    name: 'Shadow Fiend',      mark: 'SF', hue: 15,  attr: 'agi', roles: ['mid'] },
  { id: 'inv',   name: 'Invoker',           mark: 'IV', hue: 50,  attr: 'int', roles: ['mid'] },
  { id: 'sniper',name: 'Sniper',            mark: 'SN', hue: 35,  attr: 'agi', roles: ['carry','mid'] },
  { id: 'drow',  name: 'Drow Ranger',       mark: 'DR', hue: 195, attr: 'agi', roles: ['carry'] },
  { id: 'tb',    name: 'Terrorblade',       mark: 'TB', hue: 310, attr: 'agi', roles: ['carry'] },
  { id: 'spec',  name: 'Spectre',           mark: 'SP', hue: 260, attr: 'agi', roles: ['carry'] },
  { id: 'storm', name: 'Storm Spirit',      mark: 'ST', hue: 210, attr: 'int', roles: ['mid'] },
  { id: 'puck',  name: 'Puck',              mark: 'PK', hue: 165, attr: 'int', roles: ['mid'] },
  { id: 'tinker',name: 'Tinker',            mark: 'TK', hue: 25,  attr: 'int', roles: ['mid'] },
  { id: 'ember', name: 'Ember Spirit',      mark: 'EM', hue: 10,  attr: 'agi', roles: ['mid'] },

  // Offlane
  { id: 'axe',   name: 'Axe',               mark: 'AX', hue: 0,   attr: 'str', roles: ['offlane'] },
  { id: 'tide',  name: 'Tidehunter',        mark: 'TH', hue: 175, attr: 'str', roles: ['offlane'] },
  { id: 'mars',  name: 'Mars',              mark: 'MR', hue: 20,  attr: 'str', roles: ['offlane'] },
  { id: 'mag',   name: 'Magnus',            mark: 'MG', hue: 240, attr: 'str', roles: ['offlane'] },
  { id: 'dk',    name: 'Dragon Knight',     mark: 'DK', hue: 30,  attr: 'str', roles: ['offlane','mid'] },
  { id: 'centaur',name:'Centaur Warrunner', mark: 'CW', hue: 200, attr: 'str', roles: ['offlane'] },
  { id: 'underlord',name:'Underlord',       mark: 'UL', hue: 280, attr: 'str', roles: ['offlane'] },

  // Soft support
  { id: 'mirana',name: 'Mirana',            mark: 'MI', hue: 220, attr: 'agi', roles: ['softsupport'] },
  { id: 'rubick',name: 'Rubick',            mark: 'RB', hue: 290, attr: 'int', roles: ['softsupport'] },
  { id: 'earth', name: 'Earth Spirit',      mark: 'ES', hue: 30,  attr: 'str', roles: ['softsupport'] },
  { id: 'snap',  name: 'Snapfire',          mark: 'SF', hue: 5,   attr: 'str', roles: ['softsupport'] },
  { id: 'jakiro',name: 'Jakiro',            mark: 'JK', hue: 195, attr: 'int', roles: ['softsupport'] },
  { id: 'wd',    name: 'Witch Doctor',      mark: 'WD', hue: 290, attr: 'int', roles: ['softsupport','hardsupport'] },

  // Hard support
  { id: 'lion',  name: 'Lion',              mark: 'LN', hue: 280, attr: 'int', roles: ['hardsupport'] },
  { id: 'cm',    name: 'Crystal Maiden',    mark: 'CM', hue: 210, attr: 'int', roles: ['hardsupport'] },
  { id: 'lich',  name: 'Lich',              mark: 'LC', hue: 200, attr: 'int', roles: ['hardsupport'] },
  { id: 'dazzle',name: 'Dazzle',            mark: 'DZ', hue: 320, attr: 'int', roles: ['hardsupport'] },
  { id: 'oracle',name: 'Oracle',            mark: 'OR', hue: 30,  attr: 'int', roles: ['hardsupport'] },
  { id: 'shaman',name: 'Shadow Shaman',     mark: 'SS', hue: 290, attr: 'int', roles: ['hardsupport'] },
  { id: 'pugna', name: 'Pugna',             mark: 'PG', hue: 165, attr: 'int', roles: ['hardsupport','mid'] },
  { id: 'omni',  name: 'Omniknight',        mark: 'OM', hue: 50,  attr: 'str', roles: ['offlane','hardsupport'] },
];

const HEROES_BY_ID = Object.fromEntries(HEROES.map(h => [h.id, h]));

const POSITIONS = [
  { key: 'carry',        name: 'Керри',        num: '1' },
  { key: 'mid',          name: 'Мид',          num: '2' },
  { key: 'offlane',      name: 'Офлейн',       num: '3' },
  { key: 'softsupport',  name: 'Софт Саппорт', num: '4' },
  { key: 'hardsupport',  name: 'Хард Саппорт', num: '5' },
];

// Demo draft for development/testing
const DEMO_ENEMIES = ['am', 'storm', 'mars', 'rubick', 'lion'];
const DEMO_ALLIES  = ['jugg', 'inv', null, null, null];

// Synthetic recommendation engine — score by counter-vs-enemy + synergy-vs-ally heuristics.
// Will be replaced by real Stratz API data.
function scoreAgainst(heroId, enemyIds, allyIds) {
  let s = 0;
  for (const e of enemyIds) {
    if (!e) continue;
    s += (((heroId.charCodeAt(0) * 7 + e.charCodeAt(0) * 13) % 23) - 8);
  }
  for (const a of allyIds) {
    if (!a) continue;
    s += (((heroId.charCodeAt(0) * 11 + a.charCodeAt(0) * 5) % 17) - 5);
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

Object.assign(window, { HEROES, HEROES_BY_ID, POSITIONS, DEMO_ENEMIES, DEMO_ALLIES, scoreAgainst, THEMES });
