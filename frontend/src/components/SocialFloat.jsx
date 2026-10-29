import { SOCIALES } from './SocialIcons'

export default function SocialFloat() {
  return (
    <div className="cx-social-float">
      {SOCIALES.map(s => (
        <a key={s.key} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} title={s.label}>
          <s.Icon size={17} />
        </a>
      ))}
    </div>
  )
}
