"use client"

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { DateTimeCalendarPopover } from './DateTimeCalendarPopover'

/**
 * DateTimeDisplay Component
 * 
 * Hiển thị ngày giờ real-time theo múi giờ Sài Gòn (GMT+7)
 * Format: dd/mm/yyyy hh:mm:ss
 * Chỉ hiển thị trên desktop
 * Click vào để mở calendar popover
 */
export function DateTimeDisplay() {
  const [dateTime, setDateTime] = useState<string>('')

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      
      // Convert to GMT+7 (Asia/Ho_Chi_Minh) using Intl.DateTimeFormat
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
      
      const parts = formatter.formatToParts(now)
      const year = parts.find(p => p.type === 'year')?.value || '0000'
      const month = parts.find(p => p.type === 'month')?.value || '01'
      const day = parts.find(p => p.type === 'day')?.value || '01'
      const hour = parts.find(p => p.type === 'hour')?.value || '00'
      const minute = parts.find(p => p.type === 'minute')?.value || '00'
      const second = parts.find(p => p.type === 'second')?.value || '00'
      
      // Format: dd/mm/yyyy hh:mm:ss
      setDateTime(`${day}/${month}/${year} ${hour}:${minute}:${second}`)
    }

    // Update immediately
    updateDateTime()

    // Update every second
    const interval = setInterval(updateDateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <DateTimeCalendarPopover>
      <div className={cn(
        "hidden md:flex items-center",
        "text-sm text-foreground",
        "px-3 py-1.5",
        "cursor-pointer",
        "hover:bg-accent/50 rounded-md",
        "transition-colors"
      )}>
        {dateTime}
      </div>
    </DateTimeCalendarPopover>
  )
}

