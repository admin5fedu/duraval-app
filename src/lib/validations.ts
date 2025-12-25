import { z } from 'zod'

// Common validation schemas
export const emailSchema = z.string().email('Email không hợp lệ')

export const phoneSchema = z.string().regex(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ')

export const passwordSchema = z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự')

// Customer validation
export const customerSchema = z.object({
  name: z.string().min(1, 'Tên khách hàng là bắt buộc'),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  phone: phoneSchema.optional().or(z.literal('')),
  address: z.string().optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
})

// Product validation
export const productSchema = z.object({
  name: z.string().min(1, 'Tên sản phẩm là bắt buộc'),
  sku: z.string().min(1, 'SKU là bắt buộc'),
  description: z.string().optional(),
  price: z.number().min(0, 'Giá phải lớn hơn hoặc bằng 0'),
  cost: z.number().min(0, 'Giá vốn phải lớn hơn hoặc bằng 0').optional(),
  stock: z.number().int().min(0, 'Tồn kho phải lớn hơn hoặc bằng 0'),
  category_id: z.string().optional(),
})

