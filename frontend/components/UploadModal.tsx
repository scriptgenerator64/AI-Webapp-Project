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
import { Upload, Plus, File } from "lucide-react";
import type { Organization } from "@/types/document-types";
import { API_BASE } from "@/lib/constants";
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

  const canSubmit =
    !!files?.length && (selectedOrgId || newOrgName.trim().length > 1);

  const handleUpload = () => {
    if (!files) return;

    const form = new FormData();
    Array.from(files).forEach((f) => form.append("files", f));
    if (selectedOrgId && selectedOrgId !== "__new__")
      form.append("org_id", selectedOrgId);
    if (selectedOrgId === "__new__" && newOrgName.trim())
      form.append("new_org_name", newOrgName.trim());

    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (e) =>
      setProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      setProgress(0);
      onClose();
      onUploaded?.();                 // ← notify parent
    };
    xhr.onerror = () => alert("Upload failed");
    xhr.open("POST", `${API_BASE}/documents/upload`);
    xhr.send(form);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* organisation selector */}
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

          {/* file picker */}
          <Input
            type="file"
            multiple
            accept=".pdf,.txt,.doc,.docx"
            onChange={(e) => setFiles(e.target.files)}
          />
          {files && (
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <File className="h-4 w-4" />
              {files.length} file{files.length > 1 && "s"} selected
            </p>
          )}

          {/* progress */}
          {progress > 0 && <Progress value={progress} />}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>

          <Button
            onClick={handleUpload}
            disabled={!canSubmit}
            className={cn({ "opacity-50 pointer-events-none": !canSubmit })}
          >
            <Upload className="mr-2 h-4 w-4" /> Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
