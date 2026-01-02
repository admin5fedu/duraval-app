import type { QueryKeyFactory } from "./types"

/**
 * Query keys for Phường xã SNN module
 */
export const phuongXaSNN: QueryKeyFactory = {
  all: () => ["phuong-xa-snn"] as const,
  list: () => ["phuong-xa-snn", "list"] as const,
  detail: (id: number | string) => ["phuong-xa-snn", "detail", id] as const,
  search: (query: string) => ["phuong-xa-snn", "search", query] as const,
}

