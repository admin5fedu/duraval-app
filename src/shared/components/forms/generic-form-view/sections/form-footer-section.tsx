"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import type { FormFooterSectionProps } from "../types"

/**
 * Footer section component for GenericFormView
 * Displays cancel and submit buttons when hideHeader is true
 */
export function FormFooterSection({
    onCancel,
    submitLabel,
    isSubmitting,
}: FormFooterSectionProps) {
    return (
        <div className="flex items-center justify-end gap-2 pt-4 border-t">
            <Button variant="outline" type="button" onClick={onCancel}>
                Hủy bỏ
            </Button>
            <LoadingButton
                type="submit"
                isLoading={isSubmitting}
                loadingText="Đang lưu..."
            >
                {submitLabel}
            </LoadingButton>
        </div>
    )
}

