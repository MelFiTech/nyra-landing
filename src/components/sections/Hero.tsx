'use client';

import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import TextTicker from '@/components/ui/TextTicker';

const Hero = () => {
  return (
    <section className="min-h-screen pt-[280px] relative overflow-hidden bg-[#F5F5F6]">
      {/* Stars */}
      <motion.div 
        className="absolute top-[180px] right-[100px]" 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <img src="/star1.svg" alt="" className="w-[120px] h-[120px]" />
      </motion.div>
      
      <motion.div 
        className="absolute top-[520px] left-[140px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <img src="/star2.svg" alt="" className="w-[100px] h-[100px]" />
      </motion.div>

      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-clash text-[80px] md:text-[170px] leading-[0.95] relative text-center" style={{ fontVariationSettings: "'wght' 500" }}>
            the easy road
            <br />
            t
            <span className="relative inline-flex items-center justify-center">
              <motion.img 
                src="/purple-circle.svg" 
                alt="" 
                className="w-[90px] md:w-[90px] mr-[20px]"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              banking
            </span>
          </h1>
          
          <motion.div 
            className="mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Button size="lg">
              DOWNLOAD NYRA
            </Button>
          </motion.div>
        </motion.div>

        {/* Background Scrolling Text */}
        <div className="absolute left-0 top-[640px] opacity-5 pointer-events-none z-0 w-full overflow-hidden">
          <div className="animate-ticker whitespace-nowrap">
            <span className="text-[400px] font-redhat font-medium inline-block">
              MONEY MADE SOCIAL&nbsp;&nbsp;&nbsp;MONEY MADE SOCIAL&nbsp;&nbsp;&nbsp;
            </span>
          </div>
        </div>

        {/* Phone Image */}
        <motion.div 
          className="mt-16 relative z-10 flex justify-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <div className="h-[589px] overflow-hidden">
            <img 
              src="/phone.png" 
              alt="Nyra App Interface" 
              className="w-[416px]"
            />
          </div>
        </motion.div>
      </div>

      <TextTicker />
    </section>
  );
};

export default Hero;