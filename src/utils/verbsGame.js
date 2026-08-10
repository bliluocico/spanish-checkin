import { VERBS_DATA } from '../data/verbsData.js'

/* ══════════════════════════════════════
   西语动词变位练习 · 纯逻辑
   （不含 React，可被 node --test 直接测试）
   ══════════════════════════════════════ */

export const TENSE_NAMES = {
  presente: '现在时',
  preterito: '简单过去时',
  futuro: '将来时',
  subjuntivo_presente: '虚拟式现在时',
  subjuntivo_imperfecto: '虚拟式过去未完成时',
  condicional: '条件式',
  imperfecto: '过去未完成时',
  perfecto: '现在完成时',
}

// 三档限时（秒）：时间越长越简单
export const DIFFICULTY = { easy: 12, normal: 6, hard: 3 }
// 自适应浮动范围 [下限, 起始/上限]
export const DIFF_RANGE = { easy: [3, 12], normal: [2, 6], hard: [1, 3] }
export const PERSONS = ['yo', 'tu', 'el', 'nosotros', 'vosotros', 'ellos']

const LS_WRONG = 'svp_wrongs'
const LS_STATS = 'svp_stats'

function readLS(key, fb) {
  try { const v = JSON.parse(localStorage.getItem(key)); return v ?? fb } catch { return fb }
}
function writeLS(key, v) {
  try { localStorage.setItem(key, JSON.stringify(v)) } catch { /* 存储不可用时静默 */ }
}

export function loadWrongs() { return readLS(LS_WRONG, []) }
export function saveWrongs(list) { writeLS(LS_WRONG, list.slice(0, 200)) }
export function loadStats() {
  const s = readLS(LS_STATS, {})
  return { bestScore: s.bestScore || 0, bestStreak: s.bestStreak || 0, totalPlayed: s.totalPlayed || 0 }
}
export function saveStats(s) { writeLS(LS_STATS, s) }

export function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function getConjugation(verb, tense, person) {
  const c = verb.conjugations?.[tense]
  return c ? (c[person] || null) : null
}

// 构建题目池：正常模式=全部（按时态筛）；错题复习=错题元组列表
export function buildPool(verbs, tense, wrongMode, wrongs) {
  if (wrongMode) {
    const items = []
    ;(wrongs || []).forEach(w => {
      const v = verbs.find(x => x.infinitive === w.infinitive)
      if (v && v.conjugations[w.tense] && v.conjugations[w.tense][w.person]) {
        items.push({ verb: v, tense: w.tense, person: w.person })
      }
    })
    return items
  }
  let avail = verbs
  if (tense !== 'all') avail = verbs.filter(v => getConjugation(v, tense, 'yo'))
  return avail.map(v => ({ verb: v, tense: tense === 'all' ? null : tense, person: null }))
}

// 抽一题：返回 { verb, person, tenseKey }
export function pickQuestion(verbs, tense, wrongMode, wrongs) {
  const pool = buildPool(verbs, tense, wrongMode, wrongs)
  if (pool.length === 0) return null
  if (wrongMode) return pool[Math.floor(Math.random() * pool.length)]
  const p = pool[Math.floor(Math.random() * pool.length)]
  const verb = p.verb
  const person = PERSONS[Math.floor(Math.random() * PERSONS.length)]
  let t = tense
  if (t === 'all') {
    const ts = Object.keys(verb.conjugations).filter(k => getConjugation(verb, k, person))
    if (ts.length === 0) return null
    t = ts[Math.floor(Math.random() * ts.length)]
  }
  return { verb, person, tenseKey: t }
}

// 生成 4 个选项（1 正确 + 3 干扰项）
export function generateDistractors(correct, verb, tense, person) {
  const d = new Set()
  const cj = verb.conjugations
  // 策略1：同动词其他时态（同人称）
  for (const t of shuffleArray(Object.keys(cj).filter(x => x !== tense))) {
    const v = cj[t]?.[person]
    if (v && v !== correct && v !== '???') d.add(v)
    if (d.size >= 3) break
  }
  // 策略2：同动词其他人称（同时态）
  if (d.size < 3 && cj[tense]) {
    for (const p of shuffleArray(PERSONS.filter(x => x !== person))) {
      const v = cj[tense][p]
      if (v && v !== correct && v !== '???') d.add(v)
      if (d.size >= 3) break
    }
  }
  // 策略3：其他动词（保底）
  if (d.size < 3) {
    for (const v of shuffleArray(VERBS_DATA)) {
      if (v.infinitive === verb.infinitive) continue
      const c = getConjugation(v, tense, person)
      if (c && c !== correct && c !== '???') { d.add(c); if (d.size >= 3) break }
    }
  }
  let r = [...d]
  while (r.length < 3) r.push('???')
  r = r.slice(0, 3).concat(correct)
  return shuffleArray(r)
}

// 速度加成：<0.8s +3 / <1.2s +2 / <1.8s +1
export function bonusOf(elapsed) {
  if (elapsed < 0.8) return 3
  if (elapsed < 1.2) return 2
  if (elapsed < 1.8) return 1
  return 0
}
