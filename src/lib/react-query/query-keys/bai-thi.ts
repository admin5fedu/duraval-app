import type { QueryKeyFactory } from "./types"

/**
 * Query keys for Bài thi module
 */
export const baiThi: QueryKeyFactory = {
  all: () => ["bai-thi"] as const,
  list: () => ["bai-thi", "list"] as const,
  detail: (id: number | string) => ["bai-thi", "detail", id] as const,
  search: (query: string) => ["bai-thi", "search", query] as const,
}

