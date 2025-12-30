"use client"

import { useMemo } from "react"
import { ModuleDashboard } from "@/components/layout/ModuleDashboard"
import {
  Calendar,
  CheckSquare,
  FolderTree,
  FileText,
  FolderOpen,
  ClipboardList,
  FileCheck,
  HelpCircle,
  CalendarClock,
  MessageSquare,
  LayoutDashboard,
  FolderKanban,
  School,
  MessageCircleQuestion,
  Archive,
  Tag,
} from "lucide-react"

export default function CongViecPage() {
  const groups = useMemo(() => [
    {
      title: "Tổng quan",
      icon: LayoutDashboard,
      items: [
        {
          title: "Kế hoạch 168",
          href: "/cong-viec/ke-hoach-168",
          icon: Calendar,
          description: "Quản lý kế hoạch làm việc 168 giờ và phân bổ công việc theo tuần.",
        },
        {
          title: "Việc hàng ngày",
          href: "/cong-viec/viec-hang-ngay",
          icon: CheckSquare,
          description: "Theo dõi và quản lý các công việc hàng ngày, nhiệm vụ và tiến độ.",
        },
      ]
    },
    {
      title: "Tài liệu",
      icon: FolderKanban,
      items: [
        {
          title: "Loại tài liệu",
          href: "/cong-viec/loai-tai-lieu",
          icon: Tag,
          description: "Quản lý các loại và phân loại tài liệu trong hệ thống.",
        },
        {
          title: "Danh mục tài liệu",
          href: "/cong-viec/tai-lieu/danh-muc",
          icon: FolderTree,
          description: "Quản lý danh mục và phân loại tài liệu trong hệ thống.",
        },
        {
          title: "Tài liệu / Biểu mẫu",
          href: "/cong-viec/tai-lieu/tai-lieu-bieu-mau",
          icon: FileText,
          description: "Lưu trữ và quản lý tài liệu, biểu mẫu, văn bản công việc.",
        },
        {
          title: "Hồ sơ",
          href: "/cong-viec/tai-lieu/ho-so",
          icon: Archive,
          description: "Quản lý và lưu trữ hồ sơ, tài liệu quan trọng của công việc và dự án.",
        },
      ]
    },
    {
      title: "Đào tạo",
      icon: School,
      items: [
        {
          title: "Danh mục",
          href: "/cong-viec/dao-tao/danh-muc",
          icon: FolderOpen,
          description: "Quản lý danh mục các khóa đào tạo và chương trình học tập.",
        },
        {
          title: "Kỳ thi",
          href: "/cong-viec/dao-tao/ky-thi",
          icon: ClipboardList,
          description: "Tổ chức và quản lý các kỳ thi, đánh giá năng lực nhân viên.",
        },
        {
          title: "Bài thi",
          href: "/cong-viec/dao-tao/bai-thi",
          icon: FileCheck,
          description: "Tạo và quản lý đề thi, câu hỏi và kết quả bài thi.",
        },
      ]
    },
    {
      title: "Câu hỏi hàng ngày",
      icon: MessageCircleQuestion,
      items: [
        {
          title: "Danh mục câu hỏi",
          href: "/cong-viec/danh-muc-cau-hoi",
          icon: HelpCircle,
          description: "Quản lý danh mục các chủ đề câu hỏi hàng ngày.",
        },
        {
          title: "Lịch đăng",
          href: "/cong-viec/lich-dang",
          icon: CalendarClock,
          description: "Lên lịch và quản lý thời gian đăng câu hỏi hàng ngày.",
        },
        {
          title: "Câu trả lời",
          href: "/cong-viec/cau-tra-loi",
          icon: MessageSquare,
          description: "Xem và quản lý các câu trả lời của nhân viên cho câu hỏi hàng ngày.",
        },
      ]
    }
  ], [])

  return (
    <ModuleDashboard
      title="Công việc"
      groups={groups}
    />
  )
}

