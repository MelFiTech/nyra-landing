import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'light-gray': '#F5F5F6',
      },
      fontFamily: {
        clash: ['ClashDisplay-Variable', 'Red Hat Display', 'sans-serif'],
        redhat: ['var(--font-redhat)', 'Red Hat Display', 'sans-serif'],
        sans: ['Red Hat Display', 'sans-serif'],
      },
      fontWeight: {
        'clash-thin': '200',
        'clash-light': '300',
        'clash-regular': '400',
        'clash-medium': '500',
        'clash-semibold': '600',
        'clash-bold': '700',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        scroll: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(calc(-100% - var(--gap)))' }
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(calc(-100% - var(--gap)))' }
        },
        'marquee-vertical': {
          from: { transform: 'translateY(0)' },
          to: { transform: 'translateY(calc(-100% - var(--gap)))' }
        },
      },
      animation: {
        'ticker': 'ticker 30s linear infinite',
        'scroll': 'scroll var(--duration) linear infinite',
        marquee: 'marquee var(--duration) linear infinite',
        'marquee-vertical': 'marquee-vertical var(--duration) linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
