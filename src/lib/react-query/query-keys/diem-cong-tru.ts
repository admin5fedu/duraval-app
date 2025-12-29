import type { QueryKeyFactory } from "./types"

/**
 * Query keys for Điểm Cộng Trừ module
 */
export const diemCongTru: QueryKeyFactory = {
  all: () => ["diem-cong-tru"] as const,
  list: () => ["diem-cong-tru", "list"] as const,
  detail: (id: number | string) => ["diem-cong-tru", "detail", id] as const,
  search: (query: string) => ["diem-cong-tru", "search", query] as const,
}

export const diemCongTruQueryKeys = diemCongTru

