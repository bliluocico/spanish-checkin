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

    // 计算每天连续打卡天数（从今天往回数）
    const streakMap = {}
    const dateSet = new Set(Object.keys(countMap))
    const today = new Date()
    let cur = new Date(today); cur.setHours(0,0,0,0)
    const fd = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    let streak = 0
    // 今天没打卡则从昨天开始
    if (!dateSet.has(fd(cur))) cur.setDate(cur.getDate()-1)
    for (let i = 0; i < 35; i++) {
      const ds = fd(cur)
      if (dateSet.has(ds)) {
        streak++
        streakMap[ds] = streak
      } else {
        streak = 0
        if (i > 0) break // 连续断了就不再往前
      }
      cur.setDate(cur.getDate()-1)
    }

    // 生成最近 5 周（含今天所在周），按周分组（周一~周日）
    const cells = []
    const todayWk = (today.getDay() + 6) % 7 // 今天距周一几天
    const start = new Date(today)
    start.setDate(start.getDate() - todayWk - 28) // 今天所在周往前推 4 周整

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
      const inRange = d <= today && d >= new Date(today.getTime() - 34*86400000)

      week.push({ date: dateStr, count, inRange, streak: streakMap[dateStr] || 0 })

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

  // 按连续打卡天数分级（1/3/7/14 天）
  const color = (cell) => {
    if (!cell.inRange) return 'transparent'
    if (cell.count === 0) return '#F0EBE2'
    if (cell.streak >= 14) return '#B45309'
    if (cell.streak >= 7) return '#D97706'
    if (cell.streak >= 3) return '#F59E0B'
    return '#FCD34D'
  }

  const fmtMins = (m) => m >= 60 ? `${Math.floor(m/60)}时${m%60}分` : `${m}分`

  return (
    <div className="card mb-3" style={{ padding: '14px 16px' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold" style={{ color: 'var(--ink)' }}>📊 最近 35 天打卡</span>
        <div className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--ink-light)' }}>
          1天<span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#FCD34D', margin: '0 2px' }} />
          3天<span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#F59E0B', margin: '0 2px' }} />
          7天<span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#D97706', margin: '0 2px' }} />
          14天+<span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#B45309', margin: '0 2px' }} />
        </div>
      </div>

      <div className="flex gap-1.5">
        {cells.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map(cell => (
              <div key={cell.date}
                onClick={() => cell.inRange && cell.count > 0 && onPickDate?.(cell.date)}
                title={cell.inRange ? `${cell.date} · 连续 ${cell.streak} 天` : ''}
                style={{
                  width: 14, height: 14, borderRadius: 3,
                  background: color(cell),
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
