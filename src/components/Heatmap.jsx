import { useMemo } from 'react'

// 日历热力图 — 最近 35 天
export default function Heatmap({ checkins, onPickDate }) {
  const { cells, weekStats } = useMemo(() => {
    // 每天打卡数统计
    const countMap = {}
    checkins.forEach(c => {
      if (!countMap[c.checkin_date]) countMap[c.checkin_date] = 0
      countMap[c.checkin_date]++
    })

    // 生成最近 35 天（含今天），按周分组（周一~周日）
    const cells = []
    const today = new Date()
    const start = new Date(today)
    start.setDate(start.getDate() - 34)

    // 对齐到周一
    const dayOfWeek = (start.getDay() + 6) % 7 // 周一=0
    start.setDate(start.getDate() - dayOfWeek)

    let week = []
    const weekStats = []
    let currentWeekDays = 0
    let currentWeekMins = 0

    const flushWeek = (weekEndDate) => {
      if (currentWeekDays > 0 || currentWeekMins > 0) {
        const weekStart = new Date(weekEndDate); weekStart.setDate(weekStart.getDate() - 6)
        weekStats.push({
          label: `${weekStart.getMonth()+1}/${weekStart.getDate()} - ${weekEndDate.getMonth()+1}/${weekEndDate.getDate()}`,
          days: currentWeekDays, mins: currentWeekMins,
        })
      }
      currentWeekDays = 0; currentWeekMins = 0
    }

    for (let i = 0; i < 35; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
      const count = countMap[dateStr] || 0
      const inRange = d <= today && d > new Date(today.getTime() - 35*86400000)

      week.push({ date: dateStr, count, inRange })

      // 周统计
      const isWeekEnd = (d.getDay() + 6) % 7 === 6
      if (count > 0) currentWeekDays++
      const dayMins = checkins.filter(c => c.checkin_date === dateStr).reduce((s, c) => s + (c.duration_minutes || 0), 0)
      currentWeekMins += dayMins

      if (isWeekEnd) flushWeek(d)

      // 每 7 天一组
      if (week.length === 7) { cells.push(week); week = [] }
    }
    // 最后一周（未到周日）也结算
    flushWeek(today)
    if (week.length > 0) cells.push(week)

    return { cells, weekStats }
  }, [checkins])

  const color = (count, inRange) => {
    if (!inRange) return 'transparent'
    if (count === 0) return '#EBE6DF'
    if (count === 1) return '#A8C6A0'
    if (count === 2) return '#5E9E63'
    return '#2E6B33'
  }

  const fmtMins = (m) => m >= 60 ? `${Math.floor(m/60)}时${m%60}分` : `${m}分`

  return (
    <div className="card mb-3" style={{ padding: '14px 16px' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold" style={{ color: 'var(--ink)' }}>📊 最近 35 天打卡</span>
        <div className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--ink-light)' }}>
          少<span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#EBE6DF', margin: '0 2px' }} />
          <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#A8C6A0', margin: '0 2px' }} />
          <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#5E9E63', margin: '0 2px' }} />
          <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#2E6B33', margin: '0 2px' }} />多
        </div>
      </div>

      <div className="flex gap-1.5">
        {cells.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map(cell => (
              <div key={cell.date}
                onClick={() => cell.inRange && cell.count > 0 && onPickDate?.(cell.date)}
                title={cell.inRange ? `${cell.date} · ${cell.count} 次` : ''}
                style={{
                  width: 14, height: 14, borderRadius: 3,
                  background: color(cell.count, cell.inRange),
                  cursor: cell.inRange && cell.count > 0 ? 'pointer' : 'default',
                  transition: 'transform 0.15s',
                }}
                onMouseEnter={e => { if (cell.inRange && cell.count > 0) e.currentTarget.style.transform = 'scale(1.3)' }}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              />
            ))}
          </div>
        ))}
      </div>

      {/* 周统计 */}
      {weekStats.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3 pt-2" style={{ borderTop: '1px solid var(--line)' }}>
          {weekStats.map((w, i) => (
            <span key={i} className="badge badge-gold text-[10px]">
              📅 {w.label} · {w.days}天 · {fmtMins(w.mins)}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
