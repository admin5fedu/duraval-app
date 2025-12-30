import type { QueryKeyFactory } from "./types"

/**
 * Query keys for Phản Hồi Khách Hàng module
 */
export const phanHoiKhachHang: QueryKeyFactory = {
  all: () => ["phan-hoi-khach-hang"] as const,
  list: () => ["phan-hoi-khach-hang", "list"] as const,
  detail: (id: number | string) => ["phan-hoi-khach-hang", "detail", id] as const,
  search: (query: string) => ["phan-hoi-khach-hang", "search", query] as const,
}

export const phanHoiKhachHangQueryKeys = phanHoiKhachHang

