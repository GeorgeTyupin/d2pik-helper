// Shared visual components: hero portrait, score bar, icons.

function HeroPortrait({ hero, size = 'md', dim = false, showName = false, favorite = false }) {
  const [imgFailed, setImgFailed] = React.useState(false);
  if (!hero) return null;
  const sizes = { xs: 36, sm: 48, md: 64, lg: 84 };
  const w = sizes[size];
  // Fallback color disc uses a stable hue derived from the hero ID.
  const hue = (hero.id * 47) % 360;
  const bg  = `oklch(38% 0.10 ${hue})`;
  const bg2 = `oklch(22% 0.08 ${hue})`;
  // Two-letter monogram from displayName.
  const mark = hero.displayName
    ? hero.displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';
  const cdnUrl = hero.shortName
    ? `https://cdn.dota2.com/apps/dota2/images/heroes/${hero.shortName}_sb.png`
    : null;
  return (
    <div className="hp-wrap" style={{ width: w, opacity: dim ? 0.65 : 1 }} title={hero.displayName}>
      <div className="hp" style={{ background: `linear-gradient(135deg, ${bg} 0%, ${bg2} 100%)` }}>
        {cdnUrl && !imgFailed ? (
          <img
            src={cdnUrl}
            alt={hero.displayName}
            onError={() => setImgFailed(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', borderRadius: 2 }}
          />
        ) : (
          <span className="mono-mark" style={{ fontSize: w * 0.28 }}>{mark}</span>
        )}
        {favorite && (
          <span style={{
            position: 'absolute', top: 2, right: 3,
            fontSize: 10, color: 'var(--gold)',
            textShadow: '0 1px 2px rgba(0,0,0,.8)', zIndex: 2,
          }}>★</span>
        )}
      </div>
      {showName && (
        <div style={{
          marginTop: 4, fontSize: 10, color: 'var(--text-dim)',
          textAlign: 'center', whiteSpace: 'nowrap',
          overflow: 'hidden', textOverflow: 'ellipsis', width: w,
        }}>{hero.displayName}</div>
      )}
    </div>
  );
}

function EmptySlot({ size = 'md', label = '+' }) {
  const sizes = { xs: 36, sm: 48, md: 64, lg: 84 };
  const w = sizes[size];
  return (
    <div style={{ width: w }}>
      <div className="hp empty">
        <span style={{ fontSize: 16 }}>{label}</span>
      </div>
    </div>
  );
}

function ScoreBar({ score, max = 100, color = 'red' }) {
  const pct = Math.max(0, Math.min(100, (score / max) * 100));
  const fillColor = color === 'gold' ? 'var(--gold)' : 'var(--red-hi)';
  const fillColor2 = color === 'gold' ? '#a48342' : 'var(--red)';
  return (
    <div style={{
      width: '100%', height: 6,
      background: 'var(--bg)',
      border: '1px solid var(--line)',
      borderRadius: 1, overflow: 'hidden', position: 'relative',
    }}>
      <div style={{
        width: `${pct}%`, height: '100%',
        background: `linear-gradient(90deg, ${fillColor2} 0%, ${fillColor} 100%)`,
        boxShadow: color === 'gold'
          ? 'inset 0 1px 0 rgba(255,255,255,.2), 0 0 6px rgba(201,164,94,.3)'
          : 'inset 0 1px 0 rgba(255,255,255,.15)',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 19px, rgba(0,0,0,.4) 19px 20px)',
        pointerEvents: 'none',
      }} />
    </div>
  );
}

// ── Icons ────────────────────────────────────────────────────────────────────

function IconUpload(props) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" {...props}>
      <path d="M8 11V3M5 6l3-3 3 3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2"/>
    </svg>
  );
}
function IconDraft(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <rect x="3" y="5" width="8" height="6" rx="0.5"/>
      <rect x="13" y="5" width="8" height="6" rx="0.5"/>
      <rect x="3" y="13" width="8" height="6" rx="0.5"/>
      <rect x="13" y="13" width="8" height="6" rx="0.5"/>
    </svg>
  );
}
function IconResults(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M4 19V9M10 19V5M16 19v-7M22 19H2" strokeLinecap="round"/>
    </svg>
  );
}
function IconProfile(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <circle cx="12" cy="8" r="3.5"/>
      <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" strokeLinecap="round"/>
    </svg>
  );
}
function IconSearch(props) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" {...props}>
      <circle cx="7" cy="7" r="4.5"/>
      <path d="M10.5 10.5L14 14" strokeLinecap="round"/>
    </svg>
  );
}
function IconPlus(props) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M8 3v10M3 8h10" strokeLinecap="round"/>
    </svg>
  );
}
function IconArrow(props) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconGear(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" {...props}>
      <path d="M19.43 12.98a7.94 7.94 0 0 0 0-1.96l2.04-1.6a.5.5 0 0 0 .12-.64l-1.93-3.35a.5.5 0 0 0-.61-.22l-2.4.97a7.85 7.85 0 0 0-1.7-.98l-.36-2.56a.5.5 0 0 0-.5-.43h-3.86a.5.5 0 0 0-.5.43l-.36 2.56a7.85 7.85 0 0 0-1.7.98l-2.4-.97a.5.5 0 0 0-.61.22L2.74 8.78a.5.5 0 0 0 .12.64l2.04 1.6a7.94 7.94 0 0 0 0 1.96l-2.04 1.6a.5.5 0 0 0-.12.64l1.93 3.35a.5.5 0 0 0 .61.22l2.4-.97c.51.39 1.08.72 1.7.98l.36 2.56c.04.25.25.43.5.43h3.86c.25 0 .46-.18.5-.43l.36-2.56a7.85 7.85 0 0 0 1.7-.98l2.4.97a.5.5 0 0 0 .61-.22l1.93-3.35a.5.5 0 0 0-.12-.64l-2.04-1.6Z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

Object.assign(window, {
  HeroPortrait, EmptySlot, ScoreBar,
  IconUpload, IconDraft, IconResults, IconProfile, IconSearch, IconPlus, IconArrow, IconGear,
});
