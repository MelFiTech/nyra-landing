'use client';

const Header = () => {
  return (
    <header className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img src="/nyra-logo.svg" alt="Nyra" className="h-8" />
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#products" className="text-gray-800 hover:text-gray-600">Products</a>
            <a href="#contact" className="text-gray-800 hover:text-gray-600">Contact Us</a>
            <a href="#testimonials" className="text-gray-800 hover:text-gray-600">Testimonials</a>
            <a href="#company" className="text-gray-800 hover:text-gray-600">Company</a>
          </nav>
          
          {/* CTA Button */}
          <div>
            <a
              href="#download"
              className="bg-[#CCFF00] text-black px-6 py-2 rounded-full font-medium hover:bg-[#B8E600] transition-colors"
            >
              Download Nyra
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;