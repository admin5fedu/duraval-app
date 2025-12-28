"use client"

import * as React from "react"
import { LichDangListView } from "../components/lich-dang-list-view"
import { LichDangAPI } from "../services/lich-dang.api"
import { Skeleton } from "@/components/ui/skeleton"

function ListViewSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
    )
}

export default function LichDangListRoute() {
    // Load initial data on mount
    const [initialData, setInitialData] = React.useState<any>(null)
    const [initialDanhSachChucVu, setInitialDanhSachChucVu] = React.useState<any[]>([])
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        Promise.all([
            LichDangAPI.getAll(),
            LichDangAPI.getDanhSachChucVu()
        ]).then(([data, danhSachChucVu]) => {
            setInitialData(data)
            setInitialDanhSachChucVu(danhSachChucVu)
            setIsLoading(false)
        }).catch((error) => {
            console.error("Error loading initial data:", error)
            setInitialData([])
            setInitialDanhSachChucVu([])
            setIsLoading(false)
        })
    }, [])

    if (isLoading) {
        return <ListViewSkeleton />
    }

    return (
        <LichDangListView 
            initialData={initialData} 
            initialDanhSachChucVu={initialDanhSachChucVu}
        />
    )
}

