export function FormWarmInput({ type = 'text', placeholder, value, onChange, className = '', as: Tag = 'input', rows }) {
  const Comp = Tag
  return <Comp type={Tag === 'textarea' ? undefined : type} placeholder={placeholder} value={value} onChange={onChange}
    className={`form-warm-input ${className}`} rows={rows} />
}

export function FormWarmBtn({ children, onClick, type = 'button', className = '' }) {
  return <button type={type} onClick={onClick} className={`form-warm-btn ${className}`}>{children}</button>
}

export default function FormWarm({ children, onSubmit, className = '' }) {
  return <form onSubmit={onSubmit} className={`form-warm ${className}`}>
    {children}
  </form>
}
