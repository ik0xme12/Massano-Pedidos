'use client'

import { useEffect, useState } from 'react'
import { restaurantService, type Restaurant } from '@/lib/restaurant-service'
import { formatPrice } from '@/lib/utils'
import { MassanoLogo } from '@/components/brand/MassanoLogo'
import { Star, Truck, Clock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function RestaurantesPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const data = await restaurantService.getAll()
        setRestaurants(data)
      } catch (error) {
        console.error('Error loading restaurants:', error)
      } finally {
        setLoading(false)
      }
    }

    loadRestaurants()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="mx-auto max-w-4xl px-5 h-20 flex items-center justify-between">
          <Link href="/">
            <MassanoLogo variant="dark" size="xs" className="cursor-pointer" />
          </Link>
          <h1 className="font-display text-lg font-semibold">Restaurantes</h1>
          <div className="w-[110px]" /> {/* Spacer for alignment */}
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-5 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Cargando restaurantes...</p>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No hay restaurantes disponibles por el momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {restaurants.map((restaurant) => (
              <Link
                key={restaurant.id}
                href={`/restaurante/${restaurant.slug}`}
                className="group"
              >
                <div className="bg-white border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Banner */}
                  <div className="h-32 bg-muted relative overflow-hidden">
                    {restaurant.banner_url && (
                      <Image
                        src={restaurant.banner_url}
                        alt={restaurant.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h2 className="font-display font-semibold text-base group-hover:text-gold transition-colors">
                          {restaurant.name}
                        </h2>
                        {restaurant.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {restaurant.description}
                          </p>
                        )}
                      </div>
                      {restaurant.logo_url && (
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={restaurant.logo_url}
                            alt={restaurant.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-gold fill-gold" />
                        <span>
                          {restaurant.rating.toFixed(1)} ({restaurant.rating_count})
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {restaurant.delivery_time_min}–{restaurant.delivery_time_max} min
                        </span>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2 pt-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          restaurant.is_open ? 'bg-green-500' : 'bg-destructive'
                        }`}
                      />
                      <span className="text-xs font-medium">
                        {restaurant.is_open ? 'Abierto' : 'Cerrado'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
