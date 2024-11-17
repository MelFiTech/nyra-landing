import type { Metadata } from "next";
import { Red_Hat_Display } from 'next/font/google';
import "../fonts/clash-display.css";
import "./globals.css";

const redHat = Red_Hat_Display({
  subsets: ['latin'],
  variable: '--font-redhat',
});

export const metadata: Metadata = {
  title: "Nyra Wallet",
  description: "go nyra for naira",
  icons: {
    icon: '/images/favicon.png',
  },
  openGraph: {
    images: [
      {
        url: '/images/preview.png',
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${redHat.variable}`}>
      <body>{children}</body>
    </html>
  )
}
