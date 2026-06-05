'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useAllOrdersSubscription } from '@/hooks/use-realtime-orders'
import { useOrderListNotifications } from '@/hooks/use-order-notifications'
import { useNotificationPermission } from '@/hooks/use-notification-permission'
import { orderService } from '@/lib/supabase-services'
import { formatPrice } from '@/lib/utils'
import { MassanoLogo } from '@/components/brand/MassanoLogo'
import { Button } from '@/components/ds'
import { LogOut, Clock, Zap, Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const STATUS_STEPS = ['pending', 'confirmed', 'preparing', 'ready', 'on_the_way', 'delivered']
const STATUS_LABELS: Record<string, string> = {
  pending: 'Nuevo',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  ready: 'Listo',
  on_the_way: 'En Camino',
  delivered: 'Entregado',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-red-100 text-red-800 border-red-300',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
  preparing: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  ready: 'bg-green-100 text-green-800 border-green-300',
  on_the_way: 'bg-purple-100 text-purple-800 border-purple-300',
  delivered: 'bg-gray-100 text-gray-800 border-gray-300',
}

export default function RestaurantePage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const { orders, loading } = useAllOrdersSubscription()
  const { isGranted, requestPermission, supported } = useNotificationPermission()
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useOrderListNotifications(orders)

  // TODO: Check if user is restaurant admin
  // For now, anyone can access (implement proper role check later)

  const handleEnableNotifications = async () => {
    await requestPermission()
  }

  const handleNextStatus = async (orderId: string, currentStatus: string) => {
    const currentIndex = STATUS_STEPS.indexOf(currentStatus)
    const nextStatus = STATUS_STEPS[currentIndex + 1]

    if (!nextStatus) return

    setUpdatingId(orderId)
    try {
      await orderService.updateStatus(orderId, nextStatus)
    } catch (error) {
      console.error('Error updating order:', error)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  // Group orders by status
  const ordersByStatus = STATUS_STEPS.reduce(
    (acc, status) => {
      acc[status] = orders.filter((o) => o.status === status)
      return acc
    },
    {} as Record<string, typeof orders>
  )

  const newOrders = ordersByStatus['pending'] || []
  const activeOrders = [
    ...(ordersByStatus['confirmed'] || []),
    ...(ordersByStatus['preparing'] || []),
    ...(ordersByStatus['ready'] || []),
    ...(ordersByStatus['on_the_way'] || []),
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MassanoLogo variant="dark" size="xs" />
            <span className="text-sm text-muted-foreground">Panel del Restaurante</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/restaurante/analytics"
              className="px-4 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              📊 Analytics
            </a>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-5 py-8">
        {/* Notification Banner */}
        {supported && !isGranted && (
          <div className="max-w-7xl mx-auto mb-8 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <Bell className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900 mb-2">Recibí alertas de nuevos pedidos</p>
              <p className="text-xs text-red-800 mb-3">
                Te notificaremos cuando lleguen nuevas órdenes, incluso si cierre esta pestaña
              </p>
              <button
                onClick={handleEnableNotifications}
                className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
              >
                Habilitar notificaciones →
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center">
            <p className="text-muted-foreground">Cargando órdenes...</p>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto space-y-8">
            {/* New Orders Section */}
            {newOrders.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="h-5 w-5 text-red-600" />
                  <h2 className="font-display text-xl font-bold text-red-600">
                    Órdenes Nuevas ({newOrders.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {newOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-red-50 border-2 border-red-200 rounded-xl p-4 space-y-3"
                    >
                      <div>
                        <p className="text-sm font-semibold">#{order.id?.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleTimeString('es-AR')}
                        </p>
                      </div>

                      <div className="bg-white rounded-lg p-2 text-sm space-y-1">
                        <p className="font-medium">{order.delivery_address}</p>
                        {order.notes && (
                          <p className="text-xs text-muted-foreground">Nota: {order.notes}</p>
                        )}
                      </div>

                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-xs text-muted-foreground">Total</p>
                          <p className="font-bold text-lg">{formatPrice(order.total)}</p>
                        </div>
                        <Button
                          variant="gold"
                          size="sm"
                          onClick={() => handleNextStatus(order.id, order.status)}
                          loading={updatingId === order.id}
                          disabled={updatingId === order.id}
                        >
                          Confirmar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Active Orders Section */}
            <section>
              <h2 className="font-display text-xl font-bold mb-4">
                En Proceso ({activeOrders.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeOrders.map((order) => {
                  const nextStatus = STATUS_STEPS[STATUS_STEPS.indexOf(order.status) + 1]
                  return (
                    <div
                      key={order.id}
                      className={`border rounded-xl p-4 space-y-3 ${
                        STATUS_COLORS[order.status] || 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-semibold">#{order.id?.slice(0, 8)}</p>
                        <p className="text-xs">
                          {STATUS_LABELS[order.status]}
                        </p>
                      </div>

                      <div className="bg-white/50 rounded-lg p-2 text-sm">
                        <p className="font-medium">{order.delivery_address}</p>
                      </div>

                      <div className="flex justify-between items-end">
                        <p className="font-bold">{formatPrice(order.total)}</p>
                        {nextStatus && (
                          <Button
                            variant="black"
                            size="sm"
                            onClick={() => handleNextStatus(order.id, order.status)}
                            loading={updatingId === order.id}
                            disabled={updatingId === order.id}
                          >
                            {STATUS_LABELS[nextStatus]}
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Empty State */}
            {newOrders.length === 0 && activeOrders.length === 0 && (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No hay órdenes en este momento.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
