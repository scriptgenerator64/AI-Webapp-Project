import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Organization } from "@/types/document-types"

interface OrganizationsPanelProps {
  organizations: Organization[]
  selectedOrgs: string[]
  onOrgSelect: (orgId: string) => void
}

export default function OrganizationsPanel({ organizations, selectedOrgs, onOrgSelect }: OrganizationsPanelProps) {
  return (
    <div className="w-64 border-r bg-white dark:bg-gray-800 flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Organizations</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {organizations.map((org) => (
            <div key={org.id} className="flex items-center space-x-2">
              <Checkbox
                id={`org-${org.id}`}
                checked={selectedOrgs.includes(org.id)}
                onCheckedChange={() => onOrgSelect(org.id)}
              />
              <label
                htmlFor={`org-${org.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {org.name}
              </label>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
