"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { LichDang } from "../schema"
import { Button } from "@/components/ui/button"
import { Edit, Eye } from "lucide-react"
import { DeleteLichDangButton } from "./delete-lich-dang-button"
import { Badge } from "@/components/ui/badge"
import { createSelectColumn } from "@/shared/components/data-display/table/create-select-column"
import { SortableHeader } from "@/shared/components"
import { lichDangConfig } from "../config"

// Cau Hoi cell component with navigation
function CauHoiCell({ cauHoi, id }: { cauHoi: string; id: number }) {
    const navigate = useNavigate()
    
    return (
        <button
            onClick={() => navigate(`${lichDangConfig.routePath}/${id}`)}
            className="font-medium hover:underline line-clamp-2 text-left w-full"
        >
            {cauHoi}
        </button>
    )
}

// Actions cell component
function ActionsCell({ 
    id, 
    cauHoi, 
    onPreview 
}: { 
    id: number
    cauHoi: string
    onPreview?: () => void
}) {
    const navigate = useNavigate()

    return (
        <div className="flex items-center gap-2 justify-end pr-4 min-w-[140px]">
            {onPreview && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:text-primary shrink-0"
                    onClick={(e) => {
                        e.stopPropagation()
                        onPreview()
                    }}
                    title="Preview"
                >
                    <span className="sr-only">Preview</span>
                    <Eye className="h-4 w-4" />
                </Button>
            )}
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:text-blue-600 shrink-0"
                onClick={(e) => {
                    e.stopPropagation()
                    navigate(`${lichDangConfig.routePath}/${id}/sua?returnTo=list`)
                }}
            >
                <span className="sr-only">Edit</span>
                <Edit className="h-4 w-4" />
            </Button>
            <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                <DeleteLichDangButton 
                    id={id} 
                    name={cauHoi}
                    iconOnly 
                />
            </div>
        </div>
    )
}

// Function to create columns with chucVuMap and onPreview callback
export function createColumns(
    chucVuMap?: Map<number, string>,
    onPreview?: (data: LichDang) => void
): ColumnDef<LichDang>[] {
    return [
    // ⚡ Professional: Use generic select column utility
    createSelectColumn<LichDang>(),
    {
        accessorKey: "ngay_dang",
        header: ({ column }) => <SortableHeader column={column} title="Ngày Đăng" />,
        size: 150,
        minSize: 120,
        meta: {
            title: "Ngày đăng",
            order: 1,
            stickyLeft: true,
            stickyLeftOffset: 40,
            minWidth: 120
        },
        cell: ({ row }) => {
            const ngayDang = row.getValue("ngay_dang") as string | null
            if (!ngayDang) return <div className="min-w-[120px]">-</div>
            const date = new Date(ngayDang)
            return (
                <div className="min-w-[120px]">
                    {date.toLocaleDateString("vi-VN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                    })}
                </div>
            )
        }
    },
    {
        accessorKey: "gio_dang",
        header: ({ column }) => <SortableHeader column={column} title="Giờ Đăng" />,
        size: 100,
        minSize: 80,
        meta: {
            title: "Giờ đăng",
            order: 2,
            stickyLeft: true,
            stickyLeftOffset: 190,
            minWidth: 80
        },
        cell: ({ row }) => {
            const gioDang = row.getValue("gio_dang") as string | null
            if (!gioDang) return <div className="min-w-[80px]">-</div>
            // Chỉ lấy hh:mm, bỏ phần :ss nếu có
            const formattedTime = gioDang.length > 5 ? gioDang.substring(0, 5) : gioDang
            return <div className="min-w-[80px]">{formattedTime}</div>
        }
    },
    {
        accessorKey: "nhom_cau_hoi_ten",
        header: ({ column }) => <SortableHeader column={column} title="Nhóm Câu Hỏi" />,
        size: 200,
        minSize: 150,
        meta: {
            title: "Nhóm câu hỏi",
            order: 3,
            minWidth: 150
        },
        filterFn: (row, id, value) => {
            const cellValue = row.getValue(id) as string | null
            if (!value || !Array.isArray(value) || value.length === 0) return true
            if (!cellValue) return false
            return value.includes(cellValue)
        },
        cell: ({ row }) => {
            const tenNhom = row.getValue("nhom_cau_hoi_ten") as string | null
            return <div className="min-w-[150px]">{tenNhom || "-"}</div>
        }
    },
    {
        accessorKey: "cau_hoi",
        header: ({ column }) => <SortableHeader column={column} title="Câu Hỏi" />,
        size: 300,
        minSize: 200,
        meta: {
            title: "Câu hỏi",
            order: 4,
            minWidth: 200
        },
        cell: ({ row }) => {
            const cauHoi = row.getValue("cau_hoi") as string | null
            const id = row.original.id

            return (
                <div className="min-w-[200px]">
                    {id ? (
                        <CauHoiCell cauHoi={cauHoi || "-"} id={id} />
                    ) : (
                        <span className="font-medium">{cauHoi || "-"}</span>
                    )}
                </div>
            )
        }
    },
    {
        accessorKey: "dap_an_dung",
        header: ({ column }) => <SortableHeader column={column} title="Đáp Án Đúng" />,
        size: 120,
        minSize: 100,
        meta: {
            title: "Đáp án đúng",
            order: 5,
            minWidth: 100
        },
        cell: ({ row }) => {
            const dapAnDung = row.getValue("dap_an_dung") as number | null
            if (!dapAnDung) return <div className="min-w-[100px]">-</div>
            return (
                <div className="min-w-[100px]">
                    <Badge variant="secondary">Đáp án {dapAnDung}</Badge>
                </div>
            )
        }
    },
    {
        accessorKey: "chuc_vu_ap_dung",
        header: ({ column }) => <SortableHeader column={column} title="Chức Vụ Áp Dụng" />,
        size: 250,
        minSize: 200,
        meta: {
            title: "Chức vụ áp dụng",
            order: 6,
            minWidth: 200
        },
        filterFn: (row, id, value) => {
            const cellValue = row.getValue(id) as number[] | null
            if (!value || !Array.isArray(value) || value.length === 0) return true
            if (!cellValue || !Array.isArray(cellValue) || cellValue.length === 0) return false
            // Check if any of the selected chuc vu IDs are in the row's chuc_vu_ap_dung array
            return value.some((selectedId: number) => cellValue.includes(selectedId))
        },
        cell: ({ row }) => {
            const chucVuApDung = row.getValue("chuc_vu_ap_dung") as number[] | null
            if (!chucVuApDung || !Array.isArray(chucVuApDung) || chucVuApDung.length === 0) {
                return <div className="min-w-[200px]"><Badge variant="outline">Tất cả</Badge></div>
            }
            
            // Map IDs to names if chucVuMap is available
            const chucVuNames = chucVuMap 
                ? chucVuApDung.map(id => chucVuMap.get(id) || `ID: ${id}`)
                : chucVuApDung.map(id => `ID: ${id}`)
            
            return (
                <div className="min-w-[200px]">
                    <div className="flex flex-wrap gap-1">
                        {chucVuNames.length > 3 ? (
                            <Badge variant="secondary">{chucVuNames.length} chức vụ</Badge>
                        ) : (
                            chucVuNames.map((name, index) => (
                                <Badge key={index} variant="secondary">
                                    {name}
                                </Badge>
                            ))
                        )}
                    </div>
                </div>
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
            order: 7,
            minWidth: 150
        },
        filterFn: (row, id, value) => {
            const nguoiTaoTen = row.getValue(id) as string | null
            const nguoiTaoId = row.original.nguoi_tao_id
            if (!value || !Array.isArray(value) || value.length === 0) return true
            if (!nguoiTaoId) return false
            // Format cell value to match filter options: "id - ten"
            const cellValue = nguoiTaoTen ? `${nguoiTaoId} - ${nguoiTaoTen}` : String(nguoiTaoId)
            return value.includes(cellValue)
        },
        cell: ({ row }) => {
            const nguoiTaoTen = row.getValue("nguoi_tao_ten") as string | null
            const nguoiTaoId = row.original.nguoi_tao_id
            if (!nguoiTaoId) return <div className="min-w-[150px]">-</div>
            const displayText = nguoiTaoTen 
                ? `${nguoiTaoId} - ${nguoiTaoTen}`
                : String(nguoiTaoId)
            return <div className="min-w-[150px]">{displayText}</div>
        }
    },
    {
        id: "actions",
        header: () => <div className="text-right pr-4">Thao tác</div>,
        cell: ({ row }) => {
            const id = row.original.id
            if (!id) return null

            return (
                <ActionsCell 
                    id={id} 
                    cauHoi={row.original.cau_hoi || "Lịch đăng"}
                    onPreview={onPreview ? () => onPreview(row.original) : undefined}
                />
            )
        },
        enableSorting: false,
        enableHiding: false,
        size: 140,
        minSize: 100,
        meta: {
            title: "Thao tác",
            stickyRight: true,
            minWidth: 100
        }
    }
    ]
}

// Default columns export (for backward compatibility)
export const lichDangColumns = createColumns(undefined, undefined)

