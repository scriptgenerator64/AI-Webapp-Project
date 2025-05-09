/* components/UploadModal.tsx -------------------------------------------------
   Upload files to an existing or brand-new organisation
---------------------------------------------------------------------------- */
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Upload, Plus, File, Loader2 } from "lucide-react";
import type { Organization } from "@/types/document-types";
import {
  createOrg,
  uploadDoc,
} from "@/lib/api"; // ← use the typed helpers you already have
import { cn } from "@/lib/utils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** optional – lets parent refresh its org list after a new upload */
  onUploaded?: () => void;
  organizations?: Organization[];
}

export default function UploadModal({
  isOpen,
  onClose,
  onUploaded,
  organizations,
}: Props) {
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [newOrgName, setNewOrgName] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);

  const canSubmit =
    !!files?.length && (selectedOrgId || newOrgName.trim().length > 1);

  async function handleUpload() {
    if (!files || !canSubmit || busy) return;

    try {
      setBusy(true);
      setProgress(0);

      /* 1. Get (or create) the target organisation ----------------------- */
      let orgId: number;
      if (selectedOrgId === "__new__") {
        const org = await createOrg(newOrgName.trim());
        orgId = org.id;
      } else {
        orgId = Number(selectedOrgId);
      }

      /* 2. Upload every file with real progress ------------------------- */
      let done = 0;
      const uploads = Array.from(files).map((f) =>
        uploadDoc(orgId, f, (pct) => {
          // combine all individual progress bars into one overall %
          const current = Math.round(((done + pct / 100) / files.length) * 100);
          setProgress(current);
        }).then(() => {
          done += 1;
        })
      );

      await Promise.all(uploads);
      setProgress(100);

      /* 3. UI tidy-up ---------------------------------------------------- */
      setTimeout(() => setProgress(0), 400);
      onClose();
      onUploaded?.();
    } catch (err: any) {
      alert(`Upload failed: ${err.message ?? err}`);
    } finally {
      setBusy(false);
    }
  }

  /* reset the modal every time it’s closed */
  function resetState() {
    setSelectedOrgId("");
    setNewOrgName("");
    setFiles(null);
    setProgress(0);
    setBusy(false);
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          resetState();
        }
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload documents</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* ── organisation selector ─────────────────────────────────── */}
          <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose organisation…" />
            </SelectTrigger>
            <SelectContent>
              {(organizations ?? []).map((o) => (
                <SelectItem key={o.id} value={String(o.id)}>
                  {o.name}
                </SelectItem>
              ))}
              <SelectItem value="__new__">
                <Plus className="mr-1 inline h-4 w-4" />
                New organisation…
              </SelectItem>
            </SelectContent>
          </Select>

          {selectedOrgId === "__new__" && (
            <Input
              placeholder="Organisation name"
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
            />
          )}

          {/* ── file picker ────────────────────────────────────────────── */}
          <Input
            type="file"
            multiple
            accept=".pdf,.txt,.doc,.docx"
            onChange={(e) => setFiles(e.target.files)}
          />
          {files && (
            <p className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              <File className="h-4 w-4" />
              {files.length} file{files.length > 1 && "s"} selected
            </p>
          )}

          {/* ── progress bar ───────────────────────────────────────────── */}
          {progress > 0 && <Progress value={progress} />}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>

          <Button
            onClick={handleUpload}
            disabled={!canSubmit || busy}
            className={cn("gap-2", {
              "pointer-events-none opacity-50": !canSubmit || busy,
            })}
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}