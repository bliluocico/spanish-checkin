// 和风传统纹样组件库
// 青海波 · 七宝 · 麻叶 · 龟甲 · 矢絣

// 青海波 — 海浪
export function Seigaiha({ size = 24, color = '#4a6a8a', opacity = 1 }) {
  return (
    <svg width={size} height={size * 0.7} viewBox="0 0 52 36" fill="none" style={{ opacity }}>
      <g stroke={color} strokeWidth="1.4">
        <path d="M26 4a14 14 0 0 1 14 14" fill="none" />
        <path d="M26 4a14 14 0 0 0-14 14" fill="none" />
        <path d="M26 24a10 10 0 0 1 10 10" fill="none" />
        <path d="M26 24a10 10 0 0 0-10 10" fill="none" />
        <path d="M2 24a10 10 0 0 1 10 10" fill="none" opacity="0.5" />
        <path d="M50 24a10 10 0 0 0-10 10" fill="none" opacity="0.5" />
        <path d="M10 4a14 14 0 0 1 14 14" fill="none" opacity="0.4" />
        <path d="M42 4a14 14 0 0 0-14 14" fill="none" opacity="0.4" />
        <path d="M2 4a14 14 0 0 1 14 14" fill="none" opacity="0.25" />
        <path d="M50 4a14 14 0 0 0-14 14" fill="none" opacity="0.25" />
      </g>
    </svg>
  )
}

// 七宝纹 — 圆环交叠
export function Shippo({ size = 24, color = '#c97b6a', opacity = 1 }) {
  return (
    <svg width={size} height={size * 0.92} viewBox="0 0 48 44" fill="none" style={{ opacity }}>
      <g stroke={color} strokeWidth="1.4">
        <circle cx="24" cy="22" r="11" fill="none" />
        <circle cx="24" cy="22" r="7.5" fill="none" opacity="0.5" />
        <circle cx="24" cy="22" r="3.5" fill="none" opacity="0.3" />
        <circle cx="13" cy="11" r="8" fill="none" opacity="0.7" />
        <circle cx="35" cy="11" r="8" fill="none" opacity="0.7" />
        <circle cx="13" cy="33" r="8" fill="none" opacity="0.7" />
        <circle cx="35" cy="33" r="8" fill="none" opacity="0.7" />
        <circle cx="24" cy="0" r="8" fill="none" opacity="0.4" />
        <circle cx="24" cy="44" r="8" fill="none" opacity="0.4" />
      </g>
    </svg>
  )
}

// 麻叶纹 — 六边形星形
export function Asanoha({ size = 24, color = '#6a8a5a', opacity = 1 }) {
  return (
    <svg width={size} height={size * 0.88} viewBox="0 0 48 42" fill="none" style={{ opacity }}>
      <g stroke={color} strokeWidth="1.4">
        <path d="M24 4v34M10 12l14-8 14 8M10 12l14 8 14-8M10 12v16l14 8 14-8V12M24 20l14 8" fill="none" />
        <path d="M10 28l14 8" fill="none" opacity="0.6" />
      </g>
    </svg>
  )
}

// 龟甲纹 — 六边形
export function Kikko({ size = 24, color = '#8a7a6a', opacity = 1 }) {
  return (
    <svg width={size} height={size * 0.87} viewBox="0 0 46 40" fill="none" style={{ opacity }}>
      <g stroke={color} strokeWidth="1.4">
        <path d="M23 4l10 5.8v11.6L23 27l-10-5.8V9.8z" fill="none" />
        <path d="M23 40l10-5.8V22.6L23 28.4 13 22.6v11.6z" fill="none" />
        <path d="M23 4v5M13 9.8v5.8M33 9.8v5.8" fill="none" opacity="0.5" />
      </g>
    </svg>
  )
}

// 矢絣纹 — 菱形
export function Yagasuri({ size = 24, color = '#c9a84c', opacity = 1 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" style={{ opacity }}>
      <g stroke={color} strokeWidth="1.4">
        <path d="M20 4l10 10-10 10-10-10z" fill="none" />
        <path d="M20 24l10 10-10 10-10-10z" fill="none" opacity="0.6" />
        <path d="M20 4v10M20 24v12" fill="none" opacity="0.4" />
      </g>
    </svg>
  )
}

// 通用纹样映射
export const PATTERNS = {
  seigaiha: Seigaiha,
  shippo: Shippo,
  asanoha: Asanoha,
  kikko: Kikko,
  yagasuri: Yagasuri,
}

// 装饰分隔线 — 纹样+细线
export function PatternDivider({ pattern = 'shippo', color = '#c9a84c', size = 14 }) {
  const P = PATTERNS[pattern] || Shippo
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0' }}>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, var(--line))' }} />
      <P size={size} color={color} />
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, var(--line), transparent)' }} />
    </div>
  )
}
