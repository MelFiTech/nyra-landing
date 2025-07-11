'use client';

import Image from 'next/image';

const footerLinks = {
  company: {
    title: 'Company',
    links: [
      { name: 'About Us', href: '/about' },
      { name: 'Careers', href: '#' },
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
    ]
  },
  product: {
    title: 'Product',
    links: [
      { name: 'Nyra Dollar Card', href: '#' },
      { name: 'Send Money', href: '#' },
      { name: 'Joint Accounts', href: '#' },
      { name: 'PayBuddy', href: '#' },
    ]
  },
  resources: {
    title: 'Resources',
    links: [
      { name: 'FAQS', href: '#' },
      { name: 'Blog', href: '#' },
      { name: 'Support', href: '#' },
    ]
  },
  followUs: {
    title: 'Follow Us',
    links: [
      { name: 'Twitter', href: '#' },
      { name: 'Instagram', href: '#' },
      { name: 'LinkedIn', href: '#' },
      { name: 'YouTube', href: '#' },
    ]
  },
  contactUs: {
    title: 'Contact Us',
    links: [
      { name: 'hello@nyrawallet.com', href: 'mailto:hello@nyrawallet.com' },
      { name: 'WhatsApp', href: '#' },
    ]
  }
};

const Footer = () => {
  return (
    <footer className="bg-[#11140E] text-white py-24 rounded-t-[70px] mx-2 relative">
      <div className="absolute inset-0 bg-cover bg-center rounded-t-[70px]" style={{ backgroundImage: 'url(/images/Footerbg.png)' }} />
      <div className="relative max-w-7xl mx-auto px-4">
        <div className="flex flex-col gap-16">
          {/* Top section with logo and app store buttons */}
          <div className="flex justify-between items-start">
            <h2 className="font-clash text-[100px] leading-none text-[#CEFE65] font-bold">
              Go Nyra <br />
              For Naira
            </h2>
            <div className="flex flex-col gap-3">
              <a 
                href="#" 
                className="flex items-center justify-center bg-[#CEFE65] hover:bg-[#CEFE65]/90 text-black h-[75px] rounded-full w-[421px]"
              >
                <div className="flex items-center gap-3">
                  <Image 
                    src="/icons/apple.svg" 
                    alt="" 
                    width={30} 
                    height={30}
                    className="w-5 h-5 [filter:brightness(0)_saturate(100%)_invert(0)_sepia(0)_saturate(0)_hue-rotate(0)_brightness(0)_contrast(100%)]"
                  />
                  <div className="flex flex-col">
                    <span className="text-base font-medium">Get it on</span>
                    <span className="text-[20px] font-bold">App Store</span>
                  </div>
                </div>
              </a>
              <a 
                href="#" 
                className="flex items-center justify-center bg-[#2F3A1C] hover:bg-[#2F3A1C]/90 text-white h-[75px] rounded-full w-[421px]"
              >
                <div className="flex items-center gap-3">
                  <Image 
                    src="/icons/android.svg" 
                    alt="" 
                    width={30} 
                    height={30}
                    className="w-5 h-5 [filter:brightness(0)_saturate(100%)_invert(0)_sepia(0)_saturate(0)_hue-rotate(0)_brightness(0)_contrast(100%)]"
                  />
                  <div className="flex flex-col">
                    <span className="text-base font-medium text-[#202715]">Soon on</span>
                    <span className="text-[20px] font-bold text-[#11140E]">Google Play</span>
                  </div>
                </div>
              </a>
            </div>
          </div>

          {/* Links section */}
          <div className="grid grid-cols-5 gap-8">
            {Object.values(footerLinks).map((section) => (
              <div key={section.title}>
                <h3 className="text-white mb-6">{section.title}</h3>
                <ul className="space-y-4">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <a 
                        href={link.href}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom section with disclaimer and copyright */}
          <div className="space-y-4 text-gray-400 text-base">
            <p className="max-w-4xl">
              MyNyra Technology Limited (Nyra Wallet) is not a bank. Banking services, including the management of accounts and financial transactions, are provided through our licensed banking partners.
            </p>
            <p>© 2024 Nyra Financial Technology. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;