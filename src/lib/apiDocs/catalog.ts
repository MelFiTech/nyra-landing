import type { DocEndpoint, DocGroup } from './types'
import { DOC_WEBHOOK_EVENT_SAMPLES } from './webhookSamples'

export const DOC_GROUPS: DocGroup[] = [
  { id: 'customers', label: 'Customers' },
  { id: 'transfers', label: 'Transfers' },
  { id: 'verification', label: 'Verification' },
  { id: 'bills', label: 'Bill payments' },
  { id: 'virtual-cards', label: 'Virtual cards' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'webhooks', label: 'Webhooks' },
]

export const DOC_ENDPOINTS: DocEndpoint[] = [
  {
    id: 'create-customer-wallet',
    group: 'customers',
    title: 'Create customer wallet',
    method: 'POST',
    path: '/business/wallets',
    description:
      'Provision a managed NGN wallet and virtual account for an end customer. Collect payments into your business float and reuse the same customer record for virtual cards. Pass the returned wallet_id when issuing cards.',
    params: [
      { name: 'first_name', location: 'body', type: 'string', required: true, description: 'Customer first name.' },
      { name: 'last_name', location: 'body', type: 'string', required: true, description: 'Customer last name.' },
      { name: 'email', location: 'body', type: 'string', required: true, description: 'Customer email.' },
      { name: 'phone_number', location: 'body', type: 'string', required: true, description: 'Nigerian phone (E.164).' },
      { name: 'bvn', location: 'body', type: 'string', required: true, description: '11-digit BVN.', example: '22222222222' },
      { name: 'dob', location: 'body', type: 'string', required: true, description: 'ISO date of birth.', example: '1990-01-15' },
      { name: 'gender', location: 'body', type: 'string', required: true, description: 'Gender on BVN record.' },
      { name: 'title', location: 'body', type: 'string', required: true, description: 'Mr, Mrs, Ms, etc.' },
      { name: 'address_line_1', location: 'body', type: 'string', required: true, description: 'Street address.' },
      { name: 'city', location: 'body', type: 'string', required: true, description: 'City.' },
      { name: 'state', location: 'body', type: 'string', required: true, description: 'State (required for virtual card issuance).', example: 'Lagos' },
      { name: 'country', location: 'body', type: 'string', required: true, description: 'Country code.', defaultValue: 'NG' },
    ],
    responses: [
      {
        status: 200,
        label: 'Success',
        body: `{
  "success": true,
  "message": "Wallet created successfully",
  "data": {
    "wallet_id": "WLT-…",
    "account_number": "0123456789",
    "owners_fullname": "Jane Doe",
    "bank_name": "…"
  }
}`,
      },
    ],
  },
  {
    id: 'list-customer-wallets',
    group: 'customers',
    title: 'List customer wallets',
    method: 'GET',
    path: '/business/wallets/all',
    description: 'Returns all managed customer wallets for your business.',
    responses: [
      {
        status: 200,
        label: 'Success',
        body: `{
  "success": true,
  "message": "Sub wallets fetched successfully",
  "data": [{ "wallet_id": "…", "account_number": "…", "bank_name": "…" }]
}`,
      },
    ],
  },
  {
    id: 'create-static-collection-account',
    group: 'customers',
    title: 'Create Static account',
    method: 'POST',
    path: '/business/wallets/static-virtual-accounts',
    description:
      'Create a Static (reusable) virtual account for customer pay-ins. The same account number can receive multiple payments. Subscribe to `managed_wallet.temporary_account_funded` (and optionally `managed_wallet.funded`) for pay-in notifications.',
    params: [
      { name: 'external_reference', location: 'body', type: 'string', required: true, description: 'Your unique reference for this account.' },
      { name: 'amount', location: 'body', type: 'number', required: false, description: 'Optional expected amount (minimum 300 NGN if set).' },
      { name: 'expiresIn', location: 'body', type: 'number', required: false, description: 'Optional TTL in seconds.' },
      { name: 'meta.bvn', location: 'body', type: 'string', required: false, description: 'End-user BVN when required for the account.' },
      { name: 'meta.palmpay.customerName', location: 'body', type: 'string', required: false, description: 'Display name on the virtual account.' },
      { name: 'meta.flutterwave.email', location: 'body', type: 'string', required: false, description: 'Customer email (meta.flutterwave block).' },
      { name: 'meta.flutterwave.firstname', location: 'body', type: 'string', required: false, description: 'Customer first name.' },
      { name: 'meta.flutterwave.lastname', location: 'body', type: 'string', required: false, description: 'Customer last name.' },
    ],
    responses: [
      {
        status: 200,
        label: 'Success',
        body: `{
  "success": true,
  "message": "Static virtual account created successfully",
  "data": {
    "id": "01JZX23BB1GX4RR8CZDCG26T1G",
    "business": "biz_8f3c2a1b9d4e",
    "account_number": "0123456789",
    "account_name": "ACME/JOHN DOE",
    "bank_name": "…",
    "bank_code": "…",
    "amount": 0,
    "external_reference": "cust-001-static",
    "account_kind": "static",
    "funding_account_kind": "static",
    "status": "pending",
    "expiresIn": 900,
    "expiry_date": "2026-07-22T11:00:00.000Z",
    "created_at": "2026-07-22T10:00:00.000Z",
    "meta": {}
  }
}`,
      },
    ],
  },
  {
    id: 'create-dynamic-collection-account',
    group: 'customers',
    title: 'Create Dynamic account',
    method: 'POST',
    path: '/business/wallets/single-use-virtual-accounts',
    description:
      'Create a Dynamic (single-use) virtual account for one payment at a fixed amount. The customer must pay the exact amount. Subscribe to `managed_wallet.temporary_account_funded` for pay-in notifications. Optionally poll GET /business/wallets/single-use-virtual-accounts/{id} using `data.id` from this response, or call the transfer status route with `sessionId` from the webhook payload.',
    params: [
      { name: 'external_reference', location: 'body', type: 'string', required: true, description: 'Your unique reference for this payment.' },
      { name: 'amount', location: 'body', type: 'number', required: true, description: 'Expected payment amount in NGN (minimum 300).' },
      { name: 'expiresIn', location: 'body', type: 'number', required: false, description: 'Optional TTL in seconds before the account expires unpaid.' },
      { name: 'meta.bvn', location: 'body', type: 'string', required: false, description: 'End-user BVN when required for the account.' },
      { name: 'meta.customer_name', location: 'body', type: 'string', required: false, description: 'Customer display name.' },
      { name: 'meta.customer_email', location: 'body', type: 'string', required: false, description: 'Customer email.' },
    ],
    responses: [
      {
        status: 200,
        label: 'Success',
        body: `{
  "success": true,
  "message": "Single-use virtual account created successfully",
  "data": {
    "id": "01JZX24CC2HY5SS9DZEDH37U2H",
    "business": "biz_8f3c2a1b9d4e",
    "account_number": "9876543210",
    "account_name": "ACME/PAYMENT",
    "amount": 5000,
    "bank_name": "…",
    "bank_code": "…",
    "external_reference": "order-8821",
    "account_kind": "single_use",
    "funding_account_kind": "dynamic",
    "status": "pending",
    "expiresIn": 3600,
    "expiry_date": "2026-07-22T11:00:00.000Z",
    "created_at": "2026-07-22T10:00:00.000Z",
    "meta": {}
  }
}`,
      },
    ],
  },
  {
    id: 'get-dynamic-collection-account',
    group: 'customers',
    title: 'Get Dynamic account',
    method: 'GET',
    path: '/business/wallets/single-use-virtual-accounts/{id}',
    description:
      'Fetch a Dynamic account by `id` from the create response. Use this to poll `status` (`pending` until paid, then `successful`) if you are not using webhooks.',
    params: [
      { name: 'id', location: 'path', type: 'string', required: true, description: 'Virtual account id from Create Dynamic account (`data.id`).' },
    ],
    responses: [
      {
        status: 200,
        label: 'Success',
        body: `{
  "success": true,
  "message": "Single-use virtual account fetched successfully",
  "data": {
    "id": "01JZX24CC2HY5SS9DZEDH37U2H",
    "account_number": "9876543210",
    "amount": 5000,
    "status": "pending",
    "external_reference": "order-8821",
    "account_kind": "single_use",
    "funding_account_kind": "dynamic"
  }
}`,
      },
    ],
  },
  {
    id: 'dynamic-collection-status',
    group: 'customers',
    title: 'Dynamic transfer status',
    method: 'GET',
    path: '/business/wallets/single-use-virtual-accounts/{sessionId}/status',
    description:
      'Detailed transfer status for a Dynamic pay-in. Pass `sessionId` from the `managed_wallet.temporary_account_funded` webhook `data.sessionId`. For lightweight polling before the webhook, use Get Dynamic account with `data.id` instead.',
    params: [
      { name: 'sessionId', location: 'path', type: 'string', required: true, description: 'Session id from webhook `data.sessionId`.' },
    ],
    responses: [
      {
        status: 200,
        label: 'Success',
        body: `{
  "success": true,
  "message": "Completed successfully",
  "data": {
    "id": "sess_a1b2c3d4e5f6",
    "business": "biz_8f3c2a1b9d4e",
    "credit_account_number": "9876543210",
    "credit_account_name": "ACME/PAYMENT",
    "amount_paid": 5000,
    "external_reference": "order-8821",
    "currency": "NGN",
    "provider": "NYRA WALLET",
    "narration": "Payment for order #8821",
    "paid_at": "2026-07-22T15:12:44.000Z",
    "sender_bank": "…",
    "sender_name": "CHIDI NWANKWO",
    "sender_account_number": "0011223344",
    "status": "successful",
    "virtualAccount": {
      "id": "01JZX24CC2HY5SS9DZEDH37U2H",
      "account_number": "9876543210",
      "status": "successful",
      "account_kind": "single_use",
      "funding_account_kind": "dynamic"
    }
  }
}`,
      },
    ],
  },
  {
    id: 'get-static-collection-account',
    group: 'customers',
    title: 'Get Static account',
    method: 'GET',
    path: '/business/wallets/static-virtual-accounts/{id}',
    description: 'Fetch a Static account by `id` from the create response.',
    params: [
      { name: 'id', location: 'path', type: 'string', required: true, description: 'Virtual account id from Create Static account (`data.id`).' },
    ],
    responses: [
      {
        status: 200,
        label: 'Success',
        body: `{
  "success": true,
  "message": "Static virtual account fetched successfully",
  "data": {
    "id": "01JZX23BB1GX4RR8CZDCG26T1G",
    "account_number": "0123456789",
    "status": "pending",
    "account_kind": "static",
    "funding_account_kind": "static",
    "external_reference": "cust-001-static"
  }
}`,
      },
    ],
  },
  {
    id: 'static-collection-status',
    group: 'customers',
    title: 'Static transfer status',
    method: 'GET',
    path: '/business/wallets/static-virtual-accounts/{sessionId}/status',
    description:
      'Detailed transfer status for a Static pay-in. Pass `sessionId` from the `managed_wallet.temporary_account_funded` webhook `data.sessionId`.',
    params: [
      { name: 'sessionId', location: 'path', type: 'string', required: true, description: 'Session id from webhook `data.sessionId`.' },
    ],
    responses: [
      {
        status: 200,
        label: 'Success',
        body: `{
  "success": true,
  "message": "Completed successfully",
  "data": {
    "id": "sess_a1b2c3d4e5f6",
    "amount_paid": 10000,
    "status": "successful",
    "external_reference": "cust-001-static",
    "currency": "NGN",
    "provider": "NYRA WALLET"
  }
}`,
      },
    ],
  },
  {
    id: 'float-wallets',
    group: 'customers',
    title: 'List float wallets',
    method: 'GET',
    path: '/business/wallets/float',
    description: 'Business treasury float accounts used for payouts and collections.',
    responses: [
      {
        status: 200,
        label: 'Success',
        body: `{
  "success": true,
  "message": "Business float wallets fetched successfully",
  "data": [{ "wallet_id": "…", "account_number": "…", "is_business_float": true, "bank_name": "…" }]
}`,
      },
    ],
  },
  {
    id: 'wallet-balance',
    group: 'customers',
    title: 'Wallet balance',
    method: 'GET',
    path: '/business/wallets/wallet_balance',
    description:
      'Returns balances for your business parent wallet. `balance` is the total (available plus unsettled). Use `available_balance` as spendable funds for transfers and payouts. We apply T+1 settlement to inbound credits from customer collection (virtual) accounts: those amounts sit in `unsettled_balance` until the next weekday settlement run (default 09:00 Africa/Lagos) when `settlement_enabled` is true for your business.',
    responses: [
      {
        status: 200,
        label: 'Success',
        body: `{
  "success": true,
  "message": "Wallet balance fetched successfully",
  "data": {
    "businessId": "biz_8f3c2a1b9d4e",
    "businessName": "Acme Stores Ltd",
    "balance": 1250000.5,
    "available_balance": 850000.5,
    "unsettled_balance": 400000,
    "settlement_enabled": true
  }
}`,
      },
    ],
  },
  {
    id: 'list-banks',
    group: 'transfers',
    title: 'List banks',
    method: 'GET',
    path: '/business/transfers/bank/list',
    description:
      'Returns Nigerian banks and their codes. Use `bank_code` from this list for name enquiry and transfers.',
    showcase: {
      kind: 'bank-list',
      intro:
        'This endpoint has no parameters. Authenticate with your API client and call GET to retrieve the current Nigerian bank directory.',
    },
    responses: [
      {
        status: 200,
        label: 'Success',
        body: `{
  "success": true,
  "message": "Banks listed successfully",
  "data": [
    {
      "bank_code": "044",
      "bank_name": "Access Bank",
      "bank_long_code": "000014",
      "logo_url": "https://…"
    },
    {
      "bank_code": "058",
      "bank_name": "Guaranty Trust Bank",
      "bank_long_code": "000013",
      "logo_url": "https://…"
    }
  ]
}`,
      },
    ],
  },
  {
    id: 'resolve-account',
    group: 'transfers',
    title: 'Resolve account',
    method: 'POST',
    path: '/business/transfers/name-enquiry',
    description:
      'Confirm the account holder name for a bank account before you send money. Pass `account_number` and `bank_code` as query parameters.',
    params: [
      {
        name: 'account_number',
        location: 'query',
        type: 'string',
        required: true,
        description: '10-digit NUBAN account number.',
        example: '0123456789',
      },
      {
        name: 'bank_code',
        location: 'query',
        type: 'string',
        required: true,
        description: 'Bank code from List banks.',
        example: '044',
      },
    ],
    responses: [
      {
        status: 200,
        label: 'Success',
        body: `{
  "success": true,
  "message": "Name enquiry successful",
  "data": {
    "account": {
      "number": "0123456789",
      "name": "CHIDI NWANKWO"
    },
    "sessionId": "sess_enq_7f3a9c2e",
    "bank_name": "Access Bank"
  }
}`,
      },
      {
        status: 404,
        label: 'Not found',
        body: `{
  "success": false,
  "message": "Account not found"
}`,
      },
    ],
  },
  {
    id: 'create-transfer',
    group: 'transfers',
    title: 'Initiate transfer',
    method: 'POST',
    path: '/business/transfers',
    description:
      'Send NGN from your business float to a Nigerian bank account. The float is inferred from your API credentials; include source_account_number only if you have more than one active float. Call Resolve account first, then pass beneficiary.account_number, beneficiary.bank_code, and beneficiary.account_name from that response.',
    params: [
      {
        name: 'amount',
        location: 'body',
        type: 'number',
        required: true,
        description: 'Amount in NGN (minimum 100).',
        example: '5000',
      },
      {
        name: 'description',
        location: 'body',
        type: 'string',
        required: false,
        description: 'Transfer narration shown on the statement.',
        example: 'Vendor payout #8821',
      },
      {
        name: 'sender_name',
        location: 'body',
        type: 'string',
        required: false,
        description: 'Overrides sender name on the transfer. Defaults to your business alias when omitted.',
      },
      {
        name: 'client_request_id',
        location: 'body',
        type: 'string',
        required: false,
        description: 'Your idempotency key; echoed on transfer webhooks when provided.',
        example: 'payout-order-8821',
      },
      {
        name: 'source_account_number',
        location: 'body',
        type: 'string',
        required: false,
        description:
          'Optional. Only required when your business has multiple active float accounts. Otherwise Nyra debits the float tied to your API client.',
        example: '5566778899',
      },
      {
        name: 'beneficiary.account_number',
        location: 'body',
        type: 'string',
        required: true,
        description: 'Destination account number (same as used in name enquiry).',
        example: '0987654321',
      },
      {
        name: 'beneficiary.bank_code',
        location: 'body',
        type: 'string',
        required: true,
        description: 'Destination bank code from List banks.',
        example: '058',
      },
      {
        name: 'beneficiary.account_name',
        location: 'body',
        type: 'string',
        required: true,
        description:
          'Required. Beneficiary name on the transfer. Use data.account.name from Resolve account (same account_number and bank_code).',
        example: 'VENDOR LTD',
      },
    ],
    responses: [
      {
        status: 201,
        label: 'Created',
        body: `{
  "success": true,
  "message": "Transfer initiated successfully",
  "data": {
    "transaction_id": "txn_01j6e076enk8",
    "transaction_reference": "TRF-20260722-DEF456",
    "transaction_status": "successful",
    "amount": 5000,
    "charge": 50,
    "transaction_type": "DEBIT",
    "description": "Vendor payout #8821"
  }
}`,
      },
      {
        status: 400,
        label: 'Bad request',
        body: `{
  "success": false,
  "message": "Insufficient balance"
}`,
      },
    ],
  },
  {
    id: 'verify-bvn',
    group: 'verification',
    title: 'Verify BVN (basic)',
    method: 'POST',
    path: '/business/identities/bvn',
    description:
      'Basic BVN lookup (name, date of birth, and phone). Billed per successful check; debits your business float.',
    params: [
      {
        name: 'bvn',
        location: 'query',
        type: 'string',
        required: true,
        description: '11-digit BVN.',
        example: '22345678901',
      },
    ],
    responses: [
      {
        status: 200,
        label: 'Success',
        body: `{
  "success": true,
  "message": "BVN verification complete",
  "data": {
    "first_name": "Ada",
    "last_name": "Okonkwo",
    "middle_name": "Chinelo",
    "date_of_birth": "1992-04-18",
    "phone_number": "08031234567"
  }
}`,
      },
    ],
  },
  {
    id: 'verify-bvn-advance',
    group: 'verification',
    title: 'Verify BVN (advanced)',
    method: 'POST',
    path: '/business/identities/bvn/advance',
    description:
      'Extended BVN record including address, enrollment bank, marital status, and portrait image. Higher fee than basic; debits your business float.',
    params: [
      {
        name: 'bvn',
        location: 'query',
        type: 'string',
        required: true,
        description: '11-digit BVN.',
        example: '22345678901',
      },
    ],
    responses: [
      {
        status: 200,
        label: 'Success',
        body: `{
  "success": true,
  "message": "BVN verification complete",
  "data": {
    "first_name": "Ada",
    "last_name": "Okonkwo",
    "middle_name": "Chinelo",
    "gender": "Female",
    "date_of_birth": "1992-04-18",
    "phone_number1": "08031234567",
    "phone_number2": "08129876543",
    "email": "ada.okonkwo@example.com",
    "enrollment_bank": "058",
    "enrollment_branch": "Victoria Island",
    "level_of_account": "Level 2",
    "lga_of_origin": "Onitsha North",
    "lga_of_residence": "Eti-Osa",
    "marital_status": "Single",
    "name_on_card": "ADA CHINELO OKONKWO",
    "nationality": "Nigerian",
    "registration_date": "2014-06-12",
    "residential_address": "14 Admiralty Way, Lekki Phase 1, Lagos",
    "state_of_origin": "Anambra",
    "state_of_residence": "Lagos",
    "title": "Miss",
    "watch_listed": "NO",
    "base64_image": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAGfAP/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAQUCf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQMBAT8Bf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQIBAT8Bf//Z"
  }
}`,
      },
    ],
  },
  {
    id: 'verify-nin',
    group: 'verification',
    title: 'Verify NIN',
    method: 'GET',
    path: '/business/identities/nin',
    description:
      'Look up an end-user by National Identification Number. Billed per successful check; debits your business float.',
    params: [
      {
        name: 'nin',
        location: 'query',
        type: 'string',
        required: true,
        description: '11-digit NIN.',
        example: '12345678901',
      },
    ],
    responses: [
      {
        status: 200,
        label: 'Success',
        body: `{
  "success": true,
  "message": "NIN verification complete",
  "data": {
    "first_name": "Chidi",
    "last_name": "Nwankwo",
    "middle_name": "Emeka",
    "gender": "Male",
    "date_of_birth": "1988-11-02",
    "phone_number": "08123456789",
    "email": "chidi.nwankwo@example.com",
    "employment_status": "Employed",
    "marital_status": "Single",
    "photo": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAGfAP/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAQUCf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQMBAT8Bf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQIBAT8Bf//Z"
  }
}`,
      },
    ],
  },
  {
    id: 'vas-services',
    group: 'bills',
    title: 'List VAS services',
    method: 'GET',
    path: '/business/vas/services',
    description: 'Bill payment categories (airtime, data, electricity, TV, etc.).',
    responses: [
      {
        status: 200,
        label: 'Success',
        body: `{
  "success": true,
  "message": "Services retrieved successfully",
  "data": [{ "id": "…", "name": "Airtime" }]
}`,
      },
    ],
  },
  {
    id: 'vas-billers',
    group: 'bills',
    title: 'List service billers',
    method: 'GET',
    path: '/business/vas/{service_id}/billers',
    description: 'Billers for a VAS service UUID from list services.',
    params: [
      { name: 'service_id', location: 'path', type: 'string', required: true, description: 'VAS service UUID.' },
    ],
    responses: [
      {
        status: 200,
        label: 'Success',
        body: `{
  "success": true,
  "message": "Service billers retrieved successfully",
  "data": [{ "id": "…", "name": "…" }]
}`,
      },
    ],
  },
  {
    id: 'vas-data-plans',
    group: 'bills',
    title: 'List data plans',
    method: 'GET',
    path: '/business/vas/data-plans',
    description: 'Data bundles for a mobile network.',
    params: [
      {
        name: 'network',
        location: 'query',
        type: 'string',
        required: true,
        description: 'Mobile network.',
        enum: ['AIRTEL', 'MTN', 'GLO', '9MOBILE'],
      },
    ],
    responses: [
      {
        status: 200,
        label: 'Success',
        body: `{
  "success": true,
  "message": "Data plans retrieved successfully",
  "data": [{ "bundle_id": "…", "amount": 1000 }]
}`,
      },
    ],
  },
  {
    id: 'vas-airtime-purchase',
    group: 'bills',
    title: 'Purchase airtime',
    method: 'POST',
    path: '/business/vas/airtime/purchase',
    description: 'Debit business float and deliver airtime to a phone number.',
    params: [
      { name: 'network', location: 'body', type: 'string', required: true, description: 'Mobile network.', enum: ['AIRTEL', 'MTN', 'GLO', '9MOBILE'] },
      { name: 'phone_number', location: 'body', type: 'string', required: true, description: 'Nigerian mobile number.' },
      { name: 'amount', location: 'body', type: 'number', required: true, description: 'Amount in NGN (min 100).', example: '1000' },
    ],
    responses: [
      {
        status: 201,
        label: 'Created',
        body: `{
  "success": true,
  "message": "Airtime purchase successful",
  "data": { "reference": "…", "amount": 1000, "status": "delivered" }
}`,
      },
    ],
  },
  {
    id: 'vas-data-purchase',
    group: 'bills',
    title: 'Purchase data',
    method: 'POST',
    path: '/business/vas/data/purchase',
    description: 'Debit business float and deliver a data bundle.',
    params: [
      { name: 'phone_number', location: 'body', type: 'string', required: true, description: 'Nigerian mobile number.' },
      { name: 'bundle_id', location: 'body', type: 'string', required: true, description: 'Bundle ID from list data plans.' },
      { name: 'amount', location: 'body', type: 'number', required: true, description: 'Amount in NGN (min 100).' },
    ],
    responses: [
      {
        status: 201,
        label: 'Created',
        body: `{
  "success": true,
  "message": "Data purchase successful",
  "data": { "reference": "…", "amount": 1000, "status": "delivered" }
}`,
      },
    ],
  },
  {
    id: 'vas-electricity-validate',
    group: 'bills',
    title: 'Validate electricity meter',
    method: 'POST',
    path: '/business/vas/electricity/validate',
    description: 'Validate meter number before payment.',
    params: [
      { name: 'package_id', location: 'body', type: 'string', required: true, description: 'Disco / package ID from electricity items.' },
      { name: 'meter_number', location: 'body', type: 'string', required: true, description: 'Customer meter number (10+ digits).' },
    ],
    responses: [
      {
        status: 200,
        label: 'Success',
        body: `{
  "success": true,
  "message": "Electricity data validated successfully",
  "data": { "customer_name": "…", "meter_number": "…" }
}`,
      },
    ],
  },
  {
    id: 'vas-electricity-items',
    group: 'bills',
    title: 'List electricity providers',
    method: 'GET',
    path: '/business/vas/electricity/items',
    description: 'Electricity discos and package IDs for validate and pay.',
    params: [
      { name: 'biller_id', location: 'query', type: 'string', required: true, description: 'Electricity biller id from list service billers.' },
    ],
    responses: [
      {
        status: 200,
        label: 'Success',
        body: `{
  "success": true,
  "message": "Electricity provider items retrieved successfully",
  "data": [{ "package_id": "…", "name": "…" }]
}`,
      },
    ],
  },
  {
    id: 'vas-electricity-pay',
    group: 'bills',
    title: 'Pay electricity bill',
    method: 'POST',
    path: '/business/vas/electricity/pay',
    description: 'Purchase prepaid or postpaid electricity. Token may arrive via webhook when pending.',
    params: [
      { name: 'meter_number', location: 'body', type: 'string', required: true, description: 'Validated meter number.' },
      { name: 'package_id', location: 'body', type: 'string', required: true, description: 'Disco package ID.' },
      { name: 'amount', location: 'body', type: 'number', required: true, description: 'Amount in NGN (min 100).' },
    ],
    responses: [
      {
        status: 201,
        label: 'Created',
        body: `{
  "success": true,
  "message": "Electricity payment successful",
  "data": { "reference": "…", "amount": 5000, "status": "delivered" }
}`,
      },
    ],
  },
  {
    id: 'vas-tv-validate',
    group: 'bills',
    title: 'Validate TV smart card',
    method: 'POST',
    path: '/business/vas/tv/validate',
    description: 'Validate cable TV smart card before subscription payment.',
    params: [
      { name: 'smart_card_number', location: 'body', type: 'string', required: true, description: 'Decoder smart card number.' },
      { name: 'package_id', location: 'body', type: 'string', required: true, description: 'Bouquet / package ID.' },
    ],
    responses: [
      {
        status: 200,
        label: 'Success',
        body: `{
  "success": true,
  "message": "TV data validated successfully",
  "data": { "customer_name": "…" }
}`,
      },
    ],
  },
  {
    id: 'vas-tv-items',
    group: 'bills',
    title: 'List TV bouquets',
    method: 'GET',
    path: '/business/vas/tv/items',
    description: 'TV subscription packages for a biller.',
    params: [
      { name: 'biller_id', location: 'query', type: 'string', required: true, description: 'TV biller ID.' },
    ],
    responses: [
      {
        status: 200,
        label: 'Success',
        body: `{
  "success": true,
  "message": "TV provider items retrieved successfully",
  "data": [{ "package_id": "…", "name": "…", "amount": 2500 }]
}`,
      },
    ],
  },
  {
    id: 'vas-tv-pay',
    group: 'bills',
    title: 'Pay TV subscription',
    method: 'POST',
    path: '/business/vas/tv/pay',
    description: 'Renew cable TV subscription from business float.',
    params: [
      { name: 'smart_card_number', location: 'body', type: 'string', required: true, description: 'Validated smart card number.' },
      { name: 'package_id', location: 'body', type: 'string', required: true, description: 'Bouquet package ID.' },
      { name: 'amount', location: 'body', type: 'number', required: true, description: 'Amount in NGN (min 100).' },
    ],
    responses: [
      {
        status: 201,
        label: 'Created',
        body: `{
  "success": true,
  "message": "TV payment successful",
  "data": { "reference": "…", "amount": 2500, "status": "delivered" }
}`,
      },
    ],
  },
  {
    id: 'virtual-cards-fees',
    group: 'virtual-cards',
    title: 'Card fees',
    method: 'GET',
    path: '/business/cards/fees',
    description:
      'Returns issuance, funding, and withdrawal fee settings for your business virtual card program. card_creation is a flat USD fee. card_funding_cost_percentage uses below100 and above100 tiers based on the card balance after the operation. Amounts are in USD unless noted.',
    responses: [
      {
        status: 200,
        label: 'Success',
        body: `{
  "success": true,
  "message": "Business card fees retrieved",
  "data": {
    "card_creation": 1.2,
    "card_funding_cost_percentage": {
      "below100": 0.015,
      "above100": 0.01
    },
    "card_funds_withdrawal_cost_percentage": 0.05
  }
}`,
      },
    ],
  },
  {
    id: 'virtual-cards-cost-preview',
    group: 'virtual-cards',
    title: 'Cost preview',
    method: 'GET',
    path: '/business/cards/cost-preview',
    description:
      'Estimate total USD debited from your card-program balance before issuing or funding a card. Supported types: card_creation and card_funding. Pass type and amount as query parameters.',
    params: [
      {
        name: 'type',
        location: 'query',
        type: 'string',
        required: true,
        description: 'Operation type.',
        enum: ['card_creation', 'card_funding'],
      },
      {
        name: 'amount',
        location: 'query',
        type: 'number',
        required: true,
        description: 'USD amount for the card load preview (integer 0-10 for issuance initial load).',
        example: '5',
      },
    ],
    responses: [
      {
        status: 200,
        label: 'Success',
        body: `{
  "success": true,
  "message": "Business card cost preview retrieved",
  "data": {
    "usd_total": 6.2,
    "naira_total": 9850.0,
    "breakdown": {
      "usd_funding_amount": 5,
      "usd_card_issuance_fee": 1.2,
      "naira_funding_amount": 7935.48,
      "naira_card_issuance_fee": 1914.52,
      "exchange_rate": {
        "usd_per_naira": 0.000629,
        "naira_per_usd": 1589.83
      }
    }
  }
}`,
      },
    ],
  },
  {
    id: 'virtual-cards-wallet-readiness',
    group: 'virtual-cards',
    title: 'Check customer card readiness',
    method: 'GET',
    path: '/business/cards/wallet-customers/{walletId}/readiness',
    description:
      'Check whether an existing NGN wallet customer (from POST /business/wallets) has enough stored profile data on file. Use this to preview what Nyra already has; you still send state, id_type, and id_number on every issue request.',
    params: [
      {
        name: 'walletId',
        location: 'path',
        type: 'string',
        required: true,
        description: 'Wallet customer ID from POST /business/wallets (wallet_id in the response).',
      },
    ],
    responses: [
      {
        status: 200,
        label: 'Success',
        body: `{
  "success": true,
  "message": "Customer card readiness retrieved",
  "data": {
    "ready": false,
    "missing": ["state", "id_number"],
    "has_card_customer": false
  }
}`,
      },
    ],
  },
  {
    id: 'virtual-cards-issue-wallet',
    group: 'virtual-cards',
    title: 'Issue virtual card (wallet customer)',
    method: 'POST',
    path: '/business/cards/wallet-customers/{walletId}/cards',
    description:
      'Recommended issuance flow. Pass the wallet customer ID from POST /business/wallets. Always include state, id_type, and id_number in the request body. Nyra uses stored KYC when already on file and may ignore duplicate values you send.',
    params: [
      {
        name: 'walletId',
        location: 'path',
        type: 'string',
        required: true,
        description: 'Wallet customer ID from POST /business/wallets.',
      },
      { name: 'currency', location: 'body', type: 'string', required: true, description: 'Must be USD.', enum: ['USD'], defaultValue: 'USD' },
      { name: 'amount', location: 'body', type: 'number', required: true, description: 'Initial USD load for the card (integer 0-10).', example: '5' },
      { name: 'type', location: 'body', type: 'string', required: true, description: 'Card network.', enum: ['VISA', 'MASTERCARD'], example: 'VISA' },
      { name: 'description', location: 'body', type: 'string', required: true, description: 'Internal note for the issuance.', example: 'Virtual card for Ada Okonkwo' },
      { name: 'discount', location: 'body', type: 'number', required: false, description: 'Optional issuance fee discount (0-1).' },
      { name: 'state', location: 'body', type: 'string', required: true, description: 'Customer state. Nyra prefers stored value when already on file.' },
      { name: 'id_type', location: 'body', type: 'string', required: true, description: 'Identity type (bvn or nin). Nyra prefers stored value when already on file.', enum: ['bvn', 'nin'] },
      { name: 'id_number', location: 'body', type: 'string', required: true, description: '11-digit BVN or NIN. Nyra prefers stored value when already on file.' },
    ],
    responses: [
      {
        status: 201,
        label: 'Created',
        body: `{
  "success": true,
  "message": "Card issued to customer successfully",
  "data": {
    "id": "VC-01ABC…",
    "masked_number": "411111 **** **** 4242",
    "owners_fullname": "Ada Okonkwo",
    "network": "VISA",
    "is_frozen": false,
    "wallet_customer_id": "MW-…"
  }
}`,
      },
    ],
  },
  {
    id: 'virtual-cards-create-customer',
    group: 'virtual-cards',
    title: 'Register card customer (standalone)',
    method: 'POST',
    path: '/business/cards/customers',
    description:
      'Legacy or standalone registration when you do not have an NGN wallet customer. Prefer POST /business/wallets plus POST /business/cards/wallet-customers/{walletId}/cards so Nyra reuses stored customer data instead of maintaining a separate card-only profile.',
    params: [
      { name: 'customer_reference', location: 'body', type: 'string', required: true, description: 'Your stable ID for this customer.', example: 'cust_001' },
      { name: 'first_name', location: 'body', type: 'string', required: true, description: 'Customer first name.', example: 'Ada' },
      { name: 'last_name', location: 'body', type: 'string', required: true, description: 'Customer last name.', example: 'Okonkwo' },
      { name: 'email', location: 'body', type: 'string', required: true, description: 'Customer email.', example: 'ada@example.com' },
      { name: 'phone_country_code', location: 'body', type: 'string', required: false, description: 'E.164 country code.', defaultValue: '+234' },
      { name: 'phone_number', location: 'body', type: 'string', required: true, description: 'Phone number without country code.', example: '8012345678' },
      { name: 'date_of_birth', location: 'body', type: 'string', required: true, description: 'Date of birth (YYYY-MM-DD).', example: '1990-05-15' },
      { name: 'id_type', location: 'body', type: 'string', required: true, description: 'Identity type.', enum: ['bvn', 'nin'], example: 'bvn' },
      { name: 'id_number', location: 'body', type: 'string', required: true, description: 'BVN or NIN value matching id_type.', example: '22222222222' },
      { name: 'address.line1', location: 'body', type: 'string', required: true, description: 'Street address.', example: '12 Admiralty Way' },
      { name: 'address.city', location: 'body', type: 'string', required: true, description: 'City.', example: 'Lagos' },
      { name: 'address.state', location: 'body', type: 'string', required: true, description: 'State.', example: 'Lagos' },
      { name: 'address.postal_code', location: 'body', type: 'string', required: false, description: 'Postal code.', defaultValue: '100001' },
      { name: 'address.country', location: 'body', type: 'string', required: false, description: 'Country code.', defaultValue: 'NGA' },
      { name: 'managed_wallet_id', location: 'body', type: 'string', required: false, description: 'Optional link to an existing NGN customer wallet.' },
    ],
    responses: [
      {
        status: 201,
        label: 'Created',
        body: `{
  "success": true,
  "message": "Card customer registered successfully",
  "data": {
    "wallet_customer_id": "MW-…",
    "customer_reference": "cust_001",
    "first_name": "Ada",
    "last_name": "Okonkwo",
    "email": "ada@example.com"
  }
}`,
      },
    ],
  },
  {
    id: 'virtual-cards-list-customers',
    group: 'virtual-cards',
    title: 'List card customers',
    method: 'GET',
    path: '/business/cards/customers',
    description:
      'Returns card customers enrolled for your business. Each record includes wallet_customer_id, which matches wallet_id from POST /business/wallets when the records are linked.',
    responses: [
      {
        status: 200,
        label: 'Success',
        body: `{
  "success": true,
  "message": "Card customers retrieved",
  "data": {
    "customers": [
      {
        "wallet_customer_id": "MW-…",
        "customer_reference": "cust_001",
        "first_name": "Ada",
        "last_name": "Okonkwo",
        "email": "ada@example.com"
      }
    ]
  }
}`,
      },
    ],
  },
  {
    id: 'virtual-cards-get-customer',
    group: 'virtual-cards',
    title: 'Get card customer',
    method: 'GET',
    path: '/business/cards/customers/{customerId}',
    description: 'Fetch a single card customer by wallet customer ID (from POST /business/wallets) or customer reference.',
    params: [
      { name: 'customerId', location: 'path', type: 'string', required: true, description: 'Wallet customer ID or your customer reference.' },
    ],
    responses: [
      {
        status: 200,
        label: 'Success',
        body: `{
  "success": true,
  "message": "Card customer retrieved",
  "data": {
    "wallet_customer_id": "MW-…",
    "customer_reference": "cust_001",
    "first_name": "Ada",
    "last_name": "Okonkwo"
  }
}`,
      },
    ],
  },
  {
    id: 'virtual-cards-issue',
    group: 'virtual-cards',
    title: 'Issue virtual card (by customer key)',
    method: 'POST',
    path: '/business/cards/customers/{customerId}/cards',
    description:
      'Alternate issuance path using wallet_customer_id (wallet_id), customer reference, or legacy card customer key. Always include state, id_type, and id_number. Prefer POST /business/cards/wallet-customers/{walletId}/cards when you already have the wallet_id from POST /business/wallets.',
    params: [
      { name: 'customerId', location: 'path', type: 'string', required: true, description: 'Wallet customer ID (wallet_id) or customer reference.' },
      { name: 'currency', location: 'body', type: 'string', required: true, description: 'Must be USD.', enum: ['USD'], defaultValue: 'USD' },
      { name: 'amount', location: 'body', type: 'number', required: true, description: 'Initial USD load for the card (integer 0-10).', example: '5' },
      { name: 'type', location: 'body', type: 'string', required: true, description: 'Card network.', enum: ['VISA', 'MASTERCARD'], example: 'VISA' },
      { name: 'description', location: 'body', type: 'string', required: true, description: 'Internal note for the issuance.', example: 'Virtual card for Ada Okonkwo' },
      { name: 'discount', location: 'body', type: 'number', required: false, description: 'Optional issuance fee discount (0-1).' },
      { name: 'state', location: 'body', type: 'string', required: true, description: 'Customer state. Nyra prefers stored value when already on file.' },
      { name: 'id_type', location: 'body', type: 'string', required: true, description: 'Identity type (bvn or nin). Nyra prefers stored value when already on file.', enum: ['bvn', 'nin'] },
      { name: 'id_number', location: 'body', type: 'string', required: true, description: '11-digit BVN or NIN. Nyra prefers stored value when already on file.' },
    ],
    responses: [
      {
        status: 201,
        label: 'Created',
        body: `{
  "success": true,
  "message": "Card issued to customer successfully",
  "data": {
    "id": "VC-01ABC…",
    "masked_number": "411111 **** **** 4242",
    "owners_fullname": "Ada Okonkwo",
    "network": "VISA",
    "is_frozen": false,
    "wallet_customer_id": "MW-…"
  }
}`,
      },
    ],
  },
  {
    id: 'virtual-cards-list',
    group: 'virtual-cards',
    title: 'List virtual cards',
    method: 'GET',
    path: '/business/cards',
    description: 'Returns all virtual cards issued under your business.',
    responses: [
      {
        status: 200,
        label: 'Success',
        body: `{
  "success": true,
  "message": "Business customer cards retrieved",
  "data": {
    "cards": [
      {
        "id": "VC-01ABC…",
        "masked_number": "411111 **** **** 4242",
        "owners_fullname": "Ada Okonkwo",
        "network": "VISA",
        "is_frozen": false,
        "wallet_customer_id": "MW-…"
      }
    ]
  }
}`,
      },
    ],
  },
  {
    id: 'virtual-cards-list-customer-cards',
    group: 'virtual-cards',
    title: 'List customer cards',
    method: 'GET',
    path: '/business/cards/customers/{customerId}/cards',
    description: 'Returns virtual cards issued to a specific wallet customer.',
    params: [
      { name: 'customerId', location: 'path', type: 'string', required: true, description: 'Wallet customer ID or customer reference.' },
    ],
    responses: [
      {
        status: 200,
        label: 'Success',
        body: `{
  "success": true,
  "message": "Customer cards retrieved",
  "data": {
    "cards": [{ "id": "VC-01ABC…", "masked_number": "411111 **** **** 4242", "network": "VISA" }]
  }
}`,
      },
    ],
  },
  {
    id: 'virtual-cards-details',
    group: 'virtual-cards',
    title: 'Get card details',
    method: 'POST',
    path: '/business/cards/details',
    description:
      'Returns full PAN, CVV, expiry, and live balance for a card. Business API client auth only — no wallet PIN required. Call only from your backend; never expose this route to end-user clients.',
    params: [
      { name: 'card_id', location: 'body', type: 'string', required: true, description: 'Virtual card ID from issue or list.' },
    ],
    responses: [
      {
        status: 200,
        label: 'Success',
        body: `{
  "success": true,
  "message": "Card details retrieved",
  "data": {
    "card_number": "4111111111114242",
    "cvv": "123",
    "expiry": "09/28",
    "balance": "25.00"
  }
}`,
      },
    ],
  },
  {
    id: 'virtual-cards-transactions',
    group: 'virtual-cards',
    title: 'List card transactions',
    method: 'GET',
    path: '/business/cards/transactions',
    description: 'Paginated spend and funding activity for a card in a given calendar month.',
    params: [
      { name: 'card_id', location: 'query', type: 'string', required: true, description: 'Virtual card ID.' },
      { name: 'page', location: 'query', type: 'number', required: true, description: 'Page number (1-based).', example: '1' },
      { name: 'monthYear', location: 'query', type: 'string', required: true, description: 'Month in YYYY-MM format.', example: '2026-08' },
      { name: 'page_size', location: 'query', type: 'number', required: false, description: 'Results per page.', defaultValue: '20' },
    ],
    responses: [
      {
        status: 200,
        label: 'Success',
        body: `{
  "success": true,
  "message": "Card transactions retrieved",
  "data": {
    "list": [
      {
        "transaction_type": "DEBIT",
        "transaction_status": "successful",
        "amount": 8.0,
        "currency": "USD",
        "description": "Authorization at MERCHANT",
        "transaction_reference": "TXN-01HXYZ…"
      }
    ],
    "page": 1,
    "page_size": 20,
    "total": 1
  }
}`,
      },
    ],
  },
  {
    id: 'virtual-cards-topup',
    group: 'virtual-cards',
    title: 'Fund virtual card',
    method: 'POST',
    path: '/business/cards/topup',
    description:
      'Move USD from your card-program balance onto a virtual card. Debits program balance plus funding fees.',
    params: [
      { name: 'card_id', location: 'body', type: 'string', required: true, description: 'Virtual card ID.' },
      { name: 'amount', location: 'body', type: 'number', required: true, description: 'USD amount to load (1-300).', example: '50' },
    ],
    responses: [
      {
        status: 200,
        label: 'Success',
        body: `{
  "success": true,
  "message": "Card funded successfully",
  "data": { "success": true }
}`,
      },
    ],
  },
  {
    id: 'virtual-cards-freeze',
    group: 'virtual-cards',
    title: 'Freeze card',
    method: 'POST',
    path: '/business/cards/freeze',
    description: 'Temporarily block new authorizations on a virtual card. Business API client auth only — no wallet PIN required.',
    params: [
      { name: 'card_id', location: 'body', type: 'string', required: true, description: 'Virtual card ID.' },
    ],
    responses: [
      {
        status: 200,
        label: 'Success',
        body: `{
  "success": true,
  "message": "Card frozen successfully",
  "data": { "success": true }
}`,
      },
    ],
  },
  {
    id: 'virtual-cards-unfreeze',
    group: 'virtual-cards',
    title: 'Unfreeze card',
    method: 'POST',
    path: '/business/cards/unfreeze',
    description: 'Re-enable a previously frozen virtual card. Business API client auth only — no wallet PIN required.',
    params: [
      { name: 'card_id', location: 'body', type: 'string', required: true, description: 'Virtual card ID.' },
    ],
    responses: [
      {
        status: 200,
        label: 'Success',
        body: `{
  "success": true,
  "message": "Card unfrozen successfully",
  "data": { "success": true }
}`,
      },
    ],
  },
  {
    id: 'virtual-cards-withdraw',
    group: 'virtual-cards',
    title: 'Withdraw from card',
    method: 'POST',
    path: '/business/cards/withdraw',
    description:
      'Move USD from a virtual card back to your card-program balance (minus withdrawal fees). Business API client auth only — no wallet PIN required.',
    params: [
      { name: 'card_id', location: 'body', type: 'string', required: true, description: 'Virtual card ID.' },
      { name: 'amount', location: 'body', type: 'number', required: true, description: 'USD amount to withdraw from the card (1-300).', example: '20' },
    ],
    responses: [
      {
        status: 200,
        label: 'Success',
        body: `{
  "success": true,
  "message": "Card withdrawal successful",
  "data": { "success": true }
}`,
      },
    ],
  },
  {
    id: 'crypto-list-assets',
    group: 'crypto',
    title: 'List supported assets',
    method: 'GET',
    path: '/business/crypto/assets',
    description:
      'Supported assets and networks available for your business. Customer deposit wallets and master float wallets currently support USDT, USDC, and BTC.',
    responses: [
      {
        status: 200,
        label: 'Success',
        body: `{
  "success": true,
  "message": "Supported crypto assets fetched successfully",
  "data": [
    {
      "asset": "USDT",
      "network": "TRC20",
      "label": "Tether USD",
      "networks": ["trc20", "erc20"],
      "default_network": "trc20"
    }
  ]
}`,
      },
    ],
  },
  {
    id: 'crypto-create-customer',
    group: 'crypto',
    title: 'Create crypto customer',
    method: 'POST',
    path: '/business/crypto/customers',
    description:
      'Register an end-user for crypto deposit addresses. Link to an existing NGN wallet customer with managed_wallet_id, or use customer_reference for grouping.',
    params: [
      {
        name: 'customer_reference',
        location: 'body',
        type: 'string',
        required: true,
        description: 'Your stable ID for this end-user.',
      },
      { name: 'first_name', location: 'body', type: 'string', required: true, description: 'First name.' },
      { name: 'last_name', location: 'body', type: 'string', required: true, description: 'Last name.' },
      { name: 'email', location: 'body', type: 'string', required: true, description: 'Email.' },
      {
        name: 'managed_wallet_id',
        location: 'body',
        type: 'string',
        required: false,
        description: 'Optional link to wallet_id from POST /business/wallets.',
      },
    ],
    responses: [
      {
        status: 201,
        label: 'Created',
        body: `{
  "success": true,
  "message": "Crypto customer created successfully",
  "data": {
    "customer_id": "BCC-…",
    "customer_reference": "user_123",
    "managed_wallet_id": "M-WAL-…"
  }
}`,
      },
    ],
  },
  {
    id: 'crypto-create-wallet',
    group: 'crypto',
    title: 'Issue crypto wallet',
    method: 'POST',
    path: '/business/crypto/customers/{customerId}/wallets',
    description:
      'Issue a unique on-chain deposit address for a crypto customer. Pass wallet_id from POST /business/wallets, customer_id, or customer_reference as customerId. Nyra may auto-provision the crypto customer from stored wallet KYC when linked.',
    params: [
      {
        name: 'customerId',
        location: 'path',
        type: 'string',
        required: true,
        description: 'Crypto customer_id, managed wallet_id, or customer_reference.',
      },
      {
        name: 'asset',
        location: 'body',
        type: 'string',
        required: true,
        description: 'Asset code: USDT, USDC, or BTC.',
        example: 'USDT',
      },
      {
        name: 'chain',
        location: 'body',
        type: 'string',
        required: false,
        description: 'Network slug when the asset supports multiple networks (for example trc20, erc20).',
        example: 'trc20',
      },
      {
        name: 'offramp',
        location: 'body',
        type: 'boolean',
        required: false,
        description: 'Enable off-ramp where supported.',
      },
    ],
    responses: [
      {
        status: 201,
        label: 'Created',
        body: `{
  "success": true,
  "message": "Crypto wallet created successfully",
  "data": {
    "wallet_id": "BCW-…",
    "customer_id": "BCC-…",
    "asset": "USDT",
    "network": "trc20",
    "deposit_address": "T…",
    "balance": "0",
    "locked_balance": "0",
    "is_active": true
  }
}`,
      },
    ],
  },
  {
    id: 'crypto-list-wallets',
    group: 'crypto',
    title: 'List customer crypto wallets',
    method: 'GET',
    path: '/business/crypto/customers/{customerId}/wallets',
    description:
      'All on-chain deposit addresses issued for a crypto customer. Use the same customerId key as issue wallet.',
    params: [
      {
        name: 'customerId',
        location: 'path',
        type: 'string',
        required: true,
        description: 'Crypto customer_id, managed wallet_id, or customer_reference.',
      },
    ],
    responses: [
      {
        status: 200,
        label: 'Success',
        body: `{
  "success": true,
  "message": "Crypto wallets fetched successfully",
  "data": [
    {
      "wallet_id": "BCW-…",
      "customer_id": "BCC-…",
      "asset": "USDT",
      "network": "trc20",
      "deposit_address": "T…",
      "balance": "150.25",
      "locked_balance": "0",
      "is_active": true
    }
  ]
}`,
      },
    ],
  },
  {
    id: 'crypto-transfer',
    group: 'crypto',
    title: 'Crypto withdrawal',
    method: 'POST',
    path: '/business/crypto/transfers',
    description:
      'Withdraw crypto from your business treasury to an on-chain address. chain is required. Call POST /business/crypto/fees/quote first to preview network fees. Poll GET /business/crypto/transfers/{reference} for status updates.',
    params: [
      { name: 'address', location: 'body', type: 'string', required: true, description: 'Destination on-chain address.' },
      { name: 'asset', location: 'body', type: 'string', required: true, description: 'Asset to send (for example USDT, USDC, BTC).' },
      { name: 'chain', location: 'body', type: 'string', required: true, description: 'Network slug (for example trc20, erc20, bitcoin).', example: 'trc20' },
      { name: 'amount', location: 'body', type: 'string', required: true, description: 'Amount to withdraw in major units.', example: '75.5' },
      { name: 'reference', location: 'body', type: 'string', required: false, description: 'Optional idempotency reference; Nyra generates one if omitted.' },
      { name: 'reason', location: 'body', type: 'string', required: false, description: 'Optional internal reason.' },
      { name: 'narration', location: 'body', type: 'string', required: false, description: 'Optional narration shown to providers where supported.' },
      { name: 'memo', location: 'body', type: 'string', required: false, description: 'Optional destination memo/tag for chains that require it.' },
      { name: 'funding_source', location: 'body', type: 'string', required: false, description: 'Funding source for provider routing. Currently USD when supported.', enum: ['USD'] },
    ],
    responses: [
      {
        status: 200,
        label: 'Success',
        body: `{
  "success": true,
  "message": "Crypto transfer initiated successfully",
  "data": {
    "reference": "CRY-TXN-…",
    "status": "pending",
    "asset": "USDT",
    "network": "trc20",
    "amount": "75.5",
    "address": "T…",
    "chain": "trc20",
    "fee": "1.5"
  }
}`,
      },
    ],
  },
  {
    id: 'crypto-list-transfers',
    group: 'crypto',
    title: 'List crypto transfers',
    method: 'GET',
    path: '/business/crypto/transfers',
    description: 'Recent on-chain withdrawals initiated by your business.',
    responses: [
      {
        status: 200,
        label: 'Success',
        body: `{
  "success": true,
  "message": "Crypto transfers fetched successfully",
  "data": [
    {
      "reference": "CRY-TXN-…",
      "status": "pending",
      "asset": "USDT",
      "network": "trc20",
      "amount": "75.5",
      "address": "T…"
    }
  ]
}`,
      },
    ],
  },
  {
    id: 'crypto-get-transfer',
    group: 'crypto',
    title: 'Get transfer status',
    method: 'GET',
    path: '/business/crypto/transfers/{reference}',
    description: 'Poll a single withdrawal by the reference returned from POST /business/crypto/transfers.',
    params: [
      {
        name: 'reference',
        location: 'path',
        type: 'string',
        required: true,
        description: 'Transfer reference from the create response.',
      },
    ],
    responses: [
      {
        status: 200,
        label: 'Success',
        body: `{
  "success": true,
  "message": "Crypto transfer fetched successfully",
  "data": {
    "reference": "CRY-TXN-…",
    "status": "successful",
    "asset": "USDT",
    "network": "trc20",
    "amount": "75.5",
    "address": "T…",
    "hash": "0x…"
  }
}`,
      },
    ],
  },
  {
    id: 'crypto-transfer-fee-quote',
    group: 'crypto',
    title: 'Quote transfer fee',
    method: 'POST',
    path: '/business/crypto/fees/quote',
    description: 'Preview network and platform fees before POST /business/crypto/transfers.',
    params: [
      { name: 'asset', location: 'body', type: 'string', required: true, description: 'Asset to send.', example: 'USDT' },
      { name: 'chain', location: 'body', type: 'string', required: true, description: 'Network slug.', example: 'trc20' },
      { name: 'amount', location: 'body', type: 'string', required: true, description: 'Withdrawal amount in major units.', example: '75.5' },
    ],
    responses: [
      {
        status: 200,
        label: 'Success',
        body: `{
  "success": true,
  "message": "Crypto transfer fee quote fetched successfully",
  "data": {
    "asset": "USDT",
    "chain": "trc20",
    "amount": "75.5",
    "fee": "1.5",
    "fee_asset": "USDT"
  }
}`,
      },
    ],
  },
  {
    id: 'crypto-list-master-wallets',
    group: 'crypto',
    title: 'List master float wallets',
    method: 'GET',
    path: '/business/crypto/master-wallets',
    description:
      'Business treasury (float) wallets for USDT, USDC, and BTC. Requires crypto float to be enabled for your business. Listing may auto-provision default wallets.',
    responses: [
      {
        status: 200,
        label: 'Success',
        body: `{
  "success": true,
  "message": "Master crypto wallets fetched successfully",
  "data": [
    {
      "master_wallet_id": "BCM-…",
      "asset": "USDT",
      "network": "trc20",
      "deposit_address": "T…",
      "deposit_addresses": { "trc20": { "address": "T…", "network": "trc20" } },
      "networks": ["trc20", "erc20"],
      "balance": "1250.50",
      "offramp": false,
      "is_active": true
    }
  ]
}`,
      },
    ],
  },
  {
    id: 'crypto-create-master-wallet',
    group: 'crypto',
    title: 'Create master float wallet',
    method: 'POST',
    path: '/business/crypto/master-wallets',
    description:
      'Explicitly create a business treasury wallet for USDT, USDC, or BTC. Requires crypto float enabled. Optional chain selects the default network when multiple are supported.',
    params: [
      { name: 'asset', location: 'body', type: 'string', required: true, description: 'USDT, USDC, or BTC.', example: 'USDT' },
      { name: 'chain', location: 'body', type: 'string', required: false, description: 'Default network slug when the asset supports multiple networks.', example: 'trc20' },
      { name: 'offramp', location: 'body', type: 'boolean', required: false, description: 'Enable off-ramp where supported.' },
    ],
    responses: [
      {
        status: 201,
        label: 'Created',
        body: `{
  "success": true,
  "message": "Master crypto wallet created successfully",
  "data": {
    "master_wallet_id": "BCM-…",
    "asset": "USDT",
    "network": "trc20",
    "deposit_address": "T…",
    "balance": "0",
    "offramp": false,
    "is_active": true
  }
}`,
      },
    ],
  },
  {
    id: 'crypto-list-transactions',
    group: 'crypto',
    title: 'List crypto transactions',
    method: 'GET',
    path: '/business/crypto/transactions',
    description:
      'Deposits, transfers, and swaps for your business treasury. Each row includes balance_before and balance_after when recorded at settlement time.',
    params: [
      { name: 'type', location: 'query', type: 'string', required: false, description: 'Filter by deposit, transfer, or swap.', enum: ['deposit', 'transfer', 'swap'] },
      { name: 'asset', location: 'query', type: 'string', required: false, description: 'Filter by asset (for example USDT).' },
      { name: 'customer_id', location: 'query', type: 'string', required: false, description: 'Filter by crypto customer ID.' },
      { name: 'limit', location: 'query', type: 'number', required: false, description: 'Max rows to return (1-200).', defaultValue: '100' },
    ],
    responses: [
      {
        status: 200,
        label: 'Success',
        body: `{
  "success": true,
  "message": "Crypto transactions fetched successfully",
  "data": [
    {
      "transaction_id": "BCT-…",
      "type": "deposit",
      "status": "successful",
      "asset": "USDT",
      "network": "trc20",
      "amount": "150.25",
      "reference": "dep_abc123",
      "wallet_id": "BCM-…",
      "tx_hash": "0x…",
      "balance_before": "1100.25",
      "balance_after": "1250.50",
      "created_at": "2026-07-22T18:22:01.000Z"
    }
  ]
}`,
      },
    ],
  },
  {
    id: 'webhooks-overview',
    group: 'webhooks',
    title: 'Webhook events',
    method: 'GET',
    path: '/business/{businessId}/webhooks',
    description:
      'Register webhook URLs in the dashboard (Webhooks). Nyra POSTs JSON to your endpoint when subscribed events occur. Verify each delivery with the `X-Nyra-Signature` header (HMAC-SHA256 of the raw JSON body using your signing secret). Bank debit reversals use `managed_wallet.funded` with `transaction_type` `REVERSAL`. See the Webhooks guide.',
    params: [
      {
        name: 'businessId',
        location: 'path',
        type: 'string',
        required: true,
        description: 'Your business ID (dashboard session auth for managing endpoints).',
      },
    ],
    webhookSamples: DOC_WEBHOOK_EVENT_SAMPLES,
    responses: [
      {
        status: 200,
        label: 'List endpoints',
        body: `{
  "success": true,
  "data": [
    {
      "id": "whcfg_abc123",
      "url": "https://api.yoursite.com/webhooks/nyra",
      "name": "Production",
      "subscribed_events": [
        "managed_wallet.funded",
        "managed_wallet.transfer",
        "managed_wallet.temporary_account_funded"
      ]
    }
  ]
}`,
      },
    ],
  },
]

export function getEndpointById(id: string): DocEndpoint | undefined {
  return DOC_ENDPOINTS.find(e => e.id === id)
}

export function getDefaultEndpointId(): string {
  return 'create-customer-wallet'
}
