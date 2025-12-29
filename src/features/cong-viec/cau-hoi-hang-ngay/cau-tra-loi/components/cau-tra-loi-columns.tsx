"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { CauTraLoi } from "../schema"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { DeleteCauTraLoiButton } from "./delete-cau-tra-loi-button"
import { Badge } from "@/components/ui/badge"
import { createSelectColumn } from "@/shared/components/data-display/table/create-select-column"
import { SortableHeader } from "@/shared/components"
import { cauTraLoiConfig } from "../config"
import { getResultBadgeClass } from "@/components/ui/status-badge"

// Actions cell component
function ActionsCell({ 
    id
}: { 
    id: number
}) {
    const navigate = useNavigate()

    return (
        <div className="flex items-center gap-2 justify-end pr-4 min-w-[100px]">
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:text-blue-600 shrink-0"
                onClick={(e) => {
                    e.stopPropagation()
                    navigate(`${cauTraLoiConfig.routePath}/${id}/sua?returnTo=list`)
                }}
            >
                <span className="sr-only">Edit</span>
                <Edit className="h-4 w-4" />
            </Button>
            <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                <DeleteCauTraLoiButton 
                    id={id} 
                    name={`Câu trả lời #${id}`}
                    iconOnly 
                />
            </div>
        </div>
    )
}

// Function to create columns
export function createColumns(): ColumnDef<CauTraLoi>[] {
    return [
    // ⚡ Professional: Use generic select column utility
    createSelectColumn<CauTraLoi>(),
    {
        accessorKey: "id",
        header: ({ column }) => <SortableHeader column={column} title="ID" />,
        size: 80,
        minSize: 80,
        meta: {
            title: "ID",
            order: 1,
            minWidth: 80
        }
    },
    {
        accessorKey: "lich_dang_cau_hoi",
        header: ({ column }) => <SortableHeader column={column} title="Lịch Đăng" />,
        size: 300,
        minSize: 200,
        meta: {
            title: "Lịch đăng",
            order: 2,
            minWidth: 200
        },
        cell: ({ row }) => {
            const cauHoi = row.getValue("lich_dang_cau_hoi") as string | null
            if (!cauHoi) {
                return <div className="min-w-[200px] text-muted-foreground">-</div>
            }
            return (
                <div className="min-w-[200px]">
                    <span className="line-clamp-2">{cauHoi}</span>
                </div>
            )
        },
        filterFn: (row, id, value) => {
            const cellValue = row.getValue(id) as string | null
            if (!value || !Array.isArray(value) || value.length === 0) return true
            if (!cellValue) return false
            const lowerCellValue = cellValue.toLowerCase()
            return value.some((filterValue: string) => 
                lowerCellValue.includes(filterValue.toLowerCase())
            )
        }
    },
    {
        accessorKey: "cau_tra_loi",
        header: ({ column }) => <SortableHeader column={column} title="Câu Trả Lời" />,
        size: 300,
        minSize: 200,
        meta: {
            title: "Câu trả lời",
            order: 3,
            minWidth: 200
        },
        cell: ({ row }) => {
            const cauTraLoi = row.getValue("cau_tra_loi") as string
            return (
                <div className="min-w-[200px] line-clamp-2">
                    {cauTraLoi || "-"}
                </div>
            )
        }
    },
    {
        accessorKey: "ket_qua",
        header: ({ column }) => <SortableHeader column={column} title="Kết Quả" />,
        size: 150,
        minSize: 120,
        meta: {
            title: "Kết quả",
            order: 4,
            minWidth: 120
        },
        cell: ({ row }) => {
            const ketQua = row.getValue("ket_qua") as string
            const className = getResultBadgeClass(ketQua)
            return (
                <div className="min-w-[120px]">
                    <Badge variant="outline" className={className}>
                        {ketQua || "-"}
                    </Badge>
                </div>
            )
        },
        filterFn: (row, id, value) => {
            const cellValue = row.getValue(id) as string | null
            if (!value || !Array.isArray(value) || value.length === 0) return true
            if (!cellValue) return false
            const lowerCellValue = cellValue.toLowerCase()
            return value.some((filterValue: string) => 
                lowerCellValue.includes(filterValue.toLowerCase())
            )
        }
    },
    {
        accessorKey: "nguoi_tao_ten",
        header: ({ column }) => <SortableHeader column={column} title="Người Tạo" />,
        size: 200,
        minSize: 150,
        meta: {
            title: "Người tạo",
            order: 5,
            minWidth: 150
        },
        cell: ({ row }) => {
            const nguoiTaoTen = row.getValue("nguoi_tao_ten") as string | null
            const nguoiTaoId = row.original.nguoi_tao_id
            if (!nguoiTaoId) return <div className="min-w-[150px]">-</div>
            const displayText = nguoiTaoTen 
                ? `${nguoiTaoId} - ${nguoiTaoTen}`
                : String(nguoiTaoId)
            return <div className="min-w-[150px]">{displayText}</div>
        },
        filterFn: (row, id, value) => {
            const nguoiTaoTen = row.getValue(id) as string | null
            const nguoiTaoId = row.original.nguoi_tao_id
            if (!value || !Array.isArray(value) || value.length === 0) return true
            if (!nguoiTaoId) return false
            // Format cell value to match filter options: "id - ten"
            const cellValue = nguoiTaoTen ? `${nguoiTaoId} - ${nguoiTaoTen}` : String(nguoiTaoId)
            return value.includes(cellValue)
        }
    },
    {
        accessorKey: "tg_tao",
        header: ({ column }) => <SortableHeader column={column} title="Thời Gian Tạo" />,
        size: 180,
        minSize: 150,
        meta: {
            title: "Thời gian tạo",
            order: 6,
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
            const id = row.original.id
            if (!id) return null

            return <ActionsCell id={id} />
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
]}

