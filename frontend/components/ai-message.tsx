"use client"

import { useState } from "react"
import type { Message } from "@/types/document-types"
import { ChevronDown, ChevronUp, FileText, User, Bot } from "lucide-react"
import { cn } from "@/lib/utils"

interface AIMessageProps {
  message: Message
}

export default function AIMessage({ message }: AIMessageProps) {
  const [sourcesExpanded, setSourcesExpanded] = useState(false)

  const toggleSources = () => {
    setSourcesExpanded(!sourcesExpanded)
  }

  return (
    <div
      className={cn(
        "flex gap-3 p-4 rounded-lg",
        message.role === "user" ? "bg-gray-100 dark:bg-gray-700" : "bg-white dark:bg-gray-800 border",
      )}
    >
      <div className="flex-shrink-0">
        {message.role === "user" ? (
          <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <Bot className="h-4 w-4 text-blue-600 dark:text-blue-300" />
          </div>
        )}
      </div>

      <div className="flex-1">
        <div className="prose dark:prose-invert max-w-none">
          <p>{message.content}</p>
        </div>

        {message.role === "assistant" && message.sources && message.sources.length > 0 && (
          <div className="mt-4">
            <button
              className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
              onClick={toggleSources}
            >
              {sourcesExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Hide sources ({message.sources.length})
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Show sources ({message.sources.length})
                </>
              )}
            </button>

            {sourcesExpanded && (
              <div className="mt-2 space-y-2">
                {message.sources.map((source) => (
                  <div key={source.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                    <div className="flex items-center mb-1">
                      <FileText className="h-4 w-4 mr-2 text-blue-500" />
                      <a
                        href={`/documents/${source.id}`}
                        className="text-sm font-medium hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {source.name}
                      </a>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {Math.round(source.relevance * 100)}% match
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{source.excerpt}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-1 text-xs text-muted-foreground">{new Date(message.timestamp).toLocaleTimeString()}</div>
      </div>
    </div>
  )
}
