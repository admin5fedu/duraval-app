"use client"

import { useMemo } from "react"
import { ModuleDashboard } from "@/components/layout/ModuleDashboard"
import {
  FileText,
  CreditCard,
  ArrowLeftRight,
  Wallet,
  BarChart3,
  PiggyBank,
  Settings,
  FolderTree,
  ShoppingCart,
  ArrowRightLeft,
} from "lucide-react"

export default function QuanLyChiPhiPage() {
  const groups = useMemo(() => [
    {
      title: "Đề xuất",
      icon: FileText,
      items: [
        {
          title: "Đề xuất chi phí / Mua hàng / Xuất nội bộ",
          href: "/quan-ly-chi-phi/de-xuat/de-xuat-chi-phi-mua-hang-xuat-noi-bo",
          icon: ShoppingCart,
          description: "Quản lý đề xuất chi phí, mua hàng và xuất nội bộ.",
        },
        {
          title: "Đề nghị thanh toán",
          href: "/quan-ly-chi-phi/de-xuat/de-nghi-thanh-toan",
          icon: CreditCard,
          description: "Quản lý các đề nghị thanh toán.",
        },
      ]
    },
    {
      title: "Sổ thu chi",
      icon: ArrowLeftRight,
      items: [
        {
          title: "Thu chi",
          href: "/quan-ly-chi-phi/so-thu-chi/thu-chi",
          icon: ArrowLeftRight,
          description: "Quản lý thu chi trong hệ thống.",
        },
        {
          title: "Tài khoản",
          href: "/quan-ly-chi-phi/so-thu-chi/tai-khoan",
          icon: Wallet,
          description: "Quản lý tài khoản tài chính.",
        },
        {
          title: "Báo cáo thu chi",
          href: "/quan-ly-chi-phi/so-thu-chi/bao-cao-thu-chi",
          icon: BarChart3,
          description: "Xem báo cáo và thống kê thu chi.",
        },
      ]
    },
    {
      title: "Quỹ nội bộ",
      icon: PiggyBank,
      items: [
        {
          title: "Thu chi quỹ NB",
          href: "/quan-ly-chi-phi/quy-noi-bo/thu-chi-quy-nb",
          icon: ArrowRightLeft,
          description: "Quản lý thu chi quỹ nội bộ.",
        },
        {
          title: "Báo cáo quỹ NB",
          href: "/quan-ly-chi-phi/quy-noi-bo/bao-cao-quy-nb",
          icon: BarChart3,
          description: "Xem báo cáo quỹ nội bộ.",
        },
      ]
    },
    {
      title: "Thiết lập",
      icon: Settings,
      items: [
        {
          title: "Danh mục tài chính",
          href: "/quan-ly-chi-phi/thiet-lap/danh-muc-tai-chinh",
          icon: FolderTree,
          description: "Quản lý danh mục tài chính.",
        },
        {
          title: "Quỹ nội bộ",
          href: "/quan-ly-chi-phi/thiet-lap/quy-noi-bo",
          icon: PiggyBank,
          description: "Thiết lập quỹ nội bộ.",
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

