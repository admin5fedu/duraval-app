"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Eye } from "lucide-react"
import type { BaiThi } from "../schema"
import type { NhanSu } from "@/features/he-thong/nhan-su/danh-sach-nhan-su/schema"
import { useMemo } from "react"
import { calculatePercentage } from "../utils/bai-thi-test-helpers"

interface BaiThiInlineListProps {
  baiThiList: BaiThi[]
  nhanSuList?: NhanSu[]
  onView?: (baiThi: BaiThi) => void
  currentEmployeeId?: number
}

export function BaiThiInlineList({
  baiThiList,
  nhanSuList,
  onView,
  currentEmployeeId,
}: BaiThiInlineListProps) {
  const nhanSuMap = useMemo(() => {
    const map = new Map<number, NhanSu>()
    if (nhanSuList) {
      nhanSuList.forEach((ns) => {
        if (ns.ma_nhan_vien) {
          map.set(ns.ma_nhan_vien, ns)
        }
      })
    }
    return map
  }, [nhanSuList])

  if (baiThiList.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Chưa có lượt thi nào.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        Danh sách các lượt thi ({baiThiList.length})
      </h3>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nhân viên</TableHead>
              <TableHead className="hidden sm:table-cell">Ngày thi</TableHead>
              <TableHead>Điểm số</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="hidden lg:table-cell">Thời gian làm bài</TableHead>
              {onView && <TableHead className="w-[100px]">Thao tác</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {baiThiList.map((baiThi) => {
              const nhanSu = nhanSuMap.get(baiThi.nhan_vien_id)
              const percentage = calculatePercentage(
                baiThi.diem_so || 0,
                baiThi.tong_so_cau || 0
              )
              const isPassed = baiThi.trang_thai === "Đạt"
              const isFailed = baiThi.trang_thai === "Không đạt"

              // Format duration
              let duration = "---"
              if (baiThi.thoi_gian_bat_dau && baiThi.thoi_gian_ket_thuc) {
                try {
                  const start = new Date(baiThi.thoi_gian_bat_dau)
                  const end = new Date(baiThi.thoi_gian_ket_thuc)
                  const diffMs = end.getTime() - start.getTime()
                  const diffMins = Math.floor(diffMs / 60000)
                  const diffSecs = Math.floor((diffMs % 60000) / 1000)
                  duration = `${diffMins > 0 ? `${diffMins} phút ` : ""}${diffSecs > 0 ? `${diffSecs} giây` : ""}`
                } catch {
                  // Keep default
                }
              }

              const isMyTest = currentEmployeeId === baiThi.nhan_vien_id

              return (
                <TableRow 
                  key={baiThi.id}
                  className={isMyTest ? "bg-primary/5 hover:bg-primary/10" : ""}
                >
                  <TableCell className="font-medium">
                    {nhanSu
                      ? `${nhanSu.ma_nhan_vien} - ${nhanSu.ho_ten}`
                      : `ID: ${baiThi.nhan_vien_id}`}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {baiThi.ngay_lam_bai
                      ? format(new Date(baiThi.ngay_lam_bai), "dd/MM/yyyy", {
                          locale: vi,
                        })
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span
                        className={`font-semibold ${
                          isPassed
                            ? "text-green-600 dark:text-green-400"
                            : isFailed
                            ? "text-red-600 dark:text-red-400"
                            : ""
                        }`}
                      >
                        {baiThi.diem_so}/{baiThi.tong_so_cau}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        isPassed
                          ? "default"
                          : isFailed
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {baiThi.trang_thai}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {duration}
                  </TableCell>
                  {onView && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(baiThi)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

