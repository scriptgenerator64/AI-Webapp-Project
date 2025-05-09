'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { motion } from 'framer-motion';

export type Section = 'overview' | 'ask';        // ⬅️  no more “upload”

interface TabHeaderProps {
  active: Section;
  onChange: (s: Section) => void;
  onUpload: () => void;                          // ⬅️  callback for the green button
}

export default function TabHeader({
  active,
  onChange,
  onUpload,
}: TabHeaderProps) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur px-6 py-3 shadow"
    >
      <div className="flex items-center justify-between">
        {/* ── title ─────────────────────────────────────────────── */}
        <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Master Document Manager
        </h1>

        {/* ── centred tabs (overview / ask) ─────────────────────── */}
        <Tabs value={active} onValueChange={(v) => onChange(v as Section)}>
          <div className="flex items-center">
            <TabsList className="flex space-x-2 rounded-md bg-muted p-1">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded px-4 py-1 transition"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="ask"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded px-4 py-1 transition"
              >
                Ask&nbsp;AI
              </TabsTrigger>
            </TabsList>
            <div className="w-16" /> {/* Invisible Spacer */}
            <div className="w-16" /> {/* Invisible Spacer */}
          </div>
        </Tabs>


        {/* ── GREEN upload button ──────────────────────────────── */}
        <Button
          onClick={onUpload}
          className="bg-emerald-600 text-white hover:bg-emerald-700 gap-2"
        >
          <Upload className="h-4 w-4" />
          Upload
        </Button>
      </div>
    </motion.header>
  );
}
