"use client"

import { useParams, useNavigate } from "react-router-dom"
import { CapBacDetailView } from "../components/cap-bac-detail-view"
import { capBacConfig } from "../config"

export default function CapBacDetailRoute() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    if (!id) {
        navigate(capBacConfig.routePath)
        return null
    }

    const capBacId = Number(id)
    if (isNaN(capBacId)) {
        navigate(capBacConfig.routePath)
        return null
    }

    const handleEdit = () => {
        navigate(`${capBacConfig.routePath}/${id}/sua`)
    }

    const handleBack = () => {
        navigate(capBacConfig.routePath)
    }

    return (
        <CapBacDetailView
            id={capBacId}
            onEdit={handleEdit}
            onBack={handleBack}
        />
    )
}

