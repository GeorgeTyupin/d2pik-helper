// Screen 4 — SETTINGS
// Appearance (theme), language selection, about section.

function ScreenSettings({ theme, setTheme, lang, setLang }) {
  const t = useT();

  return (
    <>
      <div className="topbar">
        <h1>{t('settings.h1')}</h1>
        <div className="sep"></div>
        <div className="crumb">{t('settings.crumb')}</div>
        <div className="topbar-right">
          <div className="pill mono">v0.1.0</div>
        </div>
      </div>

      <div className="screen">
        <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 16 }}>
          {/* Left rail — section nav */}
          <div className="col" style={{ gap: 2 }}>
            <div className="label" style={{ marginBottom: 4 }}>
              <span>{t('settings.h1')}</span>
              <span className="line"></span>
            </div>
            <SettingNavItem icon="◐" label={t('settings.appearance')} active />
            <SettingNavItem icon="A"  label={t('settings.lang')} />
            <SettingNavItem icon="ⓘ" label={t('settings.about')} />
          </div>

          {/* Right pane — settings groups */}
          <div className="col" style={{ gap: 14, minWidth: 0 }}>
            {/* Theme */}
            <SettingGroup
              title={t('settings.appearance')}
              subtitle={t('settings.theme')}
              hint={t('settings.theme.hint')}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                {THEMES.map(th => (
                  <ThemeCard
                    key={th.key}
                    theme={th}
                    active={theme === th.key}
                    lightLabel={t('settings.light')}
                    onClick={() => setTheme(th.key)}
                  />
                ))}
              </div>
            </SettingGroup>

            {/* Language */}
            <SettingGroup title={t('settings.lang')} hint={t('settings.lang.hint')}>
              <div style={{ display: 'flex', gap: 6 }}>
                {LANGUAGES.map(l => (
                  <LangCard
                    key={l.key}
                    language={l}
                    active={lang === l.key}
                    onClick={() => setLang(l.key)}
                  />
                ))}
              </div>
            </SettingGroup>

            {/* About */}
            <SettingGroup title={t('settings.about')}>
              <div className="mono" style={{
                fontSize: 11, color: 'var(--text-dim)',
                display: 'grid', gridTemplateColumns: '160px 1fr',
                rowGap: 4, columnGap: 10,
              }}>
                <span style={{ color: 'var(--text-mute)' }}>d2pik</span>
                <span>Draft assistant for Dota 2</span>
                <span style={{ color: 'var(--text-mute)' }}>{t('settings.version')}</span>
                <span>0.1.0</span>
                <span style={{ color: 'var(--text-mute)' }}>{t('settings.heroes')}</span>
                <span>{HEROES.length}</span>
                <span style={{ color: 'var(--text-mute)' }}>UI</span>
                <span>{LANGUAGES.find(l => l.key === lang).name}</span>
              </div>
            </SettingGroup>
          </div>
        </div>
      </div>
    </>
  );
}

function SettingNavItem({ icon, label, active }) {
  return (
    <div style={{
      padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 8,
      fontSize: 12,
      color: active ? 'var(--text)' : 'var(--text-dim)',
      background: active ? 'var(--panel)' : 'transparent',
      border: '1px solid',
      borderColor: active ? 'var(--line-2)' : 'transparent',
      borderLeft: active ? '2px solid var(--red)' : '2px solid transparent',
      borderRadius: 2, cursor: active ? 'default' : 'pointer', transition: 'all .12s',
    }}>
      <span className="mono" style={{
        width: 16, textAlign: 'center',
        color: active ? 'var(--gold)' : 'var(--text-mute)', fontSize: 11,
      }}>{icon}</span>
      <span>{label}</span>
    </div>
  );
}

function SettingGroup({ title, subtitle, hint, children }) {
  return (
    <div style={{
      background: 'var(--panel)', border: '1px solid var(--line)',
      borderRadius: 2, padding: '12px 14px',
    }}>
      <div className="col" style={{ gap: 1, marginBottom: 10 }}>
        <div style={{
          fontSize: 11, letterSpacing: 0.18, textTransform: 'uppercase',
          color: 'var(--text-mute)', fontWeight: 600,
        }}>{title}</div>
        {subtitle && (
          <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{subtitle}</div>
        )}
        {hint && (
          <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 2 }}>{hint}</div>
        )}
      </div>
      {children}
    </div>
  );
}

function ThemeCard({ theme, active, lightLabel, onClick }) {
  const { bg, panel, accent, gold } = theme.swatch;
  const isLight = theme.light;
  return (
    <button
      onClick={onClick}
      title={`${theme.name} — ${theme.desc}`}
      style={{
        padding: 6, background: active ? 'var(--panel-2)' : 'transparent',
        border: '1px solid', borderColor: active ? 'var(--gold)' : 'var(--line)',
        borderRadius: 2, cursor: 'pointer', textAlign: 'left',
        fontFamily: 'inherit', transition: 'all .12s', position: 'relative',
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.borderColor = 'var(--line-2)'; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.borderColor = 'var(--line)'; }}
    >
      {/* Mini preview */}
      <div style={{
        position: 'relative', height: 38, background: bg,
        border: `1px solid ${isLight ? '#00000020' : '#ffffff10'}`,
        borderRadius: 1, display: 'flex', overflow: 'hidden',
      }}>
        <div style={{ width: 10, background: panel, borderRight: `1px solid ${isLight ? '#00000015' : '#00000060'}` }}>
          <div style={{ width: 5, height: 5, margin: '3px auto', background: accent, borderRadius: 1 }}/>
        </div>
        <div style={{ flex: 1, padding: '5px 6px', display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <div style={{ width: 14, height: 4, background: accent, borderRadius: 1 }}/>
            <div style={{ height: 2, flex: 1, background: isLight ? '#0000001a' : '#ffffff14' }}/>
            <div style={{ width: 4, height: 4, background: gold, borderRadius: '50%' }}/>
          </div>
          <div style={{ display: 'flex', gap: 2 }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ flex: 1, height: 10, background: panel, borderRadius: 1 }}/>
            ))}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 5, display: 'flex', alignItems: 'center', gap: 5 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: active ? 'var(--text)' : 'var(--text-dim)' }}>
          {theme.name}
        </div>
        {isLight && (
          <span style={{
            fontSize: 8, color: 'var(--text-mute)',
            border: '1px solid var(--line-2)', padding: '0 3px', borderRadius: 1, letterSpacing: 0.08,
          }}>{lightLabel}</span>
        )}
        <div style={{ flex: 1 }}></div>
        {active && <span style={{ color: 'var(--gold)', fontSize: 10 }}>●</span>}
      </div>
      <div style={{
        fontSize: 10, color: 'var(--text-mute)',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 1,
      }}>{theme.desc}</div>
    </button>
  );
}

function LangCard({ language, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, padding: '10px 12px',
        background: active ? 'var(--panel-2)' : 'var(--bg)',
        border: '1px solid', borderColor: active ? 'var(--gold)' : 'var(--line)',
        borderRadius: 2, cursor: 'pointer', fontFamily: 'inherit',
        textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12,
        position: 'relative', transition: 'all .12s',
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.borderColor = 'var(--line-2)'; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.borderColor = 'var(--line)'; }}
    >
      <div className="mono" style={{
        fontSize: 18, fontWeight: 700,
        color: active ? 'var(--gold)' : 'var(--text-dim)',
        letterSpacing: 0.02, minWidth: 30,
      }}>{language.short}</div>
      <div className="col" style={{ gap: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: active ? 'var(--text)' : 'var(--text-dim)' }}>
          {language.native}
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-mute)', letterSpacing: 0.05, textTransform: 'uppercase' }}>
          {language.key === 'ru' ? 'Русский язык' : 'English language'}
        </div>
      </div>
      <div style={{ flex: 1 }}></div>
      {active && <span style={{ color: 'var(--gold)', fontSize: 12 }}>●</span>}
    </button>
  );
}

Object.assign(window, { ScreenSettings });
