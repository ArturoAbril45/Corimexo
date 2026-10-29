import { useEffect, useRef, useState, useCallback } from 'react'
import { Send, User, ArrowRightLeft } from 'lucide-react'
import { api } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

export default function Chat() {
  const { user: yo } = useAuth()
  const [conversaciones, setConversaciones] = useState([])
  const [agentes, setAgentes] = useState([])
  const [activaId, setActivaId] = useState(null)
  const [mensajes, setMensajes] = useState([])
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [transfiriendo, setTransfiriendo] = useState(false)
  const bottomRef = useRef(null)

  const cargarConversaciones = useCallback(() => {
    api.getConversaciones().then(list => {
      setConversaciones(list)
      setActivaId(prev => prev ?? list[0]?.id ?? null)
    })
  }, [])

  useEffect(() => {
    cargarConversaciones()
    api.getUsuarios().then(setAgentes).catch(() => {})
    const t = setInterval(cargarConversaciones, 4000)
    return () => clearInterval(t)
  }, [cargarConversaciones])

  useEffect(() => {
    if (!activaId) { setMensajes([]); return }
    let cancelado = false
    function cargar() {
      api.getMensajes(activaId).then(list => { if (!cancelado) setMensajes(list) })
    }
    cargar()
    const t = setInterval(cargar, 3000)
    return () => { cancelado = true; clearInterval(t) }
  }, [activaId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  async function enviar(e) {
    e.preventDefault()
    if (!texto.trim() || !activaId) return
    setEnviando(true)
    try {
      const msg = await api.enviarMensaje(activaId, texto.trim())
      setMensajes(prev => [...prev, msg])
      setTexto('')
      cargarConversaciones()
    } catch (err) {
      alert(err.message)
    } finally {
      setEnviando(false)
    }
  }

  async function transferir(agenteId) {
    if (!activaId) return
    setTransfiriendo(true)
    try {
      await api.transferirConversacion(activaId, agenteId || null)
      cargarConversaciones()
    } catch (err) {
      alert(err.message)
    } finally {
      setTransfiriendo(false)
    }
  }

  const activa = conversaciones.find(c => c.id === activaId)

  return (
    <div className="cx-panel-page cx-chat-page">
      <div className="cx-panel-topbar">
        <div>
          <h1>Chat en vivo</h1>
          <p>Conversá en tiempo real con los visitantes del sitio.</p>
        </div>
      </div>

      <div className="cx-chat-layout">
        <div className="cx-chat-list">
          {conversaciones.length === 0 && <p className="cx-chat-empty">Todavía no hay conversaciones.</p>}
          {conversaciones.map(c => (
            <button key={c.id} className={`cx-chat-list-item ${c.id === activaId ? 'active' : ''}`} onClick={() => setActivaId(c.id)}>
              <div className="cx-chat-avatar"><User size={16} /></div>
              <div className="cx-chat-list-info">
                <span className="nombre">{c.visitor_nombre || 'Visitante'}</span>
                <span className="ultimo">{c.ultimo_mensaje || 'Sin mensajes'}</span>
                <span className="cx-chat-agente">{c.agente_nombre ? `Asignado a ${c.agente_nombre}` : 'Sin asignar'}</span>
              </div>
              {Number(c.no_leidos) > 0 && <span className="cx-chat-badge">{c.no_leidos}</span>}
            </button>
          ))}
        </div>

        <div className="cx-chat-thread">
          {!activa ? (
            <div className="cx-chat-empty-thread">Seleccioná una conversación</div>
          ) : (
            <>
              <div className="cx-chat-thread-head">
                <div className="cx-chat-avatar"><User size={16} /></div>
                <div>
                  <strong>{activa.visitor_nombre || 'Visitante'}</strong>
                  {activa.visitor_email && <span className="cx-chat-thread-email">{activa.visitor_email}</span>}
                </div>
                <span className={`badge ${activa.estado === 'abierta' ? 'badge-success' : 'badge-outline'}`}>{activa.estado}</span>
                <div className="cx-chat-transfer">
                  <ArrowRightLeft size={13} />
                  <select value={activa.agente_id || ''} disabled={transfiriendo} onChange={e => transferir(e.target.value ? Number(e.target.value) : null)}>
                    <option value="">Sin asignar</option>
                    {agentes.map(a => (
                      <option key={a.id} value={a.id}>{a.id === yo?.id ? `${a.nombre} (vos)` : a.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="cx-chat-messages">
                {mensajes.map(m => (
                  <div key={m.id} className={`cx-chat-bubble-row ${m.remitente === 'admin' ? 'from-admin' : 'from-visitor'}`}>
                    <div className="cx-chat-bubble">
                      {m.remitente === 'admin' && m.nombre_admin && <span className="cx-chat-autor">{m.nombre_admin}</span>}
                      <p>{m.mensaje}</p>
                      <span className="cx-chat-time">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              <form className="cx-chat-input-row" onSubmit={enviar}>
                <input value={texto} onChange={e => setTexto(e.target.value)} placeholder="Escribí una respuesta…" />
                <button type="submit" className="btn btn-primary" disabled={enviando || !texto.trim()}>
                  <Send size={15} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
