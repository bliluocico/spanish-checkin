export default function BtnBrutal({ icon, label, subLabel, onClick, className = '' }) {
  return (
    <button onClick={onClick} className={`btn-brutal ${className}`}>
      <div className="brutal-inner">
        <div className="brutal-icon">
          <span className="brutal-icon-text">{icon || '✷'}</span>
        </div>
        <div className="brutal-label">
          <span>{label || ''}</span>
          <span>{subLabel || ''}</span>
        </div>
      </div>
    </button>
  )
}
