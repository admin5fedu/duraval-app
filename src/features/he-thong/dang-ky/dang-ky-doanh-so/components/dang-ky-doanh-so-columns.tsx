"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { DangKyDoanhSo } from "../schema"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { DeleteDangKyDoanhSoButton } from "./delete-dang-ky-doanh-so-button"
import { dangKyDoanhSoConfig } from "../config"
import { createSelectColumn } from "@/shared/components/data-display/table/create-select-column"
import { SortableHeader } from "@/shared/components"
import type { NhanSu } from "@/features/he-thong/nhan-su/danh-sach-nhan-su/schema"
import { formatNumber, formatCurrency } from "@/shared/utils/detail-utils"

// Name cell component with navigation
function NameCell({ name, id }: { name: string | null; id: number }) {
    const navigate = useNavigate()
    
    const displayName = name || "Chưa có tên"
    
    return (
        <button
            onClick={() => navigate(`${dangKyDoanhSoConfig.routePath}/${id}`)}
            className="font-medium hover:underline truncate text-left w-full"
        >
            {displayName}
        </button>
    )
}

// Actions cell component
function ActionsCell({ id, name }: { id: number; name?: string | null }) {
    const navigate = useNavigate()
    const displayName = name || `Đăng ký #${id}`
    
    return (
        <div className="flex items-center gap-2 justify-end pr-4 min-w-[100px]">
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:text-blue-600 shrink-0"
                onClick={(e) => {
                    e.stopPropagation()
                    navigate(`${dangKyDoanhSoConfig.routePath}/${id}/sua`)
                }}
            >
                <span className="sr-only">Edit</span>
                <Edit className="h-4 w-4" />
            </Button>
            <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                <DeleteDangKyDoanhSoButton id={id} name={displayName} iconOnly />
            </div>
        </div>
    )
}

export const dangKyDoanhSoColumns = (nhanSuList: NhanSu[] = []): ColumnDef<DangKyDoanhSo>[] => [
    // ⚡ Professional: Use generic select column utility
    createSelectColumn<DangKyDoanhSo>(),
    {
        accessorKey: "ten_nhan_vien",
        header: ({ column }) => <SortableHeader column={column} title="Tên Nhân Viên" />,
        size: 200,
        minSize: 150,
        meta: {
            title: "Tên Nhân Viên",
            order: 1,
            stickyLeft: true,
            stickyLeftOffset: 40, // After checkbox column
            minWidth: 150,
        },
        cell: ({ row }) => {
            const tenNhanVien = row.getValue("ten_nhan_vien") as string | null
            const id = row.original.id!
            return (
                <NameCell name={tenNhanVien} id={id} />
            )
        },
    },
    {
        accessorKey: "ma_phong",
        header: ({ column }) => <SortableHeader column={column} title="Phòng" />,
        size: 120,
        minSize: 100,
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
        meta: {
            title: "Phòng",
            order: 1.5,
            minWidth: 100,
        },
        cell: ({ row }) => {
            const value = row.getValue("ma_phong") as string | null | undefined
            return value ? (
                <span>{value}</span>
            ) : (
                <span className="text-muted-foreground">-</span>
            )
        },
    },
    {
        accessorKey: "ma_nhom",
        header: ({ column }) => <SortableHeader column={column} title="Nhóm" />,
        size: 120,
        minSize: 100,
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
        meta: {
            title: "Nhóm",
            order: 1.6,
            minWidth: 100,
        },
        cell: ({ row }) => {
            const value = row.getValue("ma_nhom") as string | null | undefined
            return value ? (
                <span>{value}</span>
            ) : (
                <span className="text-muted-foreground">-</span>
            )
        },
    },
    {
        accessorKey: "nam",
        header: ({ column }) => <SortableHeader column={column} title="Năm" />,
        size: 100,
        minSize: 80,
        filterFn: (row, id, value) => {
            return value.includes(String(row.getValue(id)))
        },
        meta: {
            title: "Năm",
            order: 2,
            minWidth: 80,
        },
        cell: ({ row }) => {
            const value = row.getValue("nam") as number | null | undefined
            return value ? (
                <span className="font-mono">{formatNumber(value)}</span>
            ) : (
                <span className="text-muted-foreground">-</span>
            )
        },
    },
    {
        accessorKey: "thang",
        header: ({ column }) => <SortableHeader column={column} title="Tháng" />,
        size: 100,
        minSize: 80,
        filterFn: (row, id, value) => {
            return value.includes(String(row.getValue(id)))
        },
        meta: {
            title: "Tháng",
            order: 3,
            minWidth: 80,
        },
        cell: ({ row }) => {
            const value = row.getValue("thang") as number | null | undefined
            return value ? (
                <span className="font-mono">{formatNumber(value)}</span>
            ) : (
                <span className="text-muted-foreground">-</span>
            )
        },
    },
    {
        accessorKey: "ten_nhom_ap_doanh_thu",
        header: ({ column }) => <SortableHeader column={column} title="Nhóm Áp Doanh Thu" />,
        size: 200,
        minSize: 150,
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
        meta: {
            title: "Nhóm Áp Doanh Thu",
            order: 4,
            minWidth: 150,
        },
        cell: ({ row }) => {
            const value = row.getValue("ten_nhom_ap_doanh_thu") as string | null | undefined
            return value ? (
                <div className="max-w-[200px] truncate" title={value}>
                    {value}
                </div>
            ) : (
                <span className="text-muted-foreground">-</span>
            )
        },
    },
    {
        accessorKey: "bac_dt",
        header: ({ column }) => <SortableHeader column={column} title="Bậc DT" />,
        size: 120,
        minSize: 100,
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
        meta: {
            title: "Bậc DT",
            order: 5,
            minWidth: 100,
        },
        cell: ({ row }) => {
            const value = row.getValue("bac_dt") as string | null | undefined
            return value ? <span>{value}</span> : <span className="text-muted-foreground">-</span>
        },
    },
    {
        accessorKey: "doanh_thu",
        header: ({ column }) => <SortableHeader column={column} title="Doanh Thu" />,
        size: 150,
        minSize: 120,
        meta: {
            title: "Doanh Thu",
            order: 6,
            minWidth: 120,
        },
        cell: ({ row }) => {
            const value = row.getValue("doanh_thu") as number | null | undefined
            return value ? (
                <span className="font-mono">{formatCurrency(value)}</span>
            ) : (
                <span className="text-muted-foreground">-</span>
            )
        },
    },
    {
        accessorKey: "mo_ta",
        header: ({ column }) => <SortableHeader column={column} title="Mô Tả" />,
        size: 300,
        minSize: 200,
        cell: ({ row }) => {
            const value = row.getValue("mo_ta") as string | null | undefined
            return value ? (
                <div className="max-w-[300px] truncate" title={value}>
                    {value}
                </div>
            ) : (
                <span className="text-muted-foreground">-</span>
            )
        },
        meta: {
            title: "Mô Tả",
            order: 7,
            minWidth: 200,
        },
    },
    {
        accessorKey: "tg_tao",
        header: ({ column }) => <SortableHeader column={column} title="Thời Gian Tạo" />,
        size: 180,
        minSize: 150,
        cell: ({ row }) => {
            const value = row.getValue("tg_tao") as string | null | undefined
            if (!value) return <span className="text-muted-foreground">-</span>
            try {
                const date = new Date(value)
                return date.toLocaleString("vi-VN", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                })
            } catch {
                return <span className="text-muted-foreground">-</span>
            }
        },
        meta: {
            title: "Thời Gian Tạo",
            order: 8,
            minWidth: 150,
        },
    },
    {
        accessorKey: "nguoi_tao_id",
        header: ({ column }) => <SortableHeader column={column} title="Người Tạo" />,
        size: 200,
        minSize: 150,
        cell: ({ row }) => {
            const nguoiTaoId = row.getValue("nguoi_tao_id") as number | null | undefined
            if (!nguoiTaoId) {
                return <span className="text-muted-foreground">-</span>
            }
            
            // Map nguoi_tao_id (ma_nhan_vien) với nhanSuList để lấy ho_ten
            const nguoiTao = nhanSuList.find((ns) => ns.ma_nhan_vien === nguoiTaoId)
            if (nguoiTao) {
                return (
                    <span className="truncate">
                        {nguoiTao.ma_nhan_vien} - {nguoiTao.ho_ten}
                    </span>
                )
            }
            return <span>{nguoiTaoId}</span>
        },
        meta: {
            title: "Người Tạo",
            order: 9,
            minWidth: 150,
        },
    },
    {
        id: "actions",
        header: () => <div className="text-right pr-4">Thao tác</div>,
        cell: ({ row }) => {
            const id = row.original.id!
            const name = row.original.ten_nhan_vien
            return <ActionsCell id={id} name={name} />
        },
        enableSorting: false,
        enableHiding: false,
        size: 100,
        meta: {
            stickyRight: true,
        },
    },
]

