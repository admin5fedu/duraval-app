"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { ViecHangNgay } from "../schema"
import { DeleteViecHangNgayButton } from "./delete-viec-hang-ngay-button"
import { createSelectColumn } from "@/shared/components/data-display/table/create-select-column"
import { SortableHeader } from "@/shared/components"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"

// Type for employee lookup
type EmployeeMap = Map<number, { ma_nhan_vien: number; ho_ten: string }>

// Type for phong ban lookup
type PhongBanMap = Map<string, { ma_phong_ban: string; ten_phong_ban: string }>

// Type for nhom lookup
type NhomMap = Map<string, string> // ma_nhom -> ten_nhom

// Function to create columns with employee data
export function createColumns(
    employees?: Array<{ ma_nhan_vien?: number; ho_ten?: string; ma_nhom?: string | null }>,
    onEdit?: (row: ViecHangNgay) => void,
    phongBans?: Array<{ id?: number; ma_phong_ban?: string; ten_phong_ban?: string }>
): ColumnDef<ViecHangNgay>[] {
    // Create employee map for quick lookup
    const employeeMap: EmployeeMap = new Map()
    if (employees) {
        employees.forEach(emp => {
            if (emp.ma_nhan_vien) {
                employeeMap.set(emp.ma_nhan_vien, {
                    ma_nhan_vien: emp.ma_nhan_vien,
                    ho_ten: emp.ho_ten || ''
                })
            }
        })
    }

    // Create phong ban map for quick lookup (by ma_phong_ban)
    const phongBanMap: PhongBanMap = new Map()
    if (phongBans) {
        phongBans.forEach(pb => {
            if (pb.ma_phong_ban) {
                phongBanMap.set(pb.ma_phong_ban, {
                    ma_phong_ban: pb.ma_phong_ban,
                    ten_phong_ban: pb.ten_phong_ban || ''
                })
            }
        })
    }

    // Create nhom map for quick lookup (ma_nhom -> ten_nhom from employees)
    // ma_nhom in viec_hang_ngay should match nhom in nhan_su
    const nhomMap: NhomMap = new Map()
    if (employees) {
        employees.forEach(emp => {
            if (emp.ma_nhom) {
                // Map nhom value as both key and value (since ma_nhom = nhom)
                // This allows us to display the nhom name when we have ma_nhom
                nhomMap.set(emp.ma_nhom, emp.ma_nhom)
            }
        })
    }

    return [
        // ⚡ Professional: Use generic select column utility
        createSelectColumn<ViecHangNgay>(),
        {
            accessorKey: "id",
            header: ({ column }) => <SortableHeader column={column} title="ID" />,
            cell: ({ row }) => {
                const id = row.getValue("id") as number
                return (
                    <span className="text-sm text-foreground min-w-[70px]">
                        {id}
                    </span>
                )
            },
            size: 80,
            minSize: 70,
            meta: {
                title: "ID",
                order: 1,
                stickyLeft: true,
                stickyLeftOffset: 40,
                minWidth: 70
            }
        },
        {
            accessorKey: "ma_nhan_vien",
            header: ({ column }) => <SortableHeader column={column} title="Mã NV" />,
            cell: ({ row }) => {
                const maNV = row.getValue("ma_nhan_vien") as number
                const employee = employeeMap.get(maNV)
                const displayText = employee
                    ? `${employee.ma_nhan_vien} - ${employee.ho_ten}`
                    : String(maNV)
                return (
                    <span className="min-w-[150px] text-foreground">
                        {displayText}
                    </span>
                )
            },
            filterFn: (row, id, value) => {
                const maNV = row.getValue(id) as number
                return value.includes(String(maNV))
            },
            size: 200,
            minSize: 150,
            meta: {
                title: "Mã nhân viên",
                order: 2,
                minWidth: 150
            }
        },
        {
            accessorKey: "ngay_bao_cao",
            header: ({ column }) => <SortableHeader column={column} title="Ngày báo cáo" />,
            cell: ({ row }) => {
                const date = row.getValue("ngay_bao_cao") as string
                if (!date) return <div className="text-muted-foreground">-</div>
                try {
                    const dateObj = new Date(date)
                    return (
                        <div className="min-w-[120px]">
                            {format(dateObj, "dd/MM/yyyy", { locale: vi })}
                        </div>
                    )
                } catch {
                    return <div className="min-w-[120px]">{date}</div>
                }
            },
            filterFn: (row, id, value) => {
                const date = row.getValue(id) as string
                if (!date) return false
                try {
                    const dateObj = new Date(date)
                    const dateStr = format(dateObj, "dd/MM/yyyy", { locale: vi })
                    return value.includes(dateStr)
                } catch {
                    return value.includes(String(date))
                }
            },
            size: 130,
            minSize: 120,
            meta: {
                title: "Ngày báo cáo",
                order: 3,
                minWidth: 120
            }
        },
        {
            accessorKey: "chi_tiet_cong_viec",
            header: ({ column }) => <SortableHeader column={column} title="Chi tiết công việc" />,
            cell: ({ row }) => {
                const chiTiet = row.getValue("chi_tiet_cong_viec")
                if (!chiTiet || (Array.isArray(chiTiet) && chiTiet.length === 0)) {
                    return <div className="text-muted-foreground text-sm">Chưa có</div>
                }
                const items = Array.isArray(chiTiet) ? chiTiet : []

                // Count items with data (at least one field filled)
                const itemsWithData = items.filter((item: any) => {
                    return !!(item.ke_hoach?.trim() || item.ket_qua?.trim() || (item.links && item.links.some((l: string) => l.trim())))
                })

                if (itemsWithData.length === 0) {
                    return <div className="text-muted-foreground text-sm">Chưa có</div>
                }

                // Build tooltip content
                const tooltipContent = itemsWithData.map((item: any, idx: number) => {
                    const id = item.id || idx + 1
                    const keHoach = item.ke_hoach?.trim() || 'Chưa có kế hoạch'
                    // Truncate if too long
                    const displayText = keHoach.length > 50 ? keHoach.substring(0, 50) + '...' : keHoach
                    return `${id}. ${displayText}`
                }).join('\n')

                return (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="min-w-[120px]">
                                    <Badge variant="secondary" className="text-xs cursor-help">
                                        {itemsWithData.length} công việc
                                    </Badge>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-md">
                                <div className="whitespace-pre-line text-xs">
                                    {tooltipContent}
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )
            },
            size: 150,
            minSize: 120,
            meta: {
                title: "Chi tiết công việc",
                order: 4,
                minWidth: 120
            }
        },
        {
            accessorKey: "phong_ban_id",
            header: ({ column }) => <SortableHeader column={column} title="Phòng Ban" />,
            cell: ({ row }) => {
                const phongBanId = row.original.phong_ban_id as number | null
                if (!phongBanId || !phongBans) {
                    return <div className="min-w-[150px]">-</div>
                }
                const phongBan = phongBans.find(pb => pb.id === phongBanId)
                if (!phongBan) {
                    return <div className="min-w-[150px]">-</div>
                }
                const displayText = phongBan.ten_phong_ban || phongBan.ma_phong_ban || String(phongBanId)
                return <div className="min-w-[150px]">{displayText}</div>
            },
            size: 180,
            minSize: 150,
            filterFn: (row, _id, value) => {
                const phongBanId = (row.original as any).phong_ban_id
                return value.includes(String(phongBanId))
            },
            meta: {
                title: "Phòng Ban",
                order: 5,
                minWidth: 150
            }
        },
        {
            accessorKey: "ma_phong",
            header: ({ column }) => <SortableHeader column={column} title="Mã phòng" />,
            cell: ({ row }) => {
                const maPhong = row.getValue("ma_phong") as string | null
                if (!maPhong) {
                    return <div className="min-w-[100px]">-</div>
                }
                const phongBan = phongBanMap.get(maPhong)
                const displayText = phongBan ? `${maPhong} - ${phongBan.ten_phong_ban}` : maPhong
                return <div className="min-w-[150px]">{displayText}</div>
            },
            size: 180,
            minSize: 150,
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id))
            },
            meta: {
                title: "Mã phòng",
                order: 6,
                minWidth: 150
            }
        },
        {
            accessorKey: "ma_nhom",
            header: ({ column }) => <SortableHeader column={column} title="Nhóm" />,
            cell: ({ row }) => {
                const maNhom = row.getValue("ma_nhom") as string | null
                if (!maNhom) {
                    return <div className="min-w-[100px]">-</div>
                }
                // Try to find ten_nhom from nhomMap
                // ma_nhom in viec_hang_ngay should match nhom in nhan_su
                const tenNhom = nhomMap.get(maNhom)
                // If found, display the nhom name (which is the same as ma_nhom but from employees data)
                // If not found, just display ma_nhom
                return <div className="min-w-[100px]">{tenNhom || maNhom}</div>
            },
            size: 120,
            minSize: 100,
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id))
            },
            meta: {
                title: "Mã nhóm",
                order: 7,
                minWidth: 100
            }
        },
        {
            id: "actions",
            header: () => <div className="text-right pr-4">Thao tác</div>,
            cell: ({ row }) => {
                return (
                    <div className="flex items-center gap-2 justify-end pr-4 min-w-[100px]">
                        {onEdit && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:text-blue-600 shrink-0"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onEdit(row.original)
                                }}
                                title="Sửa"
                            >
                                <span className="sr-only">Sửa</span>
                                <Edit className="h-4 w-4" />
                            </Button>
                        )}
                        <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                            <DeleteViecHangNgayButton id={row.original.id!} iconOnly />
                        </div>
                    </div>
                )
            },
            enableSorting: false,
            enableHiding: false,
            size: 120,
            minSize: 100,
            meta: {
                title: "Thao tác",
                stickyRight: true,
                minWidth: 100
            }
        }
    ]
}

// Export default columns for backward compatibility (without employee data)
export const viecHangNgayColumns = createColumns()

