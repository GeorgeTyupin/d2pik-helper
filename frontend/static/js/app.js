// App shell — Windows-style title bar, sidebar, screen switcher, language + theme state.
// Window controls (min/max/close) use the Wails runtime when available.

const { useState, useEffect } = React;

// Wails runtime is injected at build time; gracefully no-op in browser preview.
const wails = window.runtime || {
  WindowMinimise: () => {},
  WindowToggleMaximise: () => {},
  Quit: () => {},
};

function App() {
  const [screen, setScreen] = useState('draft');
  const [theme, setThemeState] = useState(() => localStorage.getItem('d2pik.theme') || 'default');
  const [lang, setLangState] = useState(() => localStorage.getItem('d2pik.lang') || 'ru');

  const [enemies, setEnemies] = useState([null, null, null, null, null]);
  const [allies, setAllies]   = useState([null, null, null, null, null]);
  const [hasScreenshot, setHasScreenshot] = useState(false);
  const [activePosition, setActivePosition] = useState('carry');

  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem('d2pik.favorites');
      return stored ? JSON.parse(stored) : { carry: [], mid: [], offlane: [], softsupport: [], hardsupport: [] };
    } catch {
      return { carry: [], mid: [], offlane: [], softsupport: [], hardsupport: [] };
    }
  });

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
    localStorage.setItem('d2pik.favorites', JSON.stringify(favs));
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
          setEnemies(window.DEMO_ENEMIES);
          setAllies(window.DEMO_ALLIES);
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
        <button className="tb-btn" title="Minimize" onClick={() => wails.WindowMinimise()}>
          <svg viewBox="0 0 10 10"><path d="M0 5h10" stroke="currentColor" strokeWidth="1"/></svg>
        </button>
        <button className="tb-btn" title="Maximize" onClick={() => wails.WindowToggleMaximise()}>
          <svg viewBox="0 0 10 10"><rect x="0.5" y="0.5" width="9" height="9" fill="none" stroke="currentColor" strokeWidth="1"/></svg>
        </button>
        <button className="tb-btn close" title="Close" onClick={() => wails.Quit()}>
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

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
