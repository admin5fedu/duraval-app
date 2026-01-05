import { z } from "zod"
import type { SanPhamXuatVat } from "./types"

/**
 * Schema for raw data from Google Apps Script API
 */
export const sanPhamXuatVatRawSchema = z.object({
  "Mã hàng": z.string(),
  "Tên hàng hóa": z.string(),
  "ĐVT": z.string(),
  "Số lượng tồn": z.union([z.number(), z.string()]).transform((val) => {
    if (typeof val === "string") {
      const num = parseFloat(val.replace(/[,\s]/g, ""))
      return isNaN(num) ? 0 : num
    }
    return val
  }),
  "Giá xuất": z.union([z.number(), z.string()]).transform((val) => {
    if (typeof val === "string") {
      const cleaned = val.toString().replace(/[,\s]/g, "").trim()
      const num = parseFloat(cleaned)
      return isNaN(num) ? 0 : num
    }
    return val
  }),
  "Thuế suất": z.union([z.number(), z.string(), z.literal("")]).transform((val) => {
    if (val === "" || val === null || val === undefined) return null
    if (typeof val === "string") {
      const num = parseFloat(val.replace(/[,\s]/g, ""))
      return isNaN(num) ? null : num
    }
    return val
  }),
  "Loại sản phẩm": z.union([z.number(), z.string(), z.literal("")]).transform((val) => {
    if (val === "" || val === null || val === undefined) return null
    if (typeof val === "string") {
      const cleaned = val.toString().trim()
      if (cleaned === "") return null
      return cleaned
    }
    return val.toString()
  }),
})

/**
 * Transform raw data to normalized format with index
 */
export function transformSanPhamXuatVat(
  rawData: z.infer<typeof sanPhamXuatVatRawSchema>,
  index: number
): SanPhamXuatVat {
  return {
    index,
    ma_hang: rawData["Mã hàng"],
    ten_hang_hoa: rawData["Tên hàng hóa"],
    dvt: rawData["ĐVT"],
    so_luong_ton: rawData["Số lượng tồn"],
    gia_xuat: rawData["Giá xuất"],
    thue_suat: rawData["Thuế suất"],
    loai_san_pham: rawData["Loại sản phẩm"],
  }
}

