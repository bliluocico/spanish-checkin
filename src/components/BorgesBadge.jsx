import { motion } from 'framer-motion'

export default function BorgesBadge({ size = 80, showText = true, animated = false }) {
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
          transition: { type: 'spring', damping: 10, stiffness: 150, duration: 0.8 }
        } : {})}
      >
        {/* 圆形外框 */}
        <circle
          cx={center} cy={center} r={r}
          fill="none"
          stroke="#8B6914"
          strokeWidth="2"
        />

        {/* 迷宫 — 简化同心圆 + 开口 */}
        {[r - 4, r - 10, r - 16, r - 22].map((cr, i) => {
          const gapAngle = i % 2 === 0 ? -90 : 90 // 交替开口方向
          const gapRad = gapAngle * Math.PI / 180
          const gapSize = 0.35 + i * 0.05
          const startAngle = gapRad - gapSize
          const endAngle = gapRad + gapSize

          const x1 = center + cr * Math.cos(startAngle)
          const y1 = center + cr * Math.sin(startAngle)
          const x2 = center + cr * Math.cos(endAngle)
          const y2 = center + cr * Math.sin(endAngle)

          // 用 path 画有缺口的圆弧
          const largeArc = 0
          const sweepFlag = 1

          return (
            <path
              key={i}
              d={`M ${x1} ${y1} A ${cr} ${cr} 0 ${largeArc} ${sweepFlag} ${x2} ${y2}`}
              fill="none"
              stroke="#8B6914"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity={0.6 + i * 0.1}
            />
          )
        })}

        {/* 中心小圆 */}
        <circle cx={center} cy={center} r="3" fill="#8B6914" opacity="0.4" />

        {/* 底部文字 */}
        <text
          x={center}
          y={center + r - 20}
          textAnchor="middle"
          fill="#8B6914"
          fontSize={s * 0.11}
          fontWeight="700"
          letterSpacing="2"
        >
          博尔赫斯
        </text>
      </Comp>

      {showText && (
        <div className="text-center">
          <p className="text-xs font-bold text-[#8B6914]">博尔赫斯徽章</p>
          <p className="text-[10px] text-[#7A7A7A]">迷宫中的同路人</p>
        </div>
      )}
    </div>
  )
}
