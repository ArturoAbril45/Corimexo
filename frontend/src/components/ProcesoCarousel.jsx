import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Ruler, Factory, Wrench, HeartHandshake } from 'lucide-react'

const SLIDES = [
  { key: 'diseno', icon: Ruler, titulo: 'Conceptualización y diseño', texto: 'Acompañamos cada proyecto desde la idea inicial, combinando funcionalidad, estética y precisión en cada detalle.' },
  { key: 'fabricacion', icon: Factory, titulo: 'Fabricación propia', texto: 'Infraestructura, tecnología y un equipo especializado que garantizan calidad y solidez en cada pieza que producimos.' },
  { key: 'instalacion', icon: Wrench, titulo: 'Instalación', texto: 'Materializamos proyectos de distintas escalas y niveles de complejidad, a nivel residencial, corporativo y comercial.' },
  { key: 'postventa', icon: HeartHandshake, titulo: 'Servicio postventa', texto: 'Construimos relaciones duraderas, acompañando a nuestros clientes también después de entregado el proyecto.' },
]

export default function ProcesoCarousel() {
  const [i, setI] = useState(0)
  const timer = useRef(null)

  useEffect(() => {
    timer.current = setInterval(() => setI(v => (v + 1) % SLIDES.length), 5000)
    return () => clearInterval(timer.current)
  }, [])

  function go(n) {
    clearInterval(timer.current)
    setI((n + SLIDES.length) % SLIDES.length)
    timer.current = setInterval(() => setI(v => (v + 1) % SLIDES.length), 5000)
  }

  return (
    <div className="cx-carousel">
      <button className="cx-carousel-arrow left" onClick={() => go(i - 1)} aria-label="Anterior"><ChevronLeft size={22} /></button>

      <div className="cx-carousel-stage">
        {SLIDES.map((s, idx) => (
          <div key={s.key} className={`cx-carousel-slide ${idx === i ? 'active' : ''}`}>
            <div className="cx-carousel-icon"><s.icon size={40} /></div>
            <h3>{s.titulo}</h3>
            <p>{s.texto}</p>
          </div>
        ))}
      </div>

      <button className="cx-carousel-arrow right" onClick={() => go(i + 1)} aria-label="Siguiente"><ChevronRight size={22} /></button>

      <div className="cx-carousel-thumbs">
        {SLIDES.map((s, idx) => (
          <button key={s.key} className={`cx-carousel-thumb ${idx === i ? 'active' : ''}`} onClick={() => go(idx)} aria-label={s.titulo}>
            <s.icon size={22} />
          </button>
        ))}
      </div>
    </div>
  )
}
