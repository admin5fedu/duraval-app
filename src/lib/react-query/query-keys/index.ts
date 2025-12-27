/**
 * Centralized Query Key Management
 * 
 * Export all query key factories from a single location.
 */

export { nhanSu, nhanSu as nhanSuQueryKeys } from "./nhan-su"
export { nguoiThan, nguoiThan as nguoiThanQueryKeys } from "./nguoi-than"
export type { QueryKeyFactory, QueryKey, BaseQueryKey } from "./types"

