import { ButtonHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

const Button = ({ 
  children, 
  className, 
  variant = 'primary', 
  size = 'md', 
  ...props 
}: ButtonProps) => {
  const baseStyles = "rounded-full font-bold text-base transition-all duration-200 font-redhat [box-shadow:inset_0_-4px_0_rgba(0,0,0,0.05)]";
  
  const variants = {
    primary: "bg-[#CEFE65] text-black hover:bg-[#b8e600]",
    secondary: "bg-white text-black hover:bg-gray-100"
  };
  
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-2 text-base",
    lg: "px-8 py-3 text-base"
  };

  return (
    <button 
      className={twMerge(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;