"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { DanhMucTaiLieu } from "../schema"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, FolderPlus } from "lucide-react"
import { DeleteDanhMucTaiLieuButton } from "./delete-danh-muc-tai-lieu-button"
import { danhMucTaiLieuConfig } from "../config"
import { createSelectColumn } from "@/shared/components/data-display/table/create-select-column"
import { SortableHeader } from "@/shared/components"
import { cn } from "@/lib/utils"

// Hang muc cell component with navigation
function HangMucCell({ hangMuc, id, badgeClass }: { hangMuc: string; id: number; badgeClass: string }) {
    const navigate = useNavigate()
    
    return (
        <button
            onClick={() => navigate(`${danhMucTaiLieuConfig.routePath}/${id}`)}
            className="font-medium hover:underline"
        >
            <Badge variant="outline" className={badgeClass}>
                {hangMuc}
            </Badge>
        </button>
    )
}

// Actions cell component
function ActionsCell({ row }: { row: DanhMucTaiLieu }) {
    const navigate = useNavigate()
    const id = row.id!
    const name = row.ten_danh_muc
    const cap = row.cap
    const hangMuc = row.hang_muc
    const loaiId = row.loai_id
    
    const displayName = name || `ID: ${id}`
    const isCap1 = cap === 1
    
    return (
        <div className="flex items-center gap-2 justify-end pr-4 min-w-[140px]">
            {isCap1 && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-primary shrink-0"
                    onClick={(e) => {
                        e.stopPropagation()
                        // Navigate to create form with pre-filled parent info
                        const params = new URLSearchParams({
                            danh_muc_cha_id: String(id),
                            hang_muc: hangMuc || "",
                            loai_id: String(loaiId || ""),
                            returnTo: "list"
                        })
                        navigate(`${danhMucTaiLieuConfig.routePath}/moi?${params.toString()}`)
                    }}
                    title="Thêm danh mục con"
                >
                    <span className="sr-only">Thêm danh mục con</span>
                    <FolderPlus className="h-4 w-4" />
                </Button>
            )}
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:text-blue-600 shrink-0"
                onClick={(e) => {
                    e.stopPropagation()
                    navigate(`${danhMucTaiLieuConfig.routePath}/${id}/sua?returnTo=list`)
                }}
                title="Sửa"
            >
                <span className="sr-only">Edit</span>
                <Edit className="h-4 w-4" />
            </Button>
            <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                <DeleteDanhMucTaiLieuButton id={id} name={displayName} iconOnly cap={cap} />
            </div>
        </div>
    )
}

export const danhMucTaiLieuColumns: ColumnDef<DanhMucTaiLieu>[] = [
    // ⚡ Professional: Use generic select column utility
    createSelectColumn<DanhMucTaiLieu>(),
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
        accessorKey: "ten_danh_muc",
        header: ({ column }) => <SortableHeader column={column} title="Tên Danh Mục" />,
        size: 250,
        minSize: 200,
        meta: {
            title: "Tên danh mục",
            order: 2,
            minWidth: 200
        },
        cell: ({ row }) => {
            const tenDanhMuc = row.getValue("ten_danh_muc") as string | null
            const id = row.original.id
            const cap = row.original.cap
            const navigate = useNavigate()
            const isCap2 = cap === 2
            const isCap1 = cap === 1

            if (!id) {
                return <span className="font-medium">{tenDanhMuc || "-"}</span>
            }

            return (
                <div className={cn("min-w-[200px]", isCap2 && "flex items-center")}>
                    {isCap2 && (
                        <div className="flex-shrink-0 w-8 h-full relative flex items-center py-2">
                            {/* Vertical line - extends from top to bottom of row */}
                            <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-primary/40" />
                            {/* Horizontal line - connects to vertical line */}
                            <div className="absolute left-4 top-1/2 w-4 h-[2px] bg-primary/40 -translate-y-1/2" />
                        </div>
                    )}
                    <button
                        onClick={() => navigate(`${danhMucTaiLieuConfig.routePath}/${id}`)}
                        className={cn(
                            "hover:underline truncate text-left",
                            isCap2 ? "flex-1" : "w-full",
                            // Format rules: Cấp 1 = đậm + primary, Cấp 2 = nghiêng + màu nhạt
                            isCap1 && "font-bold text-primary",
                            isCap2 && "italic text-muted-foreground"
                        )}
                    >
                        {tenDanhMuc || "-"}
                    </button>
                </div>
            )
        }
    },
    {
        accessorKey: "loai_tai_lieu",
        header: ({ column }) => <SortableHeader column={column} title="Loại Tài Liệu" />,
        size: 200,
        minSize: 150,
        meta: {
            title: "Loại tài liệu",
            order: 3,
            minWidth: 150
        },
        cell: ({ row }) => {
            const loaiTaiLieu = row.getValue("loai_tai_lieu") as string | null
            return <div className="min-w-[150px]">{loaiTaiLieu || "-"}</div>
        }
    },
    {
        accessorKey: "cap",
        header: ({ column }) => <SortableHeader column={column} title="Cấp" />,
        size: 100,
        minSize: 80,
        filterFn: (row, id, value) => {
            if (!value || !Array.isArray(value) || value.length === 0) {
                return true
            }
            const cap = row.getValue(id) as number | null
            if (cap === null || cap === undefined) return false
            return value.includes(cap.toString())
        },
        meta: {
            title: "Cấp",
            order: 4,
            minWidth: 80
        },
        cell: ({ row }) => {
            const cap = row.getValue("cap") as number | null
            if (cap === null || cap === undefined) {
                return <div className="min-w-[80px]">-</div>
            }
            
            // Badge color mapping for cap
            const badgeColorMap: Record<number, string> = {
                1: "bg-green-50 text-green-700 border-green-200",
                2: "bg-orange-50 text-orange-700 border-orange-200",
            }
            const badgeClass = badgeColorMap[cap] || "bg-gray-50 text-gray-700 border-gray-200"
            
            return (
                <div className="min-w-[80px]">
                    <Badge variant="outline" className={badgeClass}>
                        Cấp {cap}
                    </Badge>
                </div>
            )
        }
    },
    {
        accessorKey: "ten_danh_muc_cha",
        header: ({ column }) => <SortableHeader column={column} title="Danh Mục Cha" />,
        size: 200,
        minSize: 150,
        meta: {
            title: "Danh mục cha",
            order: 5,
            minWidth: 150
        },
        cell: ({ row }) => {
            const tenDanhMucCha = row.getValue("ten_danh_muc_cha") as string | null
            const danhMucChaId = row.original.danh_muc_cha_id
            const navigate = useNavigate()

            if (!tenDanhMucCha) {
                return <div className="min-w-[150px]">-</div>
            }

            if (danhMucChaId) {
                return (
                    <div className="min-w-[150px]">
                        <button
                            onClick={() => navigate(`${danhMucTaiLieuConfig.routePath}/${danhMucChaId}`)}
                            className="font-medium hover:underline truncate text-left w-full text-blue-600"
                        >
                            {tenDanhMucCha}
                        </button>
                    </div>
                )
            }

            return <div className="min-w-[150px]">{tenDanhMucCha}</div>
        }
    },
    {
        accessorKey: "mo_ta",
        header: ({ column }) => <SortableHeader column={column} title="Mô Tả" />,
        size: 300,
        minSize: 200,
        meta: {
            title: "Mô tả",
            order: 6,
            minWidth: 200
        },
        cell: ({ row }) => {
            const moTa = row.getValue("mo_ta") as string | null
            return <div className="min-w-[200px]">{moTa || "-"}</div>
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
            order: 7,
            minWidth: 150
        },
        cell: ({ row }) => {
            const nguoiTaoTen = row.original.nguoi_tao_ten
            const nguoiTaoId = row.getValue("nguoi_tao_id") as number | null
            
            if (!nguoiTaoId) {
                return <div className="min-w-[150px]">-</div>
            }
            
            // Format: mã - tên
            if (nguoiTaoTen) {
                return (
                    <div className="min-w-[150px]">
                        {nguoiTaoId} - {nguoiTaoTen}
                    </div>
                )
            }
            
            return (
                <div className="min-w-[150px]">
                    {nguoiTaoId}
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
            order: 8,
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
            const danhMucTaiLieu = row.original
            const id = danhMucTaiLieu.id
            if (!id) return null

            return <ActionsCell row={danhMucTaiLieu} />
        },
        enableSorting: false,
        enableHiding: false,
        size: 150,
        minSize: 140,
        meta: {
            title: "Thao tác",
            stickyRight: true,
            minWidth: 140
        }
    }
]

