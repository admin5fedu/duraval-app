"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { ChamOle } from "../schema"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { DeleteChamOleButton } from "./delete-cham-ole-button"
import { chamOleConfig } from "../config"
import { createSelectColumn } from "@/shared/components/data-display/table/create-select-column"
import { SortableHeader } from "@/shared/components"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"

// Name cell component with navigation
function NameCell({ nhanVienId, id }: { nhanVienId: number | null; id: number }) {
    const navigate = useNavigate()
    
    return (
        <button
            onClick={() => navigate(`${chamOleConfig.routePath}/${id}`)}
            className="font-medium hover:underline truncate text-left w-full"
        >
            {nhanVienId ? `NV${nhanVienId}` : `ID: ${id}`}
        </button>
    )
}

// Name cell with navigate for when nhan_vien exists
function NameCellWithNavigate({ id, nhanVien }: { id: number; nhanVien: { ma_nhan_vien: number; ho_ten: string } }) {
    const navigate = useNavigate()
    
    return (
        <button
            onClick={() => navigate(`${chamOleConfig.routePath}/${id}`)}
            className="font-medium hover:underline truncate text-left w-full"
        >
            {nhanVien.ma_nhan_vien} - {nhanVien.ho_ten}
        </button>
    )
}

// Actions cell component
function ActionsCell({ id, nhanVienId }: { id: number; nhanVienId: number | null }) {
    const navigate = useNavigate()
    
    return (
        <div className="flex items-center gap-2 justify-end pr-4 min-w-[140px]">
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:text-blue-600 shrink-0"
                onClick={(e) => {
                    e.stopPropagation()
                    navigate(`${chamOleConfig.routePath}/${id}/sua`)
                }}
            >
                <span className="sr-only">Edit</span>
                <Edit className="h-4 w-4" />
            </Button>
            <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                <DeleteChamOleButton id={id} name={nhanVienId ? `NV${nhanVienId}` : `ID: ${id}`} iconOnly />
            </div>
        </div>
    )
}

export const chamOleColumns: ColumnDef<ChamOle>[] = [
    // ⚡ Professional: Use generic select column utility
    createSelectColumn<ChamOle>(),
    {
        accessorKey: "nhan_vien_id",
        header: ({ column }) => <SortableHeader column={column} title="Nhân Viên" />,
        size: 200,
        minSize: 150,
        cell: ({ row }) => {
            const nhanVien = row.original.nhan_vien
            const id = row.original.id!
            if (nhanVien) {
                return <NameCellWithNavigate id={id} nhanVien={nhanVien} />
            }
            return <NameCell nhanVienId={row.original.nhan_vien_id ?? null} id={id} />
        },
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
            title: "Nhân Viên",
            order: 1,
            stickyLeft: true,
            stickyLeftOffset: 40, // After checkbox column
            minWidth: 150,
        },
    },
    {
        accessorKey: "nam",
        header: ({ column }) => <SortableHeader column={column} title="Năm" />,
        size: 100,
        minSize: 80,
        cell: ({ row }) => {
            const nam = row.getValue("nam") as number | null
            if (nam === null || nam === undefined) return <span className="text-muted-foreground">-</span>
            return <span>{nam}</span>
        },
        meta: {
            title: "Năm",
            order: 2,
            minWidth: 80,
        },
    },
    {
        accessorKey: "thang",
        header: ({ column }) => <SortableHeader column={column} title="Tháng" />,
        size: 100,
        minSize: 80,
        cell: ({ row }) => {
            const thang = row.getValue("thang") as number | null
            if (thang === null || thang === undefined) return <span className="text-muted-foreground">-</span>
            return <span>{thang}</span>
        },
        meta: {
            title: "Tháng",
            order: 3,
            minWidth: 80,
        },
    },
    {
        accessorKey: "phong_id",
        header: ({ column }) => <SortableHeader column={column} title="Phòng" />,
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
        filterFn: (row, id, value) => {
            if (!value || !Array.isArray(value) || value.length === 0) {
                return true
            }
            const phongId = row.getValue(id) as number | null | undefined
            if (phongId === null || phongId === undefined) {
                return false
            }
            return value.includes(String(phongId))
        },
        meta: {
            title: "Phòng",
            order: 4,
            minWidth: 150,
        },
    },
    {
        accessorKey: "chuc_vu_id",
        header: ({ column }) => <SortableHeader column={column} title="Chức Vụ" />,
        size: 150,
        minSize: 120,
        cell: ({ row }) => {
            const chucVu = row.original.chuc_vu
            if (!chucVu) {
                return <span className="text-muted-foreground">-</span>
            }
            return <span>{chucVu.ten_chuc_vu}</span>
        },
        filterFn: (row, id, value) => {
            if (!value || !Array.isArray(value) || value.length === 0) {
                return true
            }
            const chucVuId = row.getValue(id) as number | null | undefined
            if (chucVuId === null || chucVuId === undefined) {
                return false
            }
            return value.includes(String(chucVuId))
        },
        meta: {
            title: "Chức Vụ",
            order: 5,
            minWidth: 120,
        },
    },
    {
        accessorKey: "danh_gia",
        header: ({ column }) => <SortableHeader column={column} title="Đánh Giá" />,
        size: 140,
        minSize: 120,
        cell: ({ row }) => {
            const danhGia = row.getValue("danh_gia") as string | null
            if (!danhGia) return <span className="text-muted-foreground">-</span>
            
            // Format rules cho đánh giá
            const isDat = danhGia === "Đạt"
            const badgeClassName = isDat
                ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
            
            return (
                <Badge variant="outline" className={badgeClassName}>
                    {danhGia}
                </Badge>
            )
        },
        filterFn: (row, id, value) => {
            if (!value || !Array.isArray(value) || value.length === 0) {
                return true
            }
            const danhGia = row.getValue(id) as string | null
            if (!danhGia) return false
            return value.includes(danhGia)
        },
        meta: {
            title: "Đánh Giá",
            order: 6,
            minWidth: 120,
        },
    },
    {
        accessorKey: "ole",
        header: ({ column }) => <SortableHeader column={column} title="OLE" />,
        size: 100,
        minSize: 80,
        cell: ({ row }) => {
            const ole = row.getValue("ole") as number | null
            if (ole === null || ole === undefined) return <span className="text-muted-foreground">0</span>
            return <span>{ole.toLocaleString("vi-VN")}</span>
        },
        meta: {
            title: "OLE",
            order: 7,
            minWidth: 80,
        },
    },
    {
        accessorKey: "kpi",
        header: ({ column }) => <SortableHeader column={column} title="KPI" />,
        size: 100,
        minSize: 80,
        cell: ({ row }) => {
            const kpi = row.getValue("kpi") as number | null
            if (kpi === null || kpi === undefined) return <span className="text-muted-foreground">0</span>
            return <span>{kpi.toLocaleString("vi-VN")}</span>
        },
        meta: {
            title: "KPI",
            order: 8,
            minWidth: 80,
        },
    },
    {
        accessorKey: "cong",
        header: ({ column }) => <SortableHeader column={column} title="Cộng" />,
        size: 100,
        minSize: 80,
        cell: ({ row }) => {
            const cong = row.getValue("cong") as number | null
            if (cong === null || cong === undefined) return <span className="text-muted-foreground">0</span>
            return <span>{cong.toLocaleString("vi-VN")}</span>
        },
        meta: {
            title: "Cộng",
            order: 9,
            minWidth: 80,
        },
    },
    {
        accessorKey: "tru",
        header: ({ column }) => <SortableHeader column={column} title="Trừ" />,
        size: 100,
        minSize: 80,
        cell: ({ row }) => {
            const tru = row.getValue("tru") as number | null
            if (tru === null || tru === undefined) return <span className="text-muted-foreground">0</span>
            return <span>{tru.toLocaleString("vi-VN")}</span>
        },
        meta: {
            title: "Trừ",
            order: 10,
            minWidth: 80,
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
            order: 11,
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
            order: 12,
            minWidth: 140,
        },
    },
    {
        id: "actions",
        header: () => <div className="text-right pr-4">Thao tác</div>,
        cell: ({ row }) => {
            const chamOle = row.original
            return (
                <ActionsCell
                    id={chamOle.id!}
                    nhanVienId={chamOle.nhan_vien_id ?? null}
                />
            )
        },
        enableSorting: false,
        enableHiding: false,
        size: 160,
        minSize: 140,
        meta: {
            title: "Thao tác",
            order: 99,
            stickyRight: true,
            minWidth: 100,
        },
    },
]

