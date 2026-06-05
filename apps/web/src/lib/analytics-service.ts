import { supabase } from './supabase'

export const analyticsService = {
  async getOrderStats(startDate?: string, endDate?: string) {
    let query = supabase
      .from('orders')
      .select('id, total, status, created_at', { count: 'exact' })

    if (startDate) query = query.gte('created_at', startDate)
    if (endDate) query = query.lte('created_at', endDate)

    const { data, count, error } = await query

    if (error) throw error

    const totalRevenue = (data || []).reduce((sum, o) => sum + o.total, 0)
    const completedOrders = (data || []).filter((o) => o.status === 'delivered').length
    const avgOrderValue = count ? totalRevenue / count : 0

    return {
      totalOrders: count || 0,
      totalRevenue,
      completedOrders,
      avgOrderValue,
      pendingOrders: (data || []).filter((o) => o.status === 'pending').length,
    }
  },

  async getRevenueByDay(days: number = 7) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
      .from('orders')
      .select('total, created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    if (error) throw error

    // Group by date
    const byDay: Record<string, number> = {}
    ;(data || []).forEach((order) => {
      const date = new Date(order.created_at).toLocaleDateString('es-AR')
      byDay[date] = (byDay[date] || 0) + order.total
    })

    return Object.entries(byDay).map(([date, revenue]) => ({
      date,
      revenue: Math.round(revenue / 100), // Convert to pesos
    }))
  },

  async getPopularProducts(limit: number = 5) {
    const { data, error } = await supabase
      .from('order_items')
      .select('product_id, quantity')
      .order('quantity', { ascending: false })
      .limit(limit)

    if (error) throw error

    return (data || []).map((item) => ({
      productId: item.product_id,
      quantity: item.quantity,
    }))
  },

  async getOrdersByStatus() {
    const { data, error } = await supabase
      .from('orders')
      .select('status', { count: 'exact' })

    if (error) throw error

    const byStatus: Record<string, number> = {}
    ;(data || []).forEach((order) => {
      byStatus[order.status] = (byStatus[order.status] || 0) + 1
    })

    return byStatus
  },

  async getTopCustomers(limit: number = 10) {
    // TODO: Implementar con view en Supabase o agregación en el cliente
    // Por ahora, retorna lista vacía
    return []
  },
}
