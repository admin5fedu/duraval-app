"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { TinhThanhTSN } from "../schema"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { DeleteTinhThanhTSNButton } from "./delete-tinh-thanh-tsn-button"
import { tinhThanhTSNConfig } from "../config"
import { createSelectColumn } from "@/shared/components/data-display/table/create-select-column"
import { SortableHeader } from "@/shared/components"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

// Name cell component with navigation
function NameCell({ name, id }: { name: string; id: number }) {
    const navigate = useNavigate()
    
    return (
        <button
            onClick={() => navigate(`${tinhThanhTSNConfig.routePath}/${id}`)}
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
                    navigate(`${tinhThanhTSNConfig.routePath}/${id}/sua?returnTo=list`)
                }}
            >
                <span className="sr-only">Edit</span>
                <Edit className="h-4 w-4" />
            </Button>
            <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                <DeleteTinhThanhTSNButton id={id} name={name} iconOnly />
            </div>
        </div>
    )
}

export const tinhThanhTSNColumns = (): ColumnDef<TinhThanhTSN>[] => [
    createSelectColumn<TinhThanhTSN>(),
    {
        accessorKey: "ma_tinh_thanh",
        header: ({ column }) => <SortableHeader column={column} title="Mã Tỉnh Thành" />,
        cell: ({ row }) => {
            const tinhThanh = row.original
            return (
                <div className="min-w-[120px] font-mono text-sm">
                    {tinhThanh.ma_tinh_thanh}
                </div>
            )
        },
        size: 150,
        minSize: 120,
        meta: {
            title: "Mã Tỉnh Thành",
            order: 1,
        },
    },
    {
        accessorKey: "ten_tinh_thanh",
        header: ({ column }) => <SortableHeader column={column} title="Tên Tỉnh Thành" />,
        cell: ({ row }) => {
            const tinhThanh = row.original
            return (
                <NameCell 
                    name={tinhThanh.ten_tinh_thanh} 
                    id={tinhThanh.id!} 
                />
            )
        },
        size: 250,
        minSize: 200,
        meta: {
            title: "Tên Tỉnh Thành",
            order: 2,
        },
    },
    {
        accessorKey: "mien",
        header: ({ column }) => <SortableHeader column={column} title="Miền" />,
        cell: ({ row }) => {
            const mien = row.getValue("mien") as string | null | undefined
            return (
                <div className="min-w-[120px]">
                    {mien || "-"}
                </div>
            )
        },
        size: 140,
        minSize: 120,
        meta: {
            title: "Miền",
            order: 3,
        },
    },
    {
        accessorKey: "vung",
        header: ({ column }) => <SortableHeader column={column} title="Vùng" />,
        cell: ({ row }) => {
            const vung = row.getValue("vung") as string | null | undefined
            return (
                <div className="min-w-[200px] truncate" title={vung || undefined}>
                    {vung || "-"}
                </div>
            )
        },
        size: 250,
        minSize: 200,
        meta: {
            title: "Vùng",
            order: 4,
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
            order: 5,
        },
    },
    {
        id: "actions",
        header: () => <div className="text-right pr-4">Thao Tác</div>,
        cell: ({ row }) => {
            const tinhThanh = row.original
            return (
                <ActionsCell 
                    id={tinhThanh.id!} 
                    name={tinhThanh.ten_tinh_thanh} 
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

