import type { QueryKeyFactory } from "./types"

export const mucDangKy: QueryKeyFactory = {
  all: () => ["muc-dang-ky"] as const,
  list: () => ["muc-dang-ky", "list"] as const,
  detail: (id: number | string) => ["muc-dang-ky", "detail", id] as const,
  search: (query: string) => ["muc-dang-ky", "search", query] as const,
}

