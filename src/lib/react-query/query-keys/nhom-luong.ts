import type { QueryKeyFactory } from "./types"

/**
 * Query keys for Nhóm Lương module
 */
export const nhomLuong: QueryKeyFactory = {
  all: () => ["nhom-luong"] as const,
  list: () => ["nhom-luong", "list"] as const,
  detail: (id: number | string) => ["nhom-luong", "detail", id] as const,
  search: (query: string) => ["nhom-luong", "search", query] as const,
}

export const nhomLuongQueryKeys = nhomLuong

