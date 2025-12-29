"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { phieuHanhChinhQueryKeys } from "@/lib/react-query/query-keys"
import { PhieuHanhChinhAPI } from "../services/phieu-hanh-chinh.api"
import type { CreatePhieuHanhChinhInput } from "../types"
import { phieuHanhChinhSchema } from "../schema"

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
function mapExcelToDb(row: ExcelRow, rowIndex: number): { data: CreatePhieuHanhChinhInput; row: number } {
  // Extract fields
  const ngay = row.ngay
  const loaiPhieu = String(row.loai_phieu || "").trim()
  const maPhieu = String(row.ma_phieu || "").trim()
  const ca = row.ca ? String(row.ca).trim() : null
  const soGio = row.so_gio
  const lyDo = row.ly_do ? String(row.ly_do).trim() : null
  const comTrua = row.com_trua
  const phuongTien = row.phuong_tien ? String(row.phuong_tien).trim() : null

  // Validate required fields
  if (!ngay) {
    throw new Error(`Dòng ${rowIndex + 1}: Ngày không được để trống`)
  }
  if (!loaiPhieu) {
    throw new Error(`Dòng ${rowIndex + 1}: Loại phiếu không được để trống`)
  }
  if (!maPhieu) {
    throw new Error(`Dòng ${rowIndex + 1}: Mã phiếu không được để trống`)
  }
  if (!lyDo) {
    throw new Error(`Dòng ${rowIndex + 1}: Lý do không được để trống`)
  }

  // Convert date
  let ngayValue: string
  if (ngay instanceof Date) {
    ngayValue = ngay.toISOString().split('T')[0]
  } else if (typeof ngay === 'string') {
    // Try to parse date string
    const date = new Date(ngay)
    if (isNaN(date.getTime())) {
      throw new Error(`Dòng ${rowIndex + 1}: Ngày không hợp lệ`)
    }
    ngayValue = date.toISOString().split('T')[0]
  } else {
    throw new Error(`Dòng ${rowIndex + 1}: Ngày không hợp lệ`)
  }

  // Convert so_gio to number if provided
  let soGioValue: number | null = null
  if (soGio !== undefined && soGio !== null && soGio !== "") {
    const soGioNumber = Number(soGio)
    if (isNaN(soGioNumber) || soGioNumber <= 0) {
      throw new Error(`Dòng ${rowIndex + 1}: Số giờ phải là số dương`)
    }
    soGioValue = soGioNumber
  }

  // Convert com_trua to boolean
  const comTruaValue = comTrua === true || comTrua === "true" || comTrua === "1" || comTrua === 1

  // Build data object
  const data: CreatePhieuHanhChinhInput = {
    ngay: ngayValue,
    loai_phieu: loaiPhieu,
    ma_phieu: maPhieu,
    ca: ca || null,
    so_gio: soGioValue,
    ly_do: lyDo,
    com_trua: comTruaValue,
    phuong_tien: phuongTien,
    trang_thai: "Chờ duyệt",
    quan_ly_duyet: false,
    hcns_duyet: false,
  }

  // Validate with Zod schema
  const result = phieuHanhChinhSchema.omit({ 
    id: true, 
    tg_tao: true, 
    tg_cap_nhat: true, 
    nguoi_tao_id: true, 
    nguoi_tao_ten: true,
    trao_doi: true,
    trang_thai: true,
    quan_ly_duyet: true,
    ten_quan_ly: true,
    tg_quan_ly_duyet: true,
    hcns_duyet: true,
    ten_hcns: true,
    tg_hcns_duyet: true,
  }).safeParse(data)
  
  if (!result.success) {
    const errors = result.error.issues.map((e) => e.message).join(", ")
    throw new Error(`Dòng ${rowIndex + 1}: ${errors}`)
  }

  return { data: result.data as CreatePhieuHanhChinhInput, row: rowIndex + 1 }
}

/**
 * Hook to batch upsert phiếu hành chính from Excel
 */
export function useBatchUpsertPhieuHanhChinh() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (rows: ExcelRow[]): Promise<BatchUpsertResult> => {
      const result: BatchUpsertResult = {
        inserted: 0,
        updated: 0,
        errors: [],
      }

      // Map and validate all records first
      const mappedRecords: { data: CreatePhieuHanhChinhInput; row: number }[] = []
      for (let i = 0; i < rows.length; i++) {
        try {
          mappedRecords.push(mapExcelToDb(rows[i], i))
        } catch (error: any) {
          result.errors.push({
            row: i + 1,
            error: error.message || "Lỗi không xác định",
          })
        }
      }

      // If there are mapping/validation errors, return them early
      if (result.errors.length > 0 && mappedRecords.length === 0) {
        return result
      }

      // Get all unique ma_phieu values
      const maPhieuList = Array.from(
        new Set(mappedRecords.map((r) => r.data.ma_phieu).filter(Boolean))
      ) as string[]

      // Fetch existing records by ma_phieu (optimized batch query)
      const existingRecords = maPhieuList.length > 0
        ? await PhieuHanhChinhAPI.getByMaPhieuList(maPhieuList)
        : []

      const existingMap = new Map(
        existingRecords.map((r) => [r.ma_phieu, r])
      )

      // Process each mapped record
      for (const { data, row } of mappedRecords) {
        try {
          const existing = existingMap.get(data.ma_phieu)

          if (existing) {
            // Update existing record
            await PhieuHanhChinhAPI.update(existing.id!, data)
            result.updated++
          } else {
            // Create new record
            await PhieuHanhChinhAPI.create(data)
            result.inserted++
          }
        } catch (error: any) {
          result.errors.push({
            row,
            error: error.message || "Lỗi không xác định",
          })
        }
      }

      return result
    },
    onSuccess: (result) => {
      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: phieuHanhChinhQueryKeys.all(),
        exact: false,
      })
      queryClient.refetchQueries({
        queryKey: phieuHanhChinhQueryKeys.list(),
        exact: true,
      })

      // Show success message
      const totalProcessed = result.inserted + result.updated
      const errorCount = result.errors.length
      if (errorCount === 0) {
        toast.success(
          `Nhập dữ liệu thành công: ${result.inserted} bản ghi mới, ${result.updated} bản ghi cập nhật`
        )
      } else {
        toast.warning(
          `Nhập dữ liệu hoàn tất: ${totalProcessed} bản ghi thành công, ${errorCount} bản ghi lỗi`
        )
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Có lỗi xảy ra khi nhập dữ liệu")
    },
  })
}

