"use client"

import * as React from "react"
import { useRef } from "react"
import { z } from "zod"
import { Form } from "@/components/ui/form"
import { useFormNavigation } from "@/hooks/use-form-navigation"
import { FormHeader } from "../form-header"
import { FormSectionCard } from "../form-section-card"
import type { GenericFormViewProps } from "./types"
import { useGenericFormState } from "./hooks/use-generic-form-state"
import { useGenericFormSubmit } from "./hooks/use-generic-form-submit"
import { useFormKeyboardShortcuts } from "./hooks/use-form-keyboard-shortcuts"
import { FormFooterSection } from "./sections/form-footer-section"
import { formSectionContainerClass, sectionSpacingClass } from "@/shared/utils/section-styles"
import { cn } from "@/lib/utils"

/**
 * GenericFormView Component
 * 
 * A comprehensive form component for React ERP applications.
 * Supports validation with Zod, sections, and keyboard shortcuts.
 * 
 * @example
 * ```tsx
 * <GenericFormView
 *   title="Tạo người dùng"
 *   schema={userSchema}
 *   sections={userFormSections}
 *   onSubmit={handleSubmit}
 *   onSuccess={() => navigate('/users')}
 * />
 * ```
 */
export function GenericFormView<T extends z.ZodType<any, any>>({
    title,
    subtitle,
    schema,
    defaultValues,
    sections,
    onSubmit,
    onSuccess,
    onCancel,
    cancelUrl,
    submitLabel = "Lưu thay đổi",
    successMessage = "Lưu thành công",
    errorMessage = "Có lỗi xảy ra khi lưu dữ liệu",
    hideHeader = false,
    children,
}: GenericFormViewProps<T>) {
    // 1. Navigation handler
    const { handleCancel } = useFormNavigation({ onCancel, cancelUrl })

    // 2. Form state management
    const form = useGenericFormState({ schema, defaultValues })

    // 3. Form submission handler
    const { isSubmitting, handleSubmit } = useGenericFormSubmit(form, {
        onSubmit,
        onSuccess,
        successMessage,
        errorMessage,
        handleCancel,
    })

    // 4. Form ref for keyboard shortcuts
    const formRef = useRef<HTMLFormElement>(null)

    // 5. Keyboard shortcuts
    useFormKeyboardShortcuts(formRef, form, handleSubmit, handleCancel, isSubmitting)

    // 6. Render form
    return (
        <Form {...form}>
            <form 
                ref={formRef}
                onSubmit={form.handleSubmit(handleSubmit)} 
                className={cn(sectionSpacingClass(), "pb-10")}
            >
                {!hideHeader && (
                    <FormHeader
                        title={title}
                        subtitle={subtitle}
                        onCancel={handleCancel}
                        submitLabel={submitLabel}
                        isSubmitting={isSubmitting}
                    />
                )}

                {/* Optional children (e.g., field watchers) */}
                {children}

                {/* Sections */}
                <div className={formSectionContainerClass()}>
                    {sections.map((section, index) => (
                        <FormSectionCard 
                            key={index} 
                            section={section} 
                            form={form}
                        />
                    ))}
                </div>

                {/* Footer buttons when hideHeader is true */}
                {hideHeader && (
                    <FormFooterSection
                        onCancel={handleCancel}
                        submitLabel={submitLabel}
                        isSubmitting={isSubmitting}
                    />
                )}
            </form>
        </Form>
    )
}

