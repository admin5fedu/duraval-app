"use client"

import * as React from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useNhanSu } from "@/features/he-thong/nhan-su/danh-sach-nhan-su/hooks/use-nhan-su"

/**
 * Interface cho một item trao đổi
 */
export interface TraoDoiItem {
  noi_dung: string
  nguoi_trao_doi_id?: number | null
  nguoi_trao_doi?: string
  nguoi_xac_nhan_id?: number | null
  nguoi_xac_nhan?: string
  thoi_gian: string
  loai?: "xac_nhan" | string
}

/**
 * Props cho component TraoDoiHistory
 */
export interface TraoDoiHistoryProps {
  /**
   * Dữ liệu trao đổi (JSONB) - có thể là array hoặc object
   */
  traoDoi: any
  /**
   * Message hiển thị khi không có trao đổi
   */
  emptyMessage?: string
  /**
   * Custom className cho container
   */
  className?: string
  /**
   * Hiển thị dạng table (default) hoặc list
   */
  variant?: "table" | "list"
}

/**
 * Parse và normalize dữ liệu trao đổi từ JSONB
 */
function parseTraoDoi(traoDoi: any): TraoDoiItem[] {
  if (!traoDoi) return []
  
  try {
    let list: TraoDoiItem[] = []
    
    // Nếu là array, map và convert
    if (Array.isArray(traoDoi)) {
      list = traoDoi.map((item: any) => ({
        noi_dung: item.noi_dung || "",
        nguoi_trao_doi_id: item.nguoi_trao_doi_id || item.nguoi_xac_nhan_id || null,
        nguoi_trao_doi: item.nguoi_trao_doi || item.nguoi_xac_nhan || "",
        thoi_gian: item.thoi_gian || "",
        loai: item.loai || undefined,
      }))
    }
    // Nếu là object (từ xác nhận), convert thành array
    else if (typeof traoDoi === 'object') {
      const item = traoDoi as any
      list = [{
        noi_dung: item.noi_dung || "",
        nguoi_trao_doi_id: item.nguoi_trao_doi_id || item.nguoi_xac_nhan_id || null,
        nguoi_trao_doi: item.nguoi_trao_doi || item.nguoi_xac_nhan || "",
        thoi_gian: item.thoi_gian || "",
        loai: item.loai || undefined,
      }]
    }
    
    // Sắp xếp theo thời gian (mới nhất ở đầu, cũ nhất ở cuối)
    return list.sort((a, b) => {
      if (!a.thoi_gian && !b.thoi_gian) return 0
      if (!a.thoi_gian) return 1
      if (!b.thoi_gian) return -1
      return new Date(b.thoi_gian).getTime() - new Date(a.thoi_gian).getTime()
    })
  } catch (error) {
    console.error("Lỗi khi parse trao đổi:", error)
    return []
  }
}

/**
 * Format thời gian
 */
function formatThoiGian(thoiGian: string): string {
  if (!thoiGian) return "-"
  try {
    return format(new Date(thoiGian), "dd/MM/yyyy HH:mm", { locale: vi })
  } catch {
    return thoiGian
  }
}

/**
 * Format tên người dùng theo format "mã - tên"
 */
function formatNguoiDung(
  item: TraoDoiItem,
  nhanSuList?: any[]
): string {
  const nguoiId = item.nguoi_trao_doi_id || item.nguoi_xac_nhan_id
  
  // Nếu có ID và danh sách nhân sự, tìm nhân viên
  if (nguoiId && nhanSuList && nhanSuList.length > 0) {
    const nhanVien = nhanSuList.find(
      (nv) => nv.ma_nhan_vien === Number(nguoiId)
    )
    if (nhanVien && nhanVien.ma_nhan_vien && nhanVien.ho_ten) {
      return `${nhanVien.ma_nhan_vien} - ${nhanVien.ho_ten}`
    }
  }
  
  // Fallback: nếu có tên trong item, giữ nguyên (cho tương thích ngược)
  // Hoặc nếu có ID nhưng không tìm thấy nhân viên, hiển thị ID
  if (item.nguoi_trao_doi || item.nguoi_xac_nhan) {
    // Nếu tên đã có format "mã - tên" thì giữ nguyên
    const name = item.nguoi_trao_doi || item.nguoi_xac_nhan || ""
    if (name.includes(" - ")) {
      return name
    }
    // Nếu chỉ có tên, thử thêm mã nếu có ID
    if (nguoiId) {
      return `${nguoiId} - ${name}`
    }
    return name
  }
  
  // Nếu có ID nhưng không có tên
  if (nguoiId) {
    return `ID: ${nguoiId}`
  }
  
  return "Không xác định"
}

/**
 * Component hiển thị lịch sử trao đổi dạng table
 */
function TraoDoiHistoryTable({ items, nhanSuList }: { items: TraoDoiItem[], nhanSuList?: any[] }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse table-fixed">
        <colgroup>
          <col className="w-[180px] min-w-[150px] max-w-[250px]" /> {/* Người */}
          <col className="min-w-[200px]" /> {/* Nội dung - flexible */}
          <col className="w-[160px] min-w-[140px] max-w-[180px]" /> {/* Thời gian */}
        </colgroup>
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Người</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Nội dung</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Thời gian tạo</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
              <td className="py-3 px-4 text-sm text-foreground align-top">
                <div className="flex flex-col gap-1.5">
                  <span className="font-medium break-words">
                    {formatNguoiDung(item, nhanSuList)}
                  </span>
                  {item.loai === "xac_nhan" && (
                    <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded w-fit">
                      Xác nhận
                    </span>
                  )}
                </div>
              </td>
              <td className="py-3 px-4 text-sm text-foreground align-top whitespace-pre-wrap break-words">
                {item.noi_dung || "-"}
              </td>
              <td className="py-3 px-4 text-sm text-muted-foreground align-top">
                {formatThoiGian(item.thoi_gian)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * Component hiển thị lịch sử trao đổi dạng list
 */
function TraoDoiHistoryList({ items, nhanSuList }: { items: TraoDoiItem[], nhanSuList?: any[] }) {
  return (
    <div className="space-y-3 w-full">
      {items.map((item, index) => (
        <div key={index} className="flex flex-col gap-1 py-2 border-b last:border-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-foreground">
              {formatNguoiDung(item, nhanSuList)}
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">
              {formatThoiGian(item.thoi_gian)}
            </span>
            {item.loai === "xac_nhan" && (
              <>
                <span className="text-muted-foreground">•</span>
                <span className="text-xs text-green-600 font-medium">Xác nhận</span>
              </>
            )}
          </div>
          <div className="text-sm text-foreground whitespace-pre-wrap pl-0">
            {item.noi_dung || "-"}
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Component hiển thị lịch sử trao đổi
 * 
 * @example
 * ```tsx
 * <TraoDoiHistory traoDoi={data.trao_doi} />
 * ```
 */
export function TraoDoiHistory({
  traoDoi,
  emptyMessage = "Chưa có trao đổi",
  className,
  variant = "table"
}: TraoDoiHistoryProps) {
  const { data: nhanSuList } = useNhanSu()
  const traoDoiList = React.useMemo(() => parseTraoDoi(traoDoi), [traoDoi])
  
  if (traoDoiList.length === 0) {
    return <div className={cn("text-muted-foreground", className)}>{emptyMessage}</div>
  }
  
  return (
    <div className={className}>
      {variant === "table" ? (
        <TraoDoiHistoryTable items={traoDoiList} nhanSuList={nhanSuList} />
      ) : (
        <TraoDoiHistoryList items={traoDoiList} nhanSuList={nhanSuList} />
      )}
    </div>
  )
}

