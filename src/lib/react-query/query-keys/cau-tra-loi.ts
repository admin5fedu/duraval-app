import type { QueryKeyFactory } from "./types"

export const cauTraLoiQueryKeys: QueryKeyFactory = {
  all: () => ["cau-tra-loi"] as const,
  list: () => ["cau-tra-loi", "list"] as const,
  detail: (id: number | string) => ["cau-tra-loi", "detail", id] as const,
}

