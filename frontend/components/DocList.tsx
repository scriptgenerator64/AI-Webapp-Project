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
  const [docs, setDocs] = useState<DocMeta[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  // load docs
  useEffect(() => {
    async function load() {
      if (!orgIds.length) {
        setDocs([]);
        setSelectedId(null);
        return;
      }
      try {
        const newDocs =
          debouncedQuery !== ''
            ? await searchDocs(orgIds, debouncedQuery)
            : (await Promise.all(orgIds.map(docsForOrg))).flat();
        setDocs(newDocs);
        if (selectedId && !newDocs.some((d) => d.id === selectedId)) {
          setSelectedId(null);
        }
      } catch (err) {
        console.error('Failed to load docs', err);
      }
    }
    load();
  }, [orgIds, debouncedQuery]);

  // click‐away to clear selection
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
      {/* Search bar */}
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

      {/* Document list */}
      <div className="space-y-1 overflow-y-auto max-h-[65vh]">
        {docs.map((d) => {
          const isSelected = d.id === selectedId;
          return (
            <div
              key={d.id}                                // ← unique key
              className={`doc-item rounded-md px-3 py-2 cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-gray-200 dark:bg-gray-700'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
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
          <p
            key="no-docs"                             // ← fallback key
            className="text-sm text-gray-500 px-3 py-2"
          >
            No docs
          </p>
        )}
      </div>
    </div>
  );
}
