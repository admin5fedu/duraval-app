"use client"

import { useNavigate } from "react-router-dom"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { useBaiThiById } from "../hooks/use-bai-thi"
import { DeleteBaiThiButton } from "./delete-bai-thi-button"
import { baiThiConfig } from "../config"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { DetailErrorState } from "@/shared/components/data-display/detail/detail-error-state"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { useKyThi } from "../../ky-thi/hooks"
import { useNhanSu } from "@/features/he-thong/nhan-su/danh-sach-nhan-su/hooks"
import { usePhongBan } from "@/features/he-thong/so-do/phong-ban/hooks"
import { useNhomChuyenDe } from "../../nhom-chuyen-de/hooks"
import { useMemo } from "react"

interface BaiThiDetailViewProps {
  id: number
  initialData?: any
  onEdit?: () => void
  onBack?: () => void
}

export function BaiThiDetailView({ id, initialData, onEdit, onBack }: BaiThiDetailViewProps) {
  const navigate = useNavigate()
  const query = useBaiThiById(id, initialData)
  const viewState = useDetailViewStateFromQuery(query, initialData)
  const { data: kyThiList } = useKyThi()
  const { data: nhanSuList } = useNhanSu()
  const { data: phongBanList } = usePhongBan()
  const { data: nhomChuyenDeList } = useNhomChuyenDe()
  
  const baiThi = viewState.data

  const kyThiMap = useMemo(() => {
    const map = new Map<number, string>()
    if (kyThiList) {
      kyThiList.forEach(kt => {
        if (kt.id) {
          map.set(kt.id, kt.ten_ky_thi || `Kỳ thi #${kt.id}`)
        }
      })
    }
    return map
  }, [kyThiList])

  const nhanSuMap = useMemo(() => {
    const map = new Map<number, string>()
    if (nhanSuList) {
      nhanSuList.forEach(ns => {
        if (ns.ma_nhan_vien) {
          map.set(ns.ma_nhan_vien, `${ns.ma_nhan_vien} - ${ns.ho_ten}`)
        }
      })
    }
    return map
  }, [nhanSuList])

  const phongBanMap = useMemo(() => {
    const map = new Map<number, string>()
    if (phongBanList) {
      phongBanList.forEach(pb => {
        if (pb.id) {
          map.set(pb.id, `${pb.ma_phong_ban} - ${pb.ten_phong_ban}`)
        }
      })
    }
    return map
  }, [phongBanList])

  const nhomChuyenDeMap = useMemo(() => {
    const map = new Map<number, string>()
    if (nhomChuyenDeList) {
      nhomChuyenDeList.forEach(nhom => {
        if (nhom.id) {
          map.set(nhom.id, nhom.ten_nhom || `ID: ${nhom.id}`)
        }
      })
    }
    return map
  }, [nhomChuyenDeList])

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

  if (viewState.isError) {
    return (
      <DetailErrorState
        title="Không tìm thấy bài thi"
        message="Bài thi với ID này không tồn tại hoặc đã bị xóa."
        onBack={onBack}
        backUrl={onBack ? undefined : baiThiConfig.routePath}
      />
    )
  }

  if (!baiThi) {
    return null
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-"
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi })
    } catch {
      return "-"
    }
  }

  const formatDateOnly = (dateString: string | null | undefined) => {
    if (!dateString) return "-"
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: vi })
    } catch {
      return "-"
    }
  }

  let trangThaiVariant: "default" | "secondary" | "destructive" | "outline" = "secondary"
  if (baiThi.trang_thai === "Đạt") {
    trangThaiVariant = "default"
  } else if (baiThi.trang_thai === "Không đạt") {
    trangThaiVariant = "destructive"
  } else if (baiThi.trang_thai === "Đang thi") {
    trangThaiVariant = "outline"
  }

  const sections: DetailSection[] = [
    {
      title: "Thông Tin Cơ Bản",
      fields: [
        { 
          label: "Kỳ Thi", 
          key: "ky_thi_id", 
          value: kyThiMap.get(baiThi.ky_thi_id) || `Kỳ thi #${baiThi.ky_thi_id}`,
          colSpan: 2
        },
        { 
          label: "Nhân Viên", 
          key: "nhan_vien_id", 
          value: nhanSuMap.get(baiThi.nhan_vien_id) || `ID: ${baiThi.nhan_vien_id}`,
          colSpan: 2
        },
        { label: "Ngày Làm Bài", key: "ngay_lam_bai", value: formatDateOnly(baiThi.ngay_lam_bai) },
        { 
          label: "Trạng Thái", 
          key: "trang_thai", 
          value: (
            <Badge variant={trangThaiVariant}>
              {baiThi.trang_thai}
            </Badge>
          )
        },
        { label: "Phòng", key: "phong_id", value: baiThi.phong_id ? phongBanMap.get(baiThi.phong_id) || `ID: ${baiThi.phong_id}` : "-" },
        { label: "Nhóm", key: "nhom_id", value: baiThi.nhom_id ? nhomChuyenDeMap.get(baiThi.nhom_id) || `ID: ${baiThi.nhom_id}` : "-" },
        { label: "Điểm Số", key: "diem_so", value: baiThi.diem_so !== null && baiThi.diem_so !== undefined ? baiThi.diem_so.toString() : "-" },
        { label: "Tổng Số Câu", key: "tong_so_cau", value: baiThi.tong_so_cau !== null && baiThi.tong_so_cau !== undefined ? baiThi.tong_so_cau.toString() : "-" },
      ]
    },
    {
      title: "Thời Gian",
      fields: [
        { label: "Thời Gian Bắt Đầu", key: "thoi_gian_bat_dau", value: formatDate(baiThi.thoi_gian_bat_dau) },
        { label: "Thời Gian Kết Thúc", key: "thoi_gian_ket_thuc", value: formatDate(baiThi.thoi_gian_ket_thuc) },
      ]
    },
    ...(baiThi.trao_doi ? [{
      title: "Trao Đổi",
      fields: [
        { 
          label: "Trao Đổi", 
          key: "trao_doi", 
          value: typeof baiThi.trao_doi === 'string' 
            ? baiThi.trao_doi 
            : JSON.stringify(baiThi.trao_doi, null, 2), 
          colSpan: 2 as const
        },
      ]
    }] : []),
    {
      title: "Thông Tin Hệ Thống",
      fields: [
        { label: "Thời Gian Tạo", key: "tg_tao", value: formatDate(baiThi.tg_tao) },
        { label: "Thời Gian Cập Nhật", key: "tg_cap_nhat", value: formatDate(baiThi.tg_cap_nhat) },
      ]
    },
  ]

  const handleEdit = () => {
    if (onEdit) {
      onEdit()
    } else {
      navigate(`${baiThiConfig.routePath}/${id}/sua?returnTo=detail`)
    }
  }

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(baiThiConfig.routePath)
    }
  }

  const title = `Bài thi #${id}`
  const subtitle = formatDateOnly(baiThi.ngay_lam_bai) || `ID: ${id}`

  return (
    <GenericDetailViewSimple
      title={title}
      subtitle={subtitle}
      sections={sections}
      backUrl={onBack ? undefined : baiThiConfig.routePath}
      onBack={handleBack}
      actions={
        <>
          <Button
            variant="outline"
            size="sm"
            className={actionButtonClass()}
            onClick={handleEdit}
          >
            <Edit className="mr-2 h-4 w-4" />
            Sửa
          </Button>
          <DeleteBaiThiButton
            id={id}
            name={`Bài thi #${id}`}
          />
        </>
      }
      isLoading={query.isLoading && !initialData}
    />
  )
}

