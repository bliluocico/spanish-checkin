export default function CardSplit({ name, sub, className = '' }) {
  return (
    <div className={`card-split ${className}`}>
      <div className="split-block split-top" />
      <div className="split-block split-bottom" />
      <div className="split-content">
        <span className="split-name">{name || 'User'}</span>
        <span className="split-sub">{sub || ''}</span>
      </div>
    </div>
  )
}
