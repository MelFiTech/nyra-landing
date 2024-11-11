'use client';

import Header from '@/components/sections/Header';
import Hero from '@/components/sections/Hero';
import Features from '@/components/sections/Features';
import World from '@/components/sections/World';
import Quick from '@/components/sections/Quick';
import Spend from '@/components/sections/Spend';
import Testimonial from '@/components/sections/Testimonial';
import Footer from '@/components/sections/Footer';

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <Features />
      <World />
      <Quick />
      <Spend />
      <Testimonial />
      <Footer />
    </main>
  );
}