import { Target, Eye } from 'lucide-react'
import Reveal from '../components/Reveal'

export default function Nosotros() {
  return (
    <>
      <section className="cx-doc-header">
        <div className="container">
          <Reveal>
            <span className="badge badge-outline">Sobre Corimexo</span>
            <h1>¿Quiénes somos?</h1>
            <p>50 años de trayectoria diseñando, fabricando y desarrollando mobiliario en Bolivia.</p>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container cx-doc-body">
          <Reveal className="cx-doc-panel">
            <p>
              Somos una empresa boliviana especializada en el diseño, fabricación y desarrollo
              integral de mobiliario, con 50 años de trayectoria que respaldan nuestra experiencia,
              solidez y capacidad para materializar proyectos de distintas escalas y niveles de
              complejidad.
            </p>
            <p>
              Contamos con infraestructura, tecnología y un equipo especializado que nos permiten
              desarrollar soluciones a medida, combinando diseño, funcionalidad, calidad y precisión
              en cada detalle.
            </p>
            <p>
              Nuestra experiencia abarca desde proyectos residenciales y corporativos hasta grandes
              desarrollos comerciales y arquitectónicos, trabajando con importantes empresas,
              franquicias y proyectos de gran magnitud a nivel nacional.
            </p>
            <p>
              Entendemos cada proyecto como una oportunidad para crear espacios excepcionales. Por
              ello, acompañamos a nuestros clientes en cada etapa del proceso, desde la
              conceptualización y diseño hasta la fabricación, instalación y servicio postventa.
            </p>
            <p>
              Nuestra capacidad de fabricación, experiencia y compromiso con la excelencia nos han
              permitido consolidarnos como un aliado estratégico para quienes buscan calidad,
              confianza y resultados a la altura de sus proyectos.
            </p>
          </Reveal>

          <div className="cx-mv-grid">
            <Reveal className="cx-mv-card">
              <div className="cx-mv-ico"><Target size={22} /></div>
              <h2>Misión</h2>
              <p>
                Diseñar, fabricar y ofrecer soluciones integrales de mobiliario con altos estándares
                de calidad, innovación y diseño, atendiendo las necesidades de nuestros clientes con
                excelencia, personalización y compromiso.
              </p>
              <p>
                Brindar asesoramiento especializado y acompañamiento integral en cada proyecto,
                respaldados por nuestra capacidad de fabricación, tecnología y un equipo altamente
                calificado, garantizando eficiencia, cumplimiento y un servicio postventa que genere
                relaciones duraderas y satisfacción en nuestros clientes.
              </p>
            </Reveal>

            <Reveal delay={100} className="cx-mv-card">
              <div className="cx-mv-ico"><Eye size={22} /></div>
              <h2>Visión</h2>
              <p>
                Ser la empresa líder en Bolivia en diseño, fabricación y soluciones integrales de
                mobiliario, reconocida por su excelencia, innovación, calidad y capacidad para
                desarrollar proyectos de gran magnitud.
              </p>
              <p>
                Consolidarnos como una empresa boliviana de proyección internacional, construyendo
                relaciones sostenibles con nuestros clientes, proveedores y aliados estratégicos, y
                estableciendo nuevos estándares de calidad y servicio en la industria del mobiliario.
              </p>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  )
}
