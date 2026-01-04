"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { TrangThaiKhachBuon } from "../schema"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { DeleteTrangThaiKhachBuonButton } from "./delete-trang-thai-khach-buon-button"
import { trangThaiKhachBuonConfig } from "../config"
import { createSelectColumn } from "@/shared/components/data-display/table/create-select-column"
import { SortableHeader } from "@/shared/components"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

// Name cell component with navigation
function NameCell({ name, id }: { name: string; id: number }) {
    const navigate = useNavigate()
    
    return (
        <button
            onClick={() => navigate(`${trangThaiKhachBuonConfig.routePath}/${id}`)}
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
                    navigate(`${trangThaiKhachBuonConfig.routePath}/${id}/sua?returnTo=list`)
                }}
            >
                <span className="sr-only">Edit</span>
                <Edit className="h-4 w-4" />
            </Button>
            <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                <DeleteTrangThaiKhachBuonButton id={id} name={name} iconOnly />
            </div>
        </div>
    )
}

export const trangThaiKhachBuonColumns = (): ColumnDef<TrangThaiKhachBuon>[] => [
    createSelectColumn<TrangThaiKhachBuon>(),
    {
        accessorKey: "ma_trang_thai",
        header: ({ column }) => <SortableHeader column={column} title="Mã Trạng Thái" />,
        cell: ({ row }) => {
            const maTrangThai = row.getValue("ma_trang_thai") as string | null | undefined
            return (
                <div className="min-w-[120px]">
                    {maTrangThai || "-"}
                </div>
            )
        },
        size: 150,
        minSize: 120,
        meta: {
            title: "Mã Trạng Thái",
            order: 1,
        },
    },
    {
        accessorKey: "ten_trang_thai",
        header: ({ column }) => <SortableHeader column={column} title="Tên Trạng Thái" />,
        cell: ({ row }) => {
            const trangThai = row.original
            return (
                <NameCell 
                    name={trangThai.ten_trang_thai} 
                    id={trangThai.id!} 
                />
            )
        },
        size: 250,
        minSize: 200,
        meta: {
            title: "Tên Trạng Thái",
            order: 2,
        },
    },
    {
        accessorKey: "ten_giai_doan",
        header: ({ column }) => <SortableHeader column={column} title="Giai Đoạn" />,
        filterFn: (row, _id, value) => {
            // Filter by giai_doan_id from row.original (not ten_giai_doan string value)
            // Filter options use giai_doan_id as values, but column displays ten_giai_doan
            const giaiDoanId = row.original.giai_doan_id
            if (!giaiDoanId) {
                return value.includes("null") || value.includes("")
            }
            return value.includes(String(giaiDoanId))
        },
        cell: ({ row }) => {
            const tenGiaiDoan = row.getValue("ten_giai_doan") as string | null | undefined
            return (
                <div className="min-w-[150px]">
                    {tenGiaiDoan || "-"}
                </div>
            )
        },
        size: 180,
        minSize: 150,
        meta: {
            title: "Giai Đoạn",
            order: 3,
        },
    },
    {
        accessorKey: "tt",
        header: ({ column }) => <SortableHeader column={column} title="Thứ Tự" />,
        cell: ({ row }) => {
            const tt = row.getValue("tt") as number | null | undefined
            return (
                <div className="text-center min-w-[80px]">
                    {tt ?? "-"}
                </div>
            )
        },
        size: 100,
        minSize: 80,
        meta: {
            title: "Thứ Tự",
            order: 4,
        },
    },
    {
        accessorKey: "mac_dinh_khoi_dau",
        header: ({ column }) => <SortableHeader column={column} title="Mặc Định Khởi Đầu" />,
        cell: ({ row }) => {
            const macDinhKhoiDau = row.getValue("mac_dinh_khoi_dau") as string | null | undefined
            return (
                <div className="min-w-[120px] text-center">
                    {macDinhKhoiDau === "YES" ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Có
                        </span>
                    ) : (
                        <span className="text-muted-foreground">Không</span>
                    )}
                </div>
            )
        },
        size: 150,
        minSize: 120,
        meta: {
            title: "Mặc Định Khởi Đầu",
            order: 5,
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
            order: 6,
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
            order: 7,
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
            order: 8,
        },
    },
    {
        id: "actions",
        header: () => <div className="text-right pr-4">Thao Tác</div>,
        cell: ({ row }) => {
            const trangThai = row.original
            return (
                <ActionsCell 
                    id={trangThai.id!} 
                    name={trangThai.ten_trang_thai} 
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

