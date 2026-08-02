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
          {/* 金属光泽滤镜 */}
          <filter id="borgShine" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>
            <feOffset in="blur" dx="0" dy="2" result="offsetBlur"/>
            <feSpecularLighting in="blur" surfaceScale="3" specularConstant="1.2" specularExponent="12" lightingColor="white" result="specOut">
              <fePointLight x="-50" y="-50" z="80"/>
            </feSpecularLighting>
            <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut"/>
            <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litPaint"/>
            <feMerge>
              <feMergeNode in="offsetBlur"/>
              <feMergeNode in="litPaint"/>
            </feMerge>
          </filter>

          {/* 渐变 */}
          <linearGradient id="borgGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#A67C1A"/>
            <stop offset="50%" stopColor="#8B6914"/>
            <stop offset="100%" stopColor="#5C4510"/>
          </linearGradient>
          <linearGradient id="borgRim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C49A30"/>
            <stop offset="50%" stopColor="#A67C1A"/>
            <stop offset="100%" stopColor="#8B6914"/>
          </linearGradient>
          <linearGradient id="borgRibbon" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#A67C1A"/>
            <stop offset="50%" stopColor="#8B6914"/>
            <stop offset="100%" stopColor="#6B5010"/>
          </linearGradient>
          <linearGradient id="borgCenter" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FDF8EE"/>
            <stop offset="100%" stopColor="#F0E6D0"/>
          </linearGradient>
        </defs>

        {/* 绶带 */}
        <g filter="url(#borgShine)">
          <path d="M35 0 L85 0 L80 30 L60 24 L40 30 Z" fill="url(#borgRibbon)"/>
          <path d="M35 0 L40 30 L20 35 L15 5 Z" fill="#6B5010" opacity="0.9"/>
          <path d="M85 0 L80 30 L100 35 L105 5 Z" fill="#6B5010" opacity="0.9"/>
          <path d="M38 0 L82 0 L78 25 L60 20 L42 25 Z" fill="white" opacity="0.15"/>
        </g>

        {/* 外圈 */}
        <g filter="url(#borgShine)">
          <circle cx={c} cy={c+12} r={48} fill="none" stroke="url(#borgRim)" strokeWidth="3"/>
          <circle cx={c} cy={c+12} r={44} fill="none" stroke="#8B6914" strokeWidth="0.5" opacity="0.5"/>
          <circle cx={c} cy={c+12} r={45} fill="none" stroke="white" strokeWidth="0.8" opacity="0.25"/>
        </g>

        {/* 内圈背景 */}
        <circle cx={c} cy={c+12} r={41} fill="url(#borgCenter)"/>
        <circle cx={c} cy={c+12} r={41} fill="url(#borgGold)" opacity="0.08"/>
        <circle cx={c} cy={c+12} r={38} fill="none" stroke="#8B6914" strokeWidth="0.3" opacity="0.2"/>

        {/* 迷宫图案 */}
        <g filter="url(#borgShine)">
          {[36, 29, 22, 15, 9].map((radius, i) => {
            const gapAngle = i % 2 === 0 ? -70 : 110
            const gapSize = 0.42 - i * 0.035
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
                stroke="url(#borgGold)"
                strokeWidth={i < 2 ? "2" : "1.5"}
                opacity={0.35 + i * 0.12}
                strokeLinecap="round"
              />
            )
          })}
        </g>

        {/* 迷宫入口小门 */}
        <g filter="url(#borgShine)">
          <line x1={c-6} y1={c+45} x2={c-6} y2={c+38} stroke="#8B6914" strokeWidth="1.5" opacity="0.6"/>
          <line x1={c-6} y1={c+45} x2={c-2} y2={c+45} stroke="#8B6914" strokeWidth="1.5" opacity="0.6"/>
        </g>

        {/* 中心 — 镜面 */}
        <g filter="url(#borgShine)">
          <circle cx={c} cy={c+12} r="8" fill="url(#borgGold)" opacity="0.2"/>
          <circle cx={c} cy={c+12} r="5" fill="url(#borgGold)" opacity="0.4"/>
          <circle cx={c} cy={c+12} r="2.5" fill="#8B6914" opacity="0.6"/>
          <circle cx={c} cy={c+12} r="1.2" fill="white" opacity="0.6"/>
        </g>

        {/* 标题横幅 */}
        <g filter="url(#borgShine)">
          <path d="M24 98 Q60 114 96 98 L93 114 Q60 128 27 114 Z" fill="url(#borgGold)"/>
          <path d="M27 100 Q60 112 93 100 L91 112 Q60 124 29 112 Z" fill="white" opacity="0.15"/>
          <text x={c} y={113} textAnchor="middle" fill="white" fontSize="10" fontWeight="800" letterSpacing="2">BORGES</text>
        </g>

        {/* 底部 */}
        <text x={c} y={133} textAnchor="middle" fill="#8B6914" fontSize="7" fontWeight="700" letterSpacing="2">EL JARDÍN</text>
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
