import type { QueryKeyFactory } from "./types"

/**
 * Query keys for Phiếu Hành Chính module
 */
export const phieuHanhChinh: QueryKeyFactory = {
  all: () => ["phieu-hanh-chinh"] as const,
  list: () => ["phieu-hanh-chinh", "list"] as const,
  detail: (id: number | string) => ["phieu-hanh-chinh", "detail", id] as const,
  search: (query: string) => ["phieu-hanh-chinh", "search", query] as const,
}

export const phieuHanhChinhQueryKeys = phieuHanhChinh

