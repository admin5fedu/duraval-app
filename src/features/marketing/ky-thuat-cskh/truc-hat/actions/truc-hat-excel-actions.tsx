"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { trucHatQueryKeys } from "@/lib/react-query/query-keys"
import { TrucHatAPI } from "../services/truc-hat.api"
import type { CreateTrucHatInput } from "../types"
import { trucHatSchema } from "../schema"
import { useAuthStore } from "@/shared/stores/auth-store"

interface ExcelRow {
  [key: string]: any
}

interface BatchUpsertResult {
  inserted: number
  updated: number
  errors: Array<{ row: number; error: string }>
}

async function mapExcelToDb(row: ExcelRow, rowIndex: number, getMaxMaTruc: () => Promise<number>): Promise<{ data: CreateTrucHatInput; row: number }> {
  // ma_truc is required - if not provided, get max + 1
  let maTruc: number
  if (row.ma_truc !== undefined && row.ma_truc !== null) {
    maTruc = Number(row.ma_truc)
  } else {
    // Auto-increment if not provided
    const maxMaTruc = await getMaxMaTruc()
    maTruc = maxMaTruc + 1
  }
  
  const khachHang = row.khach_hang ? String(row.khach_hang).trim() : null
  const nhanVienBhId = row.nhan_vien_bh_id ? Number(row.nhan_vien_bh_id) : null
  const anhBanVe = row.anh_ban_ve ? String(row.anh_ban_ve).trim() : null
  const ghiChu = row.ghi_chu ? String(row.ghi_chu).trim() : null
  const trangThai = row.trang_thai ? String(row.trang_thai).trim() : "Mới"

  // nhan_vien_bh_id and trang_thai are required
  if (!nhanVienBhId) {
    throw new Error(`Dòng ${rowIndex + 1}: Nhân viên bán hàng là bắt buộc`)
  }

  const data: any = {
    ma_truc: maTruc,
    nhan_vien_bh_id: nhanVienBhId,
    trang_thai: trangThai,
    ...(khachHang !== null && { khach_hang: khachHang }),
    ...(anhBanVe !== null && { anh_ban_ve: anhBanVe }),
    ...(ghiChu !== null && { ghi_chu: ghiChu }),
  } as CreateTrucHatInput

  const result = trucHatSchema.omit({ 
    id: true, 
    tg_tao: true, 
    tg_cap_nhat: true, 
    nguoi_tao_id: true,
    nhan_vien_bh: true,
    nguoi_tao: true,
    trao_doi: true,
  }).safeParse(data)
  
  if (!result.success) {
    const errors = result.error.issues.map((e) => e.message).join(", ")
    throw new Error(`Dòng ${rowIndex + 1}: ${errors}`)
  }

  return { data: result.data as CreateTrucHatInput, row: rowIndex + 1 }
}

export function useBatchUpsertTrucHat() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async (rows: ExcelRow[]): Promise<BatchUpsertResult> => {
      const result: BatchUpsertResult = {
        inserted: 0,
        updated: 0,
        errors: [],
      }

      // Get max ma_truc once for all rows
      let currentMaxMaTruc = await TrucHatAPI.getMaxMaTruc()
      
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        try {
          const { data } = await mapExcelToDb(row, i, async () => {
            // Increment and return current max
            currentMaxMaTruc++
            return currentMaxMaTruc - 1
          })
          
          const createInput: CreateTrucHatInput = {
            ...data,
            nguoi_tao_id: user?.id ? Number(user.id) : null,
          }

          // Check if ma_truc already exists
          const existing = await TrucHatAPI.getAll()
          const existingRecord = existing.find(t => t.ma_truc === data.ma_truc)
          
          if (existingRecord) {
            await TrucHatAPI.update(existingRecord.id!, data)
            result.updated++
          } else {
            await TrucHatAPI.create(createInput)
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
      queryClient.invalidateQueries({ queryKey: trucHatQueryKeys.all() })
      
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

