"use client"

import { useState } from "react"
import Header from "@/components/header"
import OrganizationsPanel from "@/components/organizations-panel"
import SearchPanel from "@/components/search-panel"
import DetailsPanel from "@/components/details-panel"
import AskAIPanel from "@/components/ask-ai-panel"
import UploadModal from "@/components/upload-modal"
import type { Document } from "@/types/document-types"
import { mockDocuments, mockOrganizations } from "@/lib/mock-data"

// Main sections of the application
type Section = "overview" | "askAI" | "upload"

export default function DocumentManager() {
  // Active section state
  const [activeSection, setActiveSection] = useState<Section>("overview")

  // Selected organizations state
  const [selectedOrgs, setSelectedOrgs] = useState<string[]>([mockOrganizations[0].id])

  // Selected document state
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)

  // Search query state
  const [searchQuery, setSearchQuery] = useState("")

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  // Filter documents based on selected organizations and search query
  const filteredDocuments = mockDocuments.filter((doc) => {
    const matchesOrg = selectedOrgs.includes(doc.organizationId)
    const matchesSearch = searchQuery === "" || doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesOrg && matchesSearch
  })

  // Handle section change
  const handleSectionChange = (section: Section) => {
    setActiveSection(section)
    if (section === "upload") {
      setIsUploadModalOpen(true)
      setActiveSection("overview") // Keep overview active in the background
    }
  }

  // Handle organization selection
  const handleOrgSelection = (orgId: string) => {
    setSelectedOrgs((prev) => {
      if (prev.includes(orgId)) {
        return prev.filter((id) => id !== orgId)
      } else {
        return [...prev, orgId]
      }
    })
  }

  // Handle document selection
  const handleDocumentSelect = (doc: Document) => {
    setSelectedDocument(doc)
  }

  return (
    <div className="flex flex-col h-screen">
      <Header activeSection={activeSection} onSectionChange={handleSectionChange} />

      <div className="flex flex-1 overflow-hidden">
        {/* Organizations panel - always visible */}
        <OrganizationsPanel
          organizations={mockOrganizations}
          selectedOrgs={selectedOrgs}
          onOrgSelect={handleOrgSelection}
        />

        {activeSection === "overview" ? (
          <>
            {/* Search panel - visible in overview mode */}
            <SearchPanel
              documents={filteredDocuments}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onDocumentSelect={handleDocumentSelect}
              selectedDocumentId={selectedDocument?.id}
            />

            {/* Details panel - visible in overview mode */}
            <DetailsPanel document={selectedDocument} />
          </>
        ) : (
          // Ask AI panel - visible in askAI mode
          <AskAIPanel selectedOrgs={selectedOrgs} organizations={mockOrganizations} />
        )}
      </div>

      {/* Upload modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        organizations={mockOrganizations}
      />
    </div>
  )
}
