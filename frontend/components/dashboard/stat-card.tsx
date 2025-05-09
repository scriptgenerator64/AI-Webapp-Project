import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { StatCardProps } from "@/types/dashboard"

export default function StatCard({ title, value, description, trend, icon: Icon }: StatCardProps) {
  // Determine trend color
  const trendColor = trend > 0 ? "text-green-500" : trend < 0 ? "text-red-500" : "text-gray-500"

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center pt-1">
          <CardDescription className={trendColor}>
            {trend > 0 ? "↑" : trend < 0 ? "↓" : "→"} {Math.abs(trend)}%
          </CardDescription>
          <CardDescription className="ml-1 text-xs text-muted-foreground">from last month</CardDescription>
        </div>
      </CardContent>
    </Card>
  )
}
