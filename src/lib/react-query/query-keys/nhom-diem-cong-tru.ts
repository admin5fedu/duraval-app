import type { QueryKeyFactory } from "./types"

/**
 * Query keys for Nhóm Điểm Cộng Trừ module
 */
export const nhomDiemCongTru: QueryKeyFactory = {
  all: () => ["nhom-diem-cong-tru"] as const,
  list: () => ["nhom-diem-cong-tru", "list"] as const,
  detail: (id: number | string) => ["nhom-diem-cong-tru", "detail", id] as const,
  search: (query: string) => ["nhom-diem-cong-tru", "search", query] as const,
}

export const nhomDiemCongTruQueryKeys = nhomDiemCongTru

