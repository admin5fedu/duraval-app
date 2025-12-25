// Application constants

export const APP_NAME = 'Duraval'
export const APP_DESCRIPTION = 'Hệ thống quản lý doanh nghiệp ERP'

// Pagination
export const DEFAULT_PAGE_SIZE = 10
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

// Date formats
export const DATE_FORMAT = 'DD/MM/YYYY'
export const DATETIME_FORMAT = 'DD/MM/YYYY HH:mm'

// Order statuses
export const ORDER_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUSES.PENDING]: 'Chờ xử lý',
  [ORDER_STATUSES.PROCESSING]: 'Đang xử lý',
  [ORDER_STATUSES.COMPLETED]: 'Hoàn thành',
  [ORDER_STATUSES.CANCELLED]: 'Đã hủy',
} as const

