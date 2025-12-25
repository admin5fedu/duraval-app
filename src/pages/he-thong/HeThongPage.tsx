"use client"

import { ModuleDashboard } from "@/components/layout/ModuleDashboard"
import {
  Users,
  Network,
  Building2,
  Medal,
  BriefcaseBusiness,
  UserRound,
  Building,
  MapPin,
  Shield,
  UserCog,
  Settings2,
} from "lucide-react"

export default function HeThongPage() {
  const groups = [
    {
      title: "Sơ đồ",
      icon: Network,
      items: [
        {
          title: "Phòng ban",
          href: "/he-thong/phong-ban",
          icon: Building2,
          description: "Quản lý cơ cấu phòng ban và đơn vị trực thuộc.",
        },
        {
          title: "Cấp bậc",
          href: "/he-thong/cap-bac",
          icon: Medal,
          description: "Quản lý hệ thống cấp bậc nhân sự.",
        },
        {
          title: "Chức vụ",
          href: "/he-thong/chuc-vu",
          icon: BriefcaseBusiness,
          description: "Quản lý danh mục chức vụ và mô tả công việc.",
        },
      ]
    },
    {
      title: "Nhân sự",
      icon: UserCog,
      items: [
        {
          title: "Danh sách nhân sự",
          href: "/he-thong/danh-sach-nhan-su",
          icon: Users,
          description: "Quản lý hồ sơ và tài khoản nhân viên.",
        },
        {
          title: "Thông tin người thân",
          href: "/he-thong/thong-tin-nguoi-than",
          icon: UserRound,
          description: "Quản lý dữ liệu người thân và liên hệ khẩn cấp.",
        },
      ]
    },
    {
      title: "Thiết lập",
      icon: Settings2,
      items: [
        {
          title: "Thông tin công ty",
          href: "/he-thong/thong-tin-cong-ty",
          icon: Building,
          description: "Cấu hình thông tin chung của doanh nghiệp.",
        },
        {
          title: "Chi nhánh",
          href: "/he-thong/chi-nhanh",
          icon: MapPin,
          description: "Quản lý danh sách chi nhánh và văn phòng.",
        },
        {
          title: "Phân quyền",
          href: "/he-thong/phan-quyen",
          icon: Shield,
          description: "Quản lý và phân quyền cho các chức vụ trong hệ thống.",
        },
      ]
    }
  ]

  return (
    <ModuleDashboard
      title="Hệ thống"
      description="Quản lý cấu hình, người dùng và thiết lập toàn bộ hệ thống."
      groups={groups}
    />
  )
}

