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
  ShoppingBag,
  Store,
  Package,
} from "lucide-react"

export default function KinhDoanhPage() {
  const groups = useMemo(() => [
    {
      title: "Quỹ hỗ trợ bán hàng",
      icon: Wallet,
      items: [
        {
          title: "Phiếu đề xuất bán hàng",
          href: "/kinh-doanh/phieu-de-xuat-ban-hang",
          icon: FileText,
          description: "Quản lý phiếu đề xuất bán hàng.",
        },
        {
          title: "Quỹ hỗ trợ bán hàng",
          href: "/kinh-doanh/tong-quan-quy-htbh",
          icon: Wallet,
          description: "Quản lý và theo dõi quỹ hỗ trợ bán hàng.",
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
    },
    {
      title: "Chương trình bán hàng",
      icon: ShoppingBag,
      items: [
        {
          title: "Chương trình bán lẻ",
          href: "#",
          icon: Store,
          description: "Quản lý chương trình bán lẻ.",
        },
        {
          title: "Chương trình bán buôn",
          href: "#",
          icon: Package,
          description: "Quản lý chương trình bán buôn.",
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

