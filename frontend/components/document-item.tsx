"use client"

import type { Document } from "@/types/document-types"
import { FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface DocumentItemProps {
  document: Document
  isSelected: boolean
  onClick: () => void
}

export default function DocumentItem({ document, isSelected, onClick }: DocumentItemProps) {
  return (
    <div
      className={cn(
        "flex items-center p-3 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700",
        isSelected && "bg-gray-100 dark:bg-gray-700",
      )}
      onClick={onClick}
    >
      <FileText className="h-5 w-5 mr-2 text-blue-500" />
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{document.name}</div>
        <div className="text-xs text-muted-foreground truncate">
          Updated {new Date(document.updatedAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}
