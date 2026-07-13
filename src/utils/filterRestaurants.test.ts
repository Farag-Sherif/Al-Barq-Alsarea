import { describe, expect, it } from 'vitest'
import { filterRestaurantsData } from './filterRestaurants'
import type { Category, CuisineType, Restaurant } from '@/store/types/domain'

const mockCategories: Category[] = [
  { id: 'c1', name: 'Fast Food', nameAr: 'وجبات سريعة', imageUrl: '', restaurantsCount: 0 },
  { id: 'c2', name: 'Drinks', nameAr: 'مشروبات', imageUrl: '', restaurantsCount: 0 },
]

const mockCuisines: CuisineType[] = [
  { key: 'american', label: 'American', labelAr: '' },
  { key: 'italian', label: 'Italian', labelAr: '' },
]

const mockRestaurants: Restaurant[] = [
  {
    id: 'r1',
    name: 'Burger King',
    nameAr: '',
    nameEn: '',
    logoUrl: '',
    coverUrl: '',
    rating: 4.5,
    reviewsCount: 10,
    cuisine: 'American',
    tags: ['Fast Food', 'Burgers'],
    isOpen: true,
    ordersCount: 100,
    deliveryTimeMin: 10,
    deliveryTimeMax: 20,
    minimumOrder: 0,
    city: 'Riyadh',
    address: 'Street 1',
  },
  {
    id: 'r2',
    name: 'Pizza Hut',
    nameAr: '',
    nameEn: '',
    logoUrl: '',
    coverUrl: '',
    rating: 4.0,
    reviewsCount: 20,
    cuisine: 'Italian',
    tags: ['Fast Food', 'Pizza'],
    isOpen: false,
    ordersCount: 50,
    deliveryTimeMin: 20,
    deliveryTimeMax: 30,
    minimumOrder: 0,
    city: 'Riyadh',
    address: 'Street 2',
  },
  {
    id: 'r3',
    name: 'Starbucks',
    nameAr: '',
    nameEn: '',
    logoUrl: '',
    coverUrl: '',
    rating: 4.8,
    reviewsCount: 30,
    cuisine: 'American',
    tags: ['Drinks', 'Coffee'],
    isOpen: true,
    ordersCount: 200,
    deliveryTimeMin: 5,
    deliveryTimeMax: 15,
    minimumOrder: 0,
    city: 'Jeddah',
    address: 'Street 3',
  },
]

describe('filterRestaurantsData', () => {
  it('should return all items and accurate counts when no filters are applied', () => {
    const result = filterRestaurantsData(mockRestaurants, mockCategories, mockCuisines, {})
    expect(result.total).toBe(3)
    expect(result.items.length).toBe(3)
    expect(result.tagCounts).toEqual({
      c1: 2, // r1, r2
      'fast food': 2,
      c2: 1, // r3
      drinks: 1,
      american: 2,
      italian: 1,
    })
  })

  it('should filter by openNow and calculate counts correctly', () => {
    const result = filterRestaurantsData(mockRestaurants, mockCategories, mockCuisines, { openNow: true })
    expect(result.total).toBe(2) // r1, r3
    expect(result.tagCounts['c1']).toBe(1)
    
    // Verifying acceptance criteria: Displayed count === filtered results length when category is applied
    const resultCategory1 = filterRestaurantsData(mockRestaurants, mockCategories, mockCuisines, { openNow: true, selectedTags: ['c1'] })
    expect(resultCategory1.total).toBe(result.tagCounts['c1'])
  })

  it('should filter by minRating and calculate counts correctly', () => {
    const result = filterRestaurantsData(mockRestaurants, mockCategories, mockCuisines, { minRating: 4.5 })
    expect(result.total).toBe(2) // r1, r3
    expect(result.tagCounts['c1']).toBe(1)
    expect(result.tagCounts['c2']).toBe(1)
  })

  it('should apply search correctly', () => {
    const result = filterRestaurantsData(mockRestaurants, mockCategories, mockCuisines, { search: 'pizza' })
    expect(result.total).toBe(1) // r2
    expect(result.tagCounts['c1']).toBe(1)
    expect(result.tagCounts['c2']).toBe(0)
  })

  it('should sort correctly', () => {
    const resultRating = filterRestaurantsData(mockRestaurants, mockCategories, mockCuisines, { sortBy: 'rating' })
    expect(resultRating.items[0].id).toBe('r3') // 4.8
    expect(resultRating.items[1].id).toBe('r1') // 4.5
    expect(resultRating.items[2].id).toBe('r2') // 4.0

    const resultOrders = filterRestaurantsData(mockRestaurants, mockCategories, mockCuisines, { sortBy: 'orders' })
    expect(resultOrders.items[0].id).toBe('r3') // 200
    expect(resultOrders.items[1].id).toBe('r1') // 100
    expect(resultOrders.items[2].id).toBe('r2') // 50
  })

  it('should paginate correctly', () => {
    const result = filterRestaurantsData(mockRestaurants, mockCategories, mockCuisines, { page: 1, pageSize: 2 })
    expect(result.total).toBe(3)
    expect(result.items.length).toBe(2)
  })
  
  it('should verify acceptance criteria: displayedCount === filteredRestaurants.length for every category', () => {
    const filters = { openNow: true, minRating: 4.0, search: 'a' }
    
    // 1. Get counts using base filters
    const baseResult = filterRestaurantsData(mockRestaurants, mockCategories, mockCuisines, filters)
    
    // 2. Verify for each category
    for (const category of mockCategories) {
      const categorySpecificResult = filterRestaurantsData(mockRestaurants, mockCategories, mockCuisines, { ...filters, selectedTags: [category.id] })
      expect(baseResult.tagCounts[category.id]).toBe(categorySpecificResult.total)
    }
  })
})
