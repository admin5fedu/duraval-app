"use client"

import { useMemo } from "react"
import { ModuleDashboard } from "@/components/layout/ModuleDashboard"
import {
  Wrench,
  MessageSquare,
  Cog,
  Video,
  ShoppingCart,
  User,
  FolderTree,
  List,
  History,
} from "lucide-react"

export default function MarketingPage() {
  const groups = useMemo(() => [
    {
      title: "Kỹ thuật & CSKH",
      icon: Wrench,
      items: [
        {
          title: "Phản hồi khách hàng",
          href: "/marketing/phan-hoi-khach-hang",
          icon: MessageSquare,
          description: "Quản lý phản hồi và góp ý từ khách hàng.",
        },
        {
          title: "Trục hạt",
          href: "/marketing/truc-hat",
          icon: Cog,
          description: "Quản lý hệ thống trục hạt.",
        },
      ]
    },
    {
      title: "Media",
      icon: Video,
      items: [
        {
          title: "Order media",
          href: "/marketing/order-media",
          icon: ShoppingCart,
          description: "Quản lý đơn hàng media và quảng cáo.",
        },
      ]
    },
    {
      title: "Tài khoản",
      icon: User,
      items: [
        {
          title: "Danh mục tài khoản",
          href: "/marketing/danh-muc-tai-khoan",
          icon: FolderTree,
          description: "Quản lý danh mục các loại tài khoản.",
        },
        {
          title: "Danh sách tài khoản",
          href: "/marketing/danh-sach-tai-khoan",
          icon: List,
          description: "Quản lý danh sách tài khoản marketing.",
        },
        {
          title: "Lịch sử cấp phát",
          href: "/marketing/lich-su-cap-phat",
          icon: History,
          description: "Theo dõi lịch sử cấp phát tài khoản.",
        },
      ]
    }
  ], [])

  return (
    <ModuleDashboard
      title="Marketing"
      description="Quản lý marketing, media và tài khoản."
      groups={groups}
    />
  )
}

