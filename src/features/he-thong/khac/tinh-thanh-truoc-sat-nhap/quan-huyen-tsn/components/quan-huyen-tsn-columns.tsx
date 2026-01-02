"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { QuanHuyenTSN } from "../schema"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { DeleteQuanHuyenTSNButton } from "./delete-quan-huyen-tsn-button"
import { quanHuyenTSNConfig } from "../config"
import { createSelectColumn } from "@/shared/components/data-display/table/create-select-column"
import { SortableHeader } from "@/shared/components"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

// Name cell component with navigation
function NameCell({ name, id }: { name: string; id: number }) {
    const navigate = useNavigate()
    
    return (
        <button
            onClick={() => navigate(`${quanHuyenTSNConfig.routePath}/${id}`)}
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
                    navigate(`${quanHuyenTSNConfig.routePath}/${id}/sua?returnTo=list`)
                }}
            >
                <span className="sr-only">Edit</span>
                <Edit className="h-4 w-4" />
            </Button>
            <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                <DeleteQuanHuyenTSNButton id={id} name={name} iconOnly />
            </div>
        </div>
    )
}

export const quanHuyenTSNColumns = (): ColumnDef<QuanHuyenTSN>[] => [
    createSelectColumn<QuanHuyenTSN>(),
    // Virtual column for filtering (combines ma_tinh_thanh and ten_tinh_thanh)
    {
        id: "tinh_thanh",
        accessorFn: (row) => {
            const ma = row.ma_tinh_thanh || ""
            const ten = row.ten_tinh_thanh || ""
            return `${ma} - ${ten}`.trim()
        },
        header: ({ column }) => <SortableHeader column={column} title="Tỉnh Thành" />,
        cell: ({ row }) => {
            const quanHuyen = row.original
            const ma = quanHuyen.ma_tinh_thanh || ""
            const ten = quanHuyen.ten_tinh_thanh || ""
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
    {
        accessorKey: "ma_tinh_thanh",
        header: ({ column }) => <SortableHeader column={column} title="Mã Tỉnh Thành" />,
        cell: ({ row }) => {
            const quanHuyen = row.original
            return (
                <div className="min-w-[120px] font-mono text-sm">
                    {quanHuyen.ma_tinh_thanh}
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
            const quanHuyen = row.original
            return (
                <div className="min-w-[200px]">
                    {quanHuyen.ten_tinh_thanh}
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
            const quanHuyen = row.original
            return (
                <div className="min-w-[120px] font-mono text-sm">
                    {quanHuyen.ma_quan_huyen}
                </div>
            )
        },
        size: 150,
        minSize: 120,
        meta: {
            title: "Mã Quận Huyện",
            order: 3,
        },
    },
    {
        accessorKey: "ten_quan_huyen",
        header: ({ column }) => <SortableHeader column={column} title="Tên Quận Huyện" />,
        cell: ({ row }) => {
            const quanHuyen = row.original
            return (
                <NameCell 
                    name={quanHuyen.ten_quan_huyen} 
                    id={quanHuyen.id!} 
                />
            )
        },
        size: 250,
        minSize: 200,
        meta: {
            title: "Tên Quận Huyện",
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
            const quanHuyen = row.original
            return (
                <ActionsCell 
                    id={quanHuyen.id!} 
                    name={quanHuyen.ten_quan_huyen} 
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

