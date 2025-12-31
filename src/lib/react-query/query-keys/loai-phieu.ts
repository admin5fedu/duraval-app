import type { QueryKeyFactory } from "./types"

/**
 * Query keys for Loại Phiếu module
 */
export const loaiPhieu: QueryKeyFactory = {
  all: () => ["loai-phieu"] as const,
  list: () => ["loai-phieu", "list"] as const,
  detail: (id: number | string) => ["loai-phieu", "detail", id] as const,
  search: (query: string) => ["loai-phieu", "search", query] as const,
}

