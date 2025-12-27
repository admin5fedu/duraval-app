"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { PhongBan } from "../schema"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { DeletePhongBanButton } from "./delete-phong-ban-button"
import { phongBanConfig } from "../config"
import { createSelectColumn } from "@/shared/components/data-display/table/create-select-column"
import { SortableHeader } from "@/shared/components"
import { Badge } from "@/components/ui/badge"
import { getEnumBadgeClass } from "@/shared/utils/enum-color-registry"

// Name cell component with navigation
function NameCell({ name, id }: { name: string; id: number }) {
    const navigate = useNavigate()
    
    return (
        <button
            onClick={() => navigate(`${phongBanConfig.routePath}/${id}`)}
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
                    navigate(`${phongBanConfig.routePath}/${id}/sua`)
                }}
            >
                <span className="sr-only">Edit</span>
                <Edit className="h-4 w-4" />
            </Button>
            <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                <DeletePhongBanButton id={id} name={name} iconOnly />
            </div>
        </div>
    )
}

export const phongBanColumns = (phongBanList: PhongBan[] = []): ColumnDef<PhongBan>[] => [
    // ⚡ Professional: Use generic select column utility
    createSelectColumn<PhongBan>(),
    {
        accessorKey: "tt",
        header: ({ column }) => <SortableHeader column={column} title="TT" />,
        cell: ({ row }) => {
            const tt = row.getValue("tt") as number | null | undefined
            return <div className="min-w-[60px] text-center">{tt ?? "-"}</div>
        },
        size: 70,
        minSize: 60,
        meta: {
            title: "TT",
            order: 1,
            stickyLeft: true,
            stickyLeftOffset: 40, // After checkbox column
            minWidth: 60,
        },
    },
    {
        accessorKey: "ma_phong_ban",
        header: ({ column }) => <SortableHeader column={column} title="Mã Phòng Ban" />,
        size: 150,
        minSize: 120,
        meta: {
            title: "Mã Phòng Ban",
            order: 2,
            stickyLeft: true,
            stickyLeftOffset: 100, // After checkbox (40) + tt (60)
            minWidth: 120,
        },
        cell: ({ row }) => {
            const maPhongBan = row.getValue("ma_phong_ban") as string
            const id = row.original.id!
            return (
                <NameCell name={maPhongBan} id={id} />
            )
        },
    },
    {
        accessorKey: "ten_phong_ban",
        header: ({ column }) => <SortableHeader column={column} title="Tên Phòng Ban" />,
        size: 200,
        minSize: 180,
        meta: {
            title: "Tên Phòng Ban",
            order: 3,
            minWidth: 180,
        },
    },
    {
        accessorKey: "cap_do",
        header: ({ column }) => <SortableHeader column={column} title="Cấp Độ" />,
        size: 120,
        minSize: 100,
        filterFn: (row, id, value) => {
            const capDo = row.getValue(id) as string | null
            return value.includes(capDo || "")
        },
        cell: ({ row }) => {
            const capDo = row.getValue("cap_do") as string | null
            if (!capDo) return <span className="text-muted-foreground">-</span>
            const colorClass = getEnumBadgeClass("cap_do", capDo)
            return (
                <Badge variant="outline" className={`min-w-[80px] justify-center ${colorClass}`}>
                    {capDo}
                </Badge>
            )
        },
        meta: {
            title: "Cấp Độ",
            order: 4,
            minWidth: 100,
        },
    },
    {
        accessorKey: "truc_thuoc_id",
        header: ({ column }) => <SortableHeader column={column} title="Trực Thuộc Phòng Ban" />,
        size: 250,
        minSize: 200,
        filterFn: (row, id, value) => {
            const trucThuocId = row.getValue(id) as number | null | undefined
            if (!trucThuocId) {
                return value.includes("null") || value.includes("")
            }
            return value.includes(String(trucThuocId))
        },
        meta: {
            title: "Trực Thuộc Phòng Ban",
            order: 5,
            minWidth: 200,
        },
        cell: ({ row }) => {
            const trucThuocId = row.getValue("truc_thuoc_id") as number | null | undefined
            if (!trucThuocId) {
                return <span className="text-muted-foreground">-</span>
            }
            
            // Map truc_thuoc_id với phòng ban trong list
            const trucThuocPhongBan = phongBanList.find((pb) => pb.id === trucThuocId)
            
            if (trucThuocPhongBan) {
                return (
                    <span className="truncate">
                        {trucThuocPhongBan.ma_phong_ban} - {trucThuocPhongBan.ten_phong_ban}
                    </span>
                )
            }
            
            return <span className="text-muted-foreground">-</span>
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
                    name={row.original.ten_phong_ban}
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

