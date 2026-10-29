import { useState, useEffect, useRef } from 'react'
import { Plus, Pencil, Trash2, X, Image as ImageIcon, EyeOff, Star } from 'lucide-react'
import { api } from '../../lib/api'

const emptyForm = { id: null, nombre: '', categoria: '', precio: '', material: '', descripcion: '', visible: 1, destacado: 0 }
const emptySlot = { file: null, preview: '' }

export default function Productos() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [img1, setImg1] = useState(emptySlot)
  const [img2, setImg2] = useState(emptySlot)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef1 = useRef(null)
  const fileRef2 = useRef(null)

  function cargar() {
    setLoading(true)
    api.getProductos({ todos: 1 }).then(setProductos).finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [])

  const categorias = [...new Set(productos.map(p => p.categoria))]

  function abrirCrear() {
    setForm(emptyForm); setImg1(emptySlot); setImg2(emptySlot); setError(''); setModal(true)
  }

  function abrirEditar(p) {
    setForm({
      id: p.id, nombre: p.nombre, categoria: p.categoria,
      precio: p.precio != null ? String(p.precio) : '', material: p.material || '',
      descripcion: p.descripcion || '', visible: p.visible, destacado: p.destacado,
    })
    setImg1({ file: null, preview: p.imagen || '' })
    setImg2({ file: null, preview: p.imagen2 || '' })
    setError(''); setModal(true)
  }

  function set(k, v) { setForm(prev => ({ ...prev, [k]: v })) }

  function onImagenChange(setSlot, e) {
    const file = e.target.files?.[0]
    if (!file) return
    setSlot({ file, preview: URL.createObjectURL(file) })
  }

  async function guardar(e) {
    e.preventDefault()
    if (!form.nombre.trim() || !form.categoria.trim()) { setError('Nombre y categoría son obligatorios'); return }
    setSaving(true); setError('')
    try {
      const fd = new FormData()
      fd.append('nombre', form.nombre.trim())
      fd.append('categoria', form.categoria.trim())
      fd.append('precio', form.precio)
      fd.append('material', form.material.trim())
      fd.append('descripcion', form.descripcion.trim())
      fd.append('visible', form.visible ? 1 : 0)
      fd.append('destacado', form.destacado ? 1 : 0)
      if (img1.file) fd.append('imagen', img1.file)
      if (img2.file) fd.append('imagen2', img2.file)

      if (form.id) await api.editarProducto(form.id, fd)
      else await api.crearProducto(fd)

      setModal(false)
      cargar()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function eliminar(p) {
    if (!confirm(`¿Eliminar "${p.nombre}"? Esta acción no se puede deshacer.`)) return
    try {
      await api.eliminarProducto(p.id)
      cargar()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="cx-panel-page">
      <div className="cx-panel-topbar">
        <div>
          <h1>Productos</h1>
          <p>Gestioná el catálogo que se muestra en el sitio público.</p>
        </div>
        <button className="btn btn-primary" onClick={abrirCrear}><Plus size={16} /> Nuevo producto</button>
      </div>

      {loading ? (
        <p className="cx-chat-empty">Cargando…</p>
      ) : productos.length === 0 ? (
        <p className="cx-chat-empty">Todavía no hay productos. Creá el primero.</p>
      ) : (
        <div className="cx-prodadmin-grid">
          {productos.map(p => (
            <div key={p.id} className={`cx-prodadmin-card ${!Number(p.visible) ? 'oculto' : ''}`}>
              <div className="cx-prodadmin-img">
                {p.imagen ? <img src={p.imagen} alt={p.nombre} /> : <ImageIcon size={22} />}
                {!Number(p.visible) && <span className="cx-prodadmin-badge-oculto"><EyeOff size={11} /> Oculto</span>}
                {!!Number(p.destacado) && <span className="cx-prodadmin-badge-destacado"><Star size={11} fill="currentColor" /> Destacado</span>}
              </div>
              <div className="cx-prodadmin-body">
                <span className="cat">{p.categoria}</span>
                <span className="nombre">{p.nombre}</span>
                {p.precio != null && <span className="precio">Bs. {Number(p.precio).toFixed(2)}</span>}
              </div>
              <div className="cx-prodadmin-actions">
                <button onClick={() => abrirEditar(p)} aria-label="Editar"><Pencil size={14} /></button>
                <button onClick={() => eliminar(p)} className="danger" aria-label="Eliminar"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="cx-modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="cx-modal">
            <div className="cx-modal-head">
              <h2>{form.id ? 'Editar producto' : 'Nuevo producto'}</h2>
              <button onClick={() => setModal(false)} aria-label="Cerrar"><X size={18} /></button>
            </div>

            <form className="cx-modal-form" onSubmit={guardar} autoComplete="off">
              <div className="cx-modal-fields">
                <label className="cx-auth-label">Fotos (hasta 2)</label>
                <div className="cx-prodadmin-upload-row">
                  <div className="cx-prodadmin-upload" onClick={() => fileRef1.current?.click()}>
                    {img1.preview ? <img src={img1.preview} alt="" /> : <span><ImageIcon size={20} /> Foto 1</span>}
                  </div>
                  <div className="cx-prodadmin-upload" onClick={() => fileRef2.current?.click()}>
                    {img2.preview ? <img src={img2.preview} alt="" /> : <span><ImageIcon size={20} /> Foto 2</span>}
                  </div>
                </div>
                <input ref={fileRef1} type="file" accept="image/*" hidden onChange={e => onImagenChange(setImg1, e)} />
                <input ref={fileRef2} type="file" accept="image/*" hidden onChange={e => onImagenChange(setImg2, e)} />

                <label className="cx-auth-label">Nombre</label>
                <input value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Ej: Sofá Alaya" autoComplete="off" required />

                <label className="cx-auth-label">Categoría</label>
                <input value={form.categoria} onChange={e => set('categoria', e.target.value)} placeholder="Ej: Línea Hogar" list="cx-categorias" autoComplete="off" required />
                <datalist id="cx-categorias">
                  {categorias.map(c => <option key={c} value={c} />)}
                </datalist>

                <div className="cx-modal-row">
                  <div>
                    <label className="cx-auth-label">Precio (Bs., opcional)</label>
                    <input type="number" step="0.01" min="0" value={form.precio} onChange={e => set('precio', e.target.value)} placeholder="0.00" autoComplete="off" />
                  </div>
                  <div>
                    <label className="cx-auth-label">Material (opcional)</label>
                    <input value={form.material} onChange={e => set('material', e.target.value)} placeholder="Ej: Cuero natural" autoComplete="off" />
                  </div>
                </div>

                <label className="cx-auth-label">Descripción (opcional)</label>
                <textarea value={form.descripcion} onChange={e => set('descripcion', e.target.value)} rows={3} placeholder="Detalles del producto…" />

                <div className="cx-modal-checks">
                  <label className="cx-prodadmin-check">
                    <input type="checkbox" checked={!!Number(form.visible)} onChange={e => set('visible', e.target.checked ? 1 : 0)} />
                    Visible en el sitio público
                  </label>
                  <label className="cx-prodadmin-check">
                    <input type="checkbox" checked={!!Number(form.destacado)} onChange={e => set('destacado', e.target.checked ? 1 : 0)} />
                    Destacado en Inicio
                  </label>
                </div>

                {error && <p className="cx-auth-error">{error}</p>}
              </div>

              <div className="cx-modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
