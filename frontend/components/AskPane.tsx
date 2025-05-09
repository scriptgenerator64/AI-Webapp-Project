'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { chat, ChatChunk } from '@/lib/api';

export default function AskPane({ orgIds }: { orgIds: number[] }) {
  const [q, setQ] = useState('');
  const [log, setLog] = useState<ChatChunk[]>([]);
  const [loading, setLoad] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const API_BASE = (process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://127.0.0.1:5000') + '/api';

  const ask = async () => {
    if (!q.trim() || orgIds.length === 0 || loading) return;
    setErr(null);
    setLoad(true);
    setLog((l) => [...l, { role: 'user', content: q }]);

    try {
      const res = await chat(orgIds, q);

      setLog((l) => [
        ...l,
        { role: 'assistant', content: res.answer },
        {
          role: 'assistant',
          content:
            res.sources.length === 0
              ? '(no sources)'
              : 'Sources:<br>' +
                res.sources
                  .map(
                    (s) =>
                      `• <a href="${API_BASE}/organizations/${s.org_id}/documents/${s.id}/download" target="_blank" rel="noopener noreferrer">${s.filename}</a>`
                  )
                  .join('<br>'),
        },
      ]);
    } catch (e: any) {
      setErr(e.message ?? 'Error hitting /chat');
    } finally {
      setLoad(false);
      setQ('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {log.map((c, i) => (
          <div key={i} className={c.role === 'user' ? 'text-right' : ''}>
            <p
              className={`inline-block rounded-lg px-3 py-2 ${
                c.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
              dangerouslySetInnerHTML={{ __html: c.content }}
            />
          </div>
        ))}
        {err && (
          <p className="text-sm text-red-600 dark:text-red-400 whitespace-pre-wrap">
            {err}
          </p>
        )}
      </div>

      <div className="flex gap-2 pt-3">
        <Input
          placeholder={
            orgIds.length ? 'Ask something…' : '*Select organisation scope first*'
          }
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && ask()}
          disabled={loading || orgIds.length === 0}
        />
        <Button onClick={ask} disabled={loading || orgIds.length === 0}>
          {loading ? '…' : 'Send'}
        </Button>
        <Button variant="secondary" onClick={() => setLog([])} disabled={loading}>
          Clear
        </Button>
      </div>
    </div>
  );
}
