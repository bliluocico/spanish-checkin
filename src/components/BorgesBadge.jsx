import { motion } from 'framer-motion'

export default function BorgesBadge({ size = 100, showText = true, animated = false }) {
  const s = size
  const c = s / 2
  const Comp = animated ? motion.svg : 'svg'

  return (
    <div className="flex flex-col items-center gap-2">
      <Comp width={s} height={s} viewBox="0 0 120 140"
        {...(animated ? {
          initial: { scale: 0, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          transition: { type: 'spring', damping: 10, stiffness: 140 }
        } : {})}
      >
        <defs>
          <linearGradient id="borgGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8B6914"/>
            <stop offset="100%" stopColor="#5C4510"/>
          </linearGradient>
        </defs>

        {/* 绶带 */}
        <path d="M35 0 L85 0 L80 30 L60 24 L40 30 Z" fill="#8B6914" opacity="0.9"/>
        <path d="M35 0 L40 30 L20 35 L15 5 Z" fill="#6B5010" opacity="0.7"/>
        <path d="M85 0 L80 30 L100 35 L105 5 Z" fill="#6B5010" opacity="0.7"/>

        {/* 外圈 */}
        <circle cx={c} cy={c+12} r={46} fill="none" stroke="#8B6914" strokeWidth="3"/>
        <circle cx={c} cy={c+12} r={43} fill="none" stroke="#8B6914" strokeWidth="0.5" opacity="0.4"/>

        {/* 内圈背景 */}
        <circle cx={c} cy={c+12} r={40} fill="#FDF8EE" opacity="0.5"/>

        {/* 迷宫图案 — 七层同心圆 + 交替开口 */}
        {[33, 27, 21, 15, 9].map((radius, i) => {
          const gapAngle = i % 2 === 0 ? -70 : 110
          const gapSize = 0.45 - i * 0.04
          const startA = (gapAngle - gapSize * 180 / Math.PI) * Math.PI / 180
          const endA = (gapAngle + gapSize * 180 / Math.PI) * Math.PI / 180
          const cx = c, cy = c + 12

          const x1 = cx + radius * Math.cos(startA)
          const y1 = cy + radius * Math.sin(startA)
          const x2 = cx + radius * Math.cos(endA)
          const y2 = cy + radius * Math.sin(endA)

          return (
            <path key={i}
              d={`M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`}
              fill="none"
              stroke="#8B6914"
              strokeWidth={i < 2 ? "2" : "1.5"}
              opacity={0.3 + i * 0.12}
              strokeLinecap="round"
            />
          )
        })}

        {/* 迷宫入口小门 */}
        <line x1={c-6} y1={c+45} x2={c-6} y2={c+38} stroke="#8B6914" strokeWidth="1.5" opacity="0.5"/>
        <line x1={c-6} y1={c+45} x2={c-2} y2={c+45} stroke="#8B6914" strokeWidth="1.5" opacity="0.5"/>

        {/* 中心 — 镜面 */}
        <circle cx={c} cy={c+12} r="6" fill="#8B6914" opacity="0.15"/>
        <circle cx={c} cy={c+12} r="3" fill="#8B6914" opacity="0.3"/>

        {/* 标题横幅 */}
        <path d="M28 98 Q60 113 92 98 L89 113 Q60 126 31 113 Z" fill="#8B6914"/>
        <text x={c} y={112} textAnchor="middle" fill="white" fontSize="10" fontWeight="800" letterSpacing="2">BORGES</text>

        {/* 底部 */}
        <text x={c} y={132} textAnchor="middle" fill="#8B6914" fontSize="7" fontWeight="700" letterSpacing="2">EL JARDÍN</text>
      </Comp>
      {showText && (
        <div className="text-center">
          <p className="text-sm font-extrabold" style={{ color: '#8B6914' }}>博尔赫斯徽章</p>
          <p className="text-[11px] text-[#8B7355]">迷宫中的同路人 · 携手</p>
        </div>
      )}
    </div>
  )
}
