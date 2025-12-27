"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { ChiNhanh } from "../schema"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { DeleteChiNhanhButton } from "./delete-chi-nhanh-button"
import { chiNhanhConfig } from "../config"
import { createSelectColumn } from "@/shared/components/data-display/table/create-select-column"
import { SortableHeader } from "@/shared/components"

// Name cell component with navigation
function NameCell({ name, id }: { name: string; id: number }) {
    const navigate = useNavigate()
    
    return (
        <button
            onClick={() => navigate(`${chiNhanhConfig.routePath}/${id}`)}
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
                    navigate(`${chiNhanhConfig.routePath}/${id}/sua`)
                }}
            >
                <span className="sr-only">Edit</span>
                <Edit className="h-4 w-4" />
            </Button>
            <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                <DeleteChiNhanhButton id={id} name={name} iconOnly />
            </div>
        </div>
    )
}

export const chiNhanhColumns = (): ColumnDef<ChiNhanh>[] => [
    // ⚡ Professional: Use generic select column utility
    createSelectColumn<ChiNhanh>(),
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
        accessorKey: "ma_chi_nhanh",
        header: ({ column }) => <SortableHeader column={column} title="Mã Chi Nhánh" />,
        size: 150,
        minSize: 120,
        meta: {
            title: "Mã Chi Nhánh",
            order: 2,
            stickyLeft: true,
            stickyLeftOffset: 110, // After checkbox (40) + id (70)
            minWidth: 120,
        },
        cell: ({ row }) => {
            const maChiNhanh = row.getValue("ma_chi_nhanh") as string
            const id = row.original.id!
            return (
                <NameCell name={maChiNhanh} id={id} />
            )
        },
    },
    {
        accessorKey: "ten_chi_nhanh",
        header: ({ column }) => <SortableHeader column={column} title="Tên Chi Nhánh" />,
        size: 200,
        minSize: 180,
        meta: {
            title: "Tên Chi Nhánh",
            order: 3,
            minWidth: 180,
        },
    },
    {
        accessorKey: "dia_chi",
        header: ({ column }) => <SortableHeader column={column} title="Địa Chỉ" />,
        size: 250,
        minSize: 200,
        meta: {
            title: "Địa Chỉ",
            order: 4,
            minWidth: 200,
        },
        cell: ({ row }) => {
            const diaChi = row.getValue("dia_chi") as string | null
            return diaChi || <span className="text-muted-foreground">-</span>
        },
    },
    {
        accessorKey: "dinh_vi",
        header: ({ column }) => <SortableHeader column={column} title="Định Vị" />,
        size: 200,
        minSize: 180,
        meta: {
            title: "Định Vị",
            order: 5,
            minWidth: 180,
        },
        cell: ({ row }) => {
            const dinhVi = row.getValue("dinh_vi") as string | null
            if (!dinhVi) return <span className="text-muted-foreground">-</span>
            return (
                <a href={dinhVi.startsWith('http') ? dinhVi : `https://${dinhVi}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Xem vị trí
                </a>
            )
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
            order: 6,
            minWidth: 140,
        },
    },
    {
        id: "actions",
        header: () => <div className="text-right pr-4">Thao tác</div>,
        cell: ({ row }) => {
            return (
                <ActionsCell
                    id={row.original.id!}
                    name={row.original.ten_chi_nhanh}
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

