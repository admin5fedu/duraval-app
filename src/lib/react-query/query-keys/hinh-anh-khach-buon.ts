import type { QueryKeyFactory } from "./types"

/**
 * Query keys for Hình Ảnh Khách Buôn module
 */
export const hinhAnhKhachBuon: QueryKeyFactory = {
  all: () => ["hinh-anh-khach-buon"] as const,
  list: () => ["hinh-anh-khach-buon", "list"] as const,
  detail: (id: number | string) => ["hinh-anh-khach-buon", "detail", id] as const,
  search: (query: string) => ["hinh-anh-khach-buon", "search", query] as const,
}
