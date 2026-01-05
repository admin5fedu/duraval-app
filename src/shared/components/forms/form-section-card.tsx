"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { FormSection } from "./generic-form-view/"
import { FormFieldRenderer } from "./form-field-renderer"
import { UseFormReturn, useWatch } from "react-hook-form"
import { FileText } from "lucide-react"
import { sectionTitleClass, sectionSpacingClass } from "@/shared/utils/section-styles"
import { cardPaddingClass, cardClass } from "@/shared/utils/card-styles"

interface FormSectionCardProps {
    section: FormSection
    form: UseFormReturn<any>
    onFieldChange?: (fieldName: string, value: any) => void // Callback when field changes
}

/**
 * Helper function to get icon for section
 */
function getFormSectionIcon(_title: string): React.ComponentType<{ className?: string }> {
    // Default icon
    return FileText
}

/**
 * Component để render một section trong form view
 */
export function FormSectionCard({ section, form }: FormSectionCardProps) {
    const SectionIcon = getFormSectionIcon(section.title)
    
    // Watch form values for conditional field rendering
    const formValues = useWatch({ control: form.control })

    // Filter fields based on hidden condition
    const visibleFields = React.useMemo(() => {
        return section.fields.filter((field) => {
            if (field.hidden === true) return false
            // Support function-based hidden condition
            if (typeof field.hidden === 'function') {
                return !field.hidden(formValues)
            }
            return true
        })
    }, [section.fields, formValues])

    return (
        <div className={sectionSpacingClass()}>
            <div className="flex items-center gap-2.5 px-1">
                <div className="p-1.5 rounded-md bg-primary/10">
                    <SectionIcon className="h-4 w-4 text-primary shrink-0" />
                </div>
                <div className="flex-1">
                    <h3 className={sectionTitleClass("font-semibold tracking-tight text-primary")}>{section.title}</h3>
                    {section.description && section.description.trim() && (
                        <p className="text-sm text-muted-foreground mt-0.5">{section.description}</p>
                    )}
                </div>
            </div>
            <Card className={cardClass()}>
                <CardContent className={cardPaddingClass()}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6" style={{ alignItems: 'start' }}>
                        {visibleFields.map((field) => (
                            <FormFieldRenderer key={field.name} field={field} form={form} />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

