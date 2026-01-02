/**
 * Types for Tổng quan quỹ HTBH
 */

export interface TongQuanQuyHTBHData {
  nhan_vien_id: number
  ten_nhan_vien: string
  phong_id: number | null
  ma_phong: string | null
  nhom_id: number | null
  ma_nhom: string | null
  months: Record<number, MonthData>
  quarters: Record<number, QuarterData>
  total: YearTotalData
}

export interface MonthData {
  budget: number // Định mức (so_tien_quy)
  actual: number // Thực dùng (da_dung)
  balance: number // Còn dư (con_du = budget - actual)
  sales: number // Doanh số ĐK (doanh_thu)
}

export interface QuarterData {
  budget: number // Tổng định mức quý
  actual: number // Tổng thực dùng quý
  balance: number // Tổng còn dư quý
  sales: number // Tổng doanh số ĐK quý
}

export interface YearTotalData {
  budget: number // Tổng định mức năm
  actual: number // Tổng thực dùng năm
  balance: number // Tổng còn dư năm
  sales: number // Tổng doanh số ĐK năm
}

export interface RawQuyData {
  nhan_vien_id: number
  ten_nhan_vien: string | null
  phong_id: number | null
  ma_phong: string | null
  nhom_id: number | null
  ma_nhom: string | null
  nam: number
  thang: number
  so_tien_quy: number | null
  da_dung: number | null
  con_du: number | null
}

export interface RawDoanhSoData {
  nhan_vien_id: number
  ten_nhan_vien: string | null
  nam: number
  thang: number
  doanh_thu: number | null
}

