"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import UploadModal from "@/components/UploadModal";
import type { Organization } from "@/types/document-types";
import { API_BASE } from "@/lib/constants";

/**
 * Simple document dashboard - just enough to host the UploadModal.
 * Flesh it out later with a table, search bar, etc.
 */
export default function DocumentManager() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // ── Fetch organisations once ───────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API_BASE}/organizations`)
      .then((r) => r.json())
      .then(setOrgs)
      .catch((err) => console.error("Failed to load orgs", err));
  }, []);

  return (
    <section className="p-6">
      {/* Header -------------------------------------------------------------- */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Documents</h2>
        <Button onClick={() => setIsUploadOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Upload
        </Button>
      </div>

      {/* TODO: document table / search here ---------------------------------- */}

      {/* Upload dialog ------------------------------------------------------- */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        organizations={orgs}
      />
    </section>
  );
}
