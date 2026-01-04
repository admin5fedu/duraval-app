"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { GiaiDoanKhachBuon } from "../schema"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { DeleteGiaiDoanKhachBuonButton } from "./delete-giai-doan-khach-buon-button"
import { giaiDoanKhachBuonConfig } from "../config"
import { createSelectColumn } from "@/shared/components/data-display/table/create-select-column"
import { SortableHeader } from "@/shared/components"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

// Name cell component with navigation
function NameCell({ name, id }: { name: string; id: number }) {
    const navigate = useNavigate()
    
    return (
        <button
            onClick={() => navigate(`${giaiDoanKhachBuonConfig.routePath}/${id}`)}
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
                    navigate(`${giaiDoanKhachBuonConfig.routePath}/${id}/sua?returnTo=list`)
                }}
            >
                <span className="sr-only">Edit</span>
                <Edit className="h-4 w-4" />
            </Button>
            <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                <DeleteGiaiDoanKhachBuonButton id={id} name={name} iconOnly />
            </div>
        </div>
    )
}

export const giaiDoanKhachBuonColumns = (): ColumnDef<GiaiDoanKhachBuon>[] => [
    createSelectColumn<GiaiDoanKhachBuon>(),
    {
        accessorKey: "ma_giai_doan",
        header: ({ column }) => <SortableHeader column={column} title="Mã Giai Đoạn" />,
        cell: ({ row }) => {
            const maGiaiDoan = row.getValue("ma_giai_doan") as string | null | undefined
            return (
                <div className="min-w-[120px]">
                    {maGiaiDoan || "-"}
                </div>
            )
        },
        size: 150,
        minSize: 120,
        meta: {
            title: "Mã Giai Đoạn",
            order: 1,
        },
    },
    {
        accessorKey: "ten_giai_doan",
        header: ({ column }) => <SortableHeader column={column} title="Tên Giai Đoạn" />,
        cell: ({ row }) => {
            const giaiDoan = row.original
            return (
                <NameCell 
                    name={giaiDoan.ten_giai_doan} 
                    id={giaiDoan.id!} 
                />
            )
        },
        size: 250,
        minSize: 200,
        meta: {
            title: "Tên Giai Đoạn",
            order: 2,
        },
    },
    {
        accessorKey: "tt",
        header: ({ column }) => <SortableHeader column={column} title="Thứ Tự" />,
        cell: ({ row }) => {
            const tt = row.getValue("tt") as number | null | undefined
            return (
                <div className="text-center min-w-[80px]">
                    {tt ?? "-"}
                </div>
            )
        },
        size: 100,
        minSize: 80,
        meta: {
            title: "Thứ Tự",
            order: 3,
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
            order: 4,
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
            order: 5,
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
            order: 6,
        },
    },
    {
        id: "actions",
        header: () => <div className="text-right pr-4">Thao Tác</div>,
        cell: ({ row }) => {
            const giaiDoan = row.original
            return (
                <ActionsCell 
                    id={giaiDoan.id!} 
                    name={giaiDoan.ten_giai_doan} 
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

