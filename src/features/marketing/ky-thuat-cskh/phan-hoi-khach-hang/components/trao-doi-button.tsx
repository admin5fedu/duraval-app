"use client"

import * as React from "react"
import { MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useUpdatePhanHoiKhachHang } from "../hooks"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { useAuthStore } from "@/shared/stores/auth-store"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { phanHoiKhachHangQueryKeys } from "@/lib/react-query/query-keys"
import { PhanHoiKhachHang } from "../schema"
import { TraoDoiHistory } from "@/shared/components"

interface TraoDoiButtonProps {
  phanHoi: PhanHoiKhachHang
  onSuccess?: () => void
  variant?: "default" | "primary"
}

interface TraoDoiItem {
  noi_dung: string
  nguoi_trao_doi_id: number | null
  nguoi_trao_doi: string
  thoi_gian: string
  loai?: string
}

export function TraoDoiButton({ phanHoi, onSuccess, variant = "default" }: TraoDoiButtonProps) {
  const [open, setOpen] = React.useState(false)
  const [traoDoiMoi, setTraoDoiMoi] = React.useState("")
  const updateMutation = useUpdatePhanHoiKhachHang()
  const { user } = useAuthStore()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Parse trao_doi để lấy danh sách hiện có
  const traoDoiList: TraoDoiItem[] = React.useMemo(() => {
    if (!phanHoi.trao_doi) return []
    
    try {
      let list: TraoDoiItem[] = []
      
      // Nếu là array, map và convert
      if (Array.isArray(phanHoi.trao_doi)) {
        list = phanHoi.trao_doi.map((item: any) => ({
          noi_dung: item.noi_dung || "",
          nguoi_trao_doi_id: item.nguoi_trao_doi_id || null,
          nguoi_trao_doi: item.nguoi_trao_doi || "",
          thoi_gian: item.thoi_gian || "",
          loai: item.loai || undefined,
        }))
      }
      // Nếu là object, convert thành array
      else if (typeof phanHoi.trao_doi === 'object') {
        const item = phanHoi.trao_doi as any
        list = [{
          noi_dung: item.noi_dung || "",
          nguoi_trao_doi_id: item.nguoi_trao_doi_id || null,
          nguoi_trao_doi: item.nguoi_trao_doi || "",
          thoi_gian: item.thoi_gian || "",
          loai: item.loai || undefined,
        }]
      }
      
      return list
    } catch {
      return []
    }
  }, [phanHoi.trao_doi])

  const handleOpenDialog = () => {
    setTraoDoiMoi("")
    setOpen(true)
  }

  const handleSubmit = async () => {
    if (!traoDoiMoi.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập trao đổi",
        variant: "error",
      })
      return
    }

    try {
      // Tạo trao đổi mới
      const traoDoiMoiItem: TraoDoiItem = {
        noi_dung: traoDoiMoi.trim(),
        nguoi_trao_doi_id: user?.id ? Number(user.id) : null,
        nguoi_trao_doi: user?.user_metadata?.ho_ten || user?.email || "Unknown",
        thoi_gian: new Date().toISOString(),
      }

      // Tạo array mới với trao đổi cũ + mới
      const traoDoiMoiArray = [...traoDoiList, traoDoiMoiItem]

      // Update record
      await updateMutation.mutateAsync({
        id: phanHoi.id!,
        input: {
          trao_doi: traoDoiMoiArray,
        },
      })

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: phanHoiKhachHangQueryKeys.all() })

      toast({
        title: "Thành công",
        description: "Thêm trao đổi thành công",
      })

      setOpen(false)
      setTraoDoiMoi("")

      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thêm trao đổi",
        variant: "error",
      })
    }
  }

  return (
    <>
      <Button
        variant={variant === "primary" ? "default" : "outline"}
        size="sm"
        className={actionButtonClass()}
        onClick={handleOpenDialog}
      >
        <MessageSquare className="mr-2 h-4 w-4" />
        Trao Đổi
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Trao Đổi - Phản Hồi Khách Hàng #{phanHoi.id}</DialogTitle>
            <DialogDescription>
              Xem và thêm trao đổi về phản hồi khách hàng này
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col gap-4">
            {/* Lịch sử trao đổi */}
            {traoDoiList.length > 0 && (
              <div className="flex-1 min-h-0 flex flex-col">
                <Label className="mb-2">Lịch Sử Trao Đổi</Label>
                <ScrollArea className="flex-1 border rounded-md p-4">
                  <TraoDoiHistory
                    traoDoi={traoDoiList}
                  />
                </ScrollArea>
              </div>
            )}

            {/* Form thêm trao đổi mới */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="trao-doi-moi">Thêm Trao Đổi Mới</Label>
              <Textarea
                id="trao-doi-moi"
                placeholder="Nhập trao đổi của bạn..."
                value={traoDoiMoi}
                onChange={(e) => setTraoDoiMoi(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={updateMutation.isPending || !traoDoiMoi.trim()}
            >
              {updateMutation.isPending ? "Đang lưu..." : "Thêm Trao Đổi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

