"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { renderFieldValue } from "../utils/render-field-value"
import type { DetailSectionsProps } from "../types"
import { mediumTextClass, bodyTextClass } from "@/shared/utils/text-styles"
import { formSectionGapClass } from "@/shared/utils/section-styles"

/**
 * Sections component for GenericDetailView
 * Renders all detail sections with fields
 */
export function DetailSections({ sections }: DetailSectionsProps) {
    return (
        <div className="space-y-6">
            {sections.map((section, sectionIndex) => (
                <Card key={sectionIndex}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {section.icon && <section.icon className="h-5 w-5" />}
                            {section.title}
                        </CardTitle>
                        {section.description && (
                            <p className={cn(bodyTextClass(), "text-muted-foreground mt-1")}>{section.description}</p>
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className={cn(
                            "grid",
                            formSectionGapClass(), // gap-4
                            "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                        )}>
                            {section.fields.map((field, fieldIndex) => {
                                const colSpan = field.colSpan || 1
                                return (
                                    <div
                                        key={fieldIndex}
                                        className={cn(
                                            "space-y-1",
                                            colSpan === 2 && "md:col-span-2",
                                            colSpan === 3 && "md:col-span-2 lg:col-span-3"
                                        )}
                                    >
                                        <div className={cn(mediumTextClass(), "text-muted-foreground")}>
                                            {field.label}
                                        </div>
                                        <div className={bodyTextClass()}>
                                            {field.link ? (
                                                <a
                                                    href={field.link}
                                                    className="text-primary hover:underline"
                                                >
                                                    {renderFieldValue(field)}
                                                </a>
                                            ) : (
                                                renderFieldValue(field)
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

