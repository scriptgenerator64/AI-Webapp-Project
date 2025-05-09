'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { chat, ChatChunk } from '@/lib/api';

export default function AskPane({ orgIds }: { orgIds: number[] }) {
  const [q, setQ] = useState('');
  const [log, setLog] = useState<ChatChunk[]>([]);
  const [loading, setLoading] = useState(false);

  const ask = async () => {
    if (!q.trim() || orgIds.length === 0) return;
    setLoading(true);
    setLog((l) => [...l, { role: 'user', content: q }]);
    try {
      const res = await chat(orgIds, q);
      setLog((l) => [
        ...l,
        { role: 'assistant', content: res.answer },
        { role: 'assistant', content: `Sources:\n${res.sources
            .map((s) => `• ${s.filename}`)
            .join('\n')}` },
      ]);
    } finally {
      setLoading(false);
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
              } whitespace-pre-wrap`}
            >
              {c.content}
            </p>
          </div>
        ))}
      </div>
      <div className="flex gap-2 pt-3">
        <Input
          placeholder="Ask something…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && ask()}
        />
        <Button onClick={ask} disabled={loading}>
          Send
        </Button>
        <Button variant="secondary" onClick={() => setLog([])}>
          Clear
        </Button>
      </div>
    </div>
  );
}
