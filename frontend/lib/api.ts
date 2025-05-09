// lib/api.ts ────────────────────────────────────────────────────────────────
export const BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
  'http://127.0.0.1:5000/api';

/* ------------------------------------------------------------------------ */
/*  Helpers                                                                 */
/* ------------------------------------------------------------------------ */

const jsonHeaders = { 'Content-Type': 'application/json' };

/** Core fetch wrapper that always uses CORS + credentials */
async function j<T>(path: string, init: RequestInit = {}): Promise<T> {
  // Only attach the JSON header when we’re sending a body that needs it
  const headers =
    init.method && init.method !== 'GET'
      ? { ...jsonHeaders, ...(init.headers ?? {}) }
      : init.headers ?? {};

  const r = await fetch(`${BASE}${path}`, {
    mode: 'cors',            // ⬅️ allow cross-origin
    credentials: 'include',  // ⬅️ send cookies / auth headers
    ...init,
    headers,
  });

  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<T>;
}

/* ───────── Orgs ─────────────────────────────────────────────────────────── */
export interface Organization {
  id: number;
  name: string;
}
export const listOrgs  = ()             => j<Organization[]>('/organizations');
export const createOrg = (name: string) =>
  j<Organization>('/organizations', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });

/* ───────── Docs ─────────────────────────────────────────────────────────── */
export interface DocMeta {
  id: number;
  org_id: number;
  filename: string;
  created_at: string;
  size_bytes: number;
}

export const docsForOrg = (oid: number) =>
  j<DocMeta[]>(`/organizations/${oid}/documents`);

export const removeDoc = (id: number) =>
  j(`/documents/${id}`, { method: 'DELETE' });

export const renameDoc = (id: number, filename: string) =>
  j(`/documents/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ filename }),
  });

export const replaceDoc = (id: number, file: File) => {
  const fd = new FormData();
  fd.append('file', file);
  return fetch(`${BASE}/documents/${id}/replace`, {
    mode: 'cors',
    credentials: 'include',
    method: 'POST',
    body: fd,
  });
};

export const uploadDoc = (
  org_id: number,
  file: File,
  onProgress?: (pct: number) => void,
) =>
  new Promise<DocMeta>((res, rej) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${BASE}/organizations/${org_id}/documents`);
    xhr.withCredentials = true; // ⬅️ include cookies / auth headers
    xhr.onload = () =>
      xhr.status === 200 ? res(JSON.parse(xhr.response)) : rej(xhr.response);
    if (onProgress)
      xhr.upload.onprogress = (e) =>
        onProgress(Math.round((e.loaded / e.total) * 100));

    const fd = new FormData();
    fd.append('file', file);
    xhr.send(fd);
  });

/* ───────── Search / Chat ────────────────────────────────────────────────── */
export interface ChatChunk {
  role: 'user' | 'assistant';
  content: string;
}

export const searchDocs = (orgIds: number[], query: string, k = 7) =>
  j<DocMeta[]>('/search', {
    method: 'POST',
    body: JSON.stringify({ org_ids: orgIds, query, k }),
  });

export const chat = (orgIds: number[], query: string) =>
  j<{ answer: string; sources: DocMeta[] }>('/chat', {
    method: 'POST',
    body: JSON.stringify({ org_ids: orgIds, query }),
  });
