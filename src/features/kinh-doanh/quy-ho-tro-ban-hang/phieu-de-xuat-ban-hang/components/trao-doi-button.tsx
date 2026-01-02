"use client"

import * as React from "react"
import { MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useUpdatePhieuDeXuatBanHang } from "../hooks/use-phieu-de-xuat-ban-hang-mutations"
import { useAuthStore } from "@/shared/stores/auth-store"
import { ActionGroup } from "@/shared/components/actions"
import { getActionVariant, getActionSize } from "@/shared/utils/action-styles"
import { useQueryClient } from "@tanstack/react-query"
import { phieuDeXuatBanHang as phieuDeXuatBanHangQueryKeys } from "@/lib/react-query/query-keys/phieu-de-xuat-ban-hang"
import { PhieuDeXuatBanHang } from "../schema"
import { TraoDoiHistory } from "@/shared/components/data-display/trao-doi-history"
import { toast } from "sonner"

interface TraoDoiButtonProps {
  phieuDeXuatBanHang: PhieuDeXuatBanHang
  onSuccess?: () => void
}

interface TraoDoiItem {
  noi_dung: string
  nguoi_trao_doi_id: number | null
  nguoi_trao_doi: string
  thoi_gian: string
  loai?: "xac_nhan" | string
}

export function TraoDoiButton({ phieuDeXuatBanHang, onSuccess }: TraoDoiButtonProps) {
  const [open, setOpen] = React.useState(false)
  const [traoDoiMoi, setTraoDoiMoi] = React.useState("")
  const updateMutation = useUpdatePhieuDeXuatBanHang()
  const { employee } = useAuthStore()
  const queryClient = useQueryClient()

  // Parse trao_doi để lấy danh sách hiện có (chỉ để thêm mới vào)
  const traoDoiList: TraoDoiItem[] = React.useMemo(() => {
    if (!phieuDeXuatBanHang.trao_doi) return []
    
    try {
      let list: TraoDoiItem[] = []
      
      // Nếu là array, map và convert
      if (Array.isArray(phieuDeXuatBanHang.trao_doi)) {
        list = phieuDeXuatBanHang.trao_doi.map((item: any) => ({
          noi_dung: item.noi_dung || "",
          nguoi_trao_doi_id: item.nguoi_trao_doi_id || item.nguoi_xac_nhan_id || null,
          nguoi_trao_doi: item.nguoi_trao_doi || item.nguoi_xac_nhan || "",
          thoi_gian: item.thoi_gian || "",
          loai: item.loai || undefined,
        }))
      }
      // Nếu là object (từ xác nhận), convert thành array
      else if (typeof phieuDeXuatBanHang.trao_doi === 'object') {
        const item = phieuDeXuatBanHang.trao_doi as any
        list = [{
          noi_dung: item.noi_dung || "",
          nguoi_trao_doi_id: item.nguoi_trao_doi_id || item.nguoi_xac_nhan_id || null,
          nguoi_trao_doi: item.nguoi_trao_doi || item.nguoi_xac_nhan || "",
          thoi_gian: item.thoi_gian || "",
          loai: item.loai || undefined,
        }]
      }
      
      return list
    } catch {
      return []
    }
  }, [phieuDeXuatBanHang.trao_doi])

  const handleOpenDialog = () => {
    setTraoDoiMoi("")
    setOpen(true)
  }

  const handleSubmit = async () => {
    if (!traoDoiMoi.trim()) {
      toast.error("Vui lòng nhập trao đổi")
      return
    }

    try {
      // Tạo trao đổi mới
      const traoDoiMoiItem: TraoDoiItem = {
        noi_dung: traoDoiMoi.trim(),
        nguoi_trao_doi_id: employee?.ma_nhan_vien || null,
        nguoi_trao_doi: employee?.ho_ten || "",
        thoi_gian: new Date().toISOString(),
      }

      // Thêm vào danh sách trao đổi hiện có
      const traoDoiMoiList = [...traoDoiList, traoDoiMoiItem]

      await updateMutation.mutateAsync({
        id: phieuDeXuatBanHang.id!,
        input: {
          trao_doi: traoDoiMoiList,
        } as any,
      })

      // Invalidate queries để refresh data
      queryClient.invalidateQueries({ queryKey: phieuDeXuatBanHangQueryKeys.all() })

      setOpen(false)
      setTraoDoiMoi("")
      
      toast.success("Thêm trao đổi thành công")

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      // Error is handled by mutation
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Trao đổi</DialogTitle>
            <DialogDescription>
              Thêm trao đổi liên quan đến phiếu đề xuất bán hàng này.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Danh sách trao đổi cũ */}
            <div className="space-y-2">
              <Label>Lịch sử trao đổi</Label>
              <ScrollArea className="h-48 w-full rounded-md border p-4">
                <TraoDoiHistory traoDoi={phieuDeXuatBanHang.trao_doi} variant="list" emptyMessage="Chưa có trao đổi" />
              </ScrollArea>
            </div>

            {/* Input trao đổi mới */}
            <div className="space-y-2">
              <Label htmlFor="trao-doi-moi">Trao đổi mới</Label>
              <Textarea
                id="trao-doi-moi"
                value={traoDoiMoi}
                onChange={(e) => setTraoDoiMoi(e.target.value)}
                placeholder="Nhập trao đổi..."
                rows={4}
                className="resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t">
            <ActionGroup
              actions={[
                {
                  label: "Đóng",
                  onClick: () => setOpen(false),
                  level: "secondary",
                  disabled: updateMutation.isPending,
                },
                {
                  label: updateMutation.isPending ? "Đang lưu..." : "Gửi trao đổi",
                  onClick: handleSubmit,
                  level: "primary",
                  disabled: updateMutation.isPending || !traoDoiMoi.trim(),
                  loading: updateMutation.isPending,
                },
              ]}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Trigger button - Default action */}
      <Button
        variant={getActionVariant("default")}
        size={getActionSize("default")}
        onClick={(e) => {
          e.stopPropagation()
          handleOpenDialog()
        }}
      >
        <MessageSquare className="mr-2 h-4 w-4" />
        Trao đổi
      </Button>
    </>
  )
}

