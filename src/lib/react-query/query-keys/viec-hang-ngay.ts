import type { QueryKeyFactory } from "./types"

/**
 * Query keys for Việc Hàng Ngày module
 */
export const viecHangNgay: QueryKeyFactory = {
  all: () => ["viec-hang-ngay"] as const,
  list: () => ["viec-hang-ngay", "list"] as const,
  detail: (id: number | string) => ["viec-hang-ngay", "detail", id] as const,
  byDateAndEmployee: (ma_nhan_vien: number, ngay_bao_cao: string) => 
    ["viec-hang-ngay", "by-date-employee", ma_nhan_vien, ngay_bao_cao] as const,
  search: (query: string) => ["viec-hang-ngay", "search", query] as const,
}

