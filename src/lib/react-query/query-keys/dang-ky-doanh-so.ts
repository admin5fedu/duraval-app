import type { QueryKeyFactory } from "./types"

/**
 * Query keys for Đăng Ký Doanh Số module
 */
export const dangKyDoanhSo: QueryKeyFactory = {
  all: () => ["dang-ky-doanh-so"] as const,
  list: () => ["dang-ky-doanh-so", "list"] as const,
  detail: (id: number | string) => ["dang-ky-doanh-so", "detail", id] as const,
  search: (query: string) => ["dang-ky-doanh-so", "search", query] as const,
}

