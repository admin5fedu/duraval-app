"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { phanHoiKhachHangQueryKeys } from "@/lib/react-query/query-keys"
import { PhanHoiKhachHangAPI } from "../services/phan-hoi-khach-hang.api"
import type { CreatePhanHoiKhachHangInput } from "../types"
import { phanHoiKhachHangSchema } from "../schema"
import { useAuthStore } from "@/shared/stores/auth-store"

interface ExcelRow {
  [key: string]: any
}

interface BatchUpsertResult {
  inserted: number
  updated: number
  errors: Array<{ row: number; error: string }>
}

/**
 * Map Excel row to database format
 */
function mapExcelToDb(row: ExcelRow, rowIndex: number): { data: CreatePhanHoiKhachHangInput; row: number } {
  // Extract fields
  const ngay = row.ngay ? String(row.ngay).trim() : new Date().toISOString().split('T')[0]
  const nhanVienId = row.nhan_vien_id ? Number(row.nhan_vien_id) : null
  const phongId = row.phong_id ? Number(row.phong_id) : null
  const nhomId = row.nhom_id ? Number(row.nhom_id) : null
  const maSanPham = row.ma_san_pham ? String(row.ma_san_pham).trim() : null
  const tenSanPham = row.ten_san_pham ? String(row.ten_san_pham).trim() : null
  const idDonHang = row.id_don_hang ? String(row.id_don_hang).trim() : null
  const sdtKhach = row.sdt_khach ? String(row.sdt_khach).trim() : null
  const ngayBan = row.ngay_ban ? String(row.ngay_ban).trim() : null
  const loaiLoi = row.loai_loi ? String(row.loai_loi).trim() : null
  const tenLoi = row.ten_loi ? String(row.ten_loi).trim() : null
  const moTaLoi = row.mo_ta_loi ? String(row.mo_ta_loi).trim() : null
  const mucDo = row.muc_do ? String(row.muc_do).trim() : null
  const yeuCauKhachHang = row.yeu_cau_khach_hang ? String(row.yeu_cau_khach_hang).trim() : null
  const bienPhapHienTai = row.bien_phap_hien_tai ? String(row.bien_phap_hien_tai).trim() : null
  const bienPhapDeXuat = row.bien_phap_de_xuat ? String(row.bien_phap_de_xuat).trim() : null
  const hanXuLy = row.han_xu_ly ? String(row.han_xu_ly).trim() : null
  const trangThai = row.trang_thai ? String(row.trang_thai).trim() : "Mới"
  const ktMoTaLoi = row.kt_mo_ta_loi ? String(row.kt_mo_ta_loi).trim() : null
  const ktPhuTrach = row.kt_phu_trach ? String(row.kt_phu_trach).trim() : null
  const chiPhi = row.chi_phi !== undefined && row.chi_phi !== null ? Number(row.chi_phi) : 0
  const idDonHoan = row.id_don_hoan ? String(row.id_don_hoan).trim() : null
  const trangThaiDonHoan = row.trang_thai_don_hoan ? String(row.trang_thai_don_hoan).trim() : null
  const bienPhapDonHoan = row.bien_phap_don_hoan ? String(row.bien_phap_don_hoan).trim() : null
  const ghiChuDonHoan = row.ghi_chu_don_hoan ? String(row.ghi_chu_don_hoan).trim() : null
  const ketQuaCuoiCung = row.ket_qua_cuoi_cung ? String(row.ket_qua_cuoi_cung).trim() : null
  const ngayHoanThanh = row.ngay_hoan_thanh ? String(row.ngay_hoan_thanh).trim() : null
  
  // Parse hinh_anh - can be comma or newline separated
  let hinhAnh: string[] | null = null
  if (row.hinh_anh) {
    const hinhAnhStr = String(row.hinh_anh).trim()
    if (hinhAnhStr) {
      hinhAnh = hinhAnhStr
        .split(/[,\n]/)
        .map(url => url.trim())
        .filter(url => url.length > 0)
    }
  }

  // Build data object - only include required fields and non-null optional fields
  const data: any = {
    ngay: ngay,
    ...(nhanVienId !== null && nhanVienId !== undefined && { nhan_vien_id: nhanVienId }),
    ...(phongId !== null && { phong_id: phongId }),
    ...(nhomId !== null && { nhom_id: nhomId }),
    ...(maSanPham !== null && { ma_san_pham: maSanPham }),
    ...(tenSanPham !== null && { ten_san_pham: tenSanPham }),
    ...(idDonHang !== null && { id_don_hang: idDonHang }),
    ...(sdtKhach !== null && { sdt_khach: sdtKhach }),
    ...(ngayBan !== null && { ngay_ban: ngayBan }),
    ...(loaiLoi !== null && { loai_loi: loaiLoi }),
    ...(tenLoi !== null && { ten_loi: tenLoi }),
    ...(moTaLoi !== null && { mo_ta_loi: moTaLoi }),
    ...(mucDo !== null && { muc_do: mucDo }),
    ...(yeuCauKhachHang !== null && { yeu_cau_khach_hang: yeuCauKhachHang }),
    ...(hinhAnh !== null && { hinh_anh: hinhAnh }),
    ...(bienPhapHienTai !== null && { bien_phap_hien_tai: bienPhapHienTai }),
    ...(bienPhapDeXuat !== null && { bien_phap_de_xuat: bienPhapDeXuat }),
    ...(hanXuLy !== null && { han_xu_ly: hanXuLy }),
    trang_thai: trangThai,
    ...(ktMoTaLoi !== null && { kt_mo_ta_loi: ktMoTaLoi }),
    ...(ktPhuTrach !== null && { kt_phu_trach: ktPhuTrach }),
    chi_phi: chiPhi,
    ...(idDonHoan !== null && { id_don_hoan: idDonHoan }),
    ...(trangThaiDonHoan !== null && { trang_thai_don_hoan: trangThaiDonHoan }),
    ...(bienPhapDonHoan !== null && { bien_phap_don_hoan: bienPhapDonHoan }),
    ...(ghiChuDonHoan !== null && { ghi_chu_don_hoan: ghiChuDonHoan }),
    ...(ketQuaCuoiCung !== null && { ket_qua_cuoi_cung: ketQuaCuoiCung }),
    ...(ngayHoanThanh !== null && { ngay_hoan_thanh: ngayHoanThanh }),
  } as CreatePhanHoiKhachHangInput

  // Validate with Zod schema
  const result = phanHoiKhachHangSchema.omit({ 
    id: true, 
    tg_tao: true, 
    tg_cap_nhat: true, 
    nguoi_tao_id: true,
    nhan_vien: true,
    nguoi_tao: true,
  }).safeParse(data)
  
  if (!result.success) {
    const errors = result.error.issues.map((e) => e.message).join(", ")
    throw new Error(`Dòng ${rowIndex + 1}: ${errors}`)
  }

  return { data: result.data as CreatePhanHoiKhachHangInput, row: rowIndex + 1 }
}

/**
 * Hook to batch upsert phản hồi khách hàng from Excel
 */
export function useBatchUpsertPhanHoiKhachHang() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async (rows: ExcelRow[]): Promise<BatchUpsertResult> => {
      const result: BatchUpsertResult = {
        inserted: 0,
        updated: 0,
        errors: [],
      }

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        try {
          const { data } = mapExcelToDb(row, i)
          
          // Add nguoi_tao_id
          const createInput: CreatePhanHoiKhachHangInput = {
            ...data,
            nguoi_tao_id: user?.id ? Number(user.id) : null,
          }

          // Try to find existing record by id_don_hang if available
          if (data.id_don_hang) {
            const existing = await PhanHoiKhachHangAPI.getAll()
            const existingRecord = existing.find(p => p.id_don_hang === data.id_don_hang)
            
            if (existingRecord) {
              // Update existing
              await PhanHoiKhachHangAPI.update(existingRecord.id!, data)
              result.updated++
            } else {
              // Create new
              await PhanHoiKhachHangAPI.create(createInput)
              result.inserted++
            }
          } else {
            // Create new
            await PhanHoiKhachHangAPI.create(createInput)
            result.inserted++
          }
        } catch (error: any) {
          result.errors.push({
            row: i + 1,
            error: error.message || "Lỗi không xác định",
          })
        }
      }

      return result
    },
    onSuccess: (result) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: phanHoiKhachHangQueryKeys.all() })
      
      // Show success message
      const successCount = result.inserted + result.updated
      const errorCount = result.errors.length
      
      if (errorCount === 0) {
        toast.success(
          `Import thành công: ${result.inserted} bản ghi mới, ${result.updated} bản ghi cập nhật`
        )
      } else {
        toast.warning(
          `Import hoàn tất: ${successCount} thành công, ${errorCount} lỗi. Vui lòng kiểm tra chi tiết.`
        )
      }
    },
    onError: (error: Error) => {
      toast.error(`Lỗi khi import: ${error.message}`)
    },
  })
}

