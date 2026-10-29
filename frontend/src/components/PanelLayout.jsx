import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutGrid, MessageCircle, LogOut, ChevronLeft, ChevronRight, ExternalLink, Package, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function PanelLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="cx-panel-shell">
      <aside className={`cx-panel-sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="cx-panel-sidebar-head">
          <div className="cx-panel-brand">
            <span>Panel</span>
          </div>
          <button onClick={() => setCollapsed(c => !c)} aria-label="Colapsar menú">
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        </div>

        <nav className="cx-panel-nav">
          <NavLink to="/panel" end><LayoutGrid size={16} /> <span>Resumen</span></NavLink>
          <NavLink to="/panel/productos"><Package size={16} /> <span>Productos</span></NavLink>
          <NavLink to="/panel/chat"><MessageCircle size={16} /> <span>Chat en vivo</span></NavLink>
          {user?.rol === 'admin' && (
            <NavLink to="/panel/usuarios"><Users size={16} /> <span>Usuarios</span></NavLink>
          )}
          <a href="/" target="_blank" rel="noopener noreferrer"><ExternalLink size={16} /> <span>Ver sitio público</span></a>
        </nav>

        <div className="cx-panel-sidebar-foot">
          {!collapsed && <div className="cx-panel-user">{user?.nombre}</div>}
          <button className="cx-panel-logout" onClick={handleLogout}><LogOut size={16} /> <span>Cerrar sesión</span></button>
        </div>
      </aside>

      <main className={`cx-panel-main ${collapsed ? 'collapsed' : ''}`}>
        <Outlet />
      </main>
    </div>
  )
}
