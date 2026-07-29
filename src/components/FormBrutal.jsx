export function FormBrutalTitle({ children, sub }) {
  return <div className="form-brutal-title">{children}<span>{sub}</span></div>
}

export function FormBrutalInput({ type = 'text', placeholder, value, onChange, className = '', ref }) {
  return <input ref={ref} type={type} placeholder={placeholder} value={value} onChange={onChange} className={`form-brutal-input ${className}`} />
}

export function FormBrutalBtn({ children, onClick, type = 'button', className = '', disabled }) {
  return <button type={type} onClick={onClick} disabled={disabled} className={`form-brutal-btn ${className}`}>{children}</button>
}

export function FormBrutalSep() {
  return <div className="form-brutal-sep"><div /><span>OR</span><div /></div>
}

export default function FormBrutal({ children, onSubmit, className = '' }) {
  return <form onSubmit={onSubmit} className={`form-brutal ${className}`}>{children}</form>
}
