import type { DocWebhookSample } from './types'

/** Outbound webhook payloads (POST to your URL). Matches `WebhookEventCategory` in nyra-wallet. */
export const DOC_WEBHOOK_EVENT_SAMPLES: DocWebhookSample[] = [
  {
    event: 'managed_wallet.funded',
    label: 'Wallet funded',
    description: 'NGN credited to a managed customer wallet or business float. `transaction_type` is `CREDIT` for normal inflows (including DVA pay-ins).',
    body: `{
  "event": "managed_wallet.funded",
  "data": {
    "account_number": "0123456789",
    "amount": 50000,
    "currency": "NGN",
    "charge": 0,
    "transaction_type": "CREDIT",
    "status": "successful",
    "narration": "Transfer from JOHN DOE",
    "wallet_id": "wal_8f3c2a1b9d4e",
    "timestamp": "2026-07-22T14:30:00.000Z",
    "reference": "TXN-20260722-ABC123",
    "sessionId": "sess_7e91f0c2b8a4",
    "sender_name": "JOHN DOE",
    "sender_account_number": "0987654321",
    "sender_bank": "GTBank",
    "business_id": "biz_4k2m9p1q7r3s",
    "transaction_date": "2026-07-22T14:30:00.000Z",
    "credit_account_name": "Ada Okonkwo",
    "is_dva_polaris": false
  }
}`,
  },
  {
    event: 'managed_wallet.funded',
    label: 'Debit reversal',
    description:
      'Bank reversal of a prior debit: funds returned to the wallet or float. Same event as a normal credit. Check `data.transaction_type` is `REVERSAL`. Use `sessionId` to tie back to the original debit reference when present.',
    body: `{
  "event": "managed_wallet.funded",
  "data": {
    "account_number": "0123456789",
    "amount": 25050,
    "currency": "NGN",
    "charge": 0,
    "transaction_type": "REVERSAL",
    "status": "successful",
    "narration": "Reversal of outbound transfer",
    "wallet_id": "wal_8f3c2a1b9d4e",
    "timestamp": "2026-07-23T09:15:00.000Z",
    "reference": "REV-20260723-RTN001",
    "sessionId": "TRF-20260722-DEF456",
    "sender_name": "ORIGIN BANK",
    "sender_account_number": "0011223344",
    "sender_bank": "GTBank",
    "business_id": "biz_4k2m9p1q7r3s",
    "transaction_date": "2026-07-23T09:15:00.000Z",
    "credit_account_name": "Ada Okonkwo",
    "is_dva_polaris": false
  }
}`,
  },
  {
    event: 'managed_wallet.temporary_account_funded',
    label: 'Collection account funded',
    description: 'Customer paid into a Static or Dynamic collection account. Subscribe in the dashboard under Webhooks.',
    body: `{
  "event": "managed_wallet.temporary_account_funded",
  "data": {
    "credit_account_number": "9876543210",
    "credit_account_name": "NYRA / Ada Okonkwo",
    "amount_received": 105000,
    "fee_deducted": 2100,
    "amount_settled": 102900,
    "currency": "NGN",
    "charge": 2100,
    "transaction_type": "CREDIT",
    "status": "successful",
    "narration": "Payment for order #8821",
    "wallet_id": null,
    "timestamp": "2026-07-22T15:12:44.000Z",
    "paid_at": "2026-07-22T15:12:44.000Z",
    "reference": "COL-20260722-XYZ789",
    "sessionId": "sess_a1b2c3d4e5f6",
    "external_reference": "order_8821",
    "provider": "NYRA WALLET",
    "sender_name": "CHIDI NWANKWO",
    "sender_account_number": "0011223344",
    "sender_bank": "Access Bank",
    "business_id": "biz_4k2m9p1q7r3s",
    "transaction_date": "2026-07-22T15:12:44.000Z",
    "meta": {
      "customer_name": "Ada Okonkwo",
      "customer_email": "ada@example.com"
    }
  }
}`,
  },
  {
    event: 'managed_wallet.transfer',
    label: 'Transfer sent',
    description: 'Outbound bank transfer from a managed wallet after a successful API transfer.',
    body: `{
  "event": "managed_wallet.transfer",
  "data": {
    "account_number": "0123456789",
    "amount": 25000,
    "currency": "NGN",
    "charge": 50,
    "fee_deducted": 50,
    "transaction_type": "DEBIT",
    "status": "successful",
    "narration": "Payout to vendor",
    "wallet_id": "wal_8f3c2a1b9d4e",
    "timestamp": "2026-07-22T16:05:11.000Z",
    "reference": "TRF-20260722-DEF456",
    "sessionId": "sess_998877665544",
    "sender_name": "Ada Okonkwo",
    "sender_account_number": "0123456789",
    "sender_bank": "NYRA WALLET",
    "credit_account_name": "VENDOR LTD",
    "business_id": "biz_4k2m9p1q7r3s",
    "transaction_date": "2026-07-22T16:05:11.000Z",
    "client_request_id": "your-idempotency-key-001"
  }
}`,
  },
  {
    event: 'managed_wallet.debited',
    label: 'Wallet debited',
    description: 'Treasury float or managed wallet debited (for example admin debit or internal movement).',
    body: `{
  "event": "managed_wallet.debited",
  "data": {
    "account_number": "5566778899",
    "amount": 10000,
    "currency": "NGN",
    "charge": 0,
    "fee_deducted": 0,
    "transaction_type": "DEBIT",
    "status": "successful",
    "narration": "Admin Debit",
    "wallet_id": "wal_float_main",
    "timestamp": "2026-07-22T11:00:00.000Z",
    "reference": "DEB-20260722-GHI012",
    "sessionId": "sess_debit_001",
    "sender_name": "MYNYRA",
    "sender_account_number": null,
    "sender_bank": "NYRA WALLET",
    "credit_account_name": "Acme Ltd Float",
    "business_id": "biz_4k2m9p1q7r3s",
    "transaction_date": "2026-07-22T11:00:00.000Z"
  }
}`,
  },
  {
    event: 'vas.electricity.completed',
    label: 'Electricity token ready',
    description: 'Async electricity purchase finished; token and units are included when available.',
    body: `{
  "event": "vas.electricity.completed",
  "data": {
    "reference": "ELC-20260722-JKL345",
    "transaction_id": "txn_elec_8899",
    "meter_number": "04123456789",
    "amount": 5000,
    "package_id": "prepaid_5k",
    "token": "1234-5678-9012-3456-7890",
    "number_of_units": "42.5",
    "is_token": true,
    "provider": "IKEDC",
    "status": "delivered"
  }
}`,
  },
  {
    event: 'vas.payment.failed',
    label: 'VAS payment failed',
    description: 'Bill payment failed after debit; float is refunded when applicable. Always subscribed.',
    body: `{
  "event": "vas.payment.failed",
  "data": {
    "reference": "VAS-20260722-MNO678",
    "transaction_id": "txn_vas_fail_001",
    "bill_type": "electricity",
    "amount": 5000,
    "status": "failed",
    "refunded": true,
    "reason": "Provider timeout while vending token",
    "provider": "IKEDC",
    "meter_number": "04123456789"
  }
}`,
  },
  {
    event: 'crypto.wallet.funded',
    label: 'Crypto deposit',
    description: 'On-chain deposit credited to a business or customer crypto wallet.',
    body: `{
  "event": "crypto.wallet.funded",
  "data": {
    "business_id": "biz_4k2m9p1q7r3s",
    "customer_id": "BCC-…",
    "wallet_id": "BCW-…",
    "asset": "USDT",
    "network": "trc20",
    "amount": "150.25",
    "balance": "1150.25",
    "reference": "dep_abc123",
    "timestamp": "2026-07-22T18:22:01.000Z"
  }
}`,
  },
  {
    event: 'crypto.wallet.debited',
    label: 'Crypto wallet debited',
    description: 'Crypto balance decreased (for example sweep or internal debit).',
    body: `{
  "event": "crypto.wallet.debited",
  "data": {
    "business_id": "biz_4k2m9p1q7r3s",
    "customer_id": "BCC-…",
    "wallet_id": "BCW-…",
    "asset": "USDT",
    "network": "trc20",
    "amount": "50.00",
    "balance": "1100.25",
    "reference": "dep_abc123",
    "timestamp": "2026-07-22T18:25:00.000Z"
  }
}`,
  },
  {
    event: 'crypto.swap.completed',
    label: 'Crypto swap completed',
    description: 'Asset swap between crypto balances completed successfully.',
    body: `{
  "event": "crypto.swap.completed",
  "data": {
    "business_id": "biz_4k2m9p1q7r3s",
    "reference": "CRY-SWP-20260722-001",
    "from_asset": "USDT",
    "to_asset": "NGN",
    "from_amount": "100.00",
    "to_amount": "155000.00",
    "rate": "1550",
    "status": "completed",
    "timestamp": "2026-07-22T19:00:00.000Z"
  }
}`,
  },
  {
    event: 'crypto.swap.failed',
    label: 'Crypto swap failed',
    description: 'Crypto swap could not be completed.',
    body: `{
  "event": "crypto.swap.failed",
  "data": {
    "business_id": "biz_4k2m9p1q7r3s",
    "reference": "CRY-SWP-20260722-002",
    "from_asset": "USDT",
    "to_asset": "NGN",
    "from_amount": "100.00",
    "status": "failed",
    "reason": "Insufficient liquidity",
    "timestamp": "2026-07-22T19:05:00.000Z"
  }
}`,
  },
  {
    event: 'crypto.payout.completed',
    label: 'Crypto payout completed',
    description: 'Withdrawal to an on-chain address confirmed.',
    body: `{
  "event": "crypto.payout.completed",
  "data": {
    "business_id": "biz_4k2m9p1q7r3s",
    "asset": "USDT",
    "network": "trc20",
    "amount": "75.5",
    "status": "successful",
    "reference": "CRY-TXN-7788",
    "transaction_id": "tx_998877",
    "hash": "0xabc123def4567890abcdef1234567890abcdef12",
    "address": "TXyz9k2ExampleTronAddressForDocsOnly"
  }
}`,
  },
  {
    event: 'crypto.payout.failed',
    label: 'Crypto payout failed',
    description: 'Withdrawal rejected or could not be completed.',
    body: `{
  "event": "crypto.payout.failed",
  "data": {
    "business_id": "biz_4k2m9p1q7r3s",
    "asset": "USDT",
    "network": "trc20",
    "amount": "75.5",
    "status": "failed",
    "reference": "CRY-TXN-7788",
    "transaction_id": "tx_998877",
    "address": "TXyz9k2ExampleTronAddressForDocsOnly"
  }
}`,
  },
]
