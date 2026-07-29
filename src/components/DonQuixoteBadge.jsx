import { motion } from 'framer-motion'

export default function DonQuixoteBadge({ size = 100, showText = true, animated = false }) {
  const s = size
  const c = s / 2
  const Comp = animated ? motion.svg : 'svg'

  return (
    <div className="flex flex-col items-center gap-2">
      <Comp width={s} height={s} viewBox="0 0 120 140"
        {...(animated ? {
          initial: { scale: 0, y: 30 },
          animate: { scale: 1, y: 0 },
          transition: { type: 'spring', damping: 8, stiffness: 100 }
        } : {})}
      >
        <defs>
          <linearGradient id="dqBrown" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#A0522D"/>
            <stop offset="100%" stopColor="#6B3410"/>
          </linearGradient>
        </defs>

        {/* 绶带 */}
        <path d="M35 0 L85 0 L80 30 L60 24 L40 30 Z" fill="#A0522D" opacity="0.9"/>
        <path d="M35 0 L40 30 L20 35 L15 5 Z" fill="#7A3B1E" opacity="0.7"/>
        <path d="M85 0 L80 30 L100 35 L105 5 Z" fill="#7A3B1E" opacity="0.7"/>

        {/* 外圈 */}
        <circle cx={c} cy={c+12} r={46} fill="none" stroke="#A0522D" strokeWidth="3"/>
        <circle cx={c} cy={c+12} r={42} fill="none" stroke="#A0522D" strokeWidth="0.5" opacity="0.3" strokeDasharray="4 4"/>

        {/* 内圈背景 — 赭石调 */}
        <circle cx={c} cy={c+12} r={39} fill="#FDF5F0" opacity="0.4"/>

        {/* 拉曼却荒野地平线 */}
        <path d="M20 62 Q40 55 60 58 Q80 61 100 54" fill="none" stroke="#A0522D" strokeWidth="0.8" opacity="0.3"/>

        {/* 风车 — 中央偏左 */}
        <g transform="translate(44, 66)">
          {/* 塔身 */}
          <path d="M -6 18 L -8 -8 L 8 -8 L 6 18 Z" fill="none" stroke="#A0522D" strokeWidth="1.5"/>
          {/* 塔顶 */}
          <polygon points="-10,-8 0,-18 10,-8" fill="none" stroke="#A0522D" strokeWidth="1.5"/>
          {/* 门洞 */}
          <path d="M -3 18 L -3 8 Q 0 5 3 8 L 3 18" fill="none" stroke="#A0522D" strokeWidth="1" opacity="0.6"/>
          {/* 风翼轴心 */}
          <circle cx="0" cy="-12" r="2.5" fill="none" stroke="#A0522D" strokeWidth="1.5"/>
          {/* 四片风翼 */}
          {[0, 45, 90, 135].map(angle => (
            <g key={angle} transform={`rotate(${angle})`}>
              <line x1="0" y1="-3" x2="0" y2="-18" stroke="#A0522D" strokeWidth="1.5" strokeLinecap="round"/>
              <rect x="-4" y="-25" width="8" height="10" rx="2" fill="none" stroke="#A0522D" strokeWidth="1.2" opacity="0.6"/>
              {/* 叶片纹理 */}
              <line x1="0" y1="-18" x2="0" y2="-22" stroke="#A0522D" strokeWidth="0.5" opacity="0.3"/>
            </g>
          ))}
        </g>

        {/* 折断的长矛 — 右下 */}
        <g transform="translate(82, 82) rotate(50)">
          {/* 上半截（倾斜） */}
          <line x1="0" y1="4" x2="-3" y2="-18" stroke="#A0522D" strokeWidth="2.5" strokeLinecap="round"/>
          {/* 断裂处 */}
          <circle cx="0" cy="4" r="2" fill="#A0522D" opacity="0.4"/>
          {/* 下半截（掉落方向） */}
          <line x1="3" y1="8" x2="5" y2="20" stroke="#A0522D" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
          {/* 矛头 */}
          <polygon points="-3,-18 -7,-24 0,-28 1,-24" fill="#A0522D" opacity="0.7"/>
        </g>

        {/* 标题横幅 */}
        <path d="M18 100 Q60 118 102 100 L99 115 Q60 130 21 115 Z" fill="#A0522D"/>
        <text x={c} y={114} textAnchor="middle" fill="white" fontSize="9" fontWeight="800" letterSpacing="2">风车仍在转动</text>

        {/* 底部 */}
        <text x={c} y={132} textAnchor="middle" fill="#A0522D" fontSize="6.5" fontWeight="700" letterSpacing="2">DON QUIJOTE</text>
      </Comp>
      {showText && (
        <div className="text-center">
          <p className="text-sm font-extrabold" style={{ color: '#A0522D' }}>堂吉诃德徽章</p>
          <p className="text-[11px] text-[#8B7355]">风车骑士 · 再战</p>
        </div>
      )}
    </div>
  )
}
