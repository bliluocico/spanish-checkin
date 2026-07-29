export default function BtnGhost({ children, onClick, className = '', type = 'button' }) {
  return (
    <button type={type} onClick={onClick} className={`btn-ghost ${className}`}>
      {children}
    </button>
  )
}
