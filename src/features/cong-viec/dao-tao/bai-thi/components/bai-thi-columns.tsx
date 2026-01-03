"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { BaiThi } from "../schema"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { DeleteBaiThiButton } from "./delete-bai-thi-button"
import { baiThiConfig } from "../config"
import { createSelectColumn } from "@/shared/components/data-display/table/create-select-column"
import { SortableHeader } from "@/shared/components"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
// Removed hook imports - baiThiColumns is now a pure function

// KyThi name cell component
function KyThiNameCell({ kyThiId, tenKyThi }: { kyThiId: number; tenKyThi: string }) {
    const navigate = useNavigate()
    const safeTenKyThi = tenKyThi || `Kỳ thi #${kyThiId}`
    return (
        <button
            onClick={() => navigate(`/cong-viec/ky-thi/${kyThiId}`)}
            className="font-medium hover:underline truncate text-left w-full"
        >
            {safeTenKyThi.length > 50 ? `${safeTenKyThi.substring(0, 50)}...` : safeTenKyThi}
        </button>
    )
}

// Actions cell component
function ActionsCell({ id }: { id: number }) {
    const navigate = useNavigate()
    
    return (
        <div className="flex items-center gap-2 justify-end pr-4 min-w-[100px]">
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:text-blue-600 shrink-0"
                onClick={(e) => {
                    e.stopPropagation()
                    navigate(`${baiThiConfig.routePath}/${id}/sua?returnTo=list`)
                }}
            >
                <span className="sr-only">Edit</span>
                <Edit className="h-4 w-4" />
            </Button>
            <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                <DeleteBaiThiButton id={id} name={`Bài thi #${id}`} iconOnly />
            </div>
        </div>
    )
}

// Helper function to create kyThiMap - pure function
const createKyThiMap = (kyThiList: any[] | undefined): Map<number, string> => {
    const map = new Map<number, string>()
    if (kyThiList) {
        kyThiList.forEach(kt => {
            if (kt.id) {
                map.set(kt.id, kt.ten_ky_thi || `Kỳ thi #${kt.id}`)
            }
        })
    }
    return map
}

// Helper function to create nhanSuMap - pure function
const createNhanSuMap = (nhanSuList: any[] | undefined): Map<number, string> => {
    const map = new Map<number, string>()
    if (nhanSuList) {
        nhanSuList.forEach(ns => {
            if (ns.ma_nhan_vien) {
                map.set(ns.ma_nhan_vien, `${ns.ma_nhan_vien} - ${ns.ho_ten}`)
            }
        })
    }
    return map
}

// Helper function to create phongBanMap - pure function
const createPhongBanMap = (phongBanList: any[] | undefined): Map<number, string> => {
    const map = new Map<number, string>()
    if (phongBanList) {
        phongBanList.forEach(pb => {
            if (pb.id) {
                map.set(pb.id, `${pb.ma_phong_ban} - ${pb.ten_phong_ban}`)
            }
        })
    }
    return map
}

// Helper function to create nhomChuyenDeMap - pure function
const createNhomChuyenDeMap = (nhomChuyenDeList: any[] | undefined): Map<number, string> => {
    const map = new Map<number, string>()
    if (nhomChuyenDeList) {
        nhomChuyenDeList.forEach(nhom => {
            if (nhom.id) {
                map.set(nhom.id, nhom.ten_nhom || `ID: ${nhom.id}`)
            }
        })
    }
    return map
}

/**
 * Pure function to create columns - no hooks inside
 * Pass data as parameters instead of using hooks
 */
export const baiThiColumns = (
    kyThiList?: any[], 
    nhanSuList?: any[],
    phongBanList?: any[],
    nhomChuyenDeList?: any[]
): ColumnDef<BaiThi>[] => {
    const kyThiMap = createKyThiMap(kyThiList)
    const nhanSuMap = createNhanSuMap(nhanSuList)
    const phongBanMap = createPhongBanMap(phongBanList)
    const nhomChuyenDeMap = createNhomChuyenDeMap(nhomChuyenDeList)

    return [
        createSelectColumn<BaiThi>(),
        {
            accessorKey: "ngay_lam_bai",
            header: ({ column }) => <SortableHeader column={column} title="Ngày Làm Bài" />,
            cell: ({ row }) => {
                const ngay = row.getValue("ngay_lam_bai") as string | null | undefined
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
                title: "Ngày Làm Bài",
                order: 1,
            },
        },
        {
            accessorKey: "ky_thi_id",
            header: ({ column }) => <SortableHeader column={column} title="Kỳ Thi" />,
            cell: ({ row }) => {
                const kyThiId = row.getValue("ky_thi_id") as number
                const tenKyThi = kyThiMap.get(kyThiId) || `Kỳ thi #${kyThiId}`
                return (
                    <div className="min-w-[200px]">
                        <KyThiNameCell kyThiId={kyThiId} tenKyThi={tenKyThi} />
                    </div>
                )
            },
            size: 300,
            minSize: 200,
            meta: {
                title: "Kỳ Thi",
                order: 2,
            },
        },
        {
            accessorKey: "nhan_vien_id",
            header: ({ column }) => <SortableHeader column={column} title="Nhân Viên" />,
            cell: ({ row }) => {
                const nhanVienId = row.getValue("nhan_vien_id") as number
                const nhanVien = nhanSuMap.get(nhanVienId) || `ID: ${nhanVienId}`
                return (
                    <div className="min-w-[150px]">
                        {nhanVien}
                    </div>
                )
            },
            size: 200,
            minSize: 150,
            meta: {
                title: "Nhân Viên",
                order: 3,
            },
        },
        {
            accessorKey: "phong_id",
            header: ({ column }) => <SortableHeader column={column} title="Phòng" />,
            filterFn: (row, id, value) => {
                return value.includes(String(row.getValue(id)))
            },
            cell: ({ row }) => {
                const phongId = row.getValue("phong_id") as number | null | undefined
                if (!phongId) return <div className="text-muted-foreground">-</div>
                const phong = phongBanMap.get(phongId) || `ID: ${phongId}`
                return (
                    <div className="min-w-[150px]">
                        {phong}
                    </div>
                )
            },
            size: 200,
            minSize: 150,
            meta: {
                title: "Phòng",
                order: 4,
            },
        },
        {
            accessorKey: "nhom_id",
            header: ({ column }) => <SortableHeader column={column} title="Nhóm" />,
            filterFn: (row, id, value) => {
                return value.includes(String(row.getValue(id)))
            },
            cell: ({ row }) => {
                const nhomId = row.getValue("nhom_id") as number | null | undefined
                if (!nhomId) return <div className="text-muted-foreground">-</div>
                const nhom = nhomChuyenDeMap.get(nhomId) || `ID: ${nhomId}`
                return (
                    <div className="min-w-[150px]">
                        {nhom}
                    </div>
                )
            },
            size: 200,
            minSize: 150,
            meta: {
                title: "Nhóm",
                order: 5,
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
                let variant: "default" | "secondary" | "destructive" | "outline" = "secondary"
                if (trangThai === "Đạt") {
                    variant = "default"
                } else if (trangThai === "Không đạt") {
                    variant = "destructive"
                } else if (trangThai === "Đang thi") {
                    variant = "outline"
                }
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
                order: 6,
            },
        },
        {
            accessorKey: "diem_so",
            header: ({ column }) => <SortableHeader column={column} title="Điểm Số" />,
            cell: ({ row }) => {
                const diemSo = row.getValue("diem_so") as number | null | undefined
                return (
                    <div className="min-w-[80px] text-center">
                        {diemSo !== null && diemSo !== undefined ? diemSo : "-"}
                    </div>
                )
            },
            size: 100,
            minSize: 80,
            meta: {
                title: "Điểm Số",
                order: 7,
            },
        },
        {
            accessorKey: "tong_so_cau",
            header: ({ column }) => <SortableHeader column={column} title="Tổng Số Câu" />,
            cell: ({ row }) => {
                const tongSoCau = row.getValue("tong_so_cau") as number | null | undefined
                return (
                    <div className="min-w-[100px] text-center">
                        {tongSoCau !== null && tongSoCau !== undefined ? tongSoCau : "-"}
                    </div>
                )
            },
            size: 100,
            minSize: 80,
            meta: {
                title: "Tổng Số Câu",
                order: 8,
            },
        },
        {
            accessorKey: "thoi_gian_bat_dau",
            header: ({ column }) => <SortableHeader column={column} title="Thời Gian Bắt Đầu" />,
            cell: ({ row }) => {
                const thoiGian = row.getValue("thoi_gian_bat_dau") as string | null | undefined
                if (!thoiGian) return <div className="text-muted-foreground">-</div>
                try {
                    return (
                        <div className="min-w-[150px]">
                            {format(new Date(thoiGian), "dd/MM/yyyy HH:mm", { locale: vi })}
                        </div>
                    )
                } catch {
                    return <div className="text-muted-foreground">-</div>
                }
            },
            size: 180,
            minSize: 150,
            meta: {
                title: "Thời Gian Bắt Đầu",
                order: 7,
            },
        },
        {
            accessorKey: "thoi_gian_ket_thuc",
            header: ({ column }) => <SortableHeader column={column} title="Thời Gian Kết Thúc" />,
            cell: ({ row }) => {
                const thoiGian = row.getValue("thoi_gian_ket_thuc") as string | null | undefined
                if (!thoiGian) return <div className="text-muted-foreground">-</div>
                try {
                    return (
                        <div className="min-w-[150px]">
                            {format(new Date(thoiGian), "dd/MM/yyyy HH:mm", { locale: vi })}
                        </div>
                    )
                } catch {
                    return <div className="text-muted-foreground">-</div>
                }
            },
            size: 180,
            minSize: 150,
            meta: {
                title: "Thời Gian Kết Thúc",
                order: 8,
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
                order: 9,
            },
        },
        {
            id: "actions",
            header: () => <div className="text-right pr-4">Thao Tác</div>,
            cell: ({ row }) => {
                const baiThi = row.original
                return (
                    <ActionsCell 
                        id={baiThi.id!} 
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
}

