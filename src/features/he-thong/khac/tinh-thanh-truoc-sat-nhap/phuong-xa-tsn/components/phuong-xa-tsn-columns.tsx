"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { PhuongXaTSN } from "../schema"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { DeletePhuongXaTSNButton } from "./delete-phuong-xa-tsn-button"
import { phuongXaTSNConfig } from "../config"
import { createSelectColumn } from "@/shared/components/data-display/table/create-select-column"
import { SortableHeader } from "@/shared/components"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

// Name cell component with navigation
function NameCell({ name, id }: { name: string; id: number }) {
    const navigate = useNavigate()
    
    return (
        <button
            onClick={() => navigate(`${phuongXaTSNConfig.routePath}/${id}`)}
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
                    navigate(`${phuongXaTSNConfig.routePath}/${id}/sua?returnTo=list`)
                }}
            >
                <span className="sr-only">Edit</span>
                <Edit className="h-4 w-4" />
            </Button>
            <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                <DeletePhuongXaTSNButton id={id} name={name} iconOnly />
            </div>
        </div>
    )
}

export const phuongXaTSNColumns = (): ColumnDef<PhuongXaTSN>[] => [
    createSelectColumn<PhuongXaTSN>(),
    // Virtual column for filtering Tỉnh Thành (combines ma_tinh_thanh and ten_tinh_thanh)
    {
        id: "tinh_thanh",
        accessorFn: (row) => {
            const ma = row.ma_tinh_thanh || ""
            const ten = row.ten_tinh_thanh || ""
            return `${ma} - ${ten}`.trim()
        },
        header: ({ column }) => <SortableHeader column={column} title="Tỉnh Thành" />,
        cell: ({ row }) => {
            const phuongXa = row.original
            const ma = phuongXa.ma_tinh_thanh || ""
            const ten = phuongXa.ten_tinh_thanh || ""
            return (
                <div className="min-w-[200px]">
                    {ma && ten ? `${ma} - ${ten}` : ma || ten || "-"}
                </div>
            )
        },
        filterFn: (row, _id, value) => {
            if (!value || !Array.isArray(value) || value.length === 0) return true
            const ma = row.original.ma_tinh_thanh || ""
            const ten = row.original.ten_tinh_thanh || ""
            const combined = `${ma} - ${ten}`.trim()
            // Check if any selected value matches either ma, ten, or combined
            return value.some((v: string) => {
                return ma === v || ten === v || combined === v
            })
        },
        size: 250,
        minSize: 200,
        enableHiding: false,
        meta: {
            title: "Tỉnh Thành",
            order: 1,
        },
    },
    // Virtual column for filtering Quận Huyện (combines ma_quan_huyen and ten_quan_huyen)
    {
        id: "quan_huyen",
        accessorFn: (row) => {
            const ma = row.ma_quan_huyen || ""
            const ten = row.ten_quan_huyen || ""
            return `${ma} - ${ten}`.trim()
        },
        header: ({ column }) => <SortableHeader column={column} title="Quận Huyện" />,
        cell: ({ row }) => {
            const phuongXa = row.original
            const ma = phuongXa.ma_quan_huyen || ""
            const ten = phuongXa.ten_quan_huyen || ""
            return (
                <div className="min-w-[200px]">
                    {ma && ten ? `${ma} - ${ten}` : ma || ten || "-"}
                </div>
            )
        },
        filterFn: (row, _id, value) => {
            if (!value || !Array.isArray(value) || value.length === 0) return true
            const ma = row.original.ma_quan_huyen || ""
            const ten = row.original.ten_quan_huyen || ""
            const combined = `${ma} - ${ten}`.trim()
            // Check if any selected value matches either ma, ten, or combined
            return value.some((v: string) => {
                return ma === v || ten === v || combined === v
            })
        },
        size: 250,
        minSize: 200,
        enableHiding: false,
        meta: {
            title: "Quận Huyện",
            order: 2,
        },
    },
    {
        accessorKey: "ma_tinh_thanh",
        header: ({ column }) => <SortableHeader column={column} title="Mã Tỉnh Thành" />,
        cell: ({ row }) => {
            const phuongXa = row.original
            return (
                <div className="min-w-[120px] font-mono text-sm">
                    {phuongXa.ma_tinh_thanh || "-"}
                </div>
            )
        },
        size: 150,
        minSize: 120,
        enableHiding: true,
        meta: {
            title: "Mã Tỉnh Thành",
            order: 1.1,
        },
    },
    {
        accessorKey: "ten_tinh_thanh",
        header: ({ column }) => <SortableHeader column={column} title="Tên Tỉnh Thành" />,
        cell: ({ row }) => {
            const phuongXa = row.original
            return (
                <div className="min-w-[200px]">
                    {phuongXa.ten_tinh_thanh || "-"}
                </div>
            )
        },
        size: 250,
        minSize: 200,
        enableHiding: true,
        meta: {
            title: "Tên Tỉnh Thành",
            order: 1.2,
        },
    },
    {
        accessorKey: "ma_quan_huyen",
        header: ({ column }) => <SortableHeader column={column} title="Mã Quận Huyện" />,
        cell: ({ row }) => {
            const phuongXa = row.original
            return (
                <div className="min-w-[120px] font-mono text-sm">
                    {phuongXa.ma_quan_huyen}
                </div>
            )
        },
        size: 150,
        minSize: 120,
        enableHiding: true,
        meta: {
            title: "Mã Quận Huyện",
            order: 2.1,
        },
    },
    {
        accessorKey: "ten_quan_huyen",
        header: ({ column }) => <SortableHeader column={column} title="Tên Quận Huyện" />,
        cell: ({ row }) => {
            const phuongXa = row.original
            return (
                <div className="min-w-[200px]">
                    {phuongXa.ten_quan_huyen}
                </div>
            )
        },
        size: 250,
        minSize: 200,
        enableHiding: true,
        meta: {
            title: "Tên Quận Huyện",
            order: 2.2,
        },
    },
    {
        accessorKey: "ma_phuong_xa",
        header: ({ column }) => <SortableHeader column={column} title="Mã Phường Xã" />,
        cell: ({ row }) => {
            const phuongXa = row.original
            return (
                <div className="min-w-[120px] font-mono text-sm">
                    {phuongXa.ma_phuong_xa}
                </div>
            )
        },
        size: 150,
        minSize: 120,
        meta: {
            title: "Mã Phường Xã",
            order: 5,
        },
    },
    {
        accessorKey: "ten_phuong_xa",
        header: ({ column }) => <SortableHeader column={column} title="Tên Phường Xã" />,
        cell: ({ row }) => {
            const phuongXa = row.original
            return (
                <NameCell 
                    name={phuongXa.ten_phuong_xa} 
                    id={phuongXa.id!} 
                />
            )
        },
        size: 250,
        minSize: 200,
        meta: {
            title: "Tên Phường Xã",
            order: 6,
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
            const phuongXa = row.original
            return (
                <ActionsCell 
                    id={phuongXa.id!} 
                    name={phuongXa.ten_phuong_xa} 
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

