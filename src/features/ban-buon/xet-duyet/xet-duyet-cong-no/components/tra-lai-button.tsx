"use client"

import * as React from "react"
import { RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUpdateXetDuyetCongNo } from "../hooks/use-xet-duyet-cong-no"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { xetDuyetCongNoQueryKeys } from "../hooks/use-xet-duyet-cong-no"
import { XetDuyetCongNo } from "../schema"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "@/shared/stores/auth-store"
import { 
  createAuditLogEntry, 
  addAuditLog, 
  parseAuditLog,
} from "../utils/trang-thai-utils"

interface TraLaiButtonProps {
  xetDuyetCongNo: XetDuyetCongNo
  onSuccess?: () => void
}

export function TraLaiButton({ xetDuyetCongNo, onSuccess }: TraLaiButtonProps) {
  const [open, setOpen] = React.useState(false)
  const [ghiChu, setGhiChu] = React.useState("")
  const updateMutation = useUpdateXetDuyetCongNo()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { employee } = useAuthStore()

  // Chỉ cho phép trả lại khi đang ở trạng thái "Chờ duyệt" hoặc "Yêu cầu bổ sung"
  const canTraLai = React.useMemo(() => {
    return xetDuyetCongNo.trang_thai === "Chờ duyệt" ||
           xetDuyetCongNo.trang_thai === "Yêu cầu bổ sung"
  }, [xetDuyetCongNo.trang_thai])

  // Parse audit log
  const existingAuditLog = React.useMemo(() => {
    return parseAuditLog((xetDuyetCongNo as any).audit_log)
  }, [(xetDuyetCongNo as any).audit_log])

  const handleConfirm = async () => {
    if (!ghiChu.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập lý do trả lại",
        variant: "error",
      })
      return
    }

    try {
      // Tạo audit log entry
      const auditEntry = createAuditLogEntry(
        "Trả lại yêu cầu",
        employee?.ma_nhan_vien || null,
        employee?.ho_ten || "",
        ghiChu.trim()
      )
      const newAuditLog = addAuditLog(existingAuditLog, auditEntry)

      await updateMutation.mutateAsync({
        id: xetDuyetCongNo.id!,
        input: {
          trang_thai: "Chờ kiểm tra",
          audit_log: newAuditLog,
        },
      })

      queryClient.invalidateQueries({ queryKey: xetDuyetCongNoQueryKeys.all() })

      toast({
        title: "Thành công",
        description: "Trả lại yêu cầu thành công",
      })

      setOpen(false)
      setGhiChu("")

      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể trả lại yêu cầu",
        variant: "error",
      })
    }
  }

  if (!canTraLai) {
    return null
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className={actionButtonClass()}
        onClick={() => setOpen(true)}
      >
        <RotateCcw className="mr-2 h-4 w-4" />
        Trả Lại
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Trả Lại Yêu Cầu</AlertDialogTitle>
            <AlertDialogDescription>
              Yêu cầu này sẽ được trả lại về trạng thái "Chờ kiểm tra" để người tạo có thể cập nhật lại.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ghi-chu">Lý Do Trả Lại *</Label>
              <Textarea
                id="ghi-chu"
                placeholder="Nhập lý do trả lại yêu cầu..."
                value={ghiChu}
                onChange={(e) => setGhiChu(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setOpen(false)
              setGhiChu("")
            }}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={updateMutation.isPending || !ghiChu.trim()}
            >
              {updateMutation.isPending ? "Đang xử lý..." : "Xác Nhận Trả Lại"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

