import type { QueryKeyFactory } from "./types"

/**
 * Query keys for Cấp Bậc module
 */
export const capBac: QueryKeyFactory = {
  all: () => ["cap-bac"] as const,
  list: () => ["cap-bac", "list"] as const,
  detail: (id: number | string) => ["cap-bac", "detail", id] as const,
  search: (query: string) => ["cap-bac", "search", query] as const,
}

