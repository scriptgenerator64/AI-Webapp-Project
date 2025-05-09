'use client';
import { DocMeta, renameDoc, removeDoc, replaceDoc } from '@/lib/api';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function DetailsPane({ doc }: { doc: DocMeta | null }) {
  const [name, setName] = useState(doc?.filename ?? '');
  if (!doc) return <p className="text-sm text-gray-500">Select a document…</p>;

  const handleRename = () => renameDoc(doc.id, name);
  const handleDelete = () => removeDoc(doc.id);
  const handleReplace = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) replaceDoc(doc.id, e.target.files[0]);
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
      <Input type="file" onChange={handleReplace} />
      <a
        href={`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api'}/documents/${doc.id}/download`}
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
