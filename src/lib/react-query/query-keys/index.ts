/**
 * Centralized Query Key Management
 * 
 * Export all query key factories from a single location.
 */

export { nhanSu, nhanSu as nhanSuQueryKeys } from "./nhan-su"
export { nguoiThan, nguoiThan as nguoiThanQueryKeys } from "./nguoi-than"
export { thongTinCongTy, thongTinCongTy as thongTinCongTyQueryKeys } from "./thong-tin-cong-ty"
export { chiNhanh, chiNhanh as chiNhanhQueryKeys } from "./chi-nhanh"
export { phongBan, phongBan as phongBanQueryKeys } from "./phong-ban"
export type { QueryKeyFactory, QueryKey, BaseQueryKey } from "./types"

