export type AuthTestimonial = {
  quote: string
  name: string
  role: string
  company: string
}

export const AUTH_TESTIMONIALS: AuthTestimonial[] = [
  {
    quote: 'Nyra cut our payout time from days to minutes. Our suppliers and partners feel the difference every week.',
    name: 'Ada Okonkwo',
    role: 'CEO',
    company: 'Bloom Commerce',
  },
  {
    quote: 'One dashboard for collections, transfers, and bill payments. We finally stopped juggling three different tools.',
    name: 'James Osei',
    role: 'Finance Lead',
    company: 'Kora Logistics',
  },
  {
    quote: 'Account setup was straightforward. We verified the business, set our PIN, and started moving money the same week.',
    name: 'Fatima Hassan',
    role: 'Founder',
    company: 'Nuri Studios',
  },
  {
    quote: 'Instant settlements changed how we run payroll and vendor payouts. Nyra keeps our ops team ahead of schedule.',
    name: 'Daniel Eze',
    role: 'Operations Director',
    company: 'Meridian Foods',
  },
]

export const AUTH_PANEL_EYEBROW = {
  login: 'Trusted by business owners',
  signup: 'Join teams already on Nyra',
} as const
