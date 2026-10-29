const BASE = '/backend'

function token() { return localStorage.getItem('cxo_token') || '' }
function visitorToken() { return localStorage.getItem('cxo_visitor_token') || '' }

async function req(method, path, body, params) {
  const url = new URL(BASE + path, window.location.origin)
  if (params) Object.entries(params).forEach(([k, v]) => v != null && url.searchParams.set(k, v))
  const res = await fetch(url.toString(), {
    method,
    headers: { 'Content-Type': 'application/json', 'X-Token': token() },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Error del servidor')
  return data
}

// Para envíos con imagen (multipart/form-data) — no fijar Content-Type, el navegador
// arma el boundary automáticamente.
async function reqForm(path, formData, params) {
  const url = new URL(BASE + path, window.location.origin)
  if (params) Object.entries(params).forEach(([k, v]) => v != null && url.searchParams.set(k, v))
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'X-Token': token() },
    body: formData,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Error del servidor')
  return data
}

export const api = {
  login:  (b) => req('POST', '/auth/login', b),
  me:     () => req('GET', '/auth/me'),
  logout: () => req('POST', '/auth/logout'),

  iniciarChat: (b) => req('POST', '/chat/iniciar', b),
  getConversaciones: () => req('GET', '/chat/conversaciones'),
  getMensajes: (convId) => req('GET', `/chat/conversaciones/${convId}/mensajes`),
  enviarMensaje: (conversacion_id, mensaje) => req('POST', '/chat/mensajes', { conversacion_id, mensaje }),
  cerrarConversacion: (convId) => req('POST', `/chat/conversaciones/${convId}/cerrar`),

  getProductos: (params) => req('GET', '/productos', null, params),
  getProducto: (slug) => req('GET', `/productos/${slug}`),
  crearProducto: (formData) => reqForm('/productos', formData),
  editarProducto: (id, formData) => reqForm(`/productos/${id}`, formData, { action: 'editar' }),
  eliminarProducto: (id) => req('DELETE', `/productos/${id}`),

  transferirConversacion: (convId, agente_id) => req('POST', `/chat/conversaciones/${convId}/transferir`, { agente_id }),

  getUsuarios: () => req('GET', '/usuarios'),
  crearUsuario: (b) => req('POST', '/usuarios', b),
  editarUsuario: (id, b) => req('POST', `/usuarios/${id}`, b, { action: 'editar' }),
  eliminarUsuario: (id) => req('DELETE', `/usuarios/${id}`),
}

export { token, visitorToken }
