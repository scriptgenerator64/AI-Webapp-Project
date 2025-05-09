// lib/api.ts
// Simple typed wrapper around the Flask → `/api` backend
// ────────────────────────────────────────────────────────
export const BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
  'http://127.0.0.1:5000/api';

async function request<T>(
  path: string,
  opts: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(opts.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText} – ${text}`);
  }
  return (await res.json()) as T;
}

/* ───── ORGS ─────────────────────────────────────────── */

export interface Organization {
  id: number;
  name: string;
}

export const getOrganizations = () =>
  request<Organization[]>('/organizations');

/* ───── DOCS ─────────────────────────────────────────── */

export interface DocumentMeta {
  id: number;
  org_id: number;
  filename: string;
  created_at: string;
}

export const getDocsForOrg = (orgId: number) =>
  request<DocumentMeta[]>(`/organizations/${orgId}/documents`);

export const uploadDoc = (orgId: number, file: File) => {
  const form = new FormData();
  form.append('file', file);
  return fetch(`${BASE}/organizations/${orgId}/documents`, {
    method: 'POST',
    body: form,
  }).then((r) => {
    if (!r.ok) throw new Error('Upload failed');
    return r.json();
  });
};

/* ───── SEARCH / CHAT (optional) ─────────────────────── */

export const searchDocs = (orgIds: number[], query: string, k = 5) =>
  request<DocumentMeta[]>('/search', {
    method: 'POST',
    body: JSON.stringify({ org_ids: orgIds, query, k }),
  });

export const chat = (
  orgIds: number[],
  query: string,
  k = 6,
  temperature = 0.3
) =>
  request<{ answer: string }>('/chat', {
    method: 'POST',
    body: JSON.stringify({ org_ids: orgIds, query, k, temperature }),
  });
