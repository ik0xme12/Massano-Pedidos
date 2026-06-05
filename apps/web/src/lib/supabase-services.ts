import { supabase } from './supabase'
import type { Product, Order, OrderItem } from '@shared/types'

export const productService = {
  async getAll() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Product[]
  },

  async getByCategory(category: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Product[]
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Product
  },
}

export const orderService = {
  async create(order: {
    user_id: string
    delivery_address: string
    notes?: string
    payment_method: string
    total: number
    restaurant_id?: string
    items: Array<{ product_id: string; quantity: number; price_at_purchase: number }>
  }) {
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: order.user_id,
        delivery_address: order.delivery_address,
        notes: order.notes,
        payment_method: order.payment_method,
        total: order.total,
        restaurant_id: order.restaurant_id,
        status: 'pending',
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Insertar items del pedido
    const itemsToInsert = order.items.map((item) => ({
      order_id: orderData.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_purchase: item.price_at_purchase,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsToInsert)

    if (itemsError) throw itemsError

    return orderData as Order
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_id,
          quantity,
          price_at_purchase
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async listByUser(userId?: string) {
    let query = supabase.from('orders').select('*')

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return data as Order[]
  },

  async updateStatus(orderId: string, status: string) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single()

    if (error) throw error
    return data as Order
  },
}

export const reviewService = {
  async create(review: {
    order_id: string
    user_id: string
    rating: number
    comment?: string
  }) {
    const { data, error } = await supabase
      .from('reviews')
      .insert(review)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getByOrder(orderId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('order_id', orderId)

    if (error) throw error
    return data
  },
}
