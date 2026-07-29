export default function BtnSwap({ label, actionLabel, icon, onClick, className = '' }) {
  return (
    <div className={`btn-swap-wrap ${className}`}>
      <button className="btn-swap-a">{label}</button>
      <button className="btn-swap-b" onClick={onClick}>
        {icon}
        {actionLabel}
      </button>
    </div>
  )
}
