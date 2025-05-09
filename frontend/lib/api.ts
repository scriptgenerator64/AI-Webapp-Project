// lib/api.ts ────────────────────────────────────────────────────────────────
export const BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
  'http://127.0.0.1:5000/api';

const jsonHeaders = { 'Content-Type': 'application/json' };

async function j<T>(path: string, init: RequestInit = {}): Promise<T> {
  const r = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { ...jsonHeaders, ...(init.headers ?? {}) },
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<T>;
}

/* ───────── Orgs ─────────────────────────────────────────────────────────── */
export interface Organization { id: number; name: string }
export const listOrgs       = ()                  => j<Organization[]>('/organizations');
export const createOrg      = (name: string)      =>
  j<Organization>('/organizations', { method: 'POST', body: JSON.stringify({ name }) });

/* ───────── Docs ─────────────────────────────────────────────────────────── */
export interface DocMeta {
  id: number; org_id: number; filename: string;
  created_at: string; size_bytes: number;
}
export const docsForOrg     = (oid: number)       => j<DocMeta[]>(`/organizations/${oid}/documents`);
export const removeDoc      = (id: number)        => j(`/documents/${id}`, { method: 'DELETE' });

export const renameDoc = (id: number, filename: string) =>
  j(`/documents/${id}`, { method: 'PATCH', body: JSON.stringify({ filename }) });

export const replaceDoc = (id: number, file: File) => {
  const fd = new FormData();
  fd.append('file', file);
  return fetch(`${BASE}/documents/${id}/replace`, { method: 'POST', body: fd });
};

export const uploadDoc = (org_id: number, file: File,
  onProgress?: (pct: number) => void) =>
  new Promise<DocMeta>((res, rej) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${BASE}/organizations/${org_id}/documents`);
    xhr.onload = () => (xhr.status === 200 ? res(JSON.parse(xhr.response)) : rej(xhr.response));
    if (onProgress) xhr.upload.onprogress = (e) => onProgress(Math.round((e.loaded / e.total) * 100));
    const fd = new FormData();
    fd.append('file', file);
    xhr.send(fd);
  });

/* ───────── Search / Chat ────────────────────────────────────────────────── */
export interface ChatChunk { role: 'user' | 'assistant'; content: string }
export const searchDocs     = (orgIds: number[], query: string, k = 7) =>
  j<DocMeta[]>('/search', { method: 'POST', body: JSON.stringify({ org_ids: orgIds, query, k }) });

export const chat           = (orgIds: number[], query: string) =>
  j<{ answer: string; sources: DocMeta[] }>('/chat',
      { method: 'POST', body: JSON.stringify({ org_ids: orgIds, query }) });
