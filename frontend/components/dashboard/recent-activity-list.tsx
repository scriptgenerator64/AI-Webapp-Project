import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { RecentActivityProps, Activity } from "@/types/dashboard"

export default function RecentActivityList({ activities }: RecentActivityProps) {
  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <ActivityItem key={index} activity={activity} />
      ))}
    </div>
  )
}

function ActivityItem({ activity }: { activity: Activity }) {
  return (
    <div className="flex items-start gap-4 py-2">
      <Avatar className="h-9 w-9">
        <AvatarImage src={activity.user.avatar || "/placeholder.svg"} alt={activity.user.name} />
        <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium leading-none">
          <span className="font-semibold">{activity.user.name}</span> {activity.action}
        </p>
        <p className="text-xs text-muted-foreground">{activity.time}</p>
      </div>
    </div>
  )
}
