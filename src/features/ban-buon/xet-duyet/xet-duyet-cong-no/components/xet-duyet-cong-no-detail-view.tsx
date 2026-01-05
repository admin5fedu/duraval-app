"use client"

import { useNavigate, useSearchParams } from "react-router-dom"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { useXetDuyetCongNoById, useUpdateXetDuyetCongNo } from "../hooks/use-xet-duyet-cong-no"
import { xetDuyetCongNoConfig } from "../config"
import { xetDuyetCongNoQueryKeys } from "../hooks/use-xet-duyet-cong-no"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { DetailErrorState } from "@/shared/components/data-display/detail/detail-error-state"
import { formatDate } from "@/shared/utils/date-format"
import { formatNumber } from "@/shared/utils/detail-utils"
import { DeleteXetDuyetCongNoButton } from "./delete-xet-duyet-cong-no-button"
import { TraoDoiButton } from "./trao-doi-button"
import { QuanLyDuyetButton } from "./quan-ly-duyet-button"
import { BgdDuyetButton } from "./bgd-duyet-button"
import { TraLaiButton } from "./tra-lai-button"
import { HuyYeuCauButton } from "./huy-yeu-cau-button"
import { SaoChepYeuCauButton } from "./sao-chep-yeu-cau-button"
import { TraoDoiHistory } from "@/shared/components"
import { Badge } from "@/components/ui/badge"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { checkModuleAdmin } from "@/shared/utils/check-module-admin"
import { useAuthStore } from "@/shared/stores/auth-store"

interface XetDuyetCongNoDetailViewProps {
  id: number
  onBack?: () => void
  backUrl?: string
}

export function XetDuyetCongNoDetailView({ id, onBack, backUrl }: XetDuyetCongNoDetailViewProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { employee } = useAuthStore()
  const updateMutation = useUpdateXetDuyetCongNo()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  const query = useXetDuyetCongNoById(id, undefined)
  const viewState = useDetailViewStateFromQuery(query, undefined)
  
  const xetDuyetCongNo = viewState.data

  const returnTo = searchParams.get('returnTo') || 'list'

  // Check if user has admin permission
  const isModuleAdmin = checkModuleAdmin(xetDuyetCongNoConfig.moduleName, employee)

  const handleDeleteTraoDoi = async (index: number) => {
    if (!xetDuyetCongNo?.trao_doi) return

    try {
      const traoDoiList = Array.isArray(xetDuyetCongNo.trao_doi) 
        ? xetDuyetCongNo.trao_doi 
        : [xetDuyetCongNo.trao_doi]
      
      const newTraoDoiList = traoDoiList.filter((_, i) => i !== index)

      await updateMutation.mutateAsync({
        id: xetDuyetCongNo.id!,
        input: {
          trao_doi: newTraoDoiList,
        },
      })

      queryClient.invalidateQueries({ queryKey: xetDuyetCongNoQueryKeys.all() })

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

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else if (backUrl) {
      navigate(backUrl)
    } else if (returnTo === 'list') {
      navigate(xetDuyetCongNoConfig.routePath)
    } else {
      navigate(xetDuyetCongNoConfig.routePath)
    }
  }

  const handleEdit = () => {
    navigate(`${xetDuyetCongNoConfig.routePath}/${id}/sua?returnTo=detail`)
  }

  const handleDeleteSuccess = () => {
    // Navigate back to list after successful delete
    navigate(xetDuyetCongNoConfig.routePath)
  }

  // ✅ Hiển thị loading state
  if (viewState.isLoading) {
    return (
      <GenericDetailViewSimple
        title=""
        subtitle=""
        sections={[]}
        isLoading={true}
      />
    )
  }

  // ✅ Hiển thị error state
  if (viewState.isError) {
    return (
      <DetailErrorState
        title="Không tìm thấy xét duyệt công nợ"
        message="Xét duyệt công nợ với ID này không tồn tại hoặc đã bị xóa."
        onBack={handleBack}
        backUrl={backUrl || xetDuyetCongNoConfig.routePath}
      />
    )
  }

  // ✅ TypeScript safety: viewState.data đã được đảm bảo tồn tại
  if (!xetDuyetCongNo) {
    return null
  }

  const sections: DetailSection[] = [
    {
      title: "Thông Tin Cơ Bản",
      fields: [
        { key: "ten_khach_buon", label: "Khách Buôn", value: xetDuyetCongNo.ten_khach_buon || "-" },
        { key: "loai_hinh", label: "Loại Hình", value: xetDuyetCongNo.loai_hinh || "-" },
        { 
          key: "muc_cong_no", 
          label: "Mức Công Nợ", 
          value: xetDuyetCongNo.muc_cong_no !== null && xetDuyetCongNo.muc_cong_no !== undefined 
            ? formatNumber(xetDuyetCongNo.muc_cong_no) 
            : "-" 
        },
        { key: "de_xuat_ngay_ap_dung", label: "Đề Xuất Ngày Áp Dụng", value: xetDuyetCongNo.de_xuat_ngay_ap_dung || "-" },
        { key: "ngay_ap_dung", label: "Ngày Áp Dụng", value: xetDuyetCongNo.ngay_ap_dung || "-" },
        { 
          key: "trang_thai", 
          label: "Trạng Thái", 
          value: xetDuyetCongNo.trang_thai || "Chờ kiểm tra",
          format: (val: any) => {
            const colorMap: Record<string, string> = {
              "Chờ kiểm tra": "bg-yellow-500",
              "Chờ duyệt": "bg-blue-500",
              "Đã duyệt": "bg-green-500",
              "Từ chối": "bg-red-600",
              "Đã hủy": "bg-gray-600",
              "Yêu cầu bổ sung": "bg-orange-500",
            }
            const badgeColor = colorMap[val] || "bg-gray-500"
            return (
              <Badge variant="outline" className={badgeColor}>
                {val || "Chờ kiểm tra"}
              </Badge>
            )
          }
        },
      ]
    },
    {
      title: "Thông Tin Xét Duyệt",
      fields: [
        { key: "quan_ly_duyet", label: "Quản Lý Duyệt", value: xetDuyetCongNo.quan_ly_duyet || "-" },
        { key: "ten_quan_ly", label: "Tên Quản Lý", value: xetDuyetCongNo.ten_quan_ly || "-" },
        { key: "tg_quan_ly_duyet", label: "Thời Gian Quản Lý Duyệt", value: xetDuyetCongNo.tg_quan_ly_duyet ? formatDate(xetDuyetCongNo.tg_quan_ly_duyet) : "-" },
        { key: "bgd_duyet", label: "BGD Duyệt", value: xetDuyetCongNo.bgd_duyet || "-" },
        { key: "ten_bgd", label: "Tên BGD", value: xetDuyetCongNo.ten_bgd || "-" },
        { key: "tg_bgd_duyet", label: "Thời Gian BGD Duyệt", value: xetDuyetCongNo.tg_bgd_duyet ? formatDate(xetDuyetCongNo.tg_bgd_duyet) : "-" },
      ]
    },
    {
      title: "Thông Tin Bổ Sung",
      fields: [
        { key: "ghi_chu", label: "Ghi Chú", value: xetDuyetCongNo.ghi_chu || "-" },
      ]
    },
    {
      title: "Thông Tin Hệ Thống",
      fields: [
        { key: "ten_nguoi_tao", label: "Người Tạo", value: xetDuyetCongNo.ten_nguoi_tao || "-" },
        { key: "tg_tao", label: "Thời Gian Tạo", value: xetDuyetCongNo.tg_tao ? formatDate(xetDuyetCongNo.tg_tao) : "-" },
        { key: "tg_cap_nhat", label: "Thời Gian Cập Nhật", value: xetDuyetCongNo.tg_cap_nhat ? formatDate(xetDuyetCongNo.tg_cap_nhat) : "-" },
      ]
    },
    {
      title: "Lịch Sử Trao Đổi",
      fields: [
        {
          label: "Trao Đổi",
          key: "trao_doi",
          value: xetDuyetCongNo.trao_doi ? JSON.stringify(xetDuyetCongNo.trao_doi) : "-",
          colSpan: 3,
          format: () => {
            return (
              <TraoDoiHistory 
                traoDoi={xetDuyetCongNo.trao_doi}
                onDelete={handleDeleteTraoDoi}
                canDelete={() => isModuleAdmin}
              />
            )
          }
        },
      ],
      actions: (
        <TraoDoiButton
          xetDuyetCongNo={xetDuyetCongNo}
          variant="primary"
          onSuccess={() => {
            query.refetch()
          }}
        />
      )
    },
  ]

  return (
    <GenericDetailViewSimple
      title={`${xetDuyetCongNoConfig.moduleTitle} - ID ${xetDuyetCongNo.id}`}
      subtitle={xetDuyetCongNo.ten_khach_buon || ""}
      sections={sections}
      actions={
        <div className="flex items-center gap-2">
          <HuyYeuCauButton
            xetDuyetCongNo={xetDuyetCongNo}
            onSuccess={() => {
              query.refetch()
            }}
          />
          <SaoChepYeuCauButton
            xetDuyetCongNo={xetDuyetCongNo}
          />
          <QuanLyDuyetButton
            xetDuyetCongNo={xetDuyetCongNo}
            onSuccess={() => {
              query.refetch()
            }}
          />
          <BgdDuyetButton
            xetDuyetCongNo={xetDuyetCongNo}
            onSuccess={() => {
              query.refetch()
            }}
          />
          <TraLaiButton
            xetDuyetCongNo={xetDuyetCongNo}
            onSuccess={() => {
              query.refetch()
            }}
          />
          <TraoDoiButton
            xetDuyetCongNo={xetDuyetCongNo}
            onSuccess={() => {
              query.refetch()
            }}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleEdit}
          >
            <Edit className="mr-2 h-4 w-4" />
            Sửa
          </Button>
          <DeleteXetDuyetCongNoButton
            id={id}
            onSuccess={handleDeleteSuccess}
          />
        </div>
      }
      onBack={handleBack}
    />
  )
}

