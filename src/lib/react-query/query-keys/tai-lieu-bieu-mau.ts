import type { QueryKeyFactory } from "./types"

/**
 * Query keys for Tài Liệu & Biểu Mẫu module
 */
export const taiLieuBieuMau: QueryKeyFactory = {
  all: () => ["tai-lieu-bieu-mau"] as const,
  list: () => ["tai-lieu-bieu-mau", "list"] as const,
  detail: (id: number | string) => ["tai-lieu-bieu-mau", "detail", id] as const,
  search: (query: string) => ["tai-lieu-bieu-mau", "search", query] as const,
}

// Alias for consistency with other modules
export const taiLieuBieuMauQueryKeys = taiLieuBieuMau

