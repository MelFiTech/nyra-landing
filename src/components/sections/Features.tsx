'use client'

import React from 'react'
import Image from 'next/image'

interface FeatureItem {
  icon: string
  title: string
  description: string
  image?: string
  imageClass?: string
}

interface FeatureCardProps extends FeatureItem {
  className?: string
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  icon, 
  title, 
  description, 
  image, 
  imageClass, 
  className 
}) => (
  <div className={`bg-white rounded-[32px] w-full ${className}`}>
    <div className="p-6 flex flex-col h-full">
      <div className={`${title.includes('\n') ? 'mb-[70px]' : 'mb-4'}`}>
        <Image src={icon} alt="" width={32} height={32} className="w-8 h-8" />
      </div>
      <h3 className="font-clash text-xl font-medium mb-3" style={{whiteSpace: 'pre-line'}}>{title}</h3>
      {description && (
        <p className="text-gray-600 leading-relaxed text-base mb-4 max-w-[300px]">{description}</p>
      )}
      {image && (
        <div className={`mt-4 relative w-full h-full overflow-hidden rounded-[30px] ${imageClass}`}>
          <Image
            src={image}
            alt=""
            layout="fill"
            objectFit="cover"
            className="rounded-[30px]"
          />
        </div>
      )}
    </div>
  </div>
)

const features: FeatureItem[] = [
  {
    icon: '/icons/users.svg',
    title: 'Joint Accounts',
    description: 'Share expenses and savings effortlessly. Perfect for couples, families, or friends managing shared costs.',
    image: '/images/joint-accounts.png',
    imageClass: 'h-[200px]'
  },
  {
    icon: '/icons/dollar.svg',
    title: 'Dollar Cards',
    description: 'Get virtual dollar cards for secure online shopping and payments. Perfect for subscriptions and e-commerce.',
    image: '/images/dollar-card.png',
    imageClass: 'h-[200px]'
  },
  {
    icon: '/icons/send.svg',
    title: 'Send Money,\nAnytime',
    description: '',
  },
  {
    icon: '/icons/transfer.svg',
    title: 'Turn Airtime\ninto Cash',
    description: '',
  },
  {
    icon: '/icons/lightning.svg',
    title: 'Make Money Management Fun',
    description: 'Learn, save, and manage money with interactive games',
  }
]

export default function Features() {
  return (
    <section className="py-16 bg-[#FAFAFA]">
      <div className="container mx-auto px-4 max-w-[1440px]">
        <div className="text-center mb-6">
          <span className="bg-[#F5F5F6] px-6 py-3 rounded-full text-sm font-medium text-[#888795]">
          OUR FEATURES
          </span>
        </div>

        <h2 className="text-center font-clash text-6xl md:text-7xl mb-6 leading-[1.1] font-medium">
          Tailored for <span className="text-[#9FBE43]">you</span>,
          <br />
          Built for <span className="text-[#FF8D3A]">Connection</span>
        </h2>

        <div className="grid grid-cols-12 gap-6">
          {/* Joint Account and Dollar Card Container */}
          <div className="col-span-12 md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureCard {...features[0]} className="h-full" />
            <FeatureCard {...features[1]} className="h-full" />
          </div>

          {/* Small Cards Container */}
          <div className="col-span-12 md:col-span-4 flex flex-col h-full">
            <div className="grid grid-cols-2 gap-6 flex-1">
              <FeatureCard {...features[2]} className="h-full" />
              <FeatureCard {...features[3]} className="h-full" />
            </div>
            <FeatureCard {...features[4]} className="mt-6 flex-1" />
          </div>
        </div>
      </div>
    </section>
  )
}