"use client"

import { useNavigate } from "react-router-dom"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { useTrucHatById } from "../hooks"
import { DeleteTrucHatButton } from "./delete-truc-hat-button"
import { TraoDoiButton } from "./trao-doi-button"
import { TrangThaiButton } from "./trang-thai-button"
import { trucHatConfig } from "../config"
import { DetailErrorState } from "@/shared/components/data-display/detail/detail-error-state"
import { TraoDoiHistory } from "@/shared/components/data-display/generic-detail-view"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { checkModuleAdmin } from "@/shared/utils/check-module-admin"
import { useAuthStore } from "@/shared/stores/auth-store"
import { useUpdateTrucHat } from "../hooks"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { trucHatQueryKeys } from "@/lib/react-query/query-keys"

interface TrucHatDetailViewProps {
  id: number
  initialData?: any
  onEdit?: () => void
  onBack?: () => void
}

export function TrucHatDetailView({ id, initialData, onEdit, onBack }: TrucHatDetailViewProps) {
  const navigate = useNavigate()
  const query = useTrucHatById(id, initialData)
  const { data: trucHat, isLoading, isError } = query
  const { employee } = useAuthStore()
  const updateMutation = useUpdateTrucHat()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Check if user has admin permission
  const isModuleAdmin = checkModuleAdmin(trucHatConfig.moduleName, employee)

  const handleDeleteTraoDoi = async (index: number) => {
    if (!trucHat?.trao_doi) return

    try {
      const traoDoiList = Array.isArray(trucHat.trao_doi) 
        ? trucHat.trao_doi 
        : [trucHat.trao_doi]
      
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

      query.refetch()
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa trao đổi",
        variant: "error",
      })
      throw error
    }
  }

  if (isLoading) {
    return (
      <GenericDetailViewSimple
        title=""
        subtitle=""
        sections={[]}
        isLoading={true}
      />
    )
  }

  if (isError || !trucHat) {
    return (
      <DetailErrorState
        title="Không tìm thấy trục hạt"
        message="Trục hạt với ID này không tồn tại hoặc đã bị xóa."
        onBack={onBack}
        backUrl={onBack ? undefined : trucHatConfig.routePath}
      />
    )
  }

  const sections: DetailSection[] = [
    {
      title: "Thông Tin Cơ Bản",
      fields: [
        { 
          label: "Ngày", 
          key: "ngay", 
          value: trucHat.ngay || "-",
          format: (val: any) => {
            if (!val) return "-"
            try {
              return format(new Date(val), "dd/MM/yyyy", { locale: vi })
            } catch {
              return val
            }
          }
        },
        { 
          label: "Mã Trục", 
          key: "ma_truc", 
          value: trucHat.ma_truc?.toString() || "-",
        },
        { 
          label: "Khách Hàng", 
          key: "khach_hang", 
          value: trucHat.khach_hang || "-",
        },
        { 
          label: "Nhân Viên Bán Hàng", 
          key: "nhan_vien_bh_id", 
          value: trucHat.nhan_vien_bh_id?.toString() || "-",
          format: () => {
            const nhanVienBh = trucHat.nhan_vien_bh
            if (!nhanVienBh) {
              const nhanVienBhId = trucHat.nhan_vien_bh_id
              return nhanVienBhId ? String(nhanVienBhId) : "-"
            }
            return `${nhanVienBh.ma_nhan_vien} - ${nhanVienBh.ho_ten}`
          }
        },
        { 
          label: "Trạng Thái", 
          key: "trang_thai", 
          value: trucHat.trang_thai || "-",
          format: (val: any) => {
            if (!val) return "-"
            const colorMap: Record<string, string> = {
              "Mới": "bg-blue-500",
              "Đang vẽ": "bg-purple-500",
              "Đã đặt": "bg-orange-500",
              "Đang về": "bg-cyan-500",
              "Chờ kiểm tra": "bg-yellow-500",
              "Chờ sửa": "bg-amber-500",
              "Chờ giao": "bg-indigo-500",
              "Đã giao": "bg-green-500",
            }
            return <Badge variant="outline" className={colorMap[val] || "bg-gray-500"}>{val}</Badge>
          }
        },
        { 
          label: "Ghi Chú", 
          key: "ghi_chu", 
          value: trucHat.ghi_chu || "-",
          colSpan: 3,
          format: (val: any) => {
            if (!val) return "-"
            return <div className="whitespace-pre-wrap">{val}</div>
          }
        },
        { 
          label: "Ảnh Bản Vẽ", 
          key: "anh_ban_ve", 
          value: trucHat.anh_ban_ve || "-",
          colSpan: 3,
          format: () => {
            const anhBanVe = trucHat.anh_ban_ve
            if (!anhBanVe) return "-"
            return (
              <div className="mt-2">
                <a 
                  href={anhBanVe} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block aspect-square rounded-lg overflow-hidden border border-border hover:border-primary transition-colors max-w-xs"
                >
                  <img 
                    src={anhBanVe} 
                    alt="Ảnh bản vẽ"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const parent = target.parentElement
                      if (parent) {
                        parent.innerHTML = `
                          <div class="w-full h-full flex items-center justify-center bg-muted">
                            <svg class="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                          </div>
                        `
                      }
                    }}
                  />
                </a>
              </div>
            )
          }
        },
      ]
    },
    {
      title: "Thông Tin Khác",
      fields: [
        { 
          label: "Người Tạo", 
          key: "nguoi_tao_id", 
          value: trucHat.nguoi_tao_id?.toString() || "-",
          format: () => {
            const nguoiTao = trucHat.nguoi_tao
            if (!nguoiTao) return "-"
            return `${nguoiTao.ma_nhan_vien} - ${nguoiTao.ho_ten}`
          }
        },
        { 
          label: "Thời Gian Tạo", 
          key: "tg_tao", 
          value: trucHat.tg_tao || "-",
          format: (val: any) => {
            if (!val) return "-"
            try {
              return format(new Date(val), "dd/MM/yyyy HH:mm", { locale: vi })
            } catch {
              return val
            }
          }
        },
        { 
          label: "Thời Gian Cập Nhật", 
          key: "tg_cap_nhat", 
          value: trucHat.tg_cap_nhat || "-",
          format: (val: any) => {
            if (!val) return "-"
            try {
              return format(new Date(val), "dd/MM/yyyy HH:mm", { locale: vi })
            } catch {
              return val
            }
          }
        },
      ]
    },
    {
      title: "Lịch Sử Trao Đổi",
      fields: [
        {
          label: "Trao Đổi",
          key: "trao_doi",
          value: trucHat.trao_doi ? JSON.stringify(trucHat.trao_doi) : "-",
          colSpan: 3,
          format: () => {
            return (
              <TraoDoiHistory 
                traoDoi={trucHat.trao_doi}
                onDelete={handleDeleteTraoDoi}
                canDelete={() => isModuleAdmin}
              />
            )
          }
        },
      ],
      actions: (
        <TraoDoiButton
          trucHat={trucHat}
          variant="primary"
          onSuccess={() => {
            query.refetch()
          }}
        />
      )
    },
  ]

  const handleBack = onBack || (() => navigate(trucHatConfig.routePath))

  return (
    <GenericDetailViewSimple
      title={`Trục Hạt #${trucHat.id}`}
      subtitle={trucHat.khach_hang || ""}
      sections={sections}
      actions={
        <div className="flex items-center gap-2">
          <TrangThaiButton
            trucHat={trucHat}
            onSuccess={() => {
              query.refetch()
            }}
          />
          <TraoDoiButton
            trucHat={trucHat}
            onSuccess={() => {
              query.refetch()
            }}
          />
          <Button
            variant="outline"
            size="sm"
            className={actionButtonClass()}
            onClick={onEdit || (() => navigate(`${trucHatConfig.routePath}/${id}/sua`))}
          >
            <Edit className="mr-2 h-4 w-4" />
            Chỉnh Sửa
          </Button>
          <DeleteTrucHatButton
            id={id}
            name={trucHat.khach_hang || `ID: ${id}`}
            onDeleteSuccess={() => navigate(trucHatConfig.routePath)}
          />
        </div>
      }
      onBack={handleBack}
      backUrl={onBack ? undefined : trucHatConfig.routePath}
    />
  )
}

