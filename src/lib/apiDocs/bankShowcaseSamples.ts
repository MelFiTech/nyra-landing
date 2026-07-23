import type { Bank } from '../api'

/** Public R2 bucket; same base the API uses for `logo_url` / `logo_url_svg`. */
const BANK_LOGO_CDN = (
  (import.meta.env.VITE_BANK_LOGO_CDN as string | undefined) ??
  'https://pub-bd856e2c32a94a28ae2c60cda12130c8.r2.dev'
).replace(/\/$/, '')

function withLogos(
  bank: Pick<Bank, 'bank_code' | 'bank_name' | 'bank_long_code'>,
  logoPath: { png: string; svg: string },
): Bank {
  return {
    ...bank,
    logo_url: `${BANK_LOGO_CDN}/banks/logos/${logoPath.png}`,
    logo_url_svg: `${BANK_LOGO_CDN}/banks/logos/${logoPath.svg}`,
  }
}

/** Static preview for developer docs (no auth required). */
export const DOC_BANK_SHOWCASE_SAMPLES: Bank[] = [
  withLogos(
    { bank_code: '044', bank_name: 'Access Bank', bank_long_code: '000014' },
    {
      png: 'ngn/png/commercial-banks/Access Bank Nigeria.png',
      svg: 'ngn/svg/commercial-banks/Access Bank Nigeria.svg',
    },
  ),
  withLogos(
    { bank_code: '058', bank_name: 'Guaranty Trust Bank', bank_long_code: '000013' },
    {
      png: 'ngn/png/commercial-banks/GTBank Plc.png',
      svg: 'ngn/svg/commercial-banks/GTBank Plc.svg',
    },
  ),
  withLogos(
    { bank_code: '011', bank_name: 'First Bank of Nigeria', bank_long_code: '000016' },
    {
      png: 'ngn/png/commercial-banks/First Bank of Nigeria.png',
      svg: 'ngn/svg/commercial-banks/First Bank of Nigeria.svg',
    },
  ),
  withLogos(
    { bank_code: '033', bank_name: 'United Bank for Africa', bank_long_code: '000004' },
    {
      png: 'ngn/png/commercial-banks/United Bank for Africa.png',
      svg: 'ngn/svg/commercial-banks/United Bank for Africa.svg',
    },
  ),
  withLogos(
    { bank_code: '057', bank_name: 'Zenith Bank', bank_long_code: '000015' },
    {
      png: 'ngn/png/commercial-banks/Zenith Bank Plc.png',
      svg: 'ngn/svg/commercial-banks/Zenith Bank Plc.svg',
    },
  ),
  withLogos(
    { bank_code: '214', bank_name: 'First City Monument Bank', bank_long_code: '000003' },
    {
      png: 'ngn/png/commercial-banks/First City Monument Bank.png',
      svg: 'ngn/svg/commercial-banks/First City Monument Bank.svg',
    },
  ),
]
