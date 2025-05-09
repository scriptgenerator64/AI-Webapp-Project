'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Settings, Info } from 'lucide-react';

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
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md dark:bg-gray-900/80 px-4 sm:px-6 py-3 shadow-sm"
    >
      <div className="flex items-center justify-between">
        {/* Left: Title */}
        <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
          Master Document Manager
        </h1>

        {/* Center: Tabs */}
        <Tabs value={active} onValueChange={(v) => onChange(v as Section)}>
          <TabsList className="flex space-x-1 rounded-md bg-muted p-1 shadow-inner">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm rounded-md px-3 py-1.5 transition-all">
              Overview
            </TabsTrigger>
            <TabsTrigger value="ask" className="data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm rounded-md px-3 py-1.5 transition-all">
              Ask AI
            </TabsTrigger>
            <TabsTrigger value="upload" className="data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm rounded-md px-3 py-1.5 transition-all">
              Upload
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Right: Action Buttons */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Info className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
