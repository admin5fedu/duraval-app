"use client"

import { useNavigate } from "react-router-dom"
import { KeHoach168ListView } from "../components/ke-hoach-168-list-view"
import { keHoach168Config } from "../config"

export default function KeHoach168ListRoute() {
    const navigate = useNavigate()

    const handleEdit = (id: number) => {
        navigate(`${keHoach168Config.routePath}/${id}/sua`)
    }

    const handleAddNew = () => {
        navigate(`${keHoach168Config.routePath}/moi`)
    }

    const handleView = (id: number) => {
        navigate(`${keHoach168Config.routePath}/${id}`)
    }

    return (
        <KeHoach168ListView
            onEdit={handleEdit}
            onAddNew={handleAddNew}
            onView={handleView}
        />
    )
}

