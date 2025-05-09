"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import type { Organization } from "@/types/document-types"
import { Upload, Plus, File } from "lucide-react"
import { cn } from "@/lib/utils"

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  organizations: Organization[]
}

export default function UploadModal({ isOpen, onClose, organizations }: UploadModalProps) {
  const [selectedOrgId, setSelectedOrgId] = useState<string>("")
  const [newOrgName, setNewOrgName] = useState("")
  const [isCreatingNewOrg, setIsCreatingNewOrg] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files) {
      setFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  // Handle upload (mock)
  const handleUpload = () => {
    if (!selectedOrgId && !newOrgName) return

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setIsUploading(false)
            handleClose()
          }, 500)
          return 100
        }
        return prev + 5
      })
    }, 200)
  }

  // Reset and close modal
  const handleClose = () => {
    setSelectedOrgId("")
    setNewOrgName("")
    setIsCreatingNewOrg(false)
    setFiles([])
    setUploadProgress(0)
    setIsUploading(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={isUploading ? undefined : handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Organization selection */}
          {isCreatingNewOrg ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">Create New Organization</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Organization name"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                />
                <Button variant="ghost" size="icon" onClick={() => setIsCreatingNewOrg(false)}>
                  <Plus className="h-4 w-4 rotate-45" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Organization</label>
              <div className="flex gap-2">
                <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={() => setIsCreatingNewOrg(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* File upload area */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Upload Files</label>
            <div
              className={cn(
                "border-2 border-dashed rounded-md p-6 text-center",
                "hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                "cursor-pointer",
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <Input type="file" multiple className="hidden" id="file-upload" onChange={handleFileChange} />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">Drag and drop files here or click to browse</p>
                <p className="text-xs text-muted-foreground mt-1">Supports PDF, DOCX, TXT, and more</p>
              </label>
            </div>
          </div>

          {/* Selected files */}
          {files.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Selected Files ({files.length})</label>
              <div className="max-h-32 overflow-y-auto space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <File className="h-4 w-4 mr-2 text-blue-500" />
                    <div className="text-sm truncate">{file.name}</div>
                    <div className="text-xs text-muted-foreground ml-auto">{(file.size / 1024).toFixed(0)} KB</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          {isUploading ? (
            <div className="w-full space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <div className="text-xs text-center text-muted-foreground">
                {uploadProgress < 100 ? "Processing documents..." : "Complete!"}
              </div>
            </div>
          ) : (
            <Button
              onClick={handleUpload}
              className="w-full"
              disabled={(!selectedOrgId && !newOrgName) || files.length === 0 || (isCreatingNewOrg && !newOrgName)}
            >
              Upload
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
