'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';

export type Section = 'overview' | 'ask' | 'upload';

interface TabHeaderProps {
  active: Section;
  onChange: (s: Section) => void;
}

export default function TabHeader({ active, onChange }: TabHeaderProps) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur px-6 py-3 shadow"
    >
      <div className="flex items-center justify-center relative">
        {/* Title on the left */}
        <h1 className="absolute left-6 text-lg font-medium text-gray-900 dark:text-gray-100">
          Master Document Manager
        </h1>

        {/* Centered Tabs */}
        <Tabs value={active} onValueChange={(v) => onChange(v as Section)}>
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
              Ask AI
            </TabsTrigger>
            <TabsTrigger
              value="upload"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded px-4 py-1 transition"
            >
              Upload
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </motion.header>
  );
}
