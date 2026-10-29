import { Instagram, Facebook } from 'lucide-react'

export function TikTokIcon({ size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.6 5.82c-.9-.98-1.4-2.26-1.4-3.6h-3.3v13.6a3.07 3.07 0 0 1-3.06 3.02 3.07 3.07 0 0 1-3.07-3.06 3.07 3.07 0 0 1 3.07-3.06c.3 0 .59.04.86.13v-3.36a6.4 6.4 0 0 0-.86-.06A6.4 6.4 0 0 0 2.5 15.78a6.4 6.4 0 0 0 6.34 6.4 6.4 6.4 0 0 0 6.4-6.4V8.9a8.1 8.1 0 0 0 4.76 1.53V7.12c-1.09 0-2.16-.35-3.4-1.3Z"/>
    </svg>
  )
}

export function XIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.24 3H21l-6.46 7.38L22.1 21h-6.13l-4.8-6.27L5.6 21H2.83l6.9-7.9L1.9 3h6.28l4.34 5.73L18.24 3Zm-1.08 16.2h1.5L7.9 4.7H6.3l10.86 14.5Z"/>
    </svg>
  )
}

// TODO: reemplazar los "#" por los enlaces reales de cada red cuando los tengan.
export const SOCIALES = [
  { key: 'instagram', label: 'Instagram', Icon: Instagram, href: 'https://instagram.com/corimexo.bo' },
  { key: 'facebook', label: 'Facebook', Icon: Facebook, href: '#' },
  { key: 'tiktok', label: 'TikTok', Icon: TikTokIcon, href: '#' },
  { key: 'x', label: 'X', Icon: XIcon, href: '#' },
]
