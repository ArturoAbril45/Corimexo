import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, ArrowUpRight, ShieldCheck, Award, Users } from 'lucide-react'
import Reveal from '../components/Reveal'
import ProcesoCarousel from '../components/ProcesoCarousel'
import { api } from '../lib/api'

const CAPACIDADES = [
  { titulo: 'Residencial', img: '/assets/catalogo/hero-residencial.jpg' },
  { titulo: 'Corporativo', img: '/assets/catalogo/hero-corporativo.jpg' },
  { titulo: 'Comercial', img: '/assets/catalogo/hero-comercial.jpg' },
]

const STATS = [
  { icon: Award, num: '50', label: 'años de trayectoria' },
  { icon: Users, num: '+100', label: 'proyectos a nivel nacional' },
  { icon: ShieldCheck, num: '100%', label: 'fabricación propia' },
]

export default function Home() {
  const [destacados, setDestacados] = useState([])

  useEffect(() => {
    api.getProductos().then(list => setDestacados(list.filter(p => Number(p.destacado))))
  }, [])

  return (
    <>
      {/* HERO dividido: texto + collage de 3 categorías */}
      <section className="cx-hero">
        <div className="cx-hero-text">
          <span className="cx-eyebrow">Industria boliviana · 50 años</span>
          <h1>Diseñamos y fabricamos mobiliario que define espacios.</h1>
          <p className="cx-hero-lead">
            Empresa boliviana especializada en el diseño, fabricación y desarrollo integral
            de mobiliario, con la solidez y experiencia para materializar proyectos de
            distintas escalas y niveles de complejidad.
          </p>
          <div className="cx-hero-actions">
            <a className="btn btn-primary" href="/assets/catalogo-2026.pdf" target="_blank" rel="noopener noreferrer">
              Descargar catálogo 2026 <Download size={16} />
            </a>
            <Link className="btn btn-outline" to="/nosotros">Sobre Corimexo</Link>
          </div>
        </div>

        <div className="cx-hero-collage">
          {CAPACIDADES.map(c => (
            <div key={c.titulo} className="cx-hero-tile" style={{ backgroundImage: `url(${c.img})` }}>
              <span>{c.titulo}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Franja de estadísticas */}
      <section className="cx-stats-strip">
        <div className="container cx-stats-row">
          {STATS.map(s => (
            <div className="cx-stat" key={s.label}>
              <s.icon size={20} />
              <div>
                <strong>{s.num}</strong>
                <span>{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Carrusel del proceso */}
      <section className="section">
        <div className="container">
          <Reveal className="section-title-row">
            <h2>Te acompañamos en cada etapa</h2>
          </Reveal>
          <Reveal delay={80}><ProcesoCarousel /></Reveal>
        </div>
      </section>

      {/* Productos destacados */}
      {destacados.length > 0 && (
        <section className="section cx-section-alt">
          <div className="container">
            <Reveal className="section-title-row">
              <h2>Productos destacados</h2>
              <Link to="/productos">Ver todo el catálogo <ArrowUpRight size={14} /></Link>
            </Reveal>
            <div className="cx-prod-grid">
              {destacados.map((p, i) => (
                <Reveal key={p.slug} delay={i * 70} as="div">
                  <Link to={`/productos/${p.slug}`} className="cx-prod-card">
                    <div className="cx-prod-card-img">
                      <img src={p.imagen} alt={p.nombre} loading="lazy" />
                      <span className="cx-prod-card-destacado">Destacado</span>
                    </div>
                    <span className="cx-prod-card-name">{p.nombre}</span>
                    {p.precio != null && <span className="cx-prod-card-precio">Bs. {Number(p.precio).toFixed(2)}</span>}
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Teaser Sobre Corimexo */}
      <section className="section">
        <div className="container cx-about-teaser">
          <Reveal className="cx-about-teaser-text">
            <span className="cx-eyebrow">Quiénes somos</span>
            <h2>Un aliado estratégico para proyectos que exigen calidad y confianza.</h2>
            <p>
              Contamos con infraestructura, tecnología y un equipo especializado que nos
              permiten desarrollar soluciones a medida, acompañando a nuestros clientes desde
              la conceptualización hasta el servicio postventa.
            </p>
            <Link className="btn btn-outline" to="/nosotros">Conocer más sobre Corimexo</Link>
          </Reveal>
        </div>
      </section>

      {/* CTA banners */}
      <section className="section cx-cta-section">
        <div className="container cx-cta-grid">
          <Reveal className="cx-cta-banner cx-cta-primary">
            <a href="/assets/catalogo-2026.pdf" target="_blank" rel="noopener noreferrer" className="cx-cta-link">
              <div>
                <h3>Catálogo 2026</h3>
                <p>Descargá el catálogo completo con nuestras soluciones de mobiliario.</p>
              </div>
              <Download size={22} />
            </a>
          </Reveal>
          <Reveal delay={90} className="cx-cta-banner cx-cta-secondary">
            <a href="#contacto" className="cx-cta-link">
              <div>
                <h3>Hablemos de tu proyecto</h3>
                <p>Contanos qué necesitás y te asesoramos en cada etapa.</p>
              </div>
              <ArrowUpRight size={22} />
            </a>
          </Reveal>
        </div>
      </section>
    </>
  )
}
