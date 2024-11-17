'use client';

import SendSpend from '@/components/sections/SendSpend';
import Header from '@/components/ui/Header';
import { DockDemo } from '@/components/ui/Dock';

// import Hero from '@/components/sections/Hero';
// import Features from '@/components/sections/Features';
// import World from '@/components/sections/World';
// import Quick from '@/components/sections/Quick';
// import Spend from '@/components/sections/Spend';
// import Testimonial from '@/components/sections/Testimonial';
// import Footer from '@/components/sections/Footer';

export default function Home() {
  return (
    <>
      <main className="relative h-[100dvh] bg-black overflow-hidden touch-none md:touch-auto">
        <div className="relative z-10">
          <Header />
          <SendSpend />
        </div>
        {/* <Hero />
        <Features />
        <World />
        <Quick />
        <Spend />
        <Testimonial />
        <Footer /> */}
      </main>
      <div 
        className="fixed bottom-0 left-0 right-0 z-[9999] pointer-events-auto"
        style={{ position: 'fixed', willChange: 'transform' }}
      >
        <DockDemo />
      </div>
    </>
  );
}