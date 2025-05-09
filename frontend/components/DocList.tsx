'use client';

import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

import { docsForOrg, searchDocs, DocMeta } from '@/lib/api';
import { Input } from '@/components/ui/input';

interface Props {
  orgIds: number[];
  onSelect: (d: DocMeta) => void;
}

export default function DocList({ orgIds, onSelect }: Props) {
  /* ─────────────── UI / selection ─────────────── */
  const [docs, setDocs] = useState<DocMeta[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  /* ─────────────── search state ─────────────── */
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  /* debounce keystrokes (300 ms) */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  /* load / search whenever orgIds or debouncedQuery change */
  useEffect(() => {
    async function load() {
      if (orgIds.length === 0) {
        setDocs([]);
        setSelectedId(null);
        return;
      }

      try {
        const newDocs =
          debouncedQuery !== ''
            ? await searchDocs(debouncedQuery, orgIds)
            : (await Promise.all(orgIds.map(docsForOrg))).flat();

        setDocs(newDocs);

        // clear selection if the current doc disappeared
        if (selectedId && !newDocs.some((d) => d.id === selectedId)) {
          setSelectedId(null);
        }
      } catch (err) {
        console.error('Failed to load docs', err);
      }
    }
    load();
  }, [orgIds, debouncedQuery]);

  /* click-away handler: deselect when clicking outside the list */
  const containerRef = useRef<HTMLDivElement>(null);
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
    <div ref={containerRef} className="space-y-1">
      {/* ───── search bar (sticky) ───── */}
      <div className="sticky top-0 z-10 pb-2 bg-white dark:bg-gray-900">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            value={query}
            placeholder="Search documents…"
            className="pl-8"
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* ───── document list ───── */}
      <div className="space-y-1 overflow-y-auto max-h-[65vh]">
        {docs.map((d) => {
          const isSelected = d.id === selectedId;
          return (
            <div
              key={d.id}
              className={
                `rounded-md px-3 py-2 cursor-pointer transition-colors ` +
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
          <p className="text-sm text-gray-500 px-3 py-2">No docs</p>
        )}
      </div>
    </div>
  );
}
