'use client'

import { useAuth } from '@/contexts/auth-context'
import { useUserOrdersSubscription } from '@/hooks/use-realtime-orders'
import { formatPrice } from '@/lib/utils'
import { MassanoLogo } from '@/components/brand/MassanoLogo'
import { Button } from '@/components/ds'
import { ArrowLeft, Clock, Check, Truck } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  ready: 'Listo',
  on_the_way: 'En camino',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-blue-100 text-blue-800',
  ready: 'bg-green-100 text-green-800',
  on_the_way: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function MisPedidosPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const userId = user?.id
  const { orders, loading } = useUserOrdersSubscription(userId || '')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <p className="text-muted-foreground">Cargando tus pedidos...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="mx-auto max-w-2xl px-5 h-16 flex items-center gap-4">
          <Link href="/" className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-display text-lg font-semibold">Mis Pedidos</h1>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-2xl px-5 py-8">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Aún no tenés pedidos.</p>
            <Link href="/">
              <Button variant="black">Ir al menú</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/pedido/${order.id}`}
                className="block bg-white border border-border rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Pedido #{order.id?.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString('es-AR')}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {order.status === 'delivered' && <Check className="h-4 w-4" />}
                    {order.status === 'on_the_way' && <Truck className="h-4 w-4" />}
                    {order.status === 'preparing' && <Clock className="h-4 w-4" />}
                    <span>{order.delivery_address}</span>
                  </div>
                  <p className="font-bold">{formatPrice(order.total)}</p>
                </div>
              </Link>
            ))}
          </div>
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
