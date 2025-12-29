"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { DiemCongTru } from "../schema"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit } from "lucide-react"
import { DeleteDiemCongTruButton } from "./delete-diem-cong-tru-button"
import { diemCongTruConfig } from "../config"
import { createSelectColumn } from "@/shared/components/data-display/table/create-select-column"
import { SortableHeader } from "@/shared/components"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

// Name cell component with navigation
function NameCell({ hoVaTen, id }: { hoVaTen: string | null; id: number }) {
    const navigate = useNavigate()
    
    return (
        <button
            onClick={() => navigate(`${diemCongTruConfig.routePath}/${id}`)}
            className="font-medium hover:underline truncate text-left w-full"
        >
            {hoVaTen || "-"}
        </button>
    )
}

// Actions cell component
function ActionsCell({ id, hoVaTen }: { id: number; hoVaTen: string | null }) {
    const navigate = useNavigate()
    
    return (
        <div className="flex items-center gap-2 justify-end pr-4 min-w-[100px]">
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:text-blue-600 shrink-0"
                onClick={(e) => {
                    e.stopPropagation()
                    navigate(`${diemCongTruConfig.routePath}/${id}/sua`)
                }}
            >
                <span className="sr-only">Edit</span>
                <Edit className="h-4 w-4" />
            </Button>
            <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                <DeleteDiemCongTruButton id={id} name={hoVaTen || `ID: ${id}`} iconOnly />
            </div>
        </div>
    )
}

export const diemCongTruColumns: ColumnDef<DiemCongTru>[] = [
    // ⚡ Professional: Use generic select column utility
    createSelectColumn<DiemCongTru>(),
    {
        accessorKey: "ho_va_ten",
        header: ({ column }) => <SortableHeader column={column} title="Họ và Tên" />,
        size: 200,
        minSize: 150,
        cell: ({ row }) => {
            const hoVaTen = row.getValue("ho_va_ten") as string | null
            const id = row.original.id!
            return <NameCell hoVaTen={hoVaTen} id={id} />
        },
        meta: {
            title: "Họ và Tên",
            order: 1,
            stickyLeft: true,
            stickyLeftOffset: 40, // After checkbox column
            minWidth: 150,
        },
    },
    {
        accessorKey: "nhan_vien_id",
        header: () => null,
        enableHiding: false,
        size: 0,
        minSize: 0,
        cell: () => null,
        filterFn: (row, id, value) => {
            if (!value || !Array.isArray(value) || value.length === 0) {
                return true
            }
            const nhanVienId = row.getValue(id) as number | null | undefined
            if (nhanVienId === null || nhanVienId === undefined) {
                return false
            }
            return value.includes(String(nhanVienId))
        },
        meta: {
            title: "Nhân Viên ID",
            order: 0,
        },
    },
    {
        accessorKey: "ngay",
        header: ({ column }) => <SortableHeader column={column} title="Ngày" />,
        size: 120,
        minSize: 100,
        cell: ({ row }) => {
            const ngay = row.getValue("ngay") as string | null
            if (!ngay) return <span className="text-muted-foreground">-</span>
            try {
                return format(new Date(ngay), "dd/MM/yyyy", { locale: vi })
            } catch {
                return ngay
            }
        },
        filterFn: (row, id, value) => {
            if (!value || !Array.isArray(value) || value.length === 0) {
                return true
            }
            const date = row.getValue(id) as string | null
            if (!date) return false
            try {
                const dateObj = new Date(date)
                const dateStr = format(dateObj, "dd/MM/yyyy", { locale: vi })
                return value.includes(dateStr)
            } catch {
                return false
            }
        },
        meta: {
            title: "Ngày",
            order: 2,
            minWidth: 100,
        },
    },
    {
        accessorKey: "phong_ban_id",
        header: ({ column }) => <SortableHeader column={column} title="Phòng Ban" />,
        size: 180,
        minSize: 150,
        cell: ({ row }) => {
            const phongBan = row.original.phong_ban
            if (!phongBan) {
                return <span className="text-muted-foreground">-</span>
            }
            return (
                <div className="min-w-[150px]">
                    {phongBan.ma_phong_ban} - {phongBan.ten_phong_ban}
                </div>
            )
        },
        meta: {
            title: "Phòng Ban",
            order: 3,
            minWidth: 150,
        },
    },
    {
        accessorKey: "loai",
        header: ({ column }) => <SortableHeader column={column} title="Loại" />,
        size: 120,
        minSize: 100,
        cell: ({ row }) => {
            const loai = row.getValue("loai") as string | null
            if (!loai) return <span className="text-muted-foreground">-</span>
            
            // Format badge based on loai value
            const isCong = loai === "Cộng"
            const badgeClassName = isCong
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
            
            return (
                <Badge variant="outline" className={badgeClassName}>
                    {loai}
                </Badge>
            )
        },
        meta: {
            title: "Loại",
            order: 4,
            minWidth: 100,
        },
    },
    {
        accessorKey: "nhom",
        header: ({ column }) => <SortableHeader column={column} title="Nhóm" />,
        size: 120,
        minSize: 100,
        cell: ({ row }) => {
            const nhom = row.getValue("nhom") as string | null
            if (!nhom) return <span className="text-muted-foreground">-</span>
            return <span>{nhom}</span>
        },
        meta: {
            title: "Nhóm",
            order: 5,
            minWidth: 100,
        },
    },
    {
        accessorKey: "diem",
        header: ({ column }) => <SortableHeader column={column} title="Điểm" />,
        size: 100,
        minSize: 80,
        cell: ({ row }) => {
            const diem = row.getValue("diem") as number | null
            if (diem === null || diem === undefined) return <span className="text-muted-foreground">0</span>
            return <span>{diem}</span>
        },
        meta: {
            title: "Điểm",
            order: 6,
            minWidth: 80,
        },
    },
    {
        accessorKey: "tien",
        header: ({ column }) => <SortableHeader column={column} title="Tiền" />,
        size: 120,
        minSize: 100,
        cell: ({ row }) => {
            const tien = row.getValue("tien") as number | null
            if (tien === null || tien === undefined) return <span className="text-muted-foreground">0</span>
            return <span>{tien.toLocaleString("vi-VN")}</span>
        },
        meta: {
            title: "Tiền",
            order: 7,
            minWidth: 100,
        },
    },
    {
        accessorKey: "nhom_luong_id",
        header: ({ column }) => <SortableHeader column={column} title="Nhóm Lương" />,
        size: 150,
        minSize: 120,
        cell: ({ row }) => {
            const nhomLuong = row.original.nhom_luong
            if (!nhomLuong) {
                return <span className="text-muted-foreground">-</span>
            }
            return <span>{nhomLuong.ten_nhom}</span>
        },
        meta: {
            title: "Nhóm Lương",
            order: 8,
            minWidth: 120,
        },
    },
    {
        accessorKey: "nguoi_tao_id",
        header: ({ column }) => <SortableHeader column={column} title="Người Tạo" />,
        size: 180,
        minSize: 150,
        cell: ({ row }) => {
            const nguoiTaoId = row.getValue("nguoi_tao_id") as number | null
            const nguoiTao = row.original.nguoi_tao
            if (nguoiTaoId === null || nguoiTaoId === undefined) {
                return <span className="text-muted-foreground">-</span>
            }
            const maNhanVien = nguoiTao?.ma_nhan_vien || nguoiTaoId
            return (
                <div className="min-w-[150px]">
                    {nguoiTao?.ho_ten 
                        ? `${maNhanVien} - ${nguoiTao.ho_ten}`
                        : maNhanVien.toString()
                    }
                </div>
            )
        },
        meta: {
            title: "Người Tạo",
            order: 9,
            minWidth: 150,
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
                return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: vi })
            } catch {
                return date
            }
        },
        meta: {
            title: "Thời gian tạo",
            order: 10,
            minWidth: 140,
        },
    },
    {
        id: "actions",
        header: () => <div className="text-right pr-4">Thao tác</div>,
        cell: ({ row }) => {
            const diemCongTru = row.original
            return (
                <ActionsCell
                    id={diemCongTru.id!}
                    hoVaTen={diemCongTru.ho_va_ten ?? null}
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
            stickyRight: true,
            minWidth: 100,
        },
    },
]

