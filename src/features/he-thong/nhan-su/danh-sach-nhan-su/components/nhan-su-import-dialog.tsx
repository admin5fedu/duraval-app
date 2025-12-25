"use client"

import * as React from "react"
import { FileSpreadsheet, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface NhanSuImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function NhanSuImportDialog({ open, onOpenChange }: NhanSuImportDialogProps) {
    const [file, setFile] = React.useState<File | null>(null)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (!selectedFile) return

        // Validate file type
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-excel', // .xls
        ]
        if (!validTypes.includes(selectedFile.type)) {
            toast.error("Chỉ chấp nhận file Excel (.xlsx, .xls)")
            return
        }

        setFile(selectedFile)
    }

    const handleImport = () => {
        if (!file) {
            toast.error("Vui lòng chọn file Excel")
            return
        }

        // TODO: Implement Excel parsing and import logic
        toast.info("Chức năng nhập Excel đang được phát triển")
        onOpenChange(false)
    }

    const handleClose = () => {
        setFile(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Nhập Dữ Liệu Từ Excel</DialogTitle>
                    <DialogDescription>
                        Tải lên file Excel (.xlsx) để nhập hoặc cập nhật dữ liệu nhân sự hàng loạt
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="file-upload"
                        />
                        <label
                            htmlFor="file-upload"
                            className="cursor-pointer flex flex-col items-center gap-4"
                        >
                            <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">
                                    {file ? file.name : 'Chọn file Excel'}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Hỗ trợ định dạng .xlsx, .xls
                                </p>
                            </div>
                            {!file && (
                                <Button type="button" variant="outline" asChild>
                                    <span>Chọn File</span>
                                </Button>
                            )}
                        </label>
                    </div>

                    {file && (
                        <div className="bg-muted/50 border rounded-lg p-4">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Lưu ý</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Chức năng nhập Excel đang được phát triển. Vui lòng sử dụng tính năng thêm mới từng bản ghi.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Hủy
                    </Button>
                    <Button onClick={handleImport} disabled={!file}>
                        Nhập Dữ Liệu
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

