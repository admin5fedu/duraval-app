"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { LoaiDoanhThu } from "../schema"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { DeleteLoaiDoanhThuButton } from "./delete-loai-doanh-thu-button"
import { loaiDoanhThuConfig } from "../config"
import { createSelectColumn } from "@/shared/components/data-display/table/create-select-column"
import { SortableHeader } from "@/shared/components"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

// Name cell component with navigation
function NameCell({ name, id }: { name: string; id: number }) {
    const navigate = useNavigate()
    
    return (
        <button
            onClick={() => navigate(`${loaiDoanhThuConfig.routePath}/${id}`)}
            className="font-medium hover:underline truncate text-left w-full"
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
                    // Navigate to edit with returnTo=list to return to list after save
                    navigate(`${loaiDoanhThuConfig.routePath}/${id}/sua?returnTo=list`)
                }}
            >
                <span className="sr-only">Edit</span>
                <Edit className="h-4 w-4" />
            </Button>
            <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                <DeleteLoaiDoanhThuButton id={id} name={name} iconOnly />
            </div>
        </div>
    )
}

export const loaiDoanhThuColumns = (): ColumnDef<LoaiDoanhThu>[] => [
    // ⚡ Professional: Use generic select column utility
    createSelectColumn<LoaiDoanhThu>(),
    {
        accessorKey: "ten_doanh_thu",
        header: ({ column }) => <SortableHeader column={column} title="Tên Doanh Thu" />,
        cell: ({ row }) => {
            const loaiDoanhThu = row.original
            return (
                <NameCell 
                    name={loaiDoanhThu.ten_doanh_thu} 
                    id={loaiDoanhThu.id!} 
                />
            )
        },
        size: 250,
        minSize: 200,
        meta: {
            title: "Tên Doanh Thu",
            order: 1,
        },
    },
    {
        accessorKey: "mo_ta",
        header: ({ column }) => <SortableHeader column={column} title="Mô Tả" />,
        cell: ({ row }) => {
            const moTa = row.getValue("mo_ta") as string | null | undefined
            return (
                <div className="max-w-[400px] truncate" title={moTa || undefined}>
                    {moTa || "-"}
                </div>
            )
        },
        size: 300,
        minSize: 200,
        meta: {
            title: "Mô Tả",
            order: 2,
        },
    },
    {
        accessorKey: "nguoi_tao_id",
        header: ({ column }) => <SortableHeader column={column} title="Người Tạo" />,
        filterFn: (row, id, value) => {
            const nguoiTaoId = row.getValue(id) as number | null | undefined
            if (!nguoiTaoId) {
                return value.includes("null") || value.includes("")
            }
            return value.includes(String(nguoiTaoId))
        },
        cell: ({ row }) => {
            const nguoiTaoTen = row.original.nguoi_tao_ten
            const nguoiTaoId = row.getValue("nguoi_tao_id") as number | null
            if (!nguoiTaoId) {
                return <span className="text-muted-foreground">-</span>
            }
            return (
                <div className="min-w-[150px]">
                    {nguoiTaoTen 
                        ? `${nguoiTaoId} - ${nguoiTaoTen}`
                        : String(nguoiTaoId)
                    }
                </div>
            )
        },
        size: 200,
        minSize: 150,
        meta: {
            title: "Người Tạo",
            order: 3,
        },
    },
    {
        accessorKey: "tg_tao",
        header: ({ column }) => <SortableHeader column={column} title="Thời Gian Tạo" />,
        cell: ({ row }) => {
            const tgTao = row.getValue("tg_tao") as string | null | undefined
            if (!tgTao) return <div className="text-muted-foreground">-</div>
            try {
                return (
                    <div className="min-w-[150px]">
                        {format(new Date(tgTao), "dd/MM/yyyy HH:mm", { locale: vi })}
                    </div>
                )
            } catch {
                return <div className="text-muted-foreground">-</div>
            }
        },
        size: 180,
        minSize: 150,
        meta: {
            title: "Thời Gian Tạo",
            order: 4,
        },
    },
    {
        id: "actions",
        header: () => <div className="text-right pr-4">Thao Tác</div>,
        cell: ({ row }) => {
            const loaiDoanhThu = row.original
            return (
                <ActionsCell 
                    id={loaiDoanhThu.id!} 
                    name={loaiDoanhThu.ten_doanh_thu} 
                />
            )
        },
        size: 120,
        minSize: 100,
        enableSorting: false,
        enableHiding: false,
        meta: {
            title: "Thao Tác",
            order: 999,
            stickyRight: true,
        },
    },
]

