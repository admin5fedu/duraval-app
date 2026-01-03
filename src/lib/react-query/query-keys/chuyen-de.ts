import type { QueryKeyFactory } from "./types"

/**
 * Query keys for Chuyên đề module
 */
export const chuyenDe: QueryKeyFactory = {
  all: () => ["chuyen-de"] as const,
  list: () => ["chuyen-de", "list"] as const,
  detail: (id: number | string) => ["chuyen-de", "detail", id] as const,
  search: (query: string) => ["chuyen-de", "search", query] as const,
}

