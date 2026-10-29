import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await login(email, password)
      navigate('/panel')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="cx-auth-page">
      <Link to="/" className="cx-auth-back"><ArrowLeft size={15} /> Volver al sitio</Link>
      <div className="cx-auth-card">
        <div className="cx-auth-logo">
          <img src="/assets/logo-negro.png" alt="Corimexo" />
        </div>
        <h1>Ingresar al panel</h1>
        <p className="cx-auth-sub">Accedé para gestionar el chat en vivo con tus clientes.</p>

        <form className="cx-auth-form" onSubmit={handleSubmit}>
          <label className="cx-auth-label">Correo electrónico</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="tu@correo.com" />

          <label className="cx-auth-label">Contraseña</label>
          <div className="cx-auth-pass-wrap">
            <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
            <button type="button" onClick={() => setShowPass(s => !s)} tabIndex={-1}>
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && <p className="cx-auth-error">{error}</p>}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
