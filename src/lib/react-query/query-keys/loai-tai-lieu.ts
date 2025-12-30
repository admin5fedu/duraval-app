import type { QueryKeyFactory } from "./types"

/**
 * Query keys for Loại Tài Liệu module
 */
export const loaiTaiLieu: QueryKeyFactory = {
  all: () => ["loai-tai-lieu"] as const,
  list: () => ["loai-tai-lieu", "list"] as const,
  detail: (id: number | string) => ["loai-tai-lieu", "detail", id] as const,
  search: (query: string) => ["loai-tai-lieu", "search", query] as const,
}

// Alias for consistency with other modules
export const loaiTaiLieuQueryKeys = loaiTaiLieu

