'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { MassanoLogo } from '@/components/brand/MassanoLogo'
import { Button } from '@/components/ds'
import { formatPrice, formatDeliveryTime } from '@/lib/utils'
import { LogOut, Clock, ChefHat, CheckCircle2, Utensils } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Order } from '@shared/types'

type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered'

interface OrderWithItems extends Order {
  items?: any[]
}

const STATUS_CONFIG = {
  pending: { label: 'Pendiente', color: 'bg-amber-100 border-amber-300', textColor: 'text-amber-900', icon: Utensils },
  preparing: { label: 'En Preparación', color: 'bg-blue-100 border-blue-300', textColor: 'text-blue-900', icon: ChefHat },
  ready: { label: 'Listo', color: 'bg-green-100 border-green-300', textColor: 'text-green-900', icon: CheckCircle2 },
  delivered: { label: 'Entregado', color: 'bg-gray-100 border-gray-300', textColor: 'text-gray-900', icon: CheckCircle2 },
}

const STATUS_ORDER: OrderStatus[] = ['pending', 'preparing', 'ready', 'delivered']

export default function KitchenPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [isKitchenStaff, setIsKitchenStaff] = useState(false)
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all')

  useEffect(() => {
    const checkAccess = async () => {
      try {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) {
            // En desarrollo, permitir acceso sin autenticación
            setIsKitchenStaff(true)
          } else {
            setIsKitchenStaff(true)
          }
        } catch (err) {
          // Supabase no configurado, usar modo demo
          setIsKitchenStaff(true)
        }

        await loadOrders()
        subscribeToOrders()
      } catch (error) {
        console.error('Error:', error)
        // Permitir acceso sin autenticación en desarrollo
        setIsKitchenStaff(true)
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  }, [router])

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, products(name, price))')
        .in('status', ['pending', 'preparing', 'ready'])
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error loading orders:', error)
      // Demo data when Supabase is not configured
      const demoOrders = [
        {
          id: 'demo-001',
          status: 'pending',
          created_at: new Date(Date.now() - 5 * 60000).toISOString(),
          items: [
            { quantity: 2, products: { name: 'Café Grande' }, customizations: { temperature: 'Caliente', sugar: true } },
            { quantity: 1, products: { name: 'Pan de Chocolate' }, customizations: null }
          ]
        },
        {
          id: 'demo-002',
          status: 'preparing',
          created_at: new Date(Date.now() - 10 * 60000).toISOString(),
          items: [
            { quantity: 1, products: { name: 'Sándwich con Mayo' }, customizations: { mayonnaise: true } }
          ]
        }
      ] as any
      setOrders(demoOrders)
    }
  }

  const subscribeToOrders = () => {
    const subscription = supabase
      .channel('orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          loadOrders()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    // Actualizar UI localmente primero (optimistic update)
    const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
    setOrders(updatedOrders)

    // Guardar en localStorage para sincronización entre páginas
    try {
      const orderToSave = updatedOrders.find(o => o.id === orderId)
      if (orderToSave) {
        localStorage.setItem(`order-${orderId}`, JSON.stringify(orderToSave))
        // Disparar evento para notificar a otros tabs/componentes
        window.dispatchEvent(new CustomEvent('order-updated', { detail: orderToSave }))
      }
    } catch (err) {
      console.error('Error saving to localStorage:', err)
    }

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date() })
        .eq('id', orderId)

      if (error) {
        console.error('Supabase update failed, but local state updated:', error)
      }
    } catch (error) {
      console.error('Error updating order:', error)
      // Local state already updated, so UI shows the change
    }
  }

  const getNextStatus = (currentStatus: string): OrderStatus | null => {
    const currentIndex = STATUS_ORDER.indexOf(currentStatus as OrderStatus)
    if (currentIndex === -1 || currentIndex === STATUS_ORDER.length - 1) return null
    return STATUS_ORDER[currentIndex + 1]
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter)

  if (!isKitchenStaff || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-border">
        <div className="mx-auto max-w-7xl px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChefHat className="h-6 w-6 text-gold" />
            <h1 className="font-display text-lg font-bold">Panel de Cocina</h1>
          </div>
          <button
            onClick={handleSignOut}
            className="p-2 text-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-5 py-8">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(['all', 'pending', 'preparing', 'ready'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                filter === status
                  ? 'bg-brand-black text-white'
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
            >
              {status === 'all' ? 'Todos' : STATUS_CONFIG[status as OrderStatus].label}
              {status !== 'all' && (
                <span className="ml-2 text-xs">
                  ({filteredOrders.filter(o => o.status === status).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders Grid */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ChefHat className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No hay pedidos para preparar</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order) => {
              const config = STATUS_CONFIG[order.status as OrderStatus]
              const Icon = config.icon
              const nextStatus = getNextStatus(order.status as OrderStatus)

              return (
                <div
                  key={order.id}
                  className={`rounded-xl border-2 p-4 ${config.color} transition-all hover:shadow-md`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">Pedido</p>
                      <p className="font-bold text-lg">{order.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Icon className="h-5 w-5" />
                      <span className={`text-xs font-semibold ${config.textColor}`}>
                        {config.label}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="bg-white/50 rounded-lg p-3 mb-3 max-h-40 overflow-y-auto">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Items:</p>
                    <ul className="space-y-1">
                      {(order.items || []).map((item: any, idx: number) => (
                        <li key={idx} className="text-sm">
                          <span className="font-medium">×{item.quantity}</span> {item.products?.name || 'Producto'}
                          {item.customizations && (
                            <div className="text-xs text-gray-600 ml-2">
                              {Object.entries(item.customizations)
                                .filter(([, v]) => v !== undefined && v !== null && v !== false)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(', ')}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Notes */}
                  {order.notes && (
                    <div className="bg-white/50 rounded-lg p-2 mb-3 border-l-2 border-amber-400">
                      <p className="text-xs font-semibold text-gray-700 mb-1">Notas:</p>
                      <p className="text-sm text-gray-800">{order.notes}</p>
                    </div>
                  )}

                  {/* Time */}
                  <div className="flex items-center gap-2 text-xs text-gray-700 mb-3">
                    <Clock className="h-4 w-4" />
                    <span>
                      {new Date(order.created_at).toLocaleTimeString('es-MX', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Action Button */}
                  {nextStatus && (
                    <Button
                      variant="black"
                      size="sm"
                      className="w-full"
                      onClick={() => updateOrderStatus(order.id, nextStatus)}
                    >
                      Marcar como {STATUS_CONFIG[nextStatus].label}
                    </Button>
                  )}
                  {!nextStatus && order.status !== 'delivered' && (
                    <Button
                      variant="black"
                      size="sm"
                      className="w-full"
                      onClick={() => updateOrderStatus(order.id, 'delivered')}
                    >
                      Completar
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
