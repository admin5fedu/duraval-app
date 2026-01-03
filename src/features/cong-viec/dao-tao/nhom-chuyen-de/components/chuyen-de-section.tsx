/**
 * Chuyên Đề Section Component
 * 
 * Component hiển thị danh sách chuyên đề trong detail view nhóm chuyên đề.
 * Tham khảo RelativesSection để đảm bảo flow và quy tắc đúng.
 * 
 * Flow:
 * - Click dòng -> Mở popup detail (GenericDetailDialog)
 * - Click icon mắt -> Confirm dialog -> Redirect đến page detail module chuyên đề
 * - Click icon sửa -> Mở popup form (GenericFormDialog)
 * - Click icon xóa -> Mở popup xác nhận xóa (GenericDeleteDialog)
 * - Click "Thêm Chuyên Đề" -> Mở popup form (GenericFormDialog)
 */

"use client"

import { useState, useMemo, useImperativeHandle, forwardRef } from "react"
import { useNavigate } from "react-router-dom"
import { useChuyenDeByNhomChuyenDeId } from "../../chuyen-de/hooks"
import { EmbeddedListSection, type EmbeddedListColumn } from "@/shared/components/data-display/embedded-list-section"
import { EmbeddedListFullViewDialog } from "@/shared/components/data-display/embedded-list-full-view-dialog"
import { GenericDetailDialog } from "@/shared/components/dialogs/generic-detail-dialog"
import { GenericFormDialog } from "@/shared/components/dialogs/generic-form-dialog"
import { GenericDeleteDialog } from "@/shared/components/dialogs/generic-delete-dialog"
import { ConfirmDialog } from "@/shared/components/dialogs/confirm-dialog"
import { ChuyenDe, chuyenDeSchema } from "../../chuyen-de/schema"
import { z } from "zod"
import type { DetailSection } from "@/shared/components"
import type { FormSection } from "@/shared/components/forms/generic-form-view"
import { useCreateChuyenDe, useUpdateChuyenDe, useDeleteChuyenDe } from "../../chuyen-de/hooks"
import { useNhomChuyenDe } from "../hooks"
import { Button } from "@/components/ui/button"
import { BookOpen, Maximize2 } from "lucide-react"
import { sectionTitleClass } from "@/shared/utils/section-styles"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { chuyenDeConfig } from "../../chuyen-de/config"

const VIEW_DETAIL_SKIP_CONFIRM_STORAGE_KEY = "chuyen-de-view-detail-skip-confirm"

interface ChuyenDeSectionProps {
    nhomChuyenDeId: number
}

export interface ChuyenDeSectionRef {
    handleAdd: () => void
}

export const ChuyenDeSection = forwardRef<ChuyenDeSectionRef, ChuyenDeSectionProps>(
function ChuyenDeSection({ nhomChuyenDeId }, ref) {
    const { data: chuyenDeList, isLoading } = useChuyenDeByNhomChuyenDeId(nhomChuyenDeId)
    const { data: nhomChuyenDeList } = useNhomChuyenDe()
    const navigate = useNavigate()
    
    const [detailDialogOpen, setDetailDialogOpen] = useState(false)
    const [formDialogOpen, setFormDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [viewConfirmOpen, setViewConfirmOpen] = useState(false)
    const [selectedChuyenDe, setSelectedChuyenDe] = useState<ChuyenDe | null>(null)
    const [isEditMode, setIsEditMode] = useState(false)
    const [chuyenDeToView, setChuyenDeToView] = useState<ChuyenDe | null>(null)
    const [expandDialogOpen, setExpandDialogOpen] = useState(false)

    const createMutation = useCreateChuyenDe()
    const updateMutation = useUpdateChuyenDe()
    const deleteMutation = useDeleteChuyenDe()


    // Click dòng -> Mở popup detail
    const handleRowClick = (chuyenDe: ChuyenDe) => {
        setSelectedChuyenDe(chuyenDe)
        setDetailDialogOpen(true)
    }

    // Click icon mắt -> Confirm dialog -> Redirect đến page detail
    const handleEyeClick = (chuyenDe: ChuyenDe) => {
        if (!chuyenDe.id) return

        const skipConfirm =
            typeof window !== "undefined" &&
            window.localStorage.getItem(VIEW_DETAIL_SKIP_CONFIRM_STORAGE_KEY) === "true"

        if (skipConfirm) {
            navigate(`${chuyenDeConfig.routePath}/${chuyenDe.id}`)
            return
        }

        setChuyenDeToView(chuyenDe)
        setViewConfirmOpen(true)
    }

    const handleAdd = () => {
        setSelectedChuyenDe(null)
        setIsEditMode(false)
        setFormDialogOpen(true)
    }

    // Expose handleAdd to parent via ref
    useImperativeHandle(ref, () => ({
        handleAdd
    }), [])

    const handleEdit = (chuyenDe: ChuyenDe) => {
        setSelectedChuyenDe(chuyenDe)
        setIsEditMode(true)
        setFormDialogOpen(true)
    }

    const handleDelete = (chuyenDe: ChuyenDe) => {
        setSelectedChuyenDe(chuyenDe)
        setDeleteDialogOpen(true)
    }

    // Handle form submit - Đồng nhất với chuyen-de-form-view.tsx
    const handleFormSubmit = async (data: any) => {
        try {

        // Schema đã transform string thành number, nhưng để an toàn xử lý cả 2 trường hợp
        const getNhomChuyenDeId = (value: any): number | undefined => {
            if (value === null || value === undefined || value === "") {
                return undefined
            }
            if (typeof value === "number") {
                return value > 0 ? value : undefined
            }
            if (typeof value === "string") {
                const num = parseInt(value, 10)
                return !isNaN(num) && num > 0 ? num : undefined
            }
            return undefined
        }

        if (isEditMode && selectedChuyenDe) {
            const updateInput: any = {
                ten_chuyen_de: data.ten_chuyen_de ? String(data.ten_chuyen_de).trim() : undefined,
                mo_ta: data.mo_ta ? String(data.mo_ta).trim() : null,
            }
            // Only update nhom_chuyen_de_id if it's provided and valid
            const nhomChuyenDeId = getNhomChuyenDeId(data.nhom_chuyen_de_id)
            if (nhomChuyenDeId !== undefined) {
                updateInput.nhom_chuyen_de_id = nhomChuyenDeId
            }
            await updateMutation.mutateAsync({ 
                id: selectedChuyenDe.id!, 
                input: updateInput
            })
        } else {
            // Tự động set nguoi_tao_id từ user hiện tại
            const { useAuthStore } = await import("@/shared/stores/auth-store")
            const authStore = useAuthStore.getState()
            const user = authStore.user
            
            if (!user?.id) {
                throw new Error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.")
            }
            const nhomChuyenDeId = getNhomChuyenDeId(data.nhom_chuyen_de_id)
            if (nhomChuyenDeId === undefined) {
                throw new Error("Vui lòng chọn nhóm chuyên đề")
            }
            const createInput = {
                nhom_chuyen_de_id: nhomChuyenDeId,
                ten_chuyen_de: String(data.ten_chuyen_de || "").trim(),
                mo_ta: data.mo_ta ? String(data.mo_ta).trim() : null,
                nguoi_tao_id: parseInt(user.id),
            }
            await createMutation.mutateAsync(createInput)
        }
        } catch (error: any) {
            // Error is handled by mutation, but we can add additional handling here if needed
            throw error
        }
    }

    const handleDeleteConfirm = async () => {
        if (!selectedChuyenDe?.id) return
        await deleteMutation.mutateAsync(selectedChuyenDe.id)
    }

    const getDetailSections = (chuyenDe: ChuyenDe): DetailSection[] => {
        return [
            {
                title: "Thông Tin Cơ Bản",
                fields: [
                    { label: "ID", key: "id", value: chuyenDe.id, type: "number" },
                    { label: "Nhóm Chuyên Đề", key: "ten_nhom_chuyen_de", value: chuyenDe.ten_nhom_chuyen_de || "-" },
                    { label: "Tên Chuyên Đề", key: "ten_chuyen_de", value: chuyenDe.ten_chuyen_de },
                    { label: "Mô Tả", key: "mo_ta", value: chuyenDe.mo_ta || "-", colSpan: 2 as const },
                ]
            },
            {
                title: "Thông Tin Hệ Thống",
                fields: [
                    { label: "Người Tạo ID", key: "nguoi_tao_id", value: chuyenDe.nguoi_tao_id?.toString() || "-" },
                    { label: "Thời Gian Tạo", key: "tg_tao", value: chuyenDe.tg_tao ? format(new Date(chuyenDe.tg_tao), "dd/MM/yyyy HH:mm", { locale: vi }) : "-", type: "date" },
                    { label: "Thời Gian Cập Nhật", key: "tg_cap_nhat", value: chuyenDe.tg_cap_nhat ? format(new Date(chuyenDe.tg_cap_nhat), "dd/MM/yyyy HH:mm", { locale: vi }) : "-", type: "date" },
                ]
            }
        ]
    }

    // Prepare form sections - Đồng nhất với chuyen-de-form-view.tsx
    const formSections: FormSection[] = useMemo(() => {
        const nhomOptions = nhomChuyenDeList
            ?.filter(nhom => nhom.id !== undefined)
            .map(nhom => ({
                label: nhom.ten_nhom || `ID: ${nhom.id}`,
                value: String(nhom.id)
            })) || []

        return [
            {
                title: "Thông Tin Cơ Bản",
                fields: [
                    { 
                        name: "nhom_chuyen_de_id", 
                        label: "Nhóm Chuyên Đề", 
                        type: "select",
                        options: nhomOptions,
                        required: true,
                        defaultValue: String(nhomChuyenDeId),
                        disabled: true // Luôn disable vì đã chọn từ nhóm chuyên đề cha
                    },
                    { name: "ten_chuyen_de", label: "Tên Chuyên Đề", required: true },
                    { name: "mo_ta", label: "Mô Tả", type: "textarea", colSpan: 2 },
                ]
            }
        ]
    }, [nhomChuyenDeList, nhomChuyenDeId])

    // Define columns for the table
    const columns: EmbeddedListColumn<ChuyenDe>[] = [
        {
            key: "ten_chuyen_de",
            header: "Tên Chuyên Đề",
            sortable: true,
            stickyLeft: true,
            stickyMinWidth: 180,
            render: (item) => (
                <span className="font-medium">{item.ten_chuyen_de}</span>
            )
        },
        {
            key: "mo_ta",
            header: "Mô Tả",
            sortable: true,
            hideInCompact: true,
            render: (item) => (
                <div className="max-w-[300px] truncate text-sm text-muted-foreground">
                    {item.mo_ta || <span className="text-muted-foreground">-</span>}
                </div>
            )
        },
        {
            key: "tg_tao",
            header: "Thời Gian Tạo",
            sortable: true,
            hideInCompact: true,
            render: (item) => (
                item.tg_tao 
                    ? format(new Date(item.tg_tao), "dd/MM/yyyy HH:mm", { locale: vi })
                    : <span className="text-muted-foreground">-</span>
            )
        }
    ]

    return (
        <>
            {/* Custom Header for "Danh Sách Chuyên Đề" */}
            <div className="space-y-3 sm:space-y-4 print:space-y-2 print:break-inside-avoid scroll-mt-28">
                <div className="flex items-center justify-between gap-2 sm:gap-2.5 px-1">
                    <div className="flex items-center gap-2 sm:gap-2.5">
                        <div className="p-1.5 rounded-md bg-primary/10 print:bg-transparent print:border print:border-primary">
                            <BookOpen className="h-4 w-4 text-primary shrink-0" />
                        </div>
                        <h3 className={sectionTitleClass("font-semibold tracking-tight text-primary")}>
                            Danh Sách Chuyên Đề
                        </h3>
                    </div>
                    <div className="flex items-center gap-2 print:hidden">
                        {(chuyenDeList || []).length > 0 && (
                            <Button
                                onClick={() => setExpandDialogOpen(true)}
                                size="sm"
                                variant="outline"
                            >
                                <Maximize2 className="mr-2 h-4 w-4" />
                                Xem tất cả
                            </Button>
                        )}
                        <Button onClick={handleAdd} size="sm">
                            Thêm Chuyên Đề
                        </Button>
                    </div>
                </div>
                {/* Embedded List Section (without its own header) */}
                <div className="mt-4">
                    <EmbeddedListSection
                        title=""
                        data={chuyenDeList || []}
                        columns={columns}
                        isLoading={isLoading}
                        emptyMessage="Chưa có chuyên đề nào trong nhóm này"
                        onRowClick={handleRowClick}
                        onView={handleEyeClick}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        showActions={true}
                        getItemId={(item) => item.id!}
                        getItemName={(item) => item.ten_chuyen_de}
                        compactMode={true}
                        compactRowCount={5}
                        showMoreIndicator={false}
                        enableExpandView={false}
                        defaultSortField="tg_tao"
                        defaultSortDirection="desc"
                    />
                </div>
            </div>

            {/* Custom Expand Dialog */}
            {expandDialogOpen && (
                <EmbeddedListFullViewDialog
                    open={expandDialogOpen}
                    onOpenChange={setExpandDialogOpen}
                    title="Danh Sách Đầy Đủ Chuyên Đề"
                    data={chuyenDeList || []}
                    columns={columns}
                    onRowClick={handleRowClick}
                    onView={handleEyeClick}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    showActions={true}
                    getItemId={(item) => item.id!}
                    defaultSortField="tg_tao"
                    defaultSortDirection="desc"
                    enableSearch={true}
                    searchPlaceholder="Tìm kiếm chuyên đề..."
                    searchFields={["ten_chuyen_de", "mo_ta"]}
                />
            )}

            {/* Detail Dialog */}
            {selectedChuyenDe && (
                <GenericDetailDialog
                    open={detailDialogOpen}
                    onOpenChange={setDetailDialogOpen}
                    dialogTitle={`Chi Tiết: ${selectedChuyenDe.ten_chuyen_de}`}
                    dialogSubtitle="Chi tiết thông tin chuyên đề"
                    title={selectedChuyenDe.ten_chuyen_de}
                    subtitle={selectedChuyenDe.ten_nhom_chuyen_de || undefined}
                    sections={getDetailSections(selectedChuyenDe)}
                    actions={
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setDetailDialogOpen(false)
                                    handleEdit(selectedChuyenDe)
                                }}
                            >
                                Sửa
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                    setDetailDialogOpen(false)
                                    handleDelete(selectedChuyenDe)
                                }}
                            >
                                Xóa
                            </Button>
                        </>
                    }
                />
            )}

            {/* Form Dialog */}
            <GenericFormDialog
                open={formDialogOpen}
                onOpenChange={(open) => {
                    setFormDialogOpen(open)
                    if (!open) {
                        setSelectedChuyenDe(null)
                        setIsEditMode(false)
                    }
                }}
                title={isEditMode ? `Sửa Chuyên Đề: ${selectedChuyenDe?.ten_chuyen_de}` : "Thêm Mới Chuyên Đề"}
                subtitle={isEditMode ? "Cập nhật thông tin chuyên đề" : "Thêm chuyên đề vào nhóm này"}
                schema={chuyenDeSchema.omit({ 
                    id: true, 
                    tg_tao: true, 
                    tg_cap_nhat: true,
                    ten_nhom_chuyen_de: true,
                    nguoi_tao_id: true
                }).extend({
                    nhom_chuyen_de_id: z.union([
                        z.number().int().positive("Nhóm chuyên đề là bắt buộc"),
                        z.string().min(1, "Nhóm chuyên đề là bắt buộc").transform((val) => {
                            const num = parseInt(val, 10)
                            if (isNaN(num) || num <= 0) {
                                throw new Error("Nhóm chuyên đề không hợp lệ")
                            }
                            return num
                        }),
                    ]),
                })}
                defaultValues={isEditMode && selectedChuyenDe 
                    ? {
                        nhom_chuyen_de_id: String(selectedChuyenDe.nhom_chuyen_de_id),
                        ten_chuyen_de: selectedChuyenDe.ten_chuyen_de,
                        mo_ta: selectedChuyenDe.mo_ta || "",
                    }
                    : {
                        nhom_chuyen_de_id: String(nhomChuyenDeId),
                        ten_chuyen_de: "",
                        mo_ta: "",
                    }
                }
                sections={formSections}
                onSubmit={handleFormSubmit}
                submitLabel={isEditMode ? "Cập nhật" : "Thêm mới"}
                successMessage={isEditMode ? "Cập nhật chuyên đề thành công" : "Thêm mới chuyên đề thành công"}
                errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật chuyên đề" : "Có lỗi xảy ra khi thêm mới chuyên đề"}
                isLoading={createMutation.isPending || updateMutation.isPending}
            />

            {/* Delete Dialog */}
            {selectedChuyenDe && (
                <GenericDeleteDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    title="Xác nhận xóa chuyên đề"
                    description="Bạn có chắc chắn muốn xóa chuyên đề này không? Tất cả câu hỏi con sẽ bị xóa theo."
                    entityName={selectedChuyenDe.ten_chuyen_de}
                    onConfirm={handleDeleteConfirm}
                    isLoading={deleteMutation.isPending}
                />
            )}

            {/* View Detail Confirm Dialog */}
            <ConfirmDialog
                open={viewConfirmOpen}
                onOpenChange={setViewConfirmOpen}
                title="Mở trang chi tiết chuyên đề"
                description="Bạn có muốn mở trang chi tiết chuyên đề trong module Chuyên đề không?"
                confirmLabel="Mở trang chi tiết"
                cancelLabel="Hủy"
                skipConfirmStorageKey={VIEW_DETAIL_SKIP_CONFIRM_STORAGE_KEY}
                skipConfirmLabel="Đừng hỏi lại lần sau"
                onConfirm={() => {
                    if (!chuyenDeToView?.id) return
                    navigate(`${chuyenDeConfig.routePath}/${chuyenDeToView.id}`)
                }}
            />
        </>
    )
})

