/**
 * Query keys for Phân Quyền module
 */

export const phanQuyenQueryKeys = {
  all: () => ["phan-quyen"] as const,
  lists: () => [...phanQuyenQueryKeys.all(), "list"] as const,
  list: () => [...phanQuyenQueryKeys.lists()] as const,
  details: () => [...phanQuyenQueryKeys.all(), "detail"] as const,
  detail: (id: number) => [...phanQuyenQueryKeys.details(), id] as const,
  byChucVu: (chucVuId: number) => [...phanQuyenQueryKeys.all(), "by-chuc-vu", chucVuId] as const,
}

