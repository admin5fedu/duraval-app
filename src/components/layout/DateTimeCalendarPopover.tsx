"use client"

import { useState, useMemo, useEffect } from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { isHoliday } from '@/shared/utils/vietnamese-holidays'
import { getLunarDateInfo, initLunarCalendar } from '@/shared/utils/lunar-calendar'

interface DateTimeCalendarPopoverProps {
  children: React.ReactNode
}

/**
 * Custom Calendar Component - Professional Vietnamese Calendar
 * Hiển thị dương lịch, âm lịch và ngày lễ Việt Nam
 */
function CustomCalendar({
  selectedDate,
  onSelectDate,
  currentMonth,
  onMonthChange,
}: {
  selectedDate?: Date
  onSelectDate: (date: Date) => void
  currentMonth: Date
  onMonthChange: (date: Date) => void
}) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Lấy các ngày trong tháng
  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days: Date[] = []

    // Ngày đầu tuần của tháng (CN = 0, T2 = 1, ...)
    const startDay = firstDay.getDay()

    // Thêm các ngày của tháng trước (nếu cần)
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i)
      days.push(date)
    }

    // Thêm các ngày trong tháng
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day))
    }

    // Thêm các ngày của tháng sau để đủ 6 tuần (42 ngày)
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      days.push(new Date(year, month + 1, day))
    }

    return days
  }, [currentMonth])

  // Weekdays header
  const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

  // Format tháng/năm
  const monthYearLabel = useMemo(() => {
    const months = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
      'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
      'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ]
    return `${months[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`
  }, [currentMonth])

  // Navigation
  const goToPreviousMonth = () => {
    const newDate = new Date(currentMonth)
    newDate.setMonth(newDate.getMonth() - 1)
    onMonthChange(newDate)
  }

  const goToNextMonth = () => {
    const newDate = new Date(currentMonth)
    newDate.setMonth(newDate.getMonth() + 1)
    onMonthChange(newDate)
  }

  const goToToday = () => {
    onMonthChange(new Date())
    onSelectDate(new Date())
  }

  return (
    <div className="space-y-4">
      {/* Header với navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPreviousMonth}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextMonth}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="text-sm font-semibold px-2 min-w-[120px] text-center">
            {monthYearLabel}
          </div>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={goToToday}
              className="h-8 px-3 text-xs"
            >
              <Calendar className="h-4 w-4 mr-1.5" />
              Hôm nay
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Quay lại ngày hôm nay</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Calendar Grid */}
      <div className="space-y-1">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-0">
          {weekdays.map((day, index) => (
            <div
              key={index}
              className={cn(
                "h-8 flex items-center justify-center text-[11px] font-medium",
                "text-muted-foreground border-b border-border/40"
              )}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-0">
          {daysInMonth.map((date, index) => {
            const dateStr = date.toISOString().split('T')[0]
            const todayStr = today.toISOString().split('T')[0]
            const isCurrentMonth = date.getMonth() === currentMonth.getMonth()
            const isToday = dateStr === todayStr
            const isSelected = selectedDate && dateStr === selectedDate.toISOString().split('T')[0]

            // Lấy thông tin âm lịch
            const lunarInfo = getLunarDateInfo(date)
            
            // Kiểm tra ngày lễ
            const holiday = isHoliday(
              date.getMonth() + 1,
              date.getDate(),
              lunarInfo?.month,
              lunarInfo?.day
            )

            const DayCell = (
              <button
                type="button"
                onClick={() => onSelectDate(date)}
                className={cn(
                  "h-10 w-full relative flex flex-col items-center justify-center",
                  "text-sm font-medium transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  !isCurrentMonth && "text-muted-foreground opacity-50",
                  isToday && "bg-accent text-accent-foreground font-semibold",
                  isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                )}
              >
                {/* Dương lịch - số to, đậm */}
                <span className={cn(
                  "text-sm leading-none font-semibold",
                  holiday && "text-red-600",
                  isSelected && "text-primary-foreground"
                )}>
                  {date.getDate()}
                </span>

                {/* Âm lịch - số nhỏ ở dưới */}
                {lunarInfo && isCurrentMonth && (
                  <span className={cn(
                    "text-[9px] leading-none mt-0.5",
                    "text-muted-foreground",
                    isSelected && "text-primary-foreground/70"
                  )}>
                    {lunarInfo.day}/{lunarInfo.month}
                  </span>
                )}

                {/* Badge cho ngày lễ */}
                {holiday && isCurrentMonth && (
                  <Badge
                    variant="destructive"
                    className={cn(
                      "absolute top-1 right-1 h-1.5 w-1.5 p-0 rounded-full",
                      "pointer-events-none"
                    )}
                  />
                )}
              </button>
            )

            // Tooltip cho ngày lễ hoặc hôm nay
            if (holiday || isToday || lunarInfo) {
              return (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    {DayCell}
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1.5">
                      <div className="font-medium">
                        {date.toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </div>
                      {lunarInfo && (
                        <div className="text-xs text-muted-foreground">
                          {lunarInfo.day}/{lunarInfo.month} (Âm lịch)
                        </div>
                      )}
                      {isToday && (
                        <div className="text-xs text-muted-foreground font-medium">
                          Hôm nay
                        </div>
                      )}
                      {holiday && (
                        <div className="text-xs font-medium text-red-600">
                          {holiday.icon} {holiday.name}
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              )
            }

            return <div key={index}>{DayCell}</div>
          })}
        </div>
      </div>
    </div>
  )
}

/**
 * DateTimeCalendarPopover Component
 * 
 * Popover hiển thị lịch với ngày lễ Việt Nam và âm lịch
 * Custom Calendar Component - Professional Design
 */
export function DateTimeCalendarPopover({ children }: DateTimeCalendarPopoverProps) {
  const [open, setOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())

  // Initialize lunar calendar library on mount
  useEffect(() => {
    initLunarCalendar().catch(() => {
      // Silent fail - lunar dates will just not show
    })
  }, [])

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date)
    // Không đóng popover, chỉ highlight
  }

  const handleMonthChange = (date: Date) => {
    setCurrentMonth(date)
  }

  return (
    <TooltipProvider>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {children}
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0" 
          align="end"
          side="top"
          sideOffset={8}
        >
          <Card className="border-0 shadow-none p-0">
            <div className="p-4">
              <CustomCalendar
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
                currentMonth={currentMonth}
                onMonthChange={handleMonthChange}
              />

              {/* Legend */}
              <div className="border-t pt-3 mt-4 space-y-2">
                <div className="text-xs font-medium text-muted-foreground">
                  Chú thích
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-md bg-accent border flex items-center justify-center text-xs font-semibold">
                      {new Date().getDate()}
                    </span>
                    <span className="text-muted-foreground">Hôm nay</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="h-2 w-2 p-0 rounded-full" />
                    <span className="text-muted-foreground">Ngày lễ</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  )
}
