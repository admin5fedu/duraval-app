"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { TrucHat } from "../schema"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit } from "lucide-react"
import { DeleteTrucHatButton } from "./delete-truc-hat-button"
import { TrangThaiButton } from "./trang-thai-button"
import { trucHatConfig } from "../config"
import { createSelectColumn } from "@/shared/components/data-display/table/create-select-column"
import { SortableHeader } from "@/shared/components"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

// Name cell component with navigation
function NameCell({ khachHang, id }: { khachHang: string | null; id: number }) {
    const navigate = useNavigate()
    
    return (
        <button
            onClick={() => navigate(`${trucHatConfig.routePath}/${id}`)}
            className="font-medium hover:underline truncate text-left w-full"
        >
            {khachHang || `Trục hạt #${id}`}
        </button>
    )
}

// Actions cell component
function ActionsCell({ row }: { row: TrucHat }) {
    const navigate = useNavigate()
    const id = row.id!
    const khachHang = row.khach_hang
    
    return (
        <div className="flex items-center gap-2 justify-end pr-4 w-full overflow-visible">
            <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                <TrangThaiButton trucHat={row} iconOnly />
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:text-blue-600 shrink-0"
                onClick={(e) => {
                    e.stopPropagation()
                    navigate(`${trucHatConfig.routePath}/${id}/sua`)
                }}
            >
                <span className="sr-only">Edit</span>
                <Edit className="h-4 w-4" />
            </Button>
            <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                <DeleteTrucHatButton id={id} name={khachHang || `ID: ${id}`} iconOnly />
            </div>
        </div>
    )
}

export const trucHatColumns: ColumnDef<TrucHat>[] = [
    createSelectColumn<TrucHat>(),
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
            const ngay = row.getValue(id) as string | null
            if (!ngay) return false
            const ngayStr = format(new Date(ngay), "dd/MM/yyyy", { locale: vi })
            return value.includes(ngayStr)
        },
        meta: {
            title: "Ngày",
            order: 0,
            minWidth: 100,
        },
    },
    {
        accessorKey: "ma_truc",
        header: ({ column }) => <SortableHeader column={column} title="Mã Trục" />,
        size: 120,
        minSize: 100,
        cell: ({ row }) => {
            const maTruc = row.getValue("ma_truc") as number | null
            return <div className="truncate">{maTruc ? String(maTruc) : "-"}</div>
        },
        meta: {
            title: "Mã Trục",
            order: 1,
            minWidth: 100,
        },
    },
    {
        accessorKey: "khach_hang",
        header: ({ column }) => <SortableHeader column={column} title="Khách Hàng" />,
        size: 200,
        minSize: 150,
        cell: ({ row }) => {
            const khachHang = row.getValue("khach_hang") as string | null
            const id = row.original.id!
            return <NameCell khachHang={khachHang} id={id} />
        },
        meta: {
            title: "Khách Hàng",
            order: 2,
            stickyLeft: true,
            stickyLeftOffset: 40,
            minWidth: 150,
        },
    },
    {
        accessorKey: "nhan_vien_bh_id",
        header: ({ column }) => <SortableHeader column={column} title="Nhân Viên BH" />,
        size: 200,
        minSize: 150,
        cell: ({ row }) => {
            const nhanVienBh = row.original.nhan_vien_bh
            const nhanVienBhId = row.getValue("nhan_vien_bh_id") as number | null
            if (!nhanVienBh) {
                return <div className="truncate">{nhanVienBhId ? String(nhanVienBhId) : "-"}</div>
            }
            return <div className="truncate">{`${nhanVienBh.ma_nhan_vien} - ${nhanVienBh.ho_ten}`}</div>
        },
        filterFn: (row, id, value) => {
            if (!value || !Array.isArray(value) || value.length === 0) {
                return true
            }
            const nhanVienBhId = row.getValue(id) as number | null | undefined
            if (nhanVienBhId === null || nhanVienBhId === undefined) {
                return false
            }
            return value.includes(String(nhanVienBhId))
        },
        meta: {
            title: "Nhân Viên BH",
            order: 3,
            minWidth: 150,
        },
    },
    {
        accessorKey: "trang_thai",
        header: ({ column }) => <SortableHeader column={column} title="Trạng Thái" />,
        size: 150,
        minSize: 120,
        cell: ({ row }) => {
            const trangThai = row.getValue("trang_thai") as string | null
            if (!trangThai) return <span className="text-muted-foreground">-</span>
            const colorMap: Record<string, string> = {
                "Mới": "bg-blue-500",
                "Đang vẽ": "bg-purple-500",
                "Đã đặt": "bg-orange-500",
                "Đang về": "bg-cyan-500",
                "Chờ kiểm tra": "bg-yellow-500",
                "Chờ sửa": "bg-amber-500",
                "Chờ giao": "bg-indigo-500",
                "Đã giao": "bg-green-500",
            }
            return (
                <Badge variant="outline" className={colorMap[trangThai] || "bg-gray-500"}>
                    {trangThai}
                </Badge>
            )
        },
        filterFn: (row, id, value) => {
            if (!value || !Array.isArray(value) || value.length === 0) {
                return true
            }
            const trangThai = row.getValue(id) as string | null
            if (!trangThai) return false
            return value.includes(trangThai)
        },
        meta: {
            title: "Trạng Thái",
            order: 4,
            minWidth: 120,
        },
    },
    {
        accessorKey: "ghi_chu",
        header: ({ column }) => <SortableHeader column={column} title="Ghi Chú" />,
        size: 250,
        minSize: 200,
        cell: ({ row }) => {
            const ghiChu = row.getValue("ghi_chu") as string | null
            if (!ghiChu) return <span className="text-muted-foreground">-</span>
            return <div className="line-clamp-2 text-sm">{ghiChu}</div>
        },
        meta: {
            title: "Ghi Chú",
            order: 5,
            minWidth: 200,
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
                    {nguoiTao ? `${maNhanVien} - ${nguoiTao.ho_ten}` : String(maNhanVien)}
                </div>
            )
        },
        filterFn: (row, id, value) => {
            if (!value || !Array.isArray(value) || value.length === 0) {
                return true
            }
            const nguoiTaoId = row.getValue(id) as number | null | undefined
            if (nguoiTaoId === null || nguoiTaoId === undefined) {
                return false
            }
            return value.includes(String(nguoiTaoId))
        },
        meta: {
            title: "Người Tạo",
            order: 6,
            minWidth: 150,
        },
    },
    {
        accessorKey: "tg_tao",
        header: ({ column }) => <SortableHeader column={column} title="Thời Gian Tạo" />,
        size: 150,
        minSize: 130,
        cell: ({ row }) => {
            const tgTao = row.getValue("tg_tao") as string | null
            if (!tgTao) return <span className="text-muted-foreground">-</span>
            try {
                return format(new Date(tgTao), "dd/MM/yyyy HH:mm", { locale: vi })
            } catch {
                return tgTao
            }
        },
        meta: {
            title: "Thời Gian Tạo",
            order: 7,
            minWidth: 130,
        },
    },
    {
        id: "actions",
        header: () => <div className="text-right">Thao Tác</div>,
        cell: ({ row }) => {
            return <ActionsCell row={row.original} />
        },
        enableSorting: false,
        enableHiding: false,
        size: 180,
        minSize: 180,
        meta: {
            title: "Thao Tác",
            order: 999,
            stickyRight: true,
            minWidth: 180,
        },
    },
]

