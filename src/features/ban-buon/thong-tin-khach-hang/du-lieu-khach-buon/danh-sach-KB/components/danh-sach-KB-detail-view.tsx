"use client"

import { useNavigate, useSearchParams } from "react-router-dom"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { useDanhSachKBById } from "../hooks/use-danh-sach-KB"
import { danhSachKBConfig } from "../config"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { DeleteDanhSachKBButton } from "./delete-danh-sach-KB-button"
import { DetailErrorState } from "@/shared/components/data-display/detail/detail-error-state"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { formatDate } from "@/shared/utils/date-format"
import { NguoiLienHeSection } from "./nguoi-lien-he-section"
import { useNguoiLienHeByKhachBuonId } from "../../nguoi-lien-he/hooks/use-nguoi-lien-he"
import { HinhAnhKhachBuonSection } from "./hinh-anh-khach-buon-section"
import { useHinhAnhKhachBuonByKhachBuonId } from "../../hinh-anh-khach-buon/hooks/use-hinh-anh-khach-buon"

interface DanhSachKBDetailViewProps {
  id: number
  onBack?: () => void
  backUrl?: string
}

export function DanhSachKBDetailView({ id, onBack, backUrl }: DanhSachKBDetailViewProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  const query = useDanhSachKBById(id, undefined)
  const viewState = useDetailViewStateFromQuery(query, undefined)
  
  const khachBuon = viewState.data

  // Fetch người liên hệ list
  const { data: nguoiLienHeList, isLoading: isLoadingNguoiLienHe } = useNguoiLienHeByKhachBuonId(id)

  // Fetch hình ảnh khách buôn list
  const { data: hinhAnhKhachBuonList, isLoading: isLoadingHinhAnhKhachBuon } = useHinhAnhKhachBuonByKhachBuonId(id)

  const returnTo = searchParams.get('returnTo') || 'list'

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else if (backUrl) {
      navigate(backUrl)
    } else if (returnTo === 'list') {
      navigate(danhSachKBConfig.routePath)
    } else {
      navigate(danhSachKBConfig.routePath)
    }
  }

  const handleEdit = () => {
    navigate(`${danhSachKBConfig.routePath}/${id}/sua?returnTo=detail`)
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
        title="Không tìm thấy khách buôn"
        message="Khách buôn với ID này không tồn tại hoặc đã bị xóa."
        onBack={handleBack}
        backUrl={backUrl || danhSachKBConfig.routePath}
      />
    )
  }

  // ✅ TypeScript safety: viewState.data đã được đảm bảo tồn tại
  if (!khachBuon) {
    return null
  }

  // ✅ TypeScript safety: viewState.data đã được đảm bảo tồn tại
  if (!khachBuon) {
    return null
  }

  if (khachBuon) {
    const sections: DetailSection[] = [
      {
        title: "Thông Tin Cơ Bản",
        fields: [
          { key: "ma_so", label: "Mã Số", value: khachBuon.ma_so || "-" },
          { key: "ten_khach_buon", label: "Tên Khách Buôn", value: khachBuon.ten_khach_buon || "-" },
          { key: "loai_khach", label: "Loại Khách", value: khachBuon.loai_khach || "-" },
          { key: "nguon", label: "Nguồn", value: khachBuon.nguon || "-" },
          { key: "hinh_anh", label: "Hình Ảnh", value: khachBuon.hinh_anh || "-" },
        ]
      },
      {
        title: "Thông Tin Liên Hệ",
        fields: [
          { key: "so_dien_thoai_1", label: "Số Điện Thoại 1", value: khachBuon.so_dien_thoai_1 || "-" },
          { key: "so_dien_thoai_2", label: "Số Điện Thoại 2", value: khachBuon.so_dien_thoai_2 || "-" },
          { key: "nhom_nganh", label: "Nhóm Ngành", value: khachBuon.nhom_nganh || "-" },
          { key: "mien", label: "Miền", value: khachBuon.mien || "-" },
        ]
      },
      {
        title: "Địa Chỉ TSN (Trước Sát Nhập)",
        fields: [
          { key: "tsn_tinh_thanh_id", label: "Tỉnh Thành", value: khachBuon.tsn_ten_tinh_thanh || (khachBuon.tsn_tinh_thanh_id ? String(khachBuon.tsn_tinh_thanh_id) : "-") },
          { key: "tsn_quan_huyen_id", label: "Quận Huyện", value: khachBuon.tsn_ten_quan_huyen || (khachBuon.tsn_quan_huyen_id ? String(khachBuon.tsn_quan_huyen_id) : "-") },
          { key: "tsn_phuong_xa_id", label: "Phường Xã", value: khachBuon.tsn_ten_phuong_xa || (khachBuon.tsn_phuong_xa_id ? String(khachBuon.tsn_phuong_xa_id) : "-") },
          { key: "tsn_so_nha", label: "Số Nhà", value: khachBuon.tsn_so_nha || "-" },
          { key: "tsn_dia_chi_day_du", label: "Địa Chỉ Đầy Đủ", value: khachBuon.tsn_dia_chi_day_du || "-" },
        ]
      },
      {
        title: "Địa Chỉ SSN (Sau Sát Nhập)",
        fields: [
          { key: "ssn_tinh_thanh_id", label: "Tỉnh Thành", value: khachBuon.ssn_ten_tinh_thanh || (khachBuon.ssn_tinh_thanh_id ? String(khachBuon.ssn_tinh_thanh_id) : "-") },
          { key: "ssn_phuong_xa_id", label: "Phường Xã", value: khachBuon.ssn_ten_phuong_xa || (khachBuon.ssn_phuong_xa_id ? String(khachBuon.ssn_phuong_xa_id) : "-") },
          { key: "ssn_so_nha", label: "Số Nhà", value: khachBuon.ssn_so_nha || "-" },
          { key: "ssn_dia_chi_day_du", label: "Địa Chỉ Đầy Đủ", value: khachBuon.ssn_dia_chi_day_du || "-" },
        ]
      },
      {
        title: "Thông Tin Khác",
        fields: [
          { key: "dinh_vi_gps", label: "Định Vị GPS", value: khachBuon.dinh_vi_gps || "-" },
          { key: "nam_thanh_lap", label: "Năm Thành Lập", value: khachBuon.nam_thanh_lap ? String(khachBuon.nam_thanh_lap) : "-" },
          { key: "link_group_zalo", label: "Link Group Zalo", value: khachBuon.link_group_zalo || "-" },
          { 
            key: "giai_doan_id",
            label: "Giai Đoạn", 
            value: khachBuon.ma_giai_doan && khachBuon.ten_giai_doan
              ? `${khachBuon.ma_giai_doan} - ${khachBuon.ten_giai_doan}` 
              : (khachBuon.ten_giai_doan || khachBuon.giai_doan_id ? (khachBuon.ten_giai_doan || String(khachBuon.giai_doan_id)) : "-")
          },
          { 
            key: "trang_thai_id",
            label: "Trạng Thái", 
            value: khachBuon.ma_trang_thai && khachBuon.ten_trang_thai
              ? `${khachBuon.ma_trang_thai} - ${khachBuon.ten_trang_thai}` 
              : (khachBuon.ten_trang_thai || khachBuon.trang_thai_id ? (khachBuon.ten_trang_thai || String(khachBuon.trang_thai_id)) : "-")
          },
          { 
            key: "tele_sale_id",
            label: "Tele Sale", 
            value: khachBuon.ten_tele_sale 
              ? `${khachBuon.tele_sale_id} - ${khachBuon.ten_tele_sale}` 
              : (khachBuon.tele_sale_id ? String(khachBuon.tele_sale_id) : "-")
          },
          { key: "thi_truong_id", label: "Thị Trường ID", value: khachBuon.thi_truong_id ? String(khachBuon.thi_truong_id) : "-" },
          { key: "quy_mo", label: "Quy Mô", value: khachBuon.quy_mo || "-" },
          { key: "ghi_chu", label: "Ghi Chú", value: khachBuon.ghi_chu || "-", colSpan: 2 },
        ]
      },
      {
        title: "Thông Tin Hệ Thống",
        fields: [
          { 
            key: "nguoi_tao_id",
            label: "Người Tạo", 
            value: khachBuon.nguoi_tao_ten 
              ? `${khachBuon.nguoi_tao_id} - ${khachBuon.nguoi_tao_ten}` 
              : (khachBuon.nguoi_tao_id ? String(khachBuon.nguoi_tao_id) : "-")
          },
          { 
            key: "tg_tao",
            label: "Thời Gian Tạo", 
            value: formatDate(khachBuon.tg_tao),
            type: "date"
          },
          { 
            key: "tg_cap_nhat",
            label: "Thời Gian Cập Nhật", 
            value: formatDate(khachBuon.tg_cap_nhat),
            type: "date"
          },
        ]
      },
    ]

    const actions = (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleEdit}
          className={actionButtonClass()}
        >
          <Edit className="mr-2 h-4 w-4" />
          Sửa
        </Button>
        <DeleteDanhSachKBButton 
          id={id} 
          name={khachBuon.ten_khach_buon} 
        />
      </div>
    )

    return (
      <>
        <GenericDetailViewSimple
          title={khachBuon.ten_khach_buon}
          subtitle={khachBuon.ma_so || "Chi tiết khách buôn"}
          sections={sections}
          actions={actions}
          onBack={handleBack}
          backUrl={backUrl || (returnTo === 'list' ? danhSachKBConfig.routePath : undefined)}
        />
        
        {/* Người Liên Hệ Section */}
        <div className="mt-6">
          <NguoiLienHeSection
            khachBuonId={id}
            nguoiLienHeList={nguoiLienHeList || []}
            isLoading={isLoadingNguoiLienHe}
            khachBuonName={khachBuon.ten_khach_buon || undefined}
          />
        </div>

        {/* Hình Ảnh Khách Buôn Section */}
        <div className="mt-6">
          <HinhAnhKhachBuonSection
            khachBuonId={id}
            hinhAnhKhachBuonList={hinhAnhKhachBuonList || []}
            isLoading={isLoadingHinhAnhKhachBuon}
            khachBuonName={khachBuon.ten_khach_buon || undefined}
          />
        </div>
      </>
    )
  }

  return null
}

