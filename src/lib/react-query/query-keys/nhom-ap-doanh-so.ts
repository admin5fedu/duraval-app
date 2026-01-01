import type { QueryKeyFactory } from "./types"

/**
 * Query keys for Nhóm Áp Doanh Số module
 */
export const nhomApDoanhSo: QueryKeyFactory = {
  all: () => ["nhom-ap-doanh-so"] as const,
  list: () => ["nhom-ap-doanh-so", "list"] as const,
  detail: (id: number | string) => ["nhom-ap-doanh-so", "detail", id] as const,
  search: (query: string) => ["nhom-ap-doanh-so", "search", query] as const,
}

