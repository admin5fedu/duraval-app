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
export function DetailSections({ sections, mode = "page" }: DetailSectionsProps) {
    const isDrawer = mode === "drawer"

    return (
        <div className="space-y-6">
            {sections.map((section, sectionIndex) => (
                <div key={sectionIndex} className={cn(isDrawer && "border-b pb-6 last:border-0 last:pb-0")}>
                    {isDrawer ? (
                        // Drawer Header Style
                        <div className="mb-4">
                            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                                {section.icon && <section.icon className="h-4 w-4" />}
                                {section.title}
                            </h3>
                            {section.description && (
                                <p className="text-xs text-muted-foreground mt-1">{section.description}</p>
                            )}
                        </div>
                    ) : (
                        // Card Header Style
                        <CardHeader className={cn(!isDrawer && "px-0 pt-0")}>
                            {/* Note: The original had Card wrapper. If not drawer, we wrap in Card? 
                               Original code wrapped in Card. Let's keep Card for non-drawer. 
                               But wait, I need to restructure to allow conditional wrapper. 
                               Actually, let's just branch the whole return or inner part. 
                           */}
                        </CardHeader>
                    )}

                    {isDrawer ? (
                        <div className={cn(
                            "grid gap-4 grid-cols-2" // Drawer: 2 cols, 16px gap
                        )}>
                            {section.fields.map((field, fieldIndex) => {
                                const colSpan = field.colSpan && field.colSpan >= 2 ? 2 : 1
                                return (
                                    <div
                                        key={fieldIndex}
                                        className={cn(
                                            "space-y-1",
                                            colSpan === 2 && "col-span-2"
                                        )}
                                    >
                                        <div className={cn("text-xs font-medium text-gray-500 uppercase tracking-wide", "text-muted-foreground")}>
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
                    ) : (
                        <Card>
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
                    )}
                </div>
            ))}
        </div>
    )
}

