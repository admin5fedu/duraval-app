"use client"

import { useMemo } from "react"
import { ModuleDashboard } from "@/components/layout/ModuleDashboard"
import {
  Package,
  PackageCheck,
  ArrowLeftRight,
  Building2,
  Truck,
  RotateCcw,
} from "lucide-react"

export default function KhoVanPage() {
  const groups = useMemo(() => [
    {
      title: "Nhập xuất hàng",
      icon: ArrowLeftRight,
      items: [
        {
          title: "Nhập hàng",
          href: "/kho-van/nhap-xuat-hang/nhap-hang",
          icon: Package,
          description: "Quản lý nhập hàng vào kho.",
        },
        {
          title: "Đóng hàng",
          href: "/kho-van/nhap-xuat-hang/dong-hang",
          icon: PackageCheck,
          description: "Quản lý đóng gói hàng hóa.",
        },
        {
          title: "Xuất hàng",
          href: "/kho-van/nhap-xuat-hang/xuat-hang",
          icon: Truck,
          description: "Quản lý xuất hàng từ kho.",
        },
        {
          title: "Hoàn trả hàng",
          href: "/kho-van/nhap-xuat-hang/hoan-tra-hang",
          icon: RotateCcw,
          description: "Quản lý hoàn trả hàng hóa.",
        },
      ]
    },
    {
      title: "Quản lý đối tác",
      icon: Building2,
      items: [
        {
          title: "Nhà cung cấp KV",
          href: "/kho-van/quan-ly-doi-tac/nha-cung-cap-kv",
          icon: Building2,
          description: "Quản lý nhà cung cấp kho vận.",
        },
      ]
    }
  ], [])

  return (
    <ModuleDashboard
      title="Kho Vận"
      description="Quản lý nhập xuất hàng, đối tác và hoạt động kho vận."
      groups={groups}
    />
  )
}

