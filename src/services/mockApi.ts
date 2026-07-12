const delay = (ms = 800) => new Promise(r => setTimeout(r, ms))

export const BANKS = [
  { bank_code: '058', bank_name: 'GTBank' },
  { bank_code: '044', bank_name: 'Access Bank' },
  { bank_code: '057', bank_name: 'Zenith Bank' },
  { bank_code: '011', bank_name: 'First Bank' },
  { bank_code: '033', bank_name: 'UBA' },
  { bank_code: '232', bank_name: 'Sterling Bank' },
  { bank_code: '076', bank_name: 'Polaris Bank' },
  { bank_code: '070', bank_name: 'Fidelity Bank' },
  { bank_code: '032', bank_name: 'Union Bank' },
  { bank_code: '221', bank_name: 'Stanbic IBTC' },
  { bank_code: '214', bank_name: 'FCMB' },
  { bank_code: '035', bank_name: 'Wema Bank' },
  { bank_code: '082', bank_name: 'Keystone Bank' },
  { bank_code: '301', bank_name: 'Jaiz Bank' },
  { bank_code: '023', bank_name: 'Citibank' },
]

export type Bank = { bank_code: string; bank_name: string }

export async function getBanks(): Promise<Bank[]> {
  await delay(300)
  return BANKS
}

export async function verifyAccountName(bank_code: string, account_number: string) {
  await delay(1000)
  const names = ['John Doe', 'Sarah Johnson', 'Michael Adeyemi', 'Fatima Bello', 'Chukwuemeka Obi']
  return {
    account_name: names[Math.floor(Math.random() * names.length)],
    account_number,
    bank_code,
  }
}

export type DataPlan = { plan_id: string; plan_name: string; amount: number; data_volume: string; validity: string }

export async function getDataPlans(network: string): Promise<DataPlan[]> {
  await delay(400)
  const plans: Record<string, DataPlan[]> = {
    MTN: [
      { plan_id: 'm1', plan_name: 'Daily 200MB', amount: 100, data_volume: '200MB', validity: '1 day' },
      { plan_id: 'm2', plan_name: 'Weekly 1.5GB', amount: 500, data_volume: '1.5GB', validity: '7 days' },
      { plan_id: 'm3', plan_name: 'Monthly 3GB', amount: 1000, data_volume: '3GB', validity: '30 days' },
      { plan_id: 'm4', plan_name: 'Monthly 6GB', amount: 2000, data_volume: '6GB', validity: '30 days' },
      { plan_id: 'm5', plan_name: 'Monthly 15GB', amount: 3500, data_volume: '15GB', validity: '30 days' },
      { plan_id: 'm6', plan_name: 'Monthly 30GB', amount: 6000, data_volume: '30GB', validity: '30 days' },
    ],
    Airtel: [
      { plan_id: 'a1', plan_name: 'Daily 300MB', amount: 100, data_volume: '300MB', validity: '1 day' },
      { plan_id: 'a2', plan_name: 'Weekly 2GB', amount: 500, data_volume: '2GB', validity: '7 days' },
      { plan_id: 'a3', plan_name: 'Monthly 4GB', amount: 1000, data_volume: '4GB', validity: '30 days' },
      { plan_id: 'a4', plan_name: 'Monthly 8GB', amount: 2000, data_volume: '8GB', validity: '30 days' },
      { plan_id: 'a5', plan_name: 'Monthly 20GB', amount: 3500, data_volume: '20GB', validity: '30 days' },
    ],
    Glo: [
      { plan_id: 'g1', plan_name: 'Daily 500MB', amount: 100, data_volume: '500MB', validity: '1 day' },
      { plan_id: 'g2', plan_name: 'Weekly 2.5GB', amount: 500, data_volume: '2.5GB', validity: '7 days' },
      { plan_id: 'g3', plan_name: 'Monthly 5GB', amount: 1000, data_volume: '5GB', validity: '30 days' },
      { plan_id: 'g4', plan_name: 'Monthly 10GB', amount: 2000, data_volume: '10GB', validity: '30 days' },
    ],
    '9mobile': [
      { plan_id: 'e1', plan_name: 'Daily 150MB', amount: 100, data_volume: '150MB', validity: '1 day' },
      { plan_id: 'e2', plan_name: 'Weekly 1GB', amount: 500, data_volume: '1GB', validity: '7 days' },
      { plan_id: 'e3', plan_name: 'Monthly 2.5GB', amount: 1000, data_volume: '2.5GB', validity: '30 days' },
    ],
  }
  return plans[network] || plans.MTN
}

export async function getVirtualAccounts() {
  await delay(500)
  return [
    { bank_name: 'Providus Bank', account_number: '5800123456', account_name: 'Nyra / Mel-Fi Technology' },
    { bank_name: 'Sterling Bank', account_number: '0098765432', account_name: 'Nyra / Mel-Fi Technology' },
  ]
}

export async function generateTemporaryAccount(amount: number) {
  await delay(700)
  return {
    bank_name: 'Wema Bank',
    account_number: String(8000000000 + Math.floor(Math.random() * 999999999)),
    account_name: 'Nyra / Mel-Fi Technology',
    amount,
    expires_in_minutes: 30,
  }
}

export async function fundWithCard(_payload: { amount: number; card_number: string; expiry: string; cvv: string }) {
  await delay(1500)
  return { success: true, reference: 'NYR' + Date.now().toString().slice(-8) }
}

export async function setupDirectDebit(_payload: { bank_code: string; account_number: string; account_name: string }) {
  await delay(1200)
  return { success: true, mandate_id: 'MDT' + Date.now().toString().slice(-8) }
}

export async function transferFunds(_payload: object) {
  await delay(1500)
  return { success: true, reference: 'NYR' + Date.now().toString().slice(-8) }
}

export async function payBill(_payload: object) {
  await delay(1500)
  return { success: true, reference: 'NYR' + Date.now().toString().slice(-8) }
}

export async function purchaseAirtime(_payload: object) {
  await delay(1200)
  return { success: true, reference: 'NYR' + Date.now().toString().slice(-8) }
}

export async function purchaseData(_payload: object) {
  await delay(1200)
  return { success: true, reference: 'NYR' + Date.now().toString().slice(-8) }
}

export type Card = {
  card_id: string
  card_number: string
  card_holder: string
  expiry: string
  cvv: string
  balance: number
  currency: 'USD'
  status: 'active' | 'frozen'
  network: 'Visa' | 'Mastercard'
  created_at: string
}

let mockCards: Card[] = [
  {
    card_id: 'card_001',
    card_number: '4242 •••• •••• 1234',
    card_holder: 'MEL-FI TECHNOLOGY',
    expiry: '12/27',
    cvv: '•••',
    balance: 125.50,
    currency: 'USD',
    status: 'active',
    network: 'Visa',
    created_at: '2025-01-15T10:00:00Z',
  },
]

export async function getCards(): Promise<Card[]> {
  await delay(400)
  return [...mockCards]
}

export async function createCard(_payload: object): Promise<Card> {
  await delay(1500)
  const newCard: Card = {
    card_id: 'card_' + Date.now(),
    card_number: '5399 •••• •••• ' + Math.floor(1000 + Math.random() * 9000),
    card_holder: 'MEL-FI TECHNOLOGY',
    expiry: '06/28',
    cvv: '•••',
    balance: 0,
    currency: 'USD',
    status: 'active',
    network: 'Mastercard',
    created_at: new Date().toISOString(),
  }
  mockCards.push(newCard)
  return newCard
}

export async function toggleCardFreeze(card_id: string): Promise<Card> {
  await delay(800)
  const card = mockCards.find(c => c.card_id === card_id)
  if (card) card.status = card.status === 'active' ? 'frozen' : 'active'
  return card!
}

export async function topUpCard(card_id: string, amount: number): Promise<Card> {
  await delay(1200)
  const card = mockCards.find(c => c.card_id === card_id)
  if (card) card.balance += amount
  return card!
}

export async function getBeneficiaries() {
  await delay(400)
  return [
    { id: 'b1', name: 'Sarah Johnson', bank_name: 'GTBank', account_number: '0123456789', bank_code: '058' },
    { id: 'b2', name: 'Michael Adeyemi', bank_name: 'Zenith Bank', account_number: '2109876543', bank_code: '057' },
    { id: 'b3', name: 'Fatima Bello', bank_name: 'Access Bank', account_number: '0987123456', bank_code: '044' },
  ]
}

export function getTransactionCategories() {
  return ['all', 'transfer', 'airtime', 'data', 'bills', 'card', 'top-up']
}

export function detectNetwork(phone: string): string {
  const p = phone.replace(/\D/g, '')
  if (/^(0803|0806|0703|0706|0813|0816|0810|0814|0903|0906)/.test(p)) return 'MTN'
  if (/^(0802|0808|0708|0812|0701|0901|0902|0904|0907)/.test(p)) return 'Airtel'
  if (/^(0805|0807|0705|0815|0905|0811)/.test(p)) return 'Glo'
  if (/^(0809|0817|0818|0908|0909)/.test(p)) return '9mobile'
  return ''
}
