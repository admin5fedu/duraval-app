"use client"
import { Calendar } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "./calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
    value?: Date
    onChange?: (date: Date | undefined) => void
    placeholder?: string
    disabled?: boolean
    className?: string
    fromDate?: Date
    toDate?: Date
}

export function DatePicker({
    value,
    onChange,
    placeholder = "Chọn ngày",
    disabled = false,
    className,
    fromDate,
    toDate,
}: DatePickerProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-full justify-start text-left",
                        !value && "text-muted-foreground",
                        className
                    )}
                    disabled={disabled}
                >
                    <Calendar className="mr-2 h-4 w-4" />
                    {value ? format(value, "dd/MM/yyyy", { locale: vi }) : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                    mode="single"
                    selected={value}
                    onSelect={onChange}
                    initialFocus
                    fromDate={fromDate}
                    toDate={toDate}
                />
            </PopoverContent>
        </Popover>
    )
}

