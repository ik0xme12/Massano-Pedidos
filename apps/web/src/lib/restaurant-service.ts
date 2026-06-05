import { supabase } from './supabase'

export interface Restaurant {
  id: string
  owner_id: string
  name: string
  description?: string
  logo_url?: string
  banner_url?: string
  address: string
  phone?: string
  email?: string
  is_open: boolean
  delivery_time_min: number
  delivery_time_max: number
  delivery_fee: number
  min_order: number
  rating: number
  rating_count: number
  slug: string
  created_at: string
  updated_at: string
}

export const restaurantService = {
  async getAll() {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('is_open', true)
      .order('rating', { ascending: false })

    if (error) throw error
    return (data as Restaurant[]) || []
  },

  async getBySlug(slug: string) {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) throw error
    return data as Restaurant
  },

  async getByOwnerId(ownerId: string) {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('owner_id', ownerId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return (data as Restaurant) || null
  },

  async create(restaurant: Omit<Restaurant, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('restaurants')
      .insert(restaurant)
      .select()
      .single()

    if (error) throw error
    return data as Restaurant
  },

  async update(id: string, updates: Partial<Restaurant>) {
    const { data, error } = await supabase
      .from('restaurants')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Restaurant
  },

  async getStats(restaurantId: string) {
    const { data, error } = await supabase
      .from('restaurant_stats')
      .select('*')
      .eq('id', restaurantId)
      .single()

    if (error) throw error
    return data
  },
}
