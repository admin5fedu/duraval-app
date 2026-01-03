import type { QueryKeyFactory } from "./types"

/**
 * Query keys for Kỳ thi module
 */
export const kyThi: QueryKeyFactory = {
  all: () => ["ky-thi"] as const,
  list: () => ["ky-thi", "list"] as const,
  detail: (id: number | string) => ["ky-thi", "detail", id] as const,
  search: (query: string) => ["ky-thi", "search", query] as const,
}

