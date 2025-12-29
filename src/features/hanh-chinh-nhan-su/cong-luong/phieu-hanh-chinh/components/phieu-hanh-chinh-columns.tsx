"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { PhieuHanhChinh } from "../schema"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { DeletePhieuHanhChinhButton } from "./delete-phieu-hanh-chinh-button"
import { phieuHanhChinhConfig } from "../config"
import { createSelectColumn } from "@/shared/components/data-display/table/create-select-column"
import { SortableHeader } from "@/shared/components"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { getLoaiPhieuBadgeClass } from "../utils/loai-phieu-colors"
import { getCaBadgeClass } from "../utils/ca-colors"
import { getComTruaBadgeClass } from "../utils/com-trua-colors"
import { getPhuongTienBadgeClass } from "../utils/phuong-tien-colors"

// Name cell component with navigation
function NameCell({ name, id }: { name: string; id: number }) {
    const navigate = useNavigate()
    
    return (
        <button
            onClick={() => navigate(`${phieuHanhChinhConfig.routePath}/${id}`)}
            className="font-medium truncate text-left w-full"
        >
            {name}
        </button>
    )
}

// Loai Phieu cell component with navigation
function LoaiPhieuCell({ loaiPhieu, id }: { loaiPhieu: string; id: number }) {
    const navigate = useNavigate()
    const badgeClass = getLoaiPhieuBadgeClass(loaiPhieu)
    
    return (
        <button
            onClick={() => navigate(`${phieuHanhChinhConfig.routePath}/${id}`)}
            className="truncate text-left w-full"
        >
            <Badge variant="outline" className={cn(badgeClass, "font-medium")}>
                {loaiPhieu}
            </Badge>
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
                    navigate(`${phieuHanhChinhConfig.routePath}/${id}/sua`)
                }}
            >
                <span className="sr-only">Edit</span>
                <Edit className="h-4 w-4" />
            </Button>
            <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                <DeletePhieuHanhChinhButton id={id} name={name} iconOnly />
            </div>
        </div>
    )
}

export const phieuHanhChinhColumns: ColumnDef<PhieuHanhChinh>[] = [
    // ⚡ Professional: Use generic select column utility
    createSelectColumn<PhieuHanhChinh>(),
    {
        accessorKey: "ngay",
        header: ({ column }) => <SortableHeader column={column} title="Ngày" />,
        size: 120,
        minSize: 100,
        meta: {
            title: "Ngày",
            order: 1,
            stickyLeft: true,
            stickyLeftOffset: 40, // After checkbox column
            minWidth: 100,
        },
        filterFn: (row, id, value) => {
            const date = row.getValue(id) as string | Date | null
            if (!date) return false
            if (!value || !Array.isArray(value) || value.length === 0) return true
            try {
                const dateObj = date instanceof Date ? date : new Date(date)
                const dateStr = format(dateObj, "dd/MM/yyyy", { locale: vi })
                return value.includes(dateStr)
            } catch {
                return value.includes(String(date))
            }
        },
        cell: ({ row }) => {
            const ngay = row.getValue("ngay") as string | Date | null
            const id = row.original.id!
            
            if (!ngay) {
                return <NameCell name="-" id={id} />
            }

            try {
                const date = ngay instanceof Date ? ngay : new Date(ngay)
                const formatted = format(date, "dd/MM/yyyy", { locale: vi })
                return <NameCell name={formatted} id={id} />
            } catch {
                return <NameCell name={String(ngay)} id={id} />
            }
        },
    },
    {
        accessorKey: "loai_phieu",
        header: ({ column }) => <SortableHeader column={column} title="Loại Phiếu" />,
        size: 150,
        minSize: 120,
        filterFn: (row, id, value) => {
            const loaiPhieu = row.getValue(id) as string | null
            if (!value || !Array.isArray(value) || value.length === 0) return true
            if (loaiPhieu === null || loaiPhieu === undefined || loaiPhieu === "") return false
            return value.includes(loaiPhieu)
        },
        meta: {
            title: "Loại Phiếu",
            order: 2,
            stickyLeft: true,
            stickyLeftOffset: 40,
            minWidth: 120,
        },
        cell: ({ row }) => {
            const loaiPhieu = row.getValue("loai_phieu") as string | null
            const id = row.original.id!
            
            if (!loaiPhieu || loaiPhieu === "") {
                return <NameCell name="-" id={id} />
            }
            
            return (
                <LoaiPhieuCell loaiPhieu={loaiPhieu} id={id} />
            )
        },
    },
    {
        accessorKey: "ma_phieu",
        header: ({ column }) => <SortableHeader column={column} title="Mã Phiếu" />,
        size: 200,
        minSize: 150,
        filterFn: (row, id, value) => {
            const maPhieu = row.getValue(id) as string
            if (!maPhieu) return false
            if (!value || !Array.isArray(value) || value.length === 0) return true
            return value.includes(maPhieu)
        },
        meta: {
            title: "Mã Phiếu",
            order: 3,
            stickyLeft: true,
            stickyLeftOffset: 40,
            minWidth: 150,
        },
        cell: ({ row }) => {
            const maPhieu = row.getValue("ma_phieu") as string
            const tenNhomPhieu = row.original.ten_nhom_phieu as string | null
            const id = row.original.id!
            const displayText = tenNhomPhieu 
                ? `${maPhieu} - ${tenNhomPhieu}`
                : maPhieu
            return <NameCell name={displayText} id={id} />
        },
    },
    {
        accessorKey: "ca",
        header: ({ column }) => <SortableHeader column={column} title="Ca" />,
        size: 100,
        minSize: 80,
        cell: ({ row }) => {
            const ca = row.getValue("ca") as string | null
            if (ca === null || ca === undefined || ca === "") {
                return <span className="text-muted-foreground">-</span>
            }
            const badgeClass = getCaBadgeClass(ca)
            return (
                <Badge variant="outline" className={cn(badgeClass, "font-medium")}>
                    {ca}
                </Badge>
            )
        },
        meta: {
            title: "Ca",
            order: 4,
            minWidth: 80,
        },
    },
    {
        accessorKey: "so_gio",
        header: ({ column }) => <SortableHeader column={column} title="Số Giờ" />,
        size: 100,
        minSize: 80,
        cell: ({ row }) => {
            const soGio = row.getValue("so_gio") as number | null
            if (soGio === null || soGio === undefined) {
                return <span className="text-muted-foreground">-</span>
            }
            return <span className="font-medium">{soGio}</span>
        },
        meta: {
            title: "Số Giờ",
            order: 5,
            minWidth: 80,
        },
    },
    {
        accessorKey: "ly_do",
        header: ({ column }) => <SortableHeader column={column} title="Lý Do" />,
        size: 200,
        minSize: 150,
        cell: ({ row }) => {
            const lyDo = row.getValue("ly_do") as string | null
            if (lyDo === null || lyDo === undefined || lyDo === "") {
                return <span className="text-muted-foreground">-</span>
            }
            return <span className="truncate">{lyDo}</span>
        },
        meta: {
            title: "Lý Do",
            order: 6,
            minWidth: 150,
        },
    },
    {
        accessorKey: "com_trua",
        header: ({ column }) => <SortableHeader column={column} title="Cơm Trưa" />,
        size: 100,
        minSize: 80,
        cell: ({ row }) => {
            const comTrua = row.getValue("com_trua") as boolean | null
            if (comTrua === null || comTrua === undefined) {
                return <span className="text-muted-foreground">-</span>
            }
            const badgeClass = getComTruaBadgeClass(comTrua)
            return (
                <Badge variant="outline" className={cn(badgeClass, "gap-1 font-medium")}>
                    {comTrua ? (
                        <>
                            <CheckCircle2 className="h-3 w-3" />
                            Có
                        </>
                    ) : (
                        <>
                            <XCircle className="h-3 w-3" />
                            Không
                        </>
                    )}
                </Badge>
            )
        },
        meta: {
            title: "Cơm Trưa",
            order: 7,
            minWidth: 80,
        },
    },
    {
        accessorKey: "phuong_tien",
        header: ({ column }) => <SortableHeader column={column} title="Phương Tiện" />,
        size: 120,
        minSize: 100,
        cell: ({ row }) => {
            const phuongTien = row.getValue("phuong_tien") as string | null
            if (phuongTien === null || phuongTien === undefined || phuongTien === "") {
                return <span className="text-muted-foreground">-</span>
            }
            const badgeClass = getPhuongTienBadgeClass(phuongTien)
            return (
                <Badge variant="outline" className={cn(badgeClass, "font-medium")}>
                    {phuongTien}
                </Badge>
            )
        },
        meta: {
            title: "Phương Tiện",
            order: 8,
            minWidth: 100,
        },
    },
    {
        accessorKey: "trang_thai",
        header: ({ column }) => <SortableHeader column={column} title="Trạng Thái" />,
        size: 120,
        minSize: 100,
        filterFn: (row, id, value) => {
            const trangThai = row.getValue(id) as string | null
            if (!value || !Array.isArray(value) || value.length === 0) return true
            if (trangThai === null || trangThai === undefined || trangThai === "") return false
            return value.includes(trangThai)
        },
        cell: ({ row }) => {
            const trangThai = row.getValue("trang_thai") as string | null
            if (trangThai === null || trangThai === undefined || trangThai === "") {
                return <span className="text-muted-foreground">-</span>
            }
            const variant = trangThai === "Đã duyệt" ? "default" : trangThai === "Từ chối" ? "destructive" : "secondary"
            return (
                <Badge variant={variant}>
                    {trangThai}
                </Badge>
            )
        },
        meta: {
            title: "Trạng Thái",
            order: 9,
            minWidth: 100,
        },
    },
    {
        accessorKey: "quan_ly_duyet",
        header: ({ column }) => <SortableHeader column={column} title="QL Duyệt" />,
        size: 100,
        minSize: 80,
        filterFn: (row, id, value) => {
            const duyet = row.getValue(id) as boolean | null
            if (!value || !Array.isArray(value) || value.length === 0) return true
            if (duyet === null || duyet === undefined) return false
            return value.includes(String(duyet))
        },
        cell: ({ row }) => {
            const duyet = row.getValue("quan_ly_duyet") as boolean | null
            if (duyet === null || duyet === undefined) {
                return <span className="text-muted-foreground">-</span>
            }
            return (
                <Badge variant={duyet ? "default" : "secondary"} className="gap-1">
                    {duyet ? (
                        <>
                            <CheckCircle2 className="h-3 w-3" />
                            Đã duyệt
                        </>
                    ) : (
                        <>
                            <XCircle className="h-3 w-3" />
                            Chưa duyệt
                        </>
                    )}
                </Badge>
            )
        },
        meta: {
            title: "QL Duyệt",
            order: 10,
            minWidth: 80,
        },
    },
    {
        accessorKey: "ten_quan_ly",
        header: ({ column }) => <SortableHeader column={column} title="Tên Quản Lý" />,
        size: 150,
        minSize: 120,
        cell: ({ row }) => {
            const tenQuanLy = row.getValue("ten_quan_ly") as string | null
            if (tenQuanLy === null || tenQuanLy === undefined || tenQuanLy === "") {
                return <span className="text-muted-foreground">-</span>
            }
            return <span className="truncate">{tenQuanLy}</span>
        },
        meta: {
            title: "Tên Quản Lý",
            order: 10.1,
            minWidth: 120,
        },
    },
    {
        accessorKey: "tg_quan_ly_duyet",
        header: ({ column }) => <SortableHeader column={column} title="TG QL Duyệt" />,
        size: 160,
        minSize: 140,
        cell: ({ row }) => {
            const date = row.getValue("tg_quan_ly_duyet") as string | null | undefined
            if (!date) return <span className="text-muted-foreground">-</span>
            try {
                return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: vi })
            } catch {
                return date
            }
        },
        meta: {
            title: "TG QL Duyệt",
            order: 10.2,
            minWidth: 140,
        },
    },
    {
        accessorKey: "hcns_duyet",
        header: ({ column }) => <SortableHeader column={column} title="HCNS Duyệt" />,
        size: 100,
        minSize: 80,
        filterFn: (row, id, value) => {
            const duyet = row.getValue(id) as boolean | null
            if (!value || !Array.isArray(value) || value.length === 0) return true
            if (duyet === null || duyet === undefined) return false
            return value.includes(String(duyet))
        },
        cell: ({ row }) => {
            const duyet = row.getValue("hcns_duyet") as boolean | null
            if (duyet === null || duyet === undefined) {
                return <span className="text-muted-foreground">-</span>
            }
            return (
                <Badge variant={duyet ? "default" : "secondary"} className="gap-1">
                    {duyet ? (
                        <>
                            <CheckCircle2 className="h-3 w-3" />
                            Đã duyệt
                        </>
                    ) : (
                        <>
                            <XCircle className="h-3 w-3" />
                            Chưa duyệt
                        </>
                    )}
                </Badge>
            )
        },
        meta: {
            title: "HCNS Duyệt",
            order: 11,
            minWidth: 80,
        },
    },
    {
        accessorKey: "ten_hcns",
        header: ({ column }) => <SortableHeader column={column} title="Tên HCNS" />,
        size: 150,
        minSize: 120,
        cell: ({ row }) => {
            const tenHcns = row.getValue("ten_hcns") as string | null
            if (tenHcns === null || tenHcns === undefined || tenHcns === "") {
                return <span className="text-muted-foreground">-</span>
            }
            return <span className="truncate">{tenHcns}</span>
        },
        meta: {
            title: "Tên HCNS",
            order: 11.1,
            minWidth: 120,
        },
    },
    {
        accessorKey: "tg_hcns_duyet",
        header: ({ column }) => <SortableHeader column={column} title="TG HCNS Duyệt" />,
        size: 160,
        minSize: 140,
        cell: ({ row }) => {
            const date = row.getValue("tg_hcns_duyet") as string | null | undefined
            if (!date) return <span className="text-muted-foreground">-</span>
            try {
                return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: vi })
            } catch {
                return date
            }
        },
        meta: {
            title: "TG HCNS Duyệt",
            order: 11.2,
            minWidth: 140,
        },
    },
    {
        accessorKey: "nguoi_tao_id",
        header: ({ column }) => <SortableHeader column={column} title="Người Tạo" />,
        size: 180,
        minSize: 150,
        cell: ({ row }) => {
            const nguoiTaoId = row.getValue("nguoi_tao_id") as number | null
            const nguoiTaoTen = row.original.nguoi_tao_ten as string | null
            if (nguoiTaoId === null || nguoiTaoId === undefined) {
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
        meta: {
            title: "Người Tạo",
            order: 12,
            minWidth: 150,
        },
    },
    {
        accessorKey: "tg_tao",
        header: ({ column }) => <SortableHeader column={column} title="Thời gian tạo" />,
        size: 160,
        minSize: 140,
        filterFn: (row, id, value) => {
            const date = row.getValue(id) as string | null | undefined
            if (!date) return false
            if (!value || !Array.isArray(value) || value.length === 0) return true
            try {
                const dateObj = new Date(date)
                const dateStr = format(dateObj, "dd/MM/yyyy", { locale: vi })
                return value.includes(dateStr)
            } catch {
                return value.includes(String(date))
            }
        },
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
            order: 13,
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
                return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: vi })
            } catch {
                return date
            }
        },
        meta: {
            title: "Thời gian cập nhật",
            order: 14,
            minWidth: 140,
        },
    },
    {
        id: "actions",
        header: () => <div className="text-right pr-4">Thao tác</div>,
        cell: ({ row }) => {
            const phieu = row.original
            return (
                <ActionsCell
                    id={phieu.id!}
                    name={phieu.ma_phieu || "Phiếu hành chính"}
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

