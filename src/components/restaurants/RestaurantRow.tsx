import type { MouseEvent } from 'react'
import { Link } from 'react-router-dom'

import type { Restaurant } from '@/store/types/domain'
import { ClockIcon, HeartIcon, StarIcon } from '@/components/icons'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { toggleFavoriteThunk } from '@/store/slices/accountSlice'
import { resolveApiErrorMessage } from '@/api'
import { toast } from '@/lib/toast'
import { useI18n } from '@/i18n/I18nProvider'

type Props = {
  restaurant: Restaurant
}

export default function RestaurantRow({ restaurant }: Props) {
  const dispatch = useAppDispatch()
  const { lang, t } = useI18n()

  const displayName =
    lang === 'ar'
      ? restaurant.nameAr || restaurant.name || restaurant.nameEn || ''
      : restaurant.nameEn || restaurant.name || restaurant.nameAr || ''

  const displayCuisine =
    lang === 'ar'
      ? restaurant.cuisineAr || restaurant.cuisine || restaurant.cuisineEn || ''
      : restaurant.cuisineEn || restaurant.cuisine || restaurant.cuisineAr || ''

  const favoriteRestaurantIds = useAppSelector((s) => s.account.favoriteRestaurantIds)
  const isFavorite = favoriteRestaurantIds.includes(restaurant.id)

  async function toggleFavorite(e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    try {
      const next = await dispatch(toggleFavoriteThunk(restaurant.id)).unwrap()
      const added = next.includes(restaurant.id)
      toast.success(added ? t('toast.favoriteAdded') : t('toast.favoriteRemoved'))
    } catch (error) {
      toast.error(resolveApiErrorMessage(error, t('toast.favoriteUpdateFailed')))
    }
  }

  return (
    <Link
      to={`/restaurants/${restaurant.id}`}
      className="relative flex items-center gap-4 rounded-3xl border border-border bg-white p-4 shadow-card hover:border-primary/40 hover:shadow-soft"
    >
      <img src={restaurant.logoUrl} alt={displayName} className="h-16 w-16 rounded-2xl object-cover" />

      <div className="flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-extrabold text-navy">{displayName}</div>
            <div className="mt-1 text-xs font-semibold text-muted">{displayCuisine}</div>
          </div>

          <button
            type="button"
            className={
              'inline-flex h-10 w-10 items-center justify-center rounded-full border transition ' +
              (isFavorite
                ? 'border-primary/30 bg-primary/10 text-primary'
                : 'border-border bg-white text-muted hover:bg-screen')
            }
            onClick={toggleFavorite}
            aria-label={isFavorite ? t('restaurant.removeFromFavorites') : t('restaurant.addToFavorites')}
          >
            <HeartIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-3 py-1 text-xs font-extrabold text-navy">
            <StarIcon size={14} filled /> {restaurant.rating.toFixed(1)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-screen px-3 py-1 text-xs font-extrabold text-muted">
            <ClockIcon className="h-4 w-4" /> {t('restaurant.deliveryTime', { min: restaurant.deliveryTimeMin, max: restaurant.deliveryTimeMax })}
          </span>
          <span
            className={
              'inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold ' +
              (restaurant.isOpen ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700')
            }
          >
            {restaurant.isOpen ? t('restaurant.branches.open') : t('restaurant.branches.closed')}
          </span>
        </div>
      </div>
    </Link>
  )
}
