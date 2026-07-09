import * as React from 'react'
import clsx from 'clsx'

import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import CurrencyAmount from '@/components/ui/CurrencyAmount'
import { MinusIcon, PlusIcon, XIcon } from '@/components/icons'
import { useI18n } from '@/i18n/I18nProvider'
import type { Lang } from '@/i18n/translations'
import { toSaudiCurrencySymbolText } from '@/utils/format'
import type { MenuItem, MenuOption } from '@/data/menuData'

type LocalizedMenuOption = MenuOption & {
  labelAr?: string
  labelEn?: string
}

function pickLocalizedText(
  lang: Lang,
  values: { ar?: string; en?: string; base?: string },
) {
  const ar = values.ar?.trim() || ''
  const en = values.en?.trim() || ''
  const base = values.base?.trim() || ''
  if (lang === 'ar') return toSaudiCurrencySymbolText(ar || base || en, lang)
  return toSaudiCurrencySymbolText(en || base || ar, lang)
}

function getLocalizedMenuItemName(item: MenuItem, lang: Lang) {
  return pickLocalizedText(lang, {
    ar: item.nameAr,
    en: item.nameEn,
    base: item.name,
  })
}

function getLocalizedMenuItemDescription(item: MenuItem, lang: Lang) {
  return pickLocalizedText(lang, {
    ar: item.descriptionAr,
    en: item.descriptionEn,
    base: item.description,
  })
}

function getLocalizedMenuOptionLabel(option: MenuOption, lang: Lang) {
  const localized = option as LocalizedMenuOption
  return pickLocalizedText(lang, {
    ar: localized.labelAr,
    en: localized.labelEn,
    base: localized.label,
  })
}

function formatDiscountNumber(value: number): string {
  if (!Number.isFinite(value)) return '0'
  if (Math.abs(value - Math.round(value)) < 0.001) return String(Math.round(value))
  return value.toFixed(2).replace(/\.?0+$/, '')
}

function resolveMenuItemDiscountPercentage(item: Pick<MenuItem, 'price' | 'oldPrice' | 'discountPercentage'>): number | null {
  if (typeof item.discountPercentage === 'number' && Number.isFinite(item.discountPercentage) && item.discountPercentage > 0) {
    return item.discountPercentage
  }

  if (typeof item.oldPrice === 'number' && item.oldPrice > item.price && item.oldPrice > 0) {
    return Number((((item.oldPrice - item.price) / item.oldPrice) * 100).toFixed(2))
  }

  return null
}

function RadioRow({
  label,
  priceLabel,
  checked,
  onChange,
  dir,
}: {
  label: string
  priceLabel: React.ReactNode
  checked: boolean
  onChange: () => void
  dir: 'rtl' | 'ltr'
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={clsx(
        'flex w-full items-center justify-between gap-4 border-b border-border px-6 py-5',
        dir === 'rtl' ? 'text-right' : 'flex-row-reverse text-left',
      )}
    >
      <div className="text-sm font-bold text-primary">{priceLabel}</div>
      <div className={clsx('flex items-center gap-4', dir === 'ltr' && 'flex-row-reverse')}>
        <div className="text-base font-bold text-navy [unicode-bidi:plaintext]" dir="auto">{label}</div>
        <span
          className={
            'relative h-6 w-6 rounded-full border-2 ' +
            (checked ? 'border-primary' : 'border-border-2')
          }
        >
          {checked ? (
            <span className="absolute inset-1 rounded-full bg-primary" />
          ) : null}
        </span>
      </div>
    </button>
  )
}

function CheckboxRow({
  label,
  priceLabel,
  checked,
  onChange,
  dir,
}: {
  label: string
  priceLabel: React.ReactNode
  checked: boolean
  onChange: () => void
  dir: 'rtl' | 'ltr'
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={clsx(
        'flex w-full items-center justify-between gap-4 border-b border-border px-6 py-5',
        dir === 'rtl' ? 'text-right' : 'flex-row-reverse text-left',
      )}
    >
      <div className="text-sm font-bold text-primary">{priceLabel}</div>
      <div className={clsx('flex items-center gap-4', dir === 'ltr' && 'flex-row-reverse')}>
        <div className="text-base font-bold text-navy [unicode-bidi:plaintext]" dir="auto">{label}</div>
        <span
          className={
            'inline-flex h-6 w-6 items-center justify-center rounded-md border-2 ' +
            (checked ? 'border-primary bg-primary text-white' : 'border-border-2 bg-white')
          }
        >
          {checked ? '\u2713' : null}
        </span>
      </div>
    </button>
  )
}

type Props = {
  open: boolean
  item: MenuItem | null
  onClose: () => void
  addingToCart?: boolean
  onAddToCart: (payload: {
    item: MenuItem
    quantity: number
    selectedSize?: MenuOption
    selectedAddons: MenuOption[]
    unitPrice: number
  }) => void
}

export default function MenuItemModal({ open, item, onClose, onAddToCart, addingToCart = false }: Props) {
  const { t, lang, dir } = useI18n()
  const currencyLabel = t('currency.sar')

  const [quantity, setQuantity] = React.useState(1)
  const [sizeId, setSizeId] = React.useState<string | null>(null)
  const [addonIds, setAddonIds] = React.useState<string[]>([])

  React.useEffect(() => {
    if (!open || !item) return
    setQuantity(1)
    setSizeId(item.sizes?.[0]?.id ?? null)
    setAddonIds([])
  }, [open, item])

  const selectedSize = React.useMemo(() => {
    if (!item?.sizes?.length || !sizeId) return undefined
    return item.sizes.find((s) => s.id === sizeId)
  }, [item, sizeId])

  const selectedAddons = React.useMemo(() => {
    if (!item?.addons?.length) return []
    const set = new Set(addonIds)
    return item.addons.filter((a) => set.has(a.id))
  }, [item, addonIds])

  const unitPrice = React.useMemo(() => {
    if (!item) return 0
    const sizeExtra = selectedSize?.price ?? 0
    const addonsExtra = selectedAddons.reduce((sum, addon) => sum + addon.price, 0)
    return item.price + sizeExtra + addonsExtra
  }, [item, selectedSize, selectedAddons])

  const formatDisplayCurrency = React.useCallback(
    (value: number) => <CurrencyAmount amount={value} lang={lang} currencyLabel={currencyLabel} />,
    [lang, currencyLabel],
  )

  const itemName = React.useMemo(
    () => (item ? getLocalizedMenuItemName(item, lang) : ''),
    [item, lang],
  )
  const itemDescription = React.useMemo(
    () => (item ? getLocalizedMenuItemDescription(item, lang) : ''),
    [item, lang],
  )
  const discountPercentage = React.useMemo(
    () => (item ? resolveMenuItemDiscountPercentage(item) : null),
    [item],
  )
  const shouldShowDiscountBadge = Boolean(item?.isOnSale && typeof discountPercentage === 'number' && discountPercentage > 0)
  const discountBadgeText = shouldShowDiscountBadge ? `-${formatDiscountNumber(discountPercentage ?? 0)}%` : ''

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="max-h-[calc(100vh-2rem)] w-full max-w-none overflow-hidden md:max-w-2xl"
    >
      {item ? (
        <div
          className="flex max-h-[calc(100vh-2rem)] flex-col overflow-y-auto"
          dir={dir}
        >
          <div className="bg-white">
            <div className="px-6 py-6">
              <div className="flex items-start justify-between gap-6">
                <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl md:h-40 md:w-40">
                  <img src={item.imageUrl} alt={itemName} className="h-full w-full object-cover" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className={clsx(dir === 'rtl' ? 'text-right' : 'text-left')}>
                    <h2 className="text-2xl font-semibold text-navy md:text-3xl [unicode-bidi:plaintext]" dir="auto">{itemName}</h2>
                    <p className="mt-3 text-base text-muted [unicode-bidi:plaintext]" dir="auto">{itemDescription}</p>
                  </div>

                  <div className={clsx('mt-4 flex items-end gap-3', dir === 'rtl' ? 'justify-end' : 'justify-start')}>
                    {typeof item.oldPrice === 'number' ? (
                      <span className="text-xl font-bold text-muted line-through">
                        {formatDisplayCurrency(item.oldPrice)}
                      </span>
                    ) : null}
                    <div className={clsx('flex items-center gap-2', dir === 'rtl' ? 'flex-row-reverse' : 'flex-row')}>
                      <span className="text-2xl font-extrabold text-primary md:text-3xl">
                        {formatDisplayCurrency(item.price)}
                      </span>
                      {shouldShowDiscountBadge ? (
                        <span className="inline-flex rounded-full bg-primary/12 px-2 py-0.5 text-xs font-extrabold text-primary">
                          {discountBadgeText}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              data-modal-close
              onClick={onClose}
              className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-navy/90 text-white transition-all duration-200 hover:scale-110 hover:bg-navy"
              aria-label={t('common.close')}
            >
              <XIcon />
            </button>

            {item.sizes?.length ? (
              <>
                <div
                  className={clsx(
                    'bg-navy px-6 py-5 text-xl font-extrabold text-white',
                    dir === 'rtl' ? 'text-right' : 'text-left',
                  )}
                >
                  {t('restaurant.modal.size')}
                </div>
                <div>
                  {item.sizes.map((opt) => (
                    <RadioRow
                      key={opt.id}
                      label={getLocalizedMenuOptionLabel(opt, lang)}
                      priceLabel={formatDisplayCurrency(opt.price)}
                      checked={sizeId === opt.id}
                      onChange={() => setSizeId(opt.id)}
                      dir={dir}
                    />
                  ))}
                </div>
              </>
            ) : null}

            {item.addons?.length ? (
              <>
                <div
                  className={clsx(
                    'bg-navy px-6 py-5 text-xl font-extrabold text-white',
                    dir === 'rtl' ? 'text-right' : 'text-left',
                  )}
                >
                  {t('restaurant.modal.addons')}
                </div>
                <div>
                  {item.addons.map((opt) => {
                    const checked = addonIds.includes(opt.id)
                    return (
                      <CheckboxRow
                        key={opt.id}
                        label={getLocalizedMenuOptionLabel(opt, lang)}
                        priceLabel={formatDisplayCurrency(opt.price)}
                        checked={checked}
                        onChange={() => {
                          setAddonIds((prev) =>
                            prev.includes(opt.id) ? prev.filter((id) => id !== opt.id) : [...prev, opt.id],
                          )
                        }}
                        dir={dir}
                      />
                    )
                  })}
                </div>
              </>
            ) : null}

            <div className="px-6 py-6">
              <div className="flex items-center justify-center gap-6">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-navy text-white transition-all duration-200 hover:brightness-110 active:brightness-95"
                  aria-label={t('restaurant.aria.increase')}
                >
                  <PlusIcon />
                </button>
                <div className="text-3xl font-extrabold text-navy">{quantity}</div>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-navy text-white transition-all duration-200 hover:brightness-110 active:brightness-95"
                  aria-label={t('restaurant.aria.decrease')}
                >
                  <MinusIcon />
                </button>
              </div>

              <Button
                className="mt-6 h-11 w-full rounded-xl text-sm font-semibold sm:h-12 sm:rounded-2xl"
                disabled={addingToCart}
                onClick={() => {
                  if (addingToCart) return
                  onAddToCart({
                    item,
                    quantity,
                    selectedSize,
                    selectedAddons,
                    unitPrice,
                  })
                }}
              >
                {t('restaurant.modal.addToCart')}
              </Button>

              <p className="mt-3 text-center text-sm text-muted">
                {t('restaurant.modal.unitPrice')}:{' '}
                <span className="font-bold text-navy">{formatDisplayCurrency(unitPrice)}</span>
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  )
}
