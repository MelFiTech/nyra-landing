'use client';

import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/magicui/button";
import gsap from "gsap";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/magicui/tooltip";
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export type IconProps = React.HTMLAttributes<SVGElement>;

const DATA = {
  actions: [
    { href: "/", icon: "/images/Send.svg", label: "Send" },
    { href: "/index-2", icon: "/images/Cart.svg", label: "Cards" },
    { href: "/index-3", icon: "/images/Users.svg", label: "Joint Accounts" },
  ]
};

interface DockIconProps {
  icon: string;
  label: string;
  href: string;
  isActive: boolean;
}

function DockIcon({ icon, label, href, isActive }: DockIconProps) {
  const iconRef = useRef<HTMLDivElement>(null);
  const rippleRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    
    // Icon scale animation
    gsap.to(iconRef.current, {
      scale: 1.2,
      duration: 0.3,
      ease: "elastic.out(1, 0.3)"
    });

    // Ripple effect
    if (rippleRef.current) {
      gsap.set(rippleRef.current, {
        scale: 0.5,
        opacity: 0.5
      });
      gsap.to(rippleRef.current, {
        scale: 1.5,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out"
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    gsap.to(iconRef.current, {
      scale: isActive ? 1.1 : 1,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const handleClick = () => {
    // Create bubble effect on click
    gsap.to(iconRef.current, {
      scale: 0.9,
      duration: 0.1,
      ease: "power2.in",
      onComplete: () => {
        gsap.to(iconRef.current, {
          scale: 1.2,
          duration: 0.3,
          ease: "elastic.out(1, 0.3)"
        });
      }
    });
  };

  useEffect(() => {
    // Set initial scale for active icon
    if (isActive && iconRef.current) {
      gsap.set(iconRef.current, {
        scale: 1.1
      });
    }
  }, [isActive]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link href={href}>
          <div className="relative">
            {/* Ripple effect container - only show when hovered or active */}
            {(isHovered || isActive) && (
              <div
                ref={rippleRef}
                className={cn(
                  "absolute inset-0 rounded-full pointer-events-none",
                  isActive ? "bg-white/30" : "bg-white/20"
                )}
              />
            )}
            
            {/* Icon container */}
            <motion.div
              ref={iconRef}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "rounded-full hover:bg-white/20 flex items-center justify-center w-[60px] h-[60px] relative transition-colors duration-200",
                isActive ? "bg-white/10 text-white" : "text-gray-400",
                isHovered && !isActive && "bg-white/5"
              )}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={handleClick}
              transition={{ duration: 0.2 }}
            >
              <Image 
                src={icon} 
                alt={label} 
                width={40} 
                height={40}
                className={cn(
                  "transition-all duration-200",
                  isActive ? "brightness-100" : "brightness-75 hover:brightness-90",
                  isHovered && !isActive && "brightness-90"
                )}
              />
            </motion.div>
          </div>
        </Link>
      </TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function DockDemo() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-8 left-0 right-0 flex justify-center">
      <TooltipProvider>
        <div className="flex items-center gap-2 rounded-full bg-[#000000]/50 backdrop-blur-lg p-3 shadow-lg">
          {DATA.actions.map((item) => (
            <DockIcon
              key={item.label}
              icon={item.icon}
              label={item.label}
              href={item.href}
              isActive={pathname === item.href}
            />
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
}