import { supabase } from './supabase'

export interface DeliveryPerson {
  id: string
  user_id: string
  name: string
  phone?: string
  vehicle_type: string
  is_available: boolean
  rating: number
  rating_count: number
  completed_deliveries: number
}

export interface DeliveryLocation {
  latitude: number
  longitude: number
  accuracy_meters?: number
  speed_kmh?: number
  heading_degrees?: number
}

export const deliveryService = {
  async assignDelivery(orderId: string, deliveryId: string, estimatedTime: number) {
    const estimatedArrival = new Date()
    estimatedArrival.setMinutes(estimatedArrival.getMinutes() + estimatedTime)

    const { data, error } = await supabase
      .from('orders')
      .update({
        delivery_id: deliveryId,
        estimated_arrival_time: estimatedArrival.toISOString(),
        status: 'on_the_way',
      })
      .eq('id', orderId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateLocation(orderId: string, deliveryId: string, location: DeliveryLocation) {
    const { data, error } = await supabase
      .from('delivery_tracking')
      .insert({
        order_id: orderId,
        delivery_id: deliveryId,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy_meters: location.accuracy_meters,
        speed_kmh: location.speed_kmh,
        heading_degrees: location.heading_degrees,
      })

    if (error) throw error
    return data
  },

  async getDeliveryLocation(orderId: string) {
    const { data, error } = await supabase
      .from('current_delivery_location')
      .select('*')
      .eq('order_id', orderId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data || null
  },

  subscribeToDeliveryLocation(orderId: string, callback: (location: any) => void) {
    return supabase
      .channel(`delivery:${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'delivery_tracking',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          callback(payload.new)
        }
      )
      .subscribe()
  },

  async getDeliveryPerson(deliveryId: string) {
    const { data, error } = await supabase
      .from('deliveries')
      .select('*')
      .eq('id', deliveryId)
      .single()

    if (error) throw error
    return (data as DeliveryPerson) || null
  },

  async completeDelivery(orderId: string) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status: 'delivered' })
      .eq('id', orderId)
      .select()
      .single()

    if (error) throw error
    return data
  },
}
