'use client';

import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Image from 'next/image';

const Spend = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-24 relative overflow-hidden">
      <div className="flex gap-12 items-center">
        <div className="w-1/2 flex flex-col justify-center">
          <motion.div 
            className="mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="bg-[#EBEBED] px-4 py-2 rounded-full text-sm font-medium text-[#888795]">
            ALL YOUR FAVORITE PEOPLE
            </span>
          </motion.div>
          
          <motion.h2 
            className="font-clash text-[90px] leading-[1.1] tracking-tight mb-6 font-semibold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Send it like <br />
            you mean it
          </motion.h2>
          
          <motion.p 
            className="text-xl text-gray-800 max-w-xl mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
                Effortless transfers at your fingertips, making it simpler than ever to send money to those who matter.    </motion.p>

          <Button 
            variant="primary" 
            size="lg"
            className="bg-[#CEFE65] hover:bg-[#CEFE65]/90 inline-flex items-center w-fit"
          >
            <div className="flex items-center space-x-2">
              <Image src="/icons/apple.svg" alt="" width={20} height={20} className="w-5 h-5 [filter:invert(1)_brightness(0.1)]" />
              <Image src="/icons/android.svg" alt="" width={20} height={20} className="w-5 h-5 [filter:invert(1)_brightness(0.1)]" />
              <span className="text-[#11140E]">DOWLOAD</span>
            </div>
          </Button>
        </div>

        <motion.div 
          className="w-[532px] h-[599px] rounded-3xl overflow-hidden"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Image src="/spend.png" alt="Spend illustration" width={532} height={599} className="w-full h-full object-cover" />
        </motion.div>
      </div>

      {/* Stars */}
      <motion.img
        src="/star3.svg"
        alt=""
        className="absolute top-20 right-20 w-8 h-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      />
      <motion.img
        src="/star3.svg"
        alt=""
        className="absolute bottom-40 left-20 w-8 h-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      />
    </section>
  );
};

export default Spend;