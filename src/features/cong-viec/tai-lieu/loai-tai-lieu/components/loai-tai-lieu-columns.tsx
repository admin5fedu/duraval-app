"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { LoaiTaiLieu } from "../schema"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit } from "lucide-react"
import { DeleteLoaiTaiLieuButton } from "./delete-loai-tai-lieu-button"
import { loaiTaiLieuConfig } from "../config"
import { createSelectColumn } from "@/shared/components/data-display/table/create-select-column"
import { SortableHeader } from "@/shared/components"

// Hang muc cell component with navigation
function HangMucCell({ hangMuc, id, badgeClass }: { hangMuc: string; id: number; badgeClass: string }) {
    const navigate = useNavigate()
    
    return (
        <button
            onClick={() => navigate(`${loaiTaiLieuConfig.routePath}/${id}`)}
            className="font-medium hover:underline"
        >
            <Badge variant="outline" className={badgeClass}>
                {hangMuc}
            </Badge>
        </button>
    )
}

// Actions cell component
function ActionsCell({ id, name }: { id: number; name: string | null }) {
    const navigate = useNavigate()
    
    const displayName = name || `ID: ${id}`
    
    return (
        <div className="flex items-center gap-2 justify-end pr-4 min-w-[100px]">
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:text-blue-600 shrink-0"
                onClick={(e) => {
                    e.stopPropagation()
                    navigate(`${loaiTaiLieuConfig.routePath}/${id}/sua?returnTo=list`)
                }}
            >
                <span className="sr-only">Edit</span>
                <Edit className="h-4 w-4" />
            </Button>
            <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                <DeleteLoaiTaiLieuButton id={id} name={displayName} iconOnly />
            </div>
        </div>
    )
}

export const loaiTaiLieuColumns: ColumnDef<LoaiTaiLieu>[] = [
    // ⚡ Professional: Use generic select column utility
    createSelectColumn<LoaiTaiLieu>(),
    {
        accessorKey: "hang_muc",
        header: ({ column }) => <SortableHeader column={column} title="Hạng Mục" />,
        size: 250,
        minSize: 200,
        filterFn: (row, id, value) => {
            if (!value || !Array.isArray(value) || value.length === 0) {
                return true
            }
            const hangMuc = row.getValue(id) as string | null
            if (!hangMuc) return false
            return value.includes(hangMuc)
        },
        meta: {
            title: "Hạng mục",
            order: 1,
            stickyLeft: true,
            stickyLeftOffset: 40, // After checkbox column
            minWidth: 200
        },
        cell: ({ row }) => {
            const hangMuc = row.getValue("hang_muc") as string | null
            const id = row.original.id

            if (!hangMuc) {
                return <div className="min-w-[200px]">-</div>
            }

            // Badge color mapping
            const badgeColorMap: Record<string, string> = {
                "Biểu mẫu & Kế hoạch": "bg-blue-50 text-blue-700 border-blue-200",
                "Văn bản hệ thống": "bg-purple-50 text-purple-700 border-purple-200",
            }
            const badgeClass = badgeColorMap[hangMuc] || "bg-gray-50 text-gray-700 border-gray-200"

            if (!id) {
                return (
                    <div className="min-w-[200px]">
                        <Badge variant="outline" className={badgeClass}>
                            {hangMuc}
                        </Badge>
                    </div>
                )
            }

            return (
                <div className="min-w-[200px]">
                    <HangMucCell hangMuc={hangMuc} id={id} badgeClass={badgeClass} />
                </div>
            )
        }
    },
    {
        accessorKey: "loai",
        header: ({ column }) => <SortableHeader column={column} title="Loại" />,
        size: 250,
        minSize: 200,
        meta: {
            title: "Loại",
            order: 2,
            minWidth: 200
        },
        cell: ({ row }) => {
            const loai = row.getValue("loai") as string | null
            return <div className="min-w-[200px]">{loai || "-"}</div>
        }
    },
    {
        accessorKey: "mo_ta",
        header: ({ column }) => <SortableHeader column={column} title="Mô Tả" />,
        size: 400,
        minSize: 300,
        meta: {
            title: "Mô tả",
            order: 3,
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
            order: 4,
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
            order: 5,
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
            const loaiTaiLieu = row.original
            const id = loaiTaiLieu.id
            if (!id) return null

            return (
                <ActionsCell
                    id={id}
                    name={loaiTaiLieu.hang_muc || loaiTaiLieu.loai}
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

