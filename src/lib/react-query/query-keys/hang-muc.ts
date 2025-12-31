import type { QueryKeyFactory } from "./types"

/**
 * Query keys for Hạng Mục module
 */
export const hangMuc: QueryKeyFactory = {
  all: () => ["hang-muc"] as const,
  list: () => ["hang-muc", "list"] as const,
  detail: (id: number | string) => ["hang-muc", "detail", id] as const,
  search: (query: string) => ["hang-muc", "search", query] as const,
  byLoaiPhieuId: (loaiPhieuId: number | string) => ["hang-muc", "by-loai-phieu-id", loaiPhieuId] as const,
}

