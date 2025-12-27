import type { QueryKeyFactory } from "./types"

/**
 * Query keys for Chức Vụ module
 */
export const chucVu: QueryKeyFactory = {
  all: () => ["chuc-vu"] as const,
  list: () => ["chuc-vu", "list"] as const,
  detail: (id: number) => ["chuc-vu", "detail", id] as const,
  search: (query: string) => ["chuc-vu", "search", query] as const,
}

