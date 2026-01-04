import type { QueryKeyFactory } from "./types"

/**
 * Query keys for Người Liên Hệ module
 */
export const nguoiLienHe: QueryKeyFactory = {
  all: () => ["nguoi-lien-he"] as const,
  list: () => ["nguoi-lien-he", "list"] as const,
  detail: (id: number | string) => ["nguoi-lien-he", "detail", id] as const,
  search: (query: string) => ["nguoi-lien-he", "search", query] as const,
}

