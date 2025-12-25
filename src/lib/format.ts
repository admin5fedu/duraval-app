import dayjs from 'dayjs'
import 'dayjs/locale/vi'
import { DATE_FORMAT, DATETIME_FORMAT } from './constants'

dayjs.locale('vi')

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}

export function formatDate(date: string | Date, format: string = DATE_FORMAT): string {
  return dayjs(date).format(format)
}

export function formatDateTime(date: string | Date, format: string = DATETIME_FORMAT): string {
  return dayjs(date).format(format)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('vi-VN').format(value)
}

