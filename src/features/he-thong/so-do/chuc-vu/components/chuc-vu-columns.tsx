"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { ChucVu } from "../schema"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { DeleteChucVuButton } from "./delete-chuc-vu-button"
import { chucVuConfig } from "../config"
import { createSelectColumn } from "@/shared/components/data-display/table/create-select-column"
import { SortableHeader } from "@/shared/components"


// Name cell component with navigation
function NameCell({ name, id }: { name: string; id: number }) {
    const navigate = useNavigate()

    return (
        <button
            onClick={() => navigate(`${chucVuConfig.routePath}/${id}`)}
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
                    navigate(`${chucVuConfig.routePath}/${id}/sua`)
                }}
            >
                <span className="sr-only">Edit</span>
                <Edit className="h-4 w-4" />
            </Button>
            <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                <DeleteChucVuButton id={id} name={name} iconOnly />
            </div>
        </div>
    )
}

export const chucVuColumns = (): ColumnDef<ChucVu>[] => [
    // ⚡ Professional: Use generic select column utility
    createSelectColumn<ChucVu>(),
    {
        accessorKey: "ma_chuc_vu",
        header: ({ column }) => <SortableHeader column={column} title="Mã Chức Vụ" />,
        size: 150,
        minSize: 120,
        meta: {
            title: "Mã Chức Vụ",
            order: 1,
            stickyLeft: true,
            stickyLeftOffset: 40, // After checkbox column
            minWidth: 120,
        },
        cell: ({ row }) => {
            const maChucVu = row.getValue("ma_chuc_vu") as string
            const id = row.original.id!
            return (
                <NameCell name={maChucVu} id={id} />
            )
        },
    },
    {
        accessorKey: "ten_chuc_vu",
        header: ({ column }) => <SortableHeader column={column} title="Tên Chức Vụ" />,
        size: 250,
        minSize: 200,
        cell: ({ row }) => {
            const tenChucVu = row.getValue("ten_chuc_vu") as string
            const id = row.original.id!
            return <NameCell name={tenChucVu} id={id} />
        },
        meta: {
            title: "Tên Chức Vụ",
            order: 2,
            minWidth: 200,
        },
    },
    {
        accessorKey: "cap_bac",
        header: ({ column }) => <SortableHeader column={column} title="Cấp Bậc" />,
        size: 100,
        minSize: 80,
        cell: ({ row }) => {
            const value = row.getValue("cap_bac") as number | null | undefined
            return value || <span className="text-muted-foreground">-</span>
        },
        meta: {
            title: "Cấp Bậc",
            order: 3,
            minWidth: 80,
        },
    },
    {
        accessorKey: "ten_cap_bac",
        header: ({ column }) => <SortableHeader column={column} title="Tên Cấp Bậc" />,
        size: 150,
        minSize: 120,
        meta: {
            title: "Tên Cấp Bậc",
            order: 4,
            minWidth: 120,
        },
    },
    {
        accessorKey: "ma_phong_ban",
        header: ({ column }) => <SortableHeader column={column} title="Mã Phòng Ban" />,
        size: 150,
        minSize: 120,
        filterFn: (row, id, value) => {
            const maPhongBan = row.getValue(id) as string | null
            return value.includes(maPhongBan || "")
        },
        meta: {
            title: "Mã Phòng Ban",
            order: 5,
            minWidth: 120,
        },
    },
    {
        accessorKey: "ngach_luong",
        header: ({ column }) => <SortableHeader column={column} title="Ngạch Lương" />,
        size: 120,
        minSize: 100,
        filterFn: (row, id, value) => {
            const ngachLuong = row.getValue(id) as string | null
            return value.includes(ngachLuong || "")
        },
        cell: ({ row }) => {
            const value = row.getValue("ngach_luong") as string | null | undefined
            return value || <span className="text-muted-foreground">-</span>
        },
        meta: {
            title: "Ngạch Lương",
            order: 6,
            minWidth: 100,
        },
    },
    {
        accessorKey: "muc_dong_bao_hiem",
        header: ({ column }) => <SortableHeader column={column} title="Mức Đóng BH" />,
        size: 120,
        minSize: 100,
        filterFn: (row, id, value) => {
            const mucDong = row.getValue(id) as number | null | undefined
            if (mucDong === null || mucDong === undefined) {
                return value.includes("") || value.includes("null")
            }
            return value.includes(String(mucDong))
        },
        cell: ({ row }) => {
            const value = row.getValue("muc_dong_bao_hiem") as number | null | undefined
            return value !== null && value !== undefined
                ? value.toLocaleString("vi-VN")
                : <span className="text-muted-foreground">-</span>
        },
        meta: {
            title: "Mức Đóng Bảo Hiểm",
            order: 7,
            minWidth: 100,
        },
    },
    {
        accessorKey: "so_ngay_nghi_thu_7",
        header: ({ column }) => <SortableHeader column={column} title="Số Ngày Nghỉ T7" />,
        size: 130,
        minSize: 110,
        filterFn: (row, id, value) => {
            const soNgay = row.getValue(id) as string | null
            return value.includes(soNgay || "")
        },
        cell: ({ row }) => {
            const value = row.getValue("so_ngay_nghi_thu_7") as string | null | undefined
            return value || <span className="text-muted-foreground">-</span>
        },
        meta: {
            title: "Số Ngày Nghỉ Thứ 7",
            order: 8,
            minWidth: 110,
        },
    },
    {
        accessorKey: "nhom_thuong",
        header: ({ column }) => <SortableHeader column={column} title="Nhóm Thưởng" />,
        size: 120,
        minSize: 100,
        cell: ({ row }) => {
            const value = row.getValue("nhom_thuong") as string | null | undefined
            return value || <span className="text-muted-foreground">-</span>
        },
        meta: {
            title: "Nhóm Thưởng",
            order: 9,
            minWidth: 100,
        },
    },
    {
        accessorKey: "diem_thuong",
        header: ({ column }) => <SortableHeader column={column} title="Điểm Thưởng" />,
        size: 120,
        minSize: 100,
        cell: ({ row }) => {
            const value = row.getValue("diem_thuong") as number | null | undefined
            return value !== null && value !== undefined
                ? value.toLocaleString("vi-VN")
                : <span className="text-muted-foreground">-</span>
        },
        meta: {
            title: "Điểm Thưởng",
            order: 10,
            minWidth: 100,
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
            order: 11,
            minWidth: 140,
        },
    },
    {
        accessorKey: "tg_cap_nhat",
        header: ({ column }) => <SortableHeader column={column} title="Thời gian cập nhật" />,
        size: 160,
        minSize: 140,
        cell: ({ row }) => {
            const date = row.getValue("tg_cap_nhat") as string | null | undefined
            if (!date) return <span className="text-muted-foreground">-</span>
            try {
                return new Date(date).toLocaleString("vi-VN")
            } catch {
                return date
            }
        },
        meta: {
            title: "Thời gian cập nhật",
            order: 12,
            minWidth: 140,
        },
    },
    {
        accessorKey: "phong_ban_id",
        header: ({ column }) => <SortableHeader column={column} title="ID Phòng Ban" />,
        size: 120,
        minSize: 100,
        cell: ({ row }) => {
            const value = row.getValue("phong_ban_id") as number | null | undefined
            return value !== null && value !== undefined
                ? value.toString()
                : <span className="text-muted-foreground">-</span>
        },
        meta: {
            title: "ID Phòng Ban",
            order: 13,
            minWidth: 100,
        },
    },
    {
        accessorKey: "cap_bac_id",
        header: ({ column }) => <SortableHeader column={column} title="ID Cấp Bậc" />,
        size: 120,
        minSize: 100,
        cell: ({ row }) => {
            const value = row.getValue("cap_bac_id") as number | null | undefined
            return value !== null && value !== undefined
                ? value.toString()
                : <span className="text-muted-foreground">-</span>
        },
        meta: {
            title: "ID Cấp Bậc",
            order: 14,
            minWidth: 100,
        },
    },
    {
        id: "actions",
        header: () => <div className="text-right pr-4">Thao tác</div>,
        cell: ({ row }) => {
            const chucVu = row.original
            return (
                <ActionsCell
                    id={chucVu.id!}
                    name={chucVu.ten_chuc_vu}
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

