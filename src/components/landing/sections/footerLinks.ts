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
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  developers: [
    { label: 'API docs', href: '#' },
    { label: 'Dashboard', href: '/app/signup' },
    { label: 'Webhooks', href: '#' },
    { label: 'Status', href: '#' },
  ],
  legal: [
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
    { label: 'Compliance', href: '#' },
  ],
}

export const FOOTER_COLUMNS = [
  { key: 'products', title: 'Products' },
  { key: 'company', title: 'Company' },
  { key: 'developers', title: 'Developers' },
  { key: 'legal', title: 'Legal' },
] as const
