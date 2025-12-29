import type { QueryKeyFactory } from "./types"

export const lichDang: QueryKeyFactory = {
  all: () => ["lich-dang"] as const,
  list: () => ["lich-dang", "list"] as const,
  detail: (id: number | string) => ["lich-dang", "detail", id] as const,
}

