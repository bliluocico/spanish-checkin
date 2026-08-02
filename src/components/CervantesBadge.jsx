import { motion } from 'framer-motion'

export default function CervantesBadge({ size = 100, showText = true, animated = false }) {
  const s = size
  const c = s / 2
  const Comp = animated ? motion.svg : 'svg'

  return (
    <div className="flex flex-col items-center gap-2">
      <Comp width={s} height={s} viewBox="0 0 120 140"
        {...(animated ? {
          initial: { scale: 0, rotate: -20 },
          animate: { scale: 1, rotate: 0 },
          transition: { type: 'spring', damping: 12, stiffness: 180 }
        } : {})}
      >
        <defs>
          {/* 金属光泽滤镜 */}
          <filter id="cervShine" x="-20%" y="-20%" width="140%" height="140%">
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
          <linearGradient id="cervGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5A7FB8"/>
            <stop offset="50%" stopColor="#4A6FA5"/>
            <stop offset="100%" stopColor="#2E4A6E"/>
          </linearGradient>
          <linearGradient id="cervRim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7FA3D4"/>
            <stop offset="50%" stopColor="#6B8FC9"/>
            <stop offset="100%" stopColor="#4A6FA5"/>
          </linearGradient>
          <linearGradient id="cervRibbon" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5A7FB8"/>
            <stop offset="50%" stopColor="#4A6FA5"/>
            <stop offset="100%" stopColor="#3A5A8C"/>
          </linearGradient>
          <linearGradient id="cervBanner" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C9A84C"/>
            <stop offset="50%" stopColor="#B8973E"/>
            <stop offset="100%" stopColor="#9A7F32"/>
          </linearGradient>
        </defs>

        {/* 绶带 */}
        <g filter="url(#cervShine)">
          <path d="M35 0 L85 0 L80 30 L60 24 L40 30 Z" fill="url(#cervRibbon)"/>
          <path d="M35 0 L40 30 L20 35 L15 5 Z" fill="#3A5A8C" opacity="0.9"/>
          <path d="M85 0 L80 30 L100 35 L105 5 Z" fill="#3A5A8C" opacity="0.9"/>
          {/* 绶带高光 */}
          <path d="M38 0 L82 0 L78 25 L60 20 L42 25 Z" fill="white" opacity="0.15"/>
        </g>

        {/* 外圈 */}
        <g filter="url(#cervShine)">
          <circle cx={c} cy={c+12} r={48} fill="none" stroke="url(#cervRim)" strokeWidth="3"/>
          <circle cx={c} cy={c+12} r={44} fill="none" stroke="#4A6FA5" strokeWidth="0.5" opacity="0.5"/>
          <circle cx={c} cy={c+12} r={45} fill="none" stroke="white" strokeWidth="0.8" opacity="0.25"/>
        </g>

        {/* 内圈背景 */}
        <circle cx={c} cy={c+12} r={41} fill="#F5F7FA"/>
        <circle cx={c} cy={c+12} r={41} fill="url(#cervGold)" opacity="0.12"/>
        <circle cx={c} cy={c+12} r={38} fill="none" stroke="#4A6FA5" strokeWidth="0.3" opacity="0.2"/>

        {/* 装饰性月桂叶 */}
        <g opacity="0.25">
          {[...Array(8)].map((_, i) => {
            const angle = (i * 45 - 90) * Math.PI / 180
            const r1 = 36
            const x1 = c + r1 * Math.cos(angle)
            const y1 = c + 12 + r1 * Math.sin(angle)
            return (
              <ellipse key={i} cx={x1} cy={y1} rx="4" ry="2" fill="#4A6FA5" transform={`rotate(${i * 45} ${x1} ${y1})`}/>
            )
          })}
        </g>

        {/* 交叉的笔与剑 */}
        <g filter="url(#cervShine)">
          {/* 羽毛笔 — 左上方向 */}
          <g transform="translate(52,78) rotate(-30)">
            <line x1="0" y1="16" x2="0" y2="-18" stroke="#2E4A6E" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M 0,-18 C -9,-14 -11,-6 -5,-1" fill="none" stroke="#4A6FA5" strokeWidth="2" strokeLinecap="round"/>
            <path d="M 0,-18 C 9,-14 11,-6 5,-1" fill="none" stroke="#4A6FA5" strokeWidth="2" strokeLinecap="round"/>
            <path d="M 0,-12 L -5,-8 M 0,-12 L 5,-8 M 0,-8 L -3,-5 M 0,-8 L 3,-5" stroke="#4A6FA5" strokeWidth="1" opacity="0.7"/>
            <polygon points="0,16 -2.5,24 0,28 2.5,24" fill="#2E4A6E"/>
            <circle cx="0" cy="30" r="1.5" fill="#2E4A6E" opacity="0.5"/>
          </g>

          {/* 剑 — 右上方向 */}
          <g transform="translate(68,78) rotate(30)">
            <polygon points="-2.5,12 -2.5,-18 0,-23 2.5,-18 2.5,12" fill="#4A6FA5" opacity="0.95"/>
            <line x1="0" y1="-18" x2="0" y2="12" stroke="#6B8FC9" strokeWidth="1" opacity="0.6"/>
            <path d="M -9 6 Q 0 4 9 6" fill="none" stroke="#C9A84C" strokeWidth="3.5" strokeLinecap="round"/>
            <line x1="0" y1="6" x2="0" y2="17" stroke="#C9A84C" strokeWidth="3" strokeLinecap="round"/>
            <circle cx="0" cy="18" r="3" fill="#C9A84C"/>
            <circle cx="0" cy="18" r="1.2" fill="#F0D060"/>
          </g>

          {/* 交叉中心点 — 金星 */}
          <circle cx={c} cy={c+14} r="6" fill="url(#cervBanner)"/>
          <circle cx={c} cy={c+14} r="3" fill="#F0D060"/>
          <circle cx={c} cy={c+14} r="1.5" fill="white" opacity="0.6"/>
        </g>

        {/* 标题横幅 */}
        <g filter="url(#cervShine)">
          <path d="M22 100 Q60 118 98 100 L95 116 Q60 130 25 116 Z" fill="url(#cervBanner)"/>
          <path d="M25 102 Q60 116 95 102 L93 114 Q60 126 27 114 Z" fill="white" opacity="0.15"/>
          <text x={c} y={115} textAnchor="middle" fill="white" fontSize="11" fontWeight="800" letterSpacing="2">LEPANTO</text>
        </g>

        {/* 底部 */}
        <text x={c} y={133} textAnchor="middle" fill="#4A6FA5" fontSize="7" fontWeight="700" letterSpacing="3">CERVANTES</text>
      </Comp>
      {showText && (
        <div className="text-center">
          <p className="text-sm font-extrabold text-[#4A6FA5]">塞万提斯徽章</p>
          <p className="text-[11px] text-[#8B7355]">勒班陀的勇士 · 胜者</p>
        </div>
      )}
    </div>
  )
}
