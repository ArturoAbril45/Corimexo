import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal'
import { api } from '../lib/api'

export default function Productos() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getProductos().then(setProductos).finally(() => setLoading(false))
  }, [])

  const categorias = [...new Set(productos.map(p => p.categoria))]

  return (
    <>
      <section className="cx-doc-header">
        <div className="container">
          <Reveal>
            <span className="badge badge-outline">Catálogo</span>
            <h1>Nuestros productos</h1>
            <p>Una muestra de nuestras líneas de mobiliario. Descargá el catálogo completo para ver el resto.</p>
          </Reveal>
        </div>
      </section>

      {loading ? (
        <div className="section"><div className="container"><p className="cx-chat-empty">Cargando productos…</p></div></div>
      ) : productos.length === 0 ? (
        <div className="section"><div className="container"><p className="cx-chat-empty">Todavía no hay productos cargados.</p></div></div>
      ) : (
        categorias.map((cat, ci) => (
          <section className={`section ${ci % 2 === 1 ? 'cx-section-alt' : ''}`} key={cat}>
            <div className="container">
              <Reveal className="cx-prod-cat-head">
                <h2>{cat}</h2>
              </Reveal>
              <div className="cx-prod-grid">
                {productos.filter(p => p.categoria === cat).map((p, i) => (
                  <Reveal key={p.slug} delay={i * 70} as="div">
                    <Link to={`/productos/${p.slug}`} className="cx-prod-card">
                      <div className="cx-prod-card-img">
                        <img src={p.imagen} alt={p.nombre} loading="lazy" />
                        {!!Number(p.destacado) && <span className="cx-prod-card-destacado">Destacado</span>}
                      </div>
                      <span className="cx-prod-card-name">{p.nombre}</span>
                      {p.precio != null && <span className="cx-prod-card-precio">Bs. {Number(p.precio).toFixed(2)}</span>}
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        ))
      )}
    </>
  )
}
