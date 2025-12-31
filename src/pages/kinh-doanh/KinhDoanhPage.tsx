"use client"

import { useMemo } from "react"
import { ModuleDashboard } from "@/components/layout/ModuleDashboard"
import {
  Wallet,
  FileText,
  Tag,
  Database,
  Percent,
  TrendingUp,
} from "lucide-react"

export default function KinhDoanhPage() {
  const groups = useMemo(() => [
    {
      title: "Quỹ hỗ trợ bán hàng",
      icon: Wallet,
      items: [
        {
          title: "Phiếu đề xuất chiết khấu",
          href: "/kinh-doanh/quy-ho-tro-ban-hang/phieu-de-xuat-chiet-khau",
          icon: FileText,
          description: "Quản lý phiếu đề xuất chiết khấu.",
        },
        {
          title: "Quỹ đề xuất chiết khấu",
          href: "/kinh-doanh/quy-ho-tro-ban-hang/quy-de-xuat-chiet-khau",
          icon: Wallet,
          description: "Quản lý quỹ đề xuất chiết khấu.",
        },
        {
          title: "Loại phiếu & Hạng mục",
          href: "/kinh-doanh/loai-phieu",
          icon: Tag,
          description: "Quản lý loại phiếu và hạng mục.",
        },
      ]
    },
    {
      title: "Sale Ads",
      icon: TrendingUp,
      items: [
        {
          title: "Bảng chia data",
          href: "/kinh-doanh/sale-ads/bang-chia-data",
          icon: Database,
          description: "Quản lý bảng chia data.",
        },
        {
          title: "Quy định tỷ lệ",
          href: "/kinh-doanh/sale-ads/quy-dinh-ty-le",
          icon: Percent,
          description: "Quản lý quy định tỷ lệ.",
        },
      ]
    }
  ], [])

  return (
    <ModuleDashboard
      title="Kinh doanh"
      description="Quản lý quỹ hỗ trợ bán hàng và sale ads."
      groups={groups}
    />
  )
}

