// Menu Component Types matching Java backend

export type MenuCategory = "APPETIZER" | "MAIN_COURSE" | "DESSERT" | "BEVERAGE" | "OTHER"

export interface MenuIngredientRequest {
  variantId: string
  unitId: string
  quantity: number
}

export interface CreateMenuRequest {
  name: string
  code: string
  category: MenuCategory | string
  price: number
  ingredients: MenuIngredientRequest[]
}

export interface MenuIngredientResponse {
  id: string
  menuId: string
  variantId: string
  variantName?: string // Might be useful if backend populates it
  unitId: string
  unitName?: string // Might be useful if backend populates it
  quantity: number
}

export interface MenuResponse {
  id: string
  name: string
  code: string
  category: MenuCategory | string
  price: number
  ingredients?: MenuIngredientResponse[]
}

export interface GetMenusQueryRequest {
  page?: number
  size?: number
  category?: MenuCategory | string
  menuName?: string
  code?: string
}
