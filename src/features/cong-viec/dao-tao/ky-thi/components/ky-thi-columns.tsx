"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { KyThi } from "../schema"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { DeleteKyThiButton } from "./delete-ky-thi-button"
import { kyThiConfig } from "../config"
import { createSelectColumn } from "@/shared/components/data-display/table/create-select-column"
import { SortableHeader } from "@/shared/components"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import type { NhanSu } from "@/features/he-thong/nhan-su/danh-sach-nhan-su/schema"

// Name cell component with navigation
function NameCell({ name, id }: { name: string; id: number }) {
    const navigate = useNavigate()
    
    return (
        <button
            onClick={() => navigate(`${kyThiConfig.routePath}/${id}`)}
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
                    navigate(`${kyThiConfig.routePath}/${id}/sua?returnTo=list`)
                }}
            >
                <span className="sr-only">Edit</span>
                <Edit className="h-4 w-4" />
            </Button>
            <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                <DeleteKyThiButton id={id} name={name} iconOnly />
            </div>
        </div>
    )
}

export const kyThiColumns = (
    myBaiThiMap?: Map<number, { status: string; diem_so?: number; tong_so_cau?: number }>,
    employee?: NhanSu | null
): ColumnDef<KyThi>[] => [
    createSelectColumn<KyThi>(),
    {
        accessorKey: "ngay",
        header: ({ column }) => <SortableHeader column={column} title="Ngày" />,
        cell: ({ row }) => {
            const ngay = row.getValue("ngay") as string | null | undefined
            if (!ngay) return <div className="text-muted-foreground">-</div>
            try {
                return (
                    <div className="min-w-[120px]">
                        {format(new Date(ngay), "dd/MM/yyyy", { locale: vi })}
                    </div>
                )
            } catch {
                return <div className="text-muted-foreground">-</div>
            }
        },
        size: 120,
        minSize: 100,
        meta: {
            title: "Ngày",
            order: 1,
        },
    },
    {
        accessorKey: "ten_ky_thi",
        header: ({ column }) => <SortableHeader column={column} title="Tên Kỳ Thi" />,
        cell: ({ row }) => {
            const kyThi = row.original
            const tenKyThi = kyThi.ten_ky_thi || ""
            return (
                <NameCell 
                    name={tenKyThi.length > 80 ? `${tenKyThi.substring(0, 80)}...` : tenKyThi} 
                    id={kyThi.id!} 
                />
            )
        },
        size: 400,
        minSize: 300,
        meta: {
            title: "Tên Kỳ Thi",
            order: 2,
        },
    },
    {
        accessorKey: "trang_thai",
        header: ({ column }) => <SortableHeader column={column} title="Trạng Thái" />,
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
        cell: ({ row }) => {
            const trangThai = row.getValue("trang_thai") as string
            const variant = trangThai === "Mở" ? "default" : "secondary"
            return (
                <div className="min-w-[100px]">
                    <Badge variant={variant}>{trangThai}</Badge>
                </div>
            )
        },
        size: 120,
        minSize: 100,
        meta: {
            title: "Trạng Thái",
            order: 3,
        },
    },
    {
        accessorKey: "so_cau_hoi",
        header: ({ column }) => <SortableHeader column={column} title="Số Câu Hỏi" />,
        cell: ({ row }) => {
            const soCauHoi = row.getValue("so_cau_hoi") as number
            return (
                <div className="min-w-[100px] text-center">
                    {soCauHoi}
                </div>
            )
        },
        size: 100,
        minSize: 80,
        meta: {
            title: "Số Câu Hỏi",
            order: 4,
        },
    },
    {
        accessorKey: "so_phut_lam_bai",
        header: ({ column }) => <SortableHeader column={column} title="Số Phút" />,
        cell: ({ row }) => {
            const soPhut = row.getValue("so_phut_lam_bai") as number
            return (
                <div className="min-w-[100px] text-center">
                    {soPhut} phút
                </div>
            )
        },
        size: 100,
        minSize: 80,
        meta: {
            title: "Số Phút",
            order: 5,
        },
    },
    // Trạng thái của tôi - chỉ hiển thị với kỳ thi user có quyền thi
    ...(employee && myBaiThiMap ? [{
        id: "trang_thai_cua_toi",
        accessorKey: "trang_thai_cua_toi",
        header: () => <div className="text-center">Trạng thái của tôi</div>,
        cell: ({ row }: { row: { original: KyThi } }) => {
            const kyThi = row.original
            if (!kyThi.id) return <div className="text-muted-foreground">-</div>

            // Check if user can take this test
            const canTakeTest = !kyThi.chuc_vu_ids || kyThi.chuc_vu_ids.length === 0 || 
                (employee.chuc_vu_id && kyThi.chuc_vu_ids.includes(employee.chuc_vu_id))

            if (!canTakeTest) {
                // User không có quyền thi - không hiển thị gì
                return <div className="text-muted-foreground text-xs">-</div>
            }

            const myBaiThi = myBaiThiMap.get(kyThi.id)
            if (!myBaiThi) {
                return (
                    <div className="min-w-[120px] text-center">
                        <Badge variant="outline" className="bg-muted text-muted-foreground">
                            Chưa thi
                        </Badge>
                    </div>
                )
            }

            const { status, diem_so, tong_so_cau } = myBaiThi
            let variant: "default" | "secondary" | "destructive" | "outline" = "secondary"
            let badgeText = status

            if (status === "Đạt") {
                variant = "default"
            } else if (status === "Không đạt") {
                variant = "destructive"
            } else if (status === "Đang thi") {
                variant = "outline"
            }

            // Hiển thị điểm số nếu có
            const scoreText = diem_so !== undefined && tong_so_cau !== undefined 
                ? ` (${diem_so}/${tong_so_cau})`
                : ""

            return (
                <div className="min-w-[120px] text-center">
                    <Badge variant={variant}>
                        {badgeText}{scoreText}
                    </Badge>
                </div>
            )
        },
        size: 150,
        minSize: 120,
        enableSorting: false,
        meta: {
            title: "Trạng thái của tôi",
            order: 6,
        },
    }] : []),
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
            order: 7,
        },
    },
    {
        id: "actions",
        header: () => <div className="text-right pr-4">Thao Tác</div>,
        cell: ({ row }) => {
            const kyThi = row.original
            return (
                <ActionsCell 
                    id={kyThi.id!} 
                    name={kyThi.ten_ky_thi.substring(0, 50)} 
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

