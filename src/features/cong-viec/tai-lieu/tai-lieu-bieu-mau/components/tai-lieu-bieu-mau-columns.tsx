"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { TaiLieuBieuMau } from "../schema"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit } from "lucide-react"
import { DeleteTaiLieuBieuMauButton } from "./delete-tai-lieu-bieu-mau-button"
import { taiLieuBieuMauConfig } from "../config"
import { createSelectColumn } from "@/shared/components/data-display/table/create-select-column"
import { SortableHeader } from "@/shared/components"
import { getHangMucBadgeColor } from "../constants/badge-colors"

// Actions cell component
function ActionsCell({ row }: { row: TaiLieuBieuMau }) {
    const navigate = useNavigate()
    const id = row.id!
    const name = row.ten_tai_lieu || `ID: ${id}`
    
    return (
        <div className="flex items-center gap-2 justify-end pr-4 min-w-[140px]">
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:text-blue-600 shrink-0"
                onClick={(e) => {
                    e.stopPropagation()
                    navigate(`${taiLieuBieuMauConfig.routePath}/${id}/sua?returnTo=list`)
                }}
                title="Sửa"
            >
                <span className="sr-only">Edit</span>
                <Edit className="h-4 w-4" />
            </Button>
            <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                <DeleteTaiLieuBieuMauButton id={id} name={name} iconOnly />
            </div>
        </div>
    )
}

export const taiLieuBieuMauColumns: ColumnDef<TaiLieuBieuMau>[] = [
    // ⚡ Professional: Use generic select column utility
    createSelectColumn<TaiLieuBieuMau>(),
    // Hidden columns for filtering (not displayed in UI)
    {
        id: "loai_id",
        accessorKey: "loai_id",
        header: () => null,
        cell: () => null,
        enableHiding: false,
        enableColumnFilter: true,
        filterFn: (row, _id, value) => {
            if (!value || !Array.isArray(value) || value.length === 0) {
                return true
            }
            const loaiId = row.getValue("loai_id") as number | null
            if (!loaiId) return false
            return value.includes(String(loaiId))
        },
        meta: {
            hideInTable: true,
        },
    },
    {
        id: "danh_muc_id",
        accessorKey: "danh_muc_id",
        header: () => null,
        cell: () => null,
        enableHiding: false,
        enableColumnFilter: true,
        filterFn: (row, _id, value) => {
            if (!value || !Array.isArray(value) || value.length === 0) {
                return true
            }
            const danhMucId = row.getValue("danh_muc_id") as number | null
            if (!danhMucId) return false
            return value.includes(String(danhMucId))
        },
        meta: {
            hideInTable: true,
        },
    },
    {
        accessorKey: "ma_tai_lieu",
        header: ({ column }) => <SortableHeader column={column} title="Mã Tài Liệu" />,
        size: 150,
        minSize: 120,
        meta: {
            title: "Mã tài liệu",
            order: 1,
            stickyLeft: true,
            stickyLeftOffset: 40, // After checkbox column
            minWidth: 120
        },
        cell: ({ row }) => {
            const maTaiLieu = row.getValue("ma_tai_lieu") as string | null
            const id = row.original.id
            const navigate = useNavigate()

            if (!id) {
                return <div className="min-w-[120px]">{maTaiLieu || "-"}</div>
            }

            return (
                <div className="min-w-[120px]">
                    <button
                        onClick={() => navigate(`${taiLieuBieuMauConfig.routePath}/${id}`)}
                        className="font-medium hover:underline text-left"
                    >
                        {maTaiLieu || "-"}
                    </button>
                </div>
            )
        }
    },
    {
        accessorKey: "ten_tai_lieu",
        header: ({ column }) => <SortableHeader column={column} title="Tên Tài Liệu" />,
        size: 250,
        minSize: 200,
        meta: {
            title: "Tên tài liệu",
            order: 2,
            minWidth: 200
        },
        cell: ({ row }) => {
            const tenTaiLieu = row.getValue("ten_tai_lieu") as string | null
            const id = row.original.id
            const navigate = useNavigate()

            if (!id) {
                return <span className="font-medium">{tenTaiLieu || "-"}</span>
            }

            return (
                <div className="min-w-[200px]">
                    <button
                        onClick={() => navigate(`${taiLieuBieuMauConfig.routePath}/${id}`)}
                        className="hover:underline truncate text-left w-full"
                    >
                        {tenTaiLieu || "-"}
                    </button>
                </div>
            )
        }
    },
    {
        accessorKey: "hang_muc",
        header: ({ column }) => <SortableHeader column={column} title="Hạng Mục" />,
        size: 200,
        minSize: 150,
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
            order: 3,
            minWidth: 150
        },
        cell: ({ row }) => {
            const hangMuc = row.getValue("hang_muc") as string | null
            
            if (!hangMuc) {
                return <div className="min-w-[150px]">-</div>
            }

            // Badge color mapping
            const badgeClass = getHangMucBadgeColor(hangMuc)

            return (
                <div className="min-w-[150px]">
                    <Badge variant="outline" className={badgeClass}>
                        {hangMuc}
                    </Badge>
                </div>
            )
        }
    },
    {
        accessorKey: "mo_ta",
        header: ({ column }) => <SortableHeader column={column} title="Mô Tả" />,
        size: 250,
        minSize: 200,
        meta: {
            title: "Mô tả",
            order: 2.5,
            minWidth: 200
        },
        cell: ({ row }) => {
            const moTa = row.getValue("mo_ta") as string | null
            return <div className="min-w-[200px] line-clamp-2">{moTa || "-"}</div>
        }
    },
    {
        accessorKey: "tai_lieu_cha_id",
        header: ({ column }) => <SortableHeader column={column} title="Tài Liệu Cha ID" />,
        size: 150,
        minSize: 120,
        meta: {
            title: "Tài liệu cha ID",
            order: 2.7,
            minWidth: 120
        },
        cell: ({ row }) => {
            const taiLieuChaId = row.getValue("tai_lieu_cha_id") as number | null
            return <div className="min-w-[120px]">{taiLieuChaId !== null && taiLieuChaId !== undefined ? taiLieuChaId.toString() : "-"}</div>
        }
    },
    {
        accessorKey: "trang_thai",
        header: ({ column }) => <SortableHeader column={column} title="Trạng Thái" />,
        size: 150,
        minSize: 120,
        filterFn: (row, id, value) => {
            if (!value || !Array.isArray(value) || value.length === 0) {
                return true
            }
            const trangThai = row.getValue(id) as string | null
            if (!trangThai) return false
            return value.includes(trangThai)
        },
        meta: {
            title: "Trạng thái",
            order: 4,
            minWidth: 120
        },
        cell: ({ row }) => {
            const trangThai = row.getValue("trang_thai") as string | null
            if (!trangThai) {
                return <div className="min-w-[120px]">-</div>
            }
            return (
                <div className="min-w-[120px]">
                    <Badge variant="outline">{trangThai}</Badge>
                </div>
            )
        }
    },
    {
        accessorKey: "link_du_thao",
        header: ({ column }) => <SortableHeader column={column} title="Link Dự Thảo" />,
        size: 200,
        minSize: 150,
        meta: {
            title: "Link dự thảo",
            order: 5,
            minWidth: 150
        },
        cell: ({ row }) => {
            const link = row.getValue("link_du_thao") as string | null
            if (!link) {
                return <div className="min-w-[150px]">-</div>
            }
            return (
                <div className="min-w-[150px]">
                    <a 
                        href={link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate block"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {link}
                    </a>
                </div>
            )
        }
    },
    {
        accessorKey: "link_ap_dung",
        header: ({ column }) => <SortableHeader column={column} title="Link Áp Dụng" />,
        size: 200,
        minSize: 150,
        meta: {
            title: "Link áp dụng",
            order: 6,
            minWidth: 150
        },
        cell: ({ row }) => {
            const link = row.getValue("link_ap_dung") as string | null
            if (!link) {
                return <div className="min-w-[150px]">-</div>
            }
            return (
                <div className="min-w-[150px]">
                    <a 
                        href={link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate block"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {link}
                    </a>
                </div>
            )
        }
    },
    {
        accessorKey: "ghi_chu",
        header: ({ column }) => <SortableHeader column={column} title="Ghi Chú" />,
        size: 300,
        minSize: 200,
        meta: {
            title: "Ghi chú",
            order: 7,
            minWidth: 200
        },
        cell: ({ row }) => {
            const ghiChu = row.getValue("ghi_chu") as string | null
            return <div className="min-w-[200px]">{ghiChu || "-"}</div>
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
            order: 8,
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
            order: 11,
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
            const taiLieuBieuMau = row.original
            const id = taiLieuBieuMau.id
            if (!id) return null

            return <ActionsCell row={taiLieuBieuMau} />
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

