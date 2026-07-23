import { DOCS_API_BASE_URL } from './buildRequest'

export type GuideGroup = {
  id: string
  label: string
}

export type GuideSection = {
  heading?: string
  paragraphs?: string[]
  bullets?: string[]
  urlBox?: {
    label: string
    url: string
  }
  table?: {
    headers: string[]
    rows: string[][]
  }
}

export type GuideTab = {
  id: string
  label: string
  sections: GuideSection[]
}

export type DocGuide = {
  id: string
  group: string
  title: string
  subtitle?: string
  sections?: GuideSection[]
  tabs?: GuideTab[]
}

export const GUIDE_GROUPS: GuideGroup[] = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'getting-started', label: 'Getting started' },
  { id: 'integration', label: 'Integration guidelines' },
]

export const DOC_GUIDES: DocGuide[] = [
  {
    id: 'overview',
    group: 'introduction',
    title: 'Overview',
    subtitle: 'Financial infrastructure to power your business in Nigeria.',
    sections: [
      {
        paragraphs: [
          'The Nyra Business API is a REST API with JSON request and response bodies. Use it to onboard customers, collect NGN, send payouts, and automate treasury from your own product.',
          'Create API credentials in the dashboard under Settings → Developer. Complete KYB and go live before processing real money.',
        ],
      },
      {
        heading: 'Base URL',
        urlBox: {
          label: 'Production',
          url: DOCS_API_BASE_URL,
        },
      },
    ],
  },
  {
    id: 'why-nyra',
    group: 'introduction',
    title: 'Why Nyra?',
    sections: [
      {
        paragraphs: [
          'Nyra gives businesses a single integration for treasury float, managed customer wallets, bank transfers, and bill payments, with compliance and webhooks built in.',
        ],
      },
      {
        heading: 'What you can build',
        bullets: [
          'Wallets and virtual accounts for your end users',
          'Outbound NGN transfers from your business float',
          'Static and Dynamic collection accounts for pay-ins',
          'Real-time webhook notifications for credits and transfers',
        ],
      },
    ],
  },
  {
    id: 'use-cases',
    group: 'introduction',
    title: 'Use cases',
    sections: [
      {
        heading: 'Marketplaces & platforms',
        paragraphs: [
          'Provision a wallet per seller or buyer, collect payments into float, and pay out on schedule.',
        ],
      },
      {
        heading: 'Fintech & neobanks',
        paragraphs: [
          'Embed accounts and transfers behind your own KYC while Nyra handles settlement.',
        ],
      },
      {
        heading: 'Crypto on-ramps',
        paragraphs: [
          'Stablecoin collections are coming soon. Contact support@nyrawallet.com for early access.',
        ],
      },
    ],
  },
  {
    id: 'pricing',
    group: 'introduction',
    title: 'Pricing & Cashback',
    subtitle:
      'Standard fees for your Nyra business account. Your dashboard may show negotiated rates after KYB approval.',
    tabs: [
      {
        id: 'pricing',
        label: 'Pricing',
        sections: [
          {
            paragraphs: [
              'These are the fees Nyra charges your business when you use the Business API or dashboard. Each successful action debits your business float (or applies on collection) unless noted otherwise.',
              'Volume businesses may receive custom pricing in an order form or under Settings after approval. VAT or other statutory charges may apply where required by law.',
            ],
          },
          {
            heading: 'Outbound bank transfers',
            paragraphs: [
              'When you send NGN from your business float to a Nigerian bank account, Nyra charges a flat transfer fee based on the amount. The fee per transfer is capped at ₦100.',
            ],
            table: {
              headers: ['Transfer amount', 'Fee per transfer'],
              rows: [
                ['₦0 to ₦10,000', '₦25'],
                ['₦10,001 to ₦100,000', '₦50'],
                ['₦100,001 to ₦400,000', '₦75'],
                ['₦400,001 and above', '₦100'],
              ],
            },
          },
          {
            heading: 'Static',
            paragraphs: [
              'Static accounts are reusable virtual accounts linked to your business. We charge a collection fee on each credited amount.',
              'Those inflows follow T+1 settlement when enabled for your business. See the Settlement guide for how unsettled and available balances work.',
            ],
            table: {
              headers: ['Product', 'Fee on credited amount'],
              rows: [['Static', '2.0% (maximum ₦2,000 per credit)']],
            },
          },
          {
            heading: 'Dynamic',
            paragraphs: [
              'Dynamic accounts issue a single-use account number for a fixed amount. amount is required on creation (minimum ₦300).',
              'Fees apply when the customer pays in, not when you create the account.',
            ],
            table: {
              headers: ['Product', 'Fee when customer pays'],
              rows: [['Dynamic', '₦70 per successful payment']],
            },
          },
          {
            heading: 'Treasury float (your business wallet)',
            paragraphs: [
              'Inbound bank transfers to your own business treasury float are not charged a Nyra platform fee by default (₦0). You still pay outbound transfer fees when you move money out.',
            ],
          },
          {
            heading: 'Identity verification',
            paragraphs: [
              'BVN and NIN checks bill your business float per successful lookup. Failed lookups are not charged when the provider does not return a match.',
            ],
            table: {
              headers: ['Check', 'Fee per successful lookup'],
              rows: [
                ['BVN (basic)', '₦60'],
                ['BVN (advanced)', '₦100'],
                ['NIN', '₦150'],
              ],
            },
          },
          /*
          {
            heading: 'Crypto',
            paragraphs: [
              'Crypto wallets and payouts are available only after crypto is enabled for your business. Email support@nyrawallet.com before launch for current Nyra crypto rates.',
            ],
          },
          */
          {
            heading: 'Custom commercial terms',
            paragraphs: [
              'Email support@nyrawallet.com with your expected monthly volume and use case. We can share a proposal or enable negotiated rates in your dashboard.',
            ],
          },
        ],
      },
      {
        id: 'cashback',
        label: 'Cashback',
        sections: [
          {
            paragraphs: [
              'Eligible businesses earn cashback on successful bill payments (airtime, data, electricity, TV, and other VAS) made through the Business API or dashboard.',
              'Cashback is credited to your business float as a separate credit after each successful vend. It is not automatic for every account. Ask Nyra to enable VAS cashback on your business if you do not see it yet.',
            ],
          },
          {
            heading: 'How cashback is calculated',
            paragraphs: [
              'Nyra shares 30% of the wholesale commission we receive from our bill-payment provider with your business. Your cashback is approximately:',
              'transaction amount × provider commission rate × 30%',
              'Some billers have a commission cap on large payments; in those cases cashback is based on the capped commission, not the full percentage of amount.',
            ],
          },
          {
            heading: 'Airtime & data',
            table: {
              headers: ['Network (examples)', 'Cashback on payment amount'],
              rows: [
                ['MTN', '0.90%'],
                ['Airtel', '0.90%'],
                ['GLO', '1.20%'],
                ['9mobile', '1.50%'],
                ['Spectranet / Smile', '0.60%'],
              ],
            },
          },
          {
            heading: 'Cable TV',
            table: {
              headers: ['Provider (examples)', 'Cashback on payment amount'],
              rows: [
                ['DStv / GOtv', '0.48%'],
                ['StarTimes', '0.36%'],
                ['Showmax', '0.60%'],
              ],
            },
          },
          {
            heading: 'Electricity',
            paragraphs: [
              'Rates vary by distribution company. Examples below; other discos follow similar commission schedules.',
            ],
            table: {
              headers: ['DisCo (examples)', 'Cashback on payment amount'],
              rows: [
                ['IKEDC (Ikeja)', '0.24%'],
                ['EKEDC (Eko)', '0.30% (provider cap may apply)'],
                ['AEDC / EEDC / PHEDC', '0.36%'],
                ['IBEDC / JEDC', '0.30%'],
              ],
            },
          },
          {
            heading: 'Betting & other VAS',
            table: {
              headers: ['Category', 'Cashback on payment amount'],
              rows: [
                ['Betting (typical)', '0.06% to 0.36% depending on platform'],
                ['Education pins (e.g. JAMB)', '0.72%'],
              ],
            },
          },
          {
            heading: 'Questions',
            paragraphs: [
              'For a full biller list or to enable cashback on your business, contact support@nyrawallet.com.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'going-live',
    group: 'introduction',
    title: 'Going live checklist',
    sections: [
      {
        bullets: [
          'Complete business signup and KYB in the dashboard',
          'Submit required documents and wait for approval',
          'Create live API keys (client ID + secret) in Settings → Developer',
          'Configure webhook URL and verify signing secret',
          'Test a small transfer or collection in production',
          'Monitor transactions and webhook deliveries in the dashboard',
        ],
      },
    ],
  },
  {
    id: 'authentication',
    group: 'getting-started',
    title: 'Authentication',
    sections: [
      {
        paragraphs: [
          'Every business API request must include your client ID and client secret. Generate credentials in Settings → Developer. The secret is shown only once; store it securely.',
        ],
      },
      {
        heading: 'Headers',
        bullets: [
          'x-client-id: your API client ID (hex string from the dashboard)',
          'Authorization: Bearer {your_client_secret} (starts with live_sk_)',
          'Content-Type: application/json for POST/PATCH bodies',
        ],
      },
      {
        heading: 'Example',
        paragraphs: [
          `curl --request GET \\
  --url '${DOCS_API_BASE_URL}/business/wallets/float' \\
  --header 'x-client-id: your_client_id' \\
  --header 'Authorization: Bearer live_sk_your_client_secret'`,
        ],
      },
    ],
  },
  {
    id: 'errors',
    group: 'getting-started',
    title: 'Errors',
    sections: [
      {
        paragraphs: [
          'Errors use standard HTTP status codes. The body is JSON with success: false and a message field describing what went wrong.',
        ],
      },
      {
        heading: 'Common codes',
        bullets: [
          '400: validation failed or bad request payload',
          '401: missing or invalid client credentials',
          '403: feature not enabled (e.g. crypto) or account restricted',
          '404: resource not found',
          '429: rate limit exceeded; retry with backoff',
          '500: server error; contact support if persistent',
        ],
      },
    ],
  },
  {
    id: 'environment',
    group: 'getting-started',
    title: 'Environment',
    sections: [
      {
        paragraphs: [
          'Use live credentials only against the production API base URL. Sandbox or test keys, when provided, are labeled separately in the dashboard.',
          'Never expose client secrets in mobile apps or front-end code. Call Nyra from your backend only.',
        ],
      },
    ],
  },
  {
    id: 'rate-limiting',
    group: 'getting-started',
    title: 'Rate limiting',
    sections: [
      {
        paragraphs: [
          'API traffic is rate limited per business client. If you receive HTTP 429, wait and retry with exponential backoff.',
          'Contact support if you need higher limits for launch or batch operations.',
        ],
      },
    ],
  },
  {
    id: 'payments',
    group: 'integration',
    title: 'Payments',
    sections: [
      {
        paragraphs: [
          'Create a managed customer wallet first, then create a Static or Dynamic account from the API Reference.',
        ],
      },
      {
        heading: 'Static',
        paragraphs: [
          'POST /business/wallets/static-virtual-accounts creates a reusable Static account. Send external_reference and any meta fields your integration needs.',
          'Subscribe to `managed_wallet.temporary_account_funded` (and optionally `managed_wallet.funded`) when a customer pays in. See the Settlement guide for T+1 timing when settlement is enabled.',
        ],
      },
      {
        heading: 'Dynamic',
        paragraphs: [
          'POST /business/wallets/single-use-virtual-accounts creates a Dynamic account for a single payment. You must send amount (minimum ₦300). Optional expiresIn sets how long the account stays open.',
          'Subscribe to `managed_wallet.temporary_account_funded` for pay-in notifications. To poll without webhooks, GET /business/wallets/single-use-virtual-accounts/{id} using `data.id` from the create response and read `status`. For full transfer details after payment, GET .../single-use-virtual-accounts/{sessionId}/status with `sessionId` from the webhook payload.',
          'Pricing is under Pricing & Cashback → Dynamic.',
        ],
      },
    ],
  },
  {
    id: 'settlement',
    group: 'integration',
    title: 'Settlement',
    subtitle: 'How collection inflows move from pending to spendable balance.',
    sections: [
      {
        paragraphs: [
          'When your business accepts payments into customer collection (virtual) accounts, Nyra can hold those credits until the next settlement cycle instead of making them spendable immediately. This is T+1 settlement: funds received on a given day become available on the next business day after the scheduled settlement run.',
          'Treasury float funding (bank transfers directly to your business float account) is separate. Those inflows typically credit your spendable balance right away and are not subject to the same T+1 hold.',
        ],
      },
      {
        heading: 'Balance fields',
        paragraphs: [
          'Your business parent wallet tracks three numbers that matter for collections and payouts. Use GET /business/wallets/wallet_balance to read them in the API.',
        ],
        table: {
          headers: ['Field', 'Meaning'],
          rows: [
            [
              'balance',
              'Total wallet balance: available_balance plus unsettled_balance.',
            ],
            [
              'available_balance',
              'Spendable now. Transfers, bill payments, and other debits use only this amount.',
            ],
            [
              'unsettled_balance',
              'Collection credits waiting for T+1 settlement. Not spendable until they move to available_balance.',
            ],
            [
              'settlement_enabled',
              'Whether T+1 settlement is active for your business. When false, collection credits may credit available_balance immediately.',
            ],
          ],
        },
      },
      {
        heading: 'Settlement schedule',
        paragraphs: [
          'When settlement is enabled, Nyra runs settlement on weekdays (Monday through Friday), not on weekends. The default settlement time is 09:00 Africa/Lagos. After a successful run, unsettled collection balances move into available_balance.',
          'Credits that arrive late on a Friday remain unsettled until the next weekday settlement window.',
        ],
      },
      {
        heading: 'What triggers unsettled funds',
        paragraphs: [
          'Inbound payments to collection virtual accounts linked to managed customer wallets are the inflows subject to T+1 when settlement is enabled. You still receive webhooks when a customer pays (for example managed_wallet.temporary_account_funded), but the wallet may show the amount under unsettled_balance until settlement completes.',
          'Collection fees are applied on the credited amount according to your pricing. Settlement moves the net credited balance into your spendable pool.',
        ],
      },
      {
        heading: 'Integrating in your product',
        bullets: [
          'Poll GET /business/wallets/wallet_balance or mirror balances from your dashboard before initiating payouts.',
          'Show customers a “pending settlement” state when unsettled_balance is greater than zero.',
          'Do not attempt transfers for more than available_balance; the API rejects insufficient available funds even if balance looks higher.',
          'Use webhooks for payment confirmation; use wallet balance for treasury and payout decisions.',
        ],
      },
      {
        heading: 'Check balance via API',
        paragraphs: [
          'Call wallet balance with the same authentication headers as other Business API endpoints. The response includes balance, available_balance, unsettled_balance, and settlement_enabled.',
          `curl --request GET \\
  --url '${DOCS_API_BASE_URL}/business/wallets/wallet_balance' \\
  --header 'x-client-id: your_client_id' \\
  --header 'Authorization: Bearer live_sk_your_client_secret'`,
        ],
      },
      {
        heading: 'Questions',
        paragraphs: [
          'If you need help interpreting balances or settlement timing for your account, contact support@nyrawallet.com.',
        ],
      },
    ],
  },
  {
    id: 'transfers-guide',
    group: 'integration',
    title: 'Bank transfers',
    sections: [
      {
        paragraphs: [
          'Payouts debit your business float. Nyra selects the float for the business behind your API credentials. You do not need to send source_account_number unless you operate multiple active floats.',
        ],
      },
      {
        heading: 'Recommended flow',
        bullets: [
          'GET /business/transfers/bank/list to load bank codes',
          'POST /business/transfers/name-enquiry?account_number=…&bank_code=… to resolve account name',
          'POST /business/transfers to send NGN with beneficiary details and amount',
        ],
      },
      {
        heading: 'Webhooks',
        paragraphs: [
          'Successful transfers emit managed_wallet.transfer with the transaction reference and your client_request_id when provided.',
        ],
      },
    ],
  },
  {
    id: 'verification-guide',
    group: 'integration',
    title: 'Identity verification',
    sections: [
      {
        paragraphs: [
          'Verify end-users before onboarding or payouts. Use BVN basic for a lightweight match, BVN advanced for the full identity record, or NIN for national ID. All checks use query parameters and bill your business float per successful lookup.',
        ],
      },
    ],
  },
  {
    id: 'bills-guide',
    group: 'integration',
    title: 'Bill payments (VAS)',
    sections: [
      {
        paragraphs: [
          'Bill payments debit your business float. Start with GET /business/vas/services and GET /business/vas/{service_id}/billers to discover products.',
          'Airtime and data: list data plans, then POST airtime/purchase or data/purchase. Electricity and TV: list items, validate the customer account, then POST pay.',
        ],
      },
    ],
  },
  {
    id: 'webhooks-guide',
    group: 'integration',
    title: 'Webhooks',
    sections: [
      {
        paragraphs: [
          'Register endpoints in the dashboard under Webhooks. Nyra signs each delivery with your signing secret so you can verify authenticity.',
        ],
      },
      {
        heading: 'Event types',
        table: {
          headers: ['Event', 'When it fires'],
          rows: [
            ['managed_wallet.funded', 'NGN credited to a managed wallet or float (includes bank reversals; see below)'],
            ['managed_wallet.temporary_account_funded', 'Customer pays a Static or Dynamic collection account'],
            ['managed_wallet.transfer', 'Outbound bank transfer after a successful API transfer'],
            ['managed_wallet.debited', 'Wallet or float debited'],
            ['vas.electricity.completed', 'Electricity token ready after async vending'],
            ['vas.payment.failed', 'VAS bill failed (always subscribed; refunds when applicable)'],
            /*
            ['crypto.wallet.funded', 'Crypto deposit credited'],
            ['crypto.wallet.debited', 'Crypto wallet debited'],
            ['crypto.swap.completed', 'Crypto swap succeeded'],
            ['crypto.swap.failed', 'Crypto swap failed'],
            ['crypto.payout.completed', 'On-chain withdrawal confirmed'],
            ['crypto.payout.failed', 'On-chain withdrawal failed'],
            */
          ],
        },
      },
      {
        heading: 'Reversals',
        paragraphs: [
          'There is no separate reversal event. When a prior bank debit is reversed and funds are returned, Nyra sends `managed_wallet.funded` with `data.transaction_type` set to `REVERSAL`.',
          'Treat it like a credit for balance updates, but reconcile against the original payment using `data.reference` (reversal transaction) and `data.sessionId` when present (often the original debit reference).',
          'Subscribe to `managed_wallet.funded` if you need reversal notifications. No extra dashboard subscription is required beyond that event.',
        ],
        bullets: [
          '`transaction_type`: `CREDIT` for normal inflows; `REVERSAL` when a prior debit was reversed',
          'Outbound API transfers emit `managed_wallet.transfer` on the initial successful debit; a later bank reversal is reported via `managed_wallet.funded` with `REVERSAL`, not a second transfer event',
          'Failed VAS payments use `vas.payment.failed` (refund to float when applicable), not `REVERSAL`',
        ],
      },
      {
        heading: 'Verifying signatures',
        paragraphs: [
          'Each delivery includes X-Nyra-Signature: an HMAC-SHA256 hex digest of the raw JSON body using your endpoint signing secret. Reject requests when the signature does not match.',
        ],
      },
    ],
  },
  /*
  {
    id: 'crypto-guide',
    group: 'integration',
    title: 'Crypto',
    sections: [
      {
        paragraphs: [
          'Crypto must be enabled for your business. Flow: list supported assets → create a crypto customer → generate a deposit address per asset and chain.',
          'See API Reference for request fields and response shapes.',
        ],
      },
    ],
  },
  */
]

export function getGuideById(id: string): DocGuide | undefined {
  return DOC_GUIDES.find(g => g.id === id)
}

export function getDefaultGuideId(): string {
  return 'overview'
}
