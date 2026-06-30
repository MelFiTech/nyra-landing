import type { StatConfig } from '../AnimatedStatValue'

export const BUILD_POINTS = [
  'Build your fintech solution quickly by choosing payment modules from Nyra’s existing infrastructure.',
  'Give your customers a tailored experience with features built for Nigerian businesses, and brand it as your own with our APIs.',
  'Verify identity documents in seconds to protect your business and stay ahead of fraud from day one.',
  'Launch, manage, and scale your commercial payment service from a single dashboard.',
]

export const PAY_POINTS = [
  'Payout to anyone, anywhere, directly into their bank account in NGN and supported currencies, often instantly.',
  'Generate virtual account numbers and assign them to customers to accept bank transfer payments on the go.',
  'Collect from multiple channels, reconcile automatically, and move money at scale without spreadsheet chaos.',
]

export const PRODUCTS = [
  {
    title: 'Accounts',
    description: 'Assign bank accounts to customers or transactions to accept payments with bank transfers.',
    soon: false,
  },
  {
    title: 'Payout',
    description: 'Instantly send funds to anyone, anywhere, and do it at scale from your Nyra dashboard or API.',
    soon: false,
  },
  {
    title: 'Identity',
    description: 'Verify customer identity in seconds and mitigate fraud before it starts.',
    soon: false,
  },
  {
    title: 'Links',
    description: 'Create a payment page and share your link to get paid online without a website.',
    soon: true,
  },
  {
    title: 'Invoicing',
    description: 'Create branded invoices, send to anyone, and get paid seamlessly.',
    soon: true,
  },
]

export type SegmentKey = 'financial' | 'marketplaces' | 'smes'

export const SEGMENTS: Record<
  SegmentKey,
  { title: string; body: string; tags: string[]; cta: string }
> = {
  financial: {
    title: 'Financial services',
    body: 'Everything you need to build, embed, launch, and scale your fintech products: process instant transfers, manage wallets, and move money within your system with a single API integration.',
    tags: ['Lending', 'Digital bank', 'Business finance', 'Savings', 'Personal finance', 'Remittance'],
    cta: 'Contact sales',
  },
  marketplaces: {
    title: 'Marketplaces & on-demand',
    body: 'Increase revenue and retention when you elevate customer experience with personalized payment choices, digital wallets, split settlements, and automated payouts to vendors.',
    tags: ['E-commerce', 'Ride hailing', 'Logistics', 'Creator platforms'],
    cta: 'Contact sales',
  },
  smes: {
    title: 'SMEs',
    body: 'Take charge of your operations with an all-in-one solution. Simplify collections and payouts, track cash flow with Nyra AI, and expand into new markets from one platform.',
    tags: ['Retail', 'Agencies', 'Professional services', 'Wholesale'],
    cta: 'Contact sales',
  },
}

export const STATS: StatConfig[] = [
  { target: 1000, suffix: '+', label: 'businesses on Nyra' },
  { target: 99.9, suffix: '%', decimals: 1, label: 'historical uptime for core services' },
  { target: 24, prefix: '₦', suffix: 'M+', label: 'in monthly NGN payment volume' },
]

export const DEV_CARDS = [
  {
    title: 'API integration',
    body: 'Get up and running with expansive API documentation that makes integration straightforward no matter your stack.',
    link: 'Read the docs',
  },
  {
    title: 'No-code',
    body: 'Initiate transfers, manage customers, and run your treasury directly from the Nyra dashboard, no engineering required.',
    link: 'Open dashboard',
  },
  {
    title: 'White-label',
    body: 'Embed financial services into your product and brand the experience as your own with Nyra infrastructure underneath.',
    link: 'Talk to us',
  },
]

export const SECURITY = [
  {
    title: 'Regulated',
    body: 'We work within applicable financial regulations and banking partnerships so your business operates with confidence.',
  },
  {
    title: 'Fully compliant',
    body: 'Security controls aligned with industry standards, built to protect payments, data, and customer trust.',
  },
  {
    title: 'KYC verification',
    body: 'Robust identity and business verification flows help you onboard customers safely and stay audit-ready.',
  },
  {
    title: 'Data protection',
    body: 'Strict AML & CFT policies, encryption in transit and at rest, and practices designed to keep your data safe.',
  },
]
