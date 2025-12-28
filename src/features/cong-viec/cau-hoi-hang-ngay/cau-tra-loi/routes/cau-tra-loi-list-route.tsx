"use client"

import * as React from "react"
import { CauTraLoiListView } from "../components/cau-tra-loi-list-view"
import { CauTraLoiAPI } from "../services/cau-tra-loi.api"
import { Skeleton } from "@/components/ui/skeleton"

function ListViewSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
    )
}

export default function CauTraLoiListRoute() {
    // Load initial data on mount
    const [initialData, setInitialData] = React.useState<any>(null)
    const [initialDanhSachLichDangBai, setInitialDanhSachLichDangBai] = React.useState<any[]>([])
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        Promise.all([
            CauTraLoiAPI.getAll(),
            CauTraLoiAPI.getDanhSachLichDangBai()
        ]).then(([data, danhSachLichDangBai]) => {
            setInitialData(data)
            setInitialDanhSachLichDangBai(danhSachLichDangBai)
            setIsLoading(false)
        }).catch((error) => {
            console.error("Error loading initial data:", error)
            setInitialData([])
            setInitialDanhSachLichDangBai([])
            setIsLoading(false)
        })
    }, [])

    if (isLoading) {
        return <ListViewSkeleton />
    }

    return (
        <CauTraLoiListView 
            initialData={initialData} 
            initialDanhSachLichDangBai={initialDanhSachLichDangBai}
        />
    )
}

