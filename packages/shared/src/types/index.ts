export type UserRole = 'customer' | 'restaurant' | 'admin'

export interface Profile {
  id: string
  email: string
  full_name: string
  phone?: string
  avatar_url?: string
  role: UserRole
  created_at: string
}

export interface Restaurant {
  id: string
  name: string
  description?: string
  logo_url?: string
  cover_url?: string
  address: string
  phone: string
  is_open: boolean
  delivery_time_min: number
  delivery_time_max: number
  min_order: number
  delivery_fee: number
  rating: number
  rating_count: number
  created_at: string
}

export interface Category {
  id: string
  restaurant_id: string
  name: string
  sort_order: number
}

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  image_url?: string
  category: string
  badge?: string
  created_at: string
  updated_at: string
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'on_the_way'
  | 'delivered'
  | 'cancelled'

export type PaymentMethod = 'mercadopago' | 'cash' | 'transfer'

export interface Order {
  id: string
  user_id?: string
  status: OrderStatus
  payment_method: PaymentMethod
  total: number
  delivery_fee: number
  delivery_address: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  product_price: number
  quantity: number
  subtotal: number
}

export interface Review {
  id: string
  order_id: string
  customer_id: string
  restaurant_id: string
  rating: number
  comment?: string
  created_at: string
}

export interface CartItem {
  product: Partial<Product>
  quantity: number
}
