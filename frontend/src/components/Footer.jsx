import { Link } from 'react-router-dom'
import { MessageCircle, MapPin } from 'lucide-react'
import { SOCIALES } from './SocialIcons'

export default function Footer() {
  return (
    <footer className="cx-footer" id="contacto">
      <div className="container cx-footer-grid">
        <div className="cx-footer-brand">
          <img src="/assets/logo-negro.png" alt="Corimexo" />
          <p>Diseño, fabricación y desarrollo integral de mobiliario, para toda la vida. Industria boliviana.</p>
        </div>

        <div className="cx-footer-col">
          <h5>Navegación</h5>
          <Link to="/">Inicio</Link>
          <Link to="/productos">Productos</Link>
          <Link to="/nosotros">Sobre Corimexo</Link>
        </div>

        <div className="cx-footer-col">
          <h5>Contacto</h5>
          <a href="https://wa.me/59177033720" target="_blank" rel="noopener noreferrer"><MessageCircle size={14} /> (+591) 770 33 720</a>
          <span className="cx-footer-addr"><MapPin size={14} /> 4to. Anillo y Canal Cotoca (Parque Industrial, Mz. #5)</span>
        </div>

        <div className="cx-footer-col">
          <h5>Seguinos</h5>
          <div className="cx-footer-social">
            {SOCIALES.map(s => (
              <a key={s.key} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}><s.Icon size={17} /></a>
            ))}
          </div>
        </div>
      </div>

      <div className="container cx-footer-legal">
        <span>© {new Date().getFullYear()} SIDKAP. Todos los derechos reservados.</span>
        <span>Industria boliviana — 50 años de trayectoria</span>
      </div>
    </footer>
  )
}
