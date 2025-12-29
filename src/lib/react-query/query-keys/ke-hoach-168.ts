import type { QueryKeyFactory } from "./types"

/**
 * Query keys for Kế Hoạch 168 module
 */
export const keHoach168: QueryKeyFactory = {
  all: () => ["ke-hoach-168"] as const,
  list: () => ["ke-hoach-168", "list"] as const,
  detail: (id: number | string) => ["ke-hoach-168", "detail", id] as const,
  search: (query: string) => ["ke-hoach-168", "search", query] as const,
}

