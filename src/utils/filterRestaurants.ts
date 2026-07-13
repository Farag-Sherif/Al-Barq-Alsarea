import type { Category, CuisineType, Restaurant } from '@/store/types/domain'
import type { RestaurantsQuery } from '@/api/mockApi'

export function filterRestaurantsData(
  allRestaurants: Restaurant[],
  categories: Category[],
  cuisines: CuisineType[],
  query: RestaurantsQuery
): { items: Restaurant[]; total: number; tagCounts: Record<string, number> } {
  const normalize = (value: string): string =>
    value
      .toLowerCase()
      .normalize('NFKC')
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

  // 1. Apply all filters EXCEPT category to compute category counts
  let baseFiltered = [...allRestaurants]

  if (query.search?.trim()) {
    const needle = query.search.trim().toLowerCase()
    baseFiltered = baseFiltered.filter((restaurant) => {
      return restaurant.name.toLowerCase().includes(needle) || restaurant.cuisine.toLowerCase().includes(needle)
    })
  }



  if (query.address?.trim()) {
    const addressNeedle = normalize(query.address)
    const hasAddressMetadata = baseFiltered.some((restaurant) =>
      [restaurant.address, restaurant.addressAr, restaurant.city]
        .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
        .some((value) => normalize(value).length > 0),
    )

    if (hasAddressMetadata) {
      baseFiltered = baseFiltered.filter((restaurant) => {
        const haystack = [restaurant.address, restaurant.addressAr, restaurant.city]
          .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
          .map((value) => normalize(value))
          .filter(Boolean)
        return haystack.some((value) => value.includes(addressNeedle) || addressNeedle.includes(value))
      })
    }
  }

  if ((query.minRating ?? 0) > 0) {
    baseFiltered = baseFiltered.filter((restaurant) => restaurant.rating >= (query.minRating ?? 0))
  }

  if (query.openNow === true) {
    baseFiltered = baseFiltered.filter((restaurant) => restaurant.isOpen)
  } else if (query.openNow === false) {
    baseFiltered = baseFiltered.filter((restaurant) => !restaurant.isOpen)
  }

  // 2. Compute unified tag counts
  const tagCounts: Record<string, number> = {}
  
  const allTagNeedles = new Map<string, string[]>()
  
  // Extract all tag needles from categories and cuisines
  for (const category of categories) {
    const needles = [category.name, category.nameAr, category.nameEn].filter(Boolean) as string[]
    allTagNeedles.set(category.id, needles)
    allTagNeedles.set(category.id.toLowerCase(), needles)
    // also set by name so we can map selectedTags back to needles
    allTagNeedles.set(normalize(category.name), needles)
  }
  for (const cuisine of cuisines) {
    const needles = [cuisine.label, cuisine.labelAr, cuisine.labelEn].filter(Boolean) as string[]
    allTagNeedles.set(cuisine.key, needles)
    allTagNeedles.set(cuisine.key.toLowerCase(), needles)
    allTagNeedles.set(normalize(cuisine.label), needles)
  }

  const getRestaurantTokens = (restaurant: Restaurant) => [
    restaurant.cuisine ?? '',
    restaurant.cuisineAr ?? '',
    restaurant.cuisineEn ?? '',
    ...(restaurant.tags || [])
  ].map(normalize).filter(Boolean)

  for (const [key, needles] of allTagNeedles.entries()) {
    const normalizedNeedles = needles.map(normalize).filter(Boolean)
    if (normalizedNeedles.length === 0) continue

    const matchingCount = baseFiltered.filter((restaurant) => {
      const tokens = getRestaurantTokens(restaurant)
      return normalizedNeedles.some(needle => 
        tokens.some(token => token === needle || token.includes(needle) || needle.includes(token))
      )
    }).length
    tagCounts[key] = matchingCount
  }

  // 3. Finally, apply selectedTags filter
  let fullyFiltered = baseFiltered
  if (query.selectedTags?.length) {
    const selectedNormalized = query.selectedTags.map(normalize).filter(Boolean)
    
    // Resolve any selected tags that are IDs/keys into their needle arrays, otherwise use the tag itself
    const activeNeedles = selectedNormalized.flatMap(tag => {
      const resolved = allTagNeedles.get(tag)
      return resolved ? resolved.map(normalize) : [tag]
    }).filter(Boolean)

    fullyFiltered = fullyFiltered.filter((restaurant) => {
      const tokens = getRestaurantTokens(restaurant)
      return activeNeedles.some((needle) => 
        tokens.some((token) => token === needle || token.includes(needle) || needle.includes(token))
      )
    })
  }

  // 4. Sort and paginate
  if (query.sortBy === 'rating') {
    fullyFiltered.sort((a, b) => b.rating - a.rating)
  } else if (query.sortBy === 'orders') {
    fullyFiltered.sort((a, b) => b.ordersCount - a.ordersCount)
  }

  const page = Math.max(1, query.page ?? 1)
  const pageSize = Math.max(1, query.pageSize ?? 10)
  const start = (page - 1) * pageSize
  const total = fullyFiltered.length

  return {
    items: fullyFiltered.slice(start, start + pageSize),
    total,
    tagCounts,
  }
}
