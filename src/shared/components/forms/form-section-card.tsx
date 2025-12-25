"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { FormSection } from "./generic-form-view/"
import { FormFieldRenderer } from "./form-field-renderer"
import { UseFormReturn } from "react-hook-form"
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
function getFormSectionIcon(title: string): React.ComponentType<{ className?: string }> {
    // Default icon
    return FileText
}

/**
 * Component để render một section trong form view
 */
export function FormSectionCard({ section, form, onFieldChange }: FormSectionCardProps) {
    const SectionIcon = section.icon || getFormSectionIcon(section.title)

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
                        {section.fields.map((field) => (
                            <FormFieldRenderer key={field.name} field={field} form={form} />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

