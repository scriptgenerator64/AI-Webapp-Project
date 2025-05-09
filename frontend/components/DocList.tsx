'use client';
import useSWR from 'swr';
import { docsForOrg, DocMeta } from '@/lib/api';
import { useEffect, useState } from 'react';

export default function DocList({
  orgIds, onSelect,
}: {
  orgIds: number[]; onSelect: (d: DocMeta) => void;
}) {
  const [docs, setDocs] = useState<DocMeta[]>([]);
  useEffect(() => {
    if (orgIds.length === 0) return setDocs([]);
    Promise.all(orgIds.map(docsForOrg)).then((a) => setDocs(a.flat()));
  }, [orgIds]);

  return (
    <div className="space-y-1 overflow-y-auto max-h-[70vh]">
      {docs.map((d) => (
        <div
          key={d.id}
          className="rounded-md px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
          onClick={() => onSelect(d)}
        >
          {d.filename}
        </div>
      ))}
      {docs.length === 0 && <p className="text-sm text-gray-500">No docs</p>}
    </div>
  );
}
