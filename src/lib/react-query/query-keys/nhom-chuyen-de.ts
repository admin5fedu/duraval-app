import type { QueryKeyFactory } from "./types"

/**
 * Query keys for Nhóm chuyên đề module
 */
export const nhomChuyenDe: QueryKeyFactory = {
  all: () => ["nhom-chuyen-de"] as const,
  list: () => ["nhom-chuyen-de", "list"] as const,
  detail: (id: number | string) => ["nhom-chuyen-de", "detail", id] as const,
  search: (query: string) => ["nhom-chuyen-de", "search", query] as const,
}

