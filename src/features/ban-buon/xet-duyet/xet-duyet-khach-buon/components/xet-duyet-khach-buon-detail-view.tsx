"use client"

import { useNavigate, useSearchParams } from "react-router-dom"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { useXetDuyetKhachBuonById, useUpdateXetDuyetKhachBuon } from "../hooks/use-xet-duyet-khach-buon"
import { xetDuyetKhachBuonConfig } from "../config"
import { xetDuyetKhachBuonQueryKeys } from "../hooks/use-xet-duyet-khach-buon"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { DetailErrorState } from "@/shared/components/data-display/detail/detail-error-state"
import { formatDate } from "@/shared/utils/date-format"
import { formatNumber } from "@/shared/utils/detail-utils"
import { DeleteXetDuyetKhachBuonButton } from "./delete-xet-duyet-khach-buon-button"
import { TraoDoiHistory } from "@/shared/components"
import { Badge } from "@/components/ui/badge"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { QuanLyDuyetButton } from "./quan-ly-duyet-button"
import { BgdDuyetButton } from "./bgd-duyet-button"
import { TraoDoiButton } from "./trao-doi-button"
import { TraLaiButton } from "./tra-lai-button"
import { HuyYeuCauButton } from "./huy-yeu-cau-button"
import { SaoChepYeuCauButton } from "./sao-chep-yeu-cau-button"

interface XetDuyetKhachBuonDetailViewProps {
  id: number
  onBack?: () => void
  backUrl?: string
}

export function XetDuyetKhachBuonDetailView({ id, onBack, backUrl }: XetDuyetKhachBuonDetailViewProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const updateMutation = useUpdateXetDuyetKhachBuon()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  const query = useXetDuyetKhachBuonById(id, undefined)
  const viewState = useDetailViewStateFromQuery(query, undefined)
  
  const xetDuyetKhachBuon = viewState.data

  const returnTo = searchParams.get('returnTo') || 'list'

  const handleDeleteTraoDoi = async (index: number) => {
    if (!xetDuyetKhachBuon?.trao_doi) return

    try {
      const traoDoiList = Array.isArray(xetDuyetKhachBuon.trao_doi) 
        ? xetDuyetKhachBuon.trao_doi 
        : [xetDuyetKhachBuon.trao_doi]
      
      const newTraoDoiList = traoDoiList.filter((_, i) => i !== index)

      await updateMutation.mutateAsync({
        id: xetDuyetKhachBuon.id!,
        input: {
          trao_doi: newTraoDoiList,
        },
      })

      queryClient.invalidateQueries({ queryKey: xetDuyetKhachBuonQueryKeys.all() })

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
      navigate(xetDuyetKhachBuonConfig.routePath)
    } else {
      navigate(xetDuyetKhachBuonConfig.routePath)
    }
  }

  const handleEdit = () => {
    navigate(`${xetDuyetKhachBuonConfig.routePath}/${id}/sua?returnTo=detail`)
  }

  const handleDeleteSuccess = () => {
    // Navigate back to list after successful delete
    navigate(xetDuyetKhachBuonConfig.routePath)
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
        title="Không tìm thấy xét duyệt khách buôn"
        message="Xét duyệt khách buôn với ID này không tồn tại hoặc đã bị xóa."
        onBack={handleBack}
        backUrl={backUrl || xetDuyetKhachBuonConfig.routePath}
      />
    )
  }

  // ✅ TypeScript safety: viewState.data đã được đảm bảo tồn tại
  if (!xetDuyetKhachBuon) {
    return null
  }

  const sections: DetailSection[] = [
    {
      title: "Thông Tin Cơ Bản",
      fields: [
        { key: "ten_khach_buon", label: "Khách Buôn", value: xetDuyetKhachBuon.ten_khach_buon || "-" },
        { key: "ngay", label: "Ngày", value: xetDuyetKhachBuon.ngay || "-" },
        { key: "ten_muc_dang_ky", label: "Mức Đăng Ký", value: xetDuyetKhachBuon.ten_muc_dang_ky || "-" },
        { 
          key: "trang_thai", 
          label: "Trạng Thái", 
          value: xetDuyetKhachBuon.trang_thai || "Chờ kiểm tra",
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
      title: "Thông Tin Địa Lý",
      fields: [
        { key: "tsn_ten_tinh_thanh", label: "Tỉnh Thành TSN", value: xetDuyetKhachBuon.tsn_ten_tinh_thanh || "-" },
        { key: "ssn_ten_tinh_thanh", label: "Tỉnh Thành SSN", value: xetDuyetKhachBuon.ssn_ten_tinh_thanh || "-" },
      ]
    },
    {
      title: "Thông Tin Doanh Số",
      fields: [
        { 
          key: "doanh_so_min_quy", 
          label: "Doanh Số Min Quý", 
          value: xetDuyetKhachBuon.doanh_so_min_quy !== null && xetDuyetKhachBuon.doanh_so_min_quy !== undefined 
            ? formatNumber(xetDuyetKhachBuon.doanh_so_min_quy) 
            : "-" 
        },
        { 
          key: "doanh_so_max_quy", 
          label: "Doanh Số Max Quý", 
          value: xetDuyetKhachBuon.doanh_so_max_quy !== null && xetDuyetKhachBuon.doanh_so_max_quy !== undefined 
            ? formatNumber(xetDuyetKhachBuon.doanh_so_max_quy) 
            : "-" 
        },
        { 
          key: "doanh_so_min_nam", 
          label: "Doanh Số Min Năm", 
          value: xetDuyetKhachBuon.doanh_so_min_nam !== null && xetDuyetKhachBuon.doanh_so_min_nam !== undefined 
            ? formatNumber(xetDuyetKhachBuon.doanh_so_min_nam) 
            : "-" 
        },
        { 
          key: "doanh_so_max_nam", 
          label: "Doanh Số Max Năm", 
          value: xetDuyetKhachBuon.doanh_so_max_nam !== null && xetDuyetKhachBuon.doanh_so_max_nam !== undefined 
            ? formatNumber(xetDuyetKhachBuon.doanh_so_max_nam) 
            : "-" 
        },
      ]
    },
    {
      title: "Thông Tin Xét Duyệt",
      fields: [
        { key: "quan_ly_duyet", label: "Quản Lý Duyệt", value: xetDuyetKhachBuon.quan_ly_duyet || "-" },
        { key: "ten_quan_ly", label: "Tên Quản Lý", value: xetDuyetKhachBuon.ten_quan_ly || "-" },
        { key: "tg_quan_ly_duyet", label: "Thời Gian Quản Lý Duyệt", value: xetDuyetKhachBuon.tg_quan_ly_duyet ? formatDate(xetDuyetKhachBuon.tg_quan_ly_duyet) : "-" },
        { key: "bgd_duyet", label: "BGD Duyệt", value: xetDuyetKhachBuon.bgd_duyet || "-" },
        { key: "ten_bgd", label: "Tên BGD", value: xetDuyetKhachBuon.ten_bgd || "-" },
        { key: "tg_bgd_duyet", label: "Thời Gian BGD Duyệt", value: xetDuyetKhachBuon.tg_bgd_duyet ? formatDate(xetDuyetKhachBuon.tg_bgd_duyet) : "-" },
      ]
    },
    {
      title: "Thông Tin Bổ Sung",
      fields: [
        { key: "ngay_ap_dung", label: "Ngày Áp Dụng", value: xetDuyetKhachBuon.ngay_ap_dung || "-" },
        { key: "link_hop_dong", label: "Link Hợp Đồng", value: xetDuyetKhachBuon.link_hop_dong || "-" },
        { key: "file_hop_dong", label: "File Hợp Đồng", value: xetDuyetKhachBuon.file_hop_dong || "-" },
        { key: "ghi_chu", label: "Ghi Chú", value: xetDuyetKhachBuon.ghi_chu || "-" },
      ]
    },
    {
      title: "Thông Tin Hệ Thống",
      fields: [
        { key: "ten_nguoi_tao", label: "Người Tạo", value: xetDuyetKhachBuon.ten_nguoi_tao || "-" },
        { key: "tg_tao", label: "Thời Gian Tạo", value: xetDuyetKhachBuon.tg_tao ? formatDate(xetDuyetKhachBuon.tg_tao) : "-" },
        { key: "tg_cap_nhat", label: "Thời Gian Cập Nhật", value: xetDuyetKhachBuon.tg_cap_nhat ? formatDate(xetDuyetKhachBuon.tg_cap_nhat) : "-" },
        ...(xetDuyetKhachBuon.trang_thai === "Đã hủy" && (xetDuyetKhachBuon as any).ten_nguoi_huy ? [
          { key: "ten_nguoi_huy", label: "Người Hủy", value: (xetDuyetKhachBuon as any).ten_nguoi_huy || "-" },
        ] : []),
      ]
    },
    {
      title: "Lịch Sử Trao Đổi",
      fields: [
        {
          label: "Trao Đổi",
          key: "trao_doi",
          value: xetDuyetKhachBuon.trao_doi ? JSON.stringify(xetDuyetKhachBuon.trao_doi) : "-",
          colSpan: 3,
          format: () => {
            return (
              <TraoDoiHistory 
                traoDoi={xetDuyetKhachBuon.trao_doi}
                onDelete={handleDeleteTraoDoi}
                canDelete={() => true}
              />
            )
          }
        },
      ],
      actions: (
        <TraoDoiButton
          xetDuyetKhachBuon={xetDuyetKhachBuon}
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
      title={xetDuyetKhachBuon.ten_khach_buon || `Xét Duyệt Khách Buôn #${id}`}
      subtitle={`ID: ${id}`}
      sections={sections}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          <HuyYeuCauButton
            xetDuyetKhachBuon={xetDuyetKhachBuon}
            onSuccess={() => {
              query.refetch()
            }}
          />
          <SaoChepYeuCauButton
            xetDuyetKhachBuon={xetDuyetKhachBuon}
          />
          <QuanLyDuyetButton
            xetDuyetKhachBuon={xetDuyetKhachBuon}
            onSuccess={() => {
              query.refetch()
            }}
          />
          <BgdDuyetButton
            xetDuyetKhachBuon={xetDuyetKhachBuon}
            onSuccess={() => {
              query.refetch()
            }}
          />
          <TraLaiButton
            xetDuyetKhachBuon={xetDuyetKhachBuon}
            onSuccess={() => {
              query.refetch()
            }}
          />
          <TraoDoiButton
            xetDuyetKhachBuon={xetDuyetKhachBuon}
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
          <DeleteXetDuyetKhachBuonButton
            id={id}
            onSuccess={handleDeleteSuccess}
          />
        </div>
      }
      onBack={handleBack}
    />
  )
}

