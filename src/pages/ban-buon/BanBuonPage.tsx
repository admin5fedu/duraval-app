"use client"

import { useMemo } from "react"
import { ModuleDashboard } from "@/components/layout/ModuleDashboard"
import {
  Users,
  UserRound,
  Image,
  HeartHandshake,
  CheckCircle2,
  FileCheck,
  ClipboardCheck,
  Settings,
  Target,
} from "lucide-react"

export default function BanBuonPage() {
  const groups = useMemo(() => [
    {
      title: "Thông tin khách hàng",
      icon: Users,
      items: [
        {
          title: "Dữ liệu khách buôn",
          href: "/ban-buon/danh-sach-kb",
          icon: Users,
          description: "Quản lý thông tin và dữ liệu khách hàng buôn bán.",
        },
        {
          title: "Người liên hệ",
          href: "/ban-buon/nguoi-lien-he",
          icon: UserRound,
          description: "Quản lý thông tin người liên hệ của khách buôn.",
        },
        {
          title: "Hình ảnh khách buôn",
          href: "/ban-buon/hinh-anh-khach-buon",
          icon: Image,
          description: "Quản lý hình ảnh và tài liệu liên quan đến khách buôn.",
        },
      ]
    },
    {
      title: "Chăm sóc",
      icon: HeartHandshake,
      items: [
        {
          title: "Kế hoạch thị trường",
          href: "/ban-buon/ke-hoach-thi-truong",
          icon: Target,
          description: "Kế hoạch thị trường cho khách buôn.",
        },
        {
          title: "Chăm sóc khách buôn",
          href: "/ban-buon/cham-soc-khach-buon",
          icon: HeartHandshake,
          description: "Quản lý và theo dõi hoạt động chăm sóc khách hàng buôn.",
        },
      ]
    },
    {
      title: "Xét duyệt",
      icon: CheckCircle2,
      items: [
        {
          title: "Xét duyệt khách buôn",
          href: "/ban-buon/xet-duyet-khach-buon",
          icon: CheckCircle2,
          description: "Xét duyệt thông tin và hồ sơ khách hàng buôn.",
        },
        {
          title: "Xét duyệt công nợ",
          href: "/ban-buon/xet-duyet-cong-no",
          icon: FileCheck,
          description: "Xét duyệt và quản lý công nợ của khách buôn.",
        },
        {
          title: "Xét duyệt đăng ký doanh số",
          href: "/ban-buon/xet-duyet-dang-ky-doanh-so",
          icon: ClipboardCheck,
          description: "Xét duyệt đăng ký doanh số và mục tiêu bán hàng.",
        },
      ]
    },
    {
      title: "Thiết lập",
      icon: Settings,
      items: [
        {
          title: "Thiết lập khách buôn",
          href: "/ban-buon/giai-doan-khach-buon",
          icon: Settings,
          description: "Cấu hình và thiết lập các thông số cho khách hàng buôn.",
        },
      ]
    }
  ], [])

  return (
    <ModuleDashboard
      title="Bán buôn"
      description="Quản lý toàn diện hoạt động bán buôn, từ thông tin khách hàng đến xét duyệt và chăm sóc."
      groups={groups}
    />
  )
}

