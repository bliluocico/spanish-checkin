export default function CardGlow({ children, className = '', onClick }) {
  return (
    <div className={`card-glow ${className}`} onClick={onClick}>
      <div className="card-glow-spot" />
      <div className="card-glow-inner">
        {children}
      </div>
    </div>
  )
}
