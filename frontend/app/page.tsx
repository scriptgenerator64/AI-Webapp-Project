"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import TabHeader, { Section } from "@/components/TabHeader";
import OrgPicker from "@/components/OrgPicker";
import DocList from "@/components/DocList";
import DetailsPane from "@/components/DetailsPane";
import AskPane from "@/components/AskPane";
import UploadDialog from "@/components/UploadDialog";

import type { Organization } from "@/types/document-types";
import { API_BASE } from "@/lib/constants";
import { DocMeta } from "@/lib/api";

export default function Home() {
  const [active, setActive] = useState<Section>("overview");

  // ───────────── organisations (sidebar) ─────────────
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const refreshOrgs = useCallback(() => {
    fetch(`${API_BASE}/organizations/`)
      .then((r) => r.json())
      .then((list: Organization[]) => {
        setOrgs(list);
        setChecked((prev) =>
          list.reduce(
            (acc, o) => ({ ...acc, [o.id]: prev[o.id] ?? false }),
            {} as Record<number, boolean>
          )
        );
      })
      .catch((err) => console.error("Failed to load organizations:", err));
  }, []);

  useEffect(refreshOrgs, [refreshOrgs]);

  const orgIds = Object.entries(checked)
    .filter(([, v]) => v)
    .map(([k]) => Number(k));

  // ───────────── docs / details ─────────────
  const [selectedDoc, setSelectedDoc] = useState<DocMeta | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const forceRefreshDocs = () => setRefreshTick((t) => t + 1);

  const docListRef = useRef<HTMLDivElement>(null);

  // Click-away handler to clear selectedDoc if clicking on empty DocList space
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (docListRef.current && docListRef.current.contains(e.target as Node)) {
        const target = e.target as HTMLElement;
        if (target.closest(".doc-item")) return; // Don't clear if clicking on an item
        setSelectedDoc(null); // Clear if clicking on empty space
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ───────────── upload dialog (global) ─────────────
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <TabHeader
        active={active}
        onChange={setActive}
        onUpload={() => setIsUploadOpen(true)}
      />

      <main className="flex-1 grid grid-cols-12 gap-6 p-6">
        {/* ───────── Column 1 — organisations ───────── */}
        <section className="col-span-3 bg-white dark:bg-gray-800 rounded-lg p-4">
          <OrgPicker
            organizations={orgs}
            selected={checked}
            onToggle={(id) =>
              setChecked((c) => ({ ...c, [id]: !c[id] }))
            }
          />
        </section>

        {/* ───────── Columns 2-12 depend on tab ───────── */}
        {active === "overview" && (
          <>
            <section
              ref={docListRef}
              className="col-span-5 bg-white dark:bg-gray-800 rounded-lg p-4"
            >
              <DocList
                key={refreshTick}
                orgIds={orgIds}
                onSelect={setSelectedDoc}
              />
            </section>

            <section className="col-span-4 bg-white dark:bg-gray-800 rounded-lg p-4">
              <DetailsPane
                doc={selectedDoc}
                onChanged={forceRefreshDocs}
                onDeleted={() => {
                  forceRefreshDocs();
                  setSelectedDoc(null);
                }}
              />
            </section>
          </>
        )}

        {active === "ask" && (
          <section className="col-span-9 bg-white dark:bg-gray-800 rounded-lg p-4 flex flex-col">
            <AskPane orgIds={orgIds} />
          </section>
        )}
      </main>

      {/* ───────── GLOBAL UPLOAD DIALOG ───────── */}
      <UploadDialog
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploaded={refreshOrgs}
        organizations={orgs}
      />
    </div>
  );
}
