"use client"

import { ModuleDashboard } from "@/components/layout/ModuleDashboard"
import {
  Users,
  Network,
  Building2,
  Medal,
  BriefcaseBusiness,
  Target,
  UserRound,
  Building,
  MapPin,
  Shield,
  UserCog,
  Settings2,
  FileEdit,
  TrendingUp,
  Utensils,
  ShieldCheck,
  Baby,
  MoreHorizontal,
  Map,
  Globe,
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
        {
          title: "Nhóm áp doanh số",
          href: "/he-thong/nhom-ap-doanh-so",
          icon: Target,
          description: "Quản lý nhóm áp dụng doanh số.",
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
          title: "Người thân",
          href: "/he-thong/nguoi-than",
          icon: UserRound,
          description: "Quản lý dữ liệu người thân và liên hệ khẩn cấp.",
        },
      ]
    },
    {
      title: "Đăng ký",
      icon: FileEdit,
      items: [
        {
          title: "Đăng ký Doanh số",
          href: "/he-thong/dang-ky-doanh-so",
          icon: TrendingUp,
          description: "Quản lý đăng ký doanh số.",
        },
        {
          title: "Đăng ký Cơm ca",
          href: "/he-thong/dang-ky-com-ca",
          icon: Utensils,
          description: "Quản lý đăng ký cơm ca.",
        },
        {
          title: "Đăng ký Bảo hiểm",
          href: "/he-thong/dang-ky-bao-hiem",
          icon: ShieldCheck,
          description: "Quản lý đăng ký bảo hiểm.",
        },
        {
          title: "Đăng ký Thai sản",
          href: "/he-thong/dang-ky-thai-san",
          icon: Baby,
          description: "Quản lý đăng ký thai sản.",
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
    },
    {
      title: "Khác",
      icon: MoreHorizontal,
      items: [
        {
          title: "Tỉnh thành trước sát nhập",
          href: "/he-thong/tinh-thanh-tsn",
          icon: Map,
          description: "Quản lý tỉnh thành trước sát nhập.",
        },
        {
          title: "Tỉnh thành sau sát nhập",
          href: "/he-thong/tinh-thanh-ssn",
          icon: Globe,
          description: "Quản lý tỉnh thành sau sát nhập.",
        },
      ]
    }
  ]

  return (
    <ModuleDashboard
      title="Hệ thống"
      groups={groups}
    />
  )
}

