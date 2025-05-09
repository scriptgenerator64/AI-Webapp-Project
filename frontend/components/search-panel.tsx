"use client"

import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Document } from "@/types/document-types"
import { Search } from "lucide-react"
import DocumentItem from "@/components/document-item"

interface SearchPanelProps {
  documents: Document[]
  searchQuery: string
  onSearchChange: (query: string) => void
  onDocumentSelect: (doc: Document) => void
  selectedDocumentId?: string
}

export default function SearchPanel({
  documents,
  searchQuery,
  onSearchChange,
  onDocumentSelect,
  selectedDocumentId,
}: SearchPanelProps) {
  return (
    <div className="flex-1 border-r bg-white dark:bg-gray-800 flex flex-col">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search documents..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {documents.length > 0 ? (
            documents.map((doc) => (
              <DocumentItem
                key={doc.id}
                document={doc}
                isSelected={doc.id === selectedDocumentId}
                onClick={() => onDocumentSelect(doc)}
              />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">No documents found</div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
