"use client"

import { useState } from "react"
import Header from "@/components/layout/header"
import Sidebar from "@/components/layout/sidebar"
import DashboardContent from "@/components/dashboard/dashboard-content"
import { useMobile } from "@/hooks/use-mobile"
import { DashboardProvider } from "@/context/dashboard-context"

export default function Dashboard() {
  const isMobile = useMobile()
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <DashboardProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar isOpen={sidebarOpen} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header toggleSidebar={toggleSidebar} />
          <DashboardContent />
        </div>
      </div>
    </DashboardProvider>
  )
}
