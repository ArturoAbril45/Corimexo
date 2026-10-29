import { useEffect, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { ChevronLeft, MessageCircle, Download } from 'lucide-react'
import Reveal from '../components/Reveal'
import { api } from '../lib/api'

export default function ProductoDetalle() {
  const { slug } = useParams()
  const [producto, setProducto] = useState(undefined) // undefined = cargando, null = no existe
  const [error, setError] = useState(false)
  const [activa, setActiva] = useState('imagen')

  useEffect(() => {
    setProducto(undefined); setActiva('imagen')
    api.getProducto(slug).then(setProducto).catch(() => setError(true))
  }, [slug])

  if (error) return <Navigate to="/productos" replace />
  if (producto === undefined) return <div className="section"><div className="container"><p className="cx-chat-empty">Cargando…</p></div></div>

  const mensajeWhatsapp = encodeURIComponent(`Hola, quisiera más información sobre el ${producto.nombre}.`)
  const fotos = [producto.imagen, producto.imagen2].filter(Boolean)

  return (
    <section className="section cx-prod-detalle">
      <div className="container">
        <Link to="/productos" className="cx-prod-back"><ChevronLeft size={15} /> Volver a productos</Link>

        <Reveal className="cx-prod-detalle-layout">
          <div>
            <div className="cx-prod-detalle-img">
              <img src={producto[activa] || producto.imagen} alt={producto.nombre} />
            </div>
            {fotos.length > 1 && (
              <div className="cx-prod-detalle-thumbs">
                {['imagen', 'imagen2'].map(k => producto[k] && (
                  <button key={k} type="button" className={activa === k ? 'active' : ''} onClick={() => setActiva(k)}>
                    <img src={producto[k]} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="cx-prod-detalle-info">
            <div className="cx-prod-detalle-badges">
              <span className="badge badge-outline">{producto.categoria}</span>
              {producto.material && <span className="badge badge-outline">{producto.material}</span>}
            </div>
            <h1>{producto.nombre}</h1>
            {producto.precio != null && <p className="cx-prod-detalle-precio">Bs. {Number(producto.precio).toFixed(2)}</p>}
            <p>
              {producto.descripcion || 'Fabricación propia con procesos industriales de alta tecnología, tapizado en cuero natural, sintético Courolyne Plus o tela según la línea. Garantía de hasta 3 años, dependiendo del modelo.'}
            </p>

            <div className="cx-prod-detalle-actions">
              <a className="btn btn-primary" href={`https://wa.me/59177033720?text=${mensajeWhatsapp}`} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={16} /> Consultar por WhatsApp
              </a>
              <a className="btn btn-outline" href="/assets/catalogo-2026.pdf" target="_blank" rel="noopener noreferrer">
                <Download size={16} /> Ver catálogo completo
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
