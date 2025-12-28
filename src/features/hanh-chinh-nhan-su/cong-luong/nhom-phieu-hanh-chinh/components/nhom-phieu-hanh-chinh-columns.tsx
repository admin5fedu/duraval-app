"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { NhomPhieuHanhChinh } from "../schema"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { DeleteNhomPhieuHanhChinhButton } from "./delete-nhom-phieu-hanh-chinh-button"
import { nhomPhieuHanhChinhConfig } from "../config"
import { createSelectColumn } from "@/shared/components/data-display/table/create-select-column"
import { SortableHeader } from "@/shared/components"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { getLoaiPhieuBadgeClass } from "../utils/loai-phieu-colors"

// Name cell component with navigation
function NameCell({ name, id }: { name: string; id: number }) {
    const navigate = useNavigate()
    
    return (
        <button
            onClick={() => navigate(`${nhomPhieuHanhChinhConfig.routePath}/${id}`)}
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
                    navigate(`${nhomPhieuHanhChinhConfig.routePath}/${id}/sua`)
                }}
            >
                <span className="sr-only">Edit</span>
                <Edit className="h-4 w-4" />
            </Button>
            <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                <DeleteNhomPhieuHanhChinhButton id={id} name={name} iconOnly />
            </div>
        </div>
    )
}

export const nhomPhieuHanhChinhColumns: ColumnDef<NhomPhieuHanhChinh>[] = [
    // ⚡ Professional: Use generic select column utility
    createSelectColumn<NhomPhieuHanhChinh>(),
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
            order: 1,
            stickyLeft: true,
            stickyLeftOffset: 40, // After checkbox column
            minWidth: 120,
        },
        cell: ({ row }) => {
            const loaiPhieu = row.getValue("loai_phieu") as string | null
            const id = row.original.id!
            
            if (!loaiPhieu || loaiPhieu === "") {
                return (
                    <button
                        onClick={() => navigate(`${nhomPhieuHanhChinhConfig.routePath}/${id}`)}
                        className="font-medium hover:underline truncate text-left w-full text-muted-foreground"
                    >
                        -
                    </button>
                )
            }

            const badgeClass = getLoaiPhieuBadgeClass(loaiPhieu)
            
            return (
                <button
                    onClick={() => navigate(`${nhomPhieuHanhChinhConfig.routePath}/${id}`)}
                    className="hover:underline truncate text-left w-full"
                >
                    <Badge variant="outline" className={cn(badgeClass, "font-medium")}>
                        {loaiPhieu}
                    </Badge>
                </button>
            )
        },
    },
    {
        accessorKey: "ma_nhom_phieu",
        header: ({ column }) => <SortableHeader column={column} title="Mã Nhóm Phiếu" />,
        size: 150,
        minSize: 120,
        meta: {
            title: "Mã Nhóm Phiếu",
            order: 2,
            stickyLeft: true,
            stickyLeftOffset: 40, // After checkbox column
            minWidth: 120,
        },
        cell: ({ row }) => {
            const maNhomPhieu = row.getValue("ma_nhom_phieu") as string
            const id = row.original.id!
            return (
                <NameCell name={maNhomPhieu} id={id} />
            )
        },
    },
    {
        accessorKey: "ten_nhom_phieu",
        header: ({ column }) => <SortableHeader column={column} title="Tên Nhóm Phiếu" />,
        size: 250,
        minSize: 200,
        cell: ({ row }) => {
            const tenNhomPhieu = row.getValue("ten_nhom_phieu") as string
            const id = row.original.id!
            return <NameCell name={tenNhomPhieu} id={id} />
        },
        meta: {
            title: "Tên Nhóm Phiếu",
            order: 3,
            minWidth: 200,
        },
    },
    {
        accessorKey: "so_luong_cho_phep_thang",
        header: ({ column }) => <SortableHeader column={column} title="Số Lượng/Tháng" />,
        size: 120,
        minSize: 100,
        cell: ({ row }) => {
            const soLuong = row.getValue("so_luong_cho_phep_thang") as number | null
            if (soLuong === null || soLuong === undefined) return <span className="text-muted-foreground">-</span>
            return <span className="font-medium">{soLuong}</span>
        },
        meta: {
            title: "Số Lượng/Tháng",
            order: 4,
            minWidth: 100,
        },
    },
    {
        accessorKey: "can_hcns_duyet",
        header: ({ column }) => <SortableHeader column={column} title="Cần HCNS Duyệt" />,
        size: 140,
        minSize: 120,
        filterFn: (row, id, value) => {
            const canDuyet = row.getValue(id) as string | null
            if (!value || !Array.isArray(value) || value.length === 0) return true
            if (canDuyet === null || canDuyet === undefined) return false
            return value.includes(canDuyet)
        },
        cell: ({ row }) => {
            const canDuyet = row.getValue("can_hcns_duyet") as string | null
            if (canDuyet === null || canDuyet === undefined || canDuyet === "") {
                return <span className="text-muted-foreground">-</span>
            }
            const isCo = canDuyet === "Có"
            return (
                <Badge variant={isCo ? "default" : "secondary"} className="gap-1">
                    {isCo ? (
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
            title: "Cần HCNS Duyệt",
            order: 5,
            minWidth: 120,
        },
    },
    {
        accessorKey: "ca_toi",
        header: ({ column }) => <SortableHeader column={column} title="Ca Tối" />,
        size: 100,
        minSize: 80,
        filterFn: (row, id, value) => {
            const caToi = row.getValue(id) as string | null
            if (!value || !Array.isArray(value) || value.length === 0) return true
            if (caToi === null || caToi === undefined || caToi === "") {
                // Check if filter includes empty/null option
                return value.includes("") || value.includes(null)
            }
            return value.includes(caToi)
        },
        cell: ({ row }) => {
            const caToi = row.getValue("ca_toi") as string | null
            if (caToi === null || caToi === undefined || caToi === "") {
                return <span className="text-muted-foreground">-</span>
            }
            const isCo = caToi === "Có"
            return (
                <Badge variant={isCo ? "default" : "secondary"} className="gap-1">
                    {isCo ? (
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
            title: "Ca Tối",
            order: 6,
            minWidth: 80,
        },
    },
    {
        accessorKey: "nguoi_tao_id",
        header: ({ column }) => <SortableHeader column={column} title="Người Tạo" />,
        size: 180,
        minSize: 150,
        filterFn: (row, id, value) => {
            const nguoiTaoId = row.getValue(id) as number | null
            if (!value || !Array.isArray(value) || value.length === 0) return true
            if (nguoiTaoId === null || nguoiTaoId === undefined) return false
            // Convert value to number for comparison (filter values come as strings)
            return value.some((v: string | number) => Number(v) === nguoiTaoId)
        },
        cell: ({ row }) => {
            const nguoiTaoId = row.getValue("nguoi_tao_id") as number | null
            const nguoiTaoTen = row.original.nguoi_tao_ten as string | null
            const nguoiTaoMaNhanVien = (row.original as any).nguoi_tao?.ma_nhan_vien as number | null
            if (nguoiTaoId === null || nguoiTaoId === undefined) {
                return <span className="text-muted-foreground">-</span>
            }
            // Use ma_nhan_vien from joined data if available, otherwise use nguoi_tao_id
            const maNhanVien = nguoiTaoMaNhanVien || nguoiTaoId
            return (
                <div className="min-w-[150px]">
                    {nguoiTaoTen 
                        ? `${maNhanVien} - ${nguoiTaoTen}`
                        : maNhanVien.toString()
                    }
                </div>
            )
        },
        meta: {
            title: "Người Tạo",
            order: 7,
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
                return new Date(date).toLocaleString("vi-VN")
            } catch {
                return date
            }
        },
        meta: {
            title: "Thời gian tạo",
            order: 8,
            minWidth: 140,
        },
    },
    {
        id: "actions",
        header: () => <div className="text-right pr-4">Thao tác</div>,
        cell: ({ row }) => {
            const nhomPhieu = row.original
            return (
                <ActionsCell
                    id={nhomPhieu.id!}
                    name={nhomPhieu.ten_nhom_phieu}
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

