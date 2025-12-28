"use client"

import { GenericFormView, type FormSection } from "@/shared/components"
import { cauTraLoiSchema } from "../schema"
import type { CreateCauTraLoiInput, UpdateCauTraLoiInput } from "../types"
import { useCreateCauTraLoi, useUpdateCauTraLoi } from "../hooks"
import { useCauTraLoiById } from "../hooks"
import { cauTraLoiConfig } from "../config"
import { useMemo, useState, useEffect } from "react"
import * as React from "react"
import { CauTraLoiAPI } from "../services/cau-tra-loi.api"
import { useReferenceQuery } from "@/lib/react-query/hooks"
import { useAuthStore } from "@/shared/stores/auth-store"
import { useFormContext } from "react-hook-form"
import { useFormField } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LichDangAPI } from "../../lich-dang/services/lich-dang.api"
import type { LichDang } from "../../lich-dang/schema"

interface CauTraLoiFormViewProps {
    id?: number // If provided, this is edit mode
    onComplete?: () => void
    onCancel?: () => void
}

// Custom component for selecting answer - Using buttons instead of radio buttons for better UX
function CauTraLoiButtonGroup({ 
    value, 
    onChange, 
    lichDangId
}: { 
    value: any
    onChange: (value: string) => void
    lichDangId?: number | string
}) {
    const [lichDang, setLichDang] = useState<LichDang | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (lichDangId) {
            const id = typeof lichDangId === 'string' ? Number(lichDangId) : lichDangId
            if (id && !isNaN(id)) {
                setIsLoading(true)
                LichDangAPI.getById(id)
                    .then((data) => {
                        setLichDang(data)
                    })
                    .catch((err) => {
                        console.error("Error loading lich dang:", err)
                        setLichDang(null)
                    })
                    .finally(() => {
                        setIsLoading(false)
                    })
            } else {
                setLichDang(null)
            }
        } else {
            setLichDang(null)
        }
    }, [lichDangId])

    const options = useMemo(() => {
        if (!lichDang) return []
        return [
            { value: lichDang.dap_an_1 || '', text: lichDang.dap_an_1 || '', index: 1 },
            { value: lichDang.dap_an_2 || '', text: lichDang.dap_an_2 || '', index: 2 },
            { value: lichDang.dap_an_3 || '', text: lichDang.dap_an_3 || '', index: 3 },
            { value: lichDang.dap_an_4 || '', text: lichDang.dap_an_4 || '', index: 4 },
        ].filter(opt => opt.value)
    }, [lichDang])

    if (isLoading) {
        return (
            <div className="text-sm text-muted-foreground py-4">Đang tải đáp án...</div>
        )
    }

    if (!lichDangId) {
        return (
            <div className="text-sm text-muted-foreground py-4">Vui lòng chọn lịch đăng trước</div>
        )
    }

    if (!lichDang || options.length === 0) {
        return (
            <div className="text-sm text-destructive py-4">Không tìm thấy đáp án cho lịch đăng này</div>
        )
    }

    return (
        <div className="space-y-2">
            {options.map((option) => (
                <Button
                    key={option.index}
                    type="button"
                    variant={value === option.value ? "default" : "outline"}
                    className={cn(
                        "w-full justify-start h-auto py-3 px-4 text-left",
                        "hover:bg-accent hover:text-accent-foreground"
                    )}
                    onClick={() => onChange(option.value)}
                >
                    <span className="font-medium mr-2">{option.index}.</span>
                    <span className="flex-1">{option.text}</span>
                </Button>
            ))}
        </div>
    )
}

// Wrapper để access form context
function CauTraLoiButtonGroupWrapper({ 
    value, 
    onChange,
    ...props
}: { 
    value: any
    onChange: (value: string) => void
    [key: string]: any // Allow FormControl Slot to pass other props
}) {
    const form = useFormContext()
    const currentLichDangId = form.watch("lich_dang_id")
    const previousLichDangIdRef = React.useRef(currentLichDangId)
    
    // Get id from FormControl context using useFormField hook (like ComboboxFormField does)
    let formItemId: string
    try {
        const formField = useFormField()
        formItemId = formField.formItemId
    } catch {
        // Not in FormControl context, generate a unique id
        formItemId = React.useId()
    }
    
    // Reset cau_tra_loi when lich_dang_id changes
    useEffect(() => {
        const previousId = previousLichDangIdRef.current
        // Reset if lich_dang_id changed and there's a value in cau_tra_loi
        if (previousId !== currentLichDangId && previousId !== undefined && form.getValues("cau_tra_loi")) {
            form.setValue("cau_tra_loi", "", { shouldValidate: false })
        }
        previousLichDangIdRef.current = currentLichDangId
    }, [currentLichDangId, form])
    
    return (
        <div {...props} id={formItemId} role="group" aria-labelledby={`${formItemId}-label`}>
            <CauTraLoiButtonGroup 
                value={value} 
                onChange={onChange} 
                lichDangId={currentLichDangId}
            />
        </div>
    )
}

export function CauTraLoiFormView({ id, onComplete, onCancel }: CauTraLoiFormViewProps) {
    const createMutation = useCreateCauTraLoi()
    const updateMutation = useUpdateCauTraLoi()
    const { employee: currentEmployee } = useAuthStore()
    
    // If id is provided, fetch existing data for edit mode
    const { data: existingData, isLoading } = useCauTraLoiById(id || 0, undefined)
    
    const isEditMode = !!id

    // Load lich dang options
    const { data: lichDangOptions = [] } = useReferenceQuery({
        queryKey: ['lich-dang-list-for-select'],
        queryFn: CauTraLoiAPI.getDanhSachLichDangBai,
    })

    // Convert lich dang to select options for standard select field
    const lichDangSelectOptions = useMemo(() => {
        return lichDangOptions.map((item: any) => ({
            label: item.cau_hoi || `ID: ${item.id}`,
            value: item.id?.toString() || ''
        })).filter(opt => opt.value)
    }, [lichDangOptions])

    // Create sections - Using standard select for lich_dang_id, custom component only for cau_tra_loi
    const sections = useMemo(() => {
        const baseSections: FormSection[] = [
            {
                title: "Thông Tin",
                fields: [
                    { 
                        name: "lich_dang_id", 
                        label: "Lịch Đăng", 
                        type: "select",
                        options: lichDangSelectOptions,
                        placeholder: "Chọn lịch đăng",
                        required: true,
                    },
                    { 
                        name: "cau_tra_loi", 
                        label: "Chọn Đáp Án", 
                        type: "custom",
                        required: true,
                        customComponent: ({ value, onChange }: any) => (
                            <CauTraLoiButtonGroupWrapper value={value} onChange={onChange} />
                        ),
                        colSpan: 3
                    },
                ]
            }
        ]

        return baseSections
    }, [lichDangSelectOptions])

    // Calculate ket_qua based on selected answer and correct answer from lich_dang
    const calculateKetQua = async (lichDangId: number, cauTraLoi: string): Promise<string> => {
        try {
            const lichDang = await LichDangAPI.getById(lichDangId)
            if (!lichDang) {
                throw new Error("Không tìm thấy lịch đăng")
            }
            
            if (!lichDang.dap_an_dung) {
                return "Chưa chấm"
            }
            
            const correctAnswerKey = `dap_an_${lichDang.dap_an_dung}` as keyof LichDang
            const correctAnswer = lichDang[correctAnswerKey] as string | undefined
            
            if (!correctAnswer) {
                return "Chưa chấm"
            }
            
            // Compare the selected answer with the correct answer (trim whitespace)
            return cauTraLoi.trim() === correctAnswer.trim() ? "Đúng" : "Sai"
        } catch (error) {
            console.error("Error calculating ket_qua:", error)
            throw new Error(`Lỗi khi tính toán kết quả: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    const handleSubmit = async (data: any) => {
        try {
            // Lấy ma_nhan_vien từ employee context
            const nguoiTaoId = currentEmployee?.ma_nhan_vien
            if (!nguoiTaoId) {
                throw new Error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.")
            }

            // Convert lich_dang_id from string to number
            const lichDangId = data.lich_dang_id ? Number(data.lich_dang_id) : undefined
            if (!lichDangId || isNaN(lichDangId)) {
                throw new Error("Lịch đăng không hợp lệ")
            }

            const cauTraLoi = data.cau_tra_loi
            if (!cauTraLoi || typeof cauTraLoi !== 'string' || cauTraLoi.trim() === '') {
                throw new Error("Câu trả lời không được để trống")
            }

            // Auto-calculate ket_qua
            const ketQua = await calculateKetQua(lichDangId, cauTraLoi)
            if (!ketQua) {
                throw new Error("Không thể tính toán kết quả. Vui lòng thử lại.")
            }

            if (isEditMode && id) {
                const updateData: UpdateCauTraLoiInput = {
                    lich_dang_id: lichDangId,
                    cau_tra_loi: cauTraLoi.trim(),
                    ket_qua: ketQua,
                }
                await updateMutation.mutateAsync({ id, input: updateData })
            } else {
                const submitData: CreateCauTraLoiInput = {
                    lich_dang_id: lichDangId,
                    cau_tra_loi: cauTraLoi.trim(),
                    ket_qua: ketQua,
                    nguoi_tao_id: nguoiTaoId,
                }
                await createMutation.mutateAsync(submitData)
            }
        } catch (error: any) {
            console.error("Error in handleSubmit:", error)
            throw error
        }
    }

    // Set default values - No ket_qua in form
    const formDefaultValues = useMemo(() => {
        if (isEditMode && existingData) {
            return {
                lich_dang_id: existingData.lich_dang_id?.toString() || '',
                cau_tra_loi: existingData.cau_tra_loi || '',
            }
        }
        
        // Default values for new record
        return {}
    }, [isEditMode, existingData])

    if (isEditMode && isLoading) {
        return <div>Đang tải...</div>
    }

    return (
        <GenericFormView
            title={isEditMode ? `Sửa Câu Trả Lời #${id}` : "Thêm Mới Câu Trả Lời"}
            subtitle={isEditMode ? "Cập nhật thông tin câu trả lời." : "Tạo câu trả lời mới."}
            schema={cauTraLoiSchema.omit({ 
                id: true, 
                tg_tao: true, 
                tg_cap_nhat: true, 
                lich_dang_cau_hoi: true, 
                nguoi_tao_ten: true,
                ket_qua: true // Remove ket_qua from form validation, it will be auto-calculated
            })}
            sections={sections}
            onSubmit={handleSubmit}
            onSuccess={onComplete}
            onCancel={onCancel}
            successMessage={isEditMode ? "Cập nhật câu trả lời thành công" : "Thêm mới câu trả lời thành công"}
            errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật câu trả lời" : "Có lỗi xảy ra khi thêm mới câu trả lời"}
            defaultValues={formDefaultValues}
        />
    )
}
