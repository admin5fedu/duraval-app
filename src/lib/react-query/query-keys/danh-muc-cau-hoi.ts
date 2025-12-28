import type { QueryKeyFactory } from "./types"

/**
 * Query keys for Danh Mục Câu Hỏi module
 */
export const danhMucCauHoi: QueryKeyFactory = {
  all: () => ["danh-muc-cau-hoi"] as const,
  list: () => ["danh-muc-cau-hoi", "list"] as const,
  detail: (id: number) => ["danh-muc-cau-hoi", "detail", id] as const,
  search: (query: string) => ["danh-muc-cau-hoi", "search", query] as const,
}

// Alias for consistency with other modules
export const danhMucCauHoiQueryKeys = danhMucCauHoi

