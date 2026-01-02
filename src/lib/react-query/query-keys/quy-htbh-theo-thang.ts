import type { QueryKeyFactory } from "./types"

/**
 * Query keys for Quỹ HTBH theo tháng module
 */
export const quyHTBHTheoThang: QueryKeyFactory = {
  all: () => ["quy-htbh-theo-thang"] as const,
  list: () => ["quy-htbh-theo-thang", "list"] as const,
  detail: (id: number | string) => ["quy-htbh-theo-thang", "detail", id] as const,
  search: (query: string) => ["quy-htbh-theo-thang", "search", query] as const,
}

