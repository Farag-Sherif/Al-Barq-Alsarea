import { Link } from 'react-router-dom'

import { useI18n } from '@/i18n/I18nProvider'
import { useAppSelector } from '@/store/hooks'

type Props = {
  variant?: 'light' | 'dark'
  size?: 'sm' | 'md'
  className?: string
}

const logoSizes: Record<NonNullable<Props['size']>, string> = {
  sm: 'h-7 md:h-8',
  md: 'h-9 md:h-10',
}

export default function Logo({ variant = 'light', size = 'md', className }: Props) {
  const { lang } = useI18n()
  const settings = useAppSelector((state) => state.settings.data)

  const fallbackName = lang === 'ar' ? 'البرق السريع' : 'Albarq Al Saree'
  const brandName =
    lang === 'ar'
      ? settings?.siteNameAr || settings?.siteName || fallbackName
      : settings?.siteName || settings?.siteNameAr || fallbackName

  const defaultLogoSrc = `${import.meta.env.BASE_URL}images/albarq-main-logo-180.png`
  const logoSrc = settings?.logoUrl || defaultLogoSrc

  return (
    <Link to="/home" aria-label={brandName} className={`inline-flex shrink-0 items-center ${className ?? ''}`.trim()}>
      <img
        src={logoSrc}
        alt={brandName}
        width={160}
        height={52}
        decoding="async"
        className={`${logoSizes[size]} w-auto object-contain ${variant === 'dark' ? 'drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]' : ''}`.trim()}
      />
    </Link>
  )
}
