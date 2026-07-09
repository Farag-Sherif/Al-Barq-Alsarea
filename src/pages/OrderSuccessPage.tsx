import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import clsx from 'clsx'

import Container from '@/components/layout/Container'
import Button from '@/components/ui/Button'
import { CheckIcon, ClockIcon, LocationIcon, TruckIcon } from '@/components/icons'
import { useI18n } from '@/i18n/I18nProvider'
import { toast } from '@/lib/toast'
import { useAppSelector } from '@/store/hooks'

type LocationState = {
  address?: {
    label: string
    details: string
    detailsAr?: string
    detailsEn?: string
    labelAr?: string
    labelEn?: string
    governorate?: string
    governorateAr?: string
    governorateEn?: string
    city?: string
    cityAr?: string
    cityEn?: string
    district?: string
  } | null
  etaMinutes?: number
}

function hasArabicText(value: string): boolean {
  return /[\u0600-\u06ff]/u.test(value)
}

function normalizeAddressToken(value: string | undefined): string {
  return (value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

function uniqueAddressParts(values: string[]): string[] {
  const seen = new Set<string>()
  const rows: string[] = []

  for (const value of values) {
    const trimmed = value.trim()
    const key = normalizeAddressToken(trimmed)
    if (!trimmed || !key || seen.has(key)) continue
    seen.add(key)
    rows.push(trimmed)
  }

  return rows
}

function pickLocalizedAddressValue(candidates: Array<string | undefined>, lang: 'ar' | 'en'): string {
  const values = candidates
    .map((entry) => (entry ?? '').trim())
    .filter(Boolean)

  if (values.length === 0) return ''
  if (lang === 'ar') return values.find((entry) => hasArabicText(entry)) || values[0]
  return values.find((entry) => !hasArabicText(entry)) || values[0]
}

function splitAddressDetails(value: string): string[] {
  const rows = value
    .split(/[\u060C,|/]+/g)
    .flatMap((part) => part.split(/\s*-\s*/g))
    .map((entry) => entry.trim())
    .filter(Boolean)

  return uniqueAddressParts(rows)
}

function getLocalizedAddressLabel(
  address: NonNullable<LocationState['address']>,
  lang: 'ar' | 'en',
): string {
  const explicitLocalizedLabel = (lang === 'ar' ? address.labelAr : address.labelEn)?.trim() || ''
  if (explicitLocalizedLabel) return explicitLocalizedLabel

  const localizedCandidates =
    lang === 'ar'
      ? [address.district, address.cityAr, address.city, address.governorateAr, address.governorate]
      : [address.district, address.cityEn, address.city, address.governorateEn, address.governorate]

  const firstLocalized = localizedCandidates
    .map((entry) => (entry ?? '').trim())
    .find(Boolean)
  if (firstLocalized) return firstLocalized

  const fallbackLabel = address.label.trim()
  if (fallbackLabel) return fallbackLabel

  return lang === 'ar' ? '\u0627\u0644\u0639\u0646\u0648\u0627\u0646' : 'Address'
}

function getLocalizedAddressDetails(
  address: NonNullable<LocationState['address']>,
  label: string,
  lang: 'ar' | 'en',
): string {
  const explicitLocalizedDetails = (lang === 'ar' ? address.detailsAr : address.detailsEn)?.trim() || ''
  if (explicitLocalizedDetails) return explicitLocalizedDetails

  const cityLocalized = pickLocalizedAddressValue(
    lang === 'ar' ? [address.cityAr, address.city, address.cityEn] : [address.cityEn, address.city, address.cityAr],
    lang,
  )
  const governorateLocalized = pickLocalizedAddressValue(
    lang === 'ar'
      ? [address.governorateAr, address.governorate, address.governorateEn]
      : [address.governorateEn, address.governorate, address.governorateAr],
    lang,
  )
  const districtLocalized = pickLocalizedAddressValue([address.district, label], lang)

  const aliases = new Set(
    uniqueAddressParts([
      label,
      districtLocalized,
      address.district ?? '',
      cityLocalized,
      governorateLocalized,
      address.city ?? '',
      address.cityAr ?? '',
      address.cityEn ?? '',
      address.governorate ?? '',
      address.governorateAr ?? '',
      address.governorateEn ?? '',
    ]).map((entry) => normalizeAddressToken(entry)),
  )

  const detailParts = splitAddressDetails(address.details)
  const customParts = detailParts.filter((part) => !aliases.has(normalizeAddressToken(part)))
  const locationParts = uniqueAddressParts([cityLocalized, governorateLocalized].filter(Boolean))
  const merged = uniqueAddressParts([...customParts, ...locationParts])
  if (merged.length === 0) return ''

  return merged.join(lang === 'ar' ? '، ' : ', ')
}

export default function OrderSuccessPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, lang } = useI18n()
  const settings = useAppSelector((state) => state.settings.data)

  const location = useLocation()
  const state = (location.state ?? {}) as LocationState

  const rawAddress = state.address
  const localizedLabel = rawAddress ? getLocalizedAddressLabel(rawAddress, lang as 'ar' | 'en') : ''
  const localizedDetails = rawAddress
    ? getLocalizedAddressDetails(rawAddress, localizedLabel, lang as 'ar' | 'en')
    : ''
  const address = rawAddress
    ? {
        ...rawAddress,
        label: localizedLabel,
        details: localizedDetails,
      }
    : null
  const addressText = address ? (address.details ? `${address.label} - ${address.details}` : address.label) : '—'

  const etaMinutes = state.etaMinutes ?? 35
  const supportEmail = settings?.contactEmail || 'support@albarqalsaree.com'
  const orderReference = (id ?? '').trim()
  const orderDisplayId = orderReference ? orderReference.slice(-6) : '--'

  return (
    <div>
      <div className="bg-primary/10">
        <Container className="py-5">
          <div className="text-sm font-bold text-muted">
            <Link to="/home" className="hover:text-primary">{t('nav.home')}</Link>
            <span className="mx-2">/</span>
            <Link to="/cart" className="hover:text-primary">{t('nav.cart')}</Link>
            <span className="mx-2">/</span>
            <Link to="/checkout" className="hover:text-primary">{t('checkout.title')}</Link>
            <span className="mx-2">/</span>
            <span className="text-navy">{t('success.title')}</span>
          </div>
        </Container>
      </div>

      <section className="relative py-12">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-16 -start-16 h-64 w-64 rounded-full bg-primary/10" />
          <div className="absolute bottom-10 -end-24 h-72 w-72 rounded-full bg-primary/5" />
          <div className="absolute top-1/2 start-10 h-10 w-10 rounded-full bg-success/10" />
          <div className="absolute top-1/3 end-16 text-success/40">+</div>
        </div>

        <Container>
          <div className="mx-auto max-w-2xl">
            <div className="rounded-3xl border border-border bg-white p-8 shadow-soft md:p-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success text-white shadow-soft">
                  <CheckIcon className="h-6 w-6" />
                </div>
              </div>

              <h2 className="mt-6 text-center text-2xl font-semibold text-navy md:text-3xl">{t('success.heading')}</h2>
              <p className="mt-2 text-center text-sm font-bold text-muted">
                {t('success.preparing')} <span className="text-navy">#{orderDisplayId}</span>
              </p>
              <p className="mt-3 text-center text-sm leading-7 text-muted">{t('success.thanks')}</p>

              <div className="mt-8 rounded-3xl border border-dashed border-border bg-screen p-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <ClockIcon />
                    </div>
                    <div className="text-start">
                      <div className="text-xs font-bold text-muted">{t('success.estimated')}</div>
                      <div className="mt-1 text-lg font-extrabold text-navy">
                        {etaMinutes} {t('success.etaUnit')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <LocationIcon />
                    </div>
                    <div className="text-start">
                      <div className="text-xs font-bold text-muted">{t('success.address')}</div>
                      <div className="mt-1 text-sm font-extrabold text-navy">{addressText}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col-reverse gap-4 md:flex-row md:items-center md:justify-center">
                <Button
                  variant="outline"
                  className="h-12 rounded-2xl px-7"
                  onClick={() => {
                    navigate('/home')
                  }}
                >
                  {t('common.backHome')}
                </Button>

                <Button
                  className={clsx('h-12 rounded-2xl px-7')}
                  onClick={() => {
                    toast.info(t('success.toast.trackSoon'))
                    navigate('/account')
                  }}
                >
                  <span className="me-2 inline-flex">
                    <TruckIcon />
                  </span>
                  {t('success.track')}
                </Button>
              </div>

              <div className="mt-6 text-center text-sm text-muted">
                {t('success.support')}{' '}
                <button
                  type="button"
                  className="font-extrabold text-primary hover:underline"
                  onClick={() =>
                    toast.info(t('success.toast.contactEmail', { email: supportEmail }))
                  }
                >
                  {t('success.supportLink')}
                </button>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  )
}
