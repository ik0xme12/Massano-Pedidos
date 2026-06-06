"use client"

import { useState } from "react"
import Image from "next/image"
import { MassanoLogo } from "@/components/brand/MassanoLogo"
import { Button } from "@/components/ds"
import { CartDrawer } from "@/components/cart/CartDrawer"
import { LoginModal } from "@/components/auth/LoginModal"
import { SearchBar } from "@/components/search/SearchBar"
import { CategoryFilter } from "@/components/search/CategoryFilter"
import { FilterBar } from "@/components/search/FilterBar"
import { CustomizeModal, type ProductCustomization } from "@/components/products/CustomizeModal"
import { useCartStore } from "@/store/cart"
import { useProducts } from "@/hooks/use-products"
import { useAuth } from "@/contexts/auth-context"
import { useLoginModal } from "@/hooks/use-login-modal"
import { useProductCustomizations } from "@/hooks/use-product-customizations"
import { formatDeliveryTime, formatPrice } from "@/lib/utils"
import { productSearch } from "@/lib/product-search"
import { Clock, ShoppingBag, Star, Truck, LogOut } from "lucide-react"
import type { Product } from "@shared/types"

const CATEGORIES = [
  "Todo",
  "Pan Gourmet",
  "Masa Madre",
  "Pan Tradicional",
  "Panques",
  "Galletas",
  "Pasteles",
  "Tartas",
  "Postres",
  "Bebidas Calientes",
  "Bebidas Frías",
  "Frappes",
  "Bebidas de Temporada",
  "Sándwiches",
  "Sándwiches de Temporada",
  "Ensaladas",
  "Combos Fijos",
  "Combos Rolados",
]

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todo")
  const [sortBy, setSortBy] = useState<"name" | "price-asc" | "price-desc" | "newest">("newest")
  const [customizeProduct, setCustomizeProduct] = useState<Product | null>(null)

  const { add, totalItems, toggleCart, items } = useCartStore()
  const { products, loading, error } = useProducts()
  const { user, signOut } = useAuth()
  const loginModal = useLoginModal()
  const { saveCustomization } = useProductCustomizations()

  const getQuantity = (id: string) =>
    items.find((i) => i.product.id === id)?.quantity ?? 0

  const needsCustomization = (product: Product): boolean => {
    const name = product.name?.toLowerCase() || ""
    const category = product.category?.toLowerCase() || ""
    return name.includes('café') || name.includes('café') || category === 'bebidas' ||
           name.includes('sándwich') || category === 'sándwiches'
  }

  const handleAddProduct = async (product: Product) => {
    if (needsCustomization(product)) {
      setCustomizeProduct(product)
    } else {
      add(product as any)
    }
  }

  const handleConfirmCustomization = async (customization: ProductCustomization) => {
    if (customizeProduct) {
      add(customizeProduct as any, customization)
      if (user) {
        try {
          await saveCustomization(user.id, customizeProduct.id, customization)
        } catch (err) {
          console.error('Error saving customization:', err)
        }
      }
      setCustomizeProduct(null)
    }
  }

  const displayProducts = loading
    ? []
    : productSearch.filterAndSort(products, {
        query: searchQuery,
        category: selectedCategory,
        sortBy,
      })

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="min-h-screen bg-background">
      <CartDrawer />

      {customizeProduct && (
        <CustomizeModal
          isOpen={!!customizeProduct}
          productName={customizeProduct.name}
          productCategory={customizeProduct.category}
          onClose={() => setCustomizeProduct(null)}
          onConfirm={handleConfirmCustomization}
        />
      )}

      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-white border-b border-border">
        <div className="mx-auto max-w-2xl px-5 h-20 flex items-center justify-between">
          <MassanoLogo variant="dark" size="xs" priority />
          <div className="flex items-center gap-2">
            <button
              onClick={toggleCart}
              className="relative p-2 text-foreground hover:text-gold transition-colors"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-gold text-[10px] font-bold text-brand-black flex items-center justify-center">
                  {totalItems()}
                </span>
              )}
            </button>
            {user ? (
              <div className="flex items-center gap-2">
                <a
                  href="/mis-pedidos"
                  className="px-3 py-1.5 text-xs font-medium text-foreground hover:text-gold transition-colors"
                >
                  Pedidos
                </a>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-foreground">{user.email?.split('@')[0]}</span>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-foreground hover:text-destructive transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Button variant="gold" size="sm" onClick={loginModal.open}>
                Ingresar
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="bg-olive text-white overflow-hidden">
        <div className="mx-auto max-w-2xl px-5 pt-10 pb-14">
          <Image
            src="/massano5.png"
            alt="Massano Cafetería"
            width={280}
            height={100}
            priority
            className="object-contain mb-4"
            style={{
              filter: "brightness(0) saturate(100%) invert(69%) sepia(28%) saturate(550%) hue-rotate(4deg) brightness(80%)",
            }}
          />
          <h1 className="font-display text-4xl font-bold leading-tight mb-4 text-white">
            Tu mesa favorita,<br />
            <span className="text-gold">en tu puerta.</span>
          </h1>
          <p className="text-white/70 text-base leading-relaxed mb-8 max-w-sm">
            Pedí tus favoritos de la cafetería y los recibís frescos en minutos.
          </p>
          <div className="flex flex-wrap items-center gap-4 mb-8 text-sm text-white/60">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-gold" />
              <span>{formatDeliveryTime(20, 35)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-gold" />
              <span>Envío {formatPrice(600)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-gold fill-gold" />
              <span>4.9 · 318 reseñas</span>
            </div>
          </div>
          <Button variant="gold" size="lg" onClick={toggleCart}>
            Ver mi pedido
          </Button>
        </div>
      </section>

      {/* ── Search ── */}
      <section className="bg-white border-b border-border sticky top-20 z-20">
        <div className="mx-auto max-w-2xl px-5 py-4 space-y-4">
          <SearchBar onSearch={setSearchQuery} />

          <div className="flex gap-3 items-center justify-between">
            <CategoryFilter
              categories={CATEGORIES}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
            <FilterBar sortBy={sortBy} onSortChange={setSortBy} />
          </div>
        </div>
      </section>

      {/* ── Menú ── */}
      <main className="mx-auto max-w-2xl px-5 py-8">
        <h2 className="font-display text-2xl font-semibold mb-6">
          {selectedCategory === "Todo" ? "Menú" : selectedCategory}
        </h2>

        {error && (
          <div className="text-center py-8 text-destructive">
            <p>Error cargando productos. Por favor, intenta de nuevo.</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-8 text-muted-foreground">
            <p>Cargando menú...</p>
          </div>
        )}

        {!loading && displayProducts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>
              {searchQuery
                ? `No encontramos productos con "${searchQuery}"`
                : "No hay productos disponibles por el momento."}
            </p>
          </div>
        )}

        {!loading && displayProducts.length > 0 && (
          <p className="text-xs text-muted-foreground mb-6">
            {displayProducts.length} producto{displayProducts.length !== 1 ? "s" : ""} encontrado{displayProducts.length !== 1 ? "s" : ""}
          </p>
        )}

        <div className="flex flex-col divide-y divide-border">
          {displayProducts.map((product) => {
            const qty = getQuantity(product.id)
            return (
              <article key={product.id} className="flex items-start gap-4 py-6 group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] text-muted-foreground uppercase tracking-wider">
                      {product.category}
                    </span>
                    {product.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gold/15 text-gold-dark border border-gold/20">
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-base font-semibold mb-3 leading-snug">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-xs text-muted-foreground mb-2">{product.description}</p>
                  )}
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold">{formatPrice(product.price)}</span>

                    {qty === 0 ? (
                      <button
                        onClick={() => handleAddProduct(product)}
                        className="border border-brand-black rounded-full px-4 py-1.5 text-xs font-medium hover:bg-brand-black hover:text-white transition-colors"
                      >
                        + Agregar
                      </button>
                    ) : needsCustomization(product) ? (
                      <button
                        onClick={toggleCart}
                        className="border border-gold bg-gold/5 text-gold rounded-full px-4 py-1.5 text-xs font-medium hover:bg-gold/10 transition-colors"
                      >
                        {qty} en carrito
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 border border-brand-black rounded-full px-2 py-1">
                        <button
                          onClick={() => useCartStore.getState().decrement(product.id)}
                          className="w-5 h-5 flex items-center justify-center font-bold text-sm leading-none"
                        >
                          −
                        </button>
                        <span className="text-sm font-semibold w-4 text-center tabular-nums">
                          {qty}
                        </span>
                        <button
                          onClick={() => useCartStore.getState().increment(product.id)}
                          className="w-5 h-5 flex items-center justify-center font-bold text-sm leading-none"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {product.image_url && (
                  <div className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-muted border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-card mt-8">
        <div className="mx-auto max-w-2xl px-5 py-8 flex items-center justify-between">
          <MassanoLogo variant="dark" size="xs" />
          <p className="text-xs text-muted-foreground">© 2026 · Todos los derechos reservados</p>
        </div>
      </footer>

      {/* ── Floating cart button (mobile) ── */}
      {totalItems() > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
          <button
            onClick={toggleCart}
            className="flex items-center gap-3 bg-brand-black text-white rounded-full px-6 py-3.5 shadow-xl hover:bg-brand-black/90 transition-all"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="text-sm font-semibold">
              Ver pedido · {formatPrice(useCartStore.getState().totalPrice())}
            </span>
            <span className="bg-gold text-brand-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {totalItems()}
            </span>
          </button>
        </div>
      )}

      {/* ── Login Modal ── */}
      <LoginModal
        isOpen={loginModal.isOpen}
        onClose={loginModal.close}
        onSuccess={() => {
          // Opcional: hacer algo después de login
        }}
      />
    </div>
  )
}
