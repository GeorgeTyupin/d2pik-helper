// App shell — Windows-style title bar, sidebar, screen switcher, language + theme state.
// Window controls (min/max/close) use the Wails runtime when available.

const { useState, useEffect } = React;

// Wails runtime is injected at build time; gracefully no-op in browser preview.
const winAPI = window.runtime || {
  WindowMinimise: () => {},
  WindowToggleMaximise: () => {},
  Quit: () => {},
};

function App() {
  const [screen, setScreen] = useState('draft');
  const [theme, setThemeState] = useState(() => localStorage.getItem('d2pik.theme') || 'default');
  const [lang, setLangState] = useState(() => localStorage.getItem('d2pik.lang') || 'ru');
  const [setupDone, setSetupDone] = useState(false);

  const [enemies, setEnemies] = useState([null, null, null, null, null]);
  const [allies, setAllies]   = useState([null, null, null, null, null]);
  const [hasScreenshot, setHasScreenshot] = useState(false);
  const [activePosition, setActivePosition] = useState('carry');

  const emptyFavs = { carry: [], mid: [], offlane: [], softsupport: [], hardsupport: [] };
  const [favorites, setFavorites] = useState(emptyFavs);

  // Fetch portrait server base URL once and store globally.
  useEffect(() => {
    window.go?.app?.App.PortraitsBaseURL?.()
      .then(base => { window.portraitsBase = base; })
      .catch(() => {});
  }, []);

  // Check if first run (no Stratz token yet).
  useEffect(() => {
    const go = window.go?.app?.App;
    if (!go) { setSetupDone(true); return; }
    go.GetSetting('stratz_token')
      .then(token => setSetupDone(!!token))
      .catch(() => setSetupDone(true));
  }, []);

  // Load favorites from backend on mount.
  useEffect(() => {
    const go = window.go?.app?.App;
    if (!go) return;
    go.GetFavorites().then(map => {
      if (!map) return;
      const posKeys = ['carry', 'mid', 'offlane', 'softsupport', 'hardsupport'];
      const favs = {};
      posKeys.forEach((key, i) => { favs[key] = (map[i + 1] || []).map(Number); });
      setFavorites(favs);
    }).catch(() => {});
  }, []);

  // Apply theme to body class
  useEffect(() => {
    document.body.className = '';
    if (theme && theme !== 'default') {
      document.body.classList.add('theme-' + theme);
    }
  }, [theme]);

  const setTheme = (v) => {
    setThemeState(v);
    localStorage.setItem('d2pik.theme', v);
  };

  const setLang = (v) => {
    setLangState(v);
    localStorage.setItem('d2pik.lang', v);
  };

  const updateFavorites = (favs) => {
    setFavorites(favs);
    const go = window.go?.app?.App;
    if (!go) return;
    const posKeys = ['carry', 'mid', 'offlane', 'softsupport', 'hardsupport'];
    posKeys.forEach((key, i) => {
      go.SetFavorites(i + 1, favs[key] || []).catch(() => {});
    });
  };

  // Global Ctrl+V handler — passes clipboard image to Go backend for recognition
  useEffect(() => {
    const handlePaste = (e) => {
      if (screen !== 'draft' || hasScreenshot) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          // TODO: wire to Go backend via window.go.app.RecognizeDraft(base64)
          // For now, simulate with demo data
          setHasScreenshot(true);
          setEnemies(window.DEMO_ENEMIES || [null, null, null, null, null]);
          setAllies(window.DEMO_ALLIES   || [null, null, null, null, null]);
          break;
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [screen, hasScreenshot]);

  const handleAnalyze = () => setScreen('results');

  return (
    <LangContext.Provider value={lang}>
      <div className="win">
        <TitleBar />

        {!setupDone ? (
          <div className="body">
            <ScreenSetup onDone={() => setSetupDone(true)} />
          </div>
        ) : (
          <div className="body">
            <Sidebar screen={screen} setScreen={setScreen} />

            <div className="content">
              {screen === 'draft' && (
                <ScreenDraft
                  enemies={enemies}
                  allies={allies}
                  setEnemies={setEnemies}
                  setAllies={setAllies}
                  hasScreenshot={hasScreenshot}
                  setHasScreenshot={setHasScreenshot}
                  onAnalyze={handleAnalyze}
                  onGoProfile={() => setScreen('profile')}
                />
              )}
              {screen === 'results' && (
                <ScreenResults
                  enemies={enemies}
                  allies={allies}
                  favorites={favorites}
                  activePosition={activePosition}
                  setActivePosition={setActivePosition}
                  onBack={() => setScreen('draft')}
                />
              )}
              {screen === 'profile' && (
                <ScreenProfile
                  favorites={favorites}
                  setFavorites={updateFavorites}
                  activePosition={activePosition}
                  setActivePosition={setActivePosition}
                />
              )}
              {screen === 'settings' && (
                <ScreenSettings
                  theme={theme}
                  setTheme={setTheme}
                  lang={lang}
                  setLang={setLang}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </LangContext.Provider>
  );
}

function TitleBar() {
  const t = useT();
  return (
    <div className="titlebar">
      <div className="tb-title">
        <span className="tb-logo">
          <span className="tb-logo-dot"></span>
          <span>d2pik</span>
        </span>
        <span style={{ color: 'var(--text-mute)' }}>{t('app.subtitle')}</span>
      </div>
      <div className="tb-controls">
        <button className="tb-btn" title="Minimize" onClick={() => winAPI.WindowMinimise()}>
          <svg viewBox="0 0 10 10"><path d="M0 5h10" stroke="currentColor" strokeWidth="1"/></svg>
        </button>
        <button className="tb-btn" title="Maximize" onClick={() => winAPI.WindowToggleMaximise()}>
          <svg viewBox="0 0 10 10"><rect x="0.5" y="0.5" width="9" height="9" fill="none" stroke="currentColor" strokeWidth="1"/></svg>
        </button>
        <button className="tb-btn close" title="Close" onClick={() => winAPI.Quit()}>
          <svg viewBox="0 0 10 10"><path d="M0 0L10 10M10 0L0 10" stroke="currentColor" strokeWidth="1"/></svg>
        </button>
      </div>
    </div>
  );
}

function Sidebar({ screen, setScreen }) {
  const t = useT();
  const items = [
    { key: 'draft',   label: t('nav.draft'),   Icon: IconDraft },
    { key: 'results', label: t('nav.results'), Icon: IconResults },
    { key: 'profile', label: t('nav.profile'), Icon: IconProfile },
  ];
  const settingsItem = { key: 'settings', label: t('nav.settings'), Icon: IconGear };
  return (
    <div className="sidebar">
      {items.map(it => (
        <button
          key={it.key}
          className={`nav-btn ${screen === it.key ? 'active' : ''}`}
          onClick={() => setScreen(it.key)}
        >
          <it.Icon />
          <span>{it.label}</span>
        </button>
      ))}
      <div style={{ flex: 1 }}></div>
      <button
        className={`nav-btn ${screen === settingsItem.key ? 'active' : ''}`}
        onClick={() => setScreen(settingsItem.key)}
      >
        <settingsItem.Icon />
        <span>{settingsItem.label}</span>
      </button>
      <div className="mono" style={{
        fontSize: 8, color: 'var(--text-mute)',
        letterSpacing: 0.1, marginTop: 8, marginBottom: 4,
      }}>
        v0.1
      </div>
    </div>
  );
}

function renderApp() {
  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
}

// Render immediately so the app is never blocked.
renderApp();

// Loads hero list from Go backend and updates global HEROES / HEROES_BY_ID.
function loadHeroes() {
  const go = window.go?.app?.App;
  if (!go || typeof go.GetHeroes !== 'function') return;
  go.GetHeroes()
    .then(heroes => {
      window.HEROES = (heroes || []).map(normalizeHero);
      window.HEROES_BY_ID = Object.fromEntries(window.HEROES.map(h => [h.id, h]));
    })
    .catch(() => {});
}

// Initial load after render.
loadHeroes();

// Re-load when background update completes (heroes:updated event from Go).
if (window.runtime?.EventsOn) {
  window.runtime.EventsOn('heroes:updated', loadHeroes);
}
