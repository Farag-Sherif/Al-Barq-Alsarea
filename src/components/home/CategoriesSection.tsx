import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import { useI18n } from '@/i18n/I18nProvider'
import Button from '@/components/ui/Button'
import { SearchIcon, ArrowLeftIcon, ArrowRightIcon } from '@/components/icons'
import type { Kitchen } from '@/store/types/domain'

interface CategoriesSectionProps {
  kitchens: Kitchen[]
  loading: boolean
  goToAllRestaurants: () => void
  goToRestaurantsByKitchen: (k: Kitchen) => void
  kitchenImageFallbacks: readonly string[]
}

const CHIPS = [
  { id: 'all', labelAr: 'الكل', labelEn: 'All', keywords: [] },
  { id: 'popular', labelAr: 'الأكثر شعبية', labelEn: 'Popular', keywords: [] },
  { id: 'arabic', labelAr: 'عربي وشرقي', labelEn: 'Arabic & Oriental', keywords: ['شرقي', 'عربي', 'شاورما', 'مشويات', 'مندي', 'بخاري', 'arabic', 'oriental', 'shawarma', 'grill', 'mandi'] },
  { id: 'asian', labelAr: 'آسيوي', labelEn: 'Asian', keywords: ['اسيوي', 'آسيوي', 'صيني', 'هندي', 'ياباني', 'سوشي', 'asian', 'chinese', 'indian', 'japanese', 'sushi'] },
  { id: 'european', labelAr: 'أوروبي', labelEn: 'European', keywords: ['اوروبي', 'أوروبي', 'ايطالي', 'فرنسي', 'بيتزا', 'باستا', 'european', 'italian', 'french', 'pizza', 'pasta'] },
  { id: 'desserts', labelAr: 'حلويات', labelEn: 'Desserts', keywords: ['حلى', 'حلويات', 'كيك', 'مخابز', 'حلو', 'آيس كريم', 'ايس كريم', 'desserts', 'sweets', 'cake', 'bakery', 'ice cream'] },
  { id: 'drinks', labelAr: 'قهوة ومشروبات', labelEn: 'Drinks & Coffee', keywords: ['قهوة', 'مشروبات', 'عصير', 'كافيه', 'كوفي', 'مقهى', 'drinks', 'coffee', 'juice', 'cafe', 'beverage'] },
  { id: 'fast_food', labelAr: 'وجبات سريعة', labelEn: 'Fast Food', keywords: ['وجبات سريعة', 'برجر', 'شطائر', 'سندويشات', 'فاست فود', 'fast food', 'burger', 'sandwiches'] },
  { id: 'healthy', labelAr: 'صحي', labelEn: 'Healthy', keywords: ['صحي', 'سلطات', 'دايت', 'نباتي', 'healthy', 'salads', 'diet', 'vegan', 'vegetarian'] },
  { id: 'seafood', labelAr: 'مأكولات بحرية', labelEn: 'Seafood', keywords: ['بحري', 'سمك', 'سي فود', 'seafood', 'fish'] },
]

export default function CategoriesSection({
  kitchens,
  loading,
  goToAllRestaurants,
  goToRestaurantsByKitchen,
  kitchenImageFallbacks,
}: CategoriesSectionProps) {
  const { t, dir, lang } = useI18n()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeChip, setActiveChip] = useState('all')
  const [showAll, setShowAll] = useState(false)

  const filteredKitchens = useMemo(() => {
    let result = kitchens

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(k => 
        (k.titleAr && k.titleAr.toLowerCase().includes(q)) ||
        (k.titleEn && k.titleEn.toLowerCase().includes(q)) ||
        (k.title && k.title.toLowerCase().includes(q))
      )
    }

    // Chip filter
    if (activeChip !== 'all') {
      if (activeChip === 'popular') {
        // Just take the first 12 as "popular" if we don't have stats
        result = result.slice(0, 12)
      } else {
        const chip = CHIPS.find(c => c.id === activeChip)
        if (chip && chip.keywords.length > 0) {
          result = result.filter(k => {
            const textToSearch = [k.title, k.titleAr, k.titleEn, k.subtitle, k.subtitleAr, k.subtitleEn].join(' ').toLowerCase()
            return chip.keywords.some(kw => textToSearch.includes(kw.toLowerCase()))
          })
        }
      }
    }

    return result
  }, [kitchens, searchQuery, activeChip])

  const featuredCount = 6
  const compactCountInit = 16
  const hasSearch = searchQuery.trim().length > 0 || activeChip !== 'all'
  
  // If user searched/filtered, show all results. If default, split into featured/compact and handle 'show more'
  const displayFeatured = hasSearch ? [] : filteredKitchens.slice(0, featuredCount)
  const displayCompact = hasSearch 
    ? filteredKitchens 
    : showAll 
      ? filteredKitchens.slice(featuredCount) 
      : filteredKitchens.slice(featuredCount, featuredCount + compactCountInit)

  const hasMore = !hasSearch && !showAll && filteredKitchens.length > featuredCount + compactCountInit

  function pickLocalizedApiText(values: { ar?: string | null; en?: string | null; fallback?: string | null; defaultValue?: string }): string {
    const arValue = (values.ar ?? '').trim()
    const enValue = (values.en ?? '').trim()
    const fallbackValue = (values.fallback ?? '').trim()
    if (lang === 'ar') return arValue || enValue || fallbackValue || values.defaultValue || ''
    return enValue || arValue || fallbackValue || values.defaultValue || ''
  }

  return (
    <section className="py-12" dir={dir}>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header & Search */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center justify-between gap-6">
            <h2 className="text-2xl font-bold text-navy md:text-3xl">{t('home.kitchens.title')}</h2>
            <Button variant="ghost" size="md" paddingNone className="p-0 text-navy hover:text-primary sm:hidden" onClick={goToAllRestaurants}>
              {t('home.kitchens.viewAll')}
            </Button>
          </div>
          
          <div className="flex w-full flex-1 items-center gap-4 sm:max-w-md">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 flex items-center px-3.5 text-muted-2">
                <SearchIcon className="h-5 w-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'ar' ? 'ابحث عن مطبخ أو فئة...' : 'Search categories...'}
                className="h-12 w-full rounded-full border border-gray-200 bg-white/60 pl-11 pr-4 text-sm font-semibold text-navy shadow-sm backdrop-blur transition-colors focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                dir={dir}
                style={dir === 'rtl' ? { paddingRight: '2.75rem', paddingLeft: '1rem' } : undefined}
              />
            </div>
            <Button variant="ghost" size="md" paddingNone className="hidden p-0 text-navy hover:text-primary sm:block shrink-0" onClick={goToAllRestaurants}>
              {t('home.kitchens.viewAll')}
            </Button>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="mt-6 -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 overscroll-x-contain [scroll-snap-type:x_mandatory] [-webkit-overflow-scrolling:touch] sm:mx-0 sm:px-0 scrollbar-hide">
          {CHIPS.map(chip => (
            <button
              key={chip.id}
              onClick={() => setActiveChip(chip.id)}
              className={clsx(
                'snap-start whitespace-nowrap rounded-full px-5 py-2 text-sm font-bold transition-all duration-200',
                activeChip === chip.id 
                  ? 'bg-primary text-white shadow-md' 
                  : 'bg-white text-navy border border-gray-100 hover:border-gray-200 hover:bg-gray-50 shadow-sm'
              )}
            >
              {lang === 'ar' ? chip.labelAr : chip.labelEn}
            </button>
          ))}
        </div>

        {loading && filteredKitchens.length === 0 ? (
          <div className="mt-8 flex justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary"></div>
          </div>
        ) : filteredKitchens.length === 0 ? (
          /* Empty State */
          <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-gray-50 py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
              <SearchIcon className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-navy">{lang === 'ar' ? 'لم يتم العثور على فئات' : 'No categories found'}</h3>
            <p className="mt-2 max-w-sm text-sm text-muted">{lang === 'ar' ? 'حاول البحث بكلمات مختلفة أو قم بإزالة عوامل التصفية' : 'Try searching with different keywords or clear filters'}</p>
            <Button 
              variant="outline" 
              className="mt-6 rounded-full border-gray-200" 
              onClick={() => { setSearchQuery(''); setActiveChip('all'); }}
            >
              {lang === 'ar' ? 'مسح البحث' : 'Clear Search'}
            </Button>
          </div>
        ) : (
          <div className="mt-8">
            {/* Featured Categories (Large Cards) */}
            {displayFeatured.length > 0 && (
              <div className="mb-8 flex gap-4 overflow-x-auto pb-4 overscroll-x-contain scrollbar-hide snap-x snap-mandatory sm:gap-6">
                {displayFeatured.map((k, idx) => {
                  const displayTitle = pickLocalizedApiText({ ar: k.titleAr, en: k.titleEn, fallback: k.title, defaultValue: k.title })
                  const displaySubtitle = pickLocalizedApiText({ ar: k.subtitleAr, en: k.subtitleEn, fallback: k.subtitle, defaultValue: k.subtitle })
                  const fallbackImage = kitchenImageFallbacks[idx % kitchenImageFallbacks.length]

                  return (
                    <motion.button
                      key={`featured-${k.id}`}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      onClick={() => goToRestaurantsByKitchen(k)}
                      className="group relative h-48 w-[280px] shrink-0 snap-start overflow-hidden rounded-2xl bg-white text-start shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:w-[320px] sm:h-52 lg:w-[360px] lg:h-56"
                    >
                      <img
                        src={k.imageUrl || fallbackImage}
                        alt={displayTitle}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = fallbackImage }}
                        className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.08]"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,8,31,0.02)_0%,rgba(3,8,31,0.7)_100%)] transition-opacity duration-300 group-hover:bg-[linear-gradient(180deg,rgba(3,8,31,0.1)_0%,rgba(3,8,31,0.85)_100%)]" />
                      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                        <p dir="auto" className="truncate text-xl font-extrabold shadow-sm">{displayTitle}</p>
                        {displaySubtitle && <p dir="auto" className="mt-1 truncate text-sm text-white/85">{displaySubtitle}</p>}
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            )}

            {/* Compact Categories (Small Cards) */}
            {displayCompact.length > 0 && (
              <motion.div 
                layout
                className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6 sm:gap-4"
              >
                <AnimatePresence>
                  {displayCompact.map((k, idx) => {
                    const displayTitle = pickLocalizedApiText({ ar: k.titleAr, en: k.titleEn, fallback: k.title, defaultValue: k.title })
                    const fallbackImage = kitchenImageFallbacks[idx % kitchenImageFallbacks.length]

                    return (
                      <motion.button
                        key={`compact-${k.id}`}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => goToRestaurantsByKitchen(k)}
                        className="group flex flex-col items-center justify-center gap-3 rounded-2xl p-2 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                      >
                        <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gray-50 sm:h-20 sm:w-20">
                          <img
                            src={k.imageUrl || fallbackImage}
                            alt={displayTitle}
                            loading="lazy"
                            decoding="async"
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = fallbackImage }}
                            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.15]"
                          />
                        </div>
                        <p dir="auto" className="w-full truncate text-center text-sm font-bold text-navy group-hover:text-primary sm:text-[15px]">
                          {displayTitle}
                        </p>
                      </motion.button>
                    )
                  })}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Show More Button */}
            {hasMore && (
              <div className="mt-10 flex justify-center">
                <Button 
                  variant="outline"
                  onClick={() => setShowAll(true)}
                  className="rounded-full border-gray-200 px-8 py-3 text-sm font-bold hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-300"
                >
                  {lang === 'ar' ? 'عرض المزيد من الفئات' : 'Show More Categories'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
