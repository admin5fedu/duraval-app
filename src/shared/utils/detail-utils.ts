/**
 * Utility functions cho detail view
 */

// Helper function để format date theo định dạng Việt Nam
export function formatDate(value: string | number | Date | null | undefined): string {
  if (!value) return ""
  try {
    const date = typeof value === 'string' || typeof value === 'number' ? new Date(value) : value
    if (isNaN(date.getTime())) return String(value)
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch {
    return String(value)
  }
}

// Helper function để format số tiền
export function formatCurrency(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return String(value)
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(num)
}

// Helper function để format số
export function formatNumber(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return String(value)
  return new Intl.NumberFormat('vi-VN').format(num)
}

// Helper function để validate email
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Helper function để validate phone
export function isValidPhone(phone: string): boolean {
  return /^[0-9+\-\s()]+$/.test(phone)
}

