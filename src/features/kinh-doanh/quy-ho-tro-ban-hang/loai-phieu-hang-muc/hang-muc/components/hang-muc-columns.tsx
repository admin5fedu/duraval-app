"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { HangMuc } from "../schema"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit } from "lucide-react"
import { DeleteHangMucButton } from "./delete-hang-muc-button"
import { hangMucConfig } from "../config"
import { createSelectColumn } from "@/shared/components/data-display/table/create-select-column"
import { SortableHeader } from "@/shared/components"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

// Color palette for loại phiếu badges - each loại phiếu gets a unique color
const LOAI_PHIEU_COLORS = [
    "bg-blue-50 text-blue-700 border-blue-200",
    "bg-indigo-50 text-indigo-700 border-indigo-200",
    "bg-purple-50 text-purple-700 border-purple-200",
    "bg-pink-50 text-pink-700 border-pink-200",
    "bg-rose-50 text-rose-700 border-rose-200",
    "bg-red-50 text-red-700 border-red-200",
    "bg-orange-50 text-orange-700 border-orange-200",
    "bg-amber-50 text-amber-700 border-amber-200",
    "bg-yellow-50 text-yellow-700 border-yellow-200",
    "bg-lime-50 text-lime-700 border-lime-200",
    "bg-green-50 text-green-700 border-green-200",
    "bg-emerald-50 text-emerald-700 border-emerald-200",
    "bg-teal-50 text-teal-700 border-teal-200",
    "bg-cyan-50 text-cyan-700 border-cyan-200",
    "bg-sky-50 text-sky-700 border-sky-200",
    "bg-violet-50 text-violet-700 border-violet-200",
]

// Simple hash function to generate consistent index from string
function hashString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
}

// Helper function to get color class for loại phiếu badge
// Each loại phiếu gets a unique, consistent color based on its name
function getLoaiPhieuBadgeClass(tenLoaiPhieu: string | null | undefined): string {
    if (!tenLoaiPhieu) {
        return "bg-muted text-muted-foreground border-transparent"
    }
    // Generate consistent color index from loại phiếu name
    const colorIndex = hashString(tenLoaiPhieu) % LOAI_PHIEU_COLORS.length
    return LOAI_PHIEU_COLORS[colorIndex]
}

// Name cell component with navigation
function NameCell({ name, id }: { name: string; id: number }) {
    const navigate = useNavigate()
    
    return (
        <button
            onClick={() => navigate(`${hangMucConfig.routePath}/${id}`)}
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
                    // Navigate to edit with returnTo=list to return to list after save
                    navigate(`${hangMucConfig.routePath}/${id}/sua?returnTo=list`)
                }}
            >
                <span className="sr-only">Edit</span>
                <Edit className="h-4 w-4" />
            </Button>
            <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                <DeleteHangMucButton id={id} name={name} iconOnly />
            </div>
        </div>
    )
}

export const hangMucColumns = (): ColumnDef<HangMuc>[] => [
    // ⚡ Professional: Use generic select column utility
    createSelectColumn<HangMuc>(),
    {
        accessorKey: "ten_hang_muc",
        header: ({ column }) => <SortableHeader column={column} title="Tên Hạng Mục" />,
        cell: ({ row }) => {
            const hangMuc = row.original
            if (!hangMuc || !hangMuc.ten_hang_muc) {
                return <div className="text-muted-foreground">-</div>
            }
            return (
                <NameCell 
                    name={hangMuc.ten_hang_muc} 
                    id={hangMuc.id!} 
                />
            )
        },
        size: 250,
        minSize: 200,
        meta: {
            title: "Tên Hạng Mục",
            order: 1,
        },
    },
    {
        accessorKey: "loai_phieu_id",
        header: () => null,
        cell: () => null,
        enableHiding: false,
        enableSorting: false,
        filterFn: (row, _id, value) => {
            const loaiPhieuId = row.original.loai_phieu_id as number | null | undefined
            if (!loaiPhieuId) {
                return value.includes("null") || value.includes("")
            }
            return value.includes(String(loaiPhieuId))
        },
        meta: {
            title: "Loại Phiếu ID",
            isHidden: true,
        },
    },
    {
        accessorKey: "ten_loai_phieu",
        header: ({ column }) => <SortableHeader column={column} title="Loại Phiếu" />,
        cell: ({ row }) => {
            const tenLoaiPhieu = row.getValue("ten_loai_phieu") as string | null | undefined
            if (!tenLoaiPhieu) {
                return <span className="text-muted-foreground">-</span>
            }
            const colorClass = getLoaiPhieuBadgeClass(tenLoaiPhieu)
            return (
                <div className="min-w-[150px]">
                    <Badge variant="outline" className={colorClass}>
                        {tenLoaiPhieu}
                    </Badge>
                </div>
            )
        },
        size: 200,
        minSize: 150,
        meta: {
            title: "Loại Phiếu",
            order: 2,
        },
    },
    {
        accessorKey: "mo_ta",
        header: ({ column }) => <SortableHeader column={column} title="Mô Tả" />,
        cell: ({ row }) => {
            const moTa = row.getValue("mo_ta") as string | null | undefined
            return (
                <div className="max-w-[400px] truncate" title={moTa || undefined}>
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
        accessorKey: "nguoi_tao_id",
        header: ({ column }) => <SortableHeader column={column} title="Người Tạo" />,
        filterFn: (row, id, value) => {
            const nguoiTaoId = row.getValue(id) as number | null | undefined
            if (!nguoiTaoId) {
                return value.includes("null") || value.includes("")
            }
            return value.includes(String(nguoiTaoId))
        },
        cell: ({ row }) => {
            const nguoiTaoTen = row.original.nguoi_tao_ten
            const nguoiTaoId = row.getValue("nguoi_tao_id") as number | null
            if (!nguoiTaoId) {
                return <span className="text-muted-foreground">-</span>
            }
            return (
                <div className="min-w-[150px]">
                    {nguoiTaoTen 
                        ? `${nguoiTaoId} - ${nguoiTaoTen}`
                        : String(nguoiTaoId)
                    }
                </div>
            )
        },
        size: 200,
        minSize: 150,
        meta: {
            title: "Người Tạo",
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
            const hangMuc = row.original
            return (
                <ActionsCell 
                    id={hangMuc.id!} 
                    name={hangMuc.ten_hang_muc} 
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

