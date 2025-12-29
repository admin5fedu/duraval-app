import type { QueryKeyFactory } from "./types"

/**
 * Query keys for Chi Nhánh module
 */
export const chiNhanh: QueryKeyFactory = {
  all: () => ["chi-nhanh"] as const,
  list: () => ["chi-nhanh", "list"] as const,
  detail: (id: number | string) => ["chi-nhanh", "detail", id] as const,
}

