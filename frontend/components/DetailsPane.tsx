'use client';

import { DocMeta, renameDoc, removeDoc } from '@/lib/api';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface DetailsProps {
  doc: DocMeta | null;
  /** called after a successful rename */
  onChanged: () => void;
  /** called after a successful delete */
  onDeleted: () => void;
}

export default function DetailsPane({
  doc,
  onChanged,
  onDeleted,
}: DetailsProps) {
  const [name, setName] = useState(doc?.filename ?? '');

  /* keep input in-sync when user switches documents */
  useEffect(() => {
    setName(doc?.filename ?? '');
  }, [doc]);

  if (!doc)
    return <p className="text-sm text-gray-500">Select a document…</p>;

  const handleRename = async () => {
    await renameDoc(doc.id, name);
    onChanged();
  };

  const handleDelete = async () => {
    await removeDoc(doc.id);
    onDeleted();
  };

  return (
    <div className="space-y-3">
      <Input value={name} onChange={(e) => setName(e.target.value)} />

      <div className="flex gap-2">
        <Button onClick={handleRename}>Rename</Button>
        <Button variant="destructive" onClick={handleDelete}>
          Delete
        </Button>
      </div>

      <a
        href={`${
          process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api'
        }/documents/${doc.id}/download`}
        target="_blank"
        className="text-sm text-blue-600 underline"
      >
        Direct link
      </a>

      <pre className="text-xs text-gray-600">
        {JSON.stringify(doc, null, 2)}
      </pre>
    </div>
  );
}
