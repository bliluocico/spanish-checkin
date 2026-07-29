import { motion } from 'framer-motion'

export default function CervantesBadge({ size = 80, showText = true, animated = false }) {
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
          initial: { scale: 0, rotate: -180 },
          animate: { scale: 1, rotate: 0 },
          transition: { type: 'spring', damping: 12, stiffness: 200, duration: 0.8 }
        } : {})}
      >
        {/* 圆形外框 */}
        <circle
          cx={center} cy={center} r={r}
          fill="none"
          stroke="#4A6FA5"
          strokeWidth="2"
        />
        {/* 内圈 */}
        <circle
          cx={center} cy={center} r={r - 6}
          fill="none"
          stroke="#4A6FA5"
          strokeWidth="0.5"
          strokeDasharray="3 3"
        />

        {/* 羽毛笔 — 斜向左上 */}
        <g transform={`translate(${center - 6}, ${center + 2}) rotate(-35)`}>
          {/* 笔杆 */}
          <line x1="0" y1="12" x2="0" y2="-14" stroke="#4A6FA5" strokeWidth="1.5" strokeLinecap="round" />
          {/* 羽毛 */}
          <path
            d="M 0,-14 C -6,-12 -8,-6 -3,-2 C -2,-1 0,-1 0,1 C 0,-1 2,-1 3,-2 C 8,-6 6,-12 0,-14 Z"
            fill="#4A6FA5"
            opacity="0.6"
          />
          {/* 笔尖 */}
          <polygon points="0,12 -1.5,16 0,18 1.5,16" fill="#4A6FA5" opacity="0.8" />
        </g>

        {/* 剑 — 斜向右上 */}
        <g transform={`translate(${center + 6}, ${center + 2}) rotate(35)`}>
          {/* 剑身 */}
          <line x1="0" y1="10" x2="0" y2="-14" stroke="#4A6FA5" strokeWidth="2.5" strokeLinecap="round" />
          {/* 剑尖 */}
          <polygon points="0,-14 -2,-10 2,-10" fill="#4A6FA5" />
          {/* 护手 */}
          <line x1="-6" y1="6" x2="6" y2="6" stroke="#4A6FA5" strokeWidth="1.5" strokeLinecap="round" />
          {/* 剑柄 */}
          <line x1="0" y1="6" x2="0" y2="10" stroke="#4A6FA5" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* 交叉处小圆 */}
        <circle cx={center} cy={center + 2} r="3" fill="#4A6FA5" opacity="0.3" />

        {/* 顶部文字 */}
        <text
          x={center}
          y={r - 20}
          textAnchor="middle"
          fill="#4A6FA5"
          fontSize={s * 0.1}
          fontWeight="700"
          letterSpacing="3"
        >
          勒班陀
        </text>
      </Comp>

      {showText && (
        <div className="text-center">
          <p className="text-xs font-bold text-[#4A6FA5]">塞万提斯徽章</p>
          <p className="text-[10px] text-[#7A7A7A]">勒班陀的勇士</p>
        </div>
      )}
    </div>
  )
}
