'use client';

import { motion } from 'framer-motion';

export default function Paybuddy() {
  return (
    <section className="relative overflow-hidden h-[744px]">
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/images/Paybuddybg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      />
      <div className="absolute inset-0 z-0 bg-[#B364FE]/90" />

      <div className="container mx-auto px-4 py-32 relative z-10">
        <div className="max-w-2xl pt-20">
          {/* Section Label */}
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="bg-white/5 text-white px-6 py-3 rounded-full text-sm font-medium backdrop-blur-sm">
              SPEND LIKE A LOCAL
            </span>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h2 className="font-clash text-[100px] leading-[0.9] text-white mb-10 font-semibold">
              Visiting
              <br />
              Nigeria?
            </h2>
            <p className="text-white/80 text-xl leading-relaxed max-w-xl">
              Need cash or want to exchange currency? Connect with trusted locals for instant, secure, and convenient transactions.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Money Illustration */}
      <motion.div 
        className="absolute -right-32 top-[-13.5%] -translate-y-1/2 w-[65%]"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <img 
          src="/images/money-illustration.png" 
          alt="" 
          className="w-full"
        />
      </motion.div>

      {/* Stars */}
      <motion.img
        src="/star3.svg"
        alt=""
        className="absolute top-[40%] right-[42%] w-5 h-5 text-[#FFB800]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      />
      <motion.img
        src="/star3.svg"
        alt=""
        className="absolute bottom-[30%] left-[30%] w-5 h-5 text-[#FFB800]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
      />
    </section>
  );
}