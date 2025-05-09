import type { Document, Organization, Message } from "@/types/document-types"

// Mock organizations
export const mockOrganizations: Organization[] = [
  { id: "org-1", name: "Organization A" },
  { id: "org-2", name: "Organization B" },
  { id: "org-3", name: "Organization C" },
  { id: "org-4", name: "Organization D" },
  { id: "org-5", name: "Organization E" },
]

// Mock documents
export const mockDocuments: Document[] = [
  {
    id: "doc-1",
    name: "Annual Report 2023.pdf",
    organizationId: "org-1",
    type: "PDF",
    size: 2456789,
    pages: 42,
    createdAt: "2023-01-15T09:30:00Z",
    updatedAt: "2023-01-15T09:30:00Z",
  },
  {
    id: "doc-2",
    name: "Project Proposal.docx",
    organizationId: "org-1",
    type: "DOCX",
    size: 1234567,
    pages: 15,
    createdAt: "2023-02-20T14:45:00Z",
    updatedAt: "2023-03-05T11:20:00Z",
  },
  {
    id: "doc-3",
    name: "Financial Statements Q1.xlsx",
    organizationId: "org-2",
    type: "XLSX",
    size: 3456789,
    pages: 8,
    createdAt: "2023-04-10T08:15:00Z",
    updatedAt: "2023-04-10T08:15:00Z",
  },
  {
    id: "doc-4",
    name: "Marketing Strategy.pdf",
    organizationId: "org-2",
    type: "PDF",
    size: 1987654,
    pages: 24,
    createdAt: "2023-05-05T16:30:00Z",
    updatedAt: "2023-05-08T10:45:00Z",
  },
  {
    id: "doc-5",
    name: "Employee Handbook.pdf",
    organizationId: "org-3",
    type: "PDF",
    size: 4567890,
    pages: 56,
    createdAt: "2023-06-12T13:20:00Z",
    updatedAt: "2023-06-12T13:20:00Z",
  },
  {
    id: "doc-6",
    name: "Product Roadmap.pptx",
    organizationId: "org-3",
    type: "PPTX",
    size: 2345678,
    pages: 18,
    createdAt: "2023-07-08T09:10:00Z",
    updatedAt: "2023-07-20T15:30:00Z",
  },
  {
    id: "doc-7",
    name: "Legal Contract.docx",
    organizationId: "org-4",
    type: "DOCX",
    size: 1876543,
    pages: 12,
    createdAt: "2023-08-15T11:45:00Z",
    updatedAt: "2023-08-15T11:45:00Z",
  },
  {
    id: "doc-8",
    name: "Research Paper.pdf",
    organizationId: "org-4",
    type: "PDF",
    size: 3456789,
    pages: 32,
    createdAt: "2023-09-20T14:30:00Z",
    updatedAt: "2023-09-25T09:15:00Z",
  },
  {
    id: "doc-9",
    name: "Budget 2024.xlsx",
    organizationId: "org-5",
    type: "XLSX",
    size: 2345678,
    pages: 10,
    createdAt: "2023-10-10T10:20:00Z",
    updatedAt: "2023-10-15T16:45:00Z",
  },
  {
    id: "doc-10",
    name: "Meeting Minutes.docx",
    organizationId: "org-5",
    type: "DOCX",
    size: 987654,
    pages: 5,
    createdAt: "2023-11-05T15:30:00Z",
    updatedAt: "2023-11-05T15:30:00Z",
  },
]

// Mock AI conversation
export const mockAIConversation: Message[] = [
  {
    id: "user-1",
    role: "user",
    content: "What were our financial results for Q1 2023?",
    timestamp: "2023-12-01T10:15:00Z",
  },
  {
    id: "ai-1",
    role: "assistant",
    content:
      "Based on the financial statements for Q1 2023, your company reported revenue of $2.3 million, which is a 15% increase compared to Q1 2022. The gross profit margin was 42%, and the net profit was $450,000, representing a 8% increase year-over-year.",
    timestamp: "2023-12-01T10:15:05Z",
    sources: [
      {
        id: "doc-3",
        name: "Financial Statements Q1.xlsx",
        excerpt: "Q1 2023 Revenue: $2,345,678, Gross Profit: $985,185 (42%), Net Profit: $452,890 (8% YoY increase)",
        relevance: 0.95,
      },
      {
        id: "doc-9",
        name: "Budget 2024.xlsx",
        excerpt: "2023 Q1 performance exceeded projections by 12%, with revenue growth of 15% compared to Q1 2022.",
        relevance: 0.82,
      },
    ],
  },
  {
    id: "user-2",
    role: "user",
    content: "What are the key points in our marketing strategy?",
    timestamp: "2023-12-01T10:16:30Z",
  },
  {
    id: "ai-2",
    role: "assistant",
    content:
      "Your marketing strategy focuses on three key areas: digital transformation, customer experience enhancement, and market expansion. The plan emphasizes increasing social media presence, implementing a new CRM system to improve customer interactions, and exploring opportunities in the Asian market, particularly in Japan and Singapore.",
    timestamp: "2023-12-01T10:16:35Z",
    sources: [
      {
        id: "doc-4",
        name: "Marketing Strategy.pdf",
        excerpt:
          "Our three-pronged approach focuses on: 1) Digital transformation through enhanced online presence and social media engagement, 2) Customer experience improvements via new CRM implementation, and 3) Market expansion into Asian markets, with initial focus on Japan and Singapore.",
        relevance: 0.98,
      },
    ],
  },
]

// Mock stats (for reference, not used in current implementation)
export const mockStats = [
  {
    title: "Total Documents",
    value: "256",
    trend: 12.2,
  },
  {
    title: "Organizations",
    value: "15",
    trend: 5.7,
  },
  {
    title: "Recent Uploads",
    value: "42",
    trend: 8.4,
  },
  {
    title: "Active Users",
    value: "23",
    trend: 3.2,
  },
]

// Mock activities (for reference, not used in current implementation)
export const mockActivities = [
  {
    user: {
      name: "Alice Johnson",
      avatar: "/placeholder.svg",
    },
    action: "uploaded Annual Report 2023.pdf",
    time: "2 hours ago",
  },
  {
    user: {
      name: "Bob Smith",
      avatar: "/placeholder.svg",
    },
    action: "updated Project Proposal.docx",
    time: "1 day ago",
  },
  {
    user: {
      name: "Charlie Davis",
      avatar: "/placeholder.svg",
    },
    action: "commented on Financial Statements Q1.xlsx",
    time: "3 days ago",
  },
]
