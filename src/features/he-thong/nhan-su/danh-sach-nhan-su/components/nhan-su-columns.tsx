"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { NhanSu } from "../schema"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { ZoomableAvatar } from "@/components/ui/zoomable-avatar"
import { Badge } from "@/components/ui/badge"
import { getEmployeeStatusBadgeClass } from "@/components/ui/status-badge"
import { DeleteNhanSuButton } from "./delete-nhan-su-button"
import { nhanSuConfig } from "../config"
import { createSelectColumn } from "@/shared/components/data-display/table/create-select-column"
import { SortableHeader } from "@/shared/components"

// Name cell component with navigation
function NameCell({ name, avatar, maNhanVien }: { name: string; avatar?: string | null; maNhanVien: number }) {
    const navigate = useNavigate()
    
    return (
        <div className="flex items-center gap-2 min-w-[180px]">
            <ZoomableAvatar
                src={avatar}
                alt={name}
                className="h-8 w-8 shrink-0"
                fallback={name.charAt(0)}
            />
            <button
                onClick={() => navigate(`${nhanSuConfig.routePath}/${maNhanVien}`)}
                className="font-medium hover:underline truncate text-left"
            >
                {name}
            </button>
        </div>
    )
}

// Actions cell component
function ActionsCell({ maNhanVien, name }: { maNhanVien: number; name: string }) {
    const navigate = useNavigate()
    
    return (
        <div className="flex items-center gap-2 justify-end pr-4 min-w-[100px]">
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:text-blue-600 shrink-0"
                onClick={(e) => {
                    e.stopPropagation()
                    navigate(`${nhanSuConfig.routePath}/${maNhanVien}/sua`)
                }}
            >
                <span className="sr-only">Edit</span>
                <Edit className="h-4 w-4" />
            </Button>
            <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                <DeleteNhanSuButton id={maNhanVien} name={name} iconOnly />
            </div>
        </div>
    )
}

// Import SortableHeader from shared components
import { SortableHeader } from "@/shared/components"

export const nhanSuColumns: ColumnDef<NhanSu>[] = [
    // ⚡ Professional: Use generic select column utility
    createSelectColumn<NhanSu>(),
    {
        accessorKey: "ma_nhan_vien",
        header: ({ column }) => <SortableHeader column={column} title="Mã NV" />,
        cell: ({ row }) => <div className="min-w-[70px]">{row.getValue("ma_nhan_vien")}</div>,
        size: 80,
        minSize: 70,
        meta: {
            title: "Mã nhân viên",
            order: 1,
            stickyLeft: true,
            stickyLeftOffset: 40, // After checkbox column
            minWidth: 70,
        },
    },
    {
        accessorKey: "ho_ten",
        header: ({ column }) => <SortableHeader column={column} title="Họ và tên" />,
        size: 200,
        minSize: 180,
        meta: {
            title: "Họ và tên",
            order: 2,
            stickyLeft: true,
            stickyLeftOffset: 110, // After checkbox (40) + ma_nhan_vien (70)
            minWidth: 180,
        },
        cell: ({ row }) => {
            const name = row.getValue("ho_ten") as string
            const avatar = row.original.avatar_url
            const maNhanVien = row.getValue("ma_nhan_vien") as number

            return (
                <NameCell name={name} avatar={avatar} maNhanVien={maNhanVien} />
            )
        },
    },
    {
        accessorKey: "email_cong_ty",
        header: ({ column }) => <SortableHeader column={column} title="Email" />,
        size: 180,
        minSize: 150,
        meta: {
            title: "Email công ty",
            order: 3,
            minWidth: 150,
        },
    },
    {
        accessorKey: "phong_ban",
        header: ({ column }) => <SortableHeader column={column} title="Phòng ban" />,
        size: 150,
        minSize: 120,
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
        meta: {
            title: "Phòng ban",
            order: 4,
            minWidth: 120,
        },
    },
    {
        accessorKey: "chuc_vu",
        header: ({ column }) => <SortableHeader column={column} title="Chức vụ" />,
        size: 150,
        minSize: 120,
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
        meta: {
            title: "Chức vụ",
            order: 5,
            minWidth: 120,
        },
    },
    {
        accessorKey: "ten_cap_bac",
        header: ({ column }) => <SortableHeader column={column} title="Cấp bậc" />,
        size: 120,
        minSize: 100,
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
        meta: {
            title: "Cấp bậc",
            order: 6,
            minWidth: 100,
        },
    },
    {
        accessorKey: "tinh_trang",
        header: ({ column }) => <SortableHeader column={column} title="Tình trạng" />,
        size: 130,
        minSize: 110,
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
        cell: ({ row }) => {
            const status = row.getValue("tinh_trang") as string
            const className = getEmployeeStatusBadgeClass(status)
            return (
                <div className="min-w-[110px]">
                    <Badge variant="outline" className={className}>
                        {status}
                    </Badge>
                </div>
            )
        },
        meta: {
            title: "Tình trạng",
            order: 7,
            minWidth: 110,
        },
    },
    {
        accessorKey: "gioi_tinh",
        header: ({ column }) => <SortableHeader column={column} title="Giới tính" />,
        size: 100,
        minSize: 90,
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
        meta: {
            title: "Giới tính",
            order: 8,
            minWidth: 90,
        },
    },
    {
        accessorKey: "hon_nhan",
        header: ({ column }) => <SortableHeader column={column} title="Hôn nhân" />,
        size: 120,
        minSize: 100,
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
        meta: {
            title: "Hôn nhân",
            order: 9,
            minWidth: 100,
        },
    },
    {
        accessorKey: "so_dien_thoai",
        header: ({ column }) => <SortableHeader column={column} title="Số điện thoại" />,
        size: 130,
        minSize: 110,
        meta: {
            title: "Số điện thoại",
            order: 10,
            minWidth: 110,
        },
    },
    {
        accessorKey: "email_ca_nhan",
        header: ({ column }) => <SortableHeader column={column} title="Email cá nhân" />,
        size: 180,
        minSize: 150,
        meta: {
            title: "Email cá nhân",
            order: 11,
            minWidth: 150,
        },
    },
    {
        accessorKey: "ngay_sinh",
        header: ({ column }) => <SortableHeader column={column} title="Ngày sinh" />,
        size: 120,
        minSize: 100,
        cell: ({ row }) => {
            const date = row.getValue("ngay_sinh") as string | null | undefined
            if (!date) return <span className="text-muted-foreground">-</span>
            try {
                return new Date(date).toLocaleDateString("vi-VN")
            } catch {
                return date
            }
        },
        meta: {
            title: "Ngày sinh",
            order: 12,
            minWidth: 100,
        },
    },
    {
        accessorKey: "ngay_thu_viec",
        header: ({ column }) => <SortableHeader column={column} title="Ngày thử việc" />,
        size: 130,
        minSize: 110,
        cell: ({ row }) => {
            const date = row.getValue("ngay_thu_viec") as string | null | undefined
            if (!date) return <span className="text-muted-foreground">-</span>
            try {
                return new Date(date).toLocaleDateString("vi-VN")
            } catch {
                return date
            }
        },
        meta: {
            title: "Ngày thử việc",
            order: 13,
            minWidth: 110,
        },
    },
    {
        accessorKey: "ngay_chinh_thuc",
        header: ({ column }) => <SortableHeader column={column} title="Ngày chính thức" />,
        size: 140,
        minSize: 120,
        cell: ({ row }) => {
            const date = row.getValue("ngay_chinh_thuc") as string | null | undefined
            if (!date) return <span className="text-muted-foreground">-</span>
            try {
                return new Date(date).toLocaleDateString("vi-VN")
            } catch {
                return date
            }
        },
        meta: {
            title: "Ngày chính thức",
            order: 14,
            minWidth: 120,
        },
    },
    {
        accessorKey: "ngay_nghi_viec",
        header: ({ column }) => <SortableHeader column={column} title="Ngày nghỉ việc" />,
        size: 130,
        minSize: 110,
        cell: ({ row }) => {
            const date = row.getValue("ngay_nghi_viec") as string | null | undefined
            if (!date) return <span className="text-muted-foreground">-</span>
            try {
                return new Date(date).toLocaleDateString("vi-VN")
            } catch {
                return date
            }
        },
        meta: {
            title: "Ngày nghỉ việc",
            order: 15,
            minWidth: 110,
        },
    },
    {
        accessorKey: "bo_phan",
        header: ({ column }) => <SortableHeader column={column} title="Bộ phận" />,
        size: 120,
        minSize: 100,
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
        meta: {
            title: "Bộ phận",
            order: 16,
            minWidth: 100,
        },
    },
    {
        accessorKey: "nhom",
        header: ({ column }) => <SortableHeader column={column} title="Nhóm" />,
        size: 100,
        minSize: 90,
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
        meta: {
            title: "Nhóm",
            order: 17,
            minWidth: 90,
        },
    },
    {
        id: "actions",
        header: () => <div className="text-right pr-4">Thao tác</div>,
        cell: ({ row }) => {
            return (
                <ActionsCell
                    maNhanVien={row.original.ma_nhan_vien}
                    name={row.original.ho_ten}
                />
            )
        },
        enableSorting: false,
        enableHiding: false,
        size: 120,
        minSize: 100,
        meta: {
            title: "Thao tác",
            stickyRight: true,
            minWidth: 100,
        },
    },
]
