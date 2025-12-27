"use client"

import { useNavigate } from "react-router-dom"
import { CapBacListView } from "../components/cap-bac-list-view"
import { capBacConfig } from "../config"

export default function CapBacListRoute() {
    const navigate = useNavigate()

    const handleEdit = (id: number) => {
        navigate(`${capBacConfig.routePath}/${id}/sua`)
    }

    const handleAddNew = () => {
        navigate(`${capBacConfig.routePath}/moi`)
    }

    const handleView = (id: number) => {
        navigate(`${capBacConfig.routePath}/${id}`)
    }

    return (
        <CapBacListView
            onEdit={handleEdit}
            onAddNew={handleAddNew}
            onView={handleView}
        />
    )
}

