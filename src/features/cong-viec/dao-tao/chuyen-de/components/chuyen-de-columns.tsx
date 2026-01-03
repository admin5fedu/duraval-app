"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { ChuyenDe } from "../schema"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { DeleteChuyenDeButton } from "./delete-chuyen-de-button"
import { chuyenDeConfig } from "../config"
import { createSelectColumn } from "@/shared/components/data-display/table/create-select-column"
import { SortableHeader } from "@/shared/components"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

// Name cell component with navigation
function NameCell({ name, id }: { name: string; id: number }) {
    const navigate = useNavigate()
    
    return (
        <button
            onClick={() => navigate(`${chuyenDeConfig.routePath}/${id}`)}
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
                    navigate(`${chuyenDeConfig.routePath}/${id}/sua?returnTo=list`)
                }}
            >
                <span className="sr-only">Edit</span>
                <Edit className="h-4 w-4" />
            </Button>
            <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                <DeleteChuyenDeButton id={id} name={name} iconOnly />
            </div>
        </div>
    )
}

export const chuyenDeColumns = (): ColumnDef<ChuyenDe>[] => [
    createSelectColumn<ChuyenDe>(),
    {
        accessorKey: "ten_nhom_chuyen_de",
        header: ({ column }) => <SortableHeader column={column} title="Nhóm Chuyên Đề" />,
        cell: ({ row }) => {
            const tenNhom = row.getValue("ten_nhom_chuyen_de") as string | null | undefined
            return (
                <div className="min-w-[200px]">
                    {tenNhom || "-"}
                </div>
            )
        },
        size: 200,
        minSize: 180,
        meta: {
            title: "Nhóm Chuyên Đề",
            order: 1,
        },
    },
    {
        accessorKey: "ten_chuyen_de",
        header: ({ column }) => <SortableHeader column={column} title="Tên Chuyên Đề" />,
        cell: ({ row }) => {
            const chuyenDe = row.original
            return (
                <NameCell 
                    name={chuyenDe.ten_chuyen_de} 
                    id={chuyenDe.id!} 
                />
            )
        },
        size: 300,
        minSize: 250,
        meta: {
            title: "Tên Chuyên Đề",
            order: 2,
        },
    },
    {
        accessorKey: "mo_ta",
        header: ({ column }) => <SortableHeader column={column} title="Mô Tả" />,
        cell: ({ row }) => {
            const moTa = row.getValue("mo_ta") as string | null | undefined
            return (
                <div className="min-w-[200px] max-w-[400px] truncate" title={moTa || undefined}>
                    {moTa || "-"}
                </div>
            )
        },
        size: 300,
        minSize: 200,
        meta: {
            title: "Mô Tả",
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
        accessorKey: "tg_cap_nhat",
        header: ({ column }) => <SortableHeader column={column} title="Thời Gian Cập Nhật" />,
        cell: ({ row }) => {
            const tgCapNhat = row.getValue("tg_cap_nhat") as string | null | undefined
            if (!tgCapNhat) return <div className="text-muted-foreground">-</div>
            try {
                return (
                    <div className="min-w-[150px]">
                        {format(new Date(tgCapNhat), "dd/MM/yyyy HH:mm", { locale: vi })}
                    </div>
                )
            } catch {
                return <div className="text-muted-foreground">-</div>
            }
        },
        size: 180,
        minSize: 150,
        meta: {
            title: "Thời Gian Cập Nhật",
            order: 5,
        },
    },
    {
        id: "actions",
        header: () => <div className="text-right pr-4">Thao Tác</div>,
        cell: ({ row }) => {
            const chuyenDe = row.original
            return (
                <ActionsCell 
                    id={chuyenDe.id!} 
                    name={chuyenDe.ten_chuyen_de} 
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

