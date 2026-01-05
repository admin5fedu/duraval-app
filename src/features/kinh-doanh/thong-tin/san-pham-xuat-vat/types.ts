/**
 * Types for Sản phẩm xuất VAT
 */

export interface SanPhamXuatVatRaw {
  "Mã hàng": string
  "Tên hàng hóa": string
  "ĐVT": string
  "Số lượng tồn": number | string
  "Giá xuất": number | string
  "Thuế suất": number | string | "" | null
  "Loại sản phẩm": number | string | "" | null
}

export interface SanPhamXuatVat {
  index: number // Auto-generated index/row number
  ma_hang: string
  ten_hang_hoa: string
  dvt: string
  so_luong_ton: number
  gia_xuat: number
  thue_suat: number | null
  loai_san_pham: string | null
}

