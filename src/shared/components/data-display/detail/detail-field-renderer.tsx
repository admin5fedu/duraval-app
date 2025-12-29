"use client"

import * as React from "react"
import { Link } from "react-router-dom"
import { Calendar, Mail, Phone, Copy, Check, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { DetailField } from "../generic-detail-view/"
import { formatDate, formatCurrency, formatNumber, isValidEmail, isValidPhone } from "@/shared/utils/detail-utils"
import { bodyTextClass } from "@/shared/utils/text-styles"
import { toolbarGapClass } from "@/shared/utils/toolbar-styles"
import { cn } from "@/lib/utils"
import {
  getEmployeeStatusBadgeClass,
} from "@/components/ui/status-badge"
import { CompactAvatarUpload } from "@/components/ui/compact-avatar-upload"
import { getEnumBadgeClass, hasEnumColorConfig } from "@/shared/utils/enum-color-registry"
import { autoDetectAndRegisterEnum } from "@/shared/utils/enum-detection"

interface CopyableFieldProps {
  value: string
  children: React.ReactNode
  label?: string
}

function CopyableField({ value, children, label }: CopyableFieldProps) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success(`Đã sao chép ${label || 'nội dung'} vào clipboard`)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Không thể sao chép')
    }
  }

  return (
    <div className="group/copy relative inline-flex items-center gap-2">
      {children}
      <button
        onClick={handleCopy}
        className="opacity-0 group-hover/copy:opacity-100 transition-opacity p-1 rounded hover:bg-accent"
        aria-label="Sao chép"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-green-600" />
        ) : (
          <Copy className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
        )}
      </button>
    </div>
  )
}

/**
 * Component để render các field types khác nhau trong detail view
 */
export function DetailFieldRenderer({ field }: { field: DetailField }) {
  // Nếu có custom format function, sử dụng nó trước (cho phép format cả khi value null)
  if (field.format) {
    const formatted = field.format(field.value)
    // Nếu format trả về ReactNode, render trực tiếp
    if (React.isValidElement(formatted)) {
      return formatted
    }
    // Nếu format trả về string, wrap trong span
    return <span className={cn("text-base text-foreground", bodyTextClass())}>{formatted}</span>
  }

  // ✅ Empty State Handling: Hiển thị "-" cho giá trị rỗng
  if (field.value === null || field.value === undefined || field.value === '') {
    return <span className={cn("text-muted-foreground", bodyTextClass())}>-</span>
  }

  const value = field.value
  const valueStr = String(value)

  // Xử lý theo type
  switch (field.type) {
    case "image": {
      const imageUrl = valueStr && valueStr !== "null" && valueStr !== "undefined" ? valueStr : null
      return (
        <CompactAvatarUpload
          value={imageUrl}
          onChange={() => {}} // Read-only in detail view
          disabled={true}
          size="md"
          displayName={field.displayName || field.label}
        />
      )
    }

    case "status": {
      // Try enum registry first, fallback to legacy function
      let className: string
      if (hasEnumColorConfig(field.key)) {
        className = getEnumBadgeClass(field.key, value)
      } else {
        // Legacy support for tinh_trang
        className = getEmployeeStatusBadgeClass(valueStr)
      }
      return (
        <Badge variant="outline" className={className}>
          {valueStr}
        </Badge>
      )
    }

    case "badge":
    case "enum": {
      // Auto-detect and register enum if not already registered
      if (!hasEnumColorConfig(field.key)) {
        autoDetectAndRegisterEnum({
          fieldKey: field.key,
          type: field.type,
          value: field.value,
          explicitEnumConfig: field.enumConfig,
        })
      }

      // Get color class from registry
      const className = getEnumBadgeClass(field.key, field.value)
      return (
        <Badge variant="outline" className={className}>
          {valueStr}
        </Badge>
      )
    }

    case "date":
      return (
        <div className={cn("flex items-center", toolbarGapClass())}>
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className={cn("text-base text-foreground", bodyTextClass())}>{formatDate(value)}</span>
        </div>
      )

    case "email": {
      const email = valueStr.trim()
      if (isValidEmail(email)) {
        return (
          <CopyableField value={email} label="email">
            <a 
              href={`mailto:${email}`}
              className={cn("flex items-center text-base text-primary hover:underline", toolbarGapClass(), bodyTextClass())}
            >
              <Mail className="h-4 w-4 shrink-0" />
              <span className="break-all">{email}</span>
            </a>
          </CopyableField>
        )
      }
      return <span className={cn("text-base text-foreground break-all", bodyTextClass())}>{email}</span>
    }

    case "phone":
      const phone = valueStr.trim()
      if (isValidPhone(phone)) {
        return (
          <CopyableField value={phone} label="số điện thoại">
            <a 
              href={`tel:${phone.replace(/\s/g, '')}`}
              className={cn("flex items-center text-base text-primary hover:underline", toolbarGapClass(), bodyTextClass())}
            >
              <Phone className="h-4 w-4 shrink-0" />
              <span>{phone}</span>
            </a>
          </CopyableField>
        )
      }
      return <span className={cn("text-base text-foreground", bodyTextClass())}>{phone}</span>

    case "number":
      return (
        <CopyableField value={valueStr} label="số">
          <span className={cn("text-base text-foreground font-mono", bodyTextClass())}>{formatNumber(value)}</span>
        </CopyableField>
      )

    case "currency":
      if (typeof value === 'number' || !isNaN(parseFloat(valueStr))) {
        return <span className={cn("text-base text-foreground font-mono", bodyTextClass())}>{formatCurrency(value)}</span>
      }
      return <span className={cn("text-base text-foreground", bodyTextClass())}>{valueStr}</span>

    case "url":
      try {
        new URL(valueStr)
        return (
          <a 
            href={valueStr}
            target="_blank"
            rel="noopener noreferrer"
            className={cn("text-base text-primary hover:underline break-all", bodyTextClass())}
          >
            {valueStr}
          </a>
        )
      } catch {
        return <span className={cn("text-base text-foreground break-all", bodyTextClass())}>{valueStr}</span>
      }

    case "text":
    default:
      // Nếu có link, render với Link component
      if (field.link) {
        return (
          <Link 
            to={field.link}
            className={cn("flex items-center text-base text-primary hover:underline group", "gap-1.5", bodyTextClass())}
          >
            <span>{valueStr}</span>
            <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        )
      }
      // ✅ Cải thiện value styling: text-base cho dễ đọc hơn
      return <span className={cn("text-base text-foreground", bodyTextClass())}>{valueStr}</span>
  }
}

