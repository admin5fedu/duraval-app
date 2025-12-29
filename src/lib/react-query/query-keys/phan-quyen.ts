/**
 * Query keys for Phân Quyền module
 */

export const phanQuyenQueryKeys = {
  all: () => ["phan-quyen"] as const,
  list: () => ["phan-quyen", "list"] as const,
  detail: (id: number | string) => ["phan-quyen", "detail", id] as const,
  byChucVu: (chucVuId: number) => ["phan-quyen", "by-chuc-vu", chucVuId] as const,
}

