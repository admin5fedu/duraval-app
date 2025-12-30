import type { QueryKeyFactory } from "./types"

/**
 * Query keys for Danh Mục Tài Liệu module
 */
export const danhMucTaiLieu: QueryKeyFactory = {
  all: () => ["danh-muc-tai-lieu"] as const,
  list: () => ["danh-muc-tai-lieu", "list"] as const,
  detail: (id: number | string) => ["danh-muc-tai-lieu", "detail", id] as const,
  search: (query: string) => ["danh-muc-tai-lieu", "search", query] as const,
}

// Alias for consistency with other modules
export const danhMucTaiLieuQueryKeys = danhMucTaiLieu

