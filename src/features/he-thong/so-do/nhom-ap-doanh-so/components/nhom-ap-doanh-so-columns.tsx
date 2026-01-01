"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { NhomApDoanhSo } from "../schema"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { DeleteNhomApDoanhSoButton } from "./delete-nhom-ap-doanh-so-button"
import { nhomApDoanhSoConfig } from "../config"
import { createSelectColumn } from "@/shared/components/data-display/table/create-select-column"
import { SortableHeader } from "@/shared/components"
import type { NhanSu } from "@/features/he-thong/nhan-su/danh-sach-nhan-su/schema"

// Name cell component with navigation
function NameCell({ name, id }: { name: string | null; id: number }) {
    const navigate = useNavigate()
    
    const displayName = name || "Chưa có tên"
    
    return (
        <button
            onClick={() => navigate(`${nhomApDoanhSoConfig.routePath}/${id}`)}
            className="font-medium hover:underline truncate text-left w-full"
        >
            {displayName}
        </button>
    )
}

// Actions cell component
function ActionsCell({ id, name }: { id: number; name: string | null }) {
    const navigate = useNavigate()
    const displayName = name || "Chưa có tên"
    
    return (
        <div className="flex items-center gap-2 justify-end pr-4 min-w-[100px]">
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:text-blue-600 shrink-0"
                onClick={(e) => {
                    e.stopPropagation()
                    navigate(`${nhomApDoanhSoConfig.routePath}/${id}/sua`)
                }}
            >
                <span className="sr-only">Edit</span>
                <Edit className="h-4 w-4" />
            </Button>
            <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                <DeleteNhomApDoanhSoButton id={id} name={displayName} iconOnly />
            </div>
        </div>
    )
}

export const nhomApDoanhSoColumns = (nhanSuList: NhanSu[] = []): ColumnDef<NhomApDoanhSo>[] => [
    // ⚡ Professional: Use generic select column utility
    createSelectColumn<NhomApDoanhSo>(),
    {
        accessorKey: "ma_nhom_ap",
        header: ({ column }) => <SortableHeader column={column} title="Mã Nhóm Áp" />,
        size: 150,
        minSize: 120,
        meta: {
            title: "Mã Nhóm Áp",
            order: 1,
            stickyLeft: true,
            stickyLeftOffset: 40, // After checkbox column
            minWidth: 120,
        },
        cell: ({ row }) => {
            const maNhomAp = row.getValue("ma_nhom_ap") as string
            const id = row.original.id!
            return (
                <NameCell name={maNhomAp} id={id} />
            )
        },
    },
    {
        accessorKey: "ten_nhom_ap",
        header: ({ column }) => <SortableHeader column={column} title="Tên Nhóm Áp" />,
        size: 250,
        minSize: 200,
        meta: {
            title: "Tên Nhóm Áp",
            order: 2,
            minWidth: 200,
        },
        cell: ({ row }) => {
            const tenNhomAp = row.getValue("ten_nhom_ap") as string | null
            const id = row.original.id!
            return (
                <NameCell name={tenNhomAp} id={id} />
            )
        },
    },
    {
        accessorKey: "mo_ta",
        header: ({ column }) => <SortableHeader column={column} title="Mô Tả" />,
        size: 300,
        minSize: 200,
        cell: ({ row }) => {
            const value = row.getValue("mo_ta") as string | null | undefined
            return value ? (
                <div className="max-w-[300px] truncate" title={value}>
                    {value}
                </div>
            ) : (
                <span className="text-muted-foreground">-</span>
            )
        },
        meta: {
            title: "Mô Tả",
            order: 3,
            minWidth: 200,
        },
    },
    {
        accessorKey: "tg_tao",
        header: ({ column }) => <SortableHeader column={column} title="Thời Gian Tạo" />,
        size: 180,
        minSize: 150,
        cell: ({ row }) => {
            const value = row.getValue("tg_tao") as string | null | undefined
            if (!value) return <span className="text-muted-foreground">-</span>
            try {
                const date = new Date(value)
                return date.toLocaleString("vi-VN", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                })
            } catch {
                return <span className="text-muted-foreground">-</span>
            }
        },
        meta: {
            title: "Thời Gian Tạo",
            order: 4,
            minWidth: 150,
        },
    },
    {
        accessorKey: "nguoi_tao_id",
        header: ({ column }) => <SortableHeader column={column} title="Người Tạo" />,
        size: 200,
        minSize: 150,
        cell: ({ row }) => {
            const nguoiTaoId = row.getValue("nguoi_tao_id") as number | null | undefined
            if (!nguoiTaoId) {
                return <span className="text-muted-foreground">-</span>
            }
            
            // Map nguoi_tao_id (ma_nhan_vien) với nhanSuList để lấy ho_ten
            const nguoiTao = nhanSuList.find((ns) => ns.ma_nhan_vien === nguoiTaoId)
            if (nguoiTao) {
                return (
                    <span className="truncate">
                        {nguoiTao.ma_nhan_vien} - {nguoiTao.ho_ten}
                    </span>
                )
            }
            return <span>{nguoiTaoId}</span>
        },
        meta: {
            title: "Người Tạo",
            order: 5,
            minWidth: 150,
        },
    },
    {
        id: "actions",
        header: () => <div className="text-right pr-4">Thao tác</div>,
        cell: ({ row }) => {
            const id = row.original.id!
            const name = row.original.ten_nhom_ap
            return <ActionsCell id={id} name={name} />
        },
        enableSorting: false,
        enableHiding: false,
        size: 100,
        meta: {
            stickyRight: true,
        },
    },
]

