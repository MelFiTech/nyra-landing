'use client';

import Image from 'next/image';

const footerLinks = {
  company: {
    title: 'Company',
    links: [
      { name: 'About Us', href: '#' },
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
    <footer className="bg-[#11140E] text-white py-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col gap-16">
          <div className="flex justify-between items-start">
            <h2 className="font-clash text-[64px] leading-none text-[#CEFE65]">
              Go Nyra <br />
              For Naira
            </h2>
            <div className="flex flex-col gap-3">
              <a 
                href="#" 
                className="flex items-center justify-center gap-2 bg-[#CEFE65] hover:bg-[#CEFE65]/90 text-black px-12 py-4 rounded-full w-[280px]"
              >
                <Image 
                  src="/icons/apple.svg" 
                  alt="" 
                  width={20} 
                  height={20}
                />
                <span className="text-sm font-medium">Get in on App Store</span>
              </a>
              <a 
                href="#" 
                className="flex items-center justify-center gap-2 bg-[#4D5448] hover:bg-[#4D5448]/90 text-white px-12 py-4 rounded-full w-[280px]"
              >
                <Image 
                  src="/icons/android.svg" 
                  alt="" 
                  width={20} 
                  height={20}
                  className="brightness-0 invert"
                />
                <span className="text-sm font-medium">Soon on Google Play</span>
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
          <div className="space-y-4 text-gray-400 text-sm">
            <p className="max-w-4xl">
              MyNyra Technology Limited (&ldquo;Nyra Wallet&rdquo;) is not a bank. Banking services, including the management of accounts and financial transactions, are provided through our licensed banking partners.
            </p>
            <p>© 2024 Nyra Financial Technology. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;