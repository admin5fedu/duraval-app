import { phanHoiKhachHangSchema, type PhanHoiKhachHang } from "../schema"
import type { CreatePhanHoiKhachHangInput, UpdatePhanHoiKhachHangInput } from "../types"

/**
 * Domain service cho Phản Hồi Khách Hàng.
 *
 * - Không phụ thuộc Next.js hay Supabase
 * - Xử lý validation, chuẩn hoá dữ liệu
 */
export class PhanHoiKhachHangService {
  /**
   * Validate & chuẩn hoá input tạo mới từ form/UI.
   */
  validateCreateInput(input: CreatePhanHoiKhachHangInput): CreatePhanHoiKhachHangInput {
    const result = phanHoiKhachHangSchema.omit({ 
      id: true, 
      tg_tao: true, 
      tg_cap_nhat: true, 
      nguoi_tao_id: true,
      nhan_vien: true,
      nguoi_tao: true,
    }).safeParse(input)

    if (!result.success) {
      const message =
        "Dữ liệu phản hồi khách hàng không hợp lệ: " +
        result.error.issues.map((e) => e.message).join(", ")
      throw new Error(message)
    }

    return result.data as CreatePhanHoiKhachHangInput
  }

  /**
   * Chuẩn hoá payload update:
   * - Bỏ các field undefined
   * - Giữ null để cho phép clear giá trị
   * - Không cho phép đổi id
   */
  buildUpdatePayload(input: UpdatePhanHoiKhachHangInput): Partial<PhanHoiKhachHang> {
    const payload: Partial<PhanHoiKhachHang> = {}

    const assignIfDefined = <K extends keyof PhanHoiKhachHang>(
      key: K,
      value: PhanHoiKhachHang[K] | undefined
    ) => {
      if (value !== undefined) {
        payload[key] = value
      }
    }

    assignIfDefined("nhan_vien_id", input.nhan_vien_id as any)
    assignIfDefined("ten_nhan_vien", input.ten_nhan_vien as any)
    assignIfDefined("phong_id", input.phong_id as any)
    assignIfDefined("nhom_id", input.nhom_id as any)
    assignIfDefined("ma_san_pham", input.ma_san_pham as any)
    assignIfDefined("ten_san_pham", input.ten_san_pham as any)
    assignIfDefined("id_don_hang", input.id_don_hang as any)
    assignIfDefined("sdt_khach", input.sdt_khach as any)
    assignIfDefined("ngay_ban", input.ngay_ban as any)
    assignIfDefined("loai_loi", input.loai_loi as any)
    assignIfDefined("ten_loi", input.ten_loi as any)
    assignIfDefined("mo_ta_loi", input.mo_ta_loi as any)
    assignIfDefined("muc_do", input.muc_do as any)
    assignIfDefined("yeu_cau_khach_hang", input.yeu_cau_khach_hang as any)
    assignIfDefined("hinh_anh", input.hinh_anh as any)
    assignIfDefined("bien_phap_hien_tai", input.bien_phap_hien_tai as any)
    assignIfDefined("bien_phap_de_xuat", input.bien_phap_de_xuat as any)
    assignIfDefined("han_xu_ly", input.han_xu_ly as any)
    assignIfDefined("trang_thai", input.trang_thai as any)
    assignIfDefined("kt_mo_ta_loi", input.kt_mo_ta_loi as any)
    assignIfDefined("kt_phu_trach", input.kt_phu_trach as any)
    assignIfDefined("kt_quyet_dinh", (input as any).kt_quyet_dinh as any)
    assignIfDefined("chi_phi", input.chi_phi as any)
    assignIfDefined("id_don_hoan", input.id_don_hoan as any)
    assignIfDefined("trang_thai_don_hoan", input.trang_thai_don_hoan as any)
    assignIfDefined("bien_phap_don_hoan", input.bien_phap_don_hoan as any)
    assignIfDefined("ghi_chu_don_hoan", input.ghi_chu_don_hoan as any)
    assignIfDefined("ket_qua_cuoi_cung", input.ket_qua_cuoi_cung as any)
    assignIfDefined("ngay_hoan_thanh", input.ngay_hoan_thanh as any)
    assignIfDefined("trao_doi", input.trao_doi as any)
    assignIfDefined("tg_cap_nhat", input.tg_cap_nhat as any)

    return payload
  }
}

