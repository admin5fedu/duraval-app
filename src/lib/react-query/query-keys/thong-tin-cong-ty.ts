import type { QueryKeyFactory } from "./types"

/**
 * Query keys for Thông Tin Công Ty module
 */
export const thongTinCongTy: QueryKeyFactory = {
  all: () => ["thong-tin-cong-ty"] as const,
  list: () => ["thong-tin-cong-ty", "list"] as const,
  detail: (id: number | string) => ["thong-tin-cong-ty", "detail", id] as const,
}

