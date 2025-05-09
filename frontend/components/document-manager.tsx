'use client';
import { useEffect, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  chat,
  getDocsForOrg,
  getOrganizations,
  Organization,
  DocumentMeta,
  uploadDoc,
} from '@/lib/api';

export default function DocumentManager() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [docs, setDocs] = useState<DocumentMeta[]>([]);
  const [search, setSearch] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /* ───────── Load orgs (once) ──────── */
  useEffect(() => {
    getOrganizations().then(setOrgs).catch(console.error);
  }, []);

  /* ───────── Whenever boxes change, pull docs ─────── */
  useEffect(() => {
    const ids = Object.keys(checked)
      .filter((id) => checked[+id])
      .map(Number);

    if (ids.length === 0) {
      setDocs([]);
      return;
    }

    (async () => {
      setLoading(true);
      try {
        // Pull docs for every selected org in parallel
        const all = await Promise.all(ids.map(getDocsForOrg));
        setDocs(all.flat());
      } finally {
        setLoading(false);
      }
    })();
  }, [checked]);

  /* ───────── Handlers ─────── */
  const toggleOrg = (id: number) =>
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleUpload = async (
    orgId: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files?.[0]) return;
    await uploadDoc(orgId, e.target.files[0]);
    // refresh doc list for this org
    setChecked((c) => ({ ...c, [orgId]: true }));
  };

  const handleAsk = async () => {
    const ids = Object.keys(checked)
      .filter((id) => checked[+id])
      .map(Number);
    if (ids.length === 0 || !search.trim()) return;

    setLoading(true);
    try {
      const res = await chat(ids, search);
      setAnswer(res.answer);
    } finally {
      setLoading(false);
    }
  };

  /* ───────── UI ─────── */
  return (
    <div className="space-y-6 p-6">
      {/* Search row */}
      <div className="flex gap-4">
        <Input
          placeholder="Ask something about selected organization(s)…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button onClick={handleAsk} disabled={loading}>
          Ask AI
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border bg-white dark:bg-gray-900">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Organization</th>
              <th className="px-4 py-3 text-left font-semibold">
                # Documents
              </th>
              <th className="px-4 py-3 text-left font-semibold">Upload</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {orgs.map((org) => {
              const orgDocs = docs.filter((d) => d.org_id === org.id);
              return (
                <tr key={org.id}>
                  <td className="px-4 py-2 flex items-center gap-2">
                    <Checkbox
                      checked={!!checked[org.id]}
                      onCheckedChange={() => toggleOrg(org.id)}
                    />
                    {org.name}
                  </td>
                  <td className="px-4 py-2">{orgDocs.length}</td>
                  <td className="px-4 py-2">
                    <Input
                      type="file"
                      accept=".txt,.pdf,.doc,.docx"
                      onChange={(e) => handleUpload(org.id, e)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Docs list (expanded view) */}
      {docs.length > 0 && (
        <div className="space-y-1 rounded-lg border p-4">
          <h3 className="font-semibold">Documents</h3>
          <ul className="space-y-1 text-sm">
            {docs.map((d) => (
              <li key={d.id} className="flex justify-between">
                <span>{d.filename}</span>
                <span className="text-gray-500">
                  {new Date(d.created_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* AI answer */}
      {answer && (
        <div className="rounded-lg border p-4 text-sm whitespace-pre-wrap">
          {answer}
        </div>
      )}
    </div>
  );
}
