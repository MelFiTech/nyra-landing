'use client';

import JointAccounts from '@/components/sections/JointAccounts';
import { DockDemo } from '@/components/ui/Dock';   

export default function IndexThree() {
  return (
    <>
      <main className="relative min-h-screen bg-black overflow-hidden md:overflow-auto">
        <div className="relative z-10">
          <JointAccounts />
        </div>
        <div className="fixed bottom-0 left-0 right-0 z-[9999] pointer-events-auto">
          <DockDemo />
        </div>
      </main>
    </>
  );
}