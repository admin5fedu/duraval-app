"use client"

import * as React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { CauTraLoiDetailView } from "../components/cau-tra-loi-detail-view"
import { cauTraLoiConfig } from "../config"
import { CauTraLoiAPI } from "../services/cau-tra-loi.api"
import { Skeleton } from "@/components/ui/skeleton"

function DetailViewSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
    )
}

export default function CauTraLoiDetailRoute() {
    const { id: idParam } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const id = idParam ? Number(idParam) : undefined

    const [initialData, setInitialData] = React.useState<any>(null)
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        if (!id || isNaN(id)) {
            navigate(cauTraLoiConfig.routePath)
            return
        }

        CauTraLoiAPI.getById(id).then((data) => {
            if (!data) {
                navigate(cauTraLoiConfig.routePath)
                return
            }
            setInitialData(data)
            setIsLoading(false)
        }).catch((error) => {
            console.error("Error loading initial data:", error)
            navigate(cauTraLoiConfig.routePath)
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
        <CauTraLoiDetailView
            id={id}
            initialData={initialData}
        />
    )
}

