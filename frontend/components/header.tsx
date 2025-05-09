"use client"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Section = "overview" | "askAI" | "upload"

interface HeaderProps {
  activeSection: Section
  onSectionChange: (section: Section) => void
}

export default function Header({ activeSection, onSectionChange }: HeaderProps) {
  return (
    <header className="border-b bg-white dark:bg-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Master Document Manager Console</h1>

        <Tabs value={activeSection} onValueChange={(value) => onSectionChange(value as Section)}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="askAI">Ask AI</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </header>
  )
}
