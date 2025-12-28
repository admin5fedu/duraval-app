import type { QueryKeyFactory } from "./types"

/**
 * Query keys for Nhóm Phiếu Hành Chính module
 */
export const nhomPhieuHanhChinh: QueryKeyFactory = {
  all: () => ["nhom-phieu-hanh-chinh"] as const,
  list: () => ["nhom-phieu-hanh-chinh", "list"] as const,
  detail: (id: number) => ["nhom-phieu-hanh-chinh", "detail", id] as const,
  search: (query: string) => ["nhom-phieu-hanh-chinh", "search", query] as const,
}

export const nhomPhieuHanhChinhQueryKeys = nhomPhieuHanhChinh

