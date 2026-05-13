// i18n — Russian + English. Strings are flat keys; vars are {placeholder}.

const TRANSLATIONS = {
  ru: {
    'app.subtitle':           '— помощник по драфту',
    'nav.draft':              'ДРАФТ',
    'nav.results':            'РЕЗ.',
    'nav.profile':            'ПРОФ.',
    'nav.settings':           'НАСТР.',

    'common.back':            '← Назад',
    'common.profile':         'Профиль',
    'common.ready':           'READY',

    'pos.carry':              'Керри',
    'pos.mid':                'Мид',
    'pos.offlane':            'Офлейн',
    'pos.softsupport':        'Софт Саппорт',
    'pos.hardsupport':        'Хард Саппорт',

    'attr.str':               'Сила',
    'attr.agi':               'Ловкость',
    'attr.int':               'Интеллект',

    'draft.h1':               'Драфт',
    'draft.crumb':            'Шаг 1 — вставьте скриншот из клиента',
    'draft.drop.title':       'Перетащите скриншот драфта',
    'draft.drop.subtitle':    'или нажмите для вставки (Ctrl+V)',
    'draft.drop.hint':        'PNG, JPG · разрешение от 1280×720 · автоматическое распознавание героев',
    'draft.recognized':       '1920×1080 · распознано {n}/10 героев · 184 мс',
    'draft.reset':            'Сбросить',
    'draft.row.enemies':      'Враги',
    'draft.row.enemies.sub':  'вражеская пятёрка',
    'draft.row.allies':       'Союзники',
    'draft.row.allies.sub':   'ваша команда',
    'draft.slot':             'Слот {n}',
    'draft.ready.template':   'Готов проанализировать {enemies} вражеских и {allies} союзных героя',
    'draft.empty':            'Сначала вставьте скриншот драфта',
    'draft.hint':             'Анализ учитывает контр-пики, синергию и ваших любимых героев на позицию.',
    'draft.btn.analyze':      'Анализировать',
    'draft.btn.analyzing':    'Анализ…',

    'results.h1':             'Результаты',
    'results.crumb':          'Рекомендации на позицию',
    'results.favorites':      '★ {n} ИЗБРАННЫХ',
    'results.context.enemies':'Враги',
    'results.context.allies': 'Союзники',
    'results.recommend':      'Рекомендуем',
    'results.candidates':     '{n} КАНДИДАТОВ',
    'results.empty':          'Нет кандидатов на эту позицию',
    'results.score':          'СКОР',
    'results.winrate':        'вин-рейт',
    'results.games':          'игр',

    'profile.h1':             'Профиль',
    'profile.crumb':          'Любимые герои по позициям',
    'profile.total':          '★ ВСЕГО {n}',
    'profile.positions':      'Позиции',
    'profile.add':            'Добавить героя',
    'profile.empty.0':        'Пока нет любимых героев на этой позиции',
    'profile.summary':        '{n} героев в избранном · приоритет в рекомендациях',
    'profile.empty.title':    'Добавьте героев, которых вы хотите пикать на эту позицию.',
    'profile.empty.sub':      'Они будут предложены первыми в анализе драфта.',

    'picker.title':           'Выберите героя',
    'picker.subtitle':        'Позиция: {pos} · {n} героев',
    'picker.search':          'Поиск героя…',
    'picker.all':             'Все роли',
    'picker.empty':           'Ничего не найдено',
    'picker.db':              '{n} героев в базе',
    'picker.hint':            'Клик — добавить · ESC — закрыть',
    'picker.already':         '{name} (уже в избранном)',

    'settings.h1':            'Настройки',
    'settings.crumb':         'Внешний вид и язык',
    'settings.appearance':    'Внешний вид',
    'settings.theme':         'Тема оформления',
    'settings.theme.hint':    'Меняется цветовая палитра всего интерфейса.',
    'settings.lang':          'Язык',
    'settings.lang.hint':     'Меняется язык интерфейса. Хоткеи и системные подписи остаются в латинице.',
    'settings.about':         'О приложении',
    'settings.version':       'Версия',
    'settings.heroes':        'Героев в базе',
    'settings.light':         'LIGHT',
  },
  en: {
    'app.subtitle':           '— draft assistant',
    'nav.draft':              'DRAFT',
    'nav.results':            'RES.',
    'nav.profile':            'PROF.',
    'nav.settings':           'SET.',

    'common.back':            '← Back',
    'common.profile':         'Profile',
    'common.ready':           'READY',

    'pos.carry':              'Carry',
    'pos.mid':                'Mid',
    'pos.offlane':            'Offlane',
    'pos.softsupport':        'Soft Support',
    'pos.hardsupport':        'Hard Support',

    'attr.str':               'Strength',
    'attr.agi':               'Agility',
    'attr.int':               'Intelligence',

    'draft.h1':               'Draft',
    'draft.crumb':            'Step 1 — paste a screenshot from the client',
    'draft.drop.title':       'Drop your draft screenshot',
    'draft.drop.subtitle':    'or click to paste (Ctrl+V)',
    'draft.drop.hint':        'PNG, JPG · 1280×720 minimum · automatic hero recognition',
    'draft.recognized':       '1920×1080 · recognized {n}/10 heroes · 184 ms',
    'draft.reset':            'Reset',
    'draft.row.enemies':      'Enemies',
    'draft.row.enemies.sub':  'enemy lineup',
    'draft.row.allies':       'Allies',
    'draft.row.allies.sub':   'your team',
    'draft.slot':             'Slot {n}',
    'draft.ready.template':   'Ready to analyze {enemies} enemy and {allies} ally heroes',
    'draft.empty':            'Paste a draft screenshot to begin',
    'draft.hint':             'Analysis considers counter-picks, synergy, and your favorite heroes per role.',
    'draft.btn.analyze':      'Analyze',
    'draft.btn.analyzing':    'Analyzing…',

    'results.h1':             'Results',
    'results.crumb':          'Recommendations per role',
    'results.favorites':      '★ {n} FAVORITES',
    'results.context.enemies':'Enemies',
    'results.context.allies': 'Allies',
    'results.recommend':      'Recommended',
    'results.candidates':     '{n} CANDIDATES',
    'results.empty':          'No candidates for this role',
    'results.score':          'SCORE',
    'results.winrate':        'win rate',
    'results.games':          'games',

    'profile.h1':             'Profile',
    'profile.crumb':          'Favorite heroes by role',
    'profile.total':          '★ TOTAL {n}',
    'profile.positions':      'Roles',
    'profile.add':            'Add hero',
    'profile.empty.0':        'No favorite heroes for this role yet',
    'profile.summary':        '{n} heroes favorited · prioritized in recs',
    'profile.empty.title':    'Add heroes you want to pick on this role.',
    'profile.empty.sub':      'They will be surfaced first in draft analysis.',

    'picker.title':           'Pick a hero',
    'picker.subtitle':        'Role: {pos} · {n} heroes',
    'picker.search':          'Search hero…',
    'picker.all':             'All roles',
    'picker.empty':           'Nothing found',
    'picker.db':              '{n} heroes in database',
    'picker.hint':            'Click to add · ESC to close',
    'picker.already':         '{name} (already favorited)',

    'settings.h1':            'Settings',
    'settings.crumb':         'Appearance and language',
    'settings.appearance':    'Appearance',
    'settings.theme':         'Color theme',
    'settings.theme.hint':    'Changes the whole UI palette.',
    'settings.lang':          'Language',
    'settings.lang.hint':     'Changes the interface language. Hotkeys and system labels stay in Latin.',
    'settings.about':         'About',
    'settings.version':       'Version',
    'settings.heroes':        'Heroes in database',
    'settings.light':         'LIGHT',
  },
};

const LangContext = React.createContext('ru');

function useT() {
  const lang = React.useContext(LangContext);
  return React.useCallback((key, vars) => {
    let s = (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || TRANSLATIONS.ru[key] || key;
    if (vars) {
      for (const k in vars) s = s.split('{' + k + '}').join(vars[k]);
    }
    return s;
  }, [lang]);
}

const LANGUAGES = [
  { key: 'ru', name: 'Русский', native: 'Русский', short: 'RU' },
  { key: 'en', name: 'English', native: 'English', short: 'EN' },
];

Object.assign(window, { TRANSLATIONS, LangContext, useT, LANGUAGES });
