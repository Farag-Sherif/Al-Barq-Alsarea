export type MenuOption = {
  id: string
  label: string
  labelAr?: string
  labelEn?: string
  /** Extra price added on top of base item price */
  price: number
}

export type MenuCategory = {
  id: string
  name: string
  nameAr?: string
  nameEn?: string
  imageUrl: string
}

export type MenuItem = {
  id: string
  restaurantId: string
  categoryId: string
  name: string
  nameAr?: string
  nameEn?: string
  description: string
  descriptionAr?: string
  descriptionEn?: string
  /** Base price */
  price: number
  oldPrice?: number
  isOnSale?: boolean
  imageUrl: string
  isAvailable?: boolean
  vatPercentage?: number
  vatIncluded?: boolean
  discountPercentage?: number
  discountStart?: string
  discountEnd?: string

  sizes?: MenuOption[]
  addons?: MenuOption[]
}

// A simple mock menu. In a real project this would come from the API.
const categories: MenuCategory[] = [
  { id: 'cat-pizza', name: 'بيتزا', imageUrl: '/images/cat-pizza.jpg' },
  { id: 'cat-salad', name: 'سلطة', imageUrl: '/images/cat-salad.jpg' },
  { id: 'cat-pasta', name: 'مكرونة', imageUrl: '/images/cat-pasta.jpg' },
]

const sharedSizes: MenuOption[] = [
  { id: 'size-small', label: 'صغير', price: 0 },
  { id: 'size-medium', label: 'وسط', price: 30 },
]

const sharedAddons: MenuOption[] = [
  { id: 'add-cheese', label: 'جبنة اضافية', price: 10 },
  { id: 'add-ranch', label: 'صوص رانش', price: 5 },
]

const items: MenuItem[] = [
  {
    id: 'mi-margherita',
    restaurantId: 'bk-1',
    categoryId: 'cat-pizza',
    name: 'بيتزا مارجريتا',
    description: 'تأتي مع 3 أنواع من الجبن رومي - تركي - موزتريلا',
    price: 60,
    oldPrice: 80,
    imageUrl: '/images/dish-1.jpg',
    sizes: sharedSizes,
    addons: sharedAddons,
  },
  {
    id: 'mi-pepperoni',
    restaurantId: 'bk-1',
    categoryId: 'cat-pizza',
    name: 'بيتزا بيبروني',
    description: 'شرائح بيبروني مع جبنة موزتريلا وصوص طماطم',
    price: 60,
    oldPrice: 80,
    imageUrl: '/images/dish-1.jpg',
    sizes: sharedSizes,
    addons: sharedAddons,
  },
  {
    id: 'mi-salad-chicken',
    restaurantId: 'bk-1',
    categoryId: 'cat-salad',
    name: 'سلطة سيزر بالدجاج',
    description: 'خس طازج مع دجاج مشوي وصوص سيزر',
    price: 30,
    imageUrl: '/images/cat-salad.jpg',
    addons: [{ id: 'add-bread', label: 'خبز محمص', price: 3 }],
  },
  {
    id: 'mi-pasta',
    restaurantId: 'bk-1',
    categoryId: 'cat-pasta',
    name: 'مكرونة الفريدو',
    description: 'مكرونة بصوص كريمي وجبنة بارميزان',
    price: 45,
    imageUrl: '/images/cat-pasta.jpg',
    addons: [{ id: 'add-mushroom', label: 'مشروم', price: 6 }],
  },
]

export function getMenuCategories(_restaurantId: string): MenuCategory[] {
  // For demo purposes all restaurants share the same categories.
  return categories
}

export function getMenuItems(restaurantId: string): MenuItem[] {
  // If we don't have items for the requested restaurant, fallback to the demo set.
  const filtered = items.filter((i) => i.restaurantId === restaurantId)
  return filtered.length ? filtered : items.map((i) => ({ ...i, restaurantId }))
}
