'use client'

import { useEffect, useRef } from 'react'
import { notificationService } from '@/lib/notifications'
import type { Order } from '@shared/types'

export function useOrderNotifications(order: Order | null) {
  const previousStatusRef = useRef<string | null>(null)

  useEffect(() => {
    if (!order) return

    // Solo notificar si el status cambió
    if (
      previousStatusRef.current &&
      previousStatusRef.current !== order.status &&
      notificationService.isEnabled()
    ) {
      notificationService.notifyOrderStatus(order.status, order.id)
    }

    previousStatusRef.current = order.status
  }, [order?.status, order?.id])
}

export function useOrderListNotifications(orders: Order[]) {
  const orderIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    // Notificar nuevas órdenes (para restaurante)
    orders.forEach((order) => {
      if (!orderIdsRef.current.has(order.id) && order.status === 'pending') {
        if (notificationService.isEnabled()) {
          notificationService.notifyNewOrder(order.id)
        }
        orderIdsRef.current.add(order.id)
      } else if (!orderIdsRef.current.has(order.id)) {
        orderIdsRef.current.add(order.id)
      }
    })

    // Limpiar IDs de órdenes completadas
    const currentIds = new Set(orders.map((o) => o.id))
    orderIdsRef.current.forEach((id) => {
      if (!currentIds.has(id)) {
        orderIdsRef.current.delete(id)
      }
    })
  }, [orders])
}
