"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { DanhMucCauHoi } from "../schema"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { DeleteDanhMucCauHoiButton } from "./delete-danh-muc-cau-hoi-button"
import { danhMucCauHoiConfig } from "../config"
import { createSelectColumn } from "@/shared/components/data-display/table/create-select-column"
import { SortableHeader } from "@/shared/components"

// Name cell component with navigation
function NameCell({ name, id }: { name: string; id: number }) {
    const navigate = useNavigate()
    
    return (
        <button
            onClick={() => navigate(`${danhMucCauHoiConfig.routePath}/${id}`)}
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
                    navigate(`${danhMucCauHoiConfig.routePath}/${id}/sua?returnTo=list`)
                }}
            >
                <span className="sr-only">Edit</span>
                <Edit className="h-4 w-4" />
            </Button>
            <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                <DeleteDanhMucCauHoiButton id={id} name={name} iconOnly />
            </div>
        </div>
    )
}

export const danhMucCauHoiColumns: ColumnDef<DanhMucCauHoi>[] = [
    // ⚡ Professional: Use generic select column utility
    createSelectColumn<DanhMucCauHoi>(),
    {
        accessorKey: "ten_nhom",
        header: ({ column }) => <SortableHeader column={column} title="Tên Nhóm" />,
        size: 300,
        minSize: 250,
        meta: {
            title: "Tên nhóm",
            order: 1,
            stickyLeft: true,
            stickyLeftOffset: 40, // After checkbox column
            minWidth: 250
        },
        cell: ({ row }) => {
            const name = row.getValue("ten_nhom") as string
            const id = row.original.id

            if (!id) {
                return <span className="font-medium">{name}</span>
            }

            return (
                <div className="min-w-[250px]">
                    <NameCell name={name} id={id} />
                </div>
            )
        }
    },
    {
        accessorKey: "mo_ta",
        header: ({ column }) => <SortableHeader column={column} title="Mô Tả" />,
        size: 400,
        minSize: 300,
        meta: {
            title: "Mô tả",
            order: 2,
            minWidth: 300
        },
        cell: ({ row }) => {
            const moTa = row.getValue("mo_ta") as string | null
            return <div className="min-w-[300px]">{moTa || "-"}</div>
        }
    },
    {
        accessorKey: "nguoi_tao_id",
        header: ({ column }) => <SortableHeader column={column} title="Người Tạo" />,
        size: 200,
        minSize: 150,
        filterFn: (row, id, value) => {
            const nguoiTaoId = row.getValue(id) as number | null
            if (!nguoiTaoId) {
                return value.includes("null") || value.includes("")
            }
            return value.includes(String(nguoiTaoId))
        },
        meta: {
            title: "Người tạo",
            order: 3,
            minWidth: 150
        },
        cell: ({ row }) => {
            const nguoiTaoTen = row.original.nguoi_tao_ten
            const nguoiTaoId = row.getValue("nguoi_tao_id") as number | null
            return (
                <div className="min-w-[150px]">
                    {nguoiTaoTen 
                        ? `${nguoiTaoId} - ${nguoiTaoTen}`
                        : nguoiTaoId?.toString() || "-"
                    }
                </div>
            )
        }
    },
    {
        accessorKey: "tg_tao",
        header: ({ column }) => <SortableHeader column={column} title="Thời Gian Tạo" />,
        size: 180,
        minSize: 150,
        meta: {
            title: "Thời gian tạo",
            order: 4,
            minWidth: 150
        },
        cell: ({ row }) => {
            const tgTao = row.getValue("tg_tao") as string | null
            if (!tgTao) return <div className="min-w-[150px]">-</div>
            const date = new Date(tgTao)
            return (
                <div className="min-w-[150px]">
                    {date.toLocaleString("vi-VN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </div>
            )
        }
    },
    {
        id: "actions",
        header: () => <div className="text-right pr-4">Thao tác</div>,
        cell: ({ row }) => {
            const danhMucCauHoi = row.original
            const id = danhMucCauHoi.id
            if (!id) return null

            return (
                <ActionsCell
                    id={id}
                    name={danhMucCauHoi.ten_nhom}
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
            minWidth: 100
        }
    }
]

