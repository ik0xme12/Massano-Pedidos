'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { restaurantService } from '@/lib/restaurant-service'
import { useCartStore } from '@/store/cart'
import { formatPrice, formatDeliveryTime } from '@/lib/utils'
import { MassanoLogo } from '@/components/brand/MassanoLogo'
import { Button } from '@/components/ds'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { SearchBar } from '@/components/search/SearchBar'
import { FilterBar } from '@/components/search/FilterBar'
import { productSearch } from '@/lib/product-search'
import { Star, Clock, Truck, ArrowLeft, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useState as useStateHook } from 'react'

const CATEGORIES = ['Todo', 'Desayunos', 'Almuerzos', 'Cafetería', 'Postres', 'Bebidas']

interface PageProps {
  params: {
    slug: string
  }
}

export default function RestaurantePage({ params }: PageProps) {
  const [searchQuery, setSearchQuery] = useStateHook('')
  const [selectedCategory, setSelectedCategory] = useStateHook('Todo')
  const [sortBy, setSortBy] = useStateHook<'name' | 'price-asc' | 'price-desc' | 'newest'>(
    'newest'
  )

  const [restaurant, setRestaurant] = useStateHook(null as any)
  const [restaurantProducts, setRestaurantProducts] = useStateHook([] as any[])
  const [loading, setLoading] = useStateHook(true)

  const { add, totalItems, toggleCart, items } = useCartStore()

  const getQuantity = (id: string) => items.find((i) => i.product.id === id)?.quantity ?? 0

  const displayProducts = productSearch.filterAndSort(restaurantProducts, {
    query: searchQuery,
    category: selectedCategory,
    sortBy,
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const restaurantData = await restaurantService.getBySlug(params.slug)
        setRestaurant(restaurantData)

        // Cargar productos del restaurante
        const { data: products, error } = await supabase
          .from('products')
          .select('*')
          .eq('restaurant_id', restaurantData.id)

        if (!error) {
          setRestaurantProducts(products || [])
        }
      } catch (error) {
        console.error('Error loading restaurant:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params.slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Restaurante no encontrado</p>
        <Link href="/restaurantes">
          <Button variant="black">Ver restaurantes</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <CartDrawer />

      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-30">
        <div className="mx-auto max-w-2xl px-5 h-20 flex items-center justify-between">
          <Link href="/restaurantes" className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-display text-lg font-semibold flex-1 text-center">{restaurant.name}</h1>
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
        </div>
      </header>

      {/* Hero */}
      <section className="h-48 bg-muted relative overflow-hidden">
        {restaurant.banner_url && (
          <Image
            src={restaurant.banner_url}
            alt={restaurant.name}
            fill
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </section>

      {/* Restaurant Info */}
      <section className="mx-auto max-w-2xl px-5 -mt-12 relative z-10 mb-8">
        <div className="bg-white border border-border rounded-xl p-6 shadow-lg space-y-4">
          <div className="flex items-start gap-4">
            {restaurant.logo_url && (
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={restaurant.logo_url}
                  alt={restaurant.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <h2 className="font-display text-xl font-bold">{restaurant.name}</h2>
              {restaurant.description && (
                <p className="text-sm text-muted-foreground">{restaurant.description}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-gold fill-gold" />
              <span className="font-semibold">
                {restaurant.rating.toFixed(1)} ({restaurant.rating_count})
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{formatDeliveryTime(restaurant.delivery_time_min, restaurant.delivery_time_max)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="mx-auto max-w-2xl px-5 mb-6 space-y-4">
        <SearchBar onSearch={setSearchQuery} />
        <div className="flex gap-4 items-center justify-between">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-none flex-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-brand-black text-white'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <FilterBar sortBy={sortBy} onSortChange={setSortBy} />
        </div>
      </section>

      {/* Menu */}
      <main className="mx-auto max-w-2xl px-5 pb-8">
        {displayProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery ? `No encontramos productos con "${searchQuery}"` : 'Sin productos'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {displayProducts.map((product) => {
              const qty = getQuantity(product.id)
              return (
                <article key={product.id} className="flex items-start gap-4 py-6 group">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-base font-semibold mb-2">{product.name}</h3>
                    {product.description && (
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
                        {product.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold">{formatPrice(product.price)}</span>
                      {qty === 0 ? (
                        <button
                          onClick={() => add(product as any)}
                          className="border border-brand-black rounded-full px-4 py-1.5 text-xs font-medium hover:bg-brand-black hover:text-white transition-colors"
                        >
                          + Agregar
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 border border-brand-black rounded-full px-2 py-1">
                          <button
                            onClick={() => useCartStore.getState().decrement(product.id)}
                            className="w-5 h-5 flex items-center justify-center font-bold text-sm"
                          >
                            −
                          </button>
                          <span className="text-sm font-semibold w-4 text-center">{qty}</span>
                          <button
                            onClick={() => useCartStore.getState().increment(product.id)}
                            className="w-5 h-5 flex items-center justify-center font-bold text-sm"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {product.image_url && (
                    <div className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-muted border border-border">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </main>

      {/* Floating cart button */}
      {totalItems() > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
          <button
            onClick={toggleCart}
            className="flex items-center gap-3 bg-brand-black text-white rounded-full px-6 py-3.5 shadow-xl hover:bg-brand-black/90 transition-all"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="text-sm font-semibold">Ver pedido</span>
            <span className="bg-gold text-brand-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {totalItems()}
            </span>
          </button>
        </div>
      )}
    </div>
  )
}
