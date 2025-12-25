/**
 * Danh Sách Nhân Sự Module
 * 
 * Module entry point - Orchestrator pattern
 * Sử dụng useModuleNavigation để quản lý routing và state
 */

"use client"

import { NhanSuListView } from "./components/nhan-su-list-view"
import { NhanSuFormView } from "./components/nhan-su-form-view"
import { NhanSuDetailView } from "./components/nhan-su-detail-view"
import { useModuleNavigation } from "@/shared/hooks/use-module-navigation"
import { nhanSuConfig } from "./config"

export default function DanhSachNhanSuModule() {
  const {
    isNew,
    isEdit,
    isDetail,
    handleAddNew,
    handleEdit,
    handleView,
    handleComplete,
    handleCancel,
    navigateToList,
    currentId,
  } = useModuleNavigation({
    basePath: nhanSuConfig.routePath,
  })

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {isNew || isEdit ? (
        <NhanSuFormView
          id={isEdit ? currentId || undefined : undefined}
          onComplete={handleComplete}
          onCancel={handleCancel}
        />
      ) : isDetail && currentId ? (
        <NhanSuDetailView
          id={currentId}
          onEdit={() => handleEdit(currentId, 'detail')}
          onBack={navigateToList}
        />
      ) : (
        <NhanSuListView
          onEdit={(id) => handleEdit(id, 'list')}
          onAddNew={handleAddNew}
          onView={handleView}
        />
      )}
    </div>
  )
}

