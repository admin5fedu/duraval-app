"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { CauHoi } from "../schema"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { DeleteCauHoiButton } from "./delete-cau-hoi-button"
import { cauHoiConfig } from "../config"
import { createSelectColumn } from "@/shared/components/data-display/table/create-select-column"
import { SortableHeader } from "@/shared/components"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

// Name cell component with navigation
function NameCell({ name, id }: { name: string; id: number }) {
    const navigate = useNavigate()
    
    return (
        <button
            onClick={() => navigate(`${cauHoiConfig.routePath}/${id}`)}
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
                    navigate(`${cauHoiConfig.routePath}/${id}/sua?returnTo=list`)
                }}
            >
                <span className="sr-only">Edit</span>
                <Edit className="h-4 w-4" />
            </Button>
            <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                <DeleteCauHoiButton id={id} name={name} iconOnly />
            </div>
        </div>
    )
}

export const cauHoiColumns = (): ColumnDef<CauHoi>[] => [
    createSelectColumn<CauHoi>(),
    {
        accessorKey: "ten_chuyen_de",
        header: ({ column }) => <SortableHeader column={column} title="Chuyên Đề" />,
        cell: ({ row }) => {
            const tenChuyenDe = row.getValue("ten_chuyen_de") as string | null | undefined
            return (
                <div className="min-w-[200px]">
                    {tenChuyenDe || "-"}
                </div>
            )
        },
        size: 200,
        minSize: 180,
        meta: {
            title: "Chuyên Đề",
            order: 1,
        },
    },
    {
        accessorKey: "cau_hoi",
        header: ({ column }) => <SortableHeader column={column} title="Câu Hỏi" />,
        cell: ({ row }) => {
            const cauHoi = row.original
            const cauHoiText = cauHoi.cau_hoi || ""
            return (
                <NameCell 
                    name={cauHoiText.length > 100 ? `${cauHoiText.substring(0, 100)}...` : cauHoiText} 
                    id={cauHoi.id!} 
                />
            )
        },
        size: 400,
        minSize: 300,
        meta: {
            title: "Câu Hỏi",
            order: 2,
        },
    },
    {
        accessorKey: "dap_an_dung",
        header: ({ column }) => <SortableHeader column={column} title="Đáp Án Đúng" />,
        cell: ({ row }) => {
            const dapAnDung = row.getValue("dap_an_dung") as number
            return (
                <div className="min-w-[100px] font-semibold text-primary">
                    Đáp án {dapAnDung}
                </div>
            )
        },
        size: 120,
        minSize: 100,
        meta: {
            title: "Đáp Án Đúng",
            order: 3,
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
            order: 4,
        },
    },
    {
        id: "actions",
        header: () => <div className="text-right pr-4">Thao Tác</div>,
        cell: ({ row }) => {
            const cauHoi = row.original
            return (
                <ActionsCell 
                    id={cauHoi.id!} 
                    name={cauHoi.cau_hoi.substring(0, 50)} 
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

