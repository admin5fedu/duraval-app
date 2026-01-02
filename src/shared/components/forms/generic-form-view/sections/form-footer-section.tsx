"use client"

import { ActionGroup } from "@/shared/components/actions"
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
            <ActionGroup
                actions={[
                    {
                        label: "Hủy bỏ",
                        onClick: onCancel,
                        level: "secondary",
                        type: "button",
                    },
                    {
                        label: submitLabel,
                        level: "primary",
                        loading: isSubmitting,
                        disabled: isSubmitting,
                        type: "submit",
                    },
                ]}
                sortByLevel={false}
            />
        </div>
    )
}

