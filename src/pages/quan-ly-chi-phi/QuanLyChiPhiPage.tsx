"use client"

import { useMemo } from "react"
import { ModuleDashboard } from "@/components/layout/ModuleDashboard"
import {
  Wallet,
  Receipt,
  TrendingDown,
  FileText,
  BarChart3,
  Calendar,
} from "lucide-react"

export default function QuanLyChiPhiPage() {
  const groups = useMemo(() => [
    {
      title: "Quản lý chi phí",
      icon: Wallet,
      items: [
        {
          title: "Danh sách chi phí",
          href: "/quan-ly-chi-phi/danh-sach",
          icon: Receipt,
          description: "Xem và quản lý danh sách các khoản chi phí.",
        },
        {
          title: "Phân loại chi phí",
          href: "/quan-ly-chi-phi/phan-loai",
          icon: FileText,
          description: "Quản lý các loại và hạng mục chi phí.",
        },
      ]
    },
    {
      title: "Báo cáo & Thống kê",
      icon: BarChart3,
      items: [
        {
          title: "Báo cáo chi phí",
          href: "/quan-ly-chi-phi/bao-cao",
          icon: TrendingDown,
          description: "Xem báo cáo và thống kê chi phí theo thời gian.",
        },
        {
          title: "Ngân sách",
          href: "/quan-ly-chi-phi/ngan-sach",
          icon: Calendar,
          description: "Quản lý ngân sách và kế hoạch chi phí.",
        },
      ]
    }
  ], [])

  return (
    <ModuleDashboard
      title="Quản lý chi phí"
      description="Theo dõi và quản lý các khoản chi phí, ngân sách của doanh nghiệp."
      groups={groups}
    />
  )
}

