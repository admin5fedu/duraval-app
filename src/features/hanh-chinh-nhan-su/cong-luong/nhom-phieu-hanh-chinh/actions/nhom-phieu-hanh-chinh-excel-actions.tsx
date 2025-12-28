"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { nhomPhieuHanhChinhQueryKeys } from "@/lib/react-query/query-keys"
import { NhomPhieuHanhChinhAPI } from "../services/nhom-phieu-hanh-chinh.api"
import type { NhomPhieuHanhChinh, CreateNhomPhieuHanhChinhInput } from "../schema"
import { nhomPhieuHanhChinhSchema } from "../schema"

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
function mapExcelToDb(row: ExcelRow, rowIndex: number): { data: CreateNhomPhieuHanhChinhInput; row: number } {
  // Extract fields
  const loaiPhieu = String(row.loai_phieu || "").trim()
  const maNhomPhieu = String(row.ma_nhom_phieu || "").trim()
  const tenNhomPhieu = String(row.ten_nhom_phieu || "").trim()
  const soLuongChoPhepThang = row.so_luong_cho_phep_thang
  const canHcnsDuyet = row.can_hcns_duyet
  const caToi = row.ca_toi

  // Validate required fields
  if (!loaiPhieu) {
    throw new Error(`Dòng ${rowIndex + 1}: Loại phiếu không được để trống`)
  }
  if (!maNhomPhieu) {
    throw new Error(`Dòng ${rowIndex + 1}: Mã nhóm phiếu không được để trống`)
  }
  if (!tenNhomPhieu) {
    throw new Error(`Dòng ${rowIndex + 1}: Tên nhóm phiếu không được để trống`)
  }
  if (soLuongChoPhepThang === undefined || soLuongChoPhepThang === null) {
    throw new Error(`Dòng ${rowIndex + 1}: Số lượng cho phép tháng không được để trống`)
  }

  const soLuongNumber = Number(soLuongChoPhepThang)
  if (isNaN(soLuongNumber) || soLuongNumber < 0 || !Number.isInteger(soLuongNumber)) {
    throw new Error(`Dòng ${rowIndex + 1}: Số lượng cho phép tháng phải là số nguyên không âm`)
  }

  // Convert can_hcns_duyet and ca_toi to "Có"/"Không"
  const convertToCoKhong = (value: any): "Có" | "Không" => {
    if (value === true || value === "true" || value === "1" || value === 1 || value === "Có") {
      return "Có"
    }
    return "Không"
  }

  const convertToCoKhongOrNull = (value: any): "Có" | "Không" | null => {
    if (value === undefined || value === null || value === "") {
      return null
    }
    return convertToCoKhong(value)
  }

  // Build data object
  const data: CreateNhomPhieuHanhChinhInput = {
    loai_phieu: loaiPhieu,
    ma_nhom_phieu: maNhomPhieu,
    ten_nhom_phieu: tenNhomPhieu,
    so_luong_cho_phep_thang: soLuongNumber,
    can_hcns_duyet: convertToCoKhong(canHcnsDuyet),
    ca_toi: convertToCoKhongOrNull(caToi),
  }

  // Validate with Zod schema
  const result = nhomPhieuHanhChinhSchema.omit({ id: true, tg_tao: true, tg_cap_nhat: true, nguoi_tao_id: true }).safeParse(data)
  if (!result.success) {
    const errors = result.error.issues.map((e) => e.message).join(", ")
    throw new Error(`Dòng ${rowIndex + 1}: ${errors}`)
  }

  return { data: result.data as CreateNhomPhieuHanhChinhInput, row: rowIndex + 1 }
}

/**
 * Hook to batch upsert nhóm phiếu hành chính from Excel
 */
export function useBatchUpsertNhomPhieuHanhChinh() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (rows: ExcelRow[]): Promise<BatchUpsertResult> => {
      const result: BatchUpsertResult = {
        inserted: 0,
        updated: 0,
        errors: [],
      }

      // Map and validate all records first
      const mappedRecords: { data: CreateNhomPhieuHanhChinhInput; row: number }[] = []
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

      // Get all unique ma_nhom_phieu values
      const maNhomPhieuList = Array.from(
        new Set(mappedRecords.map((r) => r.data.ma_nhom_phieu).filter(Boolean))
      ) as string[]

      // Fetch existing records by ma_nhom_phieu (optimized batch query)
      const existingRecords = maNhomPhieuList.length > 0
        ? await NhomPhieuHanhChinhAPI.getByMaNhomPhieuList(maNhomPhieuList)
        : []

      const existingMap = new Map(
        existingRecords.map((r) => [r.ma_nhom_phieu, r])
      )

      // Process each mapped record
      for (const { data, row } of mappedRecords) {
        try {
          const existing = existingMap.get(data.ma_nhom_phieu)

          if (existing) {
            // Update existing record
            await NhomPhieuHanhChinhAPI.update(existing.id!, data)
            result.updated++
          } else {
            // Create new record
            await NhomPhieuHanhChinhAPI.create(data)
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
        queryKey: nhomPhieuHanhChinhQueryKeys.all(),
        exact: false,
      })
      queryClient.refetchQueries({
        queryKey: nhomPhieuHanhChinhQueryKeys.list(),
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

