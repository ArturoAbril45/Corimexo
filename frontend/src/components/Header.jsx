import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 8) }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`cx-header ${scrolled ? 'scrolled' : ''} ${open ? 'menu-open' : ''}`}>
      <div className="container cx-header-row">
        <Link to="/" className="cx-logo" onClick={() => setOpen(false)}>
          <img src="/assets/logo-negro.png" alt="Corimexo" />
        </Link>

        <nav className="cx-nav">
          <NavLink to="/" end onClick={() => setOpen(false)}>Inicio</NavLink>
          <NavLink to="/productos" onClick={() => setOpen(false)}>Productos</NavLink>
          <NavLink to="/nosotros" onClick={() => setOpen(false)}>Sobre Corimexo</NavLink>
        </nav>

        <div className="cx-header-actions">
          <button className="cx-nav-toggle" onClick={() => setOpen(o => !o)} aria-label="Menú">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>
  )
}
