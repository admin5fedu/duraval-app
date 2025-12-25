"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { NhanSu } from "../schema"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, ArrowUp, ArrowDown, Edit } from "lucide-react"
import { ZoomableAvatar } from "@/components/ui/zoomable-avatar"
import { Badge } from "@/components/ui/badge"
import { getEmployeeStatusBadgeClass } from "@/components/ui/status-badge"
import { DeleteNhanSuButton } from "./delete-nhan-su-button"
import { nhanSuConfig } from "../config"
import { createSelectColumn } from "@/shared/components/data-display/table/create-select-column"

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

// Helper function to render sortable header
function SortableHeader({
    column,
    title,
}: {
    column: {
        getIsSorted: () => false | "asc" | "desc"
        toggleSorting: (desc?: boolean) => void
    }
    title: string
}) {
    const sorted = column.getIsSorted()

    return (
        <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 hover:bg-muted/50 -ml-2"
        >
            <span>{title}</span>
            {sorted === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
            ) : sorted === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
                <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
            )}
        </Button>
    )
}

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
