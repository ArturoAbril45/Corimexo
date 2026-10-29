import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'
import { api } from '../lib/api'

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [conv, setConv] = useState(null)
  const [nombre, setNombre] = useState('')
  const [mensajes, setMensajes] = useState([])
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    const savedToken = localStorage.getItem('cxo_visitor_token')
    if (savedToken) {
      api.iniciarChat({ visitor_token: savedToken }).then(c => {
        setConv(c)
        localStorage.setItem('cxo_visitor_token', c.visitor_token)
      }).catch(() => {})
    }
  }, [])

  useEffect(() => {
    if (!conv) return
    let cancelado = false
    function cargar() {
      api.getMensajes(conv.id).then(list => { if (!cancelado) setMensajes(list) })
    }
    cargar()
    const t = setInterval(cargar, 3000)
    return () => { cancelado = true; clearInterval(t) }
  }, [conv])

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes, open])

  async function iniciar(e) {
    e.preventDefault()
    const c = await api.iniciarChat({ nombre: nombre.trim() || 'Visitante' })
    localStorage.setItem('cxo_visitor_token', c.visitor_token)
    setConv(c)
  }

  async function enviar(e) {
    e.preventDefault()
    if (!texto.trim() || !conv) return
    setEnviando(true)
    try {
      const msg = await api.enviarMensaje(conv.id, texto.trim())
      setMensajes(prev => [...prev, msg])
      setTexto('')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="cx-chat-widget">
      {open && (
        <div className="cx-chat-widget-panel">
          <div className="cx-chat-widget-head">
            <span>Hablemos — Corimexo</span>
            <button onClick={() => setOpen(false)} aria-label="Cerrar chat"><X size={17} /></button>
          </div>

          {!conv ? (
            <form className="cx-chat-widget-start" onSubmit={iniciar}>
              <p>Contanos tu nombre para empezar la conversación.</p>
              <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Tu nombre" autoFocus />
              <button type="submit" className="btn btn-primary btn-block">Iniciar chat</button>
            </form>
          ) : (
            <>
              <div className="cx-chat-widget-messages">
                {mensajes.length === 0 && <p className="cx-chat-widget-hint">Escribinos y te respondemos a la brevedad.</p>}
                {mensajes.map(m => (
                  <div key={m.id} className={`cx-chat-bubble-row ${m.remitente === 'admin' ? 'from-admin' : 'from-visitor'}`}>
                    <div className="cx-chat-bubble">
                      <p>{m.mensaje}</p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <form className="cx-chat-input-row" onSubmit={enviar}>
                <input value={texto} onChange={e => setTexto(e.target.value)} placeholder="Escribí tu mensaje…" />
                <button type="submit" className="btn btn-primary" disabled={enviando || !texto.trim()}>
                  <Send size={15} />
                </button>
              </form>
            </>
          )}
        </div>
      )}

      <button className="cx-chat-bubble-toggle" onClick={() => setOpen(o => !o)} aria-label="Abrir chat en vivo">
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  )
}
