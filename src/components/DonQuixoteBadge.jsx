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
          {/* 金属光泽滤镜 */}
          <filter id="dqShine" x="-20%" y="-20%" width="140%" height="140%">
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
          <linearGradient id="dqBrown" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#B56A3A"/>
            <stop offset="50%" stopColor="#A0522D"/>
            <stop offset="100%" stopColor="#6B3410"/>
          </linearGradient>
          <linearGradient id="dqRim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C97E4E"/>
            <stop offset="50%" stopColor="#B56A3A"/>
            <stop offset="100%" stopColor="#A0522D"/>
          </linearGradient>
          <linearGradient id="dqRibbon" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#B56A3A"/>
            <stop offset="50%" stopColor="#A0522D"/>
            <stop offset="100%" stopColor="#7A3B1E"/>
          </linearGradient>
          <linearGradient id="dqCenter" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FDF5F0"/>
            <stop offset="100%" stopColor="#F0E0D0"/>
          </linearGradient>
        </defs>

        {/* 绶带 */}
        <g filter="url(#dqShine)">
          <path d="M35 0 L85 0 L80 30 L60 24 L40 30 Z" fill="url(#dqRibbon)"/>
          <path d="M35 0 L40 30 L20 35 L15 5 Z" fill="#7A3B1E" opacity="0.9"/>
          <path d="M85 0 L80 30 L100 35 L105 5 Z" fill="#7A3B1E" opacity="0.9"/>
          <path d="M38 0 L82 0 L78 25 L60 20 L42 25 Z" fill="white" opacity="0.15"/>
        </g>

        {/* 外圈 */}
        <g filter="url(#dqShine)">
          <circle cx={c} cy={c+12} r={48} fill="none" stroke="url(#dqRim)" strokeWidth="3"/>
          <circle cx={c} cy={c+12} r={44} fill="none" stroke="#A0522D" strokeWidth="0.5" opacity="0.5"/>
          <circle cx={c} cy={c+12} r={45} fill="none" stroke="white" strokeWidth="0.8" opacity="0.25"/>
        </g>

        {/* 内圈背景 */}
        <circle cx={c} cy={c+12} r={41} fill="url(#dqCenter)"/>
        <circle cx={c} cy={c+12} r={41} fill="#A0522D" opacity="0.06"/>
        <circle cx={c} cy={c+12} r={38} fill="none" stroke="#A0522D" strokeWidth="0.3" opacity="0.2"/>

        {/* 拉曼却荒野地平线 */}
        <g opacity="0.35">
          <path d="M18 60 Q35 52 55 57 Q75 62 95 53 Q105 50 102 60" fill="none" stroke="#A0522D" strokeWidth="0.8" opacity="0.4"/>
          <path d="M22 68 Q40 63 60 66 Q80 69 100 64" fill="none" stroke="#A0522D" strokeWidth="0.6" opacity="0.25"/>
        </g>

        {/* 风车 */}
        <g filter="url(#dqShine)">
          <g transform="translate(44, 66)">
            <path d="M -6 18 L -8 -8 L 8 -8 L 6 18 Z" fill="none" stroke="#A0522D" strokeWidth="1.5"/>
            <polygon points="-10,-8 0,-18 10,-8" fill="none" stroke="#A0522D" strokeWidth="1.5"/>
            <path d="M -3 18 L -3 8 Q 0 5 3 8 L 3 18" fill="none" stroke="#A0522D" strokeWidth="1" opacity="0.7"/>
            <circle cx="0" cy="-12" r="2.5" fill="none" stroke="#A0522D" strokeWidth="1.5"/>
            {[0, 45, 90, 135].map(angle => (
              <g key={angle} transform={`rotate(${angle})`}>
                <line x1="0" y1="-3" x2="0" y2="-18" stroke="#A0522D" strokeWidth="1.5" strokeLinecap="round"/>
                <rect x="-4" y="-25" width="8" height="10" rx="2" fill="none" stroke="#A0522D" strokeWidth="1.2" opacity="0.6"/>
                <line x1="0" y1="-18" x2="0" y2="-22" stroke="#A0522D" strokeWidth="0.5" opacity="0.3"/>
              </g>
            ))}
          </g>
        </g>

        {/* 折断的长矛 */}
        <g filter="url(#dqShine)">
          <g transform="translate(82, 82) rotate(50)">
            <line x1="0" y1="4" x2="-3" y2="-18" stroke="#A0522D" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="0" cy="4" r="2.2" fill="#A0522D" opacity="0.4"/>
            <line x1="3" y1="8" x2="5" y2="20" stroke="#A0522D" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
            <polygon points="-3,-18 -7,-24 0,-28 1,-24" fill="#A0522D" opacity="0.7"/>
            <line x1="-1" y1="-20" x2="-2" y2="-24" stroke="white" strokeWidth="0.5" opacity="0.4"/>
          </g>
        </g>

        {/* 标题横幅 */}
        <g filter="url(#dqShine)">
          <path d="M18 100 Q60 118 102 100 L99 116 Q60 130 21 116 Z" fill="url(#dqBrown)"/>
          <path d="M21 102 Q60 114 99 102 L97 114 Q60 126 23 114 Z" fill="white" opacity="0.15"/>
          <text x={c} y={115} textAnchor="middle" fill="white" fontSize="9" fontWeight="800" letterSpacing="2">风车仍在转动</text>
        </g>

        {/* 底部 */}
        <text x={c} y={133} textAnchor="middle" fill="#A0522D" fontSize="6.5" fontWeight="700" letterSpacing="2">DON QUIJOTE</text>
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
