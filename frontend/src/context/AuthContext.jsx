import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = localStorage.getItem('cxo_token')
    if (!t) { setLoading(false); return }
    api.me().then(setUser).catch(() => localStorage.removeItem('cxo_token')).finally(() => setLoading(false))
  }, [])

  async function login(email, password) {
    const { token, user } = await api.login({ email, password })
    localStorage.setItem('cxo_token', token)
    setUser(user)
    return user
  }

  async function logout() {
    try { await api.logout() } catch {}
    localStorage.removeItem('cxo_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() { return useContext(AuthContext) }
