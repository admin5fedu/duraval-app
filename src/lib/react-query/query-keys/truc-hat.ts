import type { QueryKeyFactory } from "./types"

/**
 * Query keys for Trục Hạt module
 */
export const trucHat: QueryKeyFactory = {
  all: () => ["truc-hat"] as const,
  list: () => ["truc-hat", "list"] as const,
  detail: (id: number | string) => ["truc-hat", "detail", id] as const,
  search: (query: string) => ["truc-hat", "search", query] as const,
}

export const trucHatQueryKeys = trucHat

