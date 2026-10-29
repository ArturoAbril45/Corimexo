import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, X, ShieldCheck, Headset } from 'lucide-react'
import { api } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

const emptyForm = { id: null, nombre: '', email: '', password: '', rol: 'agente' }

export default function Usuarios() {
  const { user: yo } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function cargar() {
    setLoading(true)
    api.getUsuarios().then(setUsuarios).finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [])

  if (yo && yo.rol !== 'admin') return <Navigate to="/panel" replace />

  function set(k, v) { setForm(prev => ({ ...prev, [k]: v })) }

  function abrirCrear() { setForm(emptyForm); setError(''); setModal(true) }
  function abrirEditar(u) { setForm({ id: u.id, nombre: u.nombre, email: u.email, password: '', rol: u.rol }); setError(''); setModal(true) }

  async function guardar(e) {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      if (form.id) {
        await api.editarUsuario(form.id, { nombre: form.nombre.trim(), rol: form.rol, password: form.password || undefined })
      } else {
        await api.crearUsuario({ nombre: form.nombre.trim(), email: form.email.trim(), password: form.password, rol: form.rol })
      }
      setModal(false)
      cargar()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function eliminar(u) {
    if (!confirm(`¿Eliminar a "${u.nombre}"? Los chats que tenía asignados quedarán sin agente.`)) return
    try {
      await api.eliminarUsuario(u.id)
      cargar()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="cx-panel-page">
      <div className="cx-panel-topbar">
        <div>
          <h1>Usuarios</h1>
          <p>Administradores y agentes que pueden atender el chat en vivo.</p>
        </div>
        <button className="btn btn-primary" onClick={abrirCrear}><Plus size={16} /> Nuevo usuario</button>
      </div>

      {loading ? (
        <p className="cx-chat-empty">Cargando…</p>
      ) : (
        <div className="cx-usuarios-list">
          {usuarios.map(u => (
            <div key={u.id} className="cx-usuarios-row">
              <div className="cx-usuarios-avatar">{u.rol === 'admin' ? <ShieldCheck size={16} /> : <Headset size={16} />}</div>
              <div className="cx-usuarios-info">
                <span className="nombre">{u.nombre} {u.id === yo?.id && <em>(vos)</em>}</span>
                <span className="email">{u.email}</span>
              </div>
              <span className={`badge ${u.rol === 'admin' ? 'badge-success' : 'badge-outline'}`}>{u.rol === 'admin' ? 'Administrador' : 'Agente'}</span>
              <div className="cx-prodadmin-actions cx-usuarios-actions">
                <button onClick={() => abrirEditar(u)} aria-label="Editar"><Pencil size={14} /></button>
                <button onClick={() => eliminar(u)} className="danger" aria-label="Eliminar" disabled={u.id === yo?.id}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="cx-modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="cx-modal">
            <div className="cx-modal-head">
              <h2>{form.id ? 'Editar usuario' : 'Nuevo usuario'}</h2>
              <button onClick={() => setModal(false)} aria-label="Cerrar"><X size={18} /></button>
            </div>

            <form className="cx-modal-form" onSubmit={guardar} autoComplete="off">
              <div className="cx-modal-fields">
                <label className="cx-auth-label">Nombre</label>
                <input value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Ej: María Pérez" autoComplete="off" required />

                <label className="cx-auth-label">Correo</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="agente@corimexo.com" autoComplete="off" required disabled={!!form.id} />

                <label className="cx-auth-label">{form.id ? 'Nueva contraseña (opcional)' : 'Contraseña'}</label>
                <input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder={form.id ? 'Dejar en blanco para no cambiarla' : 'Mínimo 6 caracteres'} autoComplete="new-password" required={!form.id} />

                <label className="cx-auth-label">Rol</label>
                <div className="cx-role-row">
                  <button type="button" className={form.rol === 'agente' ? 'active' : ''} onClick={() => set('rol', 'agente')}>Agente</button>
                  <button type="button" className={form.rol === 'admin' ? 'active' : ''} onClick={() => set('rol', 'admin')}>Administrador</button>
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
