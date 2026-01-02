import type { QueryKeyFactory } from "./types"

/**
 * Query keys for Phiếu đề xuất bán hàng module
 */
export const phieuDeXuatBanHang: QueryKeyFactory = {
  all: () => ["phieu-de-xuat-ban-hang"] as const,
  list: () => ["phieu-de-xuat-ban-hang", "list"] as const,
  detail: (id: number | string) => ["phieu-de-xuat-ban-hang", "detail", id] as const,
  search: (query: string) => ["phieu-de-xuat-ban-hang", "search", query] as const,
}

