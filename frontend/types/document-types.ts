// Organization type
export interface Organization {
  id: string
  name: string
}

// Document type
export interface Document {
  id: string
  name: string
  organizationId: string
  type: string
  size: number
  pages: number
  createdAt: string
  updatedAt: string
}

// Source type for AI responses
export interface Source {
  id: string
  name: string
  excerpt: string
  relevance: number
}

// Message type for AI conversation
export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  sources?: Source[]
}
