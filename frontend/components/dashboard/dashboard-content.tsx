"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import StatCard from "@/components/dashboard/stat-card"
import RecentActivityList from "@/components/dashboard/recent-activity-list"
import DataChart from "@/components/dashboard/data-chart"
import { mockStats, mockActivities } from "@/lib/mock-data"

export default function DashboardContent() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's an overview of your data.</p>
        </div>

        <Tabs defaultValue="overview" onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {mockStats.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                  <CardDescription>Data visualization for the last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <DataChart />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest updates and notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentActivityList activities={mockActivities} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>Detailed analytics data will be displayed here</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This is a placeholder for the analytics content.
                  {/* 
                    TODO: Implement actual analytics functionality
                    - Connect to analytics API
                    - Add filtering options
                    - Implement date range selector
                    - Add export functionality
                  */}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reports</CardTitle>
                <CardDescription>Generated reports and exports</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This is a placeholder for the reports content.
                  {/* 
                    TODO: Implement reports functionality
                    - Add report generation options
                    - Implement scheduled reports
                    - Add PDF/CSV export
                    - Implement report templates
                  */}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Manage your dashboard preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This is a placeholder for the settings content.
                  {/* 
                    TODO: Implement settings functionality
                    - User preferences
                    - Notification settings
                    - Theme customization
                    - Data display options
                  */}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
