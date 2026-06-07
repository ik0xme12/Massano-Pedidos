"use client"

import { useState } from "react"
import Image from "next/image"
import { MassanoLogo } from "@/components/brand/MassanoLogo"
import { Button } from "@/components/ds"
import { CartDrawer } from "@/components/cart/CartDrawer"
import { LoginModal } from "@/components/auth/LoginModal"
import { SearchBar } from "@/components/search/SearchBar"
import { CategoryModal } from "@/components/search/CategoryModal"
import { FilterBar } from "@/components/search/FilterBar"
import { CustomizeModal, type ProductCustomization } from "@/components/products/CustomizeModal"
import { useCartStore } from "@/store/cart"
import { useProducts } from "@/hooks/use-products"
import { useAuth } from "@/contexts/auth-context"
import { useLoginModal } from "@/hooks/use-login-modal"
import { useProductCustomizations } from "@/hooks/use-product-customizations"
import { useUserMostOrdered } from "@/hooks/use-user-most-ordered"
import { formatDeliveryTime, formatPrice } from "@/lib/utils"
import { productSearch } from "@/lib/product-search"
import { Clock, ShoppingBag, Star, LogOut, Sliders } from "lucide-react"
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
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)

  const { add, totalItems, toggleCart, items } = useCartStore()
  const { products, loading, error } = useProducts()
  const { user, signOut } = useAuth()
  const loginModal = useLoginModal()
  const { saveCustomization } = useProductCustomizations()
  const { product: mostOrderedProduct } = useUserMostOrdered(user?.id)

  // Get products by category
  const seasonalSandwiches = products.filter(p => p.category === 'Sándwiches de Temporada')
  const seasonalBeverages = products.filter(p => p.category === 'Bebidas de Temporada')

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
        <div className="mx-auto max-w-2xl px-5 pt-6 pb-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <Image
                src="/massano5.png"
                alt="Massano Cafetería"
                width={160}
                height={60}
                priority
                className="object-contain mb-3"
                style={{
                  filter: "brightness(0) saturate(100%) invert(69%) sepia(28%) saturate(550%) hue-rotate(4deg) brightness(80%)",
                }}
              />
              <h1 className="font-display text-3xl font-bold leading-tight mb-2 text-white">
                Tu pan y café favoritos,<br />
                <span className="text-gold">en tu puerta.</span>
              </h1>
              <p className="text-white/70 text-sm leading-relaxed mb-4 max-w-sm">
                Ordena tus favoritos de la cafetería y recíbelos frescos en minutos.
              </p>
              <div className="flex flex-wrap items-center gap-3 mb-4 text-xs text-white/60">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-gold" />
                  <span>{formatDeliveryTime(20, 35)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-gold fill-gold" />
                  <span>4.9 · 318 reseñas</span>
                </div>
              </div>
              <Button variant="gold" size="sm" onClick={toggleCart}>
                Ver mi pedido
              </Button>
            </div>

            {/* Carrusel de Productos */}
            <div className="flex-shrink-0 w-32">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {[
                  { name: 'Café', url: 'https://picsum.photos/112/112?random=1' },
                  { name: 'Pan', url: 'https://picsum.photos/112/112?random=2' },
                  { name: 'Pastel', url: 'https://picsum.photos/112/112?random=3' },
                  { name: 'Sándwich', url: 'https://picsum.photos/112/112?random=4' },
                  { name: 'Galletas', url: 'https://picsum.photos/112/112?random=5' },
                  { name: 'Bebida', url: 'https://picsum.photos/112/112?random=6' },
                ].map((item) => (
                  <div key={item.name} className="flex-shrink-0 w-28 h-28">
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Search ── */}
      <section className="bg-white border-b border-border sticky top-20 z-20">
        <div className="mx-auto max-w-2xl px-5 py-4 space-y-4">
          <SearchBar onSearch={setSearchQuery} />

          <div className="flex gap-3 items-center justify-between">
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-foreground hover:border-gold/50 focus:border-gold focus:ring-1 focus:ring-gold/20 transition-colors outline-none"
            >
              <Sliders className="h-4 w-4" />
              <span className="text-sm font-medium">
                {selectedCategory === "Todo" ? "Categorías" : selectedCategory}
              </span>
            </button>
            <FilterBar sortBy={sortBy} onSortChange={setSortBy} />
          </div>
        </div>
      </section>

      {/* ── Category Modal ── */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onClose={() => setIsCategoryModalOpen(false)}
      />

      {/* ── Tu Favorito (Carrusel) ── */}
      {user && mostOrderedProduct && selectedCategory === "Todo" && !searchQuery && (
        <section className="mx-auto max-w-2xl px-5 py-4 border-b border-border">
          <h3 className="font-display text-sm font-semibold mb-3 text-gold">Tu favorito</h3>
          <div className="bg-card border border-border rounded-lg p-3 flex gap-3 hover:shadow-sm transition-shadow">
            {mostOrderedProduct.image_url && (
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={mostOrderedProduct.image_url}
                  alt={mostOrderedProduct.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-semibold text-foreground line-clamp-2">{mostOrderedProduct.name}</h4>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-gold">{formatPrice(mostOrderedProduct.price)}</span>
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => handleAddProduct(mostOrderedProduct)}
                  className="text-xs h-8 px-3"
                >
                  Agregar
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Sándwiches de Temporada (Carrusel) ── */}
      {seasonalSandwiches.length > 0 && selectedCategory === "Todo" && !searchQuery && (
        <section className="mx-auto max-w-2xl px-5 py-4 border-b border-border">
          <h3 className="font-display text-sm font-semibold mb-3 text-gold">Sándwiches de Temporada</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {seasonalSandwiches.map(product => (
              <div key={product.id} className="flex-shrink-0 w-32 bg-card border border-border rounded-lg p-2 hover:shadow-sm transition-shadow">
                {product.image_url && (
                  <div className="w-full h-20 rounded-lg overflow-hidden mb-2">
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      width={128}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <h4 className="text-xs font-semibold text-foreground mb-2 line-clamp-2">{product.name}</h4>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold text-gold">{formatPrice(product.price)}</span>
                  <Button
                    variant="gold"
                    size="sm"
                    onClick={() => handleAddProduct(product)}
                    className="text-xs h-6 px-2"
                  >
                    +
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Bebidas de Temporada (Carrusel) ── */}
      {seasonalBeverages.length > 0 && selectedCategory === "Todo" && !searchQuery && (
        <section className="mx-auto max-w-2xl px-5 py-4 border-b border-border">
          <h3 className="font-display text-sm font-semibold mb-3 text-gold">Bebidas de Temporada</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {seasonalBeverages.map(product => (
              <div key={product.id} className="flex-shrink-0 w-28 bg-card border border-border rounded-lg p-2 hover:shadow-sm transition-shadow">
                {product.image_url && (
                  <div className="w-full h-20 rounded-lg overflow-hidden mb-2">
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      width={112}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <h4 className="text-xs font-semibold text-foreground mb-2 line-clamp-2">{product.name}</h4>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold text-gold text-nowrap">{formatPrice(product.price)}</span>
                  <Button
                    variant="gold"
                    size="sm"
                    onClick={() => handleAddProduct(product)}
                    className="text-xs h-6 px-2 flex-shrink-0"
                  >
                    +
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

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

        <div className="space-y-4">
          {displayProducts.map((product) => {
            const qty = getQuantity(product.id)
            return (
              <article key={product.id} className="bg-white border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground mb-2">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{product.description}</p>
                    )}
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gold">{formatPrice(product.price)}</span>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {qty === 0 ? (
                      <Button
                        variant="gold"
                        size="sm"
                        onClick={() => handleAddProduct(product)}
                        className="whitespace-nowrap"
                      >
                        Agregar
                      </Button>
                    ) : needsCustomization(product) ? (
                      <Button
                        variant="gold"
                        size="sm"
                        onClick={toggleCart}
                        className="whitespace-nowrap"
                      >
                        {qty} en carrito
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 border border-brand-black rounded-full">
                        <button
                          onClick={() => useCartStore.getState().decrement(product.id)}
                          className="w-8 h-8 flex items-center justify-center font-bold"
                        >
                          −
                        </button>
                        <span className="text-sm font-semibold w-5 text-center tabular-nums">
                          {qty}
                        </span>
                        <button
                          onClick={() => useCartStore.getState().increment(product.id)}
                          className="w-8 h-8 flex items-center justify-center font-bold"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
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
