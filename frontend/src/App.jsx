import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Header from './components/Header'
import Footer from './components/Footer'
import ChatWidget from './components/ChatWidget'
import SocialFloat from './components/SocialFloat'
import Home from './pages/Home'
import Productos from './pages/Productos'
import ProductoDetalle from './pages/ProductoDetalle'
import Nosotros from './pages/Nosotros'
import Login from './pages/Login'
import PanelLayout from './components/PanelLayout'
import PanelResumen from './pages/panel/Resumen'
import PanelChat from './pages/panel/Chat'
import PanelProductos from './pages/panel/Productos'
import PanelUsuarios from './pages/panel/Usuarios'

function SitioPublico({ children }) {
  const location = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [location.pathname])
  return (
    <>
      <Header />
      <main id="main" key={location.pathname} className="cx-page-transition">{children}</main>
      <Footer />
      <SocialFloat />
      <ChatWidget />
    </>
  )
}

function RutaProtegida({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="page-loading">Cargando…</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SitioPublico><Home /></SitioPublico>} />
      <Route path="/productos" element={<SitioPublico><Productos /></SitioPublico>} />
      <Route path="/productos/:slug" element={<SitioPublico><ProductoDetalle /></SitioPublico>} />
      <Route path="/nosotros" element={<SitioPublico><Nosotros /></SitioPublico>} />
      <Route path="/login" element={<Login />} />
      <Route path="/panel" element={<RutaProtegida><PanelLayout /></RutaProtegida>}>
        <Route index element={<PanelResumen />} />
        <Route path="chat" element={<PanelChat />} />
        <Route path="productos" element={<PanelProductos />} />
        <Route path="usuarios" element={<PanelUsuarios />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
