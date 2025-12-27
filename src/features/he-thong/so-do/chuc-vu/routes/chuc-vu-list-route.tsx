"use client"

import { useNavigate } from "react-router-dom"
import { ChucVuListView } from "../components/chuc-vu-list-view"
import { chucVuConfig } from "../config"

export default function ChucVuListRoute() {
    const navigate = useNavigate()

    const handleEdit = (id: number) => {
        navigate(`${chucVuConfig.routePath}/${id}/sua`)
    }

    const handleAddNew = () => {
        navigate(`${chucVuConfig.routePath}/moi`)
    }

    const handleView = (id: number) => {
        navigate(`${chucVuConfig.routePath}/${id}`)
    }

    return (
        <ChucVuListView
            onEdit={handleEdit}
            onAddNew={handleAddNew}
            onView={handleView}
        />
    )
}

