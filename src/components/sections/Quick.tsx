'use client';

import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Image from 'next/image';

const Quick = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-24 relative overflow-hidden">
      <div className="flex gap-12 items-center">
        <motion.img
          src="/quick.png"
          alt="Quick and intentional"
          className="w-[532px] h-[599px] rounded-3xl object-cover"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        />
        <div className="w-1/2 flex flex-col justify-center">
          <motion.div 
            className="mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="bg-[#EBEBED] px-4 py-2 rounded-full text-sm font-medium text-gray-500">
              EXPLORE CASHROLL
            </span>
          </motion.div>
          
          <motion.h2 
            className="font-clash text-[100px] leading-[1.1] tracking-tight mb-6 font-semibold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Quick & <br />
            Intentional
          </motion.h2>
          
          <motion.p 
            className="text-xl text-gray-800 max-w-xl mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            Sending money has never been simpler. <br /> 
            Scroll, Select, & Send!
          </motion.p>

          <Button 
            variant="primary" 
            size="lg"
            className="bg-[#CEFE65] hover:bg-[#CEFE65]/90 inline-flex items-center w-fit"
          >
            <div className="flex items-center space-x-2">
              <Image 
                src="/icons/apple.svg" 
                alt="" 
                width={20}
                height={20}
                className="w-5 h-5 [filter:invert(1)_brightness(0.1)]"
              />
              <Image 
                src="/icons/android.svg" 
                alt="" 
                width={20}
                height={20}
                className="w-5 h-5 [filter:invert(1)_brightness(0.1)]"
              />
              <span className="text-[#11140E]">DOWLOAD</span>
            </div>
          </Button>
        </div>
      </div>

      {/* Stars */}
      <motion.img
        src="/star3.svg"
        alt=""
        className="absolute top-20 left-20 w-8 h-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      />
      <motion.img
        src="/star3.svg"
        alt=""
        className="absolute bottom-40 right-20 w-8 h-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      />
    </section>
  );
};

export default Quick;