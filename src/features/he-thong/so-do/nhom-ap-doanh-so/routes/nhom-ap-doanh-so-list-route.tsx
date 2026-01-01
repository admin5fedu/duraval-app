"use client"

import { useNavigate } from "react-router-dom"
import { NhomApDoanhSoListView } from "../components/nhom-ap-doanh-so-list-view"
import { nhomApDoanhSoConfig } from "../config"

export default function NhomApDoanhSoListRoute() {
    const navigate = useNavigate()

    const handleEdit = (id: number) => {
        navigate(`${nhomApDoanhSoConfig.routePath}/${id}/sua`)
    }

    const handleAddNew = () => {
        navigate(`${nhomApDoanhSoConfig.routePath}/moi`)
    }

    const handleView = (id: number) => {
        navigate(`${nhomApDoanhSoConfig.routePath}/${id}`)
    }

    return (
        <NhomApDoanhSoListView
            onEdit={handleEdit}
            onAddNew={handleAddNew}
            onView={handleView}
        />
    )
}

