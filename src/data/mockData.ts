import type { Brand, Category, Kitchen, Restaurant } from '@/store/types/domain'

export const kitchens: Kitchen[] = [
  {
    id: 'k1',
    title: 'مطاعم خمس نجوم',
    subtitle: 'مطاعم خمس نجوم',
    imageUrl: '/images/kitchen-1.jpg',
    discountLabel: '-20%',
  },
  {
    id: 'k2',
    title: 'مطاعم سريعة',
    subtitle: 'أفضل المطاعم السريعة',
    imageUrl: '/images/kitchen-2.jpg',
  },
  {
    id: 'k3',
    title: 'مطاعم قهوة',
    subtitle: 'قهوة ومخبوزات',
    imageUrl: '/images/kitchen-3.jpg',
    discountLabel: '-20%',
  },
  {
    id: 'k4',
    title: 'مطاعم مصرية',
    subtitle: 'أشهر الأطباق المصرية',
    imageUrl: '/images/kitchen-2.jpg',
  },
  {
    id: 'k5',
    title: 'مطاعم خليجية',
    subtitle: 'أطباق خليجية مميزة',
    imageUrl: '/images/kitchen-1.jpg',
  },
  {
    id: 'k6',
    title: 'مطاعم إيطالية',
    subtitle: 'بيتزا وباستا',
    imageUrl: '/images/kitchen-3.jpg',
  },
]

export const suggestedBrands: Brand[] = [
  { id: 'bk-1', name: 'كنتاكي', logoUrl: '/images/brand-kfc.png' },
  { id: 'bk-2', name: 'بابا جونز', logoUrl: '/images/brand-papajohns.png' },
  { id: 'bk-3', name: 'تكساس تشيكن', logoUrl: '/images/brand-texas.png' },
  { id: 'bk-4', name: 'برجر كنج', logoUrl: '/images/brand-burgerking.png' },
  { id: 'bk-5', name: 'شاورما', logoUrl: '/images/brand-shawarma.png' },
]

export const categories: Category[] = [
  { id: 'c1', name: 'بيتزا', imageUrl: '/images/cat-pizza.jpg', restaurantsCount: 32 },
  { id: 'c2', name: 'سلطة', imageUrl: '/images/cat-salad.jpg', restaurantsCount: 10 },
  { id: 'c3', name: 'مكرونة وباستا', imageUrl: '/images/cat-pasta.jpg', restaurantsCount: 4 },
  { id: 'c4', name: 'مشويات', imageUrl: '/images/cat-pizza.jpg', restaurantsCount: 24 },
]

export const mostOrderedRestaurants: Restaurant[] = [
  {
    id: 'bk-1',
    name: 'كنتاكي',
    logoUrl: '/images/albarq-main-logo-180.png',
    coverUrl: '/images/dish-1.jpg',
    cuisine: 'مطعم وجبات سريعة',
    tags: ['سريع', 'مشويات'],
    rating: 4.6,
    reviewsCount: 220,
    ordersCount: 260,
    deliveryTimeMin: 20,
    deliveryTimeMax: 45,
    isOpen: true,
  },
  {
    id: 'bk-2',
    name: 'بابا جونز',
    logoUrl: '/images/albarq-main-logo-180.png',
    coverUrl: '/images/dish-1.jpg',
    cuisine: 'مطعم بيتزا',
    tags: ['بيتزا', 'سريع'],
    rating: 4.5,
    reviewsCount: 190,
    ordersCount: 230,
    deliveryTimeMin: 25,
    deliveryTimeMax: 50,
    isOpen: true,
  },
  {
    id: 'bk-3',
    name: 'تكساس تشيكن',
    logoUrl: '/images/albarq-main-logo-180.png',
    coverUrl: '/images/dish-1.jpg',
    cuisine: 'مطعم دجاج مقلي',
    tags: ['سريع', 'دجاج'],
    rating: 4.4,
    reviewsCount: 170,
    ordersCount: 205,
    deliveryTimeMin: 22,
    deliveryTimeMax: 48,
    isOpen: true,
  },
  {
    id: 'bk-4',
    name: 'برجر كنج',
    logoUrl: '/images/albarq-main-logo-180.png',
    coverUrl: '/images/dish-1.jpg',
    cuisine: 'مطعم برجر',
    tags: ['برجر', 'سريع'],
    rating: 4.3,
    reviewsCount: 165,
    ordersCount: 198,
    deliveryTimeMin: 23,
    deliveryTimeMax: 52,
    isOpen: true,
  },
]

const categoryTagsByIndex = [
  'بيتزا',
  'سلطة',
  'مكرونة وباستا',
  'مشويات',
  'سلطة',
  'مكرونة وباستا',
  'بيتزا',
  'مشويات',
  'مكرونة وباستا',
  'بيتزا',
  'سلطة',
  'مشويات',
] as const

const cuisineLabelsByIndex = ['سعودي', 'إيطالي', 'مصري', 'آسيوي', 'مشويات', 'حلويات'] as const
const restaurantNamesByIndex = [
  'كنتاكي',
  'بابا جونز',
  'تكساس تشيكن',
  'برجر كنج',
  'شاورما السريع',
  'مطبخ مكة',
  'بيت البيتزا',
  'نكهة المشويات',
  'باستا هاوس',
  'سلطة وشوربة',
  'مطعم المدينة',
  'الطازج',
] as const

export const restaurants: Restaurant[] = Array.from({ length: 12 }).map((_, idx) => {
  const id = `bk-${idx + 1}`
  const dishTag = categoryTagsByIndex[idx]
  const cuisineLabel = cuisineLabelsByIndex[idx % cuisineLabelsByIndex.length]
  const name = restaurantNamesByIndex[idx]

  return {
    id,
    name,
    logoUrl: '/images/albarq-main-logo-180.png',
    coverUrl: '/images/dish-1.jpg',
    cuisine: `مطبخ ${cuisineLabel}`,
    tags: [cuisineLabel, 'سريع', dishTag],
    rating: 4.2 + (idx % 4) * 0.1,
    reviewsCount: 150 + idx * 6,
    ordersCount: 170 + idx * 8,
    deliveryTimeMin: 20 + (idx % 4) * 2,
    deliveryTimeMax: 45 + (idx % 5) * 3,
    isOpen: idx % 3 !== 0,
  }
})

export const cuisines = [
  { key: 'egypt', label: 'مصري' },
  { key: 'saudi', label: 'سعودي' },
  { key: 'italian', label: 'إيطالي' },
  { key: 'asian', label: 'آسيوي' },
  { key: 'grill', label: 'مشويات' },
  { key: 'dessert', label: 'حلويات' },
]
