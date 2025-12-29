"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { KeHoach168 } from "../schema"
import { DeleteKeHoach168Button } from "./delete-ke-hoach-168-button"
import { createSelectColumn } from "@/shared/components/data-display/table/create-select-column"
import { SortableHeader } from "@/shared/components"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Type for employee lookup
type EmployeeMap = Map<number, { ma_nhan_vien: number; ho_ten: string }>

// Function to create columns with employee data
export function createColumns(employees?: Array<{ ma_nhan_vien?: number; ho_ten?: string }>): ColumnDef<KeHoach168>[] {
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

    return [
        // ⚡ Professional: Use generic select column utility
        createSelectColumn<KeHoach168>(),
        {
            accessorKey: "id",
            header: ({ column }) => <SortableHeader column={column} title="ID" />,
            cell: ({ row }) => {
                const id = row.getValue("id") as number
                return (
                    <span className="font-mono text-sm text-primary min-w-[70px]">
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
            accessorKey: "ma_phong",
            header: ({ column }) => <SortableHeader column={column} title="Mã phòng" />,
            cell: ({ row }) => {
                const maPhong = row.getValue("ma_phong") as string | null
                return <div className="min-w-[100px]">{maPhong || "-"}</div>
            },
            size: 120,
            minSize: 100,
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id))
            },
            meta: {
                title: "Mã phòng",
                order: 5,
                minWidth: 100
            }
        },
        {
            accessorKey: "ma_nhom",
            header: ({ column }) => <SortableHeader column={column} title="Mã nhóm" />,
            cell: ({ row }) => {
                const maNhom = row.getValue("ma_nhom") as string | null
                return <div className="min-w-[100px]">{maNhom || "-"}</div>
            },
            size: 120,
            minSize: 100,
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id))
            },
            meta: {
                title: "Mã nhóm",
                order: 6,
                minWidth: 100
            }
        },
        {
            id: "actions",
            header: () => <div className="text-right pr-4">Thao tác</div>,
            cell: ({ row }) => {
                return (
                    <div className="flex items-center gap-2 justify-end pr-4 min-w-[100px]">
                        <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                            <DeleteKeHoach168Button id={row.original.id!} iconOnly name={String(row.original.ma_nhan_vien)} />
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
export const keHoach168Columns = createColumns()

