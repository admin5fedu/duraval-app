"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { CapBac } from "../schema"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { DeleteCapBacButton } from "./delete-cap-bac-button"
import { capBacConfig } from "../config"
import { createSelectColumn } from "@/shared/components/data-display/table/create-select-column"
import { SortableHeader } from "@/shared/components"
import { Badge } from "@/components/ui/badge"
import { getEnumBadgeClass } from "@/shared/utils/enum-color-registry"

// Name cell component with navigation
function NameCell({ name, id }: { name: string; id: number }) {
    const navigate = useNavigate()

    return (
        <button
            onClick={() => navigate(`${capBacConfig.routePath}/${id}`)}
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
                    navigate(`${capBacConfig.routePath}/${id}/sua`)
                }}
            >
                <span className="sr-only">Edit</span>
                <Edit className="h-4 w-4" />
            </Button>
            <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                <DeleteCapBacButton id={id} name={name} iconOnly />
            </div>
        </div>
    )
}

export const capBacColumns: ColumnDef<CapBac>[] = [
    // ⚡ Professional: Use generic select column utility
    createSelectColumn<CapBac>(),
    {
        accessorKey: "ten_cap_bac",
        header: ({ column }) => <SortableHeader column={column} title="Tên Cấp Bậc" />,
        size: 250,
        minSize: 200,
        meta: {
            title: "Tên Cấp Bậc",
            order: 1,
            stickyLeft: true,
            stickyLeftOffset: 40, // After checkbox column
            minWidth: 200,
        },
        cell: ({ row }) => {
            const tenCapBac = row.getValue("ten_cap_bac") as string
            const id = row.original.id!
            return <NameCell name={tenCapBac} id={id} />
        },
    },
    {
        accessorKey: "cap_bac",
        header: ({ column }) => <SortableHeader column={column} title="Cấp Bậc" />,
        size: 100,
        minSize: 80,
        filterFn: (row, id, value) => {
            const capBac = row.getValue(id) as number | null
            if (!capBac) {
                return value.includes("null") || value.includes("")
            }
            return value.includes(String(capBac))
        },
        cell: ({ row }) => {
            const capBac = row.getValue("cap_bac") as number | null
            if (!capBac) return <span className="text-muted-foreground">-</span>
            const colorClass = getEnumBadgeClass("cap_bac", capBac)
            return (
                <Badge variant="outline" className={`min-w-[60px] justify-center ${colorClass}`}>
                    {capBac}
                </Badge>
            )
        },
        meta: {
            title: "Cấp Bậc",
            order: 2,
            minWidth: 80,
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
            order: 3,
            minWidth: 140,
        },
    },
    {
        id: "actions",
        header: () => <div className="text-right pr-4">Thao tác</div>,
        cell: ({ row }) => {
            const capBac = row.original
            return (
                <ActionsCell
                    id={capBac.id!}
                    name={capBac.ten_cap_bac}
                />
            )
        },
        enableSorting: false,
        enableHiding: false,
        size: 120,
        minSize: 100,
        meta: {
            title: "Thao tác",
            order: 99,
            minWidth: 100,
        },
    },
]

