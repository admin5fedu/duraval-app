"use client"

import * as React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { LichDangDetailView } from "../components/lich-dang-detail-view"
import { lichDangConfig } from "../config"
import { LichDangAPI } from "../services/lich-dang.api"
import { Skeleton } from "@/components/ui/skeleton"

function DetailViewSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
    )
}

export default function LichDangDetailRoute() {
    const { id: idParam } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const id = idParam ? Number(idParam) : undefined

    const [initialData, setInitialData] = React.useState<any>(null)
    const [initialDanhSachChucVu, setInitialDanhSachChucVu] = React.useState<any[]>([])
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        if (!id || isNaN(id)) {
            navigate(lichDangConfig.routePath)
            return
        }

        Promise.all([
            LichDangAPI.getById(id),
            LichDangAPI.getDanhSachChucVu()
        ]).then(([data, danhSachChucVu]) => {
            if (!data) {
                navigate(lichDangConfig.routePath)
                return
            }
            setInitialData(data)
            setInitialDanhSachChucVu(danhSachChucVu)
            setIsLoading(false)
        }).catch((error) => {
            console.error("Error loading initial data:", error)
            navigate(lichDangConfig.routePath)
        })
    }, [id, navigate])

    if (!id || isNaN(id)) {
        return null
    }

    if (isLoading) {
        return <DetailViewSkeleton />
    }

    if (!initialData) {
        return null
    }

    return (
        <LichDangDetailView
            id={id}
            initialData={initialData}
            initialDanhSachChucVu={initialDanhSachChucVu}
        />
    )
}

