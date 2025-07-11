'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Image from 'next/image';

const Header = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const menuItems = {
    learn: ['Getting Started', 'How it Works', 'FAQs', 'Support'],
    products: ['Nyra Dollar Card', 'Send Money', 'Joint Accounts', 'PayBuddy'],
    company: ['About Us', 'Careers', 'Privacy Policy', 'Terms of Service']
  };

  return (
    <header className="fixed w-full top-0 z-50 bg-[#F5F5F6]">
      <div className="w-full px-6 py-4">
        <nav className="flex items-center justify-between max-w-[1440px] mx-auto">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Image 
              src="/logo.png" 
              alt="Logo"
              width={150} 
              height={40}
              className="h-10 w-auto"
            />
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8 font-redhat">
            <div className="relative">
              <button 
                onClick={() => setActiveMenu(activeMenu === 'learn' ? null : 'learn')}
                className="flex items-center gap-2 text-gray-600 hover:text-black"
              >
                Learn
                <img src="/icons/chevron-down.svg" alt="" className="w-4 h-4" />
              </button>
              {activeMenu === 'learn' && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2">
                  {menuItems.learn.map((item) => (
                    <a key={item} href="#" className="block px-4 py-2 text-gray-600 hover:bg-gray-100">
                      {item}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button 
                onClick={() => setActiveMenu(activeMenu === 'products' ? null : 'products')}
                className="flex items-center gap-2 text-gray-600 hover:text-black"
              >
                Products
                <img src="/icons/chevron-down.svg" alt="" className="w-4 h-4" />
              </button>
              {activeMenu === 'products' && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2">
                  {menuItems.products.map((item) => (
                    <a key={item} href="#" className="block px-4 py-2 text-gray-600 hover:bg-gray-100">
                      {item}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button 
                onClick={() => setActiveMenu(activeMenu === 'company' ? null : 'company')}
                className="flex items-center gap-2 text-gray-600 hover:text-black"
              >
                Company
                <img src="/icons/chevron-down.svg" alt="" className="w-4 h-4" />
              </button>
              {activeMenu === 'company' && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2">
                  <a href="/about" className="block px-4 py-2 text-gray-600 hover:bg-gray-100">
                    About Us
                  </a>
                  {menuItems.company.slice(1).map((item) => (
                    <a key={item} href="#" className="block px-4 py-2 text-gray-600 hover:bg-gray-100">
                      {item}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CTA Button */}
          <Button size="md" className="bg-[#CEFE65] hover:bg-[#CEFE65]/90">
            DOWNLOAD
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;