// Screen 1 — DRAFT
// Paste/drop area, two rows of 5 slots, Analyze button.

function ScreenDraft({ enemies, allies, setEnemies, setAllies, hasScreenshot, setHasScreenshot, onAnalyze, onGoProfile }) {
  const t = useT();
  const [dragOver, setDragOver] = React.useState(false);
  const [analyzing, setAnalyzing] = React.useState(false);

  const filledCount = (arr) => arr.filter(Boolean).length;

  const handleSimulateRecognition = () => {
    // Simulate hero recognition from screenshot — real implementation uses Go/pHash backend.
    setHasScreenshot(true);
    setEnemies(window.DEMO_ENEMIES || [null, null, null, null, null]);
    setAllies(window.DEMO_ALLIES   || [null, null, null, null, null]);
  };

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      onAnalyze();
    }, 700);
  };

  const handleReset = () => {
    setHasScreenshot(false);
    setEnemies([null, null, null, null, null]);
    setAllies([null, null, null, null, null]);
  };

  const enemyHeroes = (enemies || []).map(id => id ? HEROES_BY_ID[id] : null);
  const allyHeroes  = (allies  || []).map(id => id ? HEROES_BY_ID[id] : null);

  return (
    <>
      <div className="topbar">
        <h1>{t('draft.h1')}</h1>
        <div className="sep"></div>
        <div className="crumb">{t('draft.crumb')}</div>
        <div className="topbar-right">
          <div className="pill"><span className="dot"></span>{t('common.ready')}</div>
        </div>
      </div>

      <div className="screen">
        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleSimulateRecognition(); }}
          onClick={() => !hasScreenshot && handleSimulateRecognition()}
          style={{
            position: 'relative',
            border: dragOver ? '1px solid var(--red)' : '1px dashed var(--line-2)',
            background: hasScreenshot ? 'var(--panel)' : (dragOver ? 'rgba(176,58,48,.08)' : 'var(--bg)'),
            borderRadius: 2,
            padding: hasScreenshot ? 10 : 18,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            cursor: hasScreenshot ? 'default' : 'pointer',
            transition: 'all .15s',
            minHeight: 70,
          }}>
          {hasScreenshot ? (
            <>
              {/* Mini representation of the dropped screenshot */}
              <div style={{
                width: 110, height: 56,
                background: 'linear-gradient(135deg, var(--panel-2) 0%, var(--bg) 100%)',
                border: '1px solid var(--line)',
                borderRadius: 2,
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                padding: 4, gap: 2, flex: '0 0 auto',
              }}>
                {enemyHeroes.map((h, i) => (
                  <div key={i} style={{
                    background: h ? `oklch(35% 0.10 ${h.hue})` : 'var(--bg)',
                    borderRadius: 1,
                  }}/>
                ))}
                {allyHeroes.map((h, i) => (
                  <div key={i} style={{
                    background: h ? `oklch(35% 0.10 ${h.hue})` : 'var(--bg)',
                    borderRadius: 1,
                  }}/>
                ))}
              </div>
              <div className="col" style={{ flex: 1, gap: 2 }}>
                <div style={{ fontSize: 12, color: 'var(--text)', fontWeight: 600 }}>draft_screenshot.png</div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--text-mute)' }}>
                  {t('draft.recognized', { n: filledCount(enemies) + filledCount(allies) })}
                </div>
              </div>
              <button className="btn btn-ghost" onClick={handleReset} style={{ padding: '6px 12px', fontSize: 11 }}>
                {t('draft.reset')}
              </button>
            </>
          ) : (
            <>
              <div style={{
                width: 44, height: 44,
                border: '1px solid var(--line-2)',
                borderRadius: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-dim)', flex: '0 0 auto',
              }}>
                <IconUpload style={{ width: 18, height: 18 }} />
              </div>
              <div className="col" style={{ flex: 1, gap: 2 }}>
                <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>
                  {t('draft.drop.title')}&nbsp;
                  <span style={{ color: 'var(--text-mute)', fontWeight: 400 }}>{t('draft.drop.subtitle')}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-mute)' }}>
                  {t('draft.drop.hint')}
                </div>
              </div>
              <div className="mono" style={{
                fontSize: 10, color: 'var(--text-mute)',
                border: '1px solid var(--line)', padding: '3px 6px', borderRadius: 2,
              }}>CTRL+V</div>
            </>
          )}
        </div>

        {/* Two rows of slots */}
        <div style={{ marginTop: 14 }}>
          <SlotRow
            label={t('draft.row.enemies')}
            sub={t('draft.row.enemies.sub')}
            count={`${filledCount(enemies)}/5`}
            heroes={enemyHeroes}
            color="red"
            t={t}
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <SlotRow
            label={t('draft.row.allies')}
            sub={t('draft.row.allies.sub')}
            count={`${filledCount(allies)}/5`}
            heroes={allyHeroes}
            color="gold"
            positions={POSITIONS}
            t={t}
          />
        </div>

        {/* Footer actions */}
        <div className="row" style={{ marginTop: 16, alignItems: 'center', gap: 12 }}>
          <div className="col" style={{ gap: 1 }}>
            <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
              {hasScreenshot
                ? t('draft.ready.template', {
                    enemies: filledCount(enemies),
                    allies: filledCount(allies),
                  })
                : t('draft.empty')}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-mute)' }}>
              {t('draft.hint')}
            </div>
          </div>
          <div className="grow"></div>
          <button className="btn btn-ghost" onClick={onGoProfile}>{t('common.profile')}</button>
          <button
            className="btn btn-primary"
            onClick={handleAnalyze}
            disabled={!hasScreenshot || analyzing}
          >
            {analyzing ? t('draft.btn.analyzing') : t('draft.btn.analyze')}
            {!analyzing && <IconArrow style={{ width: 12, height: 12 }} />}
          </button>
        </div>
      </div>
    </>
  );
}

function SlotRow({ label, sub, count, heroes, color, positions, t }) {
  return (
    <div>
      <div className="label">
        <span style={{
          display: 'inline-block', width: 6, height: 6,
          background: color === 'red' ? 'var(--red)' : 'var(--gold)',
          transform: 'rotate(45deg)',
        }}></span>
        <span style={{ color: color === 'red' ? '#d97a73' : 'var(--gold)' }}>{label}</span>
        <span style={{ color: 'var(--text-mute)', fontWeight: 400, letterSpacing: 0, textTransform: 'none' }}>· {sub}</span>
        <span className="line"></span>
        <span className="count">{count}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
        {heroes.map((h, i) => (
          <div key={i} className="col" style={{ gap: 4 }}>
            <div style={{ width: '100%' }}>
              {h ? (
                <div className="hp" style={{
                  aspectRatio: '1.4 / 1',
                  background: `linear-gradient(135deg, oklch(40% 0.10 ${h.hue}) 0%, oklch(22% 0.08 ${h.hue}) 100%)`,
                }}>
                  <span className="mono-mark" style={{ fontSize: 18 }}>{h.mark}</span>
                </div>
              ) : (
                <div className="hp empty" style={{ aspectRatio: '1.4 / 1' }}>
                  <span style={{ fontSize: 18 }}>—</span>
                </div>
              )}
            </div>
            <div style={{
              fontSize: 10,
              color: h ? 'var(--text-dim)' : 'var(--text-mute)',
              textAlign: 'center',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            }}>
              {positions && (
                <span className="mono" style={{
                  fontSize: 9, color: 'var(--text-mute)',
                  border: '1px solid var(--line)', padding: '0 3px', borderRadius: 1,
                }}>{positions[i].num}</span>
              )}
              <span>{h ? h.name : (positions && t ? t('pos.' + positions[i].key) : t ? t('draft.slot', { n: i + 1 }) : `Slot ${i + 1}`)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { ScreenDraft });
