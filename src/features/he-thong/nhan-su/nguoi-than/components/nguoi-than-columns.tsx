"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { NguoiThan } from "../schema"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { DeleteNguoiThanButton } from "./delete-nguoi-than-button"
import { nguoiThanConfig } from "../config"
import { createSelectColumn } from "@/shared/components/data-display/table/create-select-column"
import { Badge } from "@/components/ui/badge"
import { getEnumBadgeClass } from "@/shared/utils/enum-color-registry"
import { EmployeeNavigationCell, SortableHeader } from "@/shared/components"

// Name cell component with navigation
function NameCell({ name, id }: { name: string; id: number }) {
    const navigate = useNavigate()
    
    return (
        <button
            onClick={() => navigate(`${nguoiThanConfig.routePath}/${id}`)}
            className="font-medium hover:underline truncate text-left"
        >
            {name}
        </button>
    )
}

// Actions cell component
function ActionsCell({ id, name }: { id: number; name: string }) {
    const navigate = useNavigate()
    
    return (
        <div className="flex items-center gap-2 justify-end pr-4 min-w-[100px]">
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:text-blue-600 shrink-0"
                onClick={(e) => {
                    e.stopPropagation()
                    navigate(`${nguoiThanConfig.routePath}/${id}/sua`)
                }}
            >
                <span className="sr-only">Edit</span>
                <Edit className="h-4 w-4" />
            </Button>
            <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                <DeleteNguoiThanButton id={id} name={name} iconOnly />
            </div>
        </div>
    )
}

export const nguoiThanColumns = (employeeMap?: Map<number, { ma_nhan_vien: number; ho_ten: string }>): ColumnDef<NguoiThan & { ten_nhan_vien?: string }>[] => [
    // ⚡ Professional: Use generic select column utility
    createSelectColumn<NguoiThan & { ten_nhan_vien?: string }>(),
    {
        accessorKey: "id",
        header: ({ column }) => <SortableHeader column={column} title="ID" />,
        cell: ({ row }) => <div className="min-w-[70px]">{row.getValue("id")}</div>,
        size: 80,
        minSize: 70,
        meta: {
            title: "ID",
            order: 1,
            stickyLeft: true,
            stickyLeftOffset: 40, // After checkbox column
            minWidth: 70,
        },
    },
    {
        accessorKey: "ma_nhan_vien",
        header: ({ column }) => <SortableHeader column={column} title="Nhân viên" />,
        cell: ({ row }) => {
            const maNhanVien = row.getValue("ma_nhan_vien") as number
            const employee = employeeMap?.get(maNhanVien)
            const displayText = employee 
                ? `${employee.ma_nhan_vien} - ${employee.ho_ten}`
                : String(maNhanVien)
            return (
                <EmployeeNavigationCell
                    maNhanVien={maNhanVien}
                    displayText={displayText}
                />
            )
        },
        size: 250,
        minSize: 200,
        meta: {
            title: "Nhân viên",
            order: 2,
            minWidth: 200,
        },
    },
    {
        accessorKey: "ho_va_ten",
        header: ({ column }) => <SortableHeader column={column} title="Họ và tên" />,
        size: 200,
        minSize: 180,
        meta: {
            title: "Họ và tên",
            order: 3,
            stickyLeft: true,
            stickyLeftOffset: 150, // After checkbox (40) + id (70) + ma_nhan_vien (40)
            minWidth: 180,
        },
        cell: ({ row }) => {
            const name = row.getValue("ho_va_ten") as string
            const id = row.original.id!
            return (
                <NameCell name={name} id={id} />
            )
        },
    },
    {
        accessorKey: "moi_quan_he",
        header: ({ column }) => <SortableHeader column={column} title="Mối quan hệ" />,
        size: 130,
        minSize: 120,
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
        cell: ({ row }) => {
            const moiQuanHe = row.getValue("moi_quan_he") as string
            if (!moiQuanHe) return <span className="text-muted-foreground">-</span>
            const colorClass = getEnumBadgeClass("moi_quan_he", moiQuanHe)
            return (
                <Badge variant="outline" className={colorClass}>
                    {moiQuanHe}
                </Badge>
            )
        },
        meta: {
            title: "Mối quan hệ",
            order: 4,
            minWidth: 120,
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
            order: 5,
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
            order: 6,
            minWidth: 110,
        },
    },
    {
        accessorKey: "tg_tao",
        header: ({ column }) => <SortableHeader column={column} title="Thời gian tạo" />,
        size: 160,
        minSize: 140,
        cell: ({ row }) => {
            const date = row.getValue("tg_tao") as string | null | undefined
            if (!date) return <span className="text-muted-foreground">-</span>
            try {
                return new Date(date).toLocaleString("vi-VN")
            } catch {
                return date
            }
        },
        meta: {
            title: "Thời gian tạo",
            order: 7,
            minWidth: 140,
        },
    },
    {
        // ✅ Cột ẩn để hỗ trợ tìm kiếm theo tên nhân viên
        accessorKey: "ten_nhan_vien",
        header: () => null,
        cell: () => null,
        enableHiding: false,
        enableSorting: false,
        meta: {
            hidden: true, // Ẩn cột này, chỉ dùng để tìm kiếm
        },
    },
    {
        id: "actions",
        header: () => <div className="text-right pr-4">Thao tác</div>,
        cell: ({ row }) => {
            return (
                <ActionsCell
                    id={row.original.id!}
                    name={row.original.ho_va_ten}
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

