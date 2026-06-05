import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Product } from "@shared/types"

export type CartProduct = Pick<Product, "id" | "name" | "price" | "image_url" | "category">

export interface CartItem {
  product: CartProduct
  quantity: number
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean

  // actions
  add:        (product: CartProduct) => void
  remove:     (productId: string) => void
  increment:  (productId: string) => void
  decrement:  (productId: string) => void
  clear:      () => void
  openCart:   () => void
  closeCart:  () => void
  toggleCart: () => void

  // derived
  totalItems:  () => number
  totalPrice:  () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      add: (product) => {
        const existing = get().items.find((i) => i.product.id === product.id)
        if (existing) {
          set({ items: get().items.map((i) =>
            i.product.id === product.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )})
        } else {
          set({ items: [...get().items, { product, quantity: 1 }] })
        }
      },

      remove: (productId) =>
        set({ items: get().items.filter((i) => i.product.id !== productId) }),

      increment: (productId) =>
        set({ items: get().items.map((i) =>
          i.product.id === productId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )}),

      decrement: (productId) => {
        const item = get().items.find((i) => i.product.id === productId)
        if (!item) return
        if (item.quantity === 1) {
          get().remove(productId)
        } else {
          set({ items: get().items.map((i) =>
            i.product.id === productId
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
