import type { QueryKeyFactory } from "./types"

/**
 * Query keys for Nhân Sự module
 */
export const nhanSu: QueryKeyFactory = {
  all: () => ["nhan-su"] as const,
  list: () => ["nhan-su", "list"] as const,
  detail: (id: number | string) => ["nhan-su", "detail", id] as const,
  search: (query: string) => ["nhan-su", "search", query] as const,
}

