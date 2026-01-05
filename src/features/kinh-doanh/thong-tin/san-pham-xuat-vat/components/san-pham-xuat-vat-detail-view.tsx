"use client"

import { useNavigate, useSearchParams } from "react-router-dom"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { useSanPhamXuatVatById } from "../hooks/use-san-pham-xuat-vat"
import { sanPhamXuatVatConfig } from "../config"
import { DetailErrorState } from "@/shared/components/data-display/detail/detail-error-state"
import { formatNumber } from "@/shared/utils/detail-utils"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Format số tiền VND
function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || value === 0) return "-"
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value)
}

// Format phần trăm
function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-"
  return `${value}%`
}

// Get badge color for loại sản phẩm
function getLoaiSanPhamBadgeClass(loai: string | null | undefined): string {
  if (!loai) return "bg-muted text-muted-foreground border-transparent"

  // Map loại sản phẩm to colors
  const colorMap: Record<string, string> = {
    "8": "bg-blue-50 text-blue-700 border-blue-200",
    "10": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "": "bg-slate-50 text-slate-700 border-slate-200",
  }

  return colorMap[loai] ?? "bg-slate-50 text-slate-700 border-slate-200"
}

// Format loại sản phẩm with prefix
function formatLoaiSanPham(loai: string | null | undefined): string {
  if (!loai || loai === "") return "-"
  return `Loại ${loai}`
}

interface SanPhamXuatVatDetailViewProps {
  index: number
  onBack?: () => void
  backUrl?: string
}

export function SanPhamXuatVatDetailView({
  index,
  onBack,
  backUrl,
}: SanPhamXuatVatDetailViewProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const query = useSanPhamXuatVatById(index, undefined)
  const viewState = useDetailViewStateFromQuery(query, undefined)

  const sanPham = viewState.data

  const returnTo = searchParams.get("returnTo") || "list"

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else if (backUrl) {
      navigate(backUrl)
    } else if (returnTo === "list") {
      navigate(sanPhamXuatVatConfig.routePath)
    } else {
      navigate(sanPhamXuatVatConfig.routePath)
    }
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
        title="Không tìm thấy sản phẩm xuất VAT"
        message="Sản phẩm xuất VAT với STT này không tồn tại."
        onBack={handleBack}
        backUrl={backUrl || sanPhamXuatVatConfig.routePath}
      />
    )
  }

  // ✅ TypeScript safety: viewState.data đã được đảm bảo tồn tại
  if (!sanPham) {
    return null
  }

  const sections: DetailSection[] = [
    {
      title: "Thông Tin Cơ Bản",
      fields: [
        {
          key: "index",
          label: "STT",
          value: sanPham.index ? String(sanPham.index) : "-",
        },
        { key: "ma_hang", label: "Mã hàng", value: sanPham.ma_hang || "-" },
        {
          key: "ten_hang_hoa",
          label: "Tên hàng hóa",
          value: sanPham.ten_hang_hoa || "-",
          colSpan: 2,
        },
        { key: "dvt", label: "Đơn vị tính", value: sanPham.dvt || "-" },
      ],
    },
    {
      title: "Thông Tin Giá",
      fields: [
        {
          key: "gia_xuat",
          label: "Giá xuất",
          value: formatCurrency(sanPham.gia_xuat),
        },
        {
          key: "thue_suat",
          label: "Thuế suất",
          value: formatPercentage(sanPham.thue_suat),
        },
      ],
    },
    {
      title: "Thông Tin Tồn Kho",
      fields: [
        {
          key: "so_luong_ton",
          label: "Số lượng tồn",
          value:
            sanPham.so_luong_ton !== null && sanPham.so_luong_ton !== undefined
              ? formatNumber(sanPham.so_luong_ton)
              : "-",
          ...(sanPham.so_luong_ton === 0
            ? {
                renderValue: () => (
                  <span className="text-red-600 font-semibold">
                    {formatNumber(sanPham.so_luong_ton)}
                  </span>
                ),
              }
            : {}),
        },
      ],
    },
    {
      title: "Thông Tin Phân Loại",
      fields: [
        {
          key: "loai_san_pham",
          label: "Loại sản phẩm",
          value: sanPham.loai_san_pham || "-",
          ...(sanPham.loai_san_pham
            ? {
                renderValue: () => (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      getLoaiSanPhamBadgeClass(sanPham.loai_san_pham)
                    )}
                  >
                    {formatLoaiSanPham(sanPham.loai_san_pham)}
                  </Badge>
                ),
              }
            : {}),
        },
      ],
    },
  ]

  return (
    <GenericDetailViewSimple
      title={`${sanPhamXuatVatConfig.moduleTitle} - STT ${sanPham.index}`}
      subtitle={sanPham.ten_hang_hoa || ""}
      sections={sections}
      onBack={handleBack}
      // Readonly: No actions (no Edit, Delete buttons)
    />
  )
}

