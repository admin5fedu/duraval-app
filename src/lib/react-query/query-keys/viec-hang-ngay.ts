import type { QueryKeyFactory } from "./types"

/**
 * Query keys for Việc Hàng Ngày module
 */
export const viecHangNgay: QueryKeyFactory = {
  all: () => ["viec-hang-ngay"] as const,
  list: () => ["viec-hang-ngay", "list"] as const,
  detail: (id: number) => ["viec-hang-ngay", "detail", id] as const,
  search: (query: string) => ["viec-hang-ngay", "search", query] as const,
}

