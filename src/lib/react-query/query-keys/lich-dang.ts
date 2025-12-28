import type { QueryKeyFactory } from "./types"

export const lichDang: QueryKeyFactory<"lich-dang"> = {
  all: () => ["lich-dang"] as const,
  list: () => ["lich-dang", "list"] as const,
  detail: (id: number) => ["lich-dang", "detail", id] as const,
}

