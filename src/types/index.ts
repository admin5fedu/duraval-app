// Common types for the ERP system

export interface BaseEntity {
  id: string
  created_at: string
  updated_at: string
}

export interface Customer extends BaseEntity {
  name: string
  email?: string
  phone?: string
  address?: string
  company?: string
  notes?: string
}

export interface Product extends BaseEntity {
  name: string
  sku: string
  description?: string
  price: number
  cost?: number
  stock: number
  category_id?: string
  image_url?: string
}

export interface Order extends BaseEntity {
  order_number: string
  customer_id: string
  status: OrderStatus
  total_amount: number
  items: OrderItem[]
  notes?: string
}

export interface OrderItem {
  id: string
  product_id: string
  quantity: number
  price: number
  total: number
}

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled'

export interface Inventory extends BaseEntity {
  product_id: string
  quantity: number
  location?: string
  notes?: string
}

export interface Category extends BaseEntity {
  name: string
  description?: string
  parent_id?: string
}

