import type { Variants } from 'framer-motion'

/**
 * Shared motion primitives for the marketing pages, ported from the Veeza
 * reference so entrances feel identical: a soft cubic ease, once-only
 * whileInView reveals, and headline lines that wipe up from behind a clip mask.
 */
export const ease = [0.2, 0.8, 0.3, 1] as const

export const inView = { once: true, amount: 0.25, margin: '0px 0px -12% 0px' } as const

export const rise: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
}

export const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6, ease } },
}

export const stagger = (staggerChildren = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren, delayChildren } },
})

/** Headline lines that wipe up from behind a clip mask. */
export const lineWipe: Variants = {
  hidden: { y: '105%' },
  show: { y: '0%', transition: { duration: 0.9, ease } },
}

/** Props to spread on an element that should animate as it enters the viewport. */
export const enter = (variants: Variants = rise) =>
  ({ initial: 'hidden', whileInView: 'show', viewport: inView, variants }) as const
