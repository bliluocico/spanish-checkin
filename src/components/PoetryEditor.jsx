import { useState } from 'react'
import { Sparkles, ChevronDown, ChevronUp, X, Pen, BookOpen } from 'lucide-react'

export default function PoetryEditor({ onSubmit, loading }) {
  const [poemText, setPoemText] = useState('')
  const [lines, setLines] = useState([]) // [{text, note}]
  const [imported, setImported] = useState(false)
  const [notesOpen, setNotesOpen] = useState(true)
  const [error, setError] = useState('')

  const importPoem = () => {
    const raw = poemText.trim()
    if (!raw) { setError('请粘贴诗歌文本'); return }
    const parsed = raw.split('\n').filter(l => l.trim()).map(text => ({ text: text.trim(), note: '' }))
    setLines(parsed); setImported(true); setError('')
  }

  const updateNote = (i, val) => {
    const next = [...lines]; next[i] = { ...next[i], note: val }; setLines(next)
  }

  const removeLine = (i) => {
    setLines(lines.filter((_, idx) => idx !== i))
  }

  const resetPoem = () => { setPoemText(''); setLines([]); setImported(false) }

  const submit = (e) => {
    e.preventDefault()
    if (lines.length === 0) { setError('请先导入诗歌'); return }
    const data = JSON.stringify({
      t: 'poetry',
      poem: lines.map(l => l.text).join('\n'),
      notes: lines.reduce((acc, l, i) => { if (l.note) acc[i] = l.note; return acc }, {}),
    })
    onSubmit(data)
  }

  return (
    <div className="flex flex-col gap-4">
      {!imported ? (
        /* 导入诗歌 */
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm font-bold" style={{ color: 'var(--ink)' }}>
            <BookOpen size={16} style={{ color: 'var(--gold)' }} />导入诗歌文本
          </div>
          <textarea className="input font-serif" rows={8} value={poemText} onChange={e => setPoemText(e.target.value)}
            placeholder={`粘贴西语诗歌，每行一句：\n\nEn tanto que de rosa y azucena\nse muestra la color en vuestro gesto,\ny que vuestro mirar ardiente, honesto,\ncon clara luz la tempestad serena...`}
            style={{ fontFamily: 'Georgia, "Noto Serif", serif', fontSize: '0.95rem', lineHeight: 2, letterSpacing: '0.02em' }} />
          {error && <div className="text-xs" style={{ color: 'var(--wine)' }}>{error}</div>}
          <button onClick={importPoem} className="btn btn-primary btn-sm self-start">
            <Sparkles size={14} />导入并开始批注
          </button>
        </div>
      ) : (
        /* 批注模式 */
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold" style={{ color: 'var(--ink)' }}>
              <Pen size={16} style={{ color: 'var(--gold)' }} />逐行批注
            </div>
            <div className="flex gap-2">
              <button onClick={() => setNotesOpen(!notesOpen)} className="btn btn-ghost btn-sm text-xs">
                {notesOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {notesOpen ? '折叠批注' : '展开批注'}
              </button>
              <button onClick={resetPoem} className="btn btn-ghost btn-sm text-xs" style={{ color: 'var(--wine)' }}>
                <X size={14} />重导
              </button>
            </div>
          </div>

          {/* 诗歌正文 + 逐行批注 */}
          <div className="card" style={{ background: 'var(--parchment-deep)', border: '1px solid var(--line)' }}>
            {lines.map((line, i) => (
              <div key={i} className="py-2" style={{ borderBottom: i < lines.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
                {/* 诗歌行 */}
                <div className="flex items-start gap-2 group">
                  <span className="text-xs font-bold flex-shrink-0 mt-1" style={{ color: 'var(--ink-light)', width: 24, textAlign: 'right', fontFamily: 'Georgia, serif', opacity: 0.5 }}>{i + 1}</span>
                  <span className="flex-1" style={{ fontFamily: 'Georgia, "Noto Serif", serif', fontSize: '1rem', lineHeight: 1.8, color: 'var(--ink)', fontStyle: 'italic' }}>
                    {line.text}
                  </span>
                  <button onClick={() => removeLine(i)} className="btn btn-icon btn-ghost opacity-0 group-hover:opacity-100 flex-shrink-0"><X size={12} /></button>
                </div>
                {/* 批注行 */}
                {notesOpen && (
                  <div className="ml-8 mt-1 flex items-start gap-2">
                    <span className="flex-shrink-0 mt-1.5" style={{ color: 'var(--wine)', fontSize: '0.7rem' }}>✍️</span>
                    <input className="flex-1 text-sm border-0 outline-none bg-transparent py-1"
                      style={{ color: 'var(--wine)', fontStyle: 'italic', borderBottom: '1px dashed rgba(139,58,58,0.2)' }}
                      value={line.note} onChange={e => updateNote(i, e.target.value)}
                      placeholder="添加批注..." />
                  </div>
                )}
              </div>
            ))}
          </div>

          {error && <div className="text-xs" style={{ color: 'var(--wine)' }}>{error}</div>}

          <button onClick={submit} disabled={loading} className="btn btn-primary w-full">
            <Sparkles size={14} />{loading ? '提交中...' : '提交批注'}
          </button>
        </div>
      )}
    </div>
  )
}
