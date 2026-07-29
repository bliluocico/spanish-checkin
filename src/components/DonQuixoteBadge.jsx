import { motion } from 'framer-motion'

export default function DonQuixoteBadge({ size = 80, showText = true, animated = false }) {
  const s = size
  const center = s / 2
  const r = s / 2 - 3

  const Comp = animated ? motion.svg : 'svg'

  return (
    <div className="flex flex-col items-center gap-2">
      <Comp
        width={s}
        height={s}
        viewBox={`0 0 ${s} ${s}`}
        {...(animated ? {
          initial: { scale: 0, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          transition: { type: 'spring', damping: 10, stiffness: 120, duration: 0.8 }
        } : {})}
      >
        {/* 圆形外框 */}
        <circle
          cx={center} cy={center} r={r}
          fill="none"
          stroke="#A0522D"
          strokeWidth="2"
        />

        {/* 风车 — 四条辐条 + 叶片简笔画 */}
        <g transform={`translate(${center - 10}, ${center - 6})`}>
          {/* 中心轴 */}
          <circle cx="0" cy="0" r="3" fill="#A0522D" opacity="0.6" />
          {/* 四片风叶 */}
          {[0, 45, 90, 135].map((angle, i) => (
            <g key={i} transform={`rotate(${angle})`}>
              <line x1="0" y1="0" x2="0" y2="-14" stroke="#A0522D" strokeWidth="1.5" strokeLinecap="round" />
              <rect x="-3" y="-20" width="6" height="8" rx="1" fill="none" stroke="#A0522D" strokeWidth="1" opacity="0.7" />
            </g>
          ))}
          {/* 风车支架 */}
          <line x1="0" y1="3" x2="0" y2="16" stroke="#A0522D" strokeWidth="1.5" />
          <line x1="-6" y1="16" x2="6" y2="16" stroke="#A0522D" strokeWidth="1" />
        </g>

        {/* 折断的长矛 — 斜插右下方 */}
        <g transform={`translate(${center + 12}, ${center + 14}) rotate(55)`}>
          {/* 矛杆上半截 */}
          <line x1="0" y1="0" x2="0" y2="-16" stroke="#A0522D" strokeWidth="2" strokeLinecap="round" />
          {/* 矛杆下半截 — 错位表示断裂 */}
          <line x1="3" y1="2" x2="3" y2="10" stroke="#A0522D" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
          {/* 断裂处锯齿 */}
          <line x1="-1" y1="-1" x2="4" y2="1" stroke="#A0522D" strokeWidth="1" />
        </g>

        {/* 顶部文字 */}
        <text
          x={center}
          y={r - 18}
          textAnchor="middle"
          fill="#A0522D"
          fontSize={s * 0.1}
          fontWeight="700"
          letterSpacing="2"
        >
          风车仍在转动
        </text>

        {/* 底部文字 */}
        <text
          x={center}
          y={center + r - 16}
          textAnchor="middle"
          fill="#A0522D"
          fontSize={s * 0.09}
          fontWeight="600"
          letterSpacing="1"
        >
          D. QUIJOTE
        </text>
      </Comp>

      {showText && (
        <div className="text-center">
          <p className="text-xs font-bold" style={{ color: '#A0522D' }}>堂吉诃德徽章</p>
          <p className="text-[10px] text-[#8B7355]">风车骑士</p>
        </div>
      )}
    </div>
  )
}
