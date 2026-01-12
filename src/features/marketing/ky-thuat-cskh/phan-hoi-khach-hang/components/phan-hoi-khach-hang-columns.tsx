"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { PhanHoiKhachHang } from "../schema"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit } from "lucide-react"
import { DeletePhanHoiKhachHangButton } from "./delete-phan-hoi-khach-hang-button"
import { KyThuatPhanHoiButton } from "./ky-thuat-phan-hoi-button"
import { DonHoanKhoButton } from "./don-hoan-kho-button"
import { phanHoiKhachHangConfig } from "../config"
import { createSelectColumn } from "@/shared/components/data-display/table/create-select-column"
import { SortableHeader } from "@/shared/components"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

// Name cell component with navigation
function NameCell({ tenSanPham, id }: { tenSanPham: string | null; id: number }) {
    const navigate = useNavigate()
    
    return (
        <button
            onClick={() => navigate(`${phanHoiKhachHangConfig.routePath}/${id}`)}
            className="font-medium hover:underline truncate text-left w-full"
        >
            {tenSanPham || "-"}
        </button>
    )
}

// Actions cell component
function ActionsCell({ row }: { row: PhanHoiKhachHang }) {
    const navigate = useNavigate()
    const id = row.id!
    const tenSanPham = row.ten_san_pham
    
    return (
        <div className="flex items-center gap-2 justify-end pr-4 w-full overflow-visible">
            <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                <KyThuatPhanHoiButton phanHoi={row} iconOnly />
            </div>
            <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                <DonHoanKhoButton phanHoi={row} iconOnly />
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:text-blue-600 shrink-0"
                onClick={(e) => {
                    e.stopPropagation()
                    navigate(`${phanHoiKhachHangConfig.routePath}/${id}/sua`)
                }}
            >
                <span className="sr-only">Edit</span>
                <Edit className="h-4 w-4" />
            </Button>
            <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                <DeletePhanHoiKhachHangButton id={id} name={tenSanPham || `ID: ${id}`} iconOnly />
            </div>
        </div>
    )
}

export const phanHoiKhachHangColumns: ColumnDef<PhanHoiKhachHang>[] = [
    // ⚡ Professional: Use generic select column utility
    createSelectColumn<PhanHoiKhachHang>(),
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
            order: 1,
            minWidth: 100,
        },
    },
    {
        accessorKey: "nhan_vien_id",
        header: ({ column }) => <SortableHeader column={column} title="Nhân Viên" />,
        size: 200,
        minSize: 150,
        cell: ({ row }) => {
            const nhanVien = row.original.nhan_vien
            const nhanVienId = row.getValue("nhan_vien_id") as number | null
            if (!nhanVien) {
                return <div className="truncate">{nhanVienId ? String(nhanVienId) : "-"}</div>
            }
            return <div className="truncate">{`${nhanVien.ma_nhan_vien} - ${nhanVien.ho_ten}`}</div>
        },
        meta: {
            title: "Nhân Viên",
            order: 2,
            stickyLeft: true,
            stickyLeftOffset: 40, // After checkbox column
            minWidth: 150,
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
    },
    {
        accessorKey: "ten_san_pham",
        header: ({ column }) => <SortableHeader column={column} title="Tên Sản Phẩm" />,
        size: 200,
        minSize: 150,
        cell: ({ row }) => {
            const tenSanPham = row.getValue("ten_san_pham") as string | null
            const id = row.original.id!
            return <NameCell tenSanPham={tenSanPham} id={id} />
        },
        meta: {
            title: "Tên Sản Phẩm",
            order: 3,
            minWidth: 150,
        },
    },
    {
        accessorKey: "id_don_hang",
        header: ({ column }) => <SortableHeader column={column} title="ID Đơn Hàng" />,
        size: 150,
        minSize: 120,
        cell: ({ row }) => {
            const idDonHang = row.getValue("id_don_hang") as string | null
            return <div className="truncate">{idDonHang || "-"}</div>
        },
        meta: {
            title: "ID Đơn Hàng",
            order: 5,
            minWidth: 120,
        },
    },
    {
        accessorKey: "sdt_khach",
        header: ({ column }) => <SortableHeader column={column} title="SĐT Khách" />,
        size: 130,
        minSize: 100,
        cell: ({ row }) => {
            const sdtKhach = row.getValue("sdt_khach") as string | null
            return <div className="truncate">{sdtKhach || "-"}</div>
        },
        meta: {
            title: "SĐT Khách",
            order: 6,
            minWidth: 100,
        },
    },
    {
        accessorKey: "ngay_ban",
        header: ({ column }) => <SortableHeader column={column} title="Ngày Bán" />,
        size: 120,
        minSize: 100,
        cell: ({ row }) => {
            const ngayBan = row.getValue("ngay_ban") as string | null
            if (!ngayBan) return <span className="text-muted-foreground">-</span>
            try {
                return format(new Date(ngayBan), "dd/MM/yyyy", { locale: vi })
            } catch {
                return ngayBan
            }
        },
        meta: {
            title: "Ngày Bán",
            order: 6,
            minWidth: 100,
        },
    },
    {
        accessorKey: "loai_loi",
        header: ({ column }) => <SortableHeader column={column} title="Loại" />,
        size: 180,
        minSize: 150,
        cell: ({ row }) => {
            const loaiLoi = row.getValue("loai_loi") as string | null
            if (!loaiLoi) return <span className="text-muted-foreground">-</span>
            
            const colorMap: Record<string, string> = {
                "Chất lượng SP": "bg-red-500",
                "Hỏng lỗi": "bg-orange-500",
                "Chăm sóc": "bg-blue-500",
                "Giao hàng": "bg-purple-500",
                "Bảo hành / Bảo trì": "bg-yellow-500",
                "Giá cả": "bg-green-500",
                "Hóa đơn": "bg-indigo-500",
                "Khác": "bg-gray-500",
            }
            
            const badgeColor = colorMap[loaiLoi] || "bg-slate-500"
            
            return (
                <Badge variant="outline" className={badgeColor}>
                    {loaiLoi}
                </Badge>
            )
        },
        filterFn: (row, id, value) => {
            if (!value || !Array.isArray(value) || value.length === 0) {
                return true
            }
            const loaiLoi = row.getValue(id) as string | null
            if (!loaiLoi) return false
            return value.includes(loaiLoi)
        },
        meta: {
            title: "Loại",
            order: 7,
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
                "Đang xử lý": "bg-yellow-500",
                "Đã xử lý": "bg-green-500",
                "Hoàn thành": "bg-green-500", // Tương thích ngược
                "Đã hủy": "bg-red-500",
                "Hủy": "bg-red-500", // Tương thích ngược
            }
            return (
                <Badge variant="outline" className={colorMap[trangThai] || ""}>
                    {trangThai}
                </Badge>
            )
        },
        meta: {
            title: "Trạng Thái",
            order: 9,
            minWidth: 120,
        },
        filterFn: (row, id, value) => {
            if (!value || !Array.isArray(value) || value.length === 0) {
                return true
            }
            const trangThai = row.getValue(id) as string | null
            if (!trangThai) return false
            return value.includes(trangThai)
        },
    },
    {
        accessorKey: "muc_do",
        header: ({ column }) => <SortableHeader column={column} title="Mức Độ" />,
        size: 150,
        minSize: 120,
        cell: ({ row }) => {
            const mucDo = row.getValue("muc_do") as string | null
            if (!mucDo) return <span className="text-muted-foreground">-</span>
            const colorMap: Record<string, string> = {
                "Nghiêm trọng": "bg-red-500",
                "Bình thường": "bg-yellow-500",
                "Thấp": "bg-green-500",
            }
            return (
                <Badge variant="outline" className={colorMap[mucDo] || ""}>
                    {mucDo}
                </Badge>
            )
        },
        filterFn: (row, id, value) => {
            if (!value || !Array.isArray(value) || value.length === 0) {
                return true
            }
            const mucDo = row.getValue(id) as string | null
            if (!mucDo) return false
            return value.includes(mucDo)
        },
        meta: {
            title: "Mức Độ",
            order: 10,
            minWidth: 120,
        },
    },
    {
        accessorKey: "loai_loi",
        header: ({ column }) => <SortableHeader column={column} title="Loại Lỗi" />,
        size: 150,
        minSize: 120,
        cell: ({ row }) => {
            const loaiLoi = row.getValue("loai_loi") as string | null
            return <div className="truncate">{loaiLoi || "-"}</div>
        },
        meta: {
            title: "Loại Lỗi",
            order: 13,
            minWidth: 120,
        },
    },
    {
        accessorKey: "ten_loi",
        header: ({ column }) => <SortableHeader column={column} title="Tên Lỗi" />,
        size: 200,
        minSize: 150,
        cell: ({ row }) => {
            const tenLoi = row.getValue("ten_loi") as string | null
            return <div className="truncate">{tenLoi || "-"}</div>
        },
        meta: {
            title: "Tên Lỗi",
            order: 14,
            minWidth: 150,
        },
    },
    {
        accessorKey: "mo_ta_loi",
        header: ({ column }) => <SortableHeader column={column} title="Mô Tả Lỗi" />,
        size: 250,
        minSize: 200,
        cell: ({ row }) => {
            const moTaLoi = row.getValue("mo_ta_loi") as string | null
            if (!moTaLoi) return <span className="text-muted-foreground">-</span>
            return <div className="line-clamp-2 text-sm">{moTaLoi}</div>
        },
        meta: {
            title: "Mô Tả Lỗi",
            order: 15,
            minWidth: 200,
        },
    },
    {
        accessorKey: "ma_san_pham",
        header: ({ column }) => <SortableHeader column={column} title="Mã Sản Phẩm" />,
        size: 150,
        minSize: 120,
        cell: ({ row }) => {
            const maSanPham = row.getValue("ma_san_pham") as string | null
            return <div className="truncate">{maSanPham || "-"}</div>
        },
        meta: {
            title: "Mã Sản Phẩm",
            order: 15,
            minWidth: 120,
        },
    },
    {
        accessorKey: "phong_id",
        header: ({ column }) => <SortableHeader column={column} title="Phòng" />,
        size: 200,
        minSize: 150,
        cell: ({ row }) => {
            const phongBan = row.original.phong_ban
            const phongId = row.getValue("phong_id") as number | null
            if (!phongBan) {
                return <div className="truncate">{phongId ? String(phongId) : "-"}</div>
            }
            return <div className="truncate">{`${phongBan.ma_phong_ban} - ${phongBan.ten_phong_ban}`}</div>
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
            order: 16,
            minWidth: 150,
        },
    },
    {
        accessorKey: "nhom_id",
        header: ({ column }) => <SortableHeader column={column} title="Nhóm" />,
        size: 200,
        minSize: 150,
        cell: ({ row }) => {
            const nhom = row.original.nhom
            const nhomId = row.getValue("nhom_id") as number | null
            if (!nhom) {
                return <div className="truncate">{nhomId ? String(nhomId) : "-"}</div>
            }
            return <div className="truncate">{nhom.ten_nhom}</div>
        },
        meta: {
            title: "Nhóm",
            order: 17,
            minWidth: 150,
        },
    },
    {
        accessorKey: "yeu_cau_khach_hang",
        header: ({ column }) => <SortableHeader column={column} title="Yêu Cầu KH" />,
        size: 250,
        minSize: 200,
        cell: ({ row }) => {
            const yeuCau = row.getValue("yeu_cau_khach_hang") as string | null
            if (!yeuCau) return <span className="text-muted-foreground">-</span>
            return <div className="line-clamp-2 text-sm">{yeuCau}</div>
        },
        meta: {
            title: "Yêu Cầu Khách Hàng",
            order: 18,
            minWidth: 200,
        },
    },
    {
        accessorKey: "bien_phap_hien_tai",
        header: ({ column }) => <SortableHeader column={column} title="Biện Pháp Hiện Tại" />,
        size: 250,
        minSize: 200,
        cell: ({ row }) => {
            const bienPhap = row.getValue("bien_phap_hien_tai") as string | null
            if (!bienPhap) return <span className="text-muted-foreground">-</span>
            return <div className="line-clamp-2 text-sm">{bienPhap}</div>
        },
        meta: {
            title: "Biện Pháp Hiện Tại",
            order: 19,
            minWidth: 200,
        },
    },
    {
        accessorKey: "bien_phap_de_xuat",
        header: ({ column }) => <SortableHeader column={column} title="Biện Pháp Đề Xuất" />,
        size: 250,
        minSize: 200,
        cell: ({ row }) => {
            const bienPhap = row.getValue("bien_phap_de_xuat") as string | null
            if (!bienPhap) return <span className="text-muted-foreground">-</span>
            return <div className="line-clamp-2 text-sm">{bienPhap}</div>
        },
        meta: {
            title: "Biện Pháp Đề Xuất",
            order: 20,
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
            order: 20,
            minWidth: 150,
        },
    },
    {
        accessorKey: "kt_phu_trach",
        header: ({ column }) => <SortableHeader column={column} title="KT Phụ Trách" />,
        size: 180,
        minSize: 150,
        cell: ({ row }) => {
            const ktPhuTrachNhanVien = (row.original as any).kt_phu_trach_nhan_vien
            const ktPhuTrach = row.getValue("kt_phu_trach") as string | null
            if (ktPhuTrachNhanVien) {
                return <div className="truncate">{`${ktPhuTrachNhanVien.ma_nhan_vien} - ${ktPhuTrachNhanVien.ho_ten}`}</div>
            }
            return <div className="truncate">{ktPhuTrach || "-"}</div>
        },
        filterFn: (row, id, value) => {
            if (!value || !Array.isArray(value) || value.length === 0) {
                return true
            }
            const ktPhuTrach = row.getValue(id) as string | null
            if (!ktPhuTrach) return false
            return value.includes(ktPhuTrach)
        },
        meta: {
            title: "KT Phụ Trách",
            order: 20,
            minWidth: 150,
        },
    },
    {
        accessorKey: "trang_thai_don_hoan",
        header: ({ column }) => <SortableHeader column={column} title="Trạng Thái Đơn Hoàn" />,
        size: 180,
        minSize: 150,
        cell: ({ row }) => {
            const trangThaiDonHoan = row.getValue("trang_thai_don_hoan") as string | null
            if (!trangThaiDonHoan) return <span className="text-muted-foreground">-</span>
            
            const colorMap: Record<string, string> = {
                "chờ hoàn": "bg-yellow-500",
                "đã hoàn": "bg-blue-500",
                "đang xử lý": "bg-orange-500",
                "hoàn thành": "bg-green-500",
                "hủy": "bg-red-500",
            }
            
            const normalizedStatus = trangThaiDonHoan.toLowerCase()
            const badgeColor = colorMap[normalizedStatus] || ""
            
            return (
                <Badge variant="outline" className={badgeColor}>
                    {trangThaiDonHoan}
                </Badge>
            )
        },
        filterFn: (row, id, value) => {
            if (!value || !Array.isArray(value) || value.length === 0) {
                return true
            }
            const trangThaiDonHoan = row.getValue(id) as string | null
            if (!trangThaiDonHoan) return false
            return value.includes(trangThaiDonHoan)
        },
        meta: {
            title: "Trạng Thái Đơn Hoàn",
            order: 21,
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
            order: 22,
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

