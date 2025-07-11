import type { Metadata } from "next";
import "../fonts/clash-display.css";
import "./globals.css";

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
    <html lang="en">
      <head>
        <link 
          href="https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@300..900&display=swap" 
          rel="stylesheet"
        />
      </head>
      <body className="font-['Red_Hat_Display',sans-serif]">{children}</body>
    </html>
  )
}
