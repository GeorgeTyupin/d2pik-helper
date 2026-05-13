// Screen 0 — SETUP (first run)
// Shown when stratz_token is not configured.

const isJWT = (s) => /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(s);

function ScreenSetup({ onDone }) {
  const t = useT();
  const [token, setToken] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSave = () => {
    const val = token.trim();
    if (!val) return;
    if (!isJWT(val)) {
      setError(t('setup.token.invalid'));
      return;
    }
    setError('');
    setSaving(true);
    const go = window.go?.app?.App;
    try {
      if (go) {
        go.SetSetting('stratz_token', val)
          .then(() => onDone())
          .catch(() => onDone());
      } else {
        onDone();
      }
    } catch (_) {
      onDone();
    }
  };

  const pasteToken = () => {
    if (window.runtime?.ClipboardGetText) {
      window.runtime.ClipboardGetText().then(text => { if (text) { setToken(text.trim()); setError(''); } }).catch(() => {});
    } else {
      navigator.clipboard?.readText().then(text => { if (text) { setToken(text.trim()); setError(''); } }).catch(() => {});
    }
  };

  const clearToken = () => { setToken(''); setError(''); };

  const openStratz = (e) => {
    e.preventDefault();
    if (window.runtime?.BrowserOpenURL) {
      window.runtime.BrowserOpenURL('https://stratz.com/api');
    }
  };

  return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 40,
    }}>
      <div style={{
        width: 480,
        background: 'var(--panel)',
        border: '1px solid var(--line-2)',
        borderRadius: 3,
        padding: '32px 36px',
        display: 'flex', flexDirection: 'column', gap: 24,
      }}>
        {/* Header */}
        <div className="col" style={{ gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="tb-logo-dot" style={{ flexShrink: 0 }}></span>
            <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', letterSpacing: -0.3 }}>
              {t('setup.h1')}
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.6 }}>
            {t('setup.sub')}
          </div>
        </div>

        {/* Token input */}
        <div className="col" style={{ gap: 8 }}>
          <div style={{ fontSize: 11, color: 'var(--text-mute)', letterSpacing: 0.16, textTransform: 'uppercase', fontWeight: 600 }}>
            {t('setup.token.label')}
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input
              autoFocus
              type="text"
              value={token}
              onChange={e => { setToken(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && token.trim() && handleSave()}
              placeholder={t('setup.token.placeholder')}
              style={{
                flex: 1, minWidth: 0,
                background: 'var(--bg)',
                border: '1px solid var(--line-2)',
                borderRadius: 2,
                color: 'var(--text)',
                fontFamily: 'inherit',
                fontSize: 13,
                padding: '9px 12px',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color .12s',
              }}
              onFocus={e => { e.target.style.boxShadow = '0 0 0 2px rgba(176,58,48,.2)'; }}
              onBlur={e => { e.target.style.boxShadow = 'none'; }}
            />
            <button className="btn btn-primary" onClick={pasteToken} title={t('settings.token.paste')} style={{ padding: '8px 10px', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="4" width="10" height="11" rx="1"/>
                <path d="M6 4V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1"/>
                <line x1="5" y1="8" x2="11" y2="8"/>
                <line x1="5" y1="11" x2="9" y2="11"/>
              </svg>
            </button>
            <button className="btn btn-primary" onClick={clearToken} title={t('settings.token.clear')} style={{ padding: '8px 10px', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="3" y1="3" x2="13" y2="13"/>
                <line x1="13" y1="3" x2="3" y2="13"/>
              </svg>
            </button>
          </div>
          {error && (
            <div style={{ fontSize: 11, color: 'var(--red)', lineHeight: 1.5 }}>
              {error}
            </div>
          )}
          <div style={{ fontSize: 11, color: 'var(--text-mute)', lineHeight: 1.5 }}>
            {t('setup.token.hint')}{' '}
            <a
              href="https://stratz.com/api"
              onClick={openStratz}
              style={{ color: 'var(--red)', textDecoration: 'underline', cursor: 'pointer' }}
            >
              stratz.com/api
            </a>
          </div>
        </div>

        {/* Actions */}
        <div className="col" style={{ gap: 8 }}>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={!token.trim() || saving}
            style={{ width: '100%', justifyContent: 'center', padding: '10px 0', fontSize: 13 }}
          >
            {t('setup.btn')}
          </button>
          <button
            className="btn btn-ghost"
            onClick={onDone}
            style={{ width: '100%', justifyContent: 'center', padding: '7px 0', fontSize: 11 }}
          >
            {t('setup.skip')}
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenSetup });
