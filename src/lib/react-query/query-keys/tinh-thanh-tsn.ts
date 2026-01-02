import type { QueryKeyFactory } from "./types"

/**
 * Query keys for Tỉnh thành TSN module
 */
export const tinhThanhTSN: QueryKeyFactory = {
  all: () => ["tinh-thanh-tsn"] as const,
  list: () => ["tinh-thanh-tsn", "list"] as const,
  detail: (id: number | string) => ["tinh-thanh-tsn", "detail", id] as const,
  search: (query: string) => ["tinh-thanh-tsn", "search", query] as const,
}

