'use client';

import { motion } from 'framer-motion';
import Header from '@/components/ui/Header';
import { DockDemo } from '@/components/ui/Dock';

export default function About() {
  return (
    <main className="relative min-h-screen bg-[#F5F5F6]">
      <Header />
      
      <div className="container mx-auto px-4 relative z-10 pt-[120px] md:pt-[140px] pb-32">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-16 md:mb-24"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-['ClashDisplay-Semibold'] text-[40px] md:text-[80px] leading-[0.95] mb-6">
            ABOUT NYRA
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Revolutionizing digital payments in Nigeria with secure, fast, and accessible financial services.
          </p>
          
          <div className="max-w-4xl mx-auto text-left">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="font-['ClashDisplay-Medium'] text-2xl md:text-3xl mb-6">Our Company</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>Legal Name:</strong> MyNyra Technology Limited<br />
                  <strong>Brand Name:</strong> Nyra Wallet<br />
                  <strong>Industry:</strong> Financial Technology (Fintech)
                </p>
                <p>
                  <strong>Address:</strong><br />
                  Block 45 Rockvale manors<br />
                  Abuja<br />
                  Nigeria
                </p>
                <p>
                  <strong>Contact:</strong><br />
                  Email: hello@nyrawallet.com<br />
                  Phone: +234 903 881 9008
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Dock Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-[9999] pointer-events-auto">
        <DockDemo />
      </div>
    </main>
  );
} 