import type { QueryKeyFactory } from "./types"

/**
 * Query keys for Phòng Ban module
 */
export const phongBan: QueryKeyFactory = {
  all: () => ["phong-ban"] as const,
  list: () => ["phong-ban", "list"] as const,
  detail: (id: number | string) => ["phong-ban", "detail", id] as const,
}

