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
import { useUpdateTrucHat } from "../hooks"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { useAuthStore } from "@/shared/stores/auth-store"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { trucHatQueryKeys } from "@/lib/react-query/query-keys"
import { TrucHat } from "../schema"
import { TraoDoiHistory } from "@/shared/components"
import { checkModuleAdmin } from "@/shared/utils/check-module-admin"
import { trucHatConfig } from "../config"

interface TraoDoiButtonProps {
  trucHat: TrucHat
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

export function TraoDoiButton({ trucHat, onSuccess, variant = "default" }: TraoDoiButtonProps) {
  const [open, setOpen] = React.useState(false)
  const [traoDoiMoi, setTraoDoiMoi] = React.useState("")
  const updateMutation = useUpdateTrucHat()
  const { employee } = useAuthStore()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const traoDoiList: TraoDoiItem[] = React.useMemo(() => {
    if (!trucHat.trao_doi) return []
    
    try {
      let list: TraoDoiItem[] = []
      
      if (Array.isArray(trucHat.trao_doi)) {
        list = trucHat.trao_doi.map((item: any) => ({
          noi_dung: item.noi_dung || "",
          nguoi_trao_doi_id: item.nguoi_trao_doi_id || null,
          nguoi_trao_doi: item.nguoi_trao_doi || "",
          thoi_gian: item.thoi_gian || "",
          loai: item.loai || undefined,
        }))
      }
      else if (typeof trucHat.trao_doi === 'object') {
        const item = trucHat.trao_doi as any
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
  }, [trucHat.trao_doi])

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
      const traoDoiMoiItem: TraoDoiItem = {
        noi_dung: traoDoiMoi.trim(),
        nguoi_trao_doi_id: employee?.ma_nhan_vien || null,
        nguoi_trao_doi: employee?.ho_ten || "",
        thoi_gian: new Date().toISOString(),
      }

      const traoDoiMoiArray = [...traoDoiList, traoDoiMoiItem]

      await updateMutation.mutateAsync({
        id: trucHat.id!,
        input: {
          trao_doi: traoDoiMoiArray,
        },
      })

      queryClient.invalidateQueries({ queryKey: trucHatQueryKeys.all() })

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

  const handleDelete = async (index: number) => {
    try {
      // Remove item at index
      const newTraoDoiList = traoDoiList.filter((_, i) => i !== index)

      await updateMutation.mutateAsync({
        id: trucHat.id!,
        input: {
          trao_doi: newTraoDoiList,
        },
      })

      queryClient.invalidateQueries({ queryKey: trucHatQueryKeys.all() })

      toast({
        title: "Thành công",
        description: "Xóa trao đổi thành công",
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa trao đổi",
        variant: "error",
      })
      throw error
    }
  }

  // Check if user has admin permission for this module
  const isModuleAdmin = checkModuleAdmin(trucHatConfig.moduleName, employee)

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
            <DialogTitle>Trao Đổi - Trục Hạt #{trucHat.id}</DialogTitle>
            <DialogDescription>
              Xem và thêm trao đổi về trục hạt này
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col gap-4">
            {traoDoiList.length > 0 && (
              <div className="flex-1 min-h-0 flex flex-col">
                <Label className="mb-2">Lịch Sử Trao Đổi</Label>
                <ScrollArea className="flex-1 border rounded-md p-4">
                  <TraoDoiHistory
                    traoDoi={traoDoiList}
                    onDelete={handleDelete}
                    canDelete={() => isModuleAdmin}
                  />
                </ScrollArea>
              </div>
            )}

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

