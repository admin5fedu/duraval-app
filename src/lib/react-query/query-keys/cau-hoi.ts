import type { QueryKeyFactory } from "./types"

/**
 * Query keys for Câu hỏi module
 */
export const cauHoi: QueryKeyFactory = {
  all: () => ["cau-hoi"] as const,
  list: () => ["cau-hoi", "list"] as const,
  detail: (id: number | string) => ["cau-hoi", "detail", id] as const,
  search: (query: string) => ["cau-hoi", "search", query] as const,
}

