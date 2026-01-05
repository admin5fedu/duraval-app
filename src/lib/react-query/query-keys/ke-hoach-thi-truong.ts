import type { QueryKeyFactory } from "./types"

/**
 * Query keys for Kế Hoạch Thị Trường module
 */
export const keHoachThiTruong: QueryKeyFactory = {
  all: () => ["ke-hoach-thi-truong"] as const,
  list: () => ["ke-hoach-thi-truong", "list"] as const,
  detail: (id: number | string) => ["ke-hoach-thi-truong", "detail", id] as const,
  search: (query: string) => ["ke-hoach-thi-truong", "search", query] as const,
}

