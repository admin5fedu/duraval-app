"use client"

import { useMemo } from "react"
import { ModuleDashboard } from "@/components/layout/ModuleDashboard"
import {
  Wallet,
  FileText,
  FolderTree,
  ClipboardList,
  Calculator,
  CheckSquare,
  TrendingUp,
  UserPlus,
  Users,
  Briefcase,
} from "lucide-react"

export default function HanhChinhNhanSuPage() {
  const groups = useMemo(() => [
    {
      title: "Công lương",
      icon: Wallet,
      items: [
        {
          title: "Phiếu hành chính",
          href: "/hanh-chinh-nhan-su/phieu-hanh-chinh",
          icon: FileText,
          description: "Quản lý các phiếu hành chính.",
        },
        {
          title: "Nhóm phiếu hành chính",
          href: "/hanh-chinh-nhan-su/nhom-phieu-hanh-chinh",
          icon: FolderTree,
          description: "Quản lý nhóm các phiếu hành chính.",
        },
        {
          title: "Bảng công",
          href: "/hanh-chinh-nhan-su/bang-cong",
          icon: ClipboardList,
          description: "Quản lý bảng chấm công nhân viên.",
        },
        {
          title: "Bảng lương",
          href: "/hanh-chinh-nhan-su/bang-luong",
          icon: Calculator,
          description: "Quản lý bảng tính lương và thanh toán.",
        },
      ]
    },
    {
      title: "OLE",
      icon: CheckSquare,
      items: [
        {
          title: "Chấm OLE",
          href: "/hanh-chinh-nhan-su/cham-ole",
          icon: CheckSquare,
          description: "Quản lý chấm điểm OLE (On-the-Job Learning Experience).",
        },
        {
          title: "Điểm cộng trừ",
          href: "/hanh-chinh-nhan-su/diem-cong-tru",
          icon: TrendingUp,
          description: "Quản lý điểm cộng trừ cho nhân viên.",
        },
        {
          title: "Nhóm điểm cộng trừ",
          href: "/hanh-chinh-nhan-su/nhom-diem-cong-tru",
          icon: FolderTree,
          description: "Quản lý nhóm các điểm cộng trừ.",
        },
        {
          title: "Nhóm lương",
          href: "/hanh-chinh-nhan-su/nhom-luong",
          icon: Wallet,
          description: "Quản lý nhóm lương.",
        },
      ]
    },
    {
      title: "Tuyển dụng",
      icon: Briefcase,
      items: [
        {
          title: "Đề xuất tuyển dụng",
          href: "/hanh-chinh-nhan-su/de-xuat-tuyen-dung",
          icon: UserPlus,
          description: "Quản lý các đề xuất tuyển dụng từ các phòng ban.",
        },
        {
          title: "Ứng viên",
          href: "/hanh-chinh-nhan-su/ung-vien",
          icon: Users,
          description: "Quản lý thông tin ứng viên và quy trình tuyển dụng.",
        },
      ]
    }
  ], [])

  return (
    <ModuleDashboard
      title="Hành chính nhân sự"
      description="Quản lý toàn diện nguồn nhân lực, từ tuyển dụng đến lương thưởng."
      groups={groups}
    />
  )
}

