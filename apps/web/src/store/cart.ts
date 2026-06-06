import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Product } from "@shared/types"
import type { ProductCustomization } from "@/components/products/CustomizeModal"

export type CartProduct = Pick<Product, "id" | "name" | "price" | "image_url" | "category">

export interface CartItem {
  product: CartProduct
  quantity: number
  customization?: ProductCustomization
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean

  // actions
  add:        (product: CartProduct, customization?: ProductCustomization) => void
  remove:     (productId: string, customizationKey?: string) => void
  increment:  (productId: string, customizationKey?: string) => void
  decrement:  (productId: string, customizationKey?: string) => void
  clear:      () => void
  openCart:   () => void
  closeCart:  () => void
  toggleCart: () => void

  // derived
  totalItems:  () => number
  totalPrice:  () => number
}

const sanitizeCustomization = (c?: ProductCustomization): ProductCustomization | undefined => {
  if (!c) return undefined
  const sanitized: any = {}
  for (const key in c) {
    const val = c[key as keyof ProductCustomization]
    if (val !== undefined && val !== null && (typeof val !== 'object' || Object.keys(val as any).length > 0)) {
      sanitized[key] = val
    }
  }
  return Object.keys(sanitized).length === 0 ? undefined : sanitized
}

const customizationToKey = (customization?: ProductCustomization): string | undefined => {
  const sanitized = sanitizeCustomization(customization)
  if (!sanitized) return undefined
  const keys = Object.keys(sanitized).sort()
  return JSON.stringify(keys.reduce((obj, k) => ({ ...obj, [k]: (sanitized as any)[k] }), {}))
}

const compareCustomizations = (c1?: ProductCustomization, c2?: ProductCustomization): boolean => {
  return customizationToKey(c1) === customizationToKey(c2)
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      add: (product, customization) => {
        const sanitized = sanitizeCustomization(customization)
        const existing = get().items.find((i) =>
          i.product.id === product.id &&
          compareCustomizations(i.customization, sanitized)
        )

        if (existing) {
          set({ items: get().items.map((i) =>
            i.product.id === product.id &&
            compareCustomizations(i.customization, sanitized)
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )})
        } else {
          set({ items: [...get().items, { product, quantity: 1, customization: sanitized }] })
        }
      },

      remove: (productId, customizationKey) => {
        const targetCustomization = customizationKey ? JSON.parse(customizationKey) : undefined
        set({ items: get().items.filter((i) =>
          !(i.product.id === productId &&
            compareCustomizations(i.customization, targetCustomization))
        )})
      },

      increment: (productId, customizationKey) => {
        const targetCustomization = customizationKey ? JSON.parse(customizationKey) : undefined
        set({ items: get().items.map((i) =>
          i.product.id === productId &&
          compareCustomizations(i.customization, targetCustomization)
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )})
      },

      decrement: (productId, customizationKey) => {
        const targetCustomization = customizationKey ? JSON.parse(customizationKey) : undefined
        const item = get().items.find((i) =>
          i.product.id === productId &&
          compareCustomizations(i.customization, targetCustomization)
        )
        if (!item) return
        if (item.quantity === 1) {
          get().remove(productId, customizationKey)
        } else {
          set({ items: get().items.map((i) =>
            i.product.id === productId &&
            compareCustomizations(i.customization, targetCustomization)
              ? { ...i, quantity: i.quantity - 1 }
              : i
          )})
        }
      },

      clear: () => set({ items: [] }),

      openCart:   () => set({ isOpen: true }),
      closeCart:  () => set({ isOpen: false }),
      toggleCart: () => set({ isOpen: !get().isOpen }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    }),
    { name: "massano-cart" }
  )
)
