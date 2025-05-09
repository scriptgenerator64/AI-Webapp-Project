'use client';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type Section = 'overview' | 'ask' | 'upload';

export default function TabHeader({
  active, onChange,
}: {
  active: Section; onChange: (s: Section) => void;
}) {
  return (
    <header className="border-b bg-white dark:bg-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Master Document Manager Console</h1>
        <Tabs value={active} onValueChange={(v) => onChange(v as Section)}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ask">Ask&nbsp;AI</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </header>
  );
}
