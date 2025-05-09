'use client';

import { DocMeta, renameDoc, removeDoc } from '@/lib/api';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface DetailsProps {
  doc: DocMeta | null;
  onChanged: () => void;
  onDeleted: () => void;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
  'http://127.0.0.1:5000/api';

/* Helper – format bytes into KB / MB / GB */
function humanBytes(bytes?: number) {
  if (!bytes) return '—';
  const thresh = 1024;
  if (Math.abs(bytes) < thresh) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let u = -1;
  do {
    bytes /= thresh;
    ++u;
  } while (Math.abs(bytes) >= thresh && u < units.length - 1);
  return `${bytes.toFixed(1)} ${units[u]}`;
}

export default function DetailsPane({ doc, onChanged, onDeleted }: DetailsProps) {
  const [name, setName] = useState(doc?.filename ?? '');
  const [orgName, setOrgName] = useState<string | null>(null);

  useEffect(() => {
    setName(doc?.filename ?? '');
    if (!doc) return setOrgName(null);

    fetch(`${API_BASE}/organizations/${doc.org_id}`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d: { name: string }) => setOrgName(d.name))
      .catch(() => setOrgName(null));
  }, [doc]);

  if (!doc) {
    return <p className="text-sm text-gray-500">Select a document…</p>;
  }

  const handleRename = async () => {
    await renameDoc(doc.id, name);
    onChanged();
  };

  const handleDelete = async () => {
    await removeDoc(doc.id);
    onDeleted();
  };

  // Prepare metadata without id and org_id
  const { id, org_id, ...rest } = doc;

  return (
    <div className="space-y-5">
      {/* Filename Editor */}
      <Input value={name} onChange={(e) => setName(e.target.value)} />

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={handleRename}>Rename</Button>
        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
        <Button variant="outline" asChild>
          <a href={`${API_BASE}/organizations/${doc.org_id}/documents/${doc.id}/download`} target="_blank">
            Download
          </a>
        </Button>
      </div>

      {/* Metadata Summary */}
      <div className="rounded-md border p-4 bg-gray-50 text-sm space-y-2">
        <div>
          <span className="font-semibold text-gray-700">Organization:</span> {orgName ?? 'Unknown'}
        </div>
        {Object.entries(rest).map(([key, value]) => {
          const label = key
            .replace(/_/g, ' ')
            .replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1)); // Title Case

          return (
            <div key={key}>
              <span className="font-semibold text-gray-700">{label}:</span>{' '}
              {key === 'size' && typeof value === 'number'
                ? humanBytes(value)
                : key === 'uploaded_at' && typeof value === 'string'
                ? new Date(value).toLocaleString()
                : String(value)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
