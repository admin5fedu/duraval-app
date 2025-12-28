"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Plus, X, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CongViec {
    id: number
    ke_hoach?: string
    ket_qua?: string
    links?: string[]
}

interface ChiTietCongViecEditorProps {
    value: CongViec[]
    onChange: (value: CongViec[]) => void
    maxItems?: number
}

const MAX_LINKS_PER_ITEM = 3
const DEFAULT_MAX_ITEMS = 20

// Validate URL format
function isValidUrl(url: string): boolean {
    try {
        const urlObj = new URL(url)
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
    } catch {
        return false
    }
}

export function ChiTietCongViecEditor({ 
    value, 
    onChange, 
    maxItems = DEFAULT_MAX_ITEMS 
}: ChiTietCongViecEditorProps) {
    // Initialize with 10 default items if value is empty
    const [isInitialized, setIsInitialized] = React.useState(false)
    
    React.useEffect(() => {
        if (!isInitialized && (!value || value.length === 0)) {
            const defaultItems: CongViec[] = Array.from({ length: 10 }, (_, index) => ({
                id: index + 1,
                ke_hoach: '',
                ket_qua: '',
                links: []
            }))
            onChange(defaultItems)
            setIsInitialized(true)
        } else if (value && value.length > 0) {
            setIsInitialized(true)
        }
    }, [value, onChange, isInitialized])
    
    const items = value || []

    const updateItem = (index: number, updates: Partial<CongViec>) => {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], ...updates }
        onChange(newItems)
    }

    const addItem = () => {
        if (items.length >= maxItems) return
        const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1
        onChange([...items, { id: newId, ke_hoach: '', ket_qua: '', links: [] }])
    }

    const updateLink = (itemIndex: number, linkIndex: number, newLink: string) => {
        const item = items[itemIndex]
        if (!item) return
        
        const links = item.links || []
        const newLinks = [...links]
        newLinks[linkIndex] = newLink
        updateItem(itemIndex, { links: newLinks })
    }

    const addLink = (itemIndex: number) => {
        const item = items[itemIndex]
        if (!item) return
        
        const links = item.links || []
        if (links.length >= MAX_LINKS_PER_ITEM) return
        
        const newLinks = [...links, '']
        updateItem(itemIndex, { links: newLinks })
    }

    const removeLink = (itemIndex: number, linkIndex: number) => {
        const item = items[itemIndex]
        if (!item) return
        
        const links = item.links || []
        const newLinks = links.filter((_, idx) => idx !== linkIndex)
        updateItem(itemIndex, { links: newLinks })
    }

    return (
        <div className="space-y-4 w-full">
            <div className="border rounded-lg overflow-x-auto w-full">
                <Table className="w-full min-w-full">
                    <TableBody>
                        {items.map((item, itemIndex) => {
                            const isDisabled = !item.ke_hoach?.trim()
                            const links = item.links || []
                            
                            return (
                                <React.Fragment key={item.id}>
                                    {/* Row 1: ID, Kế hoạch, Kết quả */}
                                    <TableRow>
                                        <TableCell className="w-16 align-top pt-4">
                                            <span className="text-sm font-medium text-muted-foreground">
                                                {item.id}
                                            </span>
                                        </TableCell>
                                        <TableCell className="align-top pt-4 min-w-[300px]">
                                            <Textarea
                                                placeholder="Kế hoạch công việc"
                                                value={item.ke_hoach || ''}
                                                onChange={(e) => updateItem(itemIndex, { ke_hoach: e.target.value })}
                                                className="w-full resize-none"
                                                rows={4}
                                            />
                                        </TableCell>
                                        <TableCell className="align-top pt-4 min-w-[300px]">
                                            <Textarea
                                                placeholder="Kết quả thực hiện"
                                                value={item.ket_qua || ''}
                                                onChange={(e) => updateItem(itemIndex, { ket_qua: e.target.value })}
                                                disabled={isDisabled}
                                                rows={4}
                                                className="w-full resize-none"
                                            />
                                        </TableCell>
                                    </TableRow>
                                    
                                    {/* Row 2: Links */}
                                    <TableRow>
                                        <TableCell></TableCell>
                                        <TableCell colSpan={2} className="pt-0 pb-4">
                                            <div className="space-y-2">
                                                {/* Existing links */}
                                                {links.map((link, linkIndex) => {
                                                    const isValid = !link || isValidUrl(link)
                                                    return (
                                                        <div key={linkIndex} className="flex items-center gap-2">
                                                            <div className="flex-1 relative">
                                                                <Input
                                                                    placeholder="https://example.com"
                                                                    value={link}
                                                                    onChange={(e) => updateLink(itemIndex, linkIndex, e.target.value)}
                                                                    disabled={isDisabled}
                                                                    className={cn(
                                                                        "w-full pr-8",
                                                                        !isValid && link && "border-destructive focus-visible:ring-destructive"
                                                                    )}
                                                                />
                                                                {link && isValidUrl(link) && (
                                                                    <a
                                                                        href={link}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                                                                    >
                                                                        <ExternalLink className="h-4 w-4" />
                                                                    </a>
                                                                )}
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 shrink-0"
                                                                onClick={() => removeLink(itemIndex, linkIndex)}
                                                                disabled={isDisabled}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    )
                                                })}
                                                
                                                {/* Add link button */}
                                                {links.length < MAX_LINKS_PER_ITEM && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => addLink(itemIndex)}
                                                        disabled={isDisabled}
                                                        className="w-full"
                                                    >
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Thêm link
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                </React.Fragment>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
            
            {/* Add item button */}
            {items.length < maxItems && (
                <Button
                    type="button"
                    variant="outline"
                    onClick={addItem}
                    className="w-full"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm công việc
                </Button>
            )}
            
            {items.length >= maxItems && (
                <p className="text-sm text-muted-foreground text-center">
                    Đã đạt tối đa {maxItems} công việc
                </p>
            )}
        </div>
    )
}

