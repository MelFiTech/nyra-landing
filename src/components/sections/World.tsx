'use client';

import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Paybuddy from '@/components/sections/Paybuddy';
import Image from 'next/image';

export default function World() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="container mx-auto px-4 flex flex-col items-center">
        {/* Section Label */}
        <div className="text-center mb-4">
          <span className="bg-[#EBEBED] px-4 py-2 rounded-full text-sm font-medium text-[#888795]">
            NYRA TO THE WORLD
          </span>
        </div>

        {/* Main Content */}
        <div className="text-center max-w-6xl mx-auto">
          <motion.h2 
            className="font-clash text-[100px] leading-[1.1] mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Receive <span className="text-[#9747FF]">$</span>, <span className="text-[#9747FF]">£</span> & <span className="text-[#9747FF]">CA$</span>
            <br />
            from family & friends
            <br />
            around the world
          </motion.h2>

          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Button 
              variant="primary" 
              size="lg"
              className="bg-black text-white hover:bg-gray-900 inline-flex items-center"
            >
              <div className="flex items-center space-x-2">
                <img src="/icons/apple.svg" alt="" className="w-5 h-5" />
                <img src="/icons/android.svg" alt="" className="w-5 h-5" />
                <span>DOWLOAD</span>
              </div>
            </Button>
          </motion.div>
        </div>

        {/* Coins Illustration */}
        <motion.div 
          className="mt-16 relative flex justify-center w-full"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <img 
            src="/images/coins.png" 
            alt="" 
            className="w-full max-w-2xl"
          />
        </motion.div>

        {/* Stars */}
        <motion.Image
          src="/star3.svg"
          alt=""
          width={32}
          height={32}
          className="absolute top-20 left-20 w-8 h-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        />
        <motion.Image
          src="/star3.svg"
          alt=""
          width={32}
          height={32}
          className="absolute top-40 right-32 w-8 h-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        />
        <motion.Image
          src="/star3.svg"
          alt=""
          width={32}
          height={32}
          className="absolute bottom-40 right-20 w-8 h-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        />
      </div>
      <Paybuddy />
    </section>
  );
}