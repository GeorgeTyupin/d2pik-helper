// Screen 2 — RESULTS
// Small context portraits at top, ranked recommendations, favorites first.

function ScreenResults({ enemies, allies, favorites, activePosition, setActivePosition, onBack }) {
  const t = useT();
  const enemyHeroes = enemies.map(id => id ? HEROES_BY_ID[id] : null).filter(Boolean);
  const allyHeroes  = allies.map(id => id ? HEROES_BY_ID[id] : null).filter(Boolean);

  const pos = activePosition || 'carry';

  const drafted = new Set([...enemies, ...allies].filter(Boolean));
  const candidates = HEROES.filter(h => {
    const heroRoles = h.roles || [];
    return heroRoles.length === 0 || heroRoles.includes(pos);
  }).filter(h => !drafted.has(h.id));

  const favSet = new Set(favorites[pos] || []);

  const scored = candidates.map(h => ({
    hero: h,
    score: scoreAgainst(h.id, enemies, allies) + (favSet.has(h.id) ? 6 : 0),
    favorite: favSet.has(h.id),
  })).sort((a, b) => {
    if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
    return b.score - a.score;
  });

  return (
    <>
      <div className="topbar">
        <h1>{t('results.h1')}</h1>
        <div className="sep"></div>
        <div className="crumb">{t('results.crumb')}</div>
        <div className="topbar-right">
          <div className="pill mono">
            {t('results.favorites', { n: favSet.size })}
          </div>
          <button className="btn btn-ghost" onClick={onBack} style={{ padding: '5px 12px', fontSize: 11 }}>
            {t('common.back')}
          </button>
        </div>
      </div>

      <div className="screen">
        {/* Context strip: enemies + allies */}
        <div className="row" style={{ gap: 12, alignItems: 'stretch' }}>
          <ContextStrip label={t('results.context.enemies')} color="red" heroes={enemyHeroes} />
          <ContextStrip label={t('results.context.allies')} color="gold" heroes={allyHeroes} />
        </div>

        {/* Position tabs */}
        <div style={{
          marginTop: 14, display: 'flex', gap: 0,
          borderBottom: '1px solid var(--line)',
        }}>
          {POSITIONS.map(p => {
            const active = p.key === pos;
            return (
              <button
                key={p.key}
                onClick={() => setActivePosition(p.key)}
                style={{
                  flex: 1, background: active ? 'var(--panel)' : 'transparent',
                  border: 'none',
                  borderRight: '1px solid var(--line)',
                  borderTop: active ? '1px solid var(--line)' : '1px solid transparent',
                  borderLeft: active ? '1px solid var(--line)' : '1px solid transparent',
                  borderBottom: active ? '1px solid var(--panel)' : '1px solid transparent',
                  marginBottom: '-1px',
                  color: active ? 'var(--text)' : 'var(--text-mute)',
                  padding: '8px 10px', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 11, letterSpacing: 0.04,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  borderTopColor: active ? 'var(--red)' : 'transparent',
                  borderTopWidth: active ? 2 : 1,
                  boxShadow: active ? 'inset 0 1px 0 var(--red)' : 'none',
                }}>
                <span className="mono" style={{
                  fontSize: 9,
                  color: active ? 'var(--gold)' : 'var(--text-mute)',
                  border: `1px solid ${active ? 'rgba(201,164,94,.4)' : 'var(--line-2)'}`,
                  padding: '0 4px', borderRadius: 1,
                }}>{p.num}</span>
                <span>{t('pos.' + p.key)}</span>
              </button>
            );
          })}
        </div>

        {/* Recommendations list */}
        <div style={{ marginTop: 12 }}>
          <div className="label" style={{ marginBottom: 6 }}>
            <span>{t('results.recommend')}</span>
            <span className="line"></span>
            <span className="count">{t('results.candidates', { n: scored.length })}</span>
          </div>

          <div className="col" style={{ gap: 4 }}>
            {scored.slice(0, 8).map((item, i) => (
              <RecCard key={item.hero.id} item={item} rank={i + 1} t={t} />
            ))}
            {scored.length === 0 && (
              <div style={{
                padding: 20, textAlign: 'center', color: 'var(--text-mute)',
                border: '1px dashed var(--line)', fontSize: 12,
              }}>
                {t('results.empty')}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function ContextStrip({ label, color, heroes }) {
  return (
    <div style={{
      flex: 1, background: 'var(--panel)', border: '1px solid var(--line)',
      borderRadius: 2, padding: '7px 10px',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <div className="col" style={{ gap: 1, minWidth: 60 }}>
        <div style={{
          fontSize: 9, letterSpacing: 0.18, textTransform: 'uppercase',
          color: color === 'red' ? '#d97a73' : 'var(--gold)', fontWeight: 600,
        }}>{label}</div>
        <div className="mono" style={{ fontSize: 10, color: 'var(--text-mute)' }}>
          {heroes.length}/5
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4, flex: 1 }}>
        {Array.from({ length: 5 }).map((_, i) => {
          const h = heroes[i];
          return h ? (
            <HeroPortrait key={i} hero={h} size="xs" />
          ) : (
            <div key={i} className="hp empty" style={{ width: 36, flex: '0 0 auto' }}>
              <span style={{ fontSize: 12 }}>—</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RecCard({ item, rank, t }) {
  const { hero, score, favorite } = item;
  const wr = (40 + (score - 40) * 0.6).toFixed(1);
  const games = 100 + ((hero.id * 47) % 900);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '28px 48px 1fr 90px 60px 70px',
      alignItems: 'center', gap: 10,
      padding: '8px 10px',
      background: favorite ? 'linear-gradient(90deg, rgba(201,164,94,.06) 0%, var(--panel) 60%)' : 'var(--panel)',
      border: '1px solid var(--line)',
      borderLeft: favorite ? '2px solid var(--gold)' : '2px solid transparent',
      borderRadius: 2, transition: 'background .12s',
    }}>
      {/* Rank */}
      <div className="mono" style={{
        fontSize: 13,
        color: rank <= 3 ? 'var(--gold)' : 'var(--text-mute)',
        textAlign: 'center', fontWeight: rank <= 3 ? 700 : 400,
      }}>
        {String(rank).padStart(2, '0')}
      </div>

      {/* Portrait */}
      <HeroPortrait hero={hero} size="sm" />

      {/* Name + tags */}
      <div className="col" style={{ gap: 3, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 600, color: 'var(--text)',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {favorite && <span className="star" style={{ fontSize: 12 }}>★</span>}
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{hero.name}</span>
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <span className="tag">{hero.attr.toUpperCase()}</span>
          {hero.roles.slice(0, 2).map(r => (
            <span key={r} className="tag" style={{ textTransform: 'capitalize' }}>{r}</span>
          ))}
        </div>
      </div>

      {/* Score bar */}
      <div className="col" style={{ gap: 3 }}>
        <ScoreBar score={score} color={favorite ? 'gold' : 'red'} />
        <div className="mono" style={{
          fontSize: 9, color: 'var(--text-mute)',
          display: 'flex', justifyContent: 'space-between',
        }}>
          <span>{t('results.score')}</span>
          <span style={{ color: favorite ? 'var(--gold)' : 'var(--text)' }}>{score}/100</span>
        </div>
      </div>

      {/* Winrate */}
      <div className="col" style={{ gap: 1, textAlign: 'right' }}>
        <div className="mono" style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{wr}%</div>
        <div className="mono" style={{ fontSize: 9, color: 'var(--text-mute)', letterSpacing: 0.05, textTransform: 'uppercase' }}>
          {t('results.winrate')}
        </div>
      </div>

      {/* Games */}
      <div className="col" style={{ gap: 1, textAlign: 'right' }}>
        <div className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>{games}</div>
        <div className="mono" style={{ fontSize: 9, color: 'var(--text-mute)', letterSpacing: 0.05, textTransform: 'uppercase' }}>
          {t('results.games')}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenResults });
