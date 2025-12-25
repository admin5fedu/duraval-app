"use client"

import { memo } from "react"
import { Link } from "react-router-dom"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface DashboardItem {
  title: string
  href: string
  icon: LucideIcon
  description?: string
  color?: string
}

export interface DashboardGroup {
  title: string
  icon?: LucideIcon
  items: DashboardItem[]
}

interface ModuleDashboardProps {
  title: string
  description?: string
  groups: DashboardGroup[]
}

export const ModuleDashboard = memo(function ModuleDashboard({ 
  title, 
  description, 
  groups 
}: ModuleDashboardProps) {
  return (
    <div className="flex flex-col gap-8 p-6 animate-in fade-in zoom-in duration-150">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-primary">{title}</h1>
        {description && <p className="text-muted-foreground text-lg">{description}</p>}
      </div>

      <div className="flex flex-col gap-8">
        {groups.map((group) => (
          <div key={group.title} className="flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b pb-2">
              {group.icon && (
                <group.icon className="size-5 text-primary shrink-0" />
              )}
              <h2 className="text-xl font-semibold text-primary">{group.title}</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {group.items.map((item) => {
                const IconComponent = item.icon
                return (
                  <Link
                    key={item.title}
                    to={item.href}
                    className={cn(
                      "group relative flex items-start gap-4 overflow-hidden rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/50 hover:bg-accent/5"
                    )}
                  >
                    <div className={cn(
                      "shrink-0 p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300",
                      item.color
                    )}>
                      <IconComponent className="size-6" />
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                      <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors truncate">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if title, description, or groups length/keys change
  if (prevProps.title !== nextProps.title) return false
  if (prevProps.description !== nextProps.description) return false
  if (prevProps.groups.length !== nextProps.groups.length) return false
  
  // Check if group titles are the same
  for (let i = 0; i < prevProps.groups.length; i++) {
    if (prevProps.groups[i].title !== nextProps.groups[i].title) return false
    if (prevProps.groups[i].items.length !== nextProps.groups[i].items.length) return false
    
    // Check if item titles are the same
    for (let j = 0; j < prevProps.groups[i].items.length; j++) {
      if (prevProps.groups[i].items[j].title !== nextProps.groups[i].items[j].title) return false
      if (prevProps.groups[i].items[j].href !== nextProps.groups[i].items[j].href) return false
    }
  }
  
  return true // Props are equal, skip re-render
})

