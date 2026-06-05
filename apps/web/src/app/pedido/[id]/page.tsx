'use client'

import { useAuth } from '@/contexts/auth-context'
import { useOrderSubscription } from '@/hooks/use-realtime-orders'
import { useOrderNotifications } from '@/hooks/use-order-notifications'
import { useNotificationPermission } from '@/hooks/use-notification-permission'
import { RatingForm } from '@/components/reviews/RatingForm'
import { ReviewsList } from '@/components/reviews/ReviewsList'
import { formatPrice } from '@/lib/utils'
import { MassanoLogo } from '@/components/brand/MassanoLogo'
import { Button } from '@/components/ds'
import { DeliveryMap } from '@/components/delivery/DeliveryMap'
import { ArrowLeft, Clock, CheckCircle2, Bell, Star } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface PageProps {
  params: {
    id: string
  }
}

const STATUS_STEPS = [
  { key: 'pending', label: 'Pedido Confirmado', icon: '📝' },
  { key: 'preparing', label: 'Preparando', icon: '👨‍🍳' },
  { key: 'ready', label: 'Listo para Buscar', icon: '✅' },
  { key: 'on_the_way', label: 'En Camino', icon: '🚗' },
  { key: 'delivered', label: 'Entregado', icon: '🎉' },
]

export default function PedidoPage({ params }: PageProps) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { order, loading, error } = useOrderSubscription(params.id)
  const { isGranted, requestPermission, supported } = useNotificationPermission()
  const [showNotifPrompt, setShowNotifPrompt] = useState(false)

  useOrderNotifications(order)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  const handleEnableNotifications = async () => {
    await requestPermission()
    setShowNotifPrompt(false)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <p className="text-muted-foreground">Cargando pedido...</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-5">
        <p className="text-muted-foreground">No se encontró el pedido.</p>
        <Link href="/mis-pedidos">
          <Button variant="black">Volver a mis pedidos</Button>
        </Link>
      </div>
    )
  }

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.status)
  const isDelivered = order.status === 'delivered'

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="mx-auto max-w-2xl px-5 h-16 flex items-center gap-4">
          <Link href="/mis-pedidos" className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-display text-lg font-semibold">Pedido #{order.id?.slice(0, 8)}</h1>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-2xl px-5 py-8 space-y-8">
        {/* Notification Prompt */}
        {supported && !isGranted && (
          <div className="bg-gold/10 border border-gold/20 rounded-xl p-4 flex items-start gap-3">
            <Bell className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium mb-2">Recibí notificaciones de tu pedido</p>
              <p className="text-xs text-muted-foreground mb-3">
                Te alertaremos cuando tu pedido esté confirmado, preparándose y listo
              </p>
              <button
                onClick={handleEnableNotifications}
                className="text-xs font-semibold text-gold hover:text-gold-dark transition-colors"
              >
                Habilitar notificaciones →
              </button>
            </div>
          </div>
        )}
        {/* Timeline */}
        <section>
          <h2 className="font-display text-lg font-semibold mb-6">Estado del Pedido</h2>
          <div className="space-y-4">
            {STATUS_STEPS.map((step, index) => {
              const isCompleted = index <= currentStepIndex
              const isCurrent = index === currentStepIndex

              return (
                <div key={step.key} className="flex gap-4">
                  {/* Circle */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                        isCompleted
                          ? 'bg-gold text-brand-black'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isCompleted ? '✓' : step.icon}
                    </div>
                    {index < STATUS_STEPS.length - 1 && (
                      <div
                        className={`w-1 h-8 ${
                          isCompleted ? 'bg-gold' : 'bg-muted'
                        }`}
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="pt-1 pb-4">
                    <p className={`font-semibold ${isCurrent ? 'text-gold' : ''}`}>
                      {step.label}
                    </p>
                    {isCurrent && (
                      <p className="text-xs text-muted-foreground">En progreso...</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Delivery Tracking */}
        {order.status === 'on_the_way' && (
          <section>
            <h2 className="font-display text-lg font-bold mb-4">Seguimiento del Delivery</h2>
            <DeliveryMap orderId={order.id} />
          </section>
        )}

        {/* Order Info */}
        <section className="bg-white border border-border rounded-xl p-6 space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Fecha del Pedido</p>
            <p className="text-sm font-medium">
              {new Date(order.created_at).toLocaleString('es-AR')}
            </p>
          </div>

          <div className="h-px bg-border" />

          <div>
            <p className="text-xs text-muted-foreground mb-1">Dirección de Entrega</p>
            <p className="text-sm font-medium">{order.delivery_address}</p>
          </div>

          {order.notes && (
            <>
              <div className="h-px bg-border" />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Notas</p>
                <p className="text-sm">{order.notes}</p>
              </div>
            </>
          )}

          <div className="h-px bg-border" />

          <div>
            <p className="text-xs text-muted-foreground mb-1">Método de Pago</p>
            <p className="text-sm font-medium capitalize">{order.payment_method}</p>
          </div>
        </section>

        {/* Price Summary */}
        <section className="bg-white border border-border rounded-xl p-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice((order.total - order.delivery_fee) || 0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Envío</span>
            <span>{formatPrice(order.delivery_fee)}</span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </section>

        {/* Reviews Section */}
        {isDelivered && (
          <section className="bg-white border border-border rounded-xl p-6 space-y-6">
            <div>
              <h3 className="font-display text-lg font-bold mb-1 flex items-center gap-2">
                <Star className="h-5 w-5 text-gold" />
                Deja tu reseña
              </h3>
              <p className="text-sm text-muted-foreground">
                Tu opinión nos ayuda a mejorar el servicio
              </p>
            </div>

            {user && (
              <RatingForm orderId={order.id} userId={user.id} />
            )}

            <div className="h-px bg-border" />

            <div>
              <h4 className="font-semibold text-sm mb-4">Reseñas de otros clientes</h4>
              <ReviewsList orderId={order.id} />
            </div>
          </section>
        )}

        {/* Action */}
        {isDelivered && (
          <Link href="/mis-pedidos">
            <Button variant="black" size="lg" className="w-full">
              Volver a mis pedidos
            </Button>
          </Link>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-8">
        <div className="mx-auto max-w-2xl px-5 py-8 flex items-center justify-between">
          <MassanoLogo variant="dark" size="xs" />
          <p className="text-xs text-muted-foreground">© 2026 · Todos los derechos reservados</p>
        </div>
      </footer>
    </div>
  )
}
