import type { QueryKeyFactory } from "./types"

/**
 * Query keys for Phường Xã TSN module
 */
export const phuongXaTSN: QueryKeyFactory = {
  all: () => ["phuong-xa-tsn"] as const,
  list: () => ["phuong-xa-tsn", "list"] as const,
  detail: (id: number | string) => ["phuong-xa-tsn", "detail", id] as const,
  search: (query: string) => ["phuong-xa-tsn", "search", query] as const,
}

