import { NavLink } from 'react-router-dom'
import { Home, User, Trophy } from 'lucide-react'

export default function Navbar() {
  const linkClass = ({ isActive }) =>
    `flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-all duration-200 ${
      isActive
        ? 'text-[#4A6FA5] bg-[#EBE8E5]'
        : 'text-[#A0A0A0] hover:text-[#7A7A7A]'
    }`

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-center safe-bottom">
      <div className="bg-white/80 backdrop-blur-xl border-t border-[#E5E0DA]/50 shadow-[0_-1px_8px_rgba(0,0,0,0.03)] rounded-t-3xl px-4 py-2 flex gap-2 max-w-[480px] w-full justify-center">
        <NavLink to="/" end className={linkClass}>
          <Home className="w-5 h-5" />
          <span className="text-[11px] font-bold">首页</span>
        </NavLink>
        <NavLink to="/challenges" className={linkClass}>
          <Trophy className="w-5 h-5" />
          <span className="text-[11px] font-bold">挑战</span>
        </NavLink>
        <NavLink to="/profile" className={linkClass}>
          <User className="w-5 h-5" />
          <span className="text-[11px] font-bold">我的</span>
        </NavLink>
      </div>
    </nav>
  )
}
