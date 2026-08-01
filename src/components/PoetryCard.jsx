import { useState } from 'react'
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react'

export default function PoetryCard({ data }) {
  const [open, setOpen] = useState(true)
  const { poem, notes } = data

  if (!poem) return null

  const lines = poem.split('\n').filter(l => l.trim())
  const hasNotes = notes && Object.keys(notes).length > 0

  return (
    <div className="flex flex-col gap-2">
      {/* 折叠按钮 */}
      {hasNotes && (
        <button onClick={() => setOpen(!open)} className="btn btn-ghost btn-sm self-start text-xs flex items-center gap-1">
          <BookOpen size={12} />{open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {open ? '隐藏批注' : '查看批注'}
        </button>
      )}

      {/* 诗歌正文 */}
      <div className="rounded p-4" style={{ background: 'var(--parchment-deep)', border: '1px solid var(--line)' }}>
        {lines.map((line, i) => (
          <div key={i}>
            <p className="py-0.5" style={{ fontFamily: 'Georgia, "Noto Serif", serif', fontSize: '0.92rem', lineHeight: 2, color: 'var(--ink)', fontStyle: 'italic' }}>
              {line}
            </p>
            {open && notes[i] && (
              <p className="ml-4 mb-1 text-sm" style={{ color: 'var(--wine)', fontStyle: 'italic', borderLeft: '2px solid rgba(139,58,58,0.2)', paddingLeft: 10 }}>
                {notes[i]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
