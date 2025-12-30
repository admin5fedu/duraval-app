"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { DanhMucTaiLieu } from "../schema"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, ChevronDown, Folder, FolderOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { danhMucTaiLieuConfig } from "../config"
import { Edit } from "lucide-react"
import { DeleteDanhMucTaiLieuButton } from "./delete-danh-muc-tai-lieu-button"

interface DanhMucTaiLieuTreeViewProps {
  data: DanhMucTaiLieu[]
  onEdit?: (id: number) => void
  onDelete?: (id: number) => void
  onView?: (id: number) => void
}

interface TreeNode {
  item: DanhMucTaiLieu
  children: TreeNode[]
}

function buildTree(data: DanhMucTaiLieu[]): TreeNode[] {
  const map = new Map<number, TreeNode>()
  const roots: TreeNode[] = []

  // Tạo map tất cả các node
  data.forEach(item => {
    if (item.id) {
      map.set(item.id, { item, children: [] })
    }
  })

  // Xây dựng cây
  data.forEach(item => {
    if (!item.id) return
    
    const node = map.get(item.id)!
    
    if (item.danh_muc_cha_id) {
      const parent = map.get(item.danh_muc_cha_id)
      if (parent) {
        parent.children.push(node)
      } else {
        // Nếu không tìm thấy parent, coi như root
        roots.push(node)
      }
    } else {
      // Cấp 1 hoặc không có parent
      roots.push(node)
    }
  })

  // Sắp xếp: cấp 1 trước, sau đó cấp 2
  const sortNodes = (nodes: TreeNode[]): TreeNode[] => {
    return nodes
      .sort((a, b) => {
        // Sắp xếp theo cap (1 trước 2)
        if (a.item.cap !== b.item.cap) {
          return (a.item.cap || 0) - (b.item.cap || 0)
        }
        // Sau đó sắp xếp theo ten_danh_muc hoặc id
        const nameA = a.item.ten_danh_muc || `ID: ${a.item.id}`
        const nameB = b.item.ten_danh_muc || `ID: ${b.item.id}`
        return nameA.localeCompare(nameB)
      })
      .map(node => ({
        ...node,
        children: sortNodes(node.children)
      }))
  }

  return sortNodes(roots)
}

function TreeItem({ 
  node, 
  level = 0, 
  expandedNodes, 
  onToggle,
  onEdit,
  onDelete,
  onView,
}: { 
  node: TreeNode
  level: number
  expandedNodes: Set<number>
  onToggle: (id: number) => void
  onEdit?: (id: number) => void
  onDelete?: (id: number) => void
  onView?: (id: number) => void
}) {
  const navigate = useNavigate()
  const isExpanded = expandedNodes.has(node.item.id!)
  const hasChildren = node.children.length > 0
  const indent = level * 24

  const badgeColorMap: Record<string, string> = {
    "Biểu mẫu & Kế hoạch": "bg-blue-50 text-blue-700 border-blue-200",
    "Văn bản hệ thống": "bg-purple-50 text-purple-700 border-purple-200",
  }
  const badgeClass = node.item.hang_muc 
    ? badgeColorMap[node.item.hang_muc] || "bg-gray-50 text-gray-700 border-gray-200"
    : ""

  const displayName = node.item.ten_danh_muc || node.item.hang_muc || `ID: ${node.item.id}`

  return (
    <div>
      <div 
        className={cn(
          "flex items-center gap-2 py-2 px-3 hover:bg-accent/50 rounded-md transition-colors",
          level > 0 && "ml-4"
        )}
        style={{ paddingLeft: `${indent + 12}px` }}
      >
        {/* Expand/Collapse button */}
        {hasChildren ? (
          <button
            onClick={() => onToggle(node.item.id!)}
            className="p-0.5 hover:bg-accent rounded"
            aria-label={isExpanded ? "Thu gọn" : "Mở rộng"}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        ) : (
          <div className="w-5" /> // Spacer for alignment
        )}

        {/* Icon */}
        {hasChildren ? (
          isExpanded ? (
            <FolderOpen className="h-4 w-4 text-muted-foreground shrink-0" />
          ) : (
            <Folder className="h-4 w-4 text-muted-foreground shrink-0" />
          )
        ) : (
          <div className="w-4" />
        )}

        {/* Content */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          {node.item.hang_muc && (
            <Badge variant="outline" className={cn("text-xs shrink-0", badgeClass)}>
              {node.item.hang_muc}
            </Badge>
          )}
          {node.item.cap && (
            <Badge variant="outline" className="text-xs shrink-0 bg-gray-100">
              Cấp {node.item.cap}
            </Badge>
          )}
          <button
            onClick={() => {
              if (onView) {
                onView(node.item.id!)
              } else {
                navigate(`${danhMucTaiLieuConfig.routePath}/${node.item.id}`)
              }
            }}
            className="font-medium hover:underline truncate text-left flex-1"
          >
            {displayName}
          </button>
          {node.item.loai_tai_lieu && (
            <span className="text-xs text-muted-foreground truncate hidden md:inline">
              {node.item.loai_tai_lieu}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:text-blue-600"
            onClick={(e) => {
              e.stopPropagation()
              if (onEdit) {
                onEdit(node.item.id!)
              } else {
                navigate(`${danhMucTaiLieuConfig.routePath}/${node.item.id}/sua?returnTo=list`)
              }
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <DeleteDanhMucTaiLieuButton 
            id={node.item.id!} 
            name={displayName} 
            iconOnly 
          />
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <TreeItem
              key={child.item.id}
              node={child}
              level={level + 1}
              expandedNodes={expandedNodes}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              onView={onView}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function DanhMucTaiLieuTreeView({ 
  data, 
  onEdit, 
  onDelete, 
  onView 
}: DanhMucTaiLieuTreeViewProps) {
  const [expandedNodes, setExpandedNodes] = React.useState<Set<number>>(new Set())

  const tree = React.useMemo(() => buildTree(data), [data])

  const handleToggle = React.useCallback((id: number) => {
    setExpandedNodes(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  // Expand all by default
  React.useEffect(() => {
    const allIds = new Set<number>()
    const collectIds = (nodes: TreeNode[]) => {
      nodes.forEach(node => {
        if (node.item.id) {
          allIds.add(node.item.id)
          if (node.children.length > 0) {
            collectIds(node.children)
          }
        }
      })
    }
    collectIds(tree)
    setExpandedNodes(allIds)
  }, [tree])

  if (tree.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p>Không có dữ liệu</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg bg-card">
      <div className="p-2">
        {tree.map((node) => (
          <TreeItem
            key={node.item.id}
            node={node}
            level={0}
            expandedNodes={expandedNodes}
            onToggle={handleToggle}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
          />
        ))}
      </div>
    </div>
  )
}

