'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import { Twitter, Instagram } from 'lucide-react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  // Add/remove overflow hidden on body when menu opens/closes
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 py-8">
        <nav className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <Image 
                src="/nyra.svg"
                alt="Nyra"
                width={78}
                height={27}
                className="w-[78px] h-[27px] object-contain"
                priority
              />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden z-50"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg
              className={`w-6 h-6 transition-colors duration-200 ${isOpen ? 'text-white' : 'text-black'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center gap-12">
            <Link 
              href="https://linkedin.com/company/nyrawallet"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black hover:text-gray-700 transition-colors opacity-50"
            >
              Company
            </Link>
            <a 
              href="mailto:hello@nyrawallet.com"
              className="text-black hover:text-gray-700 transition-colors opacity-50"
            >
              Contact Us
            </a>
          </div>

          {/* Mobile Menu - Fullscreen */}
          <AnimatePresence>
            {isOpen && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black md:hidden"
                style={{ zIndex: 40 }}
                onClick={() => setIsOpen(false)}
              >
                <div className="flex flex-col items-center h-full py-20" onClick={e => e.stopPropagation()}>
                  {/* Menu Logo */}
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="mb-20"
                  >
                    <Link href="/" onClick={() => setIsOpen(false)}>
                      <Image 
                        src="/nyra.svg"
                        alt="Nyra"
                        width={120}
                        height={40}
                        className="w-[120px] h-[40px] object-contain brightness-0 invert"
                        priority
                      />
                    </Link>
                  </motion.div>

                  {/* Menu Links and Download Button */}
                  <motion.div 
                    className="flex flex-col items-center gap-12"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                  >
                    <Link 
                      href="https://linkedin.com/company/nyrawallet"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white text-3xl font-medium hover:text-gray-200 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Company
                    </Link>
                    <a 
                      href="mailto:hello@nyrawallet.com"
                      className="text-white text-3xl font-medium hover:text-gray-200 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Contact Us
                    </a>
                    <Button 
                      variant="primary" 
                      size="lg"
                      className="bg-[#CEFE65] text-black hover:bg-[#CEFE65]/90 font-semibold"
                    >
                      DOWNLOAD NYRA
                    </Button>

                    {/* Mobile Menu Footer - Restructured with text first */}
                    <motion.div
                      className="mt-[-4px] w-full px-8 flex flex-col items-center gap-6"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                    >
                      <p className="text-[#87A83D] text-sm">© {new Date().getFullYear()} MYNYRA Limited.</p>
                      <div className="flex gap-6">
                        <a 
                          href="https://x.com/nyrawallet" 
                          className="text-[#87A83D] hover:text-[#87A83D]/80 transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Twitter className="w-5 h-5" />
                        </a>
                        <a 
                          href="https://www.instagram.com/nyrawallet" 
                          className="text-[#87A83D] hover:text-[#87A83D]/80 transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Instagram className="w-5 h-5" />
                        </a>
                        <a 
                          href="https://tiktok.com/nyrawallet" 
                          className="text-[#87A83D] hover:text-[#87A83D]/80 transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                          </svg>
                        </a>
                        <a 
                          href="https://whatsapp.com/nyrawallet" 
                          className="text-[#87A83D] hover:text-[#87A83D]/80 transition-colors"
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
                        </a>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </div>
    </header>
  );
}