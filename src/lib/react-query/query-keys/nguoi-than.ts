import type { QueryKeyFactory } from "./types"

/**
 * Query keys for Người Thân module
 */
export const nguoiThan: QueryKeyFactory = {
  all: () => ["nguoi-than"] as const,
  list: () => ["nguoi-than", "list"] as const,
  detail: (id: number) => ["nguoi-than", "detail", id] as const,
  byMaNhanVien: (maNhanVien: number) => ["nguoi-than", "byMaNhanVien", maNhanVien] as const,
}

