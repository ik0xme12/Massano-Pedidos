'use client'

import { useEffect, useState } from 'react'
import { deliveryService } from '@/lib/delivery-service'
import { MapPin, Smartphone, AlertCircle } from 'lucide-react'

interface DeliveryMapProps {
  orderId: string
}

export function DeliveryMap({ orderId }: DeliveryMapProps) {
  const [location, setLocation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const loadLocation = async () => {
      try {
        const data = await deliveryService.getDeliveryLocation(orderId)
        setLocation(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load location'))
      } finally {
        setLoading(false)
      }
    }

    loadLocation()

    // Suscribirse a actualizaciones en vivo
    const subscription = deliveryService.subscribeToDeliveryLocation(orderId, (newLocation) => {
      setLocation(newLocation)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [orderId])

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Cargando ubicación...</div>
  }

  if (error || !location) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-sm text-amber-900">Ubicación no disponible</p>
          <p className="text-xs text-amber-800 mt-1">
            El repartidor aún no ha compartido su ubicación
          </p>
        </div>
      </div>
    )
  }

  // Enlace a Google Maps
  const mapsUrl = `https://www.google.com/maps/@${location.latitude},${location.longitude},17z`

  return (
    <div className="space-y-4">
      {/* Tarjeta de repartidor */}
      <div className="bg-white border border-border rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <Smartphone className="h-5 w-5 text-gold" />
          <div className="flex-1">
            <p className="font-semibold text-sm">{location.delivery_person_name}</p>
            <p className="text-xs text-muted-foreground">{location.vehicle_type}</p>
          </div>
        </div>
        {location.delivery_person_phone && (
          <a
            href={`tel:${location.delivery_person_phone}`}
            className="text-xs text-gold hover:text-gold-dark font-medium"
          >
            Llamar: {location.delivery_person_phone}
          </a>
        )}
      </div>

      {/* Información de ubicación */}
      <div className="bg-white border border-border rounded-lg p-4 space-y-3">
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-medium">Ubicación Actual</p>
            <p className="text-xs text-muted-foreground mt-1">
              Lat: {location.latitude.toFixed(6)} <br />
              Lon: {location.longitude.toFixed(6)}
            </p>
            {location.speed_kmh > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Velocidad: {location.speed_kmh.toFixed(1)} km/h
              </p>
            )}
          </div>
        </div>

        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center px-4 py-2 bg-gold text-brand-black rounded-lg text-sm font-medium hover:bg-gold-dark transition-colors"
        >
          Ver en Google Maps
        </a>
      </div>

      {/* Última actualización */}
      <p className="text-xs text-muted-foreground text-center">
        Actualizado hace{' '}
        {Math.floor(
          (new Date().getTime() - new Date(location.timestamp).getTime()) / 1000 / 60
        )}{' '}
        minutos
      </p>
    </div>
  )
}
