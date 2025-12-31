import type { QueryKeyFactory } from "./types"

/**
 * Query keys for Loại Doanh Thu module
 */
export const loaiDoanhThu: QueryKeyFactory = {
  all: () => ["loai-doanh-thu"] as const,
  list: () => ["loai-doanh-thu", "list"] as const,
  detail: (id: number | string) => ["loai-doanh-thu", "detail", id] as const,
  search: (query: string) => ["loai-doanh-thu", "search", query] as const,
}

