'use client';

import UsdCard from '@/components/sections/UsdCard';
import { DockDemo } from '@/components/ui/Dock';  

export default function IndexTwo() {
  return (
    <>
      <main className="relative h-screen bg-black overflow-hidden touch-none">
        <div className="relative z-10">
          <UsdCard />
        </div>
        <div className="fixed bottom-0 left-0 right-0 z-[9999] pointer-events-auto">
          <DockDemo />
        </div>
      </main>
    </>
  );
}