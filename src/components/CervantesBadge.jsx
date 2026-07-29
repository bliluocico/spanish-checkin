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
          <linearGradient id="cervGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4A6FA5"/>
            <stop offset="100%" stopColor="#2E4A6E"/>
          </linearGradient>
          <linearGradient id="cervRim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6B8FC9"/>
            <stop offset="100%" stopColor="#4A6FA5"/>
          </linearGradient>
        </defs>

        {/* 绶带 */}
        <path d="M35 0 L85 0 L80 30 L60 24 L40 30 Z" fill="#4A6FA5" opacity="0.9"/>
        <path d="M35 0 L40 30 L20 35 L15 5 Z" fill="#3A5A8C" opacity="0.7"/>
        <path d="M85 0 L80 30 L100 35 L105 5 Z" fill="#3A5A8C" opacity="0.7"/>

        {/* 外圈 */}
        <circle cx={c} cy={c+12} r={46} fill="none" stroke="url(#cervRim)" strokeWidth="3"/>
        <circle cx={c} cy={c+12} r={43} fill="none" stroke="#4A6FA5" strokeWidth="0.5" opacity="0.4"/>

        {/* 内圈背景 */}
        <circle cx={c} cy={c+12} r={40} fill="#EDF1F7" opacity="0.5"/>

        {/* 交叉的笔与剑 */}
        {/* 羽毛笔 — 左上方向 */}
        <g transform="translate(52,78) rotate(-30)">
          {/* 笔杆 */}
          <line x1="0" y1="16" x2="0" y2="-18" stroke="#2E4A6E" strokeWidth="2" strokeLinecap="round"/>
          {/* 羽毛细节 */}
          <path d="M 0,-18 C -8,-14 -10,-6 -4,-1" fill="none" stroke="#4A6FA5" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M 0,-18 C 8,-14 10,-6 4,-1" fill="none" stroke="#4A6FA5" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M 0,-12 L -5,-8 M 0,-12 L 5,-8 M 0,-8 L -3,-5 M 0,-8 L 3,-5" stroke="#4A6FA5" strokeWidth="0.8" opacity="0.6"/>
          {/* 笔尖 */}
          <polygon points="0,16 -2,23 0,27 2,23" fill="#2E4A6E"/>
          {/* 墨水点 */}
          <circle cx="0" cy="29" r="1.2" fill="#2E4A6E" opacity="0.5"/>
        </g>

        {/* 剑 — 右上方向 */}
        <g transform="translate(68,78) rotate(30)">
          {/* 剑身 */}
          <polygon points="-2,12 -2,-18 0,-22 2,-18 2,12" fill="#4A6FA5" opacity="0.9"/>
          <line x1="0" y1="-18" x2="0" y2="12" stroke="#6B8FC9" strokeWidth="0.8" opacity="0.5"/>
          {/* 护手 */}
          <path d="M -8 6 Q 0 4 8 6" fill="none" stroke="#C9A84C" strokeWidth="3" strokeLinecap="round"/>
          {/* 剑柄 */}
          <line x1="0" y1="6" x2="0" y2="16" stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round"/>
          <circle cx="0" cy="17" r="2.5" fill="#C9A84C"/>
        </g>

        {/* 交叉中心点 — 金星 */}
        <circle cx={c} cy={c+14} r="5" fill="#C9A84C" opacity="0.8"/>
        <circle cx={c} cy={c+14} r="2.5" fill="#F0D060"/>

        {/* 标题横幅 */}
        <path d="M25 100 Q60 115 95 100 L92 115 Q60 128 28 115 Z" fill="#4A6FA5"/>
        <text x={c} y={114} textAnchor="middle" fill="white" fontSize="11" fontWeight="800" letterSpacing="2">LEPANTO</text>

        {/* 底部 */}
        <text x={c} y={132} textAnchor="middle" fill="#4A6FA5" fontSize="7" fontWeight="700" letterSpacing="3">CERVANTES</text>
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
