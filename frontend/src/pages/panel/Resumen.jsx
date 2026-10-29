import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Inbox, CheckCircle2, Clock } from 'lucide-react'
import { api } from '../../lib/api'

export default function Resumen() {
  const [conversaciones, setConversaciones] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getConversaciones().then(setConversaciones).finally(() => setLoading(false))
  }, [])

  const abiertas = conversaciones.filter(c => c.estado === 'abierta').length
  const cerradas = conversaciones.filter(c => c.estado === 'cerrada').length
  const noLeidos = conversaciones.reduce((s, c) => s + Number(c.no_leidos || 0), 0)

  return (
    <div className="cx-panel-page">
      <div className="cx-panel-topbar">
        <div>
          <h1>Resumen</h1>
          <p>Vista general del chat en vivo con tus visitantes.</p>
        </div>
      </div>

      <div className="cx-panel-stat-grid">
        <div className="cx-panel-stat-card">
          <span className="lbl"><Inbox size={14} /> Conversaciones</span>
          <span className="val">{loading ? '—' : conversaciones.length}</span>
        </div>
        <div className="cx-panel-stat-card">
          <span className="lbl"><Clock size={14} /> Abiertas</span>
          <span className="val">{loading ? '—' : abiertas}</span>
        </div>
        <div className="cx-panel-stat-card">
          <span className="lbl"><CheckCircle2 size={14} /> Cerradas</span>
          <span className="val">{loading ? '—' : cerradas}</span>
        </div>
        <div className="cx-panel-stat-card highlight">
          <span className="lbl"><MessageCircle size={14} /> Mensajes sin leer</span>
          <span className="val">{loading ? '—' : noLeidos}</span>
        </div>
      </div>

      <Link to="/panel/chat" className="btn btn-primary">Ir al chat en vivo</Link>
    </div>
  )
}
