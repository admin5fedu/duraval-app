import type { QueryKeyFactory } from "./types"

/**
 * Query keys for Giai Đoạn Khách Buôn module
 */
export const giaiDoanKhachBuon: QueryKeyFactory = {
  all: () => ["giai-doan-khach-buon"] as const,
  list: () => ["giai-doan-khach-buon", "list"] as const,
  detail: (id: number | string) => ["giai-doan-khach-buon", "detail", id] as const,
  search: (query: string) => ["giai-doan-khach-buon", "search", query] as const,
}

