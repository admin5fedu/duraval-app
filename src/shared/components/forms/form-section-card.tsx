"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { FormSection } from "./generic-form-view/"
import { FormFieldRenderer } from "./form-field-renderer"
import { UseFormReturn, useWatch } from "react-hook-form"
import { FileText } from "lucide-react"
import { sectionTitleClass, sectionSpacingClass } from "@/shared/utils/section-styles"
import { cardPaddingClass, cardClass } from "@/shared/utils/card-styles"

interface FormSectionCardProps {
    section: FormSection
    form: UseFormReturn<any>
    onFieldChange?: (fieldName: string, value: any) => void
    mode?: "page" | "popup" | "drawer"
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
export function FormSectionCard({ section, form, mode = "page" }: FormSectionCardProps) {
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

    const isDrawer = mode === "drawer"

    const content = (
        <div className={cn(
            "grid gap-4", // Always gap-4 (16px) per requirements
            isDrawer ? "grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        )} style={{ alignItems: 'start' }}>
            {visibleFields.map((field) => {
                // Adjust colSpan for drawer mode logic
                // If drawer: force max col-span-2. If original was > 1, make it 2. Else 1.
                // Actually, let's respect standard Grid logic but limit to 2 cols.
                // Req: "Important/Long: grid-cols-1 (100% -> col-span-2)".
                // Req: "Short: grid-cols-2 (50% -> col-span-1)".
                // Interpretation: If config says colSpan 2 or 3, it becomes col-span-2 in drawer.
                // If config says colSpan 1 or undefined, it acts as col-span-1.

                // We pass this adjustment logic to renderer via className/style or just rely on CSS Grid auto-placement if we didn't force classes?
                // FormFieldRenderer likely handles colSpan classes. We might need to override them or wrap.
                // Let's wrap FormFieldRenderer or assume it uses standard `col-span-X` classes.
                // Since FormFieldRenderer likely applies `col-span-X`, we can't easily override without prop drill or wrapping.
                // Let's modify FormFieldRenderer usage if possible, or accept that `col-span` in field config drives this.
                // BUT, in Drawer mode, max cols is 2. So `col-span-3` breaks layout if grid is only 2 cols? No, 2-col grid with col-span-3 usually behaves like full width (unless explicit grid tracks).
                // Let's verify standard tailwind behavior: in a `grid-cols-2`, `col-span-3` fills the row.
                // So as long as we set `grid-cols-2` for drawer, existing `col-span-X` should logically "fill or fit".

                return <FormFieldRenderer key={field.name} field={field} form={form} mode={mode} />
            })}
        </div>
    )

    if (isDrawer) {
        return (
            <div className={cn(sectionSpacingClass(), "border-b pb-6 last:border-0")}>
                {/* Drawer Header Style: Simple text, no background icon box */}
                <div className="mb-4">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">{section.title}</h3>
                    {section.description && section.description.trim() && (
                        <p className="text-xs text-muted-foreground mt-1">{section.description}</p>
                    )}
                </div>
                {content}
            </div>
        )
    }

    // Default Page/Popup Style (Card)
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
                    {content}
                </CardContent>
            </Card>
        </div>
    )
}

