import type { DocEndpoint, DocGroup } from './types'
import { DOC_WEBHOOK_EVENT_SAMPLES } from './webhookSamples'

export const DOC_GROUPS: DocGroup[] = [
  { id: 'customers', label: 'Customers' },
  { id: 'transfers', label: 'Transfers' },
  { id: 'verification', label: 'Verification' },
  { id: 'bills', label: 'Bill payments' },
  { id: 'crypto', label: 'Crypto', badge: 'COMING SOON' },
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
      'Provision a managed NGN wallet and virtual account for an end customer. Use this to collect payments into your business float.',
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
    id: 'crypto-coming-soon',
    group: 'crypto',
    title: 'Crypto',
    method: 'GET',
    path: '',
    comingSoon: true,
    description:
      'Crypto wallets, on-chain deposits, and payouts are coming soon. Email support@nyrawallet.com if you want early access.',
    responses: [],
  },
  /*
  {
    id: 'crypto-list-assets',
    group: 'crypto',
    groupBadge: 'NEW',
    title: 'List supported assets',
    method: 'GET',
    path: '/business/crypto/assets',
    description: 'Supported coins, chains, and capabilities for your business.',
    responses: [
      {
        status: 200,
        label: 'Success',
        body: `{
  "success": true,
  "message": "Supported crypto assets fetched successfully",
  "data": [{ "asset": "USDT", "chains": ["TRON", "BSC"] }]
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
      'Register an end-user for crypto wallets. Link to an existing managed wallet with managed_wallet_id or use customer_reference for grouping.',
    params: [
      {
        name: 'customer_reference',
        location: 'body',
        type: 'string',
        required: true,
        description: 'Your stable ID for this end-user.',
      },
      {
        name: 'first_name',
        location: 'body',
        type: 'string',
        required: true,
        description: 'First name.',
      },
      {
        name: 'last_name',
        location: 'body',
        type: 'string',
        required: true,
        description: 'Last name.',
      },
      { name: 'email', location: 'body', type: 'string', required: true, description: 'Email.' },
      {
        name: 'managed_wallet_id',
        location: 'body',
        type: 'string',
        required: false,
        description: 'Optional link to an existing NGN managed wallet.',
      },
    ],
    responses: [
      {
        status: 200,
        label: 'Success',
        body: `{
  "success": true,
  "message": "Crypto customer created successfully",
  "data": { "id": "BCC-…", "customer_reference": "user_123" }
}`,
      },
    ],
  },
  {
    id: 'crypto-create-wallet',
    group: 'crypto',
    title: 'Generate deposit address',
    method: 'POST',
    path: '/business/crypto/customers/{customerId}/wallets',
    description: 'Creates a unique stablecoin deposit address for your customer.',
    params: [
      {
        name: 'customerId',
        location: 'path',
        type: 'string',
        required: true,
        description: 'Crypto customer ID from create customer.',
      },
      {
        name: 'asset',
        location: 'body',
        type: 'string',
        required: true,
        description: 'Asset code.',
        enum: ['USDT', 'USDC', 'BTC', 'ETH'],
        defaultValue: 'USDT',
      },
      {
        name: 'chain',
        location: 'body',
        type: 'string',
        required: false,
        description: 'Network for multi-chain assets.',
        enum: ['TRON', 'BSC', 'ERC20', 'SOL'],
        defaultValue: 'TRON',
      },
      {
        name: 'offramp',
        location: 'body',
        type: 'boolean',
        required: false,
        description: 'Enable off-ramp where supported.',
        defaultValue: 'false',
      },
    ],
    responses: [
      {
        status: 200,
        label: 'Success',
        body: `{
  "success": true,
  "message": "Crypto wallet created successfully",
  "data": {
    "id": "BCW-…",
    "asset": "USDT",
    "network": "TRON",
    "deposit_address": "T…"
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
    description: 'All deposit addresses issued for a crypto customer.',
    params: [
      {
        name: 'customerId',
        location: 'path',
        type: 'string',
        required: true,
        description: 'Crypto customer ID.',
      },
    ],
    responses: [
      {
        status: 200,
        label: 'Success',
        body: `{
  "success": true,
  "message": "Crypto wallets fetched successfully",
  "data": [{ "deposit_address": "…", "asset": "USDT" }]
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
    description: 'Withdraw crypto from your business treasury to an on-chain address.',
    params: [
      { name: 'asset', location: 'body', type: 'string', required: true, description: 'Asset to send.' },
      { name: 'chain', location: 'body', type: 'string', required: true, description: 'Blockchain network.' },
      { name: 'amount', location: 'body', type: 'string', required: true, description: 'Amount to withdraw.' },
      { name: 'address', location: 'body', type: 'string', required: true, description: 'Destination address.' },
      { name: 'reference', location: 'body', type: 'string', required: false, description: 'Optional idempotency reference.' },
    ],
    responses: [
      {
        status: 200,
        label: 'Success',
        body: `{
  "success": true,
  "message": "Crypto transfer initiated successfully",
  "data": { "id": "…", "status": "pending", "reference": "…" }
}`,
      },
    ],
  },
  */
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
