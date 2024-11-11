import { Red_Hat_Display } from 'next/font/google'
import localFont from 'next/font/local'

export const redHat = Red_Hat_Display({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-redhat',
  display: 'swap',
})

export const clash = localFont({
  src: [
    {
      path: '../fonts/ClashDisplay-Variable.ttf',
      weight: '200 700',
      style: 'normal',
    }
  ],
  variable: '--font-clash',
  display: 'swap',
})