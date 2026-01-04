import type { QueryKeyFactory } from "./types"

/**
 * Query keys for Danh Sách KB module
 */
export const danhSachKB: QueryKeyFactory = {
  all: () => ["danh-sach-KB"] as const,
  list: () => ["danh-sach-KB", "list"] as const,
  detail: (id: number | string) => ["danh-sach-KB", "detail", id] as const,
  search: (query: string) => ["danh-sach-KB", "search", query] as const,
}

