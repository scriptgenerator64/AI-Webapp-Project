'use client';
import useSWR from 'swr';
import { Checkbox } from '@/components/ui/checkbox';
import { listOrgs, Organization } from '@/lib/api';

export default function OrgPicker({
  selected, onToggle,
}: {
  selected: Record<number, boolean>;
  onToggle: (id: number) => void;
}) {
  const { data: orgs = [] } = useSWR('orgs', listOrgs);

  return (
    <div className="max-h-[70vh] overflow-y-auto space-y-2 pr-2">
      {orgs.map((o) => (
        <label key={o.id} className="flex items-center gap-2">
          <Checkbox checked={!!selected[o.id]} onCheckedChange={() => onToggle(o.id)} />
          {o.name}
        </label>
      ))}
    </div>
  );
}
