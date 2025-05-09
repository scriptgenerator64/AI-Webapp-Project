'use client';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  listOrgs,
  createOrg,
  Organization,
  uploadDoc,
} from '@/lib/api';
import useSWR from 'swr';

export default function UploadModal() {
  const { data: orgs = [], mutate } = useSWR('orgs', listOrgs);
  const [open, setOpen] = useState(false);
  const [orgId, setOrgId] = useState<number | null>(null);
  const [newOrgName, setNewOrgName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [pct, setPct] = useState(0);

  const handleUpload = async () => {
    if (!file || (!orgId && !newOrgName.trim())) return;
    let oid = orgId;
    if (!oid) {
      const { id } = await createOrg(newOrgName);
      oid = id;
      mutate(); // refresh org list
    }
    await uploadDoc(oid!, file, setPct);
    setOpen(false);
    setPct(0);
    setFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">Upload</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload document</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Org select / create */}
          <select
            className="w-full rounded-md border px-3 py-2 bg-transparent"
            value={orgId ?? ''}
            onChange={(e) => setOrgId(Number(e.target.value) || null)}
          >
            <option value="">-- select organization --</option>
            {orgs.map((o: Organization) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>

          <Input
            placeholder="Or create new organization"
            value={newOrgName}
            onChange={(e) => setNewOrgName(e.target.value)}
          />

          {/* File choose */}
          <Input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />

          {/* Progress */}
          {pct > 0 && (
            <div className="h-2 w-full rounded bg-gray-200">
              <div
                className="h-full rounded bg-blue-600 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          )}

          <div className="text-right">
            <Button onClick={handleUpload} disabled={!file}>
              Upload
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
