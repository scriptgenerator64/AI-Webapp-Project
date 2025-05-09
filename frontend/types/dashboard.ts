import type { LucideIcon } from "lucide-react"

// Stat card component props
export interface StatCardProps {
  title: string
  value: string
  description?: string
  trend: number // Percentage change (positive or negative)
  icon?: LucideIcon
}

// User type for activities
export interface User {
  name: string
  avatar: string
}

// Activity item type
export interface Activity {
  user: User
  action: string
  time: string
}

// Recent activity list props
export interface RecentActivityProps {
  activities: Activity[]
}

/*
  TODO: Extend these types as needed when implementing actual functionality
  Additional types to consider:
  - API response types
  - Form input types
  - Authentication types
  - Notification types
  - Settings types
*/
