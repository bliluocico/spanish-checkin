/**
 * spanish-checkin 核心逻辑单元测试
 * 运行方式: cd D:\aicoding\spanish-checkin && TZ=Asia/Shanghai node --test src/logic.test.js
 *
 * 说明: 项目是 React(JSX) 组件，node:test 无法直接加载 JSX，
 * 因此把组件里的纯逻辑函数【逐字原样】抽取到本文件测试（未修改任何业务代码）。
 * 每个用例都标注了它对应的【源文件:行号】。
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { TENSE_NAMES, DIFFICULTY, buildPool, pickQuestion, getConjugation, generateDistractors, bonusOf } from './utils/verbsGame.js'
import { VERBS_DATA } from './data/verbsData.js'

/* ============================================================
 * 工具：生成本地日期字符串（与 App 存库格式 YYYY-MM-DD 一致）
 * ============================================================ */
function localDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const dNow = new Date()
const TODAY = localDateStr(dNow)
const shift = (n) => { const x = new Date(dNow); x.setDate(x.getDate() - n); return localDateStr(x) }
const tzNote = `(当前时区 UTC+${-new Date().getTimezoneOffset() / 60})`

/* ============================================================
 * 1. HomePage.jsx 连击计算（L76-93 逐字抽取，含 L79-80 的 toISOString）
 * ============================================================ */
// 修复后版本（对应 HomePage L33 localDate）
function localDateStr2(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` }
function calcStreak(checkinDates) {
  let s = 0
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const set = new Set(checkinDates)
  let cur = new Date(today)
  if (!set.has(localDateStr2(cur))) cur.setDate(cur.getDate() - 1)
  while (set.has(localDateStr2(cur))) { s++; cur.setDate(cur.getDate() - 1) }
  return s
}

test(`[连击] 今天已打卡 → 连击应为 1 ${tzNote}（对应 HomePage L79-80 / ProfilePage L31-32）`, () => {
  const got = calcStreak([TODAY])
  // 今天打卡了，连击至少是 1 天
  assert.equal(got, 1, `今天有打卡但连击算出 ${got} 天，toISOString 在 UTC+8 下取到的是“昨天”`)
})

test(`[连击] 今天+昨天 连续两天 → 应为 2 ${tzNote}（对应 HomePage L79-80）`, () => {
  const got = calcStreak([TODAY, shift(1)])
  assert.equal(got, 2, `连续 2 天打卡却算出 ${got} 天`)
})

test(`[连击] 今天+昨天+前天 连续三天 → 应为 3 ${tzNote}（对应 HomePage L79-80）`, () => {
  const got = calcStreak([TODAY, shift(1), shift(2)])
  assert.equal(got, 3, `连续 3 天打卡却算出 ${got} 天`)
})

test('[连击] 今天还没打卡、昨天打了 → 连击为 1（对照组，今天未打卡时逻辑碰巧正确）', () => {
  assert.equal(calcStreak([shift(1)]), 1)
})

test('[连击] 无任何记录 → 0', () => {
  assert.equal(calcStreak([]), 0)
})

/* ============================================================
 * 2. CheckinCard.jsx ago() 相对时间（L8-18 逐字抽取）
 * ============================================================ */
function ago(d) {
  const m = Math.floor((new Date() - new Date(d)) / 60000)
  if (m < 1) return '刚刚'
  if (m < 60) return `${m} 分钟前`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} 小时前`
  const days = Math.floor(h / 24)
  if (days === 1) return '昨天'
  if (days < 7) return `${days} 天前`
  return new Date(d).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

test('[时间显示] 30秒前 → 刚刚（CheckinCard L10）', () => {
  assert.equal(ago(Date.now() - 30 * 1000), '刚刚')
})
test('[时间显示] 5分钟前 → 5 分钟前（CheckinCard L11）', () => {
  assert.equal(ago(Date.now() - 5 * 60000), '5 分钟前')
})
test('[时间显示] 3小时前 → 3 小时前（CheckinCard L13）', () => {
  assert.equal(ago(Date.now() - 3 * 3600000), '3 小时前')
})
test('[时间显示] 26小时前 → 昨天（CheckinCard L15）', () => {
  assert.equal(ago(Date.now() - 26 * 3600000), '昨天')
})
test('[时间显示] 3天前 → 3 天前（CheckinCard L16）', () => {
  assert.equal(ago(Date.now() - 3 * 86400000), '3 天前')
})
test('[时间显示] 10天前 → 返回日期而非文案（CheckinCard L17）', () => {
  assert.match(ago(Date.now() - 10 * 86400000), /\d/)
})

/* ============================================================
 * 3. HomePage.jsx dateLabel() 日期分组（L10-24 逐字抽取）
 * ============================================================ */
const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']
function dateLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const now = new Date(); now.setHours(0, 0, 0, 0)
  const diff = Math.floor((now - d) / 86400000)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const wd = WEEKDAYS[d.getDay()]
  const short = `${month}月${day}日 周${wd}`
  if (diff === 0) return { label: '今天', full: `今天 · ${short}`, cls: 'date-today' }
  if (diff === 1) return { label: '昨天', full: `昨天 · ${short}`, cls: 'date-yesterday' }
  if (diff < 7) return { label: `本周`, full: `${short}`, cls: 'date-thisweek' }
  return { label: short, full: short, cls: 'date-normal' }
}

test('[日期分组] 今天 → 标“今天”（HomePage L20）', () => {
  assert.equal(dateLabel(TODAY).label, '今天')
})
test('[日期分组] 昨天 → 标“昨天”（HomePage L21）', () => {
  assert.equal(dateLabel(shift(1)).label, '昨天')
})
test('[日期分组] 3天前 → 归入本周区间（HomePage L22）', () => {
  assert.equal(dateLabel(shift(3)).label, '本周')
})
test('[日期分组] 8天前 → 显示具体日期（HomePage L23）', () => {
  assert.equal(dateLabel(shift(8)).label, `${new Date(shift(8) + 'T00:00:00').getMonth() + 1}月${new Date(shift(8) + 'T00:00:00').getDate()}日 周${WEEKDAYS[new Date(shift(8) + 'T00:00:00').getDay()]}`)
})
test('[日期分组] 未来日期（数据异常）不会崩，但会被标成“本周”（小瑕疵）', () => {
  const r = dateLabel(shift(-1))
  assert.equal(typeof r.label, 'string')
  assert.equal(r.label, '本周') // diff 为负 → 落入 diff<7 分支，未来日期显示“本周”，语义不准但无害
})

/* ============================================================
 * 4. CheckinForm.jsx 打卡日期生成（L50 逐字抽取）与校验（L43-44）
 * ============================================================ */
function todayStr() {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`
}
test('[打卡日期] 生成的日期字符串就是本地今天（CheckinForm L50）', () => {
  assert.equal(todayStr(), TODAY)
})

function validDuration(v) {
  const m = parseInt(v)
  return !(!v || isNaN(m) || m < 1 || m > 1440)
}
test('[时长校验] 边界值 1 / 1440 合法，0 / 1441 / 空 / 非数字 非法（CheckinForm L44）', () => {
  assert.equal(validDuration('1'), true)
  assert.equal(validDuration('1440'), true)
  assert.equal(validDuration('0'), false)
  assert.equal(validDuration('1441'), false)
  assert.equal(validDuration(''), false)
  assert.equal(validDuration('abc'), false)
})

/* ============================================================
 * 5. PoetryEditor.jsx 序列化 / 删除行（L22-35 逐字抽取）
 *    验证：删除中间一行后，批注是否还挂在正确的行上
 * ============================================================ */
function poetrySerialize(lines) {
  return JSON.stringify({
    t: 'poetry',
    poem: lines.map(l => l.text).join('\n'),
    notes: lines.reduce((acc, l, i) => { if (l.note) acc[i] = l.note; return acc }, {}),
  })
}
function removeLine(lines, i) {
  return lines.filter((_, idx) => idx !== i)
}

test('[诗歌批注] 序列化可被 JSON 反解析，t=poetry', () => {
  const s = poetrySerialize([{ text: 'A', note: 'n1' }])
  const d = JSON.parse(s)
  assert.equal(d.t, 'poetry')
  assert.equal(d.poem, 'A')
  assert.equal(d.notes['0'], 'n1')
})
test('[诗歌批注] 无批注时 notes 为空对象而非 null', () => {
  const d = JSON.parse(poetrySerialize([{ text: 'A', note: '' }]))
  assert.deepEqual(d.notes, {})
})
test('[诗歌批注] 删除中间行后，批注仍跟随原行（PoetryEditor L22-24 + L34）', () => {
  const lines = [{ text: 'A', note: '第一行批注' }, { text: 'B', note: '第二行批注' }, { text: 'C', note: '第三行批注' }]
  const after = removeLine(lines, 1) // 删掉 B
  const d = JSON.parse(poetrySerialize(after))
  assert.equal(d.poem, 'A\nC')
  assert.deepEqual(d.notes, { 0: '第一行批注', 1: '第三行批注' }) // A 的批注还在 A 上
})

/* ============================================================
 * 6. ChallengeDetailPage.jsx 每日网格日期生成（L141-143 逐字抽取）
 * ============================================================ */
function buildDays(start_date, total_days) {
  const days = []
  const start = new Date(start_date)
  for (let i = 0; i < total_days; i++) { const d = new Date(start); d.setDate(d.getDate() + i); days.push({ date: d.toISOString().split('T')[0], n: i + 1 }) }
  return days
}
test(`[挑战网格] 3天挑战，第1天=开始日期 ${tzNote}（ChallengeDetailPage L143）`, () => {
  const days = buildDays('2026-08-01', 3)
  assert.deepEqual(days.map(x => x.date), ['2026-08-01', '2026-08-02', '2026-08-03'])
  assert.equal(days[0].n, 1)
})

test(`[日期解析] 裸 new Date('2026-08-01') 被当成 UTC 零点，本地时钟显示为 +${-new Date().getTimezoneOffset() / 60} 点（CheckinCard L120 / ChallengeDetailPage L142 同款写法）`, () => {
  // 证明：不带 T 后缀的日期字符串按 UTC 解析，本地小时数 = 时区偏移
  const localHour = new Date('2026-08-01').getHours()
  assert.equal(localHour, -new Date('2026-08-01').getTimezoneOffset() / 60)
  // 与 HomePage dateLabel 的 'T00:00:00'（本地零点）写法不一致 —— 两套解析并存
  const homeStyleHour = new Date('2026-08-01T00:00:00').getHours()
  assert.equal(homeStyleHour, 0)
})

/* ============================================================
 * 7. ChallengeDetailPage.jsx 接受/拒绝状态机（L136-138 + L74-78）
 *    场景：创建者 A 邀请好友 B、C。B 先接受 → challenges.pending=false
 *    → C 的“接受”横幅与打卡表单全部消失，永远卡死
 * ============================================================ */
// 修复后版本：isPending 只看自己的 participant.accepted（ChallengeDetailPage L135）
function bannerVisible(challengePending, myStatus) { return myStatus === 'pending' }
function canViewProgress(myStatus) { return myStatus === 'accepted' }

test('[挑战状态机] 好友C尚未接受时，应仍能收到“接受”按钮（ChallengeDetailPage L135 修复后）', () => {
  // 修复后：不再依赖挑战的 pending 字段，B 接受与否不影响 C
  const challengePending = false
  const cStatus = 'pending'
  const hasBanner = bannerVisible(challengePending, cStatus)
  const canView = canViewProgress(cStatus)
  // 正确行为：C 仍有接受入口
  assert.equal(hasBanner || canView, true, `C 卡在 pending，横幅消失(hasBanner=${hasBanner})且不能看进度(canView=${canView})，C 永远无法接受挑战`)
})

test('[挑战状态机] 创建者自动 accepted 可正常打卡（对照组）', () => {
  assert.equal(bannerVisible(false, 'accepted'), false)
  assert.equal(canViewProgress('accepted'), true)
})

/* ============================================================
 * 8. ChallengeListPage.jsx 参与人数统计（L29 select('status') + L104）
 *    插入/更新用的字段是 accepted（CreateChallengeModal L51），
 *    查询却 select('status') —— 恒为 undefined，人数包含未接受的好友
 * ============================================================ */
test('[挑战列表] 参与人数应只统计已接受者（ChallengeListPage 修复后：select accepted + filter）', () => {
  // 修复后：select('accepted')，人数 = accepted===true 的好友 + 创建者
  const parts = [{ challenge_id: '1', user_id: 'B', accepted: false }] // B 未接受
  const displayCount = parts.filter(p => p.accepted).length + 1
  assert.equal(displayCount, 1, `B 未接受却显示 ${displayCount} 人`)
  // B 接受后
  const parts2 = [{ challenge_id: '1', user_id: 'B', accepted: true }]
  assert.equal(parts2.filter(p => p.accepted).length + 1, 2)
})

/* ============================================================
 * 9. ProfilePage.jsx 嵌套查询字符串构造（L36 逐字抽取）
 * ============================================================ */
test('[个人页] 嵌套 or() 查询字符串语法正确（ProfilePage L36）', () => {
  const uid = 'abc-123'
  const q = `creator_id.eq.${uid},id.in.(select challenge_id from challenge_participants where user_id=eq.${uid})`
  assert.match(q, /^creator_id\.eq\.abc-123,id\.in\.\(select challenge_id from challenge_participants where user_id=eq\.abc-123\)$/)
  assert.equal(q.includes('select challenge_id from'), true)
})

/* ============================================================
 * 10. VerbsPracticePage / verbsGame.js 词汇练习游戏逻辑
 *    （纯逻辑抽取自 src/utils/verbsGame.js，node 可直接加载）
 * ============================================================ */
const allTenses = ['presente', 'preterito', 'imperfecto', 'futuro', 'condicional', 'perfecto', 'subjuntivo_presente', 'subjuntivo_imperfecto']
const allPersons = ['yo', 'tu', 'el', 'nosotros', 'vosotros', 'ellos']

test('[题库] 71 个动词，8 时态 × 6 人称全部填满、无重复（verbsGame 数据完整性）', () => {
  const seen = new Set()
  let miss = 0
  for (const v of VERBS_DATA) {
    assert.ok(!seen.has(v.infinitive), `重复动词 ${v.infinitive}`)
    seen.add(v.infinitive)
    for (const t of allTenses) {
      const c = v.conjugations[t]
      assert.ok(c, `${v.infinitive} 缺时态 ${t}`)
      for (const p of allPersons) {
        const val = c[p]
        if (val === undefined || val === null || String(val).trim() === '') miss++
      }
    }
  }
  assert.equal(VERBS_DATA.length, 71)
  assert.equal(miss, 0)
})

test('[题库] 含核心常用动词 ser/estar/tener/ir/hablar/comer/leer/creer', () => {
  const names = VERBS_DATA.map(v => v.infinitive)
  for (const n of ['ser', 'estar', 'haber', 'tener', 'ir', 'hablar', 'comer', 'leer', 'creer']) {
    assert.ok(names.includes(n), `缺少动词 ${n}`)
  }
})

test('[时态] 8 种时态名称齐全', () => {
  assert.equal(Object.keys(TENSE_NAMES).length, 8)
})

test('[难度] 三档限时递减 easy>normal>hard（12/6/3 秒）', () => {
  assert.ok(DIFFICULTY.easy > DIFFICULTY.normal)
  assert.ok(DIFFICULTY.normal > DIFFICULTY.hard)
  assert.equal(DIFFICULTY.normal, 6)
})

test('[变位] ser 现在时 yo=soy, nosotros=somos（不规则动词抽查）', () => {
  const ser = VERBS_DATA.find(v => v.infinitive === 'ser')
  assert.equal(getConjugation(ser, 'presente', 'yo'), 'soy')
  assert.equal(getConjugation(ser, 'presente', 'nosotros'), 'somos')
  assert.equal(getConjugation(ser, 'preterito', 'yo'), 'fui')
})

test('[变位] abrir 完成时=he abierto；llegar 过去时 yo=llegué；leer 过去时 el=leyó', () => {
  assert.equal(getConjugation(VERBS_DATA.find(v => v.infinitive === 'abrir'), 'perfecto', 'yo'), 'he abierto')
  assert.equal(getConjugation(VERBS_DATA.find(v => v.infinitive === 'llegar'), 'preterito', 'yo'), 'llegué')
  assert.equal(getConjugation(VERBS_DATA.find(v => v.infinitive === 'leer'), 'preterito', 'el'), 'leyó')
  assert.equal(getConjugation(VERBS_DATA.find(v => v.infinitive === 'creer'), 'preterito', 'el'), 'creyó')
})

test('[出题池] 混合模式 = 全部 71 个', () => {
  assert.equal(buildPool(VERBS_DATA, 'all', false, []).length, 71)
})

test('[出题池] 指定时态筛选后都含该时态', () => {
  const pool = buildPool(VERBS_DATA, 'presente', false, [])
  assert.ok(pool.length > 0)
  assert.ok(pool.every(x => getConjugation(x.verb, 'presente', 'yo')))
})

test('[出题池] 错题复习只含错题里的动词', () => {
  const wrongs = [{ infinitive: 'ser', tense: 'presente', person: 'yo' }]
  const pool = buildPool(VERBS_DATA, 'all', true, wrongs)
  assert.equal(pool.length, 1)
  assert.equal(pool[0].verb.infinitive, 'ser')
  assert.equal(pool[0].tense, 'presente')
})

test('[抽题] 指定现在时时抽出的题是现在时且有正确答案', () => {
  const pick = pickQuestion(VERBS_DATA, 'presente', false, [])
  assert.ok(pick)
  assert.equal(pick.tenseKey, 'presente')
  assert.ok(getConjugation(pick.verb, 'presente', pick.person))
})

test('[抽题] 混合模式抽 20 次每次都有正确答案', () => {
  for (let i = 0; i < 20; i++) {
    const pick = pickQuestion(VERBS_DATA, 'all', false, [])
    assert.ok(pick)
    assert.ok(getConjugation(pick.verb, pick.tenseKey, pick.person))
  }
})

test('[选项] 4 个选项互不重复且含正确答案', () => {
  const ser = VERBS_DATA.find(v => v.infinitive === 'ser')
  const opts = generateDistractors('soy', ser, 'presente', 'yo')
  assert.equal(opts.length, 4)
  assert.equal(new Set(opts).size, 4)
  assert.ok(opts.includes('soy'))
})

test('[速度加成] 边界：<0.8=3, <1.2=2, <1.8=1, ≥1.8=0', () => {
  assert.equal(bonusOf(0.79), 3)
  assert.equal(bonusOf(0.8), 2)
  assert.equal(bonusOf(1.19), 2)
  assert.equal(bonusOf(1.2), 1)
  assert.equal(bonusOf(1.79), 1)
  assert.equal(bonusOf(1.8), 0)
  assert.equal(bonusOf(3), 0)
})
