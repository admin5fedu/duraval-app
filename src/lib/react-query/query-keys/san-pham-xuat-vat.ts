/**
 * Query keys for Sản phẩm xuất VAT module
 */

import type { QueryKeyFactory } from "./types"

export const sanPhamXuatVat: QueryKeyFactory = {
  all: () => ["san-pham-xuat-vat"] as const,
  list: () => ["san-pham-xuat-vat", "list"] as const,
  detail: (id: number | string) => ["san-pham-xuat-vat", "detail", id] as const,
  search: (query: string) => ["san-pham-xuat-vat", "search", query] as const,
}

