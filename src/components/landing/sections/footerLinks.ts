export type FooterLink = {
  label: string
  href: string
}

export const FOOTER_LINKS: Record<string, FooterLink[]> = {
  products: [
    { label: 'Accounts', href: '#' },
    { label: 'Payout', href: '#' },
    { label: 'Identity', href: '#' },
    { label: 'Invoicing', href: '#' },
  ],
  company: [
    { label: 'About', href: '/company/about' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  developers: [
    { label: 'API docs', href: '/docs?view=guides' },
    { label: 'Dashboard', href: '/app/signup' },
    { label: 'Webhooks', href: '/docs?view=api&e=webhooks-overview' },
    { label: 'Status', href: '#' },
  ],
  legal: [
    { label: 'Privacy', href: '/legal/privacy' },
    { label: 'Terms', href: '/legal/terms' },
    { label: 'AML/KYC Policy', href: '/legal/aml-kyc' },
    { label: 'Compliance', href: '/legal/compliance' },
  ],
}

export const FOOTER_COLUMNS = [
  { key: 'products', title: 'Products' },
  { key: 'company', title: 'Company' },
  { key: 'developers', title: 'Developers' },
  { key: 'legal', title: 'Legal' },
] as const
