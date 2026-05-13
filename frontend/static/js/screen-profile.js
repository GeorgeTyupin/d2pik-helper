// Screen 3 — PROFILE
// 5 position tabs, list of favorite heroes per position, "Add hero" opens a searchable grid.

function ScreenProfile({ favorites, setFavorites, activePosition, setActivePosition }) {
  const t = useT();
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const pos = activePosition || 'carry';
  const posObj = POSITIONS.find(p => p.key === pos);
  const myFavs = favorites[pos] || [];
  const favHeroes = myFavs.map(id => HEROES_BY_ID[id]).filter(Boolean);

  const addHero = (id) => {
    if (myFavs.includes(id)) return;
    setFavorites({ ...favorites, [pos]: [...myFavs, id] });
  };
  const removeHero = (id) => {
    setFavorites({ ...favorites, [pos]: myFavs.filter(x => x !== id) });
  };

  return (
    <>
      <div className="topbar">
        <h1>{t('profile.h1')}</h1>
        <div className="sep"></div>
        <div className="crumb">{t('profile.crumb')}</div>
        <div className="topbar-right">
          <div className="pill mono">
            {t('profile.total', { n: Object.values(favorites).flat().length })}
          </div>
        </div>
      </div>

      <div className="screen">
        <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 14, minHeight: 420 }}>
          {/* Left rail: position list */}
          <div className="col" style={{ gap: 2 }}>
            <div className="label" style={{ marginBottom: 4 }}>
              <span>{t('profile.positions')}</span>
              <span className="line"></span>
            </div>
            {POSITIONS.map(p => {
              const active = p.key === pos;
              const n = (favorites[p.key] || []).length;
              return (
                <button
                  key={p.key}
                  onClick={() => setActivePosition(p.key)}
                  style={{
                    background: active ? 'var(--panel)' : 'transparent',
                    border: '1px solid',
                    borderColor: active ? 'var(--line-2)' : 'transparent',
                    borderLeft: active ? '2px solid var(--red)' : '2px solid transparent',
                    color: active ? 'var(--text)' : 'var(--text-dim)',
                    padding: '8px 10px', cursor: 'pointer',
                    fontFamily: 'inherit', fontSize: 12,
                    display: 'flex', alignItems: 'center', gap: 8,
                    borderRadius: 2, textAlign: 'left', transition: 'all .12s',
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--panel)'; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span className="mono" style={{
                    fontSize: 10,
                    color: active ? 'var(--gold)' : 'var(--text-mute)',
                    border: `1px solid ${active ? 'rgba(201,164,94,.5)' : 'var(--line-2)'}`,
                    padding: '1px 5px', borderRadius: 1, minWidth: 16, textAlign: 'center',
                  }}>{p.num}</span>
                  <span style={{ flex: 1 }}>{t('pos.' + p.key)}</span>
                  <span className="mono" style={{ fontSize: 10, color: active ? 'var(--text)' : 'var(--text-mute)' }}>
                    {n}
                  </span>
                </button>
              );
            })}

            <div style={{
              marginTop: 14, padding: 10,
              background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 2,
            }}>
              <div style={{ fontSize: 10, color: 'var(--text-mute)', letterSpacing: 0.16, textTransform: 'uppercase', marginBottom: 4 }}>
                ★
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.5 }}>
                {t('profile.empty.sub')}
              </div>
            </div>
          </div>

          {/* Right: favorites grid + add */}
          <div className="col" style={{ gap: 0, minWidth: 0 }}>
            <div className="row" style={{ alignItems: 'baseline', marginBottom: 8 }}>
              <div className="col" style={{ gap: 2 }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="mono" style={{
                    fontSize: 10, color: 'var(--gold)',
                    border: '1px solid rgba(201,164,94,.4)',
                    padding: '1px 5px', borderRadius: 1,
                  }}>{posObj.num}</span>
                  {t('pos.' + posObj.key)}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-mute)' }}>
                  {favHeroes.length === 0
                    ? t('profile.empty.0')
                    : t('profile.summary', { n: favHeroes.length })}
                </div>
              </div>
              <div className="grow"></div>
              <button className="btn btn-primary" onClick={() => setPickerOpen(true)} style={{ padding: '7px 14px' }}>
                <IconPlus style={{ width: 12, height: 12 }} />
                {t('profile.add')}
              </button>
            </div>

            {favHeroes.length === 0 ? (
              <div style={{
                flex: 1, border: '1px dashed var(--line-2)', borderRadius: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-mute)', fontSize: 12, padding: 30,
                background: 'var(--bg)', textAlign: 'center',
                flexDirection: 'column', gap: 6, minHeight: 220,
              }}>
                <div style={{ fontSize: 24, color: 'var(--line-2)' }}>★</div>
                <div>{t('profile.empty.title')}</div>
                <div style={{ fontSize: 10 }}>{t('profile.empty.sub')}</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
                {favHeroes.map(h => (
                  <FavoriteCard key={h.id} hero={h} onRemove={() => removeHero(h.id)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {pickerOpen && (
        <HeroPicker
          onClose={() => setPickerOpen(false)}
          onPick={(id) => { addHero(id); }}
          alreadyPicked={new Set(myFavs)}
          positionLabel={t('pos.' + posObj.key)}
          positionFilter={pos}
          t={t}
        />
      )}
    </>
  );
}

function FavoriteCard({ hero, onRemove }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative', background: 'var(--panel)',
        border: '1px solid var(--line)', padding: 4, borderRadius: 2,
      }}
    >
      <div className="hp" style={{
        aspectRatio: '1.4 / 1',
        background: `linear-gradient(135deg, oklch(42% 0.11 ${hero.hue}) 0%, oklch(22% 0.08 ${hero.hue}) 100%)`,
      }}>
        <span className="mono-mark" style={{ fontSize: 14 }}>{hero.mark}</span>
        <span style={{ position: 'absolute', top: 2, right: 3, fontSize: 10, color: 'var(--gold)', zIndex: 2, textShadow: '0 1px 2px #000' }}>★</span>
      </div>
      <div style={{
        fontSize: 10, color: 'var(--text-dim)', textAlign: 'center', marginTop: 3,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {hero.name}
      </div>
      {hover && (
        <button
          onClick={onRemove}
          style={{
            position: 'absolute', top: 2, left: 2, width: 18, height: 18,
            background: 'rgba(20,15,12,.9)', border: '1px solid var(--line-2)',
            borderRadius: 2, color: 'var(--text-dim)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'inherit', fontSize: 14, lineHeight: 1, padding: 0,
          }}
        >×</button>
      )}
    </div>
  );
}

function HeroPicker({ onClose, onPick, alreadyPicked, positionLabel, positionFilter, t }) {
  const [q, setQ] = React.useState('');
  const [showAll, setShowAll] = React.useState(false);

  React.useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const filtered = HEROES.filter(h => {
    if (!showAll && !h.roles.includes(positionFilter)) return false;
    if (q && !h.name.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{
      position: 'absolute', inset: 30, top: 30,
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(2px)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      zIndex: 50,
    }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 720, maxHeight: 520,
          background: 'var(--bg)',
          border: '1px solid var(--line-2)',
          boxShadow: '0 20px 40px rgba(0,0,0,.6)',
          marginTop: 20, display: 'flex', flexDirection: 'column', borderRadius: 2,
        }}>
        <div style={{
          padding: '10px 14px', borderBottom: '1px solid var(--line)',
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'linear-gradient(180deg, var(--panel-2) 0%, var(--bg) 100%)',
        }}>
          <div className="col" style={{ gap: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{t('picker.title')}</div>
            <div style={{ fontSize: 10, color: 'var(--text-mute)' }}>
              {t('picker.subtitle', { pos: positionLabel, n: filtered.length })}
            </div>
          </div>
          <div className="grow"></div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--bg)', border: '1px solid var(--line)',
            padding: '4px 8px', borderRadius: 2, width: 220,
          }}>
            <IconSearch style={{ width: 12, height: 12, color: 'var(--text-mute)' }}/>
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t('picker.search')}
              style={{
                background: 'transparent', border: 'none',
                color: 'var(--text)', fontFamily: 'inherit',
                fontSize: 12, width: '100%', padding: 0, outline: 'none',
              }}
            />
          </div>
          <label style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 10, color: 'var(--text-dim)', cursor: 'pointer', userSelect: 'none',
          }}>
            <input
              type="checkbox"
              checked={showAll}
              onChange={(e) => setShowAll(e.target.checked)}
              style={{ margin: 0, accentColor: 'var(--red)' }}
            />
            {t('picker.all')}
          </label>
          <button
            onClick={onClose}
            style={{
              width: 24, height: 24, background: 'transparent',
              border: '1px solid var(--line-2)', color: 'var(--text-dim)',
              cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, borderRadius: 2,
            }}
          >×</button>
        </div>

        <div style={{ padding: '10px 14px', overflow: 'auto', flex: 1 }}>
          {['str', 'agi', 'int'].map(attr => {
            const list = filtered.filter(h => h.attr === attr);
            if (list.length === 0) return null;
            const attrColor = { str: '#a64a3a', agi: '#5a8a6a', int: '#4a73a3' }[attr];
            return (
              <div key={attr} style={{ marginBottom: 12 }}>
                <div className="label" style={{ marginBottom: 5 }}>
                  <span style={{
                    display: 'inline-block', width: 6, height: 6,
                    background: attrColor, transform: 'rotate(45deg)',
                  }}></span>
                  <span>{t('attr.' + attr)}</span>
                  <span className="line"></span>
                  <span className="count">{list.length}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 4 }}>
                  {list.map(h => {
                    const picked = alreadyPicked.has(h.id);
                    return (
                      <button
                        key={h.id}
                        onClick={() => !picked && onPick(h.id)}
                        disabled={picked}
                        title={picked ? t('picker.already', { name: h.name }) : h.name}
                        style={{
                          padding: 0, background: 'transparent', border: 'none',
                          cursor: picked ? 'default' : 'pointer',
                          opacity: picked ? 0.35 : 1, position: 'relative',
                        }}
                      >
                        <div className="hp" style={{
                          aspectRatio: '1.4 / 1',
                          background: `linear-gradient(135deg, oklch(40% 0.10 ${h.hue}) 0%, oklch(22% 0.08 ${h.hue}) 100%)`,
                        }}>
                          <span className="mono-mark" style={{ fontSize: 10 }}>{h.mark}</span>
                          {picked && (
                            <span style={{ position: 'absolute', top: 1, right: 2, fontSize: 8, color: 'var(--gold)', zIndex: 2 }}>★</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-mute)', fontSize: 12 }}>
              {t('picker.empty')}
            </div>
          )}
        </div>

        <div style={{
          padding: '8px 14px', borderTop: '1px solid var(--line)',
          display: 'flex', alignItems: 'center', gap: 10,
          fontSize: 10, color: 'var(--text-mute)',
        }}>
          <span>{t('picker.db', { n: HEROES.length })}</span>
          <span className="grow"></span>
          <span>{t('picker.hint')}</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenProfile });
