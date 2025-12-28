"use client"

import { useNavigate } from "react-router-dom"
import { DanhMucCauHoiListView } from "../components/danh-muc-cau-hoi-list-view"
import { danhMucCauHoiConfig } from "../config"

export default function DanhMucCauHoiListRoute() {
    const navigate = useNavigate()

    const handleEdit = (id: number) => {
        navigate(`${danhMucCauHoiConfig.routePath}/${id}/sua`)
    }

    const handleAddNew = () => {
        navigate(`${danhMucCauHoiConfig.routePath}/moi`)
    }

    const handleView = (id: number) => {
        navigate(`${danhMucCauHoiConfig.routePath}/${id}`)
    }

    return (
        <DanhMucCauHoiListView
            onEdit={handleEdit}
            onAddNew={handleAddNew}
            onView={handleView}
        />
    )
}

