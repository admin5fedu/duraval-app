import type { QueryKeyFactory } from "./types"

/**
 * Query keys for Quận huyện TSN module
 */
export const quanHuyenTSN: QueryKeyFactory = {
  all: () => ["quan-huyen-tsn"] as const,
  list: () => ["quan-huyen-tsn", "list"] as const,
  detail: (id: number | string) => ["quan-huyen-tsn", "detail", id] as const,
  search: (query: string) => ["quan-huyen-tsn", "search", query] as const,
}

