export default function CardBrutal({ title, subtitle, banner, children, className = '', onClick }) {
  return (
    <div className={`card-brutal ${className}`} onClick={onClick}>
      {banner && <div className="card-brutal-banner">{banner}</div>}
      {title && <span className="card-brutal-title">{title}</span>}
      {subtitle && <p className="card-brutal-subtitle">{subtitle}</p>}
      {children}
    </div>
  )
}
