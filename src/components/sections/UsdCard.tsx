'use client';

import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Header from '@/components/ui/Header';
import Image from 'next/image';
import { RetroGrid } from '@/components/magicui/retro-grid';
import Link from 'next/link';
import { Instagram } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function UsdCard() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Start progress animation after component mounts
    const startTime = Date.now();
    const duration = 10000; // 10 seconds

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      
      if (newProgress < 100) {
        setProgress(newProgress);
        requestAnimationFrame(updateProgress);
      } else {
        setProgress(100);
        // Navigate after progress reaches 100%
        setTimeout(() => {
          router.push('/index-3');
        }, 400);
      }
    };

    requestAnimationFrame(updateProgress);
  }, [router]);

  return (
    <section className="relative bg-[#F5F5F6] h-screen flex items-start justify-center overflow-hidden">
      <Header />

      <div className="container mx-auto px-4 relative z-10 flex flex-col items-center justify-center pt-[120px] md:pt-[220px]">
        <div className="flex flex-col items-center text-center">
          {/* Progress Bar - Animated from 0% to 100% over 10 seconds */}
          <motion.div 
            className="w-[200px] h-[8px] bg-gray-300 mb-4 md:mb-8 relative rounded-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="absolute left-0 top-0 h-full bg-black rounded-full"
              style={{ width: `${progress}%` }}
            />
          </motion.div>

          {/* Main Content */}
          <motion.h1 
            className="font-['ClashDisplay-Semibold'] text-[50px] md:text-[150px] leading-[0.95] mb-6 md:mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            GET VIRTUAL
            <br />
            USD CARDS
          </motion.h1>

          {/* Download Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Link href="https://testflight.apple.com/join/9AWuTmtP" target="_blank" rel="noopener noreferrer">
              <Button 
                variant="primary" 
                size="lg"
                className="bg-[#CEFE65] text-black hover:bg-[#CEFE65]/90 text-sm md:text-base"
              >
                JOIN TESTFLIGHT NOW
              </Button>
            </Link>
          </motion.div>

          {/* Card Illustration */}
          <motion.div 
            className="mt-16 md:mt-16 relative flex justify-center items-center"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <div className="flex justify-center items-start">
              <Image 
                src="/images/card.svg" 
                alt=""
                width={1222.55}
                height={621}
                className="relative z-10 w-full h-auto max-w-[80vw] hidden md:block"
              />
              <Image 
                src="/images/card-mobile.svg" 
                alt=""
                width={373}
                height={307}
                className="relative z-10 md:hidden"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Background RetroGrid */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <RetroGrid 
          angle={65} 
          className="opacity-30 w-full h-full"
          containerClassName="absolute inset-0 w-full h-full"
          speed="slow"
        />
      </div>

      {/* Footer - Hidden on Mobile */}
      <footer className="absolute bottom-0 w-full py-6 px-8 hidden md:block">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center">
          <p className="text-[#87A83D] text-sm">© {new Date().getFullYear()} MYNYRA Limited.</p>
          <div className="flex gap-6">
            <div className="w-10 h-10 flex items-center justify-center">
              <Link 
                href="https://x.com/nyrawallet" 
                className="text-[#87A83D] hover:text-[#87A83D]/80 transition-colors w-full h-full flex items-center justify-center"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image 
                  src="/images/x.svg"
                  alt="X (formerly Twitter)"
                  width={20}
                  height={20}
                />
              </Link>
            </div>
            <div className="w-10 h-10 flex items-center justify-center">
              <Link 
                href="https://www.instagram.com/nyrawallet" 
                className="text-[#87A83D] hover:text-[#87A83D]/80 transition-colors w-full h-full flex items-center justify-center"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="w-5 h-5" />
              </Link>
            </div>
            <div className="w-10 h-10 flex items-center justify-center">
              <Link 
                href="https://tiktok.com/nyrawallet" 
                className="text-[#87A83D] hover:text-[#87A83D]/80 transition-colors w-full h-full flex items-center justify-center"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </Link>
            </div>
            <div className="w-10 h-10 flex items-center justify-center">
              <Link 
                href="https://wa.me/2349039344151" 
                className="text-[#87A83D] hover:text-[#87A83D]/80 transition-colors w-full h-full flex items-center justify-center"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </section>
  );
}