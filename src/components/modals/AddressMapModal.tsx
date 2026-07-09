import * as React from 'react'

import { SearchIcon, XIcon } from '@/components/icons'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import { useI18n } from '@/i18n/I18nProvider'
import { toast } from '@/lib/toast'

type ConfirmPayload = {
  label: string
  details: string
  search: string
  latitude?: number
  longitude?: number
}

type Props = {
  open: boolean
  onClose: () => void
  onConfirm?: (payload: ConfirmPayload) => void
  initialQuery?: string
  initialLatitude?: number | null
  initialLongitude?: number | null
}

type PostalAddressEntry = {
  address: string
  latitude: number
  longitude: number
}

type Coordinates = {
  latitude: number
  longitude: number
}

const DEFAULT_LATITUDE = 21.3891
const DEFAULT_LONGITUDE = 39.8579
const MAP_MIN_ZOOM = 11
const MAP_DEFAULT_ZOOM = 14
const MAP_FOCUSED_ZOOM = 16
const SAUDI_MIN_LATITUDE = 16.0
const SAUDI_MAX_LATITUDE = 32.5
const SAUDI_MIN_LONGITUDE = 34.0
const SAUDI_MAX_LONGITUDE = 56.0
const LEAFLET_JS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
const LEAFLET_CSS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
const LEAFLET_MARKER_ICON_URL = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png'
const LEAFLET_MARKER_ICON_RETINA_URL = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png'
const LEAFLET_MARKER_SHADOW_URL = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'

type LeafletWindow = Window & {
  L?: any
  __leafletLoaderPromise?: Promise<any>
}

const POSTAL_ADDRESS_BOOK: Record<string, PostalAddressEntry> = {
  '20156': {
    address: 'Al Aziziyah, Makkah Al Mukarramah, Saudi Arabia',
    latitude: 21.3916,
    longitude: 39.8639,
  },
  '11564': {
    address: 'Al Masjid Al Haram Road, Makkah Al Mukarramah, Saudi Arabia',
    latitude: 21.4225,
    longitude: 39.8262,
  },
  '11461': {
    address: 'Al Shawqiyah, Makkah Al Mukarramah, Saudi Arabia',
    latitude: 21.3623,
    longitude: 39.7997,
  },
  '21577': {
    address: 'Al Awali, Makkah Al Mukarramah, Saudi Arabia',
    latitude: 21.3075,
    longitude: 39.8173,
  },
  '31952': {
    address: 'Batha Quraysh, Makkah Al Mukarramah, Saudi Arabia',
    latitude: 21.3837,
    longitude: 39.8373,
  },
}

function loadLeafletLibrary(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject(new Error('Leaflet is only available in browser.'))

  const leafletWindow = window as LeafletWindow
  if (leafletWindow.L) return Promise.resolve(leafletWindow.L)
  if (leafletWindow.__leafletLoaderPromise) return leafletWindow.__leafletLoaderPromise

  leafletWindow.__leafletLoaderPromise = new Promise((resolve, reject) => {
    const existingStyleElement = document.querySelector<HTMLLinkElement>('link[data-leaflet-style="true"]')
    if (!existingStyleElement) {
      const styleElement = document.createElement('link')
      styleElement.rel = 'stylesheet'
      styleElement.href = LEAFLET_CSS_URL
      styleElement.setAttribute('data-leaflet-style', 'true')
      document.head.appendChild(styleElement)
    }

    const onLoaded = () => {
      if (leafletWindow.L) {
        resolve(leafletWindow.L)
        return
      }
      reject(new Error('Leaflet failed to initialize.'))
    }

    const existingScriptElement = document.querySelector<HTMLScriptElement>('script[data-leaflet-script="true"]')
    if (existingScriptElement) {
      existingScriptElement.addEventListener('load', onLoaded, { once: true })
      existingScriptElement.addEventListener('error', () => reject(new Error('Failed to load Leaflet script.')), {
        once: true,
      })
      return
    }

    const scriptElement = document.createElement('script')
    scriptElement.src = LEAFLET_JS_URL
    scriptElement.async = true
    scriptElement.defer = true
    scriptElement.setAttribute('data-leaflet-script', 'true')
    scriptElement.onload = onLoaded
    scriptElement.onerror = () => reject(new Error('Failed to load Leaflet script.'))
    document.body.appendChild(scriptElement)
  }).catch((error) => {
    leafletWindow.__leafletLoaderPromise = undefined
    throw error
  })

  return leafletWindow.__leafletLoaderPromise
}

function hasFiniteCoordinates(latitude: number | null | undefined, longitude: number | null | undefined): boolean {
  return (
    typeof latitude === 'number' &&
    Number.isFinite(latitude) &&
    typeof longitude === 'number' &&
    Number.isFinite(longitude)
  )
}

function isWithinSaudiBounds(coordinates: Coordinates | null | undefined): boolean {
  if (!coordinates) return false
  return (
    coordinates.latitude >= SAUDI_MIN_LATITUDE &&
    coordinates.latitude <= SAUDI_MAX_LATITUDE &&
    coordinates.longitude >= SAUDI_MIN_LONGITUDE &&
    coordinates.longitude <= SAUDI_MAX_LONGITUDE
  )
}

function toWesternDigits(value: string): string {
  return value.replace(/[\u0660-\u0669\u06f0-\u06f9]/g, (digit) => {
    const code = digit.charCodeAt(0)
    if (code >= 0x06f0 && code <= 0x06f9) return String(code - 0x06f0)
    return String(code - 0x0660)
  })
}

function parseLatLngFromInput(rawValue: string): Coordinates | null {
  const match = rawValue
    .trim()
    .match(/(-?\d{1,2}(?:\.\d+)?)\s*[, ]\s*(-?\d{1,3}(?:\.\d+)?)/)

  if (!match) return null

  const latitude = Number.parseFloat(match[1])
  const longitude = Number.parseFloat(match[2])

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null

  return { latitude, longitude }
}

function resolveCoordinatesFromPostalCode(rawValue: string): Coordinates | null {
  const normalizedDigits = toWesternDigits(rawValue.trim()).replace(/[^\d]/g, '')
  if (!/^\d{4,6}$/.test(normalizedDigits)) return null

  const entry = POSTAL_ADDRESS_BOOK[normalizedDigits]
  if (!entry) return null

  return { latitude: entry.latitude, longitude: entry.longitude }
}

function resolveCoordinatesFromSearchInput(rawValue: string): Coordinates | null {
  const fromCoordinates = parseLatLngFromInput(rawValue)
  if (fromCoordinates) return fromCoordinates

  return resolveCoordinatesFromPostalCode(rawValue)
}

function resolveAddressFromSearchInput(rawValue: string, fallbackAddress: string): string {
  const trimmed = rawValue.trim()
  if (!trimmed) return fallbackAddress

  const normalizedDigits = toWesternDigits(trimmed).replace(/[^\d]/g, '')
  if (!/^\d{4,6}$/.test(normalizedDigits)) return trimmed

  const entry = POSTAL_ADDRESS_BOOK[normalizedDigits]
  if (entry) return entry.address

  return fallbackAddress
}

type GeocodeResult = {
  label: string
  latitude: number
  longitude: number
}

async function geocodePlace(rawQuery: string, language: string): Promise<GeocodeResult | null> {
  const query = rawQuery.trim()
  if (!query) return null
  const normalizedLang = language.toLowerCase().startsWith('ar') ? 'ar' : 'en'

  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('q', query)
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('limit', '1')
  url.searchParams.set('addressdetails', '0')
  url.searchParams.set('countrycodes', 'sa')
  url.searchParams.set('accept-language', normalizedLang)

  const response = await fetch(url.toString(), {
    headers: {
      'Accept-Language': normalizedLang,
    },
  })
  if (!response.ok) return null

  const rows = (await response.json()) as Array<Record<string, unknown>>
  if (!Array.isArray(rows) || rows.length === 0) return null

  const first = rows[0]
  const latitude = Number.parseFloat(String(first.lat ?? ''))
  const longitude = Number.parseFloat(String(first.lon ?? ''))
  const label = typeof first.display_name === 'string' ? first.display_name.trim() : ''

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null
  if (!isWithinSaudiBounds({ latitude, longitude })) return null

  return {
    label,
    latitude,
    longitude,
  }
}

function createLeafletMarkerIcon(L: any) {
  return L.icon({
    iconUrl: LEAFLET_MARKER_ICON_URL,
    iconRetinaUrl: LEAFLET_MARKER_ICON_RETINA_URL,
    shadowUrl: LEAFLET_MARKER_SHADOW_URL,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  })
}

function InteractiveMap({
  open,
  center,
  marker,
  fallbackSrc,
  title,
  onPick,
}: {
  open: boolean
  center: Coordinates
  marker: Coordinates | null
  fallbackSrc: string
  title: string
  onPick: (coordinates: Coordinates) => void
}) {
  const mapElementRef = React.useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = React.useRef<any>(null)
  const markerRef = React.useRef<any>(null)
  const leafletRef = React.useRef<any>(null)
  const markerIconRef = React.useRef<any>(null)
  const [useIframeFallback, setUseIframeFallback] = React.useState(false)

  const syncMarkerCoordinates = React.useCallback(
    (event: any) => {
      const latitude = Number(event?.latlng?.lat)
      const longitude = Number(event?.latlng?.lng)
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return
      onPick({ latitude, longitude })
    },
    [onPick],
  )

  const bindDraggableMarker = React.useCallback(
    (markerInstance: any) => {
      markerInstance.off('dragend')
      markerInstance.on('dragend', (event: any) => {
        const latLng = event?.target?.getLatLng?.()
        const latitude = Number(latLng?.lat)
        const longitude = Number(latLng?.lng)
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return
        onPick({ latitude, longitude })
      })
    },
    [onPick],
  )

  React.useEffect(() => {
    if (!open) return

    let disposed = false
    setUseIframeFallback(false)

    void loadLeafletLibrary()
      .then((L) => {
        if (disposed || !mapElementRef.current) return

        leafletRef.current = L
        markerIconRef.current = createLeafletMarkerIcon(L)

        const mapInstance = L.map(mapElementRef.current, {
          zoomControl: true,
          scrollWheelZoom: true,
          doubleClickZoom: false,
          minZoom: MAP_MIN_ZOOM,
          zoomSnap: 0.5,
        })
        mapInstanceRef.current = mapInstance

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(mapInstance)

        mapInstance.on('click', syncMarkerCoordinates)
        mapInstance.on('dblclick', syncMarkerCoordinates)
        mapInstance.setMaxBounds(
          L.latLngBounds(
            [SAUDI_MIN_LATITUDE, SAUDI_MIN_LONGITUDE],
            [SAUDI_MAX_LATITUDE, SAUDI_MAX_LONGITUDE],
          ),
        )

        const initialPoint = marker ?? center
        const initialZoom = marker ? MAP_FOCUSED_ZOOM : MAP_DEFAULT_ZOOM
        mapInstance.setView([initialPoint.latitude, initialPoint.longitude], initialZoom)

        if (marker) {
          const nextMarker = L.marker([marker.latitude, marker.longitude], {
            icon: markerIconRef.current,
            draggable: true,
          }).addTo(mapInstance)
          markerRef.current = nextMarker
          bindDraggableMarker(nextMarker)
        }
      })
      .catch(() => {
        if (!disposed) setUseIframeFallback(true)
      })

    return () => {
      disposed = true
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
      }
      mapInstanceRef.current = null
      markerRef.current = null
      leafletRef.current = null
      markerIconRef.current = null
    }
  }, [bindDraggableMarker, open, syncMarkerCoordinates])

  React.useEffect(() => {
    if (!open) return

    const mapInstance = mapInstanceRef.current
    const L = leafletRef.current
    if (!mapInstance || !L) return

    const target = marker ?? center
    mapInstance.setView(
      [target.latitude, target.longitude],
      marker ? MAP_FOCUSED_ZOOM : Math.max(MAP_DEFAULT_ZOOM, mapInstance.getZoom() ?? MAP_DEFAULT_ZOOM),
      {
      animate: false,
      },
    )

    if (marker) {
      if (!markerRef.current) {
        const nextMarker = L.marker([marker.latitude, marker.longitude], {
          icon: markerIconRef.current ?? createLeafletMarkerIcon(L),
          draggable: true,
        }).addTo(mapInstance)
        markerRef.current = nextMarker
        bindDraggableMarker(nextMarker)
      } else {
        markerRef.current.setLatLng([marker.latitude, marker.longitude])
      }
      return
    }

    if (markerRef.current) {
      mapInstance.removeLayer(markerRef.current)
      markerRef.current = null
    }
  }, [bindDraggableMarker, center.latitude, center.longitude, marker?.latitude, marker?.longitude, open])

  if (useIframeFallback) {
    return (
      <iframe
        title={title}
        className="relative z-[1] h-full min-h-[320px] w-full md:h-[500px]"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src={fallbackSrc}
      />
    )
  }

  return <div ref={mapElementRef} className="relative z-[1] h-full min-h-[320px] w-full md:h-[500px]" />
}

export default function AddressMapModal({
  open,
  onClose,
  onConfirm,
  initialQuery = '',
  initialLatitude = null,
  initialLongitude = null,
}: Props) {
  const { t, dir } = useI18n()
  const [query, setQuery] = React.useState('')
  const [resolvedQuery, setResolvedQuery] = React.useState('')
  const [resolvedCoordinates, setResolvedCoordinates] = React.useState<Coordinates | null>(null)
  const [selectedMarkerCoordinates, setSelectedMarkerCoordinates] = React.useState<Coordinates | null>(null)
  const [searchingPlace, setSearchingPlace] = React.useState(false)
  const searchRequestRef = React.useRef(0)

  const defaultAddress = t('map.cityCountry')
  const saudiOnlyErrorMessage = t('map.saudiOnlyError')

  React.useEffect(() => {
    if (!open) return
    const canUseInitialCoordinates = hasFiniteCoordinates(initialLatitude, initialLongitude)
      ? { latitude: Number(initialLatitude), longitude: Number(initialLongitude) }
      : null
    const boundedInitialCoordinates =
      canUseInitialCoordinates && isWithinSaudiBounds(canUseInitialCoordinates) ? canUseInitialCoordinates : null

    setQuery(initialQuery.trim())
    setResolvedQuery('')
    setResolvedCoordinates(boundedInitialCoordinates)
    setSelectedMarkerCoordinates(boundedInitialCoordinates)
    setSearchingPlace(false)
    searchRequestRef.current += 1
  }, [initialLatitude, initialLongitude, initialQuery, open])

  const effectiveAddress = React.useMemo(() => {
    if (resolvedQuery.trim()) return resolvedQuery.trim()
    return defaultAddress
  }, [defaultAddress, resolvedQuery])

  const effectiveCoordinates = React.useMemo(() => {
    const hintedCoordinates = resolveCoordinatesFromSearchInput(query)
    const boundedHintedCoordinates = isWithinSaudiBounds(hintedCoordinates) ? hintedCoordinates : null
    return selectedMarkerCoordinates ?? resolvedCoordinates ?? boundedHintedCoordinates
  }, [query, resolvedCoordinates, selectedMarkerCoordinates])

  const mapCenter = React.useMemo<Coordinates>(() => {
    if (effectiveCoordinates) return effectiveCoordinates
    return { latitude: DEFAULT_LATITUDE, longitude: DEFAULT_LONGITUDE }
  }, [effectiveCoordinates])

  const iframeFallbackSrc = React.useMemo(() => {
    if (effectiveCoordinates) {
      return `https://www.google.com/maps?q=${effectiveCoordinates.latitude},${effectiveCoordinates.longitude}&z=14&output=embed`
    }
    return `https://www.google.com/maps?q=${encodeURIComponent(effectiveAddress || defaultAddress || 'Saudi Arabia')}&output=embed`
  }, [defaultAddress, effectiveAddress, effectiveCoordinates])

  const handleMapPick = React.useCallback((coordinates: Coordinates) => {
    if (!isWithinSaudiBounds(coordinates)) {
      toast.error(saudiOnlyErrorMessage)
      return
    }
    setSelectedMarkerCoordinates(coordinates)
    setResolvedCoordinates(coordinates)
  }, [saudiOnlyErrorMessage])

  async function handleSearch() {
    const rawSearch = query.trim()
    if (!rawSearch) {
      setResolvedQuery('')
      return
    }

    const directCoordinates = resolveCoordinatesFromSearchInput(rawSearch)
    const directAddress = resolveAddressFromSearchInput(rawSearch, defaultAddress)
    if (directCoordinates) {
      if (!isWithinSaudiBounds(directCoordinates)) {
        toast.error(saudiOnlyErrorMessage)
        return
      }
      setResolvedQuery(directAddress)
      setResolvedCoordinates(directCoordinates)
      setSelectedMarkerCoordinates(directCoordinates)
      return
    }

    const requestId = searchRequestRef.current + 1
    searchRequestRef.current = requestId
    setSearchingPlace(true)

    try {
      const geocodedPlace = await geocodePlace(rawSearch, document.documentElement.lang || 'en')
      if (searchRequestRef.current !== requestId) return

      if (geocodedPlace) {
        const coordinates = {
          latitude: geocodedPlace.latitude,
          longitude: geocodedPlace.longitude,
        }
        setResolvedQuery(geocodedPlace.label || rawSearch)
        setResolvedCoordinates(coordinates)
        setSelectedMarkerCoordinates(coordinates)
        return
      }

      setResolvedQuery('')
      setResolvedCoordinates(null)
      setSelectedMarkerCoordinates(null)
    } finally {
      if (searchRequestRef.current === requestId) {
        setSearchingPlace(false)
      }
    }
  }

  async function handleConfirm() {
    const searchValue = query.trim()
    const coordinateHint = resolveCoordinatesFromSearchInput(searchValue)
    let finalCoordinates = selectedMarkerCoordinates ?? resolvedCoordinates ?? coordinateHint
    let finalDetails = resolvedQuery.trim()

    if (searchValue && !finalCoordinates && !finalDetails) {
      setSearchingPlace(true)
      try {
        const geocodedPlace = await geocodePlace(searchValue, document.documentElement.lang || 'en')
        if (geocodedPlace) {
          finalCoordinates = {
            latitude: geocodedPlace.latitude,
            longitude: geocodedPlace.longitude,
          }
          finalDetails = geocodedPlace.label || searchValue
          setResolvedQuery(finalDetails)
          setResolvedCoordinates(finalCoordinates)
          setSelectedMarkerCoordinates(finalCoordinates)
        }
      } finally {
        setSearchingPlace(false)
      }
    }

    if (searchValue && !finalCoordinates && !finalDetails) {
      toast.error(saudiOnlyErrorMessage)
      return
    }

    if (!isWithinSaudiBounds(finalCoordinates)) {
      toast.error(saudiOnlyErrorMessage)
      return
    }

    onConfirm?.({
      label: t('map.branch'),
      details: finalDetails,
      search: searchValue,
      latitude: finalCoordinates?.latitude,
      longitude: finalCoordinates?.longitude,
    })
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="max-w-none md:max-w-4xl  w-full h-[calc(100vh-2rem)] md:h-auto md:max-h-[90vh] flex flex-col"
    >
      <div className="relative flex h-full min-h-0 flex-col bg-white">
        <button
          type="button"
          data-modal-close
          onClick={onClose}
          className={`
            absolute top-5 z-[9999] inline-flex h-[44px] w-[44px] items-center justify-center rounded-full border border-border bg-white text-navy shadow-card transition-all duration-200 hover:border-primary/40 hover:text-primary active:scale-[0.98]
            ${dir === 'rtl' ? 'left-5 right-auto' : 'right-5 left-auto'}
          `}
          aria-label={t('common.close')}
        >
          <XIcon />
        </button>

        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto py-2">
          <div className="border-b border-border bg-screen/70 px-6 pb-6 pt-8 md:px-8 md:pt-9">
            <h2 className="text-center text-3xl font-extrabold text-navy">{t('map.title')}</h2>

            <div className="mx-auto mt-6 max-w-3xl rounded-3xl border border-border bg-white p-3 shadow-card md:p-4">
              <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <Input
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value)
                      setResolvedQuery('')
                      setResolvedCoordinates(null)
                    }}
                    placeholder={t('map.searchPlaceholder')}
                    icon={<SearchIcon className="h-5 w-5" />}
                    className="h-12 rounded-2xl border-border bg-screen text-sm font-semibold text-navy placeholder:text-muted-2"
                  />
                </div>
                <Button
                  className="h-12 shrink-0 rounded-2xl px-8"
                  onClick={() => {
                    void handleSearch()
                  }}
                  disabled={searchingPlace}
                >
                  {searchingPlace ? t('map.searching') : t('map.search')}
                </Button>
              </div>
              <p className={`mt-3 text-xs font-semibold text-muted ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                {t('map.pickPointHint')}
              </p>
            </div>
          </div>

          <div className="px-6 pb-6 pt-5 md:px-8">
            <div className="relative z-[1] min-h-[320px] overflow-hidden rounded-3xl border border-border bg-screen shadow-card md:h-[500px]">
              <InteractiveMap
                open={open}
                center={mapCenter}
                marker={effectiveCoordinates}
                fallbackSrc={iframeFallbackSrc}
                title={t('map.title')}
                onPick={handleMapPick}
              />
            </div>

            <Button
              className="mt-5 h-11 w-full rounded-xl text-sm font-semibold sm:h-12 sm:rounded-2xl"
              onClick={() => {
                void handleConfirm()
              }}
              disabled={searchingPlace}
            >
              {t('common.confirm')}
            </Button>

            <p className={`mt-2 text-xs font-semibold text-muted ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
              {t('map.coordinates')}:{' '}
              {effectiveCoordinates
                ? `${effectiveCoordinates.latitude.toFixed(6)}, ${effectiveCoordinates.longitude.toFixed(6)}`
                : `${DEFAULT_LATITUDE.toFixed(6)}, ${DEFAULT_LONGITUDE.toFixed(6)}`}
            </p>
            <p className={`mt-3 text-xs font-semibold text-muted ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
              {effectiveAddress || defaultAddress}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  )
}
