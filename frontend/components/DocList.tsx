'use client';

import { useState, useEffect, useRef } from 'react';
import { docsForOrg, DocMeta } from '@/lib/api';

export default function DocList({
  orgIds,
  onSelect,
}: {
  orgIds: number[];
  onSelect: (d: DocMeta) => void;
}) {
  const [docs, setDocs] = useState<DocMeta[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // load whenever orgIds changes
  useEffect(() => {
    if (orgIds.length === 0) {
      setDocs([]);
      setSelectedId(null);
      return;
    }
    Promise.all(orgIds.map(docsForOrg)).then((arrays) => {
      const all = arrays.flat();
      setDocs(all);

      // if the new list no longer contains the previously‐selected id, clear it:
      if (selectedId && !all.some((d) => d.id === selectedId)) {
        setSelectedId(null);
      }
    });
  }, [orgIds]);

  // click‐away handler: clear selection if you click outside this container
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setSelectedId(null);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      className="space-y-1 overflow-y-auto max-h-[70vh]"
    >
      {docs.map((d) => {
        const isSelected = d.id === selectedId;
        return (
          <div
            key={d.id}
            className={
              `rounded-md px-3 py-2 cursor-pointer ` +
              (isSelected
                ? 'bg-gray-200 dark:bg-gray-700'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800')
            }
            onClick={() => {
              setSelectedId(d.id);
              onSelect(d);
            }}
          >
            {d.filename}
          </div>
        );
      })}
      {docs.length === 0 && (
        <p className="text-sm text-gray-500">No docs</p>
      )}
    </div>
  );
}
