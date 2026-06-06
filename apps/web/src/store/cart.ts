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

const getItemKey = (productId: string, customization?: ProductCustomization): string => {
  return customization
    ? `${productId}-${JSON.stringify(customization)}`
    : productId
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      add: (product, customization) => {
        const itemKey = getItemKey(product.id, customization)
        const existing = get().items.find((i) =>
          i.product.id === product.id &&
          JSON.stringify(i.customization) === JSON.stringify(customization)
        )

        if (existing) {
          set({ items: get().items.map((i) =>
            i.product.id === product.id &&
            JSON.stringify(i.customization) === JSON.stringify(customization)
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )})
        } else {
          set({ items: [...get().items, { product, quantity: 1, customization }] })
        }
      },

      remove: (productId, customizationKey) =>
        set({ items: get().items.filter((i) =>
          !(i.product.id === productId &&
            JSON.stringify(i.customization) === JSON.stringify(customizationKey ? JSON.parse(customizationKey) : undefined))
        )}),

      increment: (productId, customizationKey) =>
        set({ items: get().items.map((i) =>
          i.product.id === productId &&
          JSON.stringify(i.customization) === JSON.stringify(customizationKey ? JSON.parse(customizationKey) : undefined)
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )}),

      decrement: (productId, customizationKey) => {
        const item = get().items.find((i) =>
          i.product.id === productId &&
          JSON.stringify(i.customization) === JSON.stringify(customizationKey ? JSON.parse(customizationKey) : undefined)
        )
        if (!item) return
        if (item.quantity === 1) {
          get().remove(productId, customizationKey)
        } else {
          set({ items: get().items.map((i) =>
            i.product.id === productId &&
            JSON.stringify(i.customization) === JSON.stringify(customizationKey ? JSON.parse(customizationKey) : undefined)
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
