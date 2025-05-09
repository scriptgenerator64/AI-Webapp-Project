"use client";

import TabHeader, { Section } from "@/components/TabHeader";
import { useState } from "react";
import OrgPicker from "@/components/OrgPicker";
import DocList from "@/components/DocList";
import DetailsPane from "@/components/DetailsPane";
import AskPane from "@/components/AskPane";
import UploadModal from "@/components/UploadModal";
import { DocMeta } from "@/lib/api";

export default function Home() {
  const [active, setActive] = useState<Section>("overview");
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [selectedDoc, setSelectedDoc] = useState<DocMeta | null>(null);

  const orgIds = Object.entries(checked)
    .filter(([, v]) => v)
    .map(([k]) => Number(k));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <TabHeader active={active} onChange={setActive} />

      <main className="flex-1 grid grid-cols-12 gap-6 p-6">
        {/* Column 1 – organizations */}
        <section className="col-span-3 bg-white dark:bg-gray-800 rounded-lg p-4">
          <OrgPicker
            selected={checked}
            onToggle={(id) =>
              setChecked((c) => ({ ...c, [id]: !c[id] }))
            }
          />
          {active === "upload" && (
            <div className="pt-4">
              <UploadModal />
            </div>
          )}
        </section>

        {/* Columns 2-3 – vary by tab */}
        {active === "overview" && (
          <>
            <section className="col-span-5 bg-white dark:bg-gray-800 rounded-lg p-4">
              <DocList orgIds={orgIds} onSelect={setSelectedDoc} />
            </section>
            <section className="col-span-4 bg-white dark:bg-gray-800 rounded-lg p-4">
              <DetailsPane doc={selectedDoc} />
            </section>
          </>
        )}

        {active === "ask" && (
          <section className="col-span-9 bg-white dark:bg-gray-800 rounded-lg p-4 flex flex-col">
            <AskPane orgIds={orgIds} />
          </section>
        )}
      </main>
    </div>
  );
}
