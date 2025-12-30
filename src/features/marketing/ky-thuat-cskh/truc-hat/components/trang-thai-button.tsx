"use client"

import * as React from "react"
import { Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useUpdateTrucHat } from "../hooks"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { trucHatQueryKeys } from "@/lib/react-query/query-keys"
import { TrucHat } from "../schema"
import { trucHatSchema } from "../schema"
import { GenericFormView, type FormSection } from "@/shared/components"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TrangThaiButtonProps {
  trucHat: TrucHat
  onSuccess?: () => void
  variant?: "default" | "primary" | "icon"
  iconOnly?: boolean
}

const quickEditSchema = trucHatSchema.pick({
  trang_thai: true,
  anh_ban_ve: true,
  ghi_chu: true,
})

export function TrangThaiButton({ trucHat, onSuccess, variant = "default", iconOnly = false }: TrangThaiButtonProps) {
  const [open, setOpen] = React.useState(false)
  const formRef = React.useRef<HTMLDivElement>(null)
  const updateMutation = useUpdateTrucHat()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const sections: FormSection[] = [
    {
      title: "Cập Nhật Nhanh",
      fields: [
        { 
          name: "trang_thai", 
          label: "Trạng Thái", 
          type: "toggle",
          required: true,
          options: [
            { label: "Mới", value: "Mới" },
            { label: "Đang vẽ", value: "Đang vẽ" },
            { label: "Đã đặt", value: "Đã đặt" },
            { label: "Đang về", value: "Đang về" },
            { label: "Chờ kiểm tra", value: "Chờ kiểm tra" },
            { label: "Chờ sửa", value: "Chờ sửa" },
            { label: "Chờ giao", value: "Chờ giao" },
            { label: "Đã giao", value: "Đã giao" },
          ],
        },
        { 
          name: "anh_ban_ve", 
          label: "Ảnh Bản Vẽ", 
          type: "image",
          imageFolder: "truc-hat",
          imageMaxSize: 10,
        },
        { 
          name: "ghi_chu", 
          label: "Ghi Chú", 
          type: "textarea",
        },
      ]
    },
  ]

  const defaultValues = React.useMemo(() => ({
    trang_thai: trucHat.trang_thai || "Mới",
    anh_ban_ve: trucHat.anh_ban_ve || "",
    ghi_chu: trucHat.ghi_chu || "",
  }), [trucHat])

  const handleOpenDialog = () => {
    setOpen(true)
  }

  const handleSubmit = async (data: any) => {
    try {
      await updateMutation.mutateAsync({
        id: trucHat.id!,
        input: {
          trang_thai: data.trang_thai,
          anh_ban_ve: data.anh_ban_ve || null,
          ghi_chu: data.ghi_chu || null,
        },
      })

      queryClient.invalidateQueries({ queryKey: trucHatQueryKeys.all() })

      toast({
        title: "Thành công",
        description: "Cập nhật trạng thái thành công",
      })

      setOpen(false)

      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật trạng thái",
        variant: "error",
      })
      throw error
    }
  }

  const handleCancel = () => {
    setOpen(false)
  }

  return (
    <>
      {iconOnly ? (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:text-blue-600 shrink-0"
          onClick={(e) => {
            e.stopPropagation()
            handleOpenDialog()
          }}
          title="Cập nhật trạng thái"
        >
          <span className="sr-only">Trạng thái</span>
          <Settings2 className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          variant={variant === "primary" ? "default" : "outline"}
          size="sm"
          className={actionButtonClass()}
          onClick={handleOpenDialog}
        >
          <Settings2 className="mr-2 h-4 w-4" />
          Trạng Thái
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent 
          className="!max-w-[1200px] !w-[90vw] max-w-[90vw] max-h-[95vh] p-0 flex flex-col"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
            <DialogTitle className="text-xl">Cập Nhật Trạng Thái - Trục Hạt #{trucHat.id}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              Cập nhật nhanh trạng thái, ảnh bản vẽ và ghi chú
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden min-h-0">
            <ScrollArea className="h-full">
              <div className="px-6 py-4" ref={formRef}>
                <GenericFormView
                  title=""
                  subtitle=""
                  schema={quickEditSchema}
                  defaultValues={defaultValues}
                  sections={sections}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  hideHeader={true}
                  hideFooter={true}
                />
              </div>
            </ScrollArea>
          </div>

          <DialogFooter className="px-6 py-4 border-t flex-shrink-0">
            <Button variant="outline" onClick={handleCancel} disabled={updateMutation.isPending}>
              Hủy
            </Button>
            <Button
              onClick={() => {
                // Trigger form submit through GenericFormView's internal form
                const form = formRef.current?.querySelector('form') as HTMLFormElement
                if (form) {
                  form.requestSubmit()
                }
              }}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Đang lưu..." : "Cập Nhật"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

