import type { QueryKeyFactory } from "./types"

/**
 * Query keys for Chấm OLE module
 */
export const chamOle: QueryKeyFactory = {
  all: () => ["cham-ole"] as const,
  list: () => ["cham-ole", "list"] as const,
  detail: (id: number | string) => ["cham-ole", "detail", id] as const,
  search: (query: string) => ["cham-ole", "search", query] as const,
}

export const chamOleQueryKeys = chamOle

