import { NavLink } from 'react-router-dom'
import { Home, User, Trophy } from 'lucide-react'

export default function Navbar() {
  const linkClass = ({ isActive }) =>
    `nav-tab ${isActive ? 'nav-tab-active' : ''}`

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-3 safe-bottom">
      <div className="nav-tabbar">
        <NavLink to="/" end className={linkClass}>
          <Home className="w-5 h-5" />
          <span className="nav-tab-label">首页</span>
        </NavLink>
        <NavLink to="/challenges" className={linkClass}>
          <Trophy className="w-5 h-5" />
          <span className="nav-tab-label">挑战</span>
        </NavLink>
        <NavLink to="/profile" className={linkClass}>
          <User className="w-5 h-5" />
          <span className="nav-tab-label">我的</span>
        </NavLink>
      </div>
    </nav>
  )
}
