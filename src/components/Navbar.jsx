import { NavLink } from 'react-router-dom'
import { Home, User, Trophy } from 'lucide-react'

export default function Navbar() {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <NavLink to="/" end className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <Home /><span>首页</span>
        </NavLink>
        <NavLink to="/challenges" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <Trophy /><span>挑战</span>
        </NavLink>
        <NavLink to="/profile" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <User /><span>我的</span>
        </NavLink>
      </div>
    </nav>
  )
}
