'use client';

import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section className="pt-32 pb-16 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-7xl font-bold mb-8">
            the easy road
            <br />
            to <span className="inline-flex items-center">
              <span className="w-16 h-16 bg-purple-400 rounded-full mx-2"></span>
              banking
            </span>
          </h1>
          
          <div className="mt-8">
            <a
              href="#download"
              className="bg-[#CCFF00] text-black px-8 py-3 rounded-full font-medium hover:bg-[#B8E600] transition-colors text-lg"
            >
              Download Nyra
            </a>
          </div>
          
          <div className="mt-16">
            <img 
              src="/phone-mockup.png" 
              alt="Nyra App Interface" 
              className="max-w-md mx-auto"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;