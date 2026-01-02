import type { QueryKeyFactory } from "./types"

/**
 * Query keys for Tỉnh thành SSN module
 */
export const tinhThanhSSN: QueryKeyFactory = {
  all: () => ["tinh-thanh-ssn"] as const,
  list: () => ["tinh-thanh-ssn", "list"] as const,
  detail: (id: number | string) => ["tinh-thanh-ssn", "detail", id] as const,
  search: (query: string) => ["tinh-thanh-ssn", "search", query] as const,
}

