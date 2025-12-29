"use client"

import * as React from "react"
import { Save, FolderOpen, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { smallTextClass } from "@/shared/utils/text-styles"
import {
  getExportTemplates,
  saveExportTemplate,
  loadExportTemplate,
  deleteExportTemplate,
  type ExportTemplate,
} from "@/shared/utils/export-template-manager"

interface ExportTemplateSelectorProps {
  moduleName: string
  selectedColumns: Set<string>
  columnOrder: Map<string, number>
  exportOptions: {
    includeMetadata?: boolean
    professionalFormatting?: boolean
    dateFormat?: 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd'
  }
  defaultMode?: 'all' | 'filtered' | 'selected'
  defaultFormat?: 'excel' | 'pdf'
  onLoadTemplate: (template: ExportTemplate['config']) => void
}

export function ExportTemplateSelector({
  moduleName,
  selectedColumns,
  columnOrder,
  exportOptions,
  defaultMode,
  defaultFormat,
  onLoadTemplate,
}: ExportTemplateSelectorProps) {
  const [showSaveDialog, setShowSaveDialog] = React.useState(false)
  const [showLoadDialog, setShowLoadDialog] = React.useState(false)
  const [templateName, setTemplateName] = React.useState("")
  const [templates, setTemplates] = React.useState<ExportTemplate[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string>("")

  // Load templates when dialog opens
  React.useEffect(() => {
    if (showLoadDialog || showSaveDialog) {
      setTemplates(getExportTemplates(moduleName))
    }
  }, [moduleName, showLoadDialog, showSaveDialog])

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      toast.error("Vui lòng nhập tên template")
      return
    }

    try {
      saveExportTemplate(moduleName, {
        name: templateName.trim(),
        config: {
          selectedColumns: Array.from(selectedColumns),
          columnOrder: Object.fromEntries(columnOrder),
          exportOptions,
          defaultMode,
          defaultFormat,
        },
      })
      
      toast.success("Đã lưu template thành công")
      setShowSaveDialog(false)
      setTemplateName("")
      setTemplates(getExportTemplates(moduleName))
    } catch (error) {
      toast.error("Không thể lưu template")
      console.error(error)
    }
  }

  const handleLoadTemplate = () => {
    if (!selectedTemplateId) {
      toast.error("Vui lòng chọn template")
      return
    }

    const template = loadExportTemplate(moduleName, selectedTemplateId)
    if (!template) {
      toast.error("Không tìm thấy template")
      return
    }

    onLoadTemplate(template.config)
    toast.success(`Đã tải template "${template.name}"`)
    setShowLoadDialog(false)
    setSelectedTemplateId("")
  }

  const handleDeleteTemplate = (templateId: string, templateName: string) => {
    if (!confirm(`Bạn có chắc muốn xóa template "${templateName}"?`)) {
      return
    }

    if (deleteExportTemplate(moduleName, templateId)) {
      toast.success("Đã xóa template")
      setTemplates(getExportTemplates(moduleName))
    } else {
      toast.error("Không thể xóa template")
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={() => setShowLoadDialog(true)}
        >
          <FolderOpen className="mr-1 h-3 w-3" />
          Tải template
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={() => setShowSaveDialog(true)}
        >
          <Save className="mr-1 h-3 w-3" />
          Lưu template
        </Button>
      </div>

      {/* Save Template Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Lưu template xuất</DialogTitle>
            <DialogDescription>
              Lưu cấu hình xuất hiện tại để sử dụng lại sau
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tên template</Label>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Nhập tên template..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveTemplate()
                  }
                }}
              />
            </div>
            <div className={cn(smallTextClass(), "text-muted-foreground")}>
              Template sẽ lưu: {selectedColumns.size} cột đã chọn, thứ tự cột, và các tùy chọn xuất
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveTemplate}>
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Load Template Dialog */}
      <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Tải template xuất</DialogTitle>
            <DialogDescription>
              Chọn template đã lưu để áp dụng cấu hình xuất
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {templates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Chưa có template nào được lưu
              </div>
            ) : (
              <ScrollArea className="h-[300px] rounded-md border p-3">
                <div className="space-y-2">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-md border cursor-pointer transition-colors",
                        selectedTemplateId === template.id
                          ? "bg-muted border-primary"
                          : "hover:bg-muted/50"
                      )}
                      onClick={() => setSelectedTemplateId(template.id)}
                    >
                      <div className="flex-1">
                        <div className="font-medium">{template.name}</div>
                        <div className={cn(smallTextClass(), "text-muted-foreground mt-1")}>
                          {template.config.selectedColumns.length} cột • 
                          Cập nhật: {new Date(template.updatedAt).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteTemplate(template.id, template.name)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLoadDialog(false)}>
              Hủy
            </Button>
            <Button 
              onClick={handleLoadTemplate}
              disabled={!selectedTemplateId || templates.length === 0}
            >
              Tải template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

