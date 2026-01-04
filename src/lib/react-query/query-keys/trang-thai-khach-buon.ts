import type { QueryKeyFactory } from "./types"

/**
 * Query keys for Trạng Thái Khách Buôn module
 */
export const trangThaiKhachBuon: QueryKeyFactory = {
  all: () => ["trang-thai-khach-buon"] as const,
  list: () => ["trang-thai-khach-buon", "list"] as const,
  detail: (id: number | string) => ["trang-thai-khach-buon", "detail", id] as const,
  search: (query: string) => ["trang-thai-khach-buon", "search", query] as const,
}

