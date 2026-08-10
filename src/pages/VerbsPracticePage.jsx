import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { RefreshCw, Trash2, BookOpen, Trophy } from 'lucide-react'
import { VERBS_DATA } from '../data/verbsData'
import { Seigaiha } from '../components/WafuuPatterns'
import {
  TENSE_NAMES, DIFFICULTY, DIFF_RANGE, loadWrongs, saveWrongs, loadStats, saveStats,
  pickQuestion, getConjugation, generateDistractors, bonusOf,
} from '../utils/verbsGame'

export default function VerbsPracticePage() {
  const navigate = useNavigate()

  const [stage, setStage] = useState('ready')        // ready / playing
  const [tense, setTense] = useState('all')
  const [difficulty, setDifficulty] = useState('normal')
  const [wrongMode, setWrongMode] = useState(false)
  const [q, setQ] = useState(null)                   // { verb, meaning, person, tenseKey, correct }
  const [opts, setOpts] = useState([])               // [{ text, status }]
  const [fb, setFb] = useState(null)                 // { type, text }
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [correctN, setCorrectN] = useState(0)
  const [qnum, setQnum] = useState(0)
  const [pct, setPct] = useState(100)
  const [waitNext, setWaitNext] = useState(false)
  const [speeds, setSpeeds] = useState([])
  const [best, setBest] = useState(loadStats)
  const [wrongs, setWrongs] = useState(loadWrongs)

  const ref = useRef({ limit: DIFFICULTY.normal, timeLeft: 0, start: 0, isAnswered: false, maxStreak: 0 })
  // 存最新的事件处理函数，供键盘监听（只绑定一次）读取
  const handlersRef = useRef()
  handlersRef.current = { handleAnswer, resetGame, newQuestion, stage, opts, waitNext }

  const accuracy = attempts > 0 ? Math.round((correctN / attempts) * 100) : 0
  const avgSpeed = speeds.length > 0 ? (speeds.reduce((a, b) => a + b, 0) / speeds.length) : 0

  // 抽新题
  function newQuestion() {
    const pick = pickQuestion(VERBS_DATA, tense, wrongMode, wrongs)
    if (!pick) {
      setQ(null)
      setFb({ type: 'info', text: wrongMode ? '🎉 错题都复习完啦！' : '该时态暂无可用的动词' })
      return
    }
    const correct = getConjugation(pick.verb, pick.tenseKey, pick.person)
    setQ({
      verb: pick.verb.infinitive,
      meaning: pick.verb.meaning || pick.verb.infinitive,
      person: pick.person,
      tenseKey: pick.tenseKey,
      correct,
    })
    setOpts(generateDistractors(correct, pick.verb, pick.tenseKey, pick.person).map(t => ({ text: t, status: 'idle' })))
    setFb(null)
    setWaitNext(false)
    setQnum(n => n + 1)
  }

  // 记录错题（去重计数）
  function addWrong() {
    if (!q) return
    const key = `${q.verb}|${q.tenseKey}|${q.person}`
    const list = [...wrongs]
    const found = list.find(w => `${w.infinitive}|${w.tense}|${w.person}` === key)
    if (found) found.count = (found.count || 1) + 1
    else list.push({ infinitive: q.verb, tense: q.tenseKey, person: q.person, correct: q.correct, count: 1 })
    const next = list.slice(0, 200)
    setWrongs(next)
    saveWrongs(next)
  }

  // 倒计时（每题开始时启动；waitNext 或未出题时停）
  useEffect(() => {
    if (stage !== 'playing' || !q || waitNext) return
    ref.current.isAnswered = false
    ref.current.timeLeft = ref.current.limit
    ref.current.start = Date.now()
    setPct(100)
    const timer = setInterval(() => {
      ref.current.timeLeft -= 0.05
      setPct(Math.max(0, (ref.current.timeLeft / ref.current.limit) * 100))
      if (ref.current.timeLeft <= 0) {
        clearInterval(timer)
        handleTimeout()
      }
    }, 50)
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, q, waitNext])

  function finishAnswer(ok, elapsed, selectedText) {
    setAttempts(a => a + 1)
    if (ok) {
      const bonus = bonusOf(elapsed)
      setCorrectN(c => c + 1)
      setStreak(s => { const ns = s + 1; ref.current.maxStreak = Math.max(ref.current.maxStreak, ns); return ns })
      setScore(sc => sc + 10 + bonus)
      setSpeeds(sp => [...sp, elapsed])
      if (streak >= 5) ref.current.limit = Math.max(DIFF_RANGE[difficulty][0], ref.current.limit - 0.1)
      setFb({ type: 'correct', text: `✅ 正确！ ${elapsed.toFixed(2)}秒${bonus > 0 ? ' ⚡+' + bonus : ''}` })
    } else {
      setStreak(0)
      ref.current.limit = Math.min(DIFF_RANGE[difficulty][1], ref.current.limit + 0.1)
      addWrong()
      setFb({ type: 'wrong', text: `❌ "${selectedText}" 不对，正确答案是 "${q.correct}"` })
    }
    setWaitNext(true)
  }

  function handleAnswer(i) {
    if (ref.current.isAnswered || waitNext || !q) return
    ref.current.isAnswered = true
    const elapsed = (Date.now() - ref.current.start) / 1000
    const ok = opts[i].text === q.correct
    setOpts(opts.map((b, j) => ({
      ...b,
      status: b.text === q.correct ? 'correct' : (j === i && !ok ? 'wrong' : 'dim'),
    })))
    finishAnswer(ok, elapsed, opts[i].text)
  }

  function handleTimeout() {
    if (ref.current.isAnswered || waitNext || !q) return
    ref.current.isAnswered = true
    addWrong()
    setStreak(0)
    setFb({ type: 'wrong', text: `⏰ 超时！正确答案是 "${q.correct}"` })
    setOpts(opts.map(b => (b.text === q.correct ? { ...b, status: 'correct' } : { ...b, status: 'dim' })))
    setWaitNext(true)
    setAttempts(a => a + 1)
  }

  // 结束一局：更新历史
  function saveSession() {
    const s = loadStats()
    s.bestScore = Math.max(s.bestScore, score)
    s.bestStreak = Math.max(s.bestStreak, ref.current.maxStreak)
    s.totalPlayed += attempts
    saveStats(s)
    setBest(s)
  }

  function resetGame(showReady) {
    saveSession()
    setScore(0); setStreak(0); setAttempts(0); setCorrectN(0); setQnum(0)
    setSpeeds([]); setOpts([]); setQ(null); setFb(null); setWaitNext(false)
    ref.current.limit = DIFFICULTY[difficulty] || 6
    ref.current.maxStreak = 0
    setPct(100)
    setStage(showReady ? 'ready' : 'playing')
  }

  // 开始
  function startGame() {
    setStage('playing')
    ref.current.limit = DIFFICULTY[difficulty] || 6
    newQuestion()
  }

  // 切时态 / 错题模式 → 重新开局
  useEffect(() => {
    if (stage !== 'playing') return
    setScore(0); setStreak(0); setAttempts(0); setCorrectN(0); setQnum(0); setSpeeds([])
    ref.current.maxStreak = 0
    ref.current.limit = DIFFICULTY[difficulty] || 6
    newQuestion()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tense, wrongMode])

  // 切难度 → 只更新限时
  useEffect(() => {
    ref.current.limit = DIFFICULTY[difficulty] || 6
  }, [difficulty])

  // 每答一题实时保存最高纪录，中途刷新也不丢
  useEffect(() => {
    if (score <= 0) return
    const s = loadStats()
    const ms = ref.current.maxStreak
    if (score > s.bestScore || ms > s.bestStreak) {
      s.bestScore = Math.max(s.bestScore, score)
      s.bestStreak = Math.max(s.bestStreak, ms)
      saveStats(s)
      setBest(s)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score])

  function toggleWrongMode() {
    if (!wrongMode && wrongs.length === 0) {
      alert('错题本是空的！答错后会自动记进来。')
      return
    }
    setWrongMode(w => !w)
  }

  function clearWrongs() {
    if (!confirm('确定清空所有错题吗？')) return
    saveWrongs([])
    setWrongs([])
    setWrongMode(false)
    resetGame(true)
  }

  // 键盘：1-4 答题 / R 重置 / N 下一题（只绑定一次；焦点在输入框时不响应，避免误答题）
  useEffect(() => {
    function onKey(e) {
      const t = e.target
      if (t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA')) return
      const h = handlersRef.current
      if (e.key >= '1' && e.key <= '4') {
        const idx = +e.key - 1
        if (h.stage === 'playing' && h.opts[idx] && h.opts[idx].status === 'idle') h.handleAnswer(idx)
      } else if (e.key === 'r' || e.key === 'R') {
        h.resetGame(true)
      } else if (e.key === 'n' || e.key === 'N') {
        if (h.waitNext) h.newQuestion()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ─────────── 渲染 ─────────── */

  if (stage === 'ready') {
    return (
      <div className="page bg-washi">
        <div className="header-bar">
          <Seigaiha size={28} color="var(--gold)" opacity={0.7} />
          <div className="flex-1">
            <h1 className="header-title font-playfair" style={{ fontSize: '1.1rem' }}>闪电反应</h1>
            <p className="header-sub">西语动词变位 · 限时抢答</p>
          </div>
        </div>

        <div className="card text-center mt-4 anim-up" style={{ padding: '40px 24px' }}>
          <div className="text-5xl mb-3">⚡</div>
          <h2 className="font-playfair text-xl font-extrabold mb-1">准备好了吗？</h2>
          <p className="text-sm" style={{ color: 'var(--ink-light)' }}>
            每题限时 <b style={{ color: 'var(--wine)' }}>{DIFFICULTY[difficulty] || 6}</b> 秒
            · 选对 10 分，越快加成越多
          </p>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="card" style={{ padding: '12px', boxShadow: 'none' }}>
              <p className="text-xs" style={{ color: 'var(--ink-light)' }}>🏆 历史最高</p>
              <p className="text-lg font-extrabold" style={{ color: 'var(--gold-dark)' }}>{best.bestScore} 分</p>
            </div>
            <div className="card" style={{ padding: '12px', boxShadow: 'none' }}>
              <p className="text-xs" style={{ color: 'var(--ink-light)' }}>🔥 最佳连击</p>
              <p className="text-lg font-extrabold" style={{ color: 'var(--gold-dark)' }}>{best.bestStreak}</p>
            </div>
          </div>

          <p className="text-xs mt-3" style={{ color: 'var(--sage)' }}>
            📚 累计已答 {best.totalPlayed} 题 · 📕 错题本 {wrongs.length} 条
          </p>

          <div className="flex flex-col gap-2 mt-5">
            <button className="btn btn-primary" style={{ width: '100%', padding: '14px' }} onClick={startGame}>
              开始 🚀
            </button>
            <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => navigate('/')}>
              <BookOpen size={16} /> 先去打卡
            </button>
          </div>
          <p className="text-[11px] mt-4" style={{ color: 'var(--ink-light)' }}>键盘：1-4 选答案 · R 重置 · N 下一题</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page bg-washi">
      <div className="header-bar">
        <Seigaiha size={28} color="var(--gold)" opacity={0.7} />
        <div className="flex-1">
          <h1 className="header-title font-playfair" style={{ fontSize: '1.1rem' }}>闪电反应</h1>
          <p className="header-sub">
            我 🔥{streak}连 · 错题本 📕 {wrongs.length}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {wrongMode && <span className="badge badge-wine">错题复习中</span>}
          <button className="btn btn-icon btn-ghost" onClick={() => navigate('/')} title="去打卡">
            <BookOpen size={18} />
          </button>
          <button className="btn btn-icon btn-ghost" onClick={() => resetGame(true)} title="重置(R)">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* 设置栏 */}
      <div className="flex flex-wrap gap-2 mt-3">
        <select className="input" style={{ flex: '1 1 140px', padding: '8px 10px', fontSize: '0.8rem' }} value={tense} onChange={e => setTense(e.target.value)}>
          <option value="all">🔄 混合模式</option>
          {Object.entries(TENSE_NAMES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select className="input" style={{ flex: '1 1 90px', padding: '8px 10px', fontSize: '0.8rem' }} value={difficulty} onChange={e => setDifficulty(e.target.value)}>
          <option value="easy">🐢 简单 12s</option>
          <option value="normal">⚡ 普通 6s</option>
          <option value="hard">🔥 困难 3s</option>
        </select>
        <button className={`btn btn-sm ${wrongMode ? 'btn-primary' : 'btn-outline'}`} onClick={toggleWrongMode}>
          📕 错题{wrongs.length > 0 ? ` ${wrongs.length}` : ''}
        </button>
        {wrongs.length > 0 && (
          <button className="btn btn-sm btn-danger" onClick={clearWrongs} title="清空错题">
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* 统计 */}
      <div className="grid grid-cols-4 gap-2 mt-3">
        {[
          { l: '⚡ 均速', v: avgSpeed > 0 ? avgSpeed.toFixed(2) + 's' : '--', c: 'var(--gold)' },
          { l: '🔥 连对', v: `${streak}`, c: 'var(--wine)' },
          { l: '🎯 正确率', v: `${accuracy}%`, c: 'var(--sage)' },
          { l: '📊 总分', v: `${score}`, c: 'var(--ink)' },
        ].map((s, i) => (
          <div key={i} className="card text-center" style={{ padding: '12px 4px', boxShadow: 'none' }}>
            <p className="text-[10px]" style={{ color: 'var(--ink-light)' }}>{s.l}</p>
            <p className="text-base font-extrabold" style={{ color: s.c }}>{s.v}</p>
          </div>
        ))}
      </div>

      {/* 计时条 */}
      <div className="mt-3" style={{ height: 3, background: 'var(--line)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: pct < 30 ? 'var(--wine)' : 'var(--gold)', transition: 'width 0.05s linear' }} />
      </div>

      {/* 题目 */}
      <div className="card mt-3 anim-up" style={{ borderLeft: '3px solid var(--gold)' }}>
        {!q ? (
          <div className="text-center py-6">
            <div className="text-3xl mb-2">🎉</div>
            <p className="text-sm font-bold">{fb?.text || '加载中...'}</p>
            {fb?.type === 'info' && <button className="btn btn-primary btn-sm mt-3" onClick={() => resetGame(true)}>重新开始</button>}
          </div>
        ) : (
          <>
            <div className="flex justify-between items-baseline pb-2" style={{ borderBottom: '1px solid var(--line)' }}>
              <span className="font-playfair text-2xl font-extrabold">{q.verb}</span>
              <span className="text-sm" style={{ color: 'var(--ink-light)' }}>{q.meaning}</span>
            </div>
            <div className="flex justify-center gap-4 py-2">
              <span className="text-xs" style={{ color: 'var(--ink-light)' }}>{TENSE_NAMES[q.tenseKey] || q.tenseKey}</span>
              <span className="text-sm font-bold" style={{ color: 'var(--gold-dark)' }}>{q.person}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 my-2">
              {opts.map((b, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={ref.current.isAnswered || waitNext}
                  className="btn"
                  style={{
                    fontSize: '0.95rem', padding: '14px 8px', justifyContent: 'center', flexWrap: 'wrap',
                    background: b.status === 'correct' ? 'var(--gold)' : 'var(--white)',
                    color: b.status === 'correct' ? '#fff' : 'var(--ink)',
                    border: `1.5px solid ${b.status === 'wrong' ? 'var(--wine)' : (b.status === 'correct' ? 'var(--gold)' : 'var(--line)')}`,
                    opacity: b.status === 'dim' ? 0.4 : 1,
                  }}
                >
                  {b.text}
                </button>
              ))}
            </div>

            {fb && (
              <div className="text-sm px-3 py-2 mt-1" style={{
                background: fb.type === 'correct' ? 'rgba(107,142,107,0.08)' : (fb.type === 'wrong' ? 'rgba(139,58,58,0.08)' : 'rgba(184,149,106,0.08)'),
                borderLeft: `3px solid ${fb.type === 'correct' ? 'var(--sage)' : (fb.type === 'wrong' ? 'var(--wine)' : 'var(--gold)')}`,
                borderRadius: 4,
              }}>{fb.text}</div>
            )}

            <div className="flex justify-between items-center mt-3" style={{ borderTop: '1px solid var(--line)', paddingTop: 12 }}>
              <span className="text-xs" style={{ color: 'var(--ink-light)' }}>第 {qnum} 题</span>
              {waitNext && (
                <button className="btn btn-primary btn-sm" onClick={newQuestion}>
                  下一题 ➜ <span className="text-[10px] opacity-70">(N)</span>
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <div className="flex justify-center mt-4">
        <button className="btn btn-outline" onClick={() => navigate('/')}>
          <Trophy size={16} /> 练完去打卡
        </button>
      </div>
    </div>
  )
}
