import { Button } from "@/components/ui/button"
import type { Document } from "@/types/document-types"
import { Calendar, FileText, Trash, Edit, RefreshCw, ExternalLink } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DetailsPanelProps {
  document: Document | null
}

export default function DetailsPanel({ document }: DetailsPanelProps) {
  if (!document) {
    return (
      <div className="w-80 bg-white dark:bg-gray-800 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
          <p>Select a document to view details</p>
        </div>
      </div>
    )
  }

  // Generate a unique URL for the document
  const documentUrl = `/documents/${document.id}`

  return (
    <div className="w-80 bg-white dark:bg-gray-800 flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Details</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          <div>
            <h3 className="text-lg font-medium">{document.name}</h3>
            <p className="text-sm text-muted-foreground">{document.type}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Created: {new Date(document.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Updated: {new Date(document.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Edit className="h-4 w-4 mr-2" />
              Rename
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <RefreshCw className="h-4 w-4 mr-2" />
              Replace
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start text-red-500 hover:text-red-500">
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start" asChild>
              <a href={documentUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Link
              </a>
            </Button>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Metadata</h4>
            <div className="rounded-md bg-gray-50 dark:bg-gray-900 p-3">
              <pre className="text-xs overflow-auto">
                <code>
                  {JSON.stringify(
                    {
                      id: document.id,
                      organizationId: document.organizationId,
                      size: document.size,
                      pages: document.pages,
                      type: document.type,
                    },
                    null,
                    2,
                  )}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
